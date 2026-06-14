import { describe, expect, it } from 'vitest';
import { getTypeQuizQuestion } from '@/domain/usecases/getTypeQuizQuestion';
import { getTypeChart } from '@/domain/entities/typeChart';

describe('getTypeQuizQuestion', () => {
  it('is deterministic: same seed and round produce identical questions', () => {
    const q1 = getTypeQuizQuestion(42, 0);
    const q2 = getTypeQuizQuestion(42, 0);
    expect(q1).toEqual(q2);
  });

  it('produces different questions for different rounds (not all identical for rounds 0–5)', () => {
    const questions = Array.from({ length: 6 }, (_, r) => getTypeQuizQuestion(42, r));
    const allSame = questions.every((q) => JSON.stringify(q) === JSON.stringify(questions[0]));
    expect(allSame).toBe(false);
  });

  it('property: seeds 1–200 round 0 → valid questions', () => {
    const chart = getTypeChart();
    for (let seed = 1; seed <= 200; seed++) {
      const q = getTypeQuizQuestion(seed, 0);

      // Exactly 4 choices
      expect(q.choices).toHaveLength(4);

      // All choices are unique
      const unique = new Set(q.choices);
      expect(unique.size).toBe(4);

      // correct is in choices
      expect(q.choices).toContain(q.correct);

      // correct is super-effective (≥2×)
      const correctMultiplier = q.defendingTypes.reduce(
        (acc, def) => acc * chart[q.correct][def],
        1,
      );
      expect(correctMultiplier).toBeGreaterThanOrEqual(2);

      // every other choice has multiplier < 2
      for (const choice of q.choices) {
        if (choice === q.correct) continue;
        const m = q.defendingTypes.reduce((acc, def) => acc * chart[choice][def], 1);
        expect(m).toBeLessThan(2);
      }

      // defender has 1 or 2 types
      expect(q.defendingTypes.length).toBeGreaterThanOrEqual(1);
      expect(q.defendingTypes.length).toBeLessThanOrEqual(2);

      // dual-type defenders must be distinct
      if (q.defendingTypes.length === 2) {
        expect(q.defendingTypes[0]).not.toBe(q.defendingTypes[1]);
      }
    }
  });
});
