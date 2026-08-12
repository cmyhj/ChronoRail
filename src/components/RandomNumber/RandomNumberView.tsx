import React, { useState, useCallback } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '../Common/Button';
import { TextGenerateEffect } from '../ui/text-generate-effect';

export const RandomNumberView: React.FC = () => {
  const [result, setResult] = useState<number | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [lastRange, setLastRange] = useState<number>(0);
  const [flashKey, setFlashKey] = useState(0);

  const generateRandom = useCallback((max: number) => {
    const random = Math.floor(Math.random() * max) + 1;
    setResult(random);
    setLastRange(max);
    setFlashKey((k) => k + 1);
  }, []);

  const handleNumberClick = useCallback(
    (num: number) => {
      generateRandom(num);
    },
    [generateRandom]
  );

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  }, []);

  const handleInputKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        const num = parseInt(inputValue, 10);
        if (num >= 2) {
          generateRandom(num);
        }
      }
    },
    [inputValue, generateRandom]
  );

  const handleRegenerate = useCallback(() => {
    if (lastRange >= 2) {
      generateRandom(lastRange);
    }
  }, [lastRange, generateRandom]);

  const numbers = [2, 3, 4, 5, 6, 7, 8, 9];

  return (
    <div className="h-full flex flex-col overflow-auto">
      <div className="p-4 md:p-6 max-w-[600px] mx-auto w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-base font-semibold text-fg">
            <TextGenerateEffect words="随机数生成器" duration={0.6} className="text-base" />
          </h1>
          {result !== null && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleRegenerate}
              icon={<RefreshCw size={13} />}
            >
              重新生成
            </Button>
          )}
        </div>

        {/* Result */}
        <div className="mb-8 p-10 bg-panel rounded-2xl border border-line text-center">
          {result === null ? (
            <div>
              <div className="text-6xl font-bold text-fg-4 mb-3">?</div>
              <p className="text-[13px] text-fg-3">
                点击下方按钮或输入数字开始
              </p>
            </div>
          ) : (
            <div>
              <div
                key={flashKey}
                className="text-7xl font-bold text-accent mb-2 animate-number-flash tabular-nums"
              >
                {result}
              </div>
              <p className="text-[13px] text-fg-3 tabular-nums">
                1 ~ {lastRange} 的随机数
              </p>
            </div>
          )}
        </div>

        {/* Number pad */}
        <div className="grid grid-cols-3 gap-2.5">
          {numbers.map((num) => (
            <button
              key={num}
              onClick={() => handleNumberClick(num)}
              className="aspect-square flex items-center justify-center text-xl font-bold text-fg-2 bg-card border border-line rounded-xl hover:bg-hover hover:border-line-strong hover:text-fg active:scale-95 transition-all duration-150"
            >
              {num}
            </button>
          ))}
          <input
            type="number"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleInputKeyDown}
            placeholder="n"
            min="2"
            className="aspect-square flex items-center justify-center text-center text-xl font-bold text-fg bg-card border border-line rounded-xl focus:outline-none focus:border-accent placeholder-fg-4 w-full tabular-nums"
          />
        </div>
      </div>
    </div>
  );
};
