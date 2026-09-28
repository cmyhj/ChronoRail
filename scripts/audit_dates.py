#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
ChronoRail 日期一致性审计脚本

用途：每次数据更新后跑一遍，自动抓出「差几天」类错误——这类错误肉眼看时间轴很难发现，
但会让前端日期轴错位、卡池与版本对不上。

检查项：
  1. 日期可解析性（dayjs 解析失败的日期会让该条从时间轴静默消失）
  2. 版本链衔接：上一版 endDate 应等于下一版 startDate（断开/重叠都报）
  3. 更新星期几一致性：每个游戏的版本起始日应落在固定星期几（按众数判定），异常者报出
  4. 版本周期离群：与同游戏众数周期相差 >2 天报出
  5. 卡池归属：卡池起止应落在所属版本区间内（复刻/轮换池允许极小幅越界，>0 天即报）
  6. 卡池重复：同一版本内 name+character+日期完全相同的条目
  7. 版本数组顺序：应为日期降序（最新在前）

用法：
  python scripts/audit_dates.py            # 人类可读报告，有问题时退出码 1
  python scripts/audit_dates.py --json     # 机器可读
"""
import json
import sys
from collections import Counter
from datetime import datetime

DATA_FILE = r"D:\PersonalProjects\ChronoRail\public\data\game-versions.json"
WD = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"]


def parse(s):
    try:
        return datetime.strptime(str(s), "%Y-%m-%d").date()
    except Exception:
        return None


def audit(path=DATA_FILE):
    with open(path, encoding="utf-8") as f:
        data = json.load(f)

    report = {"issues": [], "games": {}}

    def issue(game, kind, detail, version=None, field=None):
        report["issues"].append({
            "game": game, "kind": kind, "version": version,
            "field": field, "detail": detail,
        })

    for gid, game in data["games"].items():
        versions = game.get("versions", [])
        if not versions:
            continue

        starts, spans, wds = [], [], []
        for v in versions:
            sd, ed = parse(v.get("startDate")), parse(v.get("endDate"))
            if not sd or not ed:
                issue(gid, "unparseable", "版本日期无法解析（会被前端静默丢弃）", v.get("version"))
                continue
            starts.append((v, sd, ed))
            spans.append((ed - sd).days)
            wds.append(sd.weekday())

        # 版本数组顺序
        for i in range(len(starts) - 1):
            if starts[i][1] < starts[i + 1][1]:
                issue(gid, "order", "版本数组未按日期降序（最新应在最前）", starts[i][0].get("version"))

        # 衔接：降序排列后，相邻两版 older.end == newer.start
        for i in range(len(starts) - 1):
            newer, nsd, _ = starts[i]
            older, _, oed = starts[i + 1]
            if oed != nsd:
                gap = (nsd - oed).days
                kind = "gap" if gap > 0 else "overlap"
                issue(gid, kind,
                      "%s 止于 %s，但 %s 起于 %s（%s %d 天）" % (
                          older.get("version"), oed, newer.get("version"), nsd,
                          "空隙" if gap > 0 else "重叠", abs(gap)))

        # 更新星期几：众数为基准
        if wds:
            mode_wd, cnt = Counter(wds).most_common(1)[0]
            if cnt >= 3:
                for (v, sd, _), wd in zip(starts, wds):
                    if wd != mode_wd:
                        issue(gid, "weekday",
                              "起始 %s 是%s，但该游戏多数版本在%s更新" % (sd, WD[wd], WD[mode_wd]),
                              v.get("version"), "startDate")

        # 周期离群
        if spans:
            mode_span, cnt = Counter(spans).most_common(1)[0]
            if cnt >= 3:
                for (v, sd, ed), sp in zip(starts, spans):
                    if abs(sp - mode_span) > 2:
                        issue(gid, "cycle",
                              "周期 %d 天，该游戏多数版本 %d 天" % (sp, mode_span),
                              v.get("version"))

        # 卡池检查
        for v in versions:
            sd, ed = parse(v.get("startDate")), parse(v.get("endDate"))
            seen = set()
            for b in v.get("banners", []):
                bsd, bed = parse(b.get("startDate")), parse(b.get("endDate"))
                if not bsd or not bed:
                    issue(gid, "unparseable", "卡池「%s」日期无法解析" % b.get("name"),
                          v.get("version"), "banners")
                    continue
                if bed <= bsd:
                    issue(gid, "banner_range", "卡池「%s」起止不合法" % b.get("name"),
                          v.get("version"))
                if sd and bsd < sd:
                    issue(gid, "banner_out",
                          "卡池「%s」起于 %s，早于版本开始 %s 共 %d 天" % (
                              b.get("name"), bsd, v.get("startDate"), (sd - bsd).days),
                          v.get("version"))
                if ed and bed > ed:
                    issue(gid, "banner_out",
                          "卡池「%s」止于 %s，晚于版本结束 %s 共 %d 天" % (
                              b.get("name"), bed, v.get("endDate"), (bed - ed).days),
                          v.get("version"))
                key = (b.get("name"), b.get("character"), b.get("startDate"), b.get("endDate"))
                if key in seen:
                    issue(gid, "banner_dup", "卡池「%s」重复条目" % b.get("name"), v.get("version"))
                seen.add(key)

        # 当前版本快照（有 date-like startDate 的最前一版）
        cur = None
        today = datetime.now().date()
        for v in versions:
            sd, ed = parse(v.get("startDate")), parse(v.get("endDate"))
            if sd and ed and sd <= today <= ed:
                cur = v
                break
        report["games"][gid] = {
            "version_count": len(versions),
            "modal_weekday": WD[Counter(wds).most_common(1)[0][0]] if wds else None,
            "modal_span": Counter(spans).most_common(1)[0][0] if spans else None,
            "current_version": cur.get("version") if cur else None,
            "current_range": "%s~%s" % (cur.get("startDate"), cur.get("endDate")) if cur else None,
        }

    return report


if __name__ == "__main__":
    rep = audit()
    if "--json" in sys.argv:
        print(json.dumps(rep, ensure_ascii=False, indent=2))
    else:
        print("=" * 90)
        print("各游戏基准：")
        for gid, info in rep["games"].items():
            print("  %-20s %d 个版本 | 多在%s更新 | 常规周期 %s 天 | 当前 %s (%s)" % (
                gid, info["version_count"], info["modal_weekday"],
                info["modal_span"], info["current_version"], info["current_range"]))
        print("=" * 90)
        if not rep["issues"]:
            print("✅ 未发现一致性问题")
        else:
            print("发现 %d 个问题：\n" % len(rep["issues"]))
            by_kind = {}
            for it in rep["issues"]:
                by_kind.setdefault(it["kind"], []).append(it)
            for kind, items in sorted(by_kind.items(), key=lambda kv: -len(kv[1])):
                print("[%s] %d 条" % (kind, len(items)))
                for it in items:
                    print("   %-20s %-16s %s" % (
                        it["game"], str(it["version"])[:16], it["detail"]))
                print()
        sys.exit(1 if rep["issues"] else 0)
