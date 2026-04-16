import { useNavigate } from 'react-router-dom';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-57px)] gap-6">
      <h1 className="font-galmuri14 text-4xl text-primary">404</h1>
      <p className="font-galmuri11 text-text-secondary">페이지를 찾을 수 없습니다.</p>
      <button
        onClick={() => navigate('/')}
        className="font-galmuri11 px-6 py-2 bg-primary text-white rounded-xl"
      >
        홈으로
      </button>
    </div>
  );
}
