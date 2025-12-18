'use client';

import React, { useRef, useEffect, useMemo } from 'react';
import clsx from 'clsx';
import {
  Heart,
  HeartCrack,
  Timer,
  X,
  Flame,
  CircleCheck,
  CircleX,
  SquareCheck,
  SquareX,
  MousePointerClick,
  Keyboard
} from 'lucide-react';
import { buttonBorderStyles, cardBorderStyles } from '@/shared/lib/styles';
import {
  DIFFICULTY_CONFIG,
  type GauntletDifficulty,
  type GauntletGameMode
} from './types';

interface ActiveGameProps<T> {
  // Progress
  currentIndex: number;
  totalQuestions: number;

  // Lives
  lives: number;
  maxLives: number;
  difficulty: GauntletDifficulty;
  lifeJustGained: boolean;
  lifeJustLost: boolean;

  // Time
  elapsedTime: number;

  // Question display
  currentQuestion: T | null;
  renderQuestion: (question: T, isReverse?: boolean) => React.ReactNode;
  isReverseActive: boolean;

  // Game mode
  gameMode: GauntletGameMode;
  inputPlaceholder: string;
  userAnswer: string;
  setUserAnswer: (answer: string) => void;
  onSubmit: (e?: React.FormEvent) => void;
  getCorrectAnswer: (question: T, isReverse?: boolean) => string;

  // Pick mode
  shuffledOptions: string[];
  wrongSelectedAnswers: string[];
  onOptionClick: (option: string) => void;
  renderOption?: (
    option: string,
    items: T[],
    isReverse?: boolean
  ) => React.ReactNode;
  items: T[];

  // Feedback
  lastAnswerCorrect: boolean | null;
  currentStreak: number;
  correctSinceLastRegen: number;
  regenThreshold: number;

  // Stats
  correctAnswers: number;
  wrongAnswers: number;

  // Actions
  onCancel: () => void;
}

