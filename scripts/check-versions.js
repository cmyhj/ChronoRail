#!/usr/bin/env node

/**
 * 版本数据更新脚本
 * 
 * 功能：
 * 1. 从米哈游官方API获取原神、星穹铁道、绝区零的版本数据
 * 2. 合并其他游戏的手动维护数据
 * 3. 输出到 public/data/game-versions.json
 * 
 * 日期说明：
 * - startDate: 版本更新维护结束、服务器开服的日期
 * - endDate: 下一个版本更新维护开始的日期（来自官方公告/API）
 * - 米哈游游戏的日期直接从API获取，其他游戏需要手动维护
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// 数据文件路径
const DATA_FILE = path.join(__dirname, '../public/data/game-versions.json');

// 米哈游游戏API配置
// startDate和endDate均来自官方API，无需手动维护
const MIHOYO_GAMES = [
  {
    id: 'genshin',
    name: '原神',
    api: 'https://hk4e-ann-api.mihoyo.com/common/hk4e_cn/announcement/api/getAnnList?game=hk4e&game_biz=hk4e_cn&lang=zh-cn&bundle_id=hk4e_cn&platform=pc&region=cn_gf01&level=55&uid=100000000',
    pattern: /(\d+\.\d+)版本.*?[「「](.+?)[」」]/
  },
  {
    id: 'starrail',
    name: '崩坏：星穹铁道',
    api: 'https://hkrpg-ann-api.mihoyo.com/common/hkrpg_cn/announcement/api/getAnnList?game=hkrpg&game_biz=hkrpg_cn&lang=zh-cn&bundle_id=hkrpg_cn&platform=pc&region=prod_gf_cn&level=65&uid=100000000',
    pattern: /(\d+\.\d+)版本.*?[「「](.+?)[」」]/
  },
  {
    id: 'zzz',
    name: '绝区零',
    api: 'https://announcement-api.mihoyo.com/common/nap_cn/announcement/api/getAnnList?game=nap&game_biz=nap_cn&lang=zh-cn&bundle_id=nap_cn&platform=pc&region=prod_gf_cn&level=60&uid=100000000',
    pattern: /(\d+\.\d+)版本.*?[「「](.+?)[」」]/
  }
];

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function fetchMihoyoGame(game) {
  try {
    const data = await fetchUrl(game.api);
    const json = JSON.parse(data);
    if (json.retcode !== 0) return null;

    const versions = [];
    const seen = new Set();

    for (const group of json.data.list) {
      for (const item of group.list) {
        // 只处理版本更新说明公告
        if (item.title.includes('版本更新说明') || item.title.includes('更新公告')) {
          const match = item.title.match(game.pattern);
          if (match && !seen.has(match[1])) {
            seen.add(match[1]);
            // start_time 和 end_time 来自官方API，是准确的版本周期
            versions.push({
              version: match[1],
              name: match[2],
              startDate: item.start_time.split(' ')[0],
              endDate: item.end_time.split(' ')[0]
            });
          }
        }
      }
    }

    // 按版本号降序排序
    versions.sort((a, b) => parseFloat(b.version) - parseFloat(a.version));
    
    return {
      gameId: game.id,
      gameName: game.name,
      versions
    };
  } catch (e) {
    console.error(`Error fetching ${game.id}:`, e.message);
    return null;
  }
}

// 读取现有的其他游戏数据（手动维护部分）
function loadExistingOtherGames() {
  try {
    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    const otherGames = {};
    
    // 保留非米哈游游戏的数据
    const mihoyoIds = MIHOYO_GAMES.map(g => g.id);
    for (const [id, gameData] of Object.entries(data.games)) {
      if (!mihoyoIds.includes(id)) {
        otherGames[id] = gameData;
      }
    }
    
    return otherGames;
  } catch (e) {
    console.log('数据文件不存在或无法读取，将创建新文件');
    return {};
  }
}

async function main() {
  console.log('=== 游戏版本数据更新 ===\n');
  console.log('时间:', new Date().toISOString());
  console.log('');

  // 读取现有的其他游戏数据
  const otherGames = loadExistingOtherGames();
  console.log(`已加载 ${Object.keys(otherGames).length } 个手动维护游戏的数据\n`);

  const results = {
    fetchedAt: new Date().toISOString(),
    games: {}
  };

  // 获取米哈游游戏数据（自动从API获取）
  console.log('--- 米哈游游戏（自动获取） ---');
  for (const game of MIHOYO_GAMES) {
    console.log(`正在获取 ${game.name}...`);
    const data = await fetchMihoyoGame(game);
    
    if (data && data.versions.length > 0) {
      results.games[game.id] = data;
      const latest = data.versions[0];
      console.log(`  ✓ 最新版本: v${latest.version} ${latest.name}`);
      console.log(`    周期: ${latest.startDate} ~ ${latest.endDate}`);
    } else {
      console.log(`  ✗ 获取失败`);
    }
  }

  // 合并其他游戏数据（手动维护）
  console.log('\n--- 其他游戏（手动维护） ---');
  for (const [id, data] of Object.entries(otherGames)) {
    results.games[id] = data;
    console.log(`  ✓ ${data.gameName}: ${data.versions.length} 个版本`);
  }

  // 保存数据
  fs.writeFileSync(DATA_FILE, JSON.stringify(results, null, 2));
  console.log(`\n数据已保存到 ${DATA_FILE}`);
  console.log(`共 ${Object.keys(results.games).length} 个游戏`);
}

main().catch(console.error);
