import { CURRICULUM } from '../data/curriculum';
import type {
  DayLesson,
  DayProgressSummary,
  DayProgressionStatus,
  NextFocusTarget,
  OverallProgressSummary,
  StudyProgress,
} from '../types';

export const STORAGE_KEY = 'temple-prep-7-day-guide:v1';

export function clampDay(day: number, totalDays = 7): number {
  if (!Number.isFinite(day)) return 1;
  return Math.min(Math.max(Math.round(day), 1), Math.max(1, totalDays));
}

export function createInitialProgress(): StudyProgress {
  return {
    completedDays: {},
    readScriptures: {},
    notes: {},
    activeDay: 1,
    updatedAt: null,
  };
}

export function parseStoredProgress(
  raw: string | null,
  lessons: readonly DayLesson[] = CURRICULUM
): StudyProgress {
  if (!raw) return createInitialProgress();
  const totalDays = lessons.length;

  try {
    const parsed = JSON.parse(raw) as Partial<StudyProgress> | null;
    if (!parsed || typeof parsed !== 'object') {
      return createInitialProgress();
    }

    const readScriptures: Record<string, boolean> = {};
    if (parsed.readScriptures && typeof parsed.readScriptures === 'object') {
      for (const [key, value] of Object.entries(parsed.readScriptures)) {
        if (typeof key === 'string' && key.length > 0 && value === true) {
          readScriptures[key] = true;
        }
      }
    }

    const completedDays: Record<number, boolean> = {};
    if (parsed.completedDays && typeof parsed.completedDays === 'object') {
      for (const [key, value] of Object.entries(parsed.completedDays)) {
        const dayNum = Number(key);
        const lesson = lessons.find((item) => item.day === dayNum);
        const allRead =
          lesson !== undefined &&
          lesson.scriptures.every((s) => Boolean(readScriptures[s.id]));
        if (
          Number.isInteger(dayNum) &&
          dayNum >= 1 &&
          dayNum <= totalDays &&
          value === true &&
          allRead
        ) {
          completedDays[dayNum] = true;
        }
      }
    }

    const notes: Record<number, string> = {};
    if (parsed.notes && typeof parsed.notes === 'object') {
      for (const [key, value] of Object.entries(parsed.notes)) {
        const dayNum = Number(key);
        if (
          Number.isInteger(dayNum) &&
          dayNum >= 1 &&
          dayNum <= totalDays &&
          typeof value === 'string'
        ) {
          notes[dayNum] = value;
        }
      }
    }

    const activeDay =
      typeof parsed.activeDay === 'number'
        ? clampDay(parsed.activeDay, totalDays)
        : 1;

    const updatedAt =
      typeof parsed.updatedAt === 'string' ? parsed.updatedAt : null;

    return {
      completedDays,
      readScriptures,
      notes,
      activeDay,
      updatedAt,
    };
  } catch {
    return createInitialProgress();
  }
}

export function canCompleteDay(
  lesson: DayLesson,
  progress: StudyProgress
): boolean {
  return (
    lesson.scriptures.length > 0 &&
    lesson.scriptures.every((scripture) =>
      Boolean(progress.readScriptures[scripture.id])
    )
  );
}

export function toggleDayCompletion(
  progress: StudyProgress,
  dayNumber: number,
  nowIso = new Date().toISOString(),
  lessons: readonly DayLesson[] = CURRICULUM
): StudyProgress {
  const nextCompleted = { ...progress.completedDays };
  if (nextCompleted[dayNumber]) {
    delete nextCompleted[dayNumber];
  } else {
    const lesson = lessons.find((item) => item.day === dayNumber);
    if (!lesson || !canCompleteDay(lesson, progress)) {
      return progress;
    }
    nextCompleted[dayNumber] = true;
  }

  return {
    ...progress,
    completedDays: nextCompleted,
    updatedAt: nowIso,
  };
}

export function toggleScriptureRead(
  progress: StudyProgress,
  scriptureId: string,
  nowIso = new Date().toISOString(),
  lessons: readonly DayLesson[] = CURRICULUM
): StudyProgress {
  const nextRead = { ...progress.readScriptures };
  const nextCompleted = { ...progress.completedDays };

  if (nextRead[scriptureId]) {
    delete nextRead[scriptureId];
    // If this scripture belongs to a completed day, unmark the day as complete
    // so a day cannot remain completed with unread scriptures.
    const parentLesson = lessons.find((lesson) =>
      lesson.scriptures.some((item) => item.id === scriptureId)
    );
    if (parentLesson && nextCompleted[parentLesson.day]) {
      delete nextCompleted[parentLesson.day];
    }
  } else {
    nextRead[scriptureId] = true;
  }

  return {
    ...progress,
    completedDays: nextCompleted,
    readScriptures: nextRead,
    updatedAt: nowIso,
  };
}

