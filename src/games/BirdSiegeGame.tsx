import { useEffect, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import {
  Bodies,
  Body,
  Composite,
  Constraint,
  Engine,
  Events,
  Vector,
  type Body as MatterBody,
  type IEventCollision,
} from 'matter-js';
import { Bird, RefreshCw, SkipForward, Target, Trophy } from 'lucide-react';

interface RectConfig {
  x: number;
  y: number;
  width: number;
  height: number;
  angle?: number;
  isStatic?: boolean;
  color?: string;
}

interface CircleConfig {
  x: number;
  y: number;
  radius: number;
}

interface LevelConfig {
  name: string;
  hint: string;
  birds: number;
  platforms: RectConfig[];
  blocks: RectConfig[];
  targets: CircleConfig[];
}

const VIEWPORT = { width: 880, height: 520 };
const SLING_ORIGIN = { x: 150, y: 370 };
const DRAG_LIMIT = 110;

const LEVELS: LevelConfig[] = [
  {
    name: '关卡一 · 试投',
    hint: '先击打左侧立柱，让上层整体倾倒。',
    birds: 3,
    platforms: [{ x: 640, y: 430, width: 280, height: 18, isStatic: true }],
    blocks: [
      { x: 585, y: 390, width: 24, height: 72, color: '#d9b18f' },
      { x: 645, y: 390, width: 24, height: 72, color: '#d9b18f' },
      { x: 615, y: 340, width: 96, height: 20, color: '#c78f6b' },
      { x: 680, y: 390, width: 24, height: 72, color: '#d9b18f' },
      { x: 710, y: 340, width: 82, height: 20, angle: 0.2, color: '#d3a27f' },
    ],
    targets: [
      { x: 615, y: 300, radius: 18 },
      { x: 705, y: 300, radius: 18 },
    ],
  },
  {
    name: '关卡二 · 拱门',
    hint: '优先打掉底层横梁，别追着目标正面砸。',
    birds: 4,
    platforms: [{ x: 650, y: 430, width: 320, height: 18, isStatic: true }],
    blocks: [
      { x: 585, y: 385, width: 22, height: 84, color: '#d8b58f' },
      { x: 720, y: 385, width: 22, height: 84, color: '#d8b58f' },
      { x: 652, y: 400, width: 120, height: 20, color: '#c78962' },
      { x: 652, y: 340, width: 140, height: 20, color: '#c78962' },
      { x: 625, y: 360, width: 22, height: 60, color: '#e0be9e' },
      { x: 680, y: 360, width: 22, height: 60, color: '#e0be9e' },
    ],
    targets: [
      { x: 652, y: 300, radius: 18 },
      { x: 622, y: 312, radius: 16 },
    ],
  },
  {
    name: '关卡三 · 双塔',
    hint: '先掀翻中间连接梁，再处理高塔顶部。',
    birds: 4,
    platforms: [{ x: 660, y: 430, width: 340, height: 18, isStatic: true }],
    blocks: [
      { x: 575, y: 390, width: 24, height: 72, color: '#d6a57e' },
      { x: 625, y: 390, width: 24, height: 72, color: '#d6a57e' },
      { x: 600, y: 340, width: 92, height: 18, color: '#bf7d57' },
      { x: 700, y: 390, width: 24, height: 72, color: '#d6a57e' },
      { x: 748, y: 390, width: 24, height: 72, color: '#d6a57e' },
      { x: 724, y: 340, width: 92, height: 18, color: '#bf7d57' },
      { x: 662, y: 300, width: 132, height: 18, angle: -0.12, color: '#c98e67' },
    ],
    targets: [
      { x: 600, y: 300, radius: 17 },
      { x: 724, y: 300, radius: 17 },
      { x: 662, y: 258, radius: 16 },
    ],
  },
];

function roundedRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.lineTo(x + width - radius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + radius);
  context.lineTo(x + width, y + height - radius);
  context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  context.lineTo(x + radius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - radius);
  context.lineTo(x, y + radius);
  context.quadraticCurveTo(x, y, x + radius, y);
  context.closePath();
}

