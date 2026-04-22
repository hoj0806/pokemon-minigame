import { useEffect, useReducer, useRef } from 'react';
import Matter from 'matter-js';
import type { PokemonDex } from '../types/pokemon';
import { MERGE_CHAIN, MAX_CHAIN_INDEX, DROPPABLE_MAX_INDEX } from '../utils/mergeChain';

export type GamePhase = 'idle' | 'playing' | 'result';

interface State {
  phase: GamePhase;
  score: number;
  nextIndex: number;
  previewIndex: number;
  finalScore: number;
  canDrop: boolean;
  runId: number;
}

type Action =
  | { type: 'START'; nextIndex: number; previewIndex: number }
  | { type: 'DROP'; previewIndex: number }
  | { type: 'READY' }
  | { type: 'SCORE'; delta: number }
  | { type: 'END'; score: number };

const INIT_STATE: State = {
  phase: 'idle',
  score: 0,
  nextIndex: 0,
  previewIndex: 0,
  finalScore: 0,
  canDrop: false,
  runId: 0,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'START':
      return {
        ...INIT_STATE,
        phase: 'playing',
        nextIndex: action.nextIndex,
        previewIndex: action.previewIndex,
        canDrop: true,
        runId: state.runId + 1,
      };
    case 'DROP':
      return {
        ...state,
        nextIndex: state.previewIndex,
        previewIndex: action.previewIndex,
        canDrop: false,
      };
    case 'READY':
      return { ...state, canDrop: true };
    case 'SCORE':
      return { ...state, score: state.score + action.delta };
    case 'END':
      return { ...state, phase: 'result', finalScore: action.score, canDrop: false };
    default:
      return state;
  }
}

export const CANVAS_WIDTH = 420;
export const CANVAS_HEIGHT = 560;
export const WALL_THICKNESS = 24;
export const DROPPER_Y = 44;
export const DEADLINE_Y = 92;
export const DEADLINE_GRACE_MS = 3000;
export const DROP_COOLDOWN_MS = 500;
export const DROPPER_STEP = 14;

interface BodyData {
  chainIndex: number;
  merged: boolean;
  spawnedAt: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  createdAt: number;
  lifetime: number;
}

interface ScorePopup {
  x: number;
  y: number;
  text: string;
  createdAt: number;
  color: string;
}

const PARTICLE_COLORS = ['#FFCB05', '#EE1515', '#3B4CCA', '#FF6B35', '#A8E063', '#ffffff'];

function randomDroppableIndex(): number {
  return Math.floor(Math.random() * (DROPPABLE_MAX_INDEX + 1));
}

function getBodyData(body: Matter.Body): BodyData | null {
  const plugin = body.plugin as { merge?: BodyData } | undefined;
  return plugin?.merge ?? null;
}

function setBodyData(body: Matter.Body, data: BodyData): void {
  (body.plugin as { merge?: BodyData }).merge = data;
}

interface Silhouette {
  hull: { x: number; y: number }[];
  bbox: { x: number; y: number; w: number; h: number };
}

function convexHull(pts: { x: number; y: number }[]): { x: number; y: number }[] {
  if (pts.length < 3) return pts.slice();
  const sorted = [...pts].sort((a, b) => a.x - b.x || a.y - b.y);
  const cross = (
    o: { x: number; y: number },
    a: { x: number; y: number },
    b: { x: number; y: number },
  ) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
  const lower: { x: number; y: number }[] = [];
  for (const p of sorted) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) {
      lower.pop();
    }
    lower.push(p);
  }
  const upper: { x: number; y: number }[] = [];
  for (let i = sorted.length - 1; i >= 0; i--) {
    const p = sorted[i];
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) {
      upper.pop();
    }
    upper.push(p);
  }
  return lower.slice(0, -1).concat(upper.slice(0, -1));
}

