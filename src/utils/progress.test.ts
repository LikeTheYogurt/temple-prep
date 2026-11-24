import test from 'node:test';
import assert from 'node:assert/strict';
import { CURRICULUM } from '../data/curriculum';
import {
  canCompleteDay,
  clampDay,
  computeDayProgress,
  computeOverallProgress,
  createInitialProgress,
  getDayProgressionStatus,
  getHighestProgressedDay,
  getNextFocusTarget,
  parseStoredProgress,
  selectActiveDay,
  toggleDayCompletion,
  toggleScriptureRead,
  updateDayNote,
} from './progress';

function markAllScripturesReadForDay(
  state: ReturnType<typeof createInitialProgress>,
  dayNumber: number
) {
  const lesson = CURRICULUM[dayNumber - 1];
  let next = state;
  for (const s of lesson.scriptures) {
    if (!next.readScriptures[s.id]) {
      next = toggleScriptureRead(next, s.id);
    }
  }
  return next;
}

test('curriculum contains exactly 7 days and 22 unique scriptures with historical context', () => {
  assert.equal(CURRICULUM.length, 7);
  const totalScriptures = CURRICULUM.reduce(
    (sum, day) => sum + day.scriptures.length,
    0
  );
  assert.equal(totalScriptures, 22);

  const seenIds = new Set<string>();
  for (let i = 0; i < CURRICULUM.length; i += 1) {
    assert.equal(CURRICULUM[i].day, i + 1);
    assert.ok(CURRICULUM[i].title.length > 0);
    assert.ok(CURRICULUM[i].coreFocus.length > 0);
    assert.ok(CURRICULUM[i].nightlyActivity.length > 0);
    for (const s of CURRICULUM[i].scriptures) {
      assert.equal(seenIds.has(s.id), false, `Duplicate scripture ID: ${s.id}`);
      seenIds.add(s.id);
      assert.ok(s.reference.length > 0);
      assert.ok(s.messageSummary.length > 0);
      assert.ok(s.historicalContext.length > 20);
    }
  }

  const day3 = CURRICULUM[2];
  assert.equal(
    day3.title,
    'The Recommend, Wholehearted Obedience & Daily Repentance'
  );
  assert.deepEqual(
    day3.scriptures.map((s) => s.reference),
    [
      'James 2:10',
      'Psalm 24:3–4',
      '3 Nephi 18:7, 11',
      'Doctrine and Covenants 58:42–43',
    ]
  );
});

test('cannot mark a day complete while any scripture is unread', () => {
  let state = createInitialProgress();
  assert.equal(canCompleteDay(CURRICULUM[0], state), false);

  // Attempt with 0 read -> blocked
  state = toggleDayCompletion(state, 1);
  assert.equal(Boolean(state.completedDays[1]), false);

  // Attempt with 2 of 3 read -> still blocked
  state = toggleScriptureRead(state, CURRICULUM[0].scriptures[0].id);
  state = toggleScriptureRead(state, CURRICULUM[0].scriptures[1].id);
  assert.equal(canCompleteDay(CURRICULUM[0], state), false);
  state = toggleDayCompletion(state, 1);
  assert.equal(Boolean(state.completedDays[1]), false);

  // Mark 3rd scripture read -> now allowed
  state = toggleScriptureRead(state, CURRICULUM[0].scriptures[2].id);
  assert.equal(canCompleteDay(CURRICULUM[0], state), true);
  state = toggleDayCompletion(state, 1);
  assert.equal(state.completedDays[1], true);

  // Unchecking a scripture on a completed day automatically unmarks completion
  state = toggleScriptureRead(state, CURRICULUM[0].scriptures[1].id);
  assert.equal(Boolean(state.completedDays[1]), false);
});

