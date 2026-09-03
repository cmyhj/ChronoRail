# ChronoRail 数据更新：明日方舟新增P3联动版本

## 任务
修改 `D:\PersonalProjects\ChronoRail\public\data\game-versions.json`，在 `games.arknights.versions` 数组中新增 P3联动版本条目。

## 新增数据：P3联动「月行水上」
- version: "SideStory 月行水上"
- name: "月行水上"
- startDate: "2026-09-04"
- endDate: "2026-09-25"
- banners:
  - name: "圣城春日学生寻访（P3联动）"
  - character: "结城理[限定]"
  - startDate: "2026-09-04"
  - endDate: "2026-09-25"

## 数据结构说明
`games.arknights.versions` 是一个数组，每项形如：
```json
{
  "version": "SideStory 月行水上",
  "name": "月行水上",
  "startDate": "2026-09-04",
  "endDate": "2026-09-25",
  "banners": [
    {"name": "圣城春日学生寻访（P3联动）", "character": "结城理[限定]", "startDate": "2026-09-04", "endDate": "2026-09-25"}
  ]
}
```

## 更新规则
1. 新版本插入到 versions 数组最前面（最新在前）
2. 不要修改其他版本的数据
3. 保持 JSON 格式有效，保留原有缩进风格（2空格）

## 完成标准
- game-versions.json 中 arknights 的 versions 数组变为 9 条
- P3联动版本在最前面
- JSON 有效
- 运行验证：`python -c "import json; json.load(open(r'D:\PersonalProjects\ChronoRail\public\data\game-versions.json', encoding='utf-8')); print('JSON valid')"`
