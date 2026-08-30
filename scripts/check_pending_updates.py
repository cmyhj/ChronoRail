#!/usr/bin/env python3
"""
ChronoRail 自动卡池更新检查脚本
检查各游戏在14天内即将进入下一版本，但还没有下版本卡池信息的游戏。
"""
import json
from datetime import datetime, timedelta

DATA_FILE = r"D:\PersonalProjects\ChronoRail\public\data\game-versions.json"

def check_games():
    with open(DATA_FILE, encoding="utf-8") as f:
        data = json.load(f)

    today = datetime.now().strftime("%Y-%m-%d")
    soon = (datetime.now() + timedelta(days=14)).strftime("%Y-%m-%d")

    needs_update = []

    for game_id, game in data["games"].items():
        versions = game.get("versions", [])
        if not versions:
            continue

        # 明日方舟的"版本"使用活动名称（如"SideStory 月行水上"），特殊处理
        if game_id == "arknights":
            # 找当前版本（startDate <= today <= endDate）
            current = None
            for v in versions:
                if v["startDate"] <= today and v.get("endDate", "9999") >= today:
                    current = v
                    break

            if not current:
                continue

            end_date = current.get("endDate", "")
            if not end_date or end_date >= soon:
                continue

            # 检查是否有下一个版本
            has_next = False
            for v in versions:
                if v["startDate"] > today and v.get("banners") and len(v["banners"]) > 0:
                    has_next = True
                    break

            if not has_next:
                needs_update.append({
                    "game_id": game_id,
                    "game_name": game.get("gameName", game_id),
                    "current_version": current["version"],
                    "current_name": current.get("name", ""),
                    "end_date": end_date,
                    "days_left": (datetime.strptime(end_date, "%Y-%m-%d") - datetime.now()).days,
                })
            continue

        # 找当前版本（startDate <= today <= endDate）
        current = None
        for v in versions:
            if v["startDate"] <= today and v.get("endDate", "9999") >= today:
                current = v
                break

        if not current:
            continue

        # 当前版本 endDate 在14天内？
        end_date = current.get("endDate", "")
        if not end_date or end_date >= soon:
            continue

        # 检查是否有下一个版本（startDate > today 且 startDate < endDate + 30天）
        has_next = False
        for v in versions:
            if v["startDate"] > today:
                # 检查是否已有卡池信息
                if v.get("banners") and len(v["banners"]) > 0:
                    has_next = True
                    break

        if not has_next:
            needs_update.append({
                "game_id": game_id,
                "game_name": game.get("gameName", game_id),
                "current_version": current["version"],
                "current_name": current.get("name", ""),
                "end_date": end_date,
                "days_left": (datetime.strptime(end_date, "%Y-%m-%d") - datetime.now()).days,
            })

    return needs_update

if __name__ == "__main__":
    results = check_games()
    if results:
        print("需要更新的游戏：")
        for r in results:
            print(f"  {r['game_name']} v{r['current_version']} ({r['current_name']}) - {r['end_date']}结束，还有{r['days_left']}天")
    else:
        print("NO_UPDATE_NEEDED")