test('toggling day completion updates counts and overall percentage once scriptures are read', () => {
  let state = createInitialProgress();
  assert.equal(computeOverallProgress(CURRICULUM, state).percentComplete, 0);

  for (const d of [1, 2, 3]) {
    state = markAllScripturesReadForDay(state, d);
    state = toggleDayCompletion(state, d, '2026-05-01T12:00:00.000Z');
  }

  const summary = computeOverallProgress(CURRICULUM, state);
  assert.equal(summary.completedDaysCount, 3);
  assert.equal(summary.totalDays, 7);
  assert.equal(summary.percentComplete, 43);
  assert.equal(summary.allDaysComplete, false);

  // Toggling Day 2 again unmarks it
  state = toggleDayCompletion(state, 2);
  assert.equal(computeOverallProgress(CURRICULUM, state).completedDaysCount, 2);
});

test('marking all 7 days sets allDaysComplete to true and 100%', () => {
  let state = createInitialProgress();
  for (let d = 1; d <= 7; d += 1) {
    state = markAllScripturesReadForDay(state, d);
    state = toggleDayCompletion(state, d);
  }
  const summary = computeOverallProgress(CURRICULUM, state);
  assert.equal(summary.completedDaysCount, 7);
  assert.equal(summary.percentComplete, 100);
  assert.equal(summary.allDaysComplete, true);
});

test('toggling scripture read tracks per-day and overall scripture tallies', () => {
  let state = createInitialProgress();
  const day1 = CURRICULUM[0];

  state = toggleScriptureRead(state, day1.scriptures[0].id);
  let daySummary = computeDayProgress(day1, state);
  assert.equal(daySummary.readCount, 1);
  assert.equal(daySummary.totalCount, 3);
  assert.equal(daySummary.allScripturesRead, false);

  state = toggleScriptureRead(state, day1.scriptures[1].id);
  state = toggleScriptureRead(state, day1.scriptures[2].id);
  daySummary = computeDayProgress(day1, state);
  assert.equal(daySummary.readCount, 3);
  assert.equal(daySummary.allScripturesRead, true);

  const overall = computeOverallProgress(CURRICULUM, state);
  assert.equal(overall.readScripturesCount, 3);
  assert.equal(overall.totalScriptures, 22);
});

test('updating family notes saves and clears cleanly', () => {
  let state = createInitialProgress();
  state = updateDayNote(state, 4, 'We talked about God’s justice and mercy.');
  assert.equal(state.notes[4], 'We talked about God’s justice and mercy.');
  assert.equal(computeDayProgress(CURRICULUM[3], state).hasNote, true);
  assert.equal(computeOverallProgress(CURRICULUM, state).notesWrittenCount, 1);

  state = updateDayNote(state, 4, '');
  assert.equal(state.notes[4], undefined);
  assert.equal(computeDayProgress(CURRICULUM[3], state).hasNote, false);
});

test('clampDay and selectActiveDay keep day index within 1..7', () => {
  assert.equal(clampDay(0), 1);
  assert.equal(clampDay(-5), 1);
  assert.equal(clampDay(99), 7);
  assert.equal(clampDay(Number.NaN), 1);

  let state = createInitialProgress();
  state = selectActiveDay(state, 5);
  assert.equal(state.activeDay, 5);
  state = selectActiveDay(state, 10);
  assert.equal(state.activeDay, 7);
});

test('parseStoredProgress recovers safely and clears completed days with unread scriptures', () => {
  assert.deepEqual(parseStoredProgress(null), createInitialProgress());
  assert.deepEqual(parseStoredProgress('{not-valid-json'), createInitialProgress());

  const valid = JSON.stringify({
    completedDays: { 1: true, 2: true, 99: true },
    readScriptures: {
      'day-1-exodus-25-8': true,
      'day-1-moroni-10-4-5': true,
      'day-1-dc-8-2-3': true,
      // Day 2 only has 1 of 3 scriptures read -> should NOT remain marked complete
      'day-2-dc-82-10': true,
      '': true,
    },
    notes: { 1: 'Felt peaceful', 10: 'Out of bounds' },
    activeDay: 3,
    updatedAt: '2026-05-01T12:00:00.000Z',
  });
  const parsed = parseStoredProgress(valid);
  assert.deepEqual(parsed.completedDays, { 1: true });
  assert.deepEqual(parsed.readScriptures, {
    'day-1-exodus-25-8': true,
    'day-1-moroni-10-4-5': true,
    'day-1-dc-8-2-3': true,
    'day-2-dc-82-10': true,
  });
  assert.deepEqual(parsed.notes, { 1: 'Felt peaceful' });
  assert.equal(parsed.activeDay, 3);
});

