function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-lg p-10 flex flex-col items-center gap-6">
        <h1 className="text-4xl font-bold text-yellow-400 tracking-tight">
          Pokemon Minigames
        </h1>
        <p className="text-gray-500 text-sm">Tailwind CSS 적용 테스트</p>
        <div className="flex gap-3">
          <span className="px-3 py-1 rounded-full bg-red-100 text-red-600 text-xs font-semibold">Fire</span>
          <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-600 text-xs font-semibold">Water</span>
          <span className="px-3 py-1 rounded-full bg-green-100 text-green-600 text-xs font-semibold">Grass</span>
        </div>
        <button className="mt-2 px-6 py-2 bg-yellow-400 hover:bg-yellow-500 text-white font-bold rounded-xl transition-colors cursor-pointer">
          시작하기
        </button>
      </div>
    </div>
  )
}

export default App
