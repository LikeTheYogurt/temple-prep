import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Circle,
  MessageSquareHeart,
  NotebookPen,
} from 'lucide-react';
import templePhoto from '../assets/images/temple_morning_light_1795468478536.jpg';
import type { DayLesson, DayProgressSummary, StudyProgress } from '../types';
import { getNextFocusTarget } from '../utils/progress';
import { FormattedText } from './FormattedText';
import { ScriptureCard } from './ScriptureCard';

interface DayLessonCardProps {
  lesson: DayLesson;
  totalDays: number;
  navigationCount: number;
  previousLessonTitle: string | null;
  nextLessonTitle: string | null;
  dayProgress: DayProgressSummary;
  progress: StudyProgress;
  noteSavedAt: number | null;
  onToggleDayComplete: () => void;
  onToggleScriptureRead: (scriptureId: string) => void;
  onUpdateNote: (text: string) => void;
  onNavigateDay: (day: number) => void;
}

export const DayLessonCard: React.FC<DayLessonCardProps> = ({
  lesson,
  totalDays,
  navigationCount,
  previousLessonTitle,
  nextLessonTitle,
  dayProgress,
  progress,
  noteSavedAt,
  onToggleDayComplete,
  onToggleScriptureRead,
  onUpdateNote,
  onNavigateDay,
}) => {
  // Context panels default to expanded so readers never lose historical context,
  // while still letting them collapse individual scriptures as they finish.
  const [collapsedIds, setCollapsedIds] = useState<Record<string, boolean>>({});
  const [mobileImageError, setMobileImageError] = useState(false);
  const [highlightedScriptureId, setHighlightedScriptureId] = useState<
    string | null
  >(null);

  const progressRef = useRef(progress);
  progressRef.current = progress;
  const notesSectionRef = useRef<HTMLDivElement | null>(null);
  const notesTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const completeSectionRef = useRef<HTMLDivElement | null>(null);
  const completeButtonRef = useRef<HTMLButtonElement | null>(null);

  const highlightTimerRef = useRef<number | undefined>(undefined);

  const focusScriptureById = (
    scriptureId: string,
    scrollBehavior: ScrollBehavior
  ) => {
    if (highlightTimerRef.current !== undefined) {
      window.clearTimeout(highlightTimerRef.current);
    }
    setHighlightedScriptureId(scriptureId);
    const articleEl = document.getElementById(`scripture-card-${scriptureId}`);
    const checkboxEl = document.getElementById(`scripture-read-${scriptureId}`);
    articleEl?.scrollIntoView({ behavior: scrollBehavior, block: 'start' });
    checkboxEl?.focus({ preventScroll: true });

    highlightTimerRef.current = window.setTimeout(() => {
      setHighlightedScriptureId((current) =>
        current === scriptureId ? null : current
      );
      highlightTimerRef.current = undefined;
    }, 2800);
  };

  useEffect(() => {
    setCollapsedIds({});
  }, [lesson.day]);

  useEffect(() => {
    const target = getNextFocusTarget(lesson, progressRef.current);
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const scrollBehavior: ScrollBehavior = prefersReducedMotion
      ? 'auto'
      : 'smooth';

    if (!target) {
      setHighlightedScriptureId(null);
      if (navigationCount > 0) {
        window.scrollTo({ top: 0, behavior: scrollBehavior });
      }
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      if (target.type === 'scripture') {
        focusScriptureById(target.scriptureId, scrollBehavior);
      } else if (target.type === 'notes') {
        setHighlightedScriptureId(null);
        notesSectionRef.current?.scrollIntoView({
          behavior: scrollBehavior,
          block: 'start',
        });
        notesTextareaRef.current?.focus({ preventScroll: true });
      } else if (target.type === 'complete') {
        setHighlightedScriptureId(null);
        completeSectionRef.current?.scrollIntoView({
          behavior: scrollBehavior,
          block: 'center',
        });
        completeButtonRef.current?.focus({ preventScroll: true });
      }
    });

    return () => {
      window.cancelAnimationFrame(frameId);
      if (highlightTimerRef.current !== undefined) {
        window.clearTimeout(highlightTimerRef.current);
        highlightTimerRef.current = undefined;
      }
    };
  }, [lesson, navigationCount]);

  const allExpanded = lesson.scriptures.every((s) => !collapsedIds[s.id]);

  const toggleAllContexts = () => {
    if (allExpanded) {
      const next: Record<string, boolean> = {};
      for (const s of lesson.scriptures) {
        next[s.id] = true;
      }
      setCollapsedIds(next);
    } else {
      setCollapsedIds({});
    }
  };

  const toggleSingleContext = (id: string) => {
    setCollapsedIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const noteValue = progress.notes[lesson.day] ?? '';
  const notesFieldId = `family-notes-day-${lesson.day}`;

  return (
    <section
      aria-labelledby="lesson-day-heading"
      className="rounded-2xl border border-[#E7E2D8] bg-white p-5 sm:p-8"
    >
      {/* Day Header */}
      <div className="border-b border-[#E7E2D8] pb-6">
        <p className="text-sm font-medium text-[#64748B] tabular-nums">
          <span>
            Day {lesson.day} of {totalDays}
          </span>
          <span aria-hidden="true" className="mx-2 text-[#CBD5E1]">
            ·
          </span>
          <span>
            {dayProgress.readCount} of {dayProgress.totalCount} scriptures read
          </span>
          {dayProgress.isCompleted && (
            <>
              <span aria-hidden="true" className="mx-2 text-[#CBD5E1]">
                ·
              </span>
              <span className="font-semibold text-[#15803D]">Completed</span>
            </>
          )}
        </p>
        <h2
          id="lesson-day-heading"
          className="mt-2 font-serif text-2xl font-semibold leading-tight text-[#1E293B] sm:text-3xl"
        >
          {lesson.title}
        </h2>
      </div>

      {/* Mobile-only Serene Temple Photograph on Day 1 to support Day 1 Nightly Activity */}
      {lesson.day === 1 && !mobileImageError && (
        <figure className="mt-6 overflow-hidden rounded-xl border border-[#E7E2D8] bg-[#FAF9F6] lg:hidden">
          <img
            src={templePhoto}
            alt="White limestone temple exterior at sunrise with calm gardens and reflecting pool"
            referrerPolicy="no-referrer"
            onError={() => setMobileImageError(true)}
            className="aspect-16/9 w-full object-cover"
          />
          <figcaption className="px-4 py-2.5 text-xs text-[#64748B]">
            The House of the Lord — Take a quiet moment to look and reflect
            together.
          </figcaption>
        </figure>
      )}

      {/* Core Focus Section */}
      <div className="mt-6">
        <h3 className="font-serif text-lg font-semibold text-[#1E293B]">
          Core Focus
        </h3>
        <p className="mt-2 text-[17px] leading-[1.7] text-[#334155]">
          <FormattedText text={lesson.coreFocus} />
        </p>
      </div>

      {/* Scriptures & Historical Context */}
      <div className="mt-8 border-t border-[#E7E2D8] pt-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <BookOpen
              className="h-5 w-5 text-[#B45309] shrink-0"
              aria-hidden="true"
            />
            <h3 className="font-serif text-xl font-semibold text-[#1E293B]">
              Scriptures &amp; Historical Context
            </h3>
          </div>

          <button
            type="button"
            onClick={toggleAllContexts}
            className="inline-flex min-h-[40px] items-center rounded-lg px-2.5 py-1.5 text-sm font-medium text-[#64748B] transition-colors hover:bg-[#FAF9F6] hover:text-[#1E293B]"
          >
            {allExpanded ? 'Collapse all context' : 'Expand all context'}
          </button>
        </div>

        <p className="mt-1.5 text-sm text-[#64748B]">
          Read each passage together and review its historical setting so the
          verses stay grounded in their original context.
        </p>

        <div className="mt-4 divide-y divide-[#E7E2D8]">
          {lesson.scriptures.map((scripture, idx) => (
            <ScriptureCard
              key={scripture.id}
              scripture={scripture}
              index={idx}
              isRead={Boolean(progress.readScriptures[scripture.id])}
              isExpanded={!collapsedIds[scripture.id]}
              isHighlighted={highlightedScriptureId === scripture.id}
              onToggleRead={() => {
                if (highlightedScriptureId === scripture.id) {
                  setHighlightedScriptureId(null);
                }
                onToggleScriptureRead(scripture.id);
              }}
              onToggleExpand={() => toggleSingleContext(scripture.id)}
            />
          ))}
        </div>
      </div>

      {/* Nightly Activity / Discussion Highlighted Callout Box */}
      <div className="mt-8 rounded-2xl border border-[#EAD9B7] bg-[#FFFBF0] p-5 sm:p-6">
        <div className="flex items-center gap-2 text-[#B45309]">
          <MessageSquareHeart className="h-5 w-5 shrink-0" aria-hidden="true" />
          <h3 className="font-serif text-lg font-semibold text-[#92400E]">
            Nightly Activity &amp; Discussion
          </h3>
        </div>
        <p className="mt-2.5 text-base leading-relaxed text-[#1E293B]">
          <FormattedText text={lesson.nightlyActivity} />
        </p>
      </div>

      {/* Our Family Notes Auto-Saving Textarea */}
      <div
        ref={notesSectionRef}
        className="mt-8 scroll-mt-36 border-t border-[#E7E2D8] pt-7"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <label
            htmlFor={notesFieldId}
            className="flex items-center gap-2 font-serif text-lg font-semibold text-[#1E293B]"
          >
            <NotebookPen
              className="h-5 w-5 text-[#64748B] shrink-0"
              aria-hidden="true"
            />
            <span>Our Family Notes</span>
          </label>
          <span
            className="text-xs font-medium text-[#64748B]"
            aria-live="polite"
          >
            {noteValue.length > 0 || noteSavedAt
              ? 'Saved automatically on this device'
              : 'Auto-saves locally as you type'}
          </span>
        </div>

        <textarea
          ref={notesTextareaRef}
          id={notesFieldId}
          value={noteValue}
          onChange={(e) => onUpdateNote(e.target.value)}
          rows={4}
          placeholder="Write down questions, spiritual impressions, or favorite thoughts from tonight's study..."
          className="mt-3 block w-full resize-y rounded-xl border border-[#E7E2D8] bg-[#FAF9F6] px-4 py-3.5 text-base leading-relaxed text-[#1E293B] placeholder:text-[#94A3B8] transition-colors focus:border-[#B45309] focus:bg-white"
        />
      </div>

      {/* Bottom Day Completion Toggle */}
      <div
        ref={completeSectionRef}
        className="mt-8 flex scroll-mt-36 flex-col gap-3 border-t border-[#E7E2D8] pt-6 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="space-y-1">
          <p className="text-sm text-[#475569]">
            {dayProgress.isCompleted
              ? `Day ${lesson.day} is marked complete. You can toggle this anytime.`
              : dayProgress.allScripturesRead
                ? `All ${dayProgress.totalCount} scriptures read! Ready to mark Day ${lesson.day} complete?`
                : `Mark all ${dayProgress.totalCount} scriptures as read to complete Day ${lesson.day} (${dayProgress.totalCount - dayProgress.readCount} remaining).`}
          </p>
          {!dayProgress.allScripturesRead && (
            <button
              type="button"
              onClick={() => {
                const firstUnread = lesson.scriptures.find(
                  (s) => !progress.readScriptures[s.id]
                );
                if (!firstUnread) return;
                const prefersReducedMotion = window.matchMedia(
                  '(prefers-reduced-motion: reduce)'
                ).matches;
                focusScriptureById(
                  firstUnread.id,
                  prefersReducedMotion ? 'auto' : 'smooth'
                );
              }}
              className="inline-flex min-h-[44px] items-center text-sm font-semibold text-[#B45309] underline-offset-4 transition-colors hover:text-[#92400E] hover:underline"
            >
              Jump to next unread scripture
            </button>
          )}
        </div>
        <button
          ref={completeButtonRef}
          type="button"
          disabled={!dayProgress.isCompleted && !dayProgress.allScripturesRead}
          onClick={onToggleDayComplete}
          aria-pressed={dayProgress.isCompleted}
          className={`inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold whitespace-nowrap shrink-0 transition-colors sm:w-auto disabled:cursor-not-allowed disabled:bg-[#E2E8F0] disabled:text-[#64748B] ${
            dayProgress.isCompleted
              ? 'bg-[#15803D] text-white hover:bg-[#166534]'
              : 'bg-[#1E293B] text-white hover:bg-[#0F172A]'
          }`}
        >
          {dayProgress.isCompleted ? (
            <>
              <CheckCircle2 className="h-5 w-5 shrink-0" aria-hidden="true" />
              <span>Day Completed</span>
            </>
          ) : (
            <>
              <Circle className="h-5 w-5 shrink-0" aria-hidden="true" />
              <span>Mark Day Complete</span>
            </>
          )}
        </button>
      </div>

      {/* Bottom Previous Day / Next Day Navigation */}
      <nav
        aria-label="Lesson day navigation"
        className="mt-6 grid grid-cols-2 gap-3 border-t border-[#E7E2D8] pt-6"
      >
        <button
          type="button"
          disabled={lesson.day <= 1}
          onClick={() => onNavigateDay(lesson.day - 1)}
          className="flex min-h-[54px] items-center justify-start gap-2.5 rounded-xl border border-[#E7E2D8] bg-white px-4 py-3 text-left transition-colors hover:bg-[#FAF9F6] disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:bg-white"
        >
          <ArrowLeft
            className="h-4 w-4 shrink-0 text-[#475569]"
            aria-hidden="true"
          />
          <span className="min-w-0">
            <span className="block text-xs font-medium text-[#64748B]">
              Previous Day
            </span>
            <span className="block truncate text-sm font-semibold text-[#1E293B]">
              {previousLessonTitle
                ? `Day ${lesson.day - 1}`
                : 'Start of guide'}
            </span>
          </span>
        </button>

        <button
          type="button"
          disabled={lesson.day >= totalDays}
          onClick={() => onNavigateDay(lesson.day + 1)}
          className="flex min-h-[54px] items-center justify-end gap-2.5 rounded-xl border border-[#E7E2D8] bg-white px-4 py-3 text-right transition-colors hover:bg-[#FAF9F6] disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:bg-white"
        >
          <span className="min-w-0">
            <span className="block text-xs font-medium text-[#64748B]">
              Next Day
            </span>
            <span className="block truncate text-sm font-semibold text-[#1E293B]">
              {nextLessonTitle ? `Day ${lesson.day + 1}` : 'End of guide'}
            </span>
          </span>
          <ArrowRight
            className="h-4 w-4 shrink-0 text-[#475569]"
            aria-hidden="true"
          />
        </button>
      </nav>
    </section>
  );
};
