# ChronoRail 数据更新：重返未来1999 新增轮换征集卡池

## 任务
修改 `D:\PersonalProjects\ChronoRail\public\data\game-versions.json`，在 `games.reverse1999.versions` 中的 3.9 版本（version="3.9", name="重燃！流金之海"）下新增一个卡池条目。

## 新增卡池信息（官方公告原文）
- 卡池名称：「现实破译法」轮换征集（在「石心瓦解时」轮换征集结束后开启）
- 六星智灵感角色【哑谜】受邀概率UP
- 开放时间：8/18 5:00 - 9/1 4:59
- UP角色：★★★★★★：哑谜（智）；★★★★★：坦南特（兽）、喀嚓喀嚓（灵）
- 轮换征集属于【限时角色征集】，保底次数与同类征集共享

## 数据结构说明（实际文件结构，与 DATA_UPDATE_GUIDE.md 略有差异）
`games.reverse1999.versions` 是一个数组，每项形如：
```json
{
  "version": "3.9",
  "name": "重燃！流金之海",
  "startDate": "2026-08-13",
  "endDate": "2026-09-24",
  "banners": [
    { "name": "上半卡池", "character": "赫多涅（岩）", "startDate": "2026-08-13", "endDate": "2026-09-03" },
    { "name": "下半卡池", "character": "纳西索斯（兽）", "startDate": "2026-09-03", "endDate": "2026-09-24" }
  ]
}
```

## 更新规则（参照 DATA_UPDATE_GUIDE.md 和现有数据）
1. banners 数组按时间顺序排列
2. 新卡池追加到 3.9 版本的 banners 数组末尾（时间上在上下半卡池之后）
3. 日期格式 YYYY-MM-DD：8/18 5:00 → "2026-08-18"，9/1 4:59 → "2026-09-01"
4. 卡池名称用活动名「现实破译法」轮换征集，参考 3.8 版本中「轮换征集」的命名风格
5. character 字段：主UP是哑谜（智），五星陪跑坦南特（兽）、喀嚓喀嚓（灵），格式参考现有数据（如"伊戈尔（六星兽灵感）"），建议写为"哑谜（六星智灵感）"并可在备注中提及陪跑，但现有 schema 只有 character 字段，所以写"哑谜（智）"即可，保持简洁一致
6. 不要修改其他游戏、其他版本的数据
7. 保持 JSON 格式有效，保留原有缩进风格（2空格）

## 完成标准
- game-versions.json 中 reverse1999 的 3.9 版本 banners 变为 3 条（上半、下半、现实破译法轮换征集）
- JSON 有效，其他数据不变
- 运行 `python -c "import json; json.load(open(r'D:\PersonalProjects\ChronoRail\public\data\game-versions.json', encoding='utf-8'))"` 验证无语法错误
