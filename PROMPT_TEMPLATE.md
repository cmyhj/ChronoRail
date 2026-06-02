# ChronoRail 版本/卡池信息查询提示词

## 使用方法
复制以下提示词，发送给AI（如ChatGPT、Claude等），即可获取最新的游戏版本和卡池信息。

---

## 提示词模板

```
请帮我查询以下二次元游戏的当前版本信息和卡池信息，按照JSON格式返回：

需要查询的游戏：
1. 原神
2. 崩坏：星穹铁道
3. 绝区零
4. 鸣潮
5. 明日方舟
6. 重返未来:1999
7. 明日方舟:终末地
8. 异环
9. 二重螺旋

每个游戏需要以下信息：
- 版本号（如 5.7、4.3、2.8）
- 版本名称（中文）
- 版本开始日期（YYYY-MM-DD格式）
- 版本结束日期（YYYY-MM-DD格式）
- 当前进行中的卡池/角色池（如有）
  - 卡池名称
  - UP角色名称
  - 卡池开始日期
  - 卡池结束日期

请严格按照以下JSON格式返回：

{
  "genshin": {
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
  },
  "starrail": { ... },
  "zzz": { ... },
  "wutheringwaves": { ... },
  "arknights": { ... },
  "reverse1999": { ... },
  "arknights_endfield": { ... },
  "yihuan": { ... },
  "doublehelix": { ... }
}

注意事项：
- 如果某个游戏没有卡池信息，banners数组留空 []
- 明日方舟的"版本号"使用活动名称（如"泡影苍霆"）
- 日期请使用准确的官方公告日期，不要估算
- 如果不确定某个信息，请标注"待确认"
```

---

## 快速查询提示词（单个游戏）

```
请查询 [游戏名称] 的当前版本信息：

1. 版本号
2. 版本名称
3. 版本开始日期
4. 版本结束日期
5. 当前卡池/角色池信息（卡池名称、UP角色、开始日期、结束日期）

请用JSON格式返回。
```

---

## 示例输出

```json
{
  "genshin": {
    "version": "5.7",
    "name": "空月之歌·行律",
    "startDate": "2026-05-20",
    "endDate": "2026-07-01",
    "banners": [
      {
        "name": "活动祈愿",
        "character": "恣锐锋镞·洛恩(冰)",
        "startDate": "2026-06-09",
        "endDate": "2026-07-01"
      }
    ]
  },
  "starrail": {
    "version": "4.3",
    "name": "沉于生者的忘川",
    "startDate": "2026-06-01",
    "endDate": "2026-07-15",
    "banners": [
      {
        "name": "限定跃迁",
        "character": "千冶·刃",
        "startDate": "2026-06-01",
        "endDate": "2026-06-24"
      },
      {
        "name": "限定跃迁",
        "character": "爻光",
        "startDate": "2026-06-01",
        "endDate": "2026-06-24"
      }
    ]
  }
}
```

---

## 更新数据的命令

获取到AI返回的JSON数据后，告诉我：
"更新版本数据：[粘贴JSON]"

我会自动更新到 ChronoRail 系统中。