export function updateDayNote(
  progress: StudyProgress,
  dayNumber: number,
  text: string,
  nowIso = new Date().toISOString()
): StudyProgress {
  const nextNotes = { ...progress.notes };
  if (text.length === 0) {
    delete nextNotes[dayNumber];
  } else {
    nextNotes[dayNumber] = text;
  }

  return {
    ...progress,
    notes: nextNotes,
    updatedAt: nowIso,
  };
}

export function selectActiveDay(
  progress: StudyProgress,
  dayNumber: number,
  totalDays = 7
): StudyProgress {
  return {
    ...progress,
    activeDay: clampDay(dayNumber, totalDays),
  };
}

export function computeDayProgress(
  lesson: DayLesson,
  progress: StudyProgress
): DayProgressSummary {
  const totalCount = lesson.scriptures.length;
  let readCount = 0;
  for (const item of lesson.scriptures) {
    if (progress.readScriptures[item.id]) {
      readCount += 1;
    }
  }
  const noteText = progress.notes[lesson.day] ?? '';

  return {
    day: lesson.day,
    isCompleted: Boolean(progress.completedDays[lesson.day]),
    readCount,
    totalCount,
    allScripturesRead: totalCount > 0 && readCount === totalCount,
    hasNote: noteText.trim().length > 0,
  };
}

export function computeOverallProgress(
  lessons: readonly DayLesson[],
  progress: StudyProgress
): OverallProgressSummary {
  const totalDays = lessons.length;
  let completedDaysCount = 0;
  let totalScriptures = 0;
  let readScripturesCount = 0;
  let notesWrittenCount = 0;

  for (const lesson of lessons) {
    if (progress.completedDays[lesson.day]) {
      completedDaysCount += 1;
    }
    if ((progress.notes[lesson.day] ?? '').trim().length > 0) {
      notesWrittenCount += 1;
    }
    for (const scripture of lesson.scriptures) {
      totalScriptures += 1;
      if (progress.readScriptures[scripture.id]) {
        readScripturesCount += 1;
      }
    }
  }

  const percentComplete =
    totalDays > 0 ? Math.round((completedDaysCount / totalDays) * 100) : 0;

  return {
    completedDaysCount,
    totalDays,
    percentComplete,
    readScripturesCount,
    totalScriptures,
    notesWrittenCount,
    allDaysComplete: totalDays > 0 && completedDaysCount === totalDays,
  };
}

/**
 * Determines the next section to focus when navigating to a partially complete
 * day. Returns null when the day is completely untouched or already completed.
 */
export function getNextFocusTarget(
  lesson: DayLesson,
  progress: StudyProgress
): NextFocusTarget | null {
  const summary = computeDayProgress(lesson, progress);

  // Completed or completely untouched days should start at the top.
  if (summary.isCompleted) return null;
  if (summary.readCount === 0 && !summary.hasNote) return null;

  // Priority 1: Focus the first unread scripture in order.
  const firstUnread = lesson.scriptures.find(
    (scripture) => !progress.readScriptures[scripture.id]
  );
  if (firstUnread) {
    return { type: 'scripture', scriptureId: firstUnread.id };
  }

  // Priority 2: All scriptures read, no family notes yet -> focus notes.
  if (!summary.hasNote) {
    return { type: 'notes', day: lesson.day };
  }

  // Priority 3: All scriptures read and notes written -> focus Mark Day Complete.
  return { type: 'complete', day: lesson.day };
}

/**
 * Returns the highest day number (1..7) that has any recorded progress
 * (completed day, at least one read scripture, or a saved family note).
 * Returns 0 if no progress has been recorded on any day.
 */
export function getHighestProgressedDay(
  lessons: readonly DayLesson[],
  progress: StudyProgress
): number {
  let highest = 0;
  for (const lesson of lessons) {
    const summary = computeDayProgress(lesson, progress);
    if (summary.isCompleted || summary.readCount > 0 || summary.hasNote) {
      highest = Math.max(highest, lesson.day);
    }
  }
  return highest;
}

/**
 * Classifies a day's progression state so incomplete or skipped scripture
 * sections are clearly surfaced in the day selector and study roadmap.
 */
export function getDayProgressionStatus(
  lesson: DayLesson,
  progress: StudyProgress,
  highestProgressedDay: number
): DayProgressionStatus {
  const summary = computeDayProgress(lesson, progress);

  if (summary.isCompleted && summary.allScripturesRead) {
    return 'complete';
  }

  if (summary.readCount > 0 || summary.hasNote) {
    return 'in-progress';
  }

  if (lesson.day < highestProgressedDay) {
    return 'skipped';
  }

  return 'untouched';
}
