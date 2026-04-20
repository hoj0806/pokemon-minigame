import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';

function PokeballLogo() {
  return (
    <svg width="88" height="88" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="40" cy="40" r="38" fill="#EE1515" />
      <path d="M2 40 A38 38 0 0 0 78 40 Z" fill="white" />
      <rect x="2" y="37" width="76" height="6" fill="#111827" />
      <circle cx="40" cy="40" r="12" fill="white" stroke="#111827" strokeWidth="5" />
      <circle cx="40" cy="40" r="5" fill="#e5e7eb" />
      <circle cx="40" cy="40" r="38" fill="none" stroke="#111827" strokeWidth="4" />
    </svg>
  );
}

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-57px)] gap-10 p-6">
      <motion.div
        initial={{ opacity: 0, y: -24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center gap-4"
      >
        <motion.div
          animate={{ rotate: [0, -8, 8, -8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 3 }}
        >
          <PokeballLogo />
        </motion.div>
        <div className="text-center">
          <h1 className="font-galmuri14 text-4xl text-[--color-brand] mb-2 drop-shadow-sm">
            Pokemon Minigames
          </h1>
          <p className="font-galmuri text-sm text-[--color-on-surface-muted]">
            포켓몬과 함께하는 미니게임 모음
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="flex flex-col gap-5 w-56"
      >
        {/* 미니게임 - 빨강 */}
        <button
          onClick={() => navigate('/game')}
          className="font-galmuri bg-[#EE1515] text-[#FFCB05] font-bold px-4 py-3 rounded-[--radius-sm]
                     border-2 border-[#111827]
                     shadow-[0_6px_0_0_#111827] active:shadow-[0_2px_0_0_#111827]
                     active:translate-y-1 transition-all duration-75 cursor-pointer"
        >
          미니게임
        </button>

        {/* 포켓몬 도감 - 파랑 */}
        <button
          onClick={() => navigate('/pokedex')}
          className="font-galmuri bg-[#1d4ed8] text-[#FFCB05] font-bold px-4 py-3 rounded-[--radius-sm]
                     border-2 border-[#111827]
                     shadow-[0_6px_0_0_#111827] active:shadow-[0_2px_0_0_#111827]
                     active:translate-y-1 transition-all duration-75 cursor-pointer"
        >
          포켓몬 도감
        </button>

        {/* 하이스코어 - 노랑 */}
        <button
          onClick={() => navigate('/highscore')}
          className="font-galmuri bg-[#FFCB05] text-[#111827] font-bold px-4 py-3 rounded-[--radius-sm]
                     border-2 border-[#111827]
                     shadow-[0_6px_0_0_#111827] active:shadow-[0_2px_0_0_#111827]
                     active:translate-y-1 transition-all duration-75 cursor-pointer"
        >
          하이스코어
        </button>
      </motion.div>
    </div>
  );
}
