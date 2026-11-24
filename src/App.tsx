import React, { useMemo, useState } from 'react';
import { CheckCircle2, RotateCcw } from 'lucide-react';
import { CURRICULUM } from './data/curriculum';
import { useStudyProgress } from './hooks/useStudyProgress';
import { computeDayProgress, computeOverallProgress } from './utils/progress';
import { StudyHeader } from './components/StudyHeader';
import { DayLessonCard } from './components/DayLessonCard';
import { DaySidebar } from './components/DaySidebar';
import { ResetProgressModal } from './components/ResetProgressModal';
import { OfflineIndicator } from './components/OfflineIndicator';

export const App: React.FC = () => {
  const {
    progress,
    noteSavedAt,
    setActiveDay,
    onToggleDayComplete,
    onToggleScriptureRead,
    onUpdateNote,
    onResetProgress,
  } = useStudyProgress();

  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [navigationCount, setNavigationCount] = useState(0);

  const activeLesson = useMemo(() => {
    return (
      CURRICULUM.find((item) => item.day === progress.activeDay) ??
      CURRICULUM[0]
    );
  }, [progress.activeDay]);

  const previousLesson =
    activeLesson.day > 1 ? CURRICULUM[activeLesson.day - 2] : null;
  const nextLesson =
    activeLesson.day < CURRICULUM.length ? CURRICULUM[activeLesson.day] : null;

  const overall = useMemo(
    () => computeOverallProgress(CURRICULUM, progress),
    [progress]
  );

  const activeDayProgress = useMemo(
    () => computeDayProgress(activeLesson, progress),
    [activeLesson, progress]
  );

  const handleSelectDay = (day: number) => {
    setActiveDay(day);
    setNavigationCount((count) => count + 1);
  };

  const handleConfirmReset = () => {
    onResetProgress();
    setIsResetModalOpen(false);
    setNavigationCount((count) => count + 1);
  };

  return (
    <div className="flex min-h-dvh flex-col bg-[#FAF9F6] text-[#1E293B]">
      <StudyHeader
        lessons={CURRICULUM}
        activeDay={activeLesson.day}
        progress={progress}
        overall={overall}
        onSelectDay={handleSelectDay}
      />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {overall.allDaysComplete && (
          <div
            role="status"
            className="mb-6 flex items-start gap-3 rounded-2xl border border-[#BBF7D0] bg-[#F0FDF4] px-5 py-4 text-[#15803D]"
          >
            <CheckCircle2
              className="mt-0.5 h-5 w-5 shrink-0"
              aria-hidden="true"
            />
            <div className="text-sm leading-relaxed sm:text-base">
              <strong className="font-semibold">
                All 7 days completed.
              </strong>{' '}
              Your family has finished the entire study guide and is ready for a
              meaningful first trip to the House of the Lord.
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
          <DayLessonCard
            lesson={activeLesson}
            totalDays={CURRICULUM.length}
            navigationCount={navigationCount}
            previousLessonTitle={previousLesson?.title ?? null}
            nextLessonTitle={nextLesson?.title ?? null}
            dayProgress={activeDayProgress}
            progress={progress}
            noteSavedAt={noteSavedAt}
            onToggleDayComplete={() => onToggleDayComplete(activeLesson.day)}
            onToggleScriptureRead={onToggleScriptureRead}
            onUpdateNote={(text) => onUpdateNote(activeLesson.day, text)}
            onNavigateDay={handleSelectDay}
          />

          <DaySidebar
            lessons={CURRICULUM}
            activeDay={activeLesson.day}
            progress={progress}
            overall={overall}
            onSelectDay={handleSelectDay}
            onOpenReset={() => setIsResetModalOpen(true)}
          />
        </div>
      </main>

      <footer className="mt-8 border-t border-[#E7E2D8] bg-[#FAF9F6]">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-4 py-6 sm:flex-row sm:items-center sm:px-6 lg:px-8">
          <div className="text-sm text-[#64748B]">
            <p className="font-medium text-[#475569]">
              Temple Prep: 7-Day Study Guide
            </p>
            <p className="mt-0.5 text-xs text-[#64748B]">
              100% offline-ready · Study progress and family notes stay privately
              on this device.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsResetModalOpen(true)}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-[#E7E2D8] bg-white px-4 py-2 text-sm font-semibold text-[#475569] transition-colors hover:border-[#EAD9B7] hover:bg-[#FFFBF0] hover:text-[#B45309]"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset Progress
          </button>
        </div>
      </footer>

      <ResetProgressModal
        isOpen={isResetModalOpen}
        completedDaysCount={overall.completedDaysCount}
        readScripturesCount={overall.readScripturesCount}
        notesWrittenCount={overall.notesWrittenCount}
        onCancel={() => setIsResetModalOpen(false)}
        onConfirm={handleConfirmReset}
      />

      <OfflineIndicator />
    </div>
  );
};

export default App;
