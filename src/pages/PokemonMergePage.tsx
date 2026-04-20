import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePokedexStore } from '../store/pokedexStore';
import { useMergeGame, CANVAS_WIDTH, CANVAS_HEIGHT } from '../hooks/useMergeGame';
import { HighScoreTable } from '../components/game/HighScoreTable';
import { NameInputModal } from '../components/game/NameInputModal';
import { NextPreview } from '../components/merge/NextPreview';
import { MERGE_CHAIN } from '../utils/mergeChain';
import { getHighScores, isTop5, addHighScore, getRank } from '../utils/highScore';
import type { PokemonDex } from '../types/pokemon';

const HIGH_SCORE_KEY = 'highScore:merge';

export default function PokemonMergePage() {
  const navigate = useNavigate();
  const pokemons = usePokedexStore((s) => s.data);
  const loadGen1 = usePokedexStore((s) => s.loadGen1);
  const isLoading = usePokedexStore((s) => s.isLoading);

  useEffect(() => {
    loadGen1();
  }, [loadGen1]);

  const pokemonMap = new Map<number, PokemonDex>();
  pokemons.forEach((p) => pokemonMap.set(p.id, p));

  const {
    phase,
    score,
    finalScore,
    nextIndex,
    previewIndex,
    canvasRef,
    start,
    drop,
    setDropperX,
    moveDropper,
  } = useMergeGame({ pokemonMap });

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [nameSaved, setNameSaved] = useState(false);

  const chainComplete = MERGE_CHAIN.every((entry) => pokemonMap.has(entry.pokemonId));

  const getCanvasX = (clientX: number): number => {
    const canvas = canvasRef.current;
    if (!canvas) return CANVAS_WIDTH / 2;
    const rect = canvas.getBoundingClientRect();
    const scale = CANVAS_WIDTH / rect.width;
    return (clientX - rect.left) * scale;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    setDropperX(getCanvasX(e.clientX));
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const t = e.touches[0];
    if (!t) return;
    setDropperX(getCanvasX(t.clientX));
  };

  const handleCanvasClick = () => {
    drop();
  };

  const qualifiesForHighScore = phase === 'result' && isTop5(HIGH_SCORE_KEY, finalScore);
  const showNameModal = qualifiesForHighScore && !nameSaved;
  const scoresSaved = phase === 'result' && (nameSaved || !qualifiesForHighScore);

  const handleNameSubmit = (name: string) => {
    addHighScore(HIGH_SCORE_KEY, {
      name,
      score: finalScore,
      playedAt: new Date().toISOString(),
    });
    setNameSaved(true);
  };

  const handleModalClose = () => setNameSaved(true);

  const handleRestart = () => {
    setNameSaved(false);
    start();
  };

  if (phase === 'result') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100dvh-57px)] gap-6 p-6">
        {showNameModal && (
          <NameInputModal rank={getRank(HIGH_SCORE_KEY, finalScore)} onSubmit={handleNameSubmit} onClose={handleModalClose} />
        )}

        <div className="text-center">
          <p className="font-galmuri text-sm text-[--color-on-surface-muted] mb-1">
            포켓몬 머지
          </p>
          <h1 className="font-galmuri text-2xl font-bold text-[--color-on-surface]">
            게임 종료!
          </h1>
        </div>

        <div className="flex flex-col items-center gap-1">
          <span className="font-galmuri text-sm text-[--color-on-surface-muted]">
            최종 점수
          </span>
          <span className="font-galmuri text-5xl font-bold text-game-score tabular-nums">
            {finalScore.toLocaleString()}
          </span>
        </div>

        <div className="w-full max-w-sm rounded-[--radius-card] bg-[#BFDBFE] border-2 border-[#111827] shadow-[0_6px_0_0_#111827] p-4">
          <p className="font-galmuri text-sm font-bold text-[--color-on-surface] mb-3">
            하이스코어
          </p>
          {scoresSaved ? (
            <HighScoreTable entries={getHighScores(HIGH_SCORE_KEY)} />
          ) : (
            <p className="font-galmuri text-xs text-[--color-on-surface-muted] text-center py-2">
              저장 중...
            </p>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleRestart}
            className="font-galmuri bg-[#EE1515] text-[#FFCB05] font-bold px-6 py-2 rounded-[--radius-sm] border-2 border-[#111827] shadow-[0_4px_0_0_#111827] active:shadow-[0_1px_0_0_#111827] active:translate-y-[3px] transition-all duration-75 cursor-pointer"
          >
            다시하기
          </button>
          <button
            onClick={() => navigate('/game')}
            className="font-galmuri bg-[#FFCB05] text-[#111827] font-bold px-6 py-2 rounded-[--radius-sm] border-2 border-[#111827] shadow-[0_4px_0_0_#111827] active:shadow-[0_1px_0_0_#111827] active:translate-y-[3px] transition-all duration-75 cursor-pointer"
          >
            게임 선택
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'idle') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100dvh-57px)] gap-8 p-6">
        <div className="text-center">
          <h1 className="font-galmuri text-2xl font-bold text-[--color-on-surface] mb-2">
            포켓몬 머지
          </h1>
          <p className="font-galmuri text-sm text-[--color-on-surface-muted] max-w-xs">
            같은 포켓몬끼리 닿으면 더 큰 포켓몬으로 진화합니다.
            <br />
            데드라인을 넘어서면 게임 종료!
          </p>
        </div>

        <button
          type="button"
          onClick={start}
          disabled={isLoading || !chainComplete}
          className="bg-brand hover:bg-brand-dark disabled:opacity-40 disabled:cursor-not-allowed text-white font-galmuri font-semibold px-8 py-3 rounded-[--radius-sm] transition-colors"
        >
          {isLoading ? '포켓몬 불러오는 중...' : '게임 시작'}
        </button>

        <button
          onClick={() => navigate('/game')}
          className="text-sm text-[--color-on-surface-muted] hover:text-[--color-on-surface] transition-colors"
        >
          ← 게임 선택으로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative flex flex-col items-center min-h-[calc(100dvh-57px)] p-3 gap-3"
    >
      <div className="w-full max-w-[540px] flex items-center justify-between px-1">
        <div>
          <p className="font-galmuri text-xs text-[--color-on-surface-muted]">SCORE</p>
          <p className="font-galmuri text-3xl font-bold text-game-score tabular-nums">
            {score.toLocaleString()}
          </p>
        </div>
        <div className="flex gap-3">
          <NextPreview chainIndex={nextIndex} label="NOW" />
          <NextPreview chainIndex={previewIndex} label="NEXT" />
        </div>
        <button
          onClick={() => navigate('/game')}
          className="text-xs text-[--color-on-surface-muted] hover:text-[--color-on-surface] font-galmuri transition-colors"
        >
          포기
        </button>
      </div>

      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        onPointerMove={handlePointerMove}
        onTouchMove={handleTouchMove}
        onClick={handleCanvasClick}
        className="w-full max-w-[420px] aspect-[3/4] rounded-[--radius-card] bg-[--color-surface-raised] border border-[--color-border] shadow-[--shadow-card] touch-none cursor-pointer"
      />

      <div className="flex gap-2 items-center">
        <button
          onClick={() => moveDropper(-20)}
          className="bg-[--color-surface-raised] border border-[--color-border] text-[--color-on-surface] font-galmuri px-4 py-2 rounded-[--radius-sm]"
        >
          ←
        </button>
        <button
          onClick={drop}
          className="bg-brand hover:bg-brand-dark text-white font-galmuri font-semibold px-6 py-2 rounded-[--radius-sm] transition-colors"
        >
          떨어뜨리기
        </button>
        <button
          onClick={() => moveDropper(20)}
          className="bg-[--color-surface-raised] border border-[--color-border] text-[--color-on-surface] font-galmuri px-4 py-2 rounded-[--radius-sm]"
        >
          →
        </button>
      </div>

      <p className="font-galmuri text-[10px] text-[--color-on-surface-muted] text-center">
        ← → 이동 · Space / Enter 드롭 · 캔버스 클릭으로도 드롭 가능
      </p>
    </div>
  );
}
