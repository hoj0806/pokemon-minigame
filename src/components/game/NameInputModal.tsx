import { useState } from 'react';

const MEDALS = ['🥇', '🥈', '🥉'];

interface NameInputModalProps {
  rank: number;
  onSubmit: (name: string) => void;
  onClose: () => void;
}

export function NameInputModal({ rank, onSubmit, onClose }: NameInputModalProps) {
  const [value, setValue] = useState('');

  const handleSubmit = () => {
    onSubmit(value.trim() || '익명');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSubmit();
    if (e.key === 'Escape') onClose();
  };

  const medal = rank >= 1 && rank <= 3 ? MEDALS[rank - 1] : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="rounded-[--radius-card] bg-[#FFCB05] border-2 border-[#111827] shadow-[0_8px_0_0_#111827] w-80 flex flex-col overflow-hidden">
        <div className="bg-[--color-brand] px-6 py-4">
          <div className="flex items-center gap-2">
            {medal && <span className="text-2xl">{medal}</span>}
            <h2 className="font-galmuri text-xl font-bold text-[#FFCB05]">이름 입력</h2>
          </div>
          <p className="font-galmuri text-xs text-[#111827] font-bold mt-0.5">TOP 5 진입을 축하합니다!</p>
        </div>
        <div className="flex flex-col gap-4 p-6">
          <input
            type="text"
            maxLength={8}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="최대 8자 (빈 칸이면 익명)"
            className="bg-white border-2 border-[#111827] rounded-[--radius-sm] px-3 py-2 text-sm font-galmuri text-[#111827] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[--color-brand]"
            autoFocus
          />
          <div className="flex gap-2 justify-end">
            <button
              onClick={onClose}
              className="font-galmuri bg-white text-[#111827] font-bold px-4 py-2 rounded-[--radius-sm] text-sm border-2 border-[#111827] shadow-[0_3px_0_0_#111827] active:shadow-[0_1px_0_0_#111827] active:translate-y-[2px] transition-all duration-75 cursor-pointer"
            >
              취소
            </button>
            <button
              onClick={handleSubmit}
              className="font-galmuri bg-[--color-brand] text-[#111827] font-bold px-4 py-2 rounded-[--radius-sm] text-sm border-2 border-[#111827] shadow-[0_3px_0_0_#111827] active:shadow-[0_1px_0_0_#111827] active:translate-y-[2px] transition-all duration-75 cursor-pointer"
            >
              등록
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
