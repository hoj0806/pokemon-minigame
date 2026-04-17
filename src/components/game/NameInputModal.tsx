import { useState } from 'react';

interface NameInputModalProps {
  onSubmit: (name: string) => void;
  onClose: () => void;
}

export function NameInputModal({ onSubmit, onClose }: NameInputModalProps) {
  const [value, setValue] = useState('');

  const handleSubmit = () => {
    onSubmit(value.trim() || '익명');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSubmit();
    if (e.key === 'Escape') onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="rounded-[--radius-card] bg-[--color-surface-overlay] border border-[--color-border] shadow-[--shadow-elevated] p-6 w-80 flex flex-col gap-4">
        <h2 className="text-xl font-bold text-[--color-on-surface]">이름 입력</h2>
        <input
          type="text"
          maxLength={8}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="최대 8자 (빈 칸이면 익명)"
          className="bg-[--color-surface] border border-[--color-border] rounded-[--radius-sm] px-3 py-2 text-sm text-[--color-on-surface] placeholder:text-[--color-on-surface-muted] focus:outline-none focus:ring-1 focus:ring-[--color-brand]"
          autoFocus
        />
        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="bg-transparent border border-[--color-border] text-[--color-on-surface] px-4 py-2 rounded-[--radius-sm] text-sm font-semibold"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            className="bg-[--color-brand] hover:bg-[--color-brand-dark] text-white font-semibold px-4 py-2 rounded-[--radius-sm] text-sm"
          >
            등록
          </button>
        </div>
      </div>
    </div>
  );
}