test('getNextFocusTarget returns null for untouched or completed days', () => {
  const day1 = CURRICULUM[0];
  let state = createInitialProgress();
  assert.equal(getNextFocusTarget(day1, state), null);

  state = markAllScripturesReadForDay(state, 1);
  state = toggleDayCompletion(state, 1);
  assert.equal(getNextFocusTarget(day1, state), null);
});

test('getNextFocusTarget focuses the first unread scripture on a partially complete day', () => {
  const day1 = CURRICULUM[0];
  let state = createInitialProgress();

  // Scripture 1 read, Scriptures 2 & 3 unread -> focuses Scripture 2
  state = toggleScriptureRead(state, day1.scriptures[0].id);
  assert.deepEqual(getNextFocusTarget(day1, state), {
    type: 'scripture',
    scriptureId: day1.scriptures[1].id,
  });

  // Even if Scripture 3 is also read while Scripture 2 is still unread -> focuses Scripture 2
  state = toggleScriptureRead(state, day1.scriptures[2].id);
  assert.deepEqual(getNextFocusTarget(day1, state), {
    type: 'scripture',
    scriptureId: day1.scriptures[1].id,
  });
});

test('getNextFocusTarget progresses to notes then complete once all scriptures are read', () => {
  const day1 = CURRICULUM[0];
  let state = createInitialProgress();

  state = markAllScripturesReadForDay(state, 1);
  assert.deepEqual(getNextFocusTarget(day1, state), {
    type: 'notes',
    day: 1,
  });

  state = updateDayNote(state, 1, 'Great family discussion tonight.');
  assert.deepEqual(getNextFocusTarget(day1, state), {
    type: 'complete',
    day: 1,
  });
});

test('getNextFocusTarget focuses first scripture when a note exists but no scriptures are read', () => {
  const day1 = CURRICULUM[0];
  let state = createInitialProgress();
  state = updateDayNote(state, 1, 'Started preparing questions');
  assert.deepEqual(getNextFocusTarget(day1, state), {
    type: 'scripture',
    scriptureId: day1.scriptures[0].id,
  });
});

test('getHighestProgressedDay and getDayProgressionStatus flag skipped and in-progress days', () => {
  let state = createInitialProgress();
  assert.equal(getHighestProgressedDay(CURRICULUM, state), 0);
  assert.equal(getDayProgressionStatus(CURRICULUM[0], state, 0), 'untouched');

  // Day 1: Complete with all 3 scriptures read -> 'complete'
  state = markAllScripturesReadForDay(state, 1);
  state = toggleDayCompletion(state, 1);

  // Day 2: 1 of 3 scriptures read -> 'in-progress'
  state = toggleScriptureRead(state, CURRICULUM[1].scriptures[0].id);

  // Day 3: Left completely untouched while Day 4 has progress -> 'skipped'
  // Day 4: 2 of 4 scriptures read -> 'in-progress'
  state = toggleScriptureRead(state, CURRICULUM[3].scriptures[0].id);
  state = toggleScriptureRead(state, CURRICULUM[3].scriptures[1].id);

  const highest = getHighestProgressedDay(CURRICULUM, state);
  assert.equal(highest, 4);

  assert.equal(getDayProgressionStatus(CURRICULUM[0], state, highest), 'complete');
  assert.equal(getDayProgressionStatus(CURRICULUM[1], state, highest), 'in-progress');
  assert.equal(getDayProgressionStatus(CURRICULUM[2], state, highest), 'skipped');
  assert.equal(getDayProgressionStatus(CURRICULUM[3], state, highest), 'in-progress');
  assert.equal(getDayProgressionStatus(CURRICULUM[4], state, highest), 'untouched');
});