function extractSilhouette(img: HTMLImageElement): Silhouette | null {
  const w = img.naturalWidth;
  const h = img.naturalHeight;
  if (w === 0 || h === 0) return null;
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const cx = c.getContext('2d');
  if (!cx) return null;
  cx.drawImage(img, 0, 0);
  let data: ImageData;
  try {
    data = cx.getImageData(0, 0, w, h);
  } catch {
    return null;
  }
  const step = Math.max(1, Math.floor(Math.min(w, h) / 48));
  const threshold = 24;
  const pts: { x: number; y: number }[] = [];
  let minX = w, minY = h, maxX = 0, maxY = 0;
  for (let y = 0; y < h; y += step) {
    for (let x = 0; x < w; x += step) {
      const alpha = data.data[(y * w + x) * 4 + 3];
      if (alpha > threshold) {
        pts.push({ x, y });
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (pts.length < 3) return null;
  const hull = convexHull(pts);
  if (hull.length < 3) return null;
  return {
    hull,
    bbox: { x: minX, y: minY, w: maxX - minX + step, h: maxY - minY + step },
  };
}

function createPokemonBody(
  x: number,
  y: number,
  chainIndex: number,
): Matter.Body {
  const entry = MERGE_CHAIN[chainIndex];
  const options: Matter.IBodyDefinition = {
    restitution: 0.15,
    friction: 0.3,
    frictionAir: 0.005,
    density: 0.002 + chainIndex * 0.0005,
    label: 'pokemon',
  };
  const body = Matter.Bodies.circle(x, y, entry.radius, options);
  setBodyData(body, { chainIndex, merged: false, spawnedAt: performance.now() });
  return body;
}

interface UseMergeGameArgs {
  pokemonMap: Map<number, PokemonDex>;
}

export function useMergeGame({ pokemonMap }: UseMergeGameArgs) {
  const [state, dispatch] = useReducer(reducer, INIT_STATE);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const imageCacheRef = useRef<Map<number, HTMLImageElement>>(new Map());
  const silhouetteCacheRef = useRef<Map<number, Silhouette>>(new Map());
  const dropperXRef = useRef<number>(CANVAS_WIDTH / 2);
  const pendingIndexRef = useRef<number>(0);
  const previewIndexRef = useRef<number>(0);
  const scoreRef = useRef<number>(0);
  const pokemonMapRef = useRef(pokemonMap);
  const canDropRef = useRef<boolean>(false);
  const phaseRef = useRef<GamePhase>('idle');
  const particlesRef = useRef<Particle[]>([]);
  const scorePopupsRef = useRef<ScorePopup[]>([]);

  useEffect(() => {
    pokemonMapRef.current = pokemonMap;
  }, [pokemonMap]);

  useEffect(() => {
    canDropRef.current = state.canDrop;
  }, [state.canDrop]);

  useEffect(() => {
    phaseRef.current = state.phase;
  }, [state.phase]);

  useEffect(() => {
    if (state.phase !== 'playing') return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    particlesRef.current = [];
    scorePopupsRef.current = [];

    const engine = Matter.Engine.create({
      gravity: { x: 0, y: 1, scale: 0.0012 },
    });
    engineRef.current = engine;

    const leftWall = Matter.Bodies.rectangle(
      WALL_THICKNESS / 2,
      CANVAS_HEIGHT / 2,
      WALL_THICKNESS,
      CANVAS_HEIGHT,
      { isStatic: true, label: 'wall' },
    );
    const rightWall = Matter.Bodies.rectangle(
      CANVAS_WIDTH - WALL_THICKNESS / 2,
      CANVAS_HEIGHT / 2,
      WALL_THICKNESS,
      CANVAS_HEIGHT,
      { isStatic: true, label: 'wall' },
    );
    const floor = Matter.Bodies.rectangle(
      CANVAS_WIDTH / 2,
      CANVAS_HEIGHT - WALL_THICKNESS / 2,
      CANVAS_WIDTH,
      WALL_THICKNESS,
      { isStatic: true, label: 'wall' },
    );
    Matter.World.add(engine.world, [leftWall, rightWall, floor]);

    let ended = false;
    let rafId = 0;

    const spawnMergeParticles = (x: number, y: number, chainIndex: number) => {
      const count = 8 + chainIndex * 2;
      const now = performance.now();
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + Math.random() * 0.4;
        const speed = 1.5 + Math.random() * 2.5;
        particlesRef.current.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 1,
          size: 2.5 + Math.random() * 3 + chainIndex * 0.3,
          color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
          createdAt: now,
          lifetime: 500 + chainIndex * 30,
        });
      }
    };

    const handleMerge = (a: Matter.Body, b: Matter.Body) => {
      const dataA = getBodyData(a);
      const dataB = getBodyData(b);
      if (!dataA || !dataB) return;
      if (dataA.merged || dataB.merged) return;
      if (dataA.chainIndex !== dataB.chainIndex) return;

      dataA.merged = true;
      dataB.merged = true;

      const midX = (a.position.x + b.position.x) / 2;
      const midY = (a.position.y + b.position.y) / 2;

      Matter.World.remove(engine.world, a);
      Matter.World.remove(engine.world, b);

      if (dataA.chainIndex >= MAX_CHAIN_INDEX) {
        const delta = 1000;
        scoreRef.current += delta;
        dispatch({ type: 'SCORE', delta });
        spawnMergeParticles(midX, midY, MAX_CHAIN_INDEX);
        scorePopupsRef.current.push({
          x: midX, y: midY - 10,
          text: `+${delta}`,
          createdAt: performance.now(),
          color: '#FFCB05',
        });
        return;
      }

      const nextIndex = dataA.chainIndex + 1;
      const newBody = createPokemonBody(midX, midY, nextIndex);
      Matter.World.add(engine.world, newBody);

      const delta = (nextIndex + 1) * 10;
      scoreRef.current += delta;
      dispatch({ type: 'SCORE', delta });

      spawnMergeParticles(midX, midY, nextIndex);
      scorePopupsRef.current.push({
        x: midX, y: midY - 10,
        text: `+${delta}`,
        createdAt: performance.now(),
        color: nextIndex >= 6 ? '#FFCB05' : '#ffffff',
      });
    };

    Matter.Events.on(engine, 'collisionStart', (event) => {
      for (const pair of event.pairs) {
        if (pair.bodyA.label === 'pokemon' && pair.bodyB.label === 'pokemon') {
          handleMerge(pair.bodyA, pair.bodyB);
        }
      }
    });

    const runner = Matter.Runner.create();
    Matter.Runner.run(runner, engine);

    const ctx = canvas.getContext('2d');
    if (ctx) ctx.imageSmoothingEnabled = false;

    const drawFrame = () => {
      if (!ctx) return;
      const now = performance.now();

      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Background grid dots
      ctx.fillStyle = 'rgba(148, 163, 184, 0.1)';
      const gridSize = 24;
      for (let gx = WALL_THICKNESS + 12; gx < CANVAS_WIDTH - WALL_THICKNESS; gx += gridSize) {
        for (let gy = DEADLINE_Y + 16; gy < CANVAS_HEIGHT - WALL_THICKNESS; gy += gridSize) {
          ctx.beginPath();
          ctx.arc(gx, gy, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Deadline line
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.6)';
      ctx.setLineDash([6, 4]);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(WALL_THICKNESS, DEADLINE_Y);
      ctx.lineTo(CANVAS_WIDTH - WALL_THICKNESS, DEADLINE_Y);
      ctx.stroke();
      ctx.setLineDash([]);

      // Walls
      ctx.fillStyle = 'rgba(120, 113, 108, 0.35)';
      ctx.fillRect(0, 0, WALL_THICKNESS, CANVAS_HEIGHT);
      ctx.fillRect(CANVAS_WIDTH - WALL_THICKNESS, 0, WALL_THICKNESS, CANVAS_HEIGHT);
      ctx.fillRect(0, CANVAS_HEIGHT - WALL_THICKNESS, CANVAS_WIDTH, WALL_THICKNESS);

      const bodies = Matter.Composite.allBodies(engine.world);

      // Draw pokemon bodies
      for (const body of bodies) {
        if (body.label !== 'pokemon') continue;
        const data = getBodyData(body);
        if (!data) continue;
        const entry = MERGE_CHAIN[data.chainIndex];
        const img = imageCacheRef.current.get(entry.pokemonId);

        ctx.save();
        ctx.translate(body.position.x, body.position.y);
        ctx.rotate(body.angle);

        if (img && img.complete && img.naturalWidth > 0) {
          const sil = silhouetteCacheRef.current.get(entry.pokemonId);
          const size = sil
            ? (entry.radius * 2) * (Math.max(img.naturalWidth, img.naturalHeight) / Math.max(sil.bbox.w, sil.bbox.h))
            : entry.radius * 2.8;
          ctx.drawImage(img, -size / 2, -size / 2, size, size);
        }
        ctx.restore();
      }

      // Dropper guide
      if (phaseRef.current === 'playing') {
        const dropperEntry = MERGE_CHAIN[pendingIndexRef.current];
        const dropperImg = imageCacheRef.current.get(dropperEntry.pokemonId);
        ctx.save();
        ctx.translate(dropperXRef.current, DROPPER_Y);
        ctx.globalAlpha = 0.9;
        if (dropperImg && dropperImg.complete && dropperImg.naturalWidth > 0) {
          const sil = silhouetteCacheRef.current.get(dropperEntry.pokemonId);
          const size = sil
            ? (dropperEntry.radius * 2) * (Math.max(dropperImg.naturalWidth, dropperImg.naturalHeight) / Math.max(sil.bbox.w, sil.bbox.h))
            : dropperEntry.radius * 2.8;
          ctx.drawImage(dropperImg, -size / 2, -size / 2, size, size);
        }
        ctx.globalAlpha = 0.35;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.setLineDash([4, 6]);
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, dropperEntry.radius + 4);
        ctx.lineTo(0, CANVAS_HEIGHT - WALL_THICKNESS - DROPPER_Y);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
      }

      // Danger border pulse
      const dangerBodies = bodies.filter((body) => {
        if (body.label !== 'pokemon') return false;
        const data = getBodyData(body);
        if (!data) return false;
        return now - data.spawnedAt > 800 && body.bounds.min.y < DEADLINE_Y + 30;
      });

      if (dangerBodies.length > 0) {
        const pulse = 0.25 + 0.35 * Math.sin(now / 110);
        ctx.save();
        ctx.strokeStyle = `rgba(239, 68, 68, ${pulse})`;
        ctx.lineWidth = 8;
        ctx.strokeRect(4, 4, CANVAS_WIDTH - 8, CANVAS_HEIGHT - 8);
        // inner glow
        ctx.strokeStyle = `rgba(239, 68, 68, ${pulse * 0.4})`;
        ctx.lineWidth = 20;
        ctx.strokeRect(10, 10, CANVAS_WIDTH - 20, CANVAS_HEIGHT - 20);
        ctx.restore();
      }

      // Particles
      particlesRef.current = particlesRef.current.filter(
        (p) => now - p.createdAt < p.lifetime,
      );
      for (const p of particlesRef.current) {
        const age = (now - p.createdAt) / p.lifetime;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.08;
        p.vx *= 0.97;
        ctx.save();
        ctx.globalAlpha = Math.max(0, 1 - age * 1.2);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 4;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (1 - age * 0.6), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Score popups
      scorePopupsRef.current = scorePopupsRef.current.filter(
        (sp) => now - sp.createdAt < 900,
      );
      for (const sp of scorePopupsRef.current) {
        const age = (now - sp.createdAt) / 900;
        const currentY = sp.y - age * 50;
        ctx.save();
        ctx.globalAlpha = Math.max(0, 1 - age * 1.3);
        ctx.font = `bold 15px Galmuri11, monospace`;
        ctx.textAlign = 'center';
        ctx.lineWidth = 3;
        ctx.strokeStyle = 'rgba(17, 24, 39, 0.9)';
        ctx.strokeText(sp.text, sp.x, currentY);
        ctx.fillStyle = sp.color;
        ctx.fillText(sp.text, sp.x, currentY);
        ctx.restore();
      }

      // Violator check
      const violator = bodies.find((body) => {
        if (body.label !== 'pokemon') return false;
        const data = getBodyData(body);
        if (!data) return false;
        if (now - data.spawnedAt < 1200) return false;
        return body.bounds.min.y < DEADLINE_Y && Math.abs(body.velocity.y) < 1.4;
      });

      if (!ended && phaseRef.current === 'playing' && violator) {
        ended = true;
        dispatch({ type: 'END', score: scoreRef.current });
      }

      rafId = requestAnimationFrame(drawFrame);
    };

    rafId = requestAnimationFrame(drawFrame);

    return () => {
      cancelAnimationFrame(rafId);
      Matter.Runner.stop(runner);
      Matter.Events.off(engine, 'collisionStart');
      Matter.World.clear(engine.world, false);
      Matter.Engine.clear(engine);
      engineRef.current = null;
      particlesRef.current = [];
      scorePopupsRef.current = [];
    };
  }, [state.runId, state.phase]);

  const preloadImages = () => {
    MERGE_CHAIN.forEach((entry) => {
      if (imageCacheRef.current.has(entry.pokemonId)) return;
      const p = pokemonMapRef.current.get(entry.pokemonId);
      if (!p) return;
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const s = extractSilhouette(img);
        if (s) silhouetteCacheRef.current.set(entry.pokemonId, s);
      };
      img.src = p.imageUrl;
      imageCacheRef.current.set(entry.pokemonId, img);
    });
  };

  const start = () => {
    if (pokemonMapRef.current.size === 0) return;
    preloadImages();
    scoreRef.current = 0;
    dropperXRef.current = CANVAS_WIDTH / 2;
    const first = randomDroppableIndex();
    const preview = randomDroppableIndex();
    pendingIndexRef.current = first;
    previewIndexRef.current = preview;
    dispatch({ type: 'START', nextIndex: first, previewIndex: preview });
  };

  const drop = () => {
    const engine = engineRef.current;
    if (!engine) return;
    if (!canDropRef.current) return;
    if (phaseRef.current !== 'playing') return;

    const entry = MERGE_CHAIN[pendingIndexRef.current];
    const clampedX = Math.min(
      Math.max(dropperXRef.current, WALL_THICKNESS + entry.radius),
      CANVAS_WIDTH - WALL_THICKNESS - entry.radius,
    );
    const body = createPokemonBody(clampedX, DROPPER_Y, pendingIndexRef.current);
    Matter.World.add(engine.world, body);

    const nextPreview = randomDroppableIndex();
    pendingIndexRef.current = previewIndexRef.current;
    previewIndexRef.current = nextPreview;
    canDropRef.current = false;
    dispatch({ type: 'DROP', previewIndex: nextPreview });

    setTimeout(() => {
      if (phaseRef.current === 'playing') {
        dispatch({ type: 'READY' });
      }
    }, DROP_COOLDOWN_MS);
  };

  const moveDropper = (delta: number) => {
    if (phaseRef.current !== 'playing') return;
    const entry = MERGE_CHAIN[pendingIndexRef.current];
    const minX = WALL_THICKNESS + entry.radius;
    const maxX = CANVAS_WIDTH - WALL_THICKNESS - entry.radius;
    dropperXRef.current = Math.min(Math.max(dropperXRef.current + delta, minX), maxX);
  };

  const setDropperX = (x: number) => {
    if (phaseRef.current !== 'playing') return;
    const entry = MERGE_CHAIN[pendingIndexRef.current];
    const minX = WALL_THICKNESS + entry.radius;
    const maxX = CANVAS_WIDTH - WALL_THICKNESS - entry.radius;
    dropperXRef.current = Math.min(Math.max(x, minX), maxX);
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (phaseRef.current !== 'playing') return;
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        moveDropper(-DROPPER_STEP);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        moveDropper(DROPPER_STEP);
      } else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        drop();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  return {
    phase: state.phase,
    score: state.score,
    finalScore: state.finalScore,
    nextIndex: state.nextIndex,
    previewIndex: state.previewIndex,
    canvasRef,
    start,
    drop,
    setDropperX,
    moveDropper,
  };
}
