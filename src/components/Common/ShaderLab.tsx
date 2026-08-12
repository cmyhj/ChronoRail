import { useState } from 'react';
import { NeuroNoise } from '@paper-design/shaders-react';
import { GodRays } from '@paper-design/shaders-react';
import { PulsingBorder } from '@paper-design/shaders-react';

/**
 * 实验组件：本地试玩 NeuroNoise / GodRays / PulsingBorder
 * 在总览页顶部临时挂一个切换条，选哪个看哪个。
 */
export function ShaderLab() {
  const [active, setActive] = useState<'neuro' | 'godrays' | 'pulsing' | 'none'>('godrays');

  const buttonClass = (name: string) =>
    `px-2 py-1 rounded-md text-[10px] font-medium transition-colors ${
      active === name
        ? 'bg-accent text-white'
        : 'bg-white/[0.05] text-fg-3 hover:text-fg'
    }`;

  return (
    <div className="relative">
      {/* 背景层 */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {active === 'neuro' && (
          <NeuroNoise
            colorFront="#6366f1"
            colorMid="#3b2d7a"
            colorBack="#0d0d1a"
            brightness={0.4}
            contrast={1.1}
            speed={0.4}
          />
        )}
        {active === 'godrays' && (
          <GodRays
            colorBack="#0d0d1a"
            colorBloom="#6366f1"
            colors={['#0d0d1a', '#1a1a40', '#3a2578', '#6366f1', '#818cf8']}
            intensity={0.35}
            density={0.6}
            bloom={0.4}
            speed={0.3}
          />
        )}
        {active === 'pulsing' && (
          <PulsingBorder
            colorBack="#0d0d1a"
            colors={['#6366f1', '#818cf8', '#a855f7']}
            thickness={0.03}
            softness={0.5}
            pulse={0.5}
            speed={0.4}
          />
        )}
      </div>

      {/* 切换条 */}
      <div className="relative z-50 flex items-center gap-1.5 p-3 bg-ink/80 backdrop-blur border border-line rounded-xl">
        <span className="text-[10px] text-fg-4 mr-1">Shader Lab</span>
        <button className={buttonClass('neuro')} onClick={() => setActive('neuro')}>NeuroNoise</button>
        <button className={buttonClass('godrays')} onClick={() => setActive('godrays')}>GodRays</button>
        <button className={buttonClass('pulsing')} onClick={() => setActive('pulsing')}>PulsingBorder</button>
        <button className={buttonClass('none')} onClick={() => setActive('none')}>无</button>
      </div>
    </div>
  );
}