function drawBlock(context: CanvasRenderingContext2D, body: MatterBody) {
  const color = ((body.plugin as { color?: string })?.color ?? '#d7b08e') as string;
  const width = body.bounds.max.x - body.bounds.min.x;
  const height = body.bounds.max.y - body.bounds.min.y;

  context.save();
  context.translate(body.position.x, body.position.y);
  context.rotate(body.angle);
  context.fillStyle = color;
  context.strokeStyle = 'rgba(108, 78, 57, 0.22)';
  roundedRect(context, -width / 2, -height / 2, width, height, 6);
  context.fill();
  context.stroke();
  context.restore();
}

function drawTarget(context: CanvasRenderingContext2D, body: MatterBody) {
  const radius = body.circleRadius ?? 18;

  context.save();
  context.translate(body.position.x, body.position.y);
  context.fillStyle = '#86b86f';
  context.beginPath();
  context.arc(0, 0, radius, 0, Math.PI * 2);
  context.fill();

  context.fillStyle = '#517440';
  context.beginPath();
  context.arc(-radius * 0.4, -radius * 0.8, radius * 0.22, 0, Math.PI * 2);
  context.arc(radius * 0.4, -radius * 0.8, radius * 0.22, 0, Math.PI * 2);
  context.fill();

  context.fillStyle = '#ffffff';
  context.beginPath();
  context.arc(-radius * 0.3, -radius * 0.05, radius * 0.24, 0, Math.PI * 2);
  context.arc(radius * 0.1, -radius * 0.05, radius * 0.24, 0, Math.PI * 2);
  context.fill();

  context.fillStyle = '#1f2a1d';
  context.beginPath();
  context.arc(-radius * 0.26, -radius * 0.02, radius * 0.1, 0, Math.PI * 2);
  context.arc(radius * 0.14, -radius * 0.02, radius * 0.1, 0, Math.PI * 2);
  context.fill();
  context.restore();
}

function drawBird(context: CanvasRenderingContext2D, body: MatterBody) {
  const radius = body.circleRadius ?? 18;

  context.save();
  context.translate(body.position.x, body.position.y);
  context.rotate(body.angle);

  context.fillStyle = '#d35f55';
  context.beginPath();
  context.arc(0, 0, radius, 0, Math.PI * 2);
  context.fill();

  context.fillStyle = '#f6dbc3';
  context.beginPath();
  context.arc(-2, radius * 0.3, radius * 0.55, 0, Math.PI);
  context.fill();

  context.fillStyle = '#f1c04e';
  context.beginPath();
  context.moveTo(radius * 0.7, 0);
  context.lineTo(radius * 1.25, -4);
  context.lineTo(radius * 1.25, 4);
  context.closePath();
  context.fill();

  context.fillStyle = '#1f1f1f';
  context.beginPath();
  context.arc(-radius * 0.15, -radius * 0.1, radius * 0.12, 0, Math.PI * 2);
  context.fill();
  context.restore();
}

function clampPoint(point: { x: number; y: number }) {
  const delta = Vector.sub(point, SLING_ORIGIN);
  const magnitude = Vector.magnitude(delta);
  const limited =
    magnitude > DRAG_LIMIT
      ? Vector.add(SLING_ORIGIN, Vector.mult(Vector.normalise(delta), DRAG_LIMIT))
      : point;

  return {
    x: Math.min(SLING_ORIGIN.x + 18, limited.x),
    y: Math.max(230, Math.min(VIEWPORT.height - 90, limited.y)),
  };
}

function toCanvasPoint(event: ReactPointerEvent<HTMLCanvasElement>) {
  const rect = event.currentTarget.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) / rect.width) * VIEWPORT.width,
    y: ((event.clientY - rect.top) / rect.height) * VIEWPORT.height,
  };
}

