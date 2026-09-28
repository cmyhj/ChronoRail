#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
ChronoRail 日期一致性审计脚本

用途：每次数据更新后跑一遍，自动抓出「差几天」类错误——这类错误肉眼看时间轴很难发现，
但会让前端日期轴错位、卡池与版本对不上。

严重度分两级，避免“狼来了”导致真问题被淹没：
  issue（硬错误，退出码 1）
    1. unparseable  日期不可解析（dayjs 解析失败会让该条从时间轴静默消失）
    2. gap / overlap 版本衔接断开或重叠（ARKNIGHTS_LOOSE 内的活动制游戏豁免：
       活动之间真实存在过渡空档、卡池可跨活动）
    3. banner_range 卡池起止不合法
    4. banner_out   卡池越出版本区间（起早 >BANNER_PRE_TOL 天，或止晚 >0 天；
       轮换/复刻池走自己的周期，允许小幅早于版本开始）
    5. banner_dup   同一版本内重复卡池条目
    6. order        版本数组未按日期降序
  info（提示，退出码 0，需人工判断）
    7. weekday      起始日不在该游戏多数版本的星期几
    8. cycle        周期与同游戏多数版本相差 >2 天
    —— 这两项只提示：已反复验证多家游戏存在官方认可的例外
       （崩铁 4.6 周一上线、1999 3.4 新春版周二、终末地 1.2/1.3 周五、绝区零 2.4 仅 34 天等），
       故不能直接判错，但新出现的异常仍值得人工扫一眼。

用法：
  python scripts/audit_dates.py            # 人类可读报告，有硬错误时退出码 1
  python scripts/audit_dates.py --json     # 机器可读
"""
import json
import sys
from collections import Counter
from datetime import datetime

DATA_FILE = r"D:\PersonalProjects\ChronoRail\public\data\game-versions.json"
WD = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"]

# 活动制游戏：活动间真实存在过渡空档、卡池可跨活动期，豁免衔接与卡池包含检查
ARKNIGHTS_LOOSE = {"arknights"}
# 卡池允许早于版本开始的天数（轮换/复刻池有自己的周期）
BANNER_PRE_TOL = 7


def parse(s):
    try:
        return datetime.strptime(str(s), "%Y-%m-%d").date()
    except Exception:
        return None


def audit(path=DATA_FILE):
    with open(path, encoding="utf-8") as f:
        data = json.load(f)

    report = {"issues": [], "infos": [], "games": {}}

    def hard(game, kind, detail, version=None, field=None):
        report["issues"].append({"game": game, "kind": kind, "version": version,
                                 "field": field, "detail": detail})

    def soft(game, kind, detail, version=None, field=None):
        report["infos"].append({"game": game, "kind": kind, "version": version,
                                "field": field, "detail": detail})

    for gid, game in data["games"].items():
        versions = game.get("versions", [])
        if not versions:
            continue
        loose = gid in ARKNIGHTS_LOOSE

        starts, spans, wds = [], [], []
        for v in versions:
            sd, ed = parse(v.get("startDate")), parse(v.get("endDate"))
            if not sd or not ed:
                hard(gid, "unparseable", "版本日期无法解析（会被前端静默丢弃）", v.get("version"))
                continue
            starts.append((v, sd, ed))
            spans.append((ed - sd).days)
            wds.append(sd.weekday())

        # 版本数组顺序
        for i in range(len(starts) - 1):
            if starts[i][1] < starts[i + 1][1]:
                hard(gid, "order", "版本数组未按日期降序（最新应在最前）", starts[i][0].get("version"))

        # 衔接：降序排列后，相邻两版 older.end 应等于 newer.start
        if not loose:
            for i in range(len(starts) - 1):
                newer, nsd, _ = starts[i]
                older, _, oed = starts[i + 1]
                if oed != nsd:
                    gap = (nsd - oed).days
                    hard(gid, "gap" if gap > 0 else "overlap",
                         "%s 止于 %s，但 %s 起于 %s（%s %d 天）" % (
                             older.get("version"), oed, newer.get("version"), nsd,
                             "空隙" if gap > 0 else "重叠", abs(gap)))

        # 更新星期几：众数为基准（只提示）
        if wds:
            mode_wd, cnt = Counter(wds).most_common(1)[0]
            if cnt >= 3:
                for (v, sd, _), wd in zip(starts, wds):
                    if wd != mode_wd:
                        soft(gid, "weekday",
                             "起始 %s 是%s，该游戏多数版本在%s更新（可能为官方例外）" % (
                                 sd, WD[wd], WD[mode_wd]), v.get("version"), "startDate")

        # 周期离群（只提示）
        if spans:
            mode_span, cnt = Counter(spans).most_common(1)[0]
            if cnt >= 3:
                for (v, sd, ed), sp in zip(starts, spans):
                    if abs(sp - mode_span) > 2:
                        soft(gid, "cycle",
                             "周期 %d 天，该游戏多数版本 %d 天" % (sp, mode_span), v.get("version"))

        # 卡池检查
        for v in versions:
            sd, ed = parse(v.get("startDate")), parse(v.get("endDate"))
            seen = set()
            for b in v.get("banners", []):
                bsd, bed = parse(b.get("startDate")), parse(b.get("endDate"))
                if not bsd or not bed:
                    hard(gid, "unparseable", "卡池「%s」日期无法解析" % b.get("name"),
                         v.get("version"), "banners")
                    continue
                if bed <= bsd:
                    hard(gid, "banner_range", "卡池「%s」起止不合法" % b.get("name"), v.get("version"))
                if not loose and sd and (sd - bsd).days > BANNER_PRE_TOL:
                    hard(gid, "banner_out",
                         "卡池「%s」起于 %s，早于版本开始 %d 天" % (
                             b.get("name"), bsd, (sd - bsd).days), v.get("version"))
                if not loose and ed and bed > ed:
                    hard(gid, "banner_out",
                         "卡池「%s」止于 %s，晚于版本结束 %d 天" % (
                             b.get("name"), bed, (bed - ed).days), v.get("version"))
                key = (b.get("name"), b.get("character"), b.get("startDate"), b.get("endDate"))
                if key in seen:
                    hard(gid, "banner_dup", "卡池「%s」重复条目" % b.get("name"), v.get("version"))
                seen.add(key)

        # 当前版本快照
        today = datetime.now().date()
        cur = None
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
        print("=" * 96)
        for gid, info in rep["games"].items():
            print("  %-20s %d 个版本 | 多在%s更新 | 常见周期 %s 天 | 当前 %s (%s)" % (
                gid, info["version_count"], info["modal_weekday"], info["modal_span"],
                info["current_version"], info["current_range"]))
        print("=" * 96)
        for key, title in (("issues", "❌ 硬错误"), ("infos", "ℹ️ 需人工确认的异常")):
            items = rep[key]
            print("\n%s：%d 条" % (title, len(items)))
            if not items:
                print("   （无）")
            for it in items:
                print("   %-20s %-16s [%s] %s" % (it["game"], str(it["version"])[:16],
                                                  it["kind"], it["detail"]))
        print("\n结论：%s" % ("✅ 无硬错误" if not rep["issues"] else "需修复 %d 处" % len(rep["issues"])))
        sys.exit(1 if rep["issues"] else 0)
