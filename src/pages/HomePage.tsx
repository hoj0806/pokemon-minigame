import { useNavigate } from 'react-router-dom';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-57px)] gap-8">
      <h1 className="font-galmuri14 text-4xl text-primary">Pokemon Minigames</h1>
      <div className="flex flex-col gap-3 w-48">
        <button
          onClick={() => navigate('/game')}
          className="font-galmuri11 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl transition-colors"
        >
          게임 시작
        </button>
        <button
          onClick={() => navigate('/pokedex')}
          className="font-galmuri11 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl transition-colors"
        >
          포켓몬 도감
        </button>
        <button
          onClick={() => navigate('/highscore')}
          className="font-galmuri11 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl transition-colors"
        >
          하이스코어
        </button>
      </div>
    </div>
  );
}
