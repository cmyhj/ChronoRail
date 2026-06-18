// 游戏配置接口
export interface GameConfig {
  id: string;
  name: string;
  autoFetch: boolean;
  color: string;
  icon: string;
}

// 所有支持的游戏配置
export const GAME_CONFIGS: Record<string, GameConfig> = {
  // 米哈游游戏
  genshin: {
    id: 'genshin',
    name: '原神',
    autoFetch: true,
    color: '#4a90d9',
    icon: 'genshin',
  },
  starrail: {
    id: 'starrail',
    name: '崩坏：星穹铁道',
    autoFetch: true,
    color: '#e6a23c',
    icon: 'starrail',
  },
  zzz: {
    id: 'zzz',
    name: '绝区零',
    autoFetch: true,
    color: '#67c23a',
    icon: 'zzz',
  },
  // 库洛游戏
  wutheringwaves: {
    id: 'wutheringwaves',
    name: '鸣潮',
    autoFetch: true,
    color: '#00b4d8',
    icon: 'wutheringwaves',
  },
  // 鹰角网络
  arknights: {
    id: 'arknights',
    name: '明日方舟',
    autoFetch: true,
    color: '#f4845f',
    icon: 'arknights',
  },
  // 深蓝互动
  reverse1999: {
    id: 'reverse1999',
    name: '重返未来:1999',
    autoFetch: true,
    color: '#7c3aed',
    icon: 'reverse1999',
  },
  // 鹰角网络 - 终末地
  arknights_endfield: {
    id: 'arknights_endfield',
    name: '明日方舟:终末地',
    autoFetch: true,
    color: '#f97316',
    icon: 'arknights_endfield',
  },
  // 异环
  yihuan: {
    id: 'yihuan',
    name: '异环',
    autoFetch: true,
    color: '#14b8a6',
    icon: 'yihuan',
  },
  // 二重螺旋
  doublehelix: {
    id: 'doublehelix',
    name: '二重螺旋',
    autoFetch: true,
    color: '#ec4899',
    icon: 'doublehelix',
  },
};

// 所有游戏ID类型
export type GameId = keyof typeof GAME_CONFIGS;

/**
 * 获取所有预置游戏列表
 */
export function getPresetGames(): GameConfig[] {
  return Object.values(GAME_CONFIGS);
}