export default function BirdSiegeGame() {
  const [levelIndex, setLevelIndex] = useState(0);
  const [restartToken, setRestartToken] = useState(0);
  const [birdsLeft, setBirdsLeft] = useState(LEVELS[0].birds);
  const [targetsLeft, setTargetsLeft] = useState(LEVELS[0].targets.length);
  const [status, setStatus] = useState<'aiming' | 'flying' | 'won' | 'lost'>('aiming');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<Engine | null>(null);
  const frameRef = useRef<number | null>(null);
  const birdRef = useRef<MatterBody | null>(null);
  const elasticRef = useRef<Constraint | null>(null);
  const blockBodiesRef = useRef<MatterBody[]>([]);
  const platformBodiesRef = useRef<MatterBody[]>([]);
  const targetBodiesRef = useRef<MatterBody[]>([]);
  const draggingRef = useRef(false);
  const launchedRef = useRef(false);
  const lastMovementAtRef = useRef(0);
  const birdsAvailableRef = useRef(LEVELS[0].birds);
  const statusRef = useRef<'aiming' | 'flying' | 'won' | 'lost'>('aiming');
  const lockedResultRef = useRef(false);

  const level = LEVELS[levelIndex];

  const prepareLevelUI = (nextLevelIndex: number) => {
    const nextLevel = LEVELS[nextLevelIndex];
    birdsAvailableRef.current = nextLevel.birds;
    statusRef.current = 'aiming';
    lockedResultRef.current = false;
    setBirdsLeft(nextLevel.birds);
    setTargetsLeft(nextLevel.targets.length);
    setStatus('aiming');
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return undefined;
    }

    const context = canvas.getContext('2d');
    if (!context) {
      return undefined;
    }

    const engine = Engine.create({
      gravity: { x: 0, y: 1.02, scale: 0.001 },
    });
    engineRef.current = engine;

    let mounted = true;

    const updateStatus = (next: 'aiming' | 'flying' | 'won' | 'lost') => {
      statusRef.current = next;
      setStatus(next);
    };

    const removeTarget = (target: MatterBody) => {
      const remaining = targetBodiesRef.current.filter((item) => item.id !== target.id);
      if (remaining.length === targetBodiesRef.current.length) {
        return;
      }

      Composite.remove(engine.world, target);
      targetBodiesRef.current = remaining;
      setTargetsLeft(remaining.length);

      if (remaining.length === 0 && !lockedResultRef.current) {
        lockedResultRef.current = true;
        updateStatus('won');
      }
    };

    const spawnBird = (notify = true) => {
      const bird = Bodies.circle(SLING_ORIGIN.x, SLING_ORIGIN.y, 18, {
        restitution: 0.78,
        density: 0.006,
        friction: 0.015,
        frictionAir: 0.01,
        label: 'bird',
      });
      const elastic = Constraint.create({
        pointA: SLING_ORIGIN,
        bodyB: bird,
        stiffness: 0.06,
        damping: 0.03,
        length: 0,
      });

      birdRef.current = bird;
      elasticRef.current = elastic;
      launchedRef.current = false;
      lastMovementAtRef.current = Date.now();
      Composite.add(engine.world, [bird, elastic]);
      if (notify) {
        updateStatus('aiming');
      } else {
        statusRef.current = 'aiming';
      }
    };

    const ground = Bodies.rectangle(
      VIEWPORT.width / 2,
      VIEWPORT.height - 8,
      VIEWPORT.width,
      16,
      { isStatic: true, label: 'ground' },
    );
    const leftHill = Bodies.rectangle(60, VIEWPORT.height - 80, 120, 140, {
      isStatic: true,
      angle: -0.3,
      label: 'hill',
    });

    const platforms = level.platforms.map((platform) =>
      Bodies.rectangle(platform.x, platform.y, platform.width, platform.height, {
        isStatic: platform.isStatic ?? true,
        label: 'platform',
        render: { fillStyle: '#ceb390' },
      }),
    );
    const blocks = level.blocks.map((block) => {
      const body = Bodies.rectangle(block.x, block.y, block.width, block.height, {
        angle: block.angle ?? 0,
        restitution: 0.04,
        friction: 0.6,
        frictionAir: 0.008,
        density: 0.0045,
        label: 'block',
      });
      body.plugin = { color: block.color };
      return body;
    });
    const targets = level.targets.map((target) =>
      Bodies.circle(target.x, target.y, target.radius, {
        restitution: 0.2,
        friction: 0.6,
        frictionAir: 0.012,
        density: 0.0035,
        label: 'target',
      }),
    );

    Composite.add(engine.world, [ground, leftHill, ...platforms, ...blocks, ...targets]);
    platformBodiesRef.current = [ground, leftHill, ...platforms];
    blockBodiesRef.current = blocks;
    targetBodiesRef.current = targets;
    birdsAvailableRef.current = level.birds;
    lockedResultRef.current = false;
    spawnBird(false);

    const collisionCallback = (event: IEventCollision<Engine>) => {
      event.pairs.forEach((pair) => {
        const impact = pair.bodyA.speed + pair.bodyB.speed + pair.collision.depth;

        [pair.bodyA, pair.bodyB].forEach((body) => {
          if (body.label === 'target' && impact > 4.8) {
            removeTarget(body);
          }
        });
      });
    };

    Events.on(engine, 'collisionStart', collisionCallback);

    const drawScene = () => {
      context.clearRect(0, 0, VIEWPORT.width, VIEWPORT.height);

      const gradient = context.createLinearGradient(0, 0, 0, VIEWPORT.height);
      gradient.addColorStop(0, '#fff6f2');
      gradient.addColorStop(1, '#f6ddd0');
      context.fillStyle = gradient;
      context.fillRect(0, 0, VIEWPORT.width, VIEWPORT.height);

      context.fillStyle = 'rgba(255,255,255,0.55)';
      context.beginPath();
      context.arc(150, 110, 38, 0, Math.PI * 2);
      context.arc(188, 102, 30, 0, Math.PI * 2);
      context.arc(224, 114, 34, 0, Math.PI * 2);
      context.fill();

      context.fillStyle = '#dbb490';
      context.fillRect(110, SLING_ORIGIN.y - 50, 18, 76);
      context.fillRect(150, SLING_ORIGIN.y - 62, 18, 88);
      context.fillStyle = '#ce9a72';
      context.fillRect(110, SLING_ORIGIN.y + 12, 58, 12);

      if (draggingRef.current && birdRef.current) {
        const pull = Vector.sub(SLING_ORIGIN, birdRef.current.position);
        const projectedVelocity = Vector.mult(pull, 0.16);
        const points = Array.from({ length: 7 }, (_, index) => {
          const time = index * 0.22;
          return {
            x: birdRef.current!.position.x + projectedVelocity.x * time * 12,
            y: birdRef.current!.position.y + projectedVelocity.y * time * 12 + 30 * time * time,
          };
        });

        context.fillStyle = 'rgba(183, 110, 121, 0.35)';
        points.forEach((point, index) => {
          context.beginPath();
          context.arc(point.x, point.y, Math.max(2, 5 - index * 0.4), 0, Math.PI * 2);
          context.fill();
        });
      }

      context.strokeStyle = '#925f44';
      context.lineWidth = 5;
      context.beginPath();
      context.moveTo(SLING_ORIGIN.x - 20, SLING_ORIGIN.y - 34);
      context.lineTo(birdRef.current?.position.x ?? SLING_ORIGIN.x, birdRef.current?.position.y ?? SLING_ORIGIN.y);
      context.lineTo(SLING_ORIGIN.x + 12, SLING_ORIGIN.y - 46);
      context.stroke();

      platformBodiesRef.current.forEach((body, index) => {
        context.save();
        context.translate(body.position.x, body.position.y);
        context.rotate(body.angle);
        context.fillStyle = index === 0 ? '#dcae7d' : '#e9d2bc';
        roundedRect(
          context,
          -(body.bounds.max.x - body.bounds.min.x) / 2,
          -(body.bounds.max.y - body.bounds.min.y) / 2,
          body.bounds.max.x - body.bounds.min.x,
          body.bounds.max.y - body.bounds.min.y,
          4,
        );
        context.fill();
        context.restore();
      });

      blockBodiesRef.current.forEach((body) => drawBlock(context, body));
      targetBodiesRef.current.forEach((body) => drawTarget(context, body));

      if (birdRef.current) {
        drawBird(context, birdRef.current);
      }
    };

    const loop = () => {
      if (!mounted) {
        return;
      }

      Engine.update(engine, 1000 / 60);

      targetBodiesRef.current.forEach((target) => {
        if (target.position.y > VIEWPORT.height - 20) {
          removeTarget(target);
        }
      });

      const bird = birdRef.current;
      if (bird && launchedRef.current && statusRef.current !== 'won') {
        const moving = bird.speed > 0.6 || Math.abs(bird.angularVelocity) > 0.04;

        if (moving) {
          lastMovementAtRef.current = Date.now();
        }

        const outOfBounds =
          bird.position.x > VIEWPORT.width + 120 ||
          bird.position.x < -120 ||
          bird.position.y > VIEWPORT.height + 120;
        const settled = Date.now() - lastMovementAtRef.current > 1400;

        if (outOfBounds || settled) {
          Composite.remove(engine.world, bird);
          birdRef.current = null;

          if (birdsAvailableRef.current > 0) {
            spawnBird();
          } else if (targetBodiesRef.current.length > 0 && !lockedResultRef.current) {
            lockedResultRef.current = true;
            updateStatus('lost');
          }
        }
      }

      drawScene();
      frameRef.current = window.requestAnimationFrame(loop);
    };

    loop();

    return () => {
      mounted = false;
      Events.off(engine, 'collisionStart', collisionCallback);
      if (frameRef.current) {
        window.cancelAnimationFrame(frameRef.current);
      }
      Engine.clear(engine);
      Composite.clear(engine.world, false);
    };
  }, [level, levelIndex, restartToken]);

  const beginDrag = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const bird = birdRef.current;
    if (!bird || launchedRef.current || statusRef.current === 'won' || statusRef.current === 'lost') {
      return;
    }

    const point = toCanvasPoint(event);
    const distance = Vector.magnitude(Vector.sub(point, bird.position));
    if (distance > 36) {
      return;
    }

    draggingRef.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    Body.setStatic(bird, true);
    Body.setAngularVelocity(bird, 0);
    Body.setVelocity(bird, { x: 0, y: 0 });
    Body.setPosition(bird, clampPoint(point));
  };

  const moveDrag = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const bird = birdRef.current;
    if (!bird || !draggingRef.current) {
      return;
    }

    Body.setPosition(bird, clampPoint(toCanvasPoint(event)));
  };

  const endDrag = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const bird = birdRef.current;
    if (!bird || !draggingRef.current) {
      return;
    }

    draggingRef.current = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    const pull = Vector.sub(SLING_ORIGIN, bird.position);
    Body.setStatic(bird, false);

    if (Vector.magnitude(pull) < 12) {
      Body.setPosition(bird, SLING_ORIGIN);
      Body.setVelocity(bird, { x: 0, y: 0 });
      return;
    }

    if (elasticRef.current) {
      Composite.remove(engineRef.current!.world, elasticRef.current);
      elasticRef.current = null;
    }

    Body.setVelocity(bird, Vector.mult(pull, 0.16));
    launchedRef.current = true;
    birdsAvailableRef.current -= 1;
    setBirdsLeft(birdsAvailableRef.current);
    statusRef.current = 'flying';
    setStatus('flying');
    lastMovementAtRef.current = Date.now();
  };

  return (
    <section className="arcade-game">
      <div className="arcade-game-header">
        <div>
          <p className="arcade-game-kicker">物理弹射</p>
          <h3>弹弓攻城</h3>
          <p className="arcade-game-description">{level.hint}</p>
        </div>

        <div className="score-panels">
          <div className="score-panel">
            <span>剩余发射</span>
            <strong>{birdsLeft}</strong>
          </div>
          <div className="score-panel">
            <span>剩余目标</span>
            <strong>{targetsLeft}</strong>
          </div>
        </div>
      </div>

      <div className="arcade-toolbar">
        <button
          type="button"
          className="btn-outline"
          onClick={() => {
            prepareLevelUI(levelIndex);
            setRestartToken((prev) => prev + 1);
          }}
        >
          <RefreshCw size={15} strokeWidth={1.5} />
          重开本关
        </button>
        <button
          type="button"
          className="btn-outline"
          onClick={() => {
            const nextLevelIndex = (levelIndex + 1) % LEVELS.length;
            prepareLevelUI(nextLevelIndex);
            setLevelIndex(nextLevelIndex);
            setRestartToken((prev) => prev + 1);
          }}
        >
          <SkipForward size={15} strokeWidth={1.5} />
          切到下一关
        </button>
        <div className={`status-pill ${status}`}>
          {status === 'won' ? <Trophy size={14} strokeWidth={1.5} /> : <Target size={14} strokeWidth={1.5} />}
          <span>
            {status === 'won'
              ? '结构已经被你打散了'
              : status === 'lost'
                ? '弹药耗尽，换个角度再来'
                : status === 'flying'
                  ? '观察坍塌，等它自己收尾'
                  : '按住小鸟往后拖，再松手发射'}
          </span>
        </div>
      </div>

      <div className="bird-canvas-wrap">
        <canvas
          ref={canvasRef}
          width={VIEWPORT.width}
          height={VIEWPORT.height}
          className="bird-canvas"
          onPointerDown={beginDrag}
          onPointerMove={moveDrag}
          onPointerUp={endDrag}
          onPointerLeave={endDrag}
        />
      </div>

      <div className="arcade-footnote bird-footnote">
        <Bird size={14} strokeWidth={1.5} />
        <span>{level.name}</span>
      </div>
    </section>
  );
}
