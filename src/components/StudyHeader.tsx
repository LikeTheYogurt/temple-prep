import React, { useEffect, useRef } from 'react';
import { Check, CircleAlert } from 'lucide-react';
import type {
  DayLesson,
  OverallProgressSummary,
  StudyProgress,
} from '../types';
import {
  computeDayProgress,
  getDayProgressionStatus,
  getHighestProgressedDay,
} from '../utils/progress';
import { PWAInstallButton } from './PWAInstallButton';

interface StudyHeaderProps {
  lessons: readonly DayLesson[];
  activeDay: number;
  progress: StudyProgress;
  overall: OverallProgressSummary;
  onSelectDay: (day: number) => void;
}

export const StudyHeader: React.FC<StudyHeaderProps> = ({
  lessons,
  activeDay,
  progress,
  overall,
  onSelectDay,
}) => {
  const activeButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    activeButtonRef.current?.scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
      block: 'nearest',
    });
  }, [activeDay]);

  const highestProgressedDay = getHighestProgressedDay(lessons, progress);

  return (
    <header className="sticky top-0 z-30 border-b border-[#E7E2D8] bg-[#FAF9F6]/95 backdrop-blur-md">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Top Row: Brand Title + Progress Tally + Optional PWA Install CTA */}
        <div className="flex items-center justify-between gap-3 pt-2.5 pb-1.5">
          <div className="min-w-0">
            <h1 className="truncate font-serif text-lg font-semibold tracking-tight text-[#1E293B] sm:text-xl">
              Temple Prep: 7-Day Guide
            </h1>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div
              className="text-right text-xs font-medium text-[#475569] tabular-nums sm:text-sm"
              aria-live="polite"
            >
              <span className="hidden sm:inline">
                {overall.completedDaysCount} of {overall.totalDays} Days
                Completed
              </span>
              <span className="sm:hidden">
                {overall.completedDaysCount} of {overall.totalDays} Days
              </span>
              <span aria-hidden="true" className="mx-1.5 text-[#94A3B8]">
                ·
              </span>
              <span
                className={
                  overall.allDaysComplete
                    ? 'font-semibold text-[#15803D]'
                    : 'font-semibold text-[#B45309]'
                }
              >
                {overall.percentComplete}%
              </span>
            </div>
            <PWAInstallButton />
          </div>
        </div>

        {/* Thin Visual Progress Track */}
        <div
          role="progressbar"
          aria-label="Overall 7-day preparation progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={overall.percentComplete}
          className="h-1.5 w-full overflow-hidden rounded-full bg-[#E7E2D8]"
        >
          <div
            className={`h-full w-full origin-left rounded-full transition-transform duration-300 ease-out ${
              overall.allDaysComplete ? 'bg-[#15803D]' : 'bg-[#B45309]'
            }`}
            style={{
              transform: `scaleX(${overall.percentComplete / 100})`,
            }}
          />
        </div>

        {/* Quick Horizontal Day-Selector Pills (Thumb-friendly >= 44px touch targets) */}
        <nav
          aria-label="Select study day"
          className="no-scrollbar -mx-4 flex items-center gap-2 overflow-x-auto px-4 py-2 sm:mx-0 sm:px-0"
        >
          {lessons.map((lesson) => {
            const isActive = lesson.day === activeDay;
            const summary = computeDayProgress(lesson, progress);
            const status = getDayProgressionStatus(
              lesson,
              progress,
              highestProgressedDay
            );
            const hasIncompleteScriptures =
              status === 'skipped' ||
              (status === 'in-progress' && !summary.allScripturesRead);
            const allReadNotCompleted =
              status === 'in-progress' && summary.allScripturesRead;

            let statusText = '';
            if (status === 'complete') {
              statusText = ' (Completed)';
            } else if (status === 'skipped') {
              statusText = ` (Skipped — 0 of ${summary.totalCount} scriptures read)`;
            } else if (status === 'in-progress') {
              statusText = ` (${summary.readCount} of ${summary.totalCount} scriptures read)`;
            }

            let buttonStyles =
              'border border-[#E7E2D8] bg-white text-[#1E293B] hover:bg-[#F4F1EA]';
            if (isActive) {
              buttonStyles = 'bg-[#1E293B] text-white shadow-xs';
            } else if (status === 'complete') {
              buttonStyles =
                'border border-[#BBF7D0] bg-[#F0FDF4] text-[#15803D] hover:bg-[#DCFCE7]';
            } else if (hasIncompleteScriptures) {
              buttonStyles =
                'border border-[#EAD9B7] bg-[#FFFBF0] text-[#92400E] hover:bg-[#FEF3C7]';
            } else if (allReadNotCompleted) {
              buttonStyles =
                'border border-[#BBF7D0] bg-white text-[#1E293B] hover:bg-[#F0FDF4]';
            }

            return (
              <button
                key={lesson.day}
                ref={isActive ? activeButtonRef : null}
                type="button"
                onClick={() => onSelectDay(lesson.day)}
                aria-current={isActive ? 'page' : undefined}
                aria-label={`Day ${lesson.day}: ${lesson.title}${statusText}`}
                title={
                  hasIncompleteScriptures
                    ? `${summary.readCount} of ${summary.totalCount} scriptures read`
                    : undefined
                }
                className={`inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-semibold whitespace-nowrap shrink-0 transition-colors ${buttonStyles}`}
              >
                {status === 'complete' && (
                  <Check
                    className={`h-3.5 w-3.5 shrink-0 ${
                      isActive ? 'text-[#86EFAC]' : 'text-[#15803D]'
                    }`}
                    strokeWidth={2.5}
                    aria-hidden="true"
                  />
                )}
                {hasIncompleteScriptures && (
                  <CircleAlert
                    className={`h-3.5 w-3.5 shrink-0 ${
                      isActive ? 'text-[#FCD34D]' : 'text-[#B45309]'
                    }`}
                    strokeWidth={2.25}
                    aria-hidden="true"
                  />
                )}
                <span>Day {lesson.day}</span>
                {(hasIncompleteScriptures || allReadNotCompleted) && (
                  <span
                    className={`text-xs font-medium tabular-nums ${
                      isActive
                        ? allReadNotCompleted
                          ? 'text-[#86EFAC]'
                          : 'text-[#FCD34D]'
                        : allReadNotCompleted
                          ? 'text-[#15803D]'
                          : 'text-[#B45309]'
                    }`}
                  >
                    {summary.readCount}/{summary.totalCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
