import React from 'react';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';
import type { ScriptureItem } from '../types';
import { FormattedText } from './FormattedText';

interface ScriptureCardProps {
  scripture: ScriptureItem;
  index: number;
  isRead: boolean;
  isExpanded: boolean;
  isHighlighted?: boolean;
  onToggleRead: () => void;
  onToggleExpand: () => void;
}

export const ScriptureCard: React.FC<ScriptureCardProps> = ({
  scripture,
  index,
  isRead,
  isExpanded,
  isHighlighted = false,
  onToggleRead,
  onToggleExpand,
}) => {
  const checkboxId = `scripture-read-${scripture.id}`;
  const contextPanelId = `scripture-context-${scripture.id}`;
  const articleId = `scripture-card-${scripture.id}`;

  return (
    <article
      id={articleId}
      className={`scroll-mt-36 py-6 first:pt-2 last:pb-2 transition-colors duration-300 ${
        isHighlighted
          ? '-mx-3 rounded-xl bg-[#FFFBF0] px-3 ring-1 ring-[#EAD9B7]'
          : ''
      } ${isRead ? 'opacity-95' : ''}`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-baseline gap-2.5">
            <span className="text-sm font-medium text-[#64748B] tabular-nums">
              0{index + 1}.
            </span>
            <h3 className="font-serif text-xl font-semibold text-[#1E293B]">
              {scripture.reference}
            </h3>
          </div>
          <p className="mt-0.5 pl-7 text-sm text-[#64748B]">
            <span>{scripture.eraOrSetting}</span>
            {isHighlighted && !isRead && (
              <>
                <span aria-hidden="true" className="mx-1.5 text-[#CBD5E1]">
                  ·
                </span>
                <span className="font-semibold whitespace-nowrap text-[#B45309]">
                  Continue here
                </span>
              </>
            )}
          </p>
        </div>

        {/* Accessible >= 44px Read Checkbox Control */}
        <label
          htmlFor={checkboxId}
          className={`relative inline-flex min-h-[44px] cursor-pointer items-center gap-2.5 self-start rounded-xl border px-3.5 py-2 text-sm font-semibold whitespace-nowrap shrink-0 select-none transition-colors focus-within:outline-2 focus-within:outline-[#B45309] focus-within:outline-offset-2 ${
            isRead
              ? 'border-[#BBF7D0] bg-[#F0FDF4] text-[#15803D]'
              : 'border-[#E7E2D8] bg-[#FAF9F6] text-[#1E293B] hover:bg-[#F4F1EA]'
          }`}
        >
          <input
            id={checkboxId}
            type="checkbox"
            checked={isRead}
            onChange={onToggleRead}
            aria-label={`Mark ${scripture.reference} as read`}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          />
          <span
            aria-hidden="true"
            className={`flex h-5 w-5 items-center justify-center rounded-md border transition-colors ${
              isRead
                ? 'border-[#15803D] bg-[#15803D] text-white'
                : 'border-[#CBD5E1] bg-white'
            }`}
          >
            {isRead && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
          </span>
          <span>{isRead ? 'Read' : 'Mark Read'}</span>
        </label>
      </div>

      {/* Concise Verse Message Summary */}
      <div className="mt-3.5 pl-0 sm:pl-7">
        <p className="text-base leading-relaxed text-[#1E293B]">
          <span className="font-semibold text-[#475569]">Key Message: </span>
          <FormattedText text={scripture.messageSummary} />
        </p>

        {/* Expandable Historical & Literary Context Disclosure */}
        <div className="mt-3">
          <button
            type="button"
            onClick={onToggleExpand}
            aria-expanded={isExpanded}
            aria-controls={contextPanelId}
            className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg py-1.5 pr-2 text-sm font-semibold text-[#B45309] transition-colors hover:text-[#92400E]"
          >
            <span>Historical &amp; Literary Context</span>
            {isExpanded ? (
              <ChevronUp className="h-4 w-4 shrink-0" aria-hidden="true" />
            ) : (
              <ChevronDown className="h-4 w-4 shrink-0" aria-hidden="true" />
            )}
          </button>

          {isExpanded && (
            <div
              id={contextPanelId}
              className="mt-2 rounded-xl border border-[#E7E2D8] bg-[#FAF9F6] px-4 py-3.5 text-base leading-relaxed text-[#475569]"
            >
              <FormattedText text={scripture.historicalContext} />
            </div>
          )}
        </div>
      </div>
    </article>
  );
};
