import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className='flex flex-col items-center justify-center min-h-[calc(100vh-57px)] gap-20 p-6'>
      <motion.div
        initial={{ opacity: 0, y: -24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className='-mt-16 pb-32'
      >
        <h1 className='font-galmuri cursor-pointer relative text-5xl md:text-7xl xl:text-9xl font-extrabold transform rotate-[-5deg] transition-transform duration-300 ease-out drop-shadow-[4px_4px_0px_rgba(0,0,0,0.6)] hover:scale-110 hover:rotate-0 hover:drop-shadow-[6px_6px_0px_rgba(0,0,0,0.8)]'>
          <span className='bg-gradient-to-br from-yellow-200 via-yellow-400 to-amber-500 bg-clip-text text-transparent'>
            Poke
          </span>
          <span className='bg-gradient-to-br from-red-400 to-red-600 bg-clip-text text-transparent'>
            Minigame
          </span>
          <div className='absolute -bottom-5 -right-10 md:bottom-[-15px] md:right-[-50px] xl:-bottom-5 xl:right-[-70px] w-12 h-12 md:w-16 md:h-16 xl:w-20 xl:h-20 bg-white border-4 border-black rounded-full flex items-center justify-center shadow-xl transition-transform duration-300 hover:scale-110 cursor-pointer'>
            <div className='absolute w-full h-1/2 bg-red-500 top-0 rounded-t-full border-b-4 border-black'></div>
            <div className='absolute w-5 h-5 md:w-6 md:h-6 xl:w-7 xl:h-7 bg-white border-4 border-black rounded-full'></div>
          </div>
          <span className='absolute top-1 left-1 text-black opacity-40 -z-10'>
            PokeMinigame
          </span>
          <span className='absolute top-2 left-2 text-black opacity-20 -z-20'>
            PokeMinigame
          </span>
        </h1>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className='flex flex-col gap-5'
      >
        <button
          onClick={() => navigate("/game")}
          className='font-galmuri w-[350px] inline-block px-25 py-4 text-3xl text-white border-4 border-black shadow-[4px_4px_0_0_black] hover:shadow-[6px_6px_0_0_black] hover:-translate-y-1 hover:scale-105 active:shadow-none active:translate-x-1 active:translate-y-1 rounded-md text-center bg-sky-300 hover:bg-sky-400 hover:text-black cursor-pointer transition-all duration-150 whitespace-nowrap'
        >
          미니게임
        </button>

        <button
          onClick={() => navigate("/pokedex")}
          className='font-galmuri w-[350px] inline-block px-25 py-4 text-3xl text-white border-4 border-black shadow-[4px_4px_0_0_black] hover:shadow-[6px_6px_0_0_black] hover:-translate-y-1 hover:scale-105 active:shadow-none active:translate-x-1 active:translate-y-1 rounded-md text-center bg-sky-300 hover:bg-sky-400 hover:text-black cursor-pointer transition-all duration-150 whitespace-nowrap'
        >
          포켓몬 도감
        </button>

        <button
          onClick={() => navigate("/highscore")}
          className='font-galmuri w-[350px] inline-block px-25 py-4 text-3xl text-white border-4 border-black shadow-[4px_4px_0_0_black] hover:shadow-[6px_6px_0_0_black] hover:-translate-y-1 hover:scale-105 active:shadow-none active:translate-x-1 active:translate-y-1 rounded-md text-center bg-sky-300 hover:bg-sky-400 hover:text-black cursor-pointer transition-all duration-150 whitespace-nowrap'
        >
          하이스코어
        </button>
      </motion.div>
    </div>
  );
}
