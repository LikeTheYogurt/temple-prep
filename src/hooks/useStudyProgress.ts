import { useCallback, useEffect, useState } from 'react';
import { CURRICULUM } from '../data/curriculum';
import type { StudyProgress } from '../types';
import {
  STORAGE_KEY,
  createInitialProgress,
  parseStoredProgress,
  selectActiveDay,
  toggleDayCompletion,
  toggleScriptureRead,
  updateDayNote,
} from '../utils/progress';

function loadFromStorage(): StudyProgress {
  if (typeof window === 'undefined') return createInitialProgress();
  try {
    return parseStoredProgress(
      window.localStorage.getItem(STORAGE_KEY),
      CURRICULUM
    );
  } catch {
    return createInitialProgress();
  }
}

export function useStudyProgress() {
  const [progress, setProgress] = useState<StudyProgress>(() =>
    loadFromStorage()
  );
  const [noteSavedAt, setNoteSavedAt] = useState<number | null>(null);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {
      // Ignore storage quota or private-mode errors gracefully
    }
  }, [progress]);

  const setActiveDay = useCallback((day: number) => {
    setProgress((prev) => selectActiveDay(prev, day, CURRICULUM.length));
  }, []);

  const onToggleDayComplete = useCallback((day: number) => {
    setProgress((prev) => toggleDayCompletion(prev, day));
  }, []);

  const onToggleScriptureRead = useCallback((scriptureId: string) => {
    setProgress((prev) => toggleScriptureRead(prev, scriptureId));
  }, []);

  const onUpdateNote = useCallback((day: number, text: string) => {
    setProgress((prev) => updateDayNote(prev, day, text));
    setNoteSavedAt(Date.now());
  }, []);

  const onResetProgress = useCallback(() => {
    const fresh = createInitialProgress();
    setProgress(fresh);
    setNoteSavedAt(null);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore storage errors
    }
  }, []);

  return {
    progress,
    noteSavedAt,
    setActiveDay,
    onToggleDayComplete,
    onToggleScriptureRead,
    onUpdateNote,
    onResetProgress,
  };
}