// Format time as MM:SS
const formatElapsedTime = (ms: number): string => {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export default function ActiveGame<T>({
  currentIndex,
  totalQuestions,
  lives,
  maxLives,
  difficulty,
  elapsedTime,
  currentQuestion,
  renderQuestion,
  isReverseActive,
  gameMode,
  inputPlaceholder,
  userAnswer,
  setUserAnswer,
  onSubmit,
  getCorrectAnswer,
  shuffledOptions,
  wrongSelectedAnswers,
  onOptionClick,
  renderOption,
  items,
  lastAnswerCorrect,
  currentStreak,
  correctSinceLastRegen,
  regenThreshold,
  correctAnswers,
  wrongAnswers,
  onCancel
}: ActiveGameProps<T>) {
  const inputRef = useRef<HTMLInputElement>(null);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const progressPercent = Math.round((currentIndex / totalQuestions) * 100);
  const canRegenerate = DIFFICULTY_CONFIG[difficulty].regenerates;

  // Feedback elements - matching Classic's GameIntel style
  const feedback = useMemo(() => {
    if (lastAnswerCorrect === true) {
      return (
        <>
          <span>Correct </span>
          <CircleCheck className='inline text-[var(--main-color)]' />
        </>
      );
    }
    if (lastAnswerCorrect === false && currentQuestion) {
      return (
        <>
          <span>
            {gameMode === 'Pick'
              ? 'Try again '
              : `It was "${getCorrectAnswer(currentQuestion, isReverseActive)}" `}
          </span>
          <CircleX className='inline text-[var(--secondary-color)]' />
        </>
      );
    }
    return null;
  }, [
    lastAnswerCorrect,
    currentQuestion,
    gameMode,
    getCorrectAnswer,
    isReverseActive
  ]);

  // Focus input for Type mode
  useEffect(() => {
    if (gameMode === 'Type' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentQuestion, gameMode]);

  // Keyboard shortcuts for Pick mode (1, 2, 3 keys)
  useEffect(() => {
    if (gameMode !== 'Pick') return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const keyMap: Record<string, number> = {
        Digit1: 0,
        Digit2: 1,
        Digit3: 2,
        Numpad1: 0,
        Numpad2: 1,
        Numpad3: 2
      };
      const index = keyMap[event.code];
      if (index !== undefined && index < shuffledOptions.length) {
        buttonRefs.current[index]?.click();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameMode, shuffledOptions.length]);

  // Get game mode icon
  const ModeIcon = gameMode === 'Pick' ? MousePointerClick : Keyboard;

  return (
    <div
      className={clsx(
        'flex min-h-[100dvh] max-w-[100dvw] flex-col items-center gap-4 px-4 pt-4 sm:gap-10 md:pt-8'
      )}
    >
      {/* Top Bar - matching Classic's ReturnFromGame layout */}
      <div className='flex w-full flex-col md:w-2/3 lg:w-1/2'>
        {/* Row 1: Exit, Progress Bar, Lives */}
        <div className='flex w-full flex-row items-center justify-between gap-4 md:gap-6'>
          {/* Exit Button */}
          <button
            onClick={onCancel}
            className='text-[var(--border-color)] duration-250 hover:cursor-pointer hover:text-[var(--secondary-color)]'
          >
            <X size={32} />
          </button>

          {/* Progress Bar - using theme colors */}
          <div className='flex flex-1 flex-col gap-1'>
            <div className='h-3 w-full overflow-hidden rounded-full bg-[var(--card-color)]'>
              <div
                className='h-3 rounded-full bg-[var(--main-color)] transition-all duration-300'
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className='flex justify-between text-xs text-[var(--muted-color)]'>
              <span>
                {currentIndex + 1} / {totalQuestions}
              </span>
              <span>{progressPercent}%</span>
            </div>
          </div>

          {/* Lives Display - using theme colors */}
          <div className='flex items-center gap-1'>
            {Array.from({ length: maxLives }).map((_, i) => {
              const hasLife = i < lives;
              return (
                <div key={i}>
                  {hasLife ? (
                    <Heart
                      size={24}
                      className='fill-[var(--main-color)] text-[var(--main-color)]'
                    />
                  ) : (
                    <HeartCrack
                      size={24}
                      className='text-[var(--border-color)]'
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Row 2: Game mode, Timer, Stats - matching Classic layout */}
        <div className='flex w-full flex-row items-center py-2'>
          {/* Game mode indicator */}
          <p className='flex w-1/3 items-center justify-start gap-1 text-lg sm:gap-2 sm:pl-1'>
            <ModeIcon className='text-[var(--main-color)]' size={20} />
            <span className='text-[var(--secondary-color)]'>{gameMode}</span>
          </p>

          {/* Timer */}
          <div className='flex w-1/3 items-center justify-center gap-2'>
            <Timer className='text-[var(--main-color)]' size={18} />
            <span className='font-mono text-[var(--secondary-color)]'>
              {formatElapsedTime(elapsedTime)}
            </span>
          </div>

          {/* Stats display - matching Classic's StatItem style */}
          <div className='flex w-1/3 flex-row items-center justify-end gap-1.5 py-2 text-[var(--secondary-color)] sm:gap-2 md:gap-3'>
            <p className='flex flex-row items-center gap-1 text-xl'>
              <SquareCheck />
              <span>{correctAnswers}</span>
            </p>
            <p className='flex flex-row items-center gap-1 text-xl'>
              <SquareX />
              <span>{wrongAnswers}</span>
            </p>
            <p className='flex flex-row items-center gap-1 text-xl'>
              <Flame />
              <span>{currentStreak}</span>
            </p>
          </div>
        </div>

        {/* Life Regen Progress (Normal mode only) */}
        {canRegenerate && lives < maxLives && (
          <div
            className={clsx(
              'flex items-center gap-2 rounded-lg p-2',
              cardBorderStyles
            )}
          >
            <Heart size={14} className='text-[var(--main-color)]' />
            <div className='h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--card-color)]'>
              <div
                className='h-full bg-[var(--main-color)] transition-all duration-300'
                style={{
                  width: `${(correctSinceLastRegen / regenThreshold) * 100}%`
                }}
              />
            </div>
            <span className='text-xs text-[var(--muted-color)]'>
              +1 in {regenThreshold - correctSinceLastRegen}
            </span>
          </div>
        )}
      </div>

      {/* Feedback - matching Classic's GameIntel style */}
      {feedback && (
        <p className='flex items-center justify-center gap-1.5 text-xl text-[var(--secondary-color)]'>
          {feedback}
        </p>
      )}

      {/* Question Display - matching Classic's character display */}
      <div className='flex flex-row items-center gap-1'>
        <p className='text-8xl font-medium sm:text-9xl'>
          {currentQuestion && renderQuestion(currentQuestion, isReverseActive)}
        </p>
      </div>

      {/* Answer Area - matching Classic's button styles */}
      <div className='flex w-full flex-col items-center gap-5 sm:w-4/5 sm:justify-evenly sm:gap-0'>
        {gameMode === 'Type' ? (
          <form
            onSubmit={onSubmit}
            className='flex w-full max-w-lg flex-col items-center gap-4'
          >
            <input
              ref={inputRef}
              type='text'
              value={userAnswer}
              onChange={e => setUserAnswer(e.target.value)}
              placeholder={inputPlaceholder}
              className={clsx(
                'w-full text-center text-2xl lg:text-4xl',
                'border-b-2 bg-transparent pb-2 outline-none',
                'text-[var(--secondary-color)]',
                'border-[var(--border-color)] focus:border-[var(--main-color)]'
              )}
              autoComplete='off'
              autoCorrect='off'
              autoCapitalize='off'
              spellCheck='false'
            />
            <button
              type='submit'
              disabled={!userAnswer.trim()}
              className={clsx(
                'flex h-12 w-full flex-row items-center justify-center gap-2 px-6',
                'rounded-2xl transition-colors duration-200',
                'border-b-6 font-medium shadow-sm',
                userAnswer.trim()
                  ? 'border-[var(--main-color-accent)] bg-[var(--main-color)] text-[var(--background-color)] hover:cursor-pointer'
                  : 'cursor-not-allowed border-[var(--border-color)] bg-[var(--card-color)] text-[var(--border-color)]'
              )}
            >
              Submit
            </button>
          </form>
        ) : (
          /* Pick mode buttons - matching Classic's Pick.tsx exactly */
          <div className='flex w-full flex-row flex-wrap justify-evenly gap-5 sm:gap-0'>
            {shuffledOptions.map((option, i) => {
              const isWrong = wrongSelectedAnswers.includes(option);
              return (
                <button
                  ref={elem => {
                    buttonRefs.current[i] = elem;
                  }}
                  key={option + i}
                  type='button'
                  disabled={isWrong}
                  className={clsx(
                    'relative flex w-full flex-row items-center justify-center gap-1 pt-3 pb-6 text-5xl font-semibold sm:w-1/5',
                    buttonBorderStyles,
                    'border-b-4',
                    isWrong &&
                      'border-[var(--border-color)] text-[var(--border-color)] hover:border-[var(--border-color)] hover:bg-[var(--card-color)]',
                    !isWrong &&
                      'border-[var(--secondary-color)]/50 text-[var(--secondary-color)] hover:border-[var(--secondary-color)]'
                  )}
                  onClick={() => onOptionClick(option)}
                  lang={isReverseActive ? 'ja' : undefined}
                >
                  <span>
                    {renderOption
                      ? renderOption(option, items, isReverseActive)
                      : option}
                  </span>
                  <span
                    className={clsx(
                      'absolute top-1/2 right-4 hidden h-5 min-w-5 -translate-y-1/2 items-center justify-center rounded-full bg-[var(--border-color)] px-1 text-xs leading-none lg:inline-flex',
                      isWrong
                        ? 'text-[var(--border-color)]'
                        : 'text-[var(--secondary-color)]'
                    )}
                  >
                    {i + 1}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
