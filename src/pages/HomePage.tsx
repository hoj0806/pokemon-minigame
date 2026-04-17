import { useNavigate } from 'react-router-dom';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-57px)] gap-8 p-6">
      <div className="text-center">
        <h1 className="font-galmuri14 text-4xl text-[--color-brand] mb-2">Pokemon Minigames</h1>
        <p className="font-galmuri text-sm text-[--color-on-surface-muted]">
          포켓몬과 함께하는 미니게임 모음
        </p>
      </div>

      <div className="flex flex-col gap-3 w-52">
        <button
          onClick={() => navigate('/game')}
          className="font-galmuri bg-[--color-brand] hover:bg-[--color-brand-dark] text-white font-semibold px-4 py-3 rounded-[--radius-sm] transition-colors"
        >
          미니게임
        </button>
        <button
          onClick={() => navigate('/pokedex')}
          className="font-galmuri bg-[--color-brand] hover:bg-[--color-brand-dark] text-white font-semibold px-4 py-3 rounded-[--radius-sm] transition-colors"
        >
          포켓몬 도감
        </button>
        <button
          onClick={() => navigate('/highscore')}
          className="font-galmuri border border-[--color-border] text-[--color-on-surface] font-semibold px-4 py-3 rounded-[--radius-sm] hover:bg-[--color-surface-raised] transition-colors"
        >
          하이스코어
        </button>
      </div>
    </div>
  );
}
