# ChronoRail 数据更新指南

本文档用于指导如何更新 ChronoRail 的游戏版本和卡池数据。

---

## 数据文件位置

```
public/data/game-versions.json
```

## 数据结构

```json
{
  "fetchedAt": "2026-06-07T12:00:00Z",
  "games": {
    "游戏ID": {
      "gameId": "游戏ID",
      "gameName": "游戏名称",
      "current": {
        "version": "当前版本号",
        "name": "版本名称",
        "startDate": "YYYY-MM-DD",
        "endDate": "YYYY-MM-DD"
      },
      "banners": [
        {
          "name": "卡池名称",
          "character": "UP角色名称",
          "startDate": "YYYY-MM-DD",
          "endDate": "YYYY-MM-DD"
        }
      ],
      "nextVersion": {
        "version": "下一版本号",
        "name": "版本名称",
        "startDate": "YYYY-MM-DD",
        "endDate": "YYYY-MM-DD",
        "banners": [...]
      },
      "history": [
        {
          "version": "版本号",
          "name": "版本名称",
          "startDate": "YYYY-MM-DD",
          "endDate": "YYYY-MM-DD",
          "banners": [
            {
              "name": "卡池名称",
              "character": "UP角色",
              "startDate": "YYYY-MM-DD",
              "endDate": "YYYY-MM-DD"
            }
          ]
        }
      ]
    }
  }
}
```

## 支持的游戏ID

| 游戏ID | 游戏名称 |
|--------|----------|
| `genshin` | 原神 |
| `starrail` | 崩坏：星穹铁道 |
| `zzz` | 绝区零 |
| `wutheringwaves` | 鸣潮 |
| `arknights` | 明日方舟 |
| `reverse1999` | 重返未来:1999 |
| `arknights_endfield` | 明日方舟:终末地 |
| `yihuan` | 异环 |
| `doublehelix` | 二重螺旋 |

---

## 更新规则

### 1. 日期格式
- 使用 `YYYY-MM-DD` 格式（如 `2026-06-01`）
- 不确定的日期使用 `"待确认"` 或保留原值

### 2. 版本号格式
- 使用游戏官方版本号（如 `5.7`、`4.3`、`2.8`）
- 明日方舟使用活动名称（如 `泡影苍霆`）
- 终末地使用版本号（如 `1.3`）

### 3. 卡池命名
- `上半卡池` / `下半卡池`
- `限定跃迁` / `限定调频` / `限定征集`
- `联动跃迁` / `联动卡池`
- 或者使用卡池活动名称

### 4. 角色命名
- 多个角色用 `+` 分隔（如 `千冶·刃 + 爻光`）
- 复刻角色标注（如 `玛薇卡（复刻）`）
- 联动角色标注（如 `远坂凛（Fate联动）`）

### 5. 排序规则
- `banners` 数组按时间顺序排列（上半在前，下半在后）
- `history` 数组按版本号降序排列（最新版本在前）
- 历史版本的 `banners` 字段用于保留卡池信息

### 6. 当前版本 vs 下一版本
- `current` + `banners`：当前正在进行的版本和卡池
- `nextVersion`：已官宣但未开始的下一版本（可选）
- `history`：历史版本记录（包含卡池信息）

---

## 更新示例

### 示例1：更新当前版本卡池

```json
{
  "genshin": {
    "banners": [
      { "name": "上半卡池", "character": "角色A + 角色B", "startDate": "2026-05-20", "endDate": "2026-06-10" },
      { "name": "下半卡池", "character": "角色C + 角色D", "startDate": "2026-06-10", "endDate": "2026-07-01" }
    ]
  }
}
```

### 示例2：添加下一版本预告

```json
{
  "zzz": {
    "nextVersion": {
      "version": "3.0",
      "name": "某个梦游者的自白",
      "startDate": "2026-06-17",
      "endDate": "2026-07-28",
      "banners": [
        { "name": "上半卡池", "character": "维琳娜", "startDate": "2026-06-17", "endDate": "2026-07-08" },
        { "name": "下半卡池", "character": "诺姆", "startDate": "2026-07-08", "endDate": "2026-07-28" }
      ]
    }
  }
}
```

### 示例3：历史版本带卡池信息

```json
{
  "genshin": {
    "history": [
      {
        "version": "5.7",
        "name": "虚空劫灰往世书",
        "startDate": "2026-05-20",
        "endDate": "2026-07-01",
        "banners": [
          { "name": "上半卡池", "character": "尼可/布伦妮 + 杜林", "startDate": "2026-05-20", "endDate": "2026-06-10" },
          { "name": "下半卡池", "character": "洛恩 + 玛薇卡", "startDate": "2026-06-10", "endDate": "2026-07-01" }
        ]
      }
    ]
  }
}
```

---

## AI 更新指令模板

用户可以使用以下格式向 AI 提供更新信息：

```
更新以下游戏数据：

1. 原神
   - 版本: X.X
   - 名称: XXX
   - 时间: YYYY-MM-DD ~ YYYY-MM-DD
   - 上半卡池: 角色A + 角色B (MM/DD - MM/DD)
   - 下半卡池: 角色C + 角色D (MM/DD - MM/DD)

2. 崩坏：星穹铁道
   - 版本: X.X
   - ...

请更新 game-versions.json 文件。
```

---

## 注意事项

1. **当前版本**：确保 `current` 字段指向正在进行的版本
2. **下一版本**：如果已官宣但未开始，使用 `nextVersion` 字段
3. **历史版本**：`history` 数组中保留卡池信息
4. **日期要准确**：使用官方公告的日期，不要估算
5. **版本结束日期**：通常是下一个版本的开始日期

---

## 自动更新

GitHub Actions 每天自动更新米哈游游戏（原神、星铁、绝区零）的数据。

其他游戏需要手动更新，更新后提交到 GitHub 即可生效。
