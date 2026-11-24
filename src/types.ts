export interface ScriptureItem {
  id: string;
  reference: string;
  eraOrSetting: string;
  messageSummary: string;
  historicalContext: string;
}

export interface DayLesson {
  day: number;
  title: string;
  shortLabel: string;
  coreFocus: string;
  nightlyActivity: string;
  scriptures: ScriptureItem[];
}

export interface StudyProgress {
  completedDays: Record<number, boolean>;
  readScriptures: Record<string, boolean>;
  notes: Record<number, string>;
  activeDay: number;
  updatedAt: string | null;
}

export interface DayProgressSummary {
  day: number;
  isCompleted: boolean;
  readCount: number;
  totalCount: number;
  allScripturesRead: boolean;
  hasNote: boolean;
}

export interface OverallProgressSummary {
  completedDaysCount: number;
  totalDays: number;
  percentComplete: number;
  readScripturesCount: number;
  totalScriptures: number;
  notesWrittenCount: number;
  allDaysComplete: boolean;
}

export type NextFocusTarget =
  | { type: 'scripture'; scriptureId: string }
  | { type: 'notes'; day: number }
  | { type: 'complete'; day: number };

export type DayProgressionStatus =
  | 'complete'
  | 'in-progress'
  | 'skipped'
  | 'untouched';


