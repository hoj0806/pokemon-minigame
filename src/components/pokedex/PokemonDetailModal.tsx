import { motion } from 'motion/react';
import { usePokedexStore } from '../../store/pokedexStore';
import { TypeBadge } from './TypeBadge';
import { TYPE_CARD_FROM } from '../../utils/pokemonLocale';
import type { PokemonDex } from '../../types/pokemon';

interface PokemonDetailModalProps {
  pokemon: PokemonDex;
  onClose: () => void;
}

export function PokemonDetailModal({ pokemon, onClose }: PokemonDetailModalProps) {
  const getById = usePokedexStore((s) => s.getById);

  const evolutionNames = pokemon.evolutionChain.map((id) => {
    const p = getById(id);
    return p ? { id, name: p.koreanName, imageUrl: p.imageUrl } : { id, name: `#${id}`, imageUrl: '' };
  });

  const firstType = pokemon.types[0] ?? '노말';
  const fromClass = TYPE_CARD_FROM[firstType] ?? 'from-gray-200';
  const isDark = firstType === '악';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.85, y: 20 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        whileHover={{ y: -4, boxShadow: '0 24px 60px rgba(0,0,0,0.45)' }}
        className="relative w-full max-w-xs flex flex-col
                   rounded-[--radius-card]
                   border-4 border-[#111827]
                   shadow-[0_8px_0_0_#111827,0_12px_40px_rgba(0,0,0,0.4)]
                   overflow-hidden cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 타입 기반 상단 배경 */}
        <div className={`bg-gradient-to-b ${fromClass} to-white/80 p-6 flex flex-col items-center gap-3 border-b-4 border-[#111827]`}>
          {/* 번호 */}
          <span className={`font-galmuri text-xs font-bold ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            #{String(pokemon.id).padStart(3, '0')}
          </span>

          {/* 포켓몬 이미지 구슬 */}
          <div
            className="w-36 h-36 rounded-full relative flex items-center justify-center
                       bg-white
                       ring-4 ring-white/90 ring-offset-2 ring-offset-transparent
                       shadow-[inset_-6px_-6px_14px_rgba(0,0,0,0.12),inset_6px_6px_12px_rgba(255,255,255,0.95),0_8px_28px_rgba(0,0,0,0.2)]"
          >
            <div className="absolute top-3 left-4 w-10 h-5 bg-white/75 rounded-full blur-sm pointer-events-none" />
            <div className="absolute top-2 right-5 w-3 h-3 bg-white/65 rounded-full blur-[2px] animate-pulse pointer-events-none" />
            <img
              src={pokemon.imageUrl}
              alt={pokemon.koreanName}
              className="w-28 h-28 object-contain [image-rendering:pixelated] relative z-10"
            />
          </div>

          {/* 이름 */}
          <h2 className={`font-galmuri text-2xl font-bold ${isDark ? 'text-white' : 'text-[#111827]'}`}>
            {pokemon.koreanName}
          </h2>

          {/* 타입 배지 */}
          <div className="flex gap-2">
            {pokemon.types.map((t) => (
              <TypeBadge key={t} type={t} />
            ))}
          </div>
        </div>

        {/* 정보 영역 */}
        <div className="bg-[#e8e0d0] p-5 flex flex-col gap-4">
          {/* 키 / 몸무게 */}
          <div className="grid grid-cols-2 gap-3">
            <InfoBox label="키" value={`${pokemon.height.toFixed(1)} m`} />
            <InfoBox label="몸무게" value={`${pokemon.weight.toFixed(1)} kg`} />
          </div>

          {/* 특성 */}
          <Section title="특성">
            <div className="flex flex-wrap gap-2">
              {pokemon.abilities.map((a) => (
                <span
                  key={a}
                  className="px-3 py-1 rounded-[--radius-sm] bg-white border-2 border-[#111827]
                             text-xs font-galmuri text-[#111827]
                             shadow-[0_2px_0_0_#111827]"
                >
                  {a}
                </span>
              ))}
            </div>
          </Section>

          {/* 진화 체인 */}
          {evolutionNames.length > 1 && (
            <Section title="진화">
              <div className="flex items-center justify-center gap-2 flex-wrap">
                {evolutionNames.map((evo, i) => (
                  <div key={evo.id} className="flex items-center gap-2">
                    <div className="flex flex-col items-center gap-1">
                      <div
                        className="w-14 h-14 rounded-full relative flex items-center justify-center
                                   bg-white ring-2 ring-white/90
                                   shadow-[inset_-3px_-3px_8px_rgba(0,0,0,0.1),inset_3px_3px_6px_rgba(255,255,255,0.95),0_4px_10px_rgba(0,0,0,0.15)]"
                      >
                        <div className="absolute top-1 left-1.5 w-4 h-2 bg-white/70 rounded-full blur-[2px] pointer-events-none" />
                        {evo.imageUrl && (
                          <img
                            src={evo.imageUrl}
                            alt={evo.name}
                            className="w-10 h-10 object-contain [image-rendering:pixelated] relative z-10"
                          />
                        )}
                      </div>
                      <span className="text-[10px] font-galmuri text-[#111827]">{evo.name}</span>
                    </div>
                    {i < evolutionNames.length - 1 && (
                      <span className="text-[#111827] text-sm mb-5 font-bold">→</span>
                    )}
                  </div>
                ))}
              </div>
            </Section>
          )}
        </div>
      </motion.div>
    </div>
  );
}

interface InfoBoxProps {
  label: string;
  value: string;
}

function InfoBox({ label, value }: InfoBoxProps) {
  return (
    <div className="flex flex-col items-center gap-0.5 py-3 rounded-[--radius-sm]
                    bg-white border-2 border-[#111827] shadow-[0_3px_0_0_#111827]">
      <span className="text-xs font-galmuri text-gray-500">{label}</span>
      <span className="text-sm font-galmuri font-bold text-[#111827]">{value}</span>
    </div>
  );
}

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

function Section({ title, children }: SectionProps) {
  return (
    <div>
      <h3 className="font-galmuri text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">
        {title}
      </h3>
      {children}
    </div>
  );
}
