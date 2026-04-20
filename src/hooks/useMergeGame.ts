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

export const CANVAS_WIDTH = 360;
export const CANVAS_HEIGHT = 540;
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
  silhouette: Silhouette | null,
): Matter.Body {
  const entry = MERGE_CHAIN[chainIndex];
  const options: Matter.IBodyDefinition = {
    restitution: 0.15,
    friction: 0.3,
    frictionAir: 0.005,
    density: 0.002 + chainIndex * 0.0005,
    label: 'pokemon',
  };

  if (silhouette) {
    const { hull, bbox } = silhouette;
    const cx = bbox.x + bbox.w / 2;
    const cy = bbox.y + bbox.h / 2;
    const maxHalf = Math.max(bbox.w, bbox.h) / 2;
    const scale = entry.radius / maxHalf;
    const verts = hull.map((p) => ({ x: (p.x - cx) * scale, y: (p.y - cy) * scale }));
    const poly = Matter.Bodies.fromVertices(x, y, [verts], options);
    if (poly && poly.vertices.length >= 3) {
      setBodyData(poly, { chainIndex, merged: false, spawnedAt: performance.now() });
      return poly;
    }
  }

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
    let deadlineStart: number | null = null;
    let rafId = 0;

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
        scoreRef.current += 1000;
        dispatch({ type: 'SCORE', delta: 1000 });
        return;
      }

      const nextIndex = dataA.chainIndex + 1;
      const nextEntry = MERGE_CHAIN[nextIndex];
      const nextSilhouette = silhouetteCacheRef.current.get(nextEntry.pokemonId) ?? null;
      const newBody = createPokemonBody(midX, midY, nextIndex, nextSilhouette);
      Matter.World.add(engine.world, newBody);

      const delta = (nextIndex + 1) * 10;
      scoreRef.current += delta;
      dispatch({ type: 'SCORE', delta });
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
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      ctx.strokeStyle = 'rgba(239, 68, 68, 0.6)';
      ctx.setLineDash([6, 4]);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(WALL_THICKNESS, DEADLINE_Y);
      ctx.lineTo(CANVAS_WIDTH - WALL_THICKNESS, DEADLINE_Y);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = 'rgba(120, 113, 108, 0.35)';
      ctx.fillRect(0, 0, WALL_THICKNESS, CANVAS_HEIGHT);
      ctx.fillRect(CANVAS_WIDTH - WALL_THICKNESS, 0, WALL_THICKNESS, CANVAS_HEIGHT);
      ctx.fillRect(0, CANVAS_HEIGHT - WALL_THICKNESS, CANVAS_WIDTH, WALL_THICKNESS);

      const bodies = Matter.Composite.allBodies(engine.world);
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
          if (sil) {
            const maxHalf = Math.max(sil.bbox.w, sil.bbox.h) / 2;
            const scale = entry.radius / maxHalf;
            const dw = sil.bbox.w * scale;
            const dh = sil.bbox.h * scale;
            ctx.drawImage(img, sil.bbox.x, sil.bbox.y, sil.bbox.w, sil.bbox.h, -dw / 2, -dh / 2, dw, dh);
          } else {
            const size = entry.radius * 2.8;
            ctx.drawImage(img, -size / 2, -size / 2, size, size);
          }
        }
        ctx.restore();
      }

      if (phaseRef.current === 'playing') {
        const dropperEntry = MERGE_CHAIN[pendingIndexRef.current];
        const dropperImg = imageCacheRef.current.get(dropperEntry.pokemonId);
        ctx.save();
        ctx.translate(dropperXRef.current, DROPPER_Y);
        ctx.globalAlpha = 0.9;
        if (dropperImg && dropperImg.complete && dropperImg.naturalWidth > 0) {
          const sil = silhouetteCacheRef.current.get(dropperEntry.pokemonId);
          if (sil) {
            const maxHalf = Math.max(sil.bbox.w, sil.bbox.h) / 2;
            const scale = dropperEntry.radius / maxHalf;
            const dw = sil.bbox.w * scale;
            const dh = sil.bbox.h * scale;
            ctx.drawImage(
              dropperImg,
              sil.bbox.x, sil.bbox.y, sil.bbox.w, sil.bbox.h,
              -dw / 2, -dh / 2, dw, dh,
            );
          } else {
            const size = dropperEntry.radius * 2.8;
            ctx.drawImage(dropperImg, -size / 2, -size / 2, size, size);
          }
        }
        ctx.globalAlpha = 0.4;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.setLineDash([4, 6]);
        ctx.beginPath();
        ctx.moveTo(0, dropperEntry.radius);
        ctx.lineTo(0, CANVAS_HEIGHT - WALL_THICKNESS - DROPPER_Y);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
      }

      const now = performance.now();
      const violator = bodies.find((body) => {
        if (body.label !== 'pokemon') return false;
        const data = getBodyData(body);
        if (!data) return false;
        if (now - data.spawnedAt < 1200) return false;
        const topY = body.bounds.min.y;
        const slow = Math.abs(body.velocity.y) < 1.4;
        return topY < DEADLINE_Y && slow;
      });

      if (!ended && phaseRef.current === 'playing') {
        if (violator) {
          if (deadlineStart === null) {
            deadlineStart = now;
          } else if (now - deadlineStart >= DEADLINE_GRACE_MS) {
            ended = true;
            dispatch({ type: 'END', score: scoreRef.current });
          }
        } else {
          deadlineStart = null;
        }
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
    const silhouette = silhouetteCacheRef.current.get(entry.pokemonId) ?? null;
    const body = createPokemonBody(clampedX, DROPPER_Y, pendingIndexRef.current, silhouette);
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
