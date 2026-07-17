import React, { useState, useCallback } from 'react';
import { RefreshCw } from 'lucide-react';

export const RandomNumberView: React.FC = () => {
  const [result, setResult] = useState<number | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [lastRange, setLastRange] = useState<number>(0);

  const generateRandom = useCallback((max: number) => {
    const random = Math.floor(Math.random() * max) + 1;
    setResult(random);
    setLastRange(max);
  }, []);

  const handleNumberClick = useCallback((num: number) => {
    generateRandom(num);
  }, [generateRandom]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
  }, []);

  const handleInputKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const num = parseInt(inputValue, 10);
      if (num >= 2) {
        generateRandom(num);
      }
    }
  }, [inputValue, generateRandom]);

  const handleRegenerate = useCallback(() => {
    if (lastRange >= 2) {
      generateRandom(lastRange);
    }
  }, [lastRange, generateRandom]);

  const numbers = [2, 3, 4, 5, 6, 7, 8, 9];

  return (
    <div className="h-full flex flex-col">
      {/* 工具栏 */}
      <div className="flex items-center justify-between p-3 md:p-4 bg-[#1a1a2e] border-b border-[#2d2d4a]">
        <h1 className="text-[#e2e8f0] font-semibold text-base md:text-lg">
          随机数生成器
        </h1>
        {result !== null && (
          <button
            onClick={handleRegenerate}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-[#818cf8] bg-[#818cf8]/10 hover:bg-[#818cf8]/20 rounded-lg transition-colors"
          >
            <RefreshCw size={14} />
            重新生成
          </button>
        )}
      </div>

      {/* 内容区域 */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          {/* 结果显示框 */}
          <div className="mb-8 p-8 bg-[#1a1a2e] rounded-2xl border border-[#2d2d4a] text-center">
            {result === null ? (
              <div>
                <div className="text-6xl font-bold text-[#64748b] mb-2">?</div>
                <p className="text-sm text-[#64748b]">
                  点击下方按钮或输入数字开始
                </p>
              </div>
            ) : (
              <div>
                <div className="text-7xl font-bold text-gradient mb-2 animate-bounce-in">
                  {result}
                </div>
                <p className="text-sm text-[#94a3b8]">
                  1 ~ {lastRange} 的随机数
                </p>
              </div>
            )}
          </div>

          {/* 九宫格 */}
          <div className="grid grid-cols-3 gap-3">
            {numbers.map((num) => (
              <button
                key={num}
                onClick={() => handleNumberClick(num)}
                className="aspect-square flex items-center justify-center text-2xl font-bold text-[#e2e8f0] bg-[#1a1a2e] border border-[#2d2d4a] rounded-xl hover:bg-[#252540] hover:border-[#6366f1]/50 active:scale-95 transition-all duration-150"
              >
                {num}
              </button>
            ))}
            {/* 输入框 */}
            <input
              type="number"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleInputKeyDown}
              placeholder="n"
              min="2"
              className="aspect-square flex items-center justify-center text-center text-xl font-bold text-[#e2e8f0] bg-[#1a1a2e] border border-[#2d2d4a] rounded-xl focus:outline-none focus:border-[#6366f1] placeholder-[#64748b] w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
