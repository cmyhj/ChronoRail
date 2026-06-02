#!/usr/bin/env node

/**
 * 版本数据更新脚本
 * 用于检查和更新游戏版本信息
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// 数据文件路径
const DATA_FILE = path.join(__dirname, 'public/data/game-versions.json');

// 米哈游游戏API配置
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
        if (item.title.includes('版本更新说明') || item.title.includes('更新公告')) {
          const match = item.title.match(game.pattern);
          if (match && !seen.has(match[1])) {
            seen.add(match[1]);
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

    versions.sort((a, b) => parseFloat(b.version) - parseFloat(a.version));
    return versions.length > 0 ? versions[0] : null;
  } catch (e) {
    console.error(`Error fetching ${game.id}:`, e.message);
    return null;
  }
}

async function main() {
  console.log('检查版本更新...\n');

  // 读取现有数据
  let data = { fetchedAt: '', games: {} };
  try {
    data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch (e) {
    console.log('数据文件不存在，将创建新文件');
  }

  let updated = false;

  // 检查米哈游游戏
  for (const game of MIHOYO_GAMES) {
    console.log(`检查 ${game.name}...`);
    const latest = await fetchMihoyoGame(game);
    
    if (latest) {
      const current = data.games[game.id]?.current;
      if (!current || current.version !== latest.version) {
        console.log(`  发现新版本: v${latest.version} ${latest.name}`);
        updated = true;
        
        // 更新数据
        if (!data.games[game.id]) {
          data.games[game.id] = { gameId: game.id, gameName: game.name, current: null, history: [] };
        }
        
        data.games[game.id].current = latest;
        
        // 添加到历史记录（如果不存在）
        if (!data.games[game.id].history.find(v => v.version === latest.version)) {
          data.games[game.id].history.unshift(latest);
        }
      } else {
        console.log(`  当前版本: v${current.version} ${current.name} (无更新)`);
      }
    } else {
      console.log(`  获取失败`);
    }
  }

  if (updated) {
    data.fetchedAt = new Date().toISOString();
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    console.log('\n数据已更新！');
  } else {
    console.log('\n所有游戏都是最新版本。');
  }
}

main().catch(console.error);
