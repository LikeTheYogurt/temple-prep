import React, { useState } from 'react';
import { CheckCircle2, Circle, CircleAlert, RotateCcw } from 'lucide-react';
import templePhoto from '../assets/images/temple_morning_light_1795468478536.jpg';
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

interface DaySidebarProps {
  lessons: readonly DayLesson[];
  activeDay: number;
  progress: StudyProgress;
  overall: OverallProgressSummary;
  onSelectDay: (day: number) => void;
  onOpenReset: () => void;
}

export const DaySidebar: React.FC<DaySidebarProps> = ({
  lessons,
  activeDay,
  progress,
  overall,
  onSelectDay,
  onOpenReset,
}) => {
  const [imageError, setImageError] = useState(false);

  return (
    <aside
      aria-label="7-Day Study Plan Overview"
      className="hidden lg:flex lg:flex-col lg:gap-4 lg:sticky lg:top-[124px] lg:self-start lg:max-h-[calc(100dvh-140px)] lg:overflow-y-auto no-scrollbar"
    >
      {/* Serene Temple Reflection Frame */}
      <figure className="shrink-0 overflow-hidden rounded-2xl border border-[#E7E2D8] bg-white">
        {!imageError ? (
          <img
            src={templePhoto}
            alt="White limestone temple exterior at sunrise with calm gardens and reflecting pool"
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
            className="h-36 w-full object-cover"
          />
        ) : (
          <div className="flex h-36 w-full items-center justify-center bg-[#1E293B] px-6 text-center text-sm font-medium text-[#FAF9F6]">
            The House of the Lord
          </div>
        )}
        <figcaption className="px-4 py-2.5 text-xs leading-relaxed text-[#475569]">
          A 7-day parent &amp; youth preparation guide for your first temple
          baptisms trip.
        </figcaption>
      </figure>

      {/* 7-Day Roadmap */}
      <div className="rounded-2xl border border-[#E7E2D8] bg-white p-4">
        <div className="flex items-baseline justify-between gap-2 pb-2.5 border-b border-[#E7E2D8]">
          <h2 className="font-serif text-base font-semibold text-[#1E293B]">
            7-Day Study Plan
          </h2>
          <span className="text-xs font-medium text-[#64748B] tabular-nums">
            {overall.readScripturesCount} / {overall.totalScriptures} scriptures
          </span>
        </div>

        <ol className="mt-1.5 divide-y divide-[#F4F1EA]">
          {(() => {
            const highestProgressedDay = getHighestProgressedDay(
              lessons,
              progress
            );
            return lessons.map((lesson) => {
              const summary = computeDayProgress(lesson, progress);
              const status = getDayProgressionStatus(
                lesson,
                progress,
                highestProgressedDay
              );
              const isActive = lesson.day === activeDay;
              const needsAttention =
                status === 'skipped' ||
                (status === 'in-progress' && !summary.allScripturesRead);

              return (
                <li key={lesson.day}>
                  <button
                    type="button"
                    onClick={() => onSelectDay(lesson.day)}
                    aria-current={isActive ? 'page' : undefined}
                    className={`flex w-full min-h-[44px] items-start gap-2.5 rounded-xl px-2.5 py-2 text-left transition-colors ${
                      isActive
                        ? 'bg-[#FAF9F6] text-[#1E293B]'
                        : 'text-[#475569] hover:bg-[#FAF9F6] hover:text-[#1E293B]'
                    }`}
                  >
                    <span className="mt-0.5 shrink-0" aria-hidden="true">
                      {status === 'complete' ? (
                        <CheckCircle2 className="h-4 w-4 text-[#15803D]" />
                      ) : needsAttention ? (
                        <CircleAlert className="h-4 w-4 text-[#B45309]" />
                      ) : (
                        <Circle
                          className={`h-4 w-4 ${
                            isActive ? 'text-[#B45309]' : 'text-[#CBD5E1]'
                          }`}
                        />
                      )}
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2 text-xs font-medium tabular-nums">
                        <span className="text-[#64748B]">Day {lesson.day}</span>
                        <span
                          className={
                            status === 'complete'
                              ? 'text-[#15803D]'
                              : needsAttention
                                ? 'font-semibold text-[#B45309]'
                                : 'text-[#64748B]'
                          }
                        >
                          {summary.readCount}/{summary.totalCount} read
                          {status === 'skipped' ? ' · Skipped' : ''}
                        </span>
                      </span>
                      <span
                        className={`mt-0.5 block text-[13px] leading-snug ${
                          isActive
                            ? 'font-semibold text-[#1E293B]'
                            : 'font-medium text-[#334155]'
                        }`}
                      >
                        {lesson.title}
                      </span>
                    </span>
                  </button>
                </li>
              );
            });
          })()}
        </ol>

        <div className="mt-3 border-t border-[#E7E2D8] pt-3 flex items-center justify-between gap-2">
          <span className="text-xs text-[#64748B] tabular-nums">
            {overall.notesWrittenCount}{' '}
            {overall.notesWrittenCount === 1 ? 'note' : 'notes'} saved
          </span>
          <button
            type="button"
            onClick={onOpenReset}
            className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#64748B] transition-colors hover:bg-[#F4F1EA] hover:text-[#B45309]"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            Reset Progress
          </button>
        </div>
      </div>
    </aside>
  );
};
