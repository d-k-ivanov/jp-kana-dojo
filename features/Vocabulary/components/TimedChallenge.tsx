'use client';

import React from 'react';
import useVocabStore, {
  type IVocabObj
} from '@/features/Vocabulary/store/useVocabStore';
import useStatsStore from '@/features/Progress/store/useStatsStore';
import TimedChallenge, {
  type TimedChallengeConfig
} from '@/shared/components/TimedChallenge';
import FuriganaText from '@/shared/components/FuriganaText';

export default function TimedChallengeVocab() {
  const selectedVocabObjs = useVocabStore(state => state.selectedVocabObjs);
  const selectedVocabSets = useVocabStore(state => state.selectedVocabSets);

  const {
    timedVocabCorrectAnswers,
    timedVocabWrongAnswers,
    timedVocabStreak,
    timedVocabBestStreak,
    incrementTimedVocabCorrectAnswers,
    incrementTimedVocabWrongAnswers,
    resetTimedVocabStats
  } = useStatsStore();

  const config: TimedChallengeConfig<IVocabObj> = {
    dojoType: 'vocabulary',
    dojoLabel: 'Vocabulary',
    localStorageKey: 'timedVocabChallengeDuration',
    goalTimerContext: 'Vocabulary Timed Challenge',
    items: selectedVocabObjs,
    selectedSets: selectedVocabSets,
    generateQuestion: items => items[Math.floor(Math.random() * items.length)],
    renderQuestion: question => (
      <FuriganaText text={question.word} reading={question.reading} />
    ),
    getAudioText: question => question.word,
    inputPlaceholder: 'Type the meaning...',
    modeDescription: 'Mode: Type (See Japanese word → Type meaning)',
    checkAnswer: (question, answer) =>
      question.meanings.some(
        meaning => answer.toLowerCase() === meaning.toLowerCase()
      ),
    getCorrectAnswer: question => question.meanings[0],
    // Pick mode support
    generateOptions: (question, items, count) => {
      const correctAnswer = question.meanings[0];
      const incorrectOptions = items
        .filter(item => item.word !== question.word)
        .sort(() => Math.random() - 0.5)
        .slice(0, count - 1)
        .map(item => item.meanings[0]);
      return [correctAnswer, ...incorrectOptions];
    },
    getCorrectOption: question => question.meanings[0],
    stats: {
      correct: timedVocabCorrectAnswers,
      wrong: timedVocabWrongAnswers,
      streak: timedVocabStreak,
      bestStreak: timedVocabBestStreak,
      incrementCorrect: incrementTimedVocabCorrectAnswers,
      incrementWrong: incrementTimedVocabWrongAnswers,
      reset: resetTimedVocabStats
    }
  };

  return <TimedChallenge config={config} />;
}
