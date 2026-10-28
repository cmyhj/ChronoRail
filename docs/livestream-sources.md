# 已确认前瞻直播来源

录入依据为研究阶段已核对的官方公告正文（2026-10-27）。本次仅补充直播元数据，不推算版本更新日或直播结束时间。

| 游戏 | 前瞻目标版本 | 名称 | 北京时间 | 官方证据 | 直播入口 |
| --- | --- | --- | --- | --- | --- |
| 崩坏：星穹铁道 | 4.7 | 此刻，将群星付之一笑 | 2026-10-30 19:30 UTC+08:00 | https://www.hoyolab.com/article/47210911 | https://youtube.com/live/psifFhA2QAA |
| 异环 | 1.5 | 致电，空想迷数 | 2026-10-28 19:30 UTC+08:00 | https://www.bilibili.com/opus/1261954317481410582 | https://live.bilibili.com/1890951177 |

星铁公告正文 API：https://bbs-api-os.hoyolab.com/community/post/wapi/getPostFull?post_id=47210911

## 数据语义

`public/data/game-versions.json` 中的直播分别暂挂在现有 4.6、1.4 记录。`livestream.version` 和 `livestream.name` 明确标识前瞻的目标版本，与承载记录的 `version` / `name` / `startDate` 相互独立。没有新增 4.7、1.5 版本记录，也没有编造更新日期或结束时间。

首页与详情共用直播卡片，优先显示直播目标版本；目标版本不等于承载记录时标明“下版本前瞻（当前版本 v…）”。版本详情主标题、更新时间及版本时间线仍来自原有记录，不能把当前版本改为前瞻版本。

旧数据没有目标版本字段时仍使用原来的版本标题。存在独立目标版本但未确认名称时，不借用当前版本名称。
