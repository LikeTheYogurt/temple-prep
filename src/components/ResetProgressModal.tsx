import React, { useEffect, useRef } from 'react';
import { RotateCcw, X } from 'lucide-react';

interface ResetProgressModalProps {
  isOpen: boolean;
  completedDaysCount: number;
  readScripturesCount: number;
  notesWrittenCount: number;
  onCancel: () => void;
  onConfirm: () => void;
}

export const ResetProgressModal: React.FC<ResetProgressModalProps> = ({
  isOpen,
  completedDaysCount,
  readScripturesCount,
  notesWrittenCount,
  onCancel,
  onConfirm,
}) => {
  const cancelButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    cancelButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/55 p-4 backdrop-blur-xs"
      onClick={onCancel}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="reset-dialog-title"
        aria-describedby="reset-dialog-description"
        className="w-full max-w-md rounded-2xl border border-[#E7E2D8] bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FEF3C7] text-[#B45309]">
              <RotateCcw className="h-5 w-5" aria-hidden="true" />
            </span>
            <h2
              id="reset-dialog-title"
              className="text-xl font-semibold text-[#1E293B]"
            >
              Reset study progress?
            </h2>
          </div>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Close reset dialog"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-[#64748B] transition-colors hover:bg-[#F4F1EA] hover:text-[#1E293B]"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <p
          id="reset-dialog-description"
          className="mt-4 text-[15px] leading-relaxed text-[#475569]"
        >
          This will clear all saved progress on this device, including completed
          days, scripture checkmarks, and written family notes.
        </p>

        <div className="mt-4 rounded-xl border border-[#E7E2D8] bg-[#FAF9F6] px-4 py-3 text-sm text-[#475569] tabular-nums">
          Currently saved: {completedDaysCount} of 7 days completed ·{' '}
          {readScripturesCount}{' '}
          {readScripturesCount === 1 ? 'scripture' : 'scriptures'} read ·{' '}
          {notesWrittenCount} {notesWrittenCount === 1 ? 'note' : 'notes'}
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            ref={cancelButtonRef}
            type="button"
            onClick={onCancel}
            className="min-h-[44px] rounded-xl border border-[#E7E2D8] bg-white px-5 py-2.5 text-sm font-semibold text-[#1E293B] transition-colors hover:bg-[#F4F1EA]"
          >
            Keep Progress
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="min-h-[44px] rounded-xl bg-[#B45309] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#92400E]"
          >
            Yes, Reset Everything
          </button>
        </div>
      </div>
    </div>
  );
};
