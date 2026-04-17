import { usePokedexStore } from '../../store/pokedexStore';
import { TypeBadge } from './TypeBadge';
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md max-h-[85vh] flex flex-col
                   rounded-[--radius-card] bg-[--color-surface-overlay]
                   border border-[--color-border] shadow-[--shadow-game]
                   overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center
                     rounded-full bg-[--color-surface-raised] text-[--color-on-surface-muted]
                     hover:text-[--color-on-surface] hover:bg-[--color-border] transition-colors text-lg"
          aria-label="닫기"
        >
          ✕
        </button>

        {/* 스크롤 영역 */}
        <div className="overflow-y-auto p-6">
          {/* 번호 + 이름 */}
          <div className="flex flex-col items-center gap-1 mb-4">
            <span className="font-galmuri text-xs text-[--color-on-surface-muted]">
              #{String(pokemon.id).padStart(3, '0')}
            </span>
            <h2 className="font-galmuri text-2xl font-bold text-[--color-on-surface]">
              {pokemon.koreanName}
            </h2>
          </div>

          {/* 스프라이트 */}
          <div className="flex justify-center mb-4">
            <div
              className="w-32 h-32 rounded-full flex items-center justify-center
                         bg-[--color-surface-raised]
                         ring-2 ring-blue-200/60
                         shadow-[0_0_28px_rgba(147,197,253,0.6),inset_0_1px_0_rgba(255,255,255,0.5)]"
            >
              <img
                src={pokemon.imageUrl}
                alt={pokemon.koreanName}
                className="w-24 h-24 object-contain [image-rendering:pixelated]"
              />
            </div>
          </div>

          {/* 타입 */}
          <div className="flex justify-center gap-2 mb-5">
            {pokemon.types.map((t) => (
              <TypeBadge key={t} type={t} />
            ))}
          </div>

          {/* 기본 정보 */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <InfoBox label="키" value={`${pokemon.height.toFixed(1)} m`} />
            <InfoBox label="몸무게" value={`${pokemon.weight.toFixed(1)} kg`} />
          </div>

          {/* 특성 */}
          <Section title="특성">
            <div className="flex flex-wrap gap-2">
              {pokemon.abilities.map((a) => (
                <span
                  key={a}
                  className="px-3 py-1 rounded-[--radius-badge] bg-[--color-surface-raised]
                             border border-[--color-border] text-xs font-galmuri text-[--color-on-surface]"
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
                        className="w-14 h-14 rounded-full flex items-center justify-center
                                   bg-[--color-surface-raised] ring-1 ring-blue-200/50
                                   shadow-[0_0_10px_rgba(147,197,253,0.4)]"
                      >
                        {evo.imageUrl && (
                          <img
                            src={evo.imageUrl}
                            alt={evo.name}
                            className="w-10 h-10 object-contain [image-rendering:pixelated]"
                          />
                        )}
                      </div>
                      <span className="text-[10px] font-galmuri text-[--color-on-surface]">
                        {evo.name}
                      </span>
                    </div>
                    {i < evolutionNames.length - 1 && (
                      <span className="text-[--color-on-surface-muted] text-sm mb-5">→</span>
                    )}
                  </div>
                ))}
              </div>
            </Section>
          )}
        </div>
      </div>
    </div>
  );
}

interface InfoBoxProps {
  label: string;
  value: string;
}

function InfoBox({ label, value }: InfoBoxProps) {
  return (
    <div className="flex flex-col items-center gap-0.5 py-3 rounded-[--radius-md]
                    bg-[--color-surface-raised] border border-[--color-border]">
      <span className="text-xs font-galmuri text-[--color-on-surface-muted]">{label}</span>
      <span className="text-sm font-galmuri font-semibold text-[--color-on-surface]">{value}</span>
    </div>
  );
}

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

function Section({ title, children }: SectionProps) {
  return (
    <div className="mb-5">
      <h3 className="font-galmuri text-xs font-semibold text-[--color-on-surface-muted] mb-2 uppercase tracking-wider">
        {title}
      </h3>
      {children}
    </div>
  );
}
