function App() {
  return (
    <div className='min-h-screen bg-gray-100 flex items-center justify-center'>
      <div className='bg-white rounded-2xl shadow-lg p-10 flex flex-col items-center gap-6'>
        <h1 className='font-galmuri14 text-4xl text-yellow-400'>
          Pokemon Minigames
        </h1>

        <div className='flex flex-col gap-2 items-center'>
          <p className='font-galmuri text-base text-gray-700'>
            Galmuri11 — 포켓몬 미니게임
          </p>
        </div>

        <div className='flex gap-3'>
          <span className='font-galmuri11 px-3 py-1 rounded-full bg-red-100 text-red-600 text-xs'>
            불꽃
          </span>
          <span className='font-galmuri11 px-3 py-1 rounded-full bg-blue-100 text-blue-600 text-xs'>
            물
          </span>
          <span className='font-galmuri11 px-3 py-1 rounded-full bg-green-100 text-green-600 text-xs'>
            풀
          </span>
        </div>

        <button className='font-galmuri11 mt-2 px-6 py-2 bg-yellow-400 hover:bg-yellow-500 text-white rounded-xl transition-colors cursor-pointer'>
          시작하기
        </button>
      </div>
    </div>
  );
}

export default App;
