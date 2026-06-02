// 游戏配置
export interface Game {
  id: string;                    // 唯一标识
  name: string;                  // 游戏名称
  icon: string;                  // 游戏图标（URL或内置SVG标识）
  color: string;                 // 主题色
  autoFetch: boolean;            // 是否自动获取
  fetchSource?: 'mihoyo' | 'manual'; // 数据来源
  apiEndpoint?: string;          // API端点
  createdAt: string;             // 创建时间
  updatedAt: string;             // 更新时间
}

// 版本信息
export interface Version {
  id: string;                    // 唯一标识
  gameId: string;                // 关联游戏ID
  version: string;               // 版本号 (如 "4.3")
  name: string;                  // 版本名称 (如 "沉于生者的忘川")
  startDate: string;             // 更新日期 (YYYY-MM-DD)
  endDate?: string;              // 结束日期（可选）
  description?: string;          // 更新内容摘要
  isAutoFetched: boolean;        // 是否自动获取
  createdAt: string;             // 创建时间
  updatedAt: string;             // 更新时间
}

// 数据存储
export interface DataStore {
  games: Game[];
  versions: Version[];
  lastUpdated: string;           // 最后更新时间
  version: number;               // 数据版本号
}

// GitHub配置
export interface GitHubConfig {
  token: string;                 // Personal Access Token
  owner: string;                 // 仓库所有者
  repo: string;                  // 仓库名称
  path: string;                  // 数据文件路径
}

// 米哈游游戏配置
export interface MihoyoGameConfig {
  id: string;
  name: string;
  api: string;
  versionPattern: RegExp;
  channelId: number;
}

// 视图类型
export type ViewType = 'timeline' | 'calendar' | 'list';

// 时间轴缩放级别
export type TimelineScale = 'day' | 'week' | 'month';

// 游戏表单数据
export interface GameFormData {
  name: string;
  icon: string;
  color: string;
  autoFetch: boolean;
  fetchSource: 'mihoyo' | 'manual';
}

// 版本表单数据
export interface VersionFormData {
  version: string;
  name: string;
  startDate: string;
  endDate?: string;
  description?: string;
}

// API响应类型
export interface MihoyoApiResponse {
  retcode: number;
  message: string;
  data: {
    list: Array<{
      list: Array<{
        ann_id: number;
        title: string;
        subtitle: string;
        start_time: string;
        end_time: string;
        type: number;
      }>;
      type_id: number;
      type_label: string;
    }>;
    total: number;
  };
}

// 解析后的版本信息
export interface ParsedVersion {
  version: string;
  name: string;
  startDate: string;
}
