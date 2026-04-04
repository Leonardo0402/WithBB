import { useCallback, useEffect, useState } from 'react';
import { Pause, Play, RefreshCw, Trophy } from 'lucide-react';

type Direction = 'up' | 'down' | 'left' | 'right';

interface Point {
  x: number;
  y: number;
}

interface SnakeState {
  snake: Point[];
  food: Point;
  direction: Direction;
  pendingDirection: Direction;
  score: number;
  speed: number;
  isRunning: boolean;
  isGameOver: boolean;
}

const BOARD_SIZE = 14;
const BEST_SCORE_KEY = 'snake-best-score';

function randomFood(snake: Point[]) {
  let candidate = { x: 0, y: 0 };

  do {
    candidate = {
      x: Math.floor(Math.random() * BOARD_SIZE),
      y: Math.floor(Math.random() * BOARD_SIZE),
    };
  } while (snake.some((cell) => cell.x === candidate.x && cell.y === candidate.y));

  return candidate;
}

function createInitialSnakeState(): SnakeState {
  const snake = [
    { x: 6, y: 7 },
    { x: 5, y: 7 },
    { x: 4, y: 7 },
  ];

  return {
    snake,
    food: randomFood(snake),
    direction: 'right',
    pendingDirection: 'right',
    score: 0,
    speed: 170,
    isRunning: true,
    isGameOver: false,
  };
}

function isOpposite(a: Direction, b: Direction) {
  return (
    (a === 'up' && b === 'down') ||
    (a === 'down' && b === 'up') ||
    (a === 'left' && b === 'right') ||
    (a === 'right' && b === 'left')
  );
}

export default function SnakeGame() {
  const [state, setState] = useState<SnakeState>(() => createInitialSnakeState());
  const [bestScore, setBestScore] = useState(() => Number(localStorage.getItem(BEST_SCORE_KEY) ?? '0'));

  const tick = useCallback(() => {
    setState((prev) => {
      if (!prev.isRunning || prev.isGameOver) {
        return prev;
      }

      const nextHead = { ...prev.snake[0] };
      const direction = prev.pendingDirection;

      if (direction === 'up') nextHead.y -= 1;
      if (direction === 'down') nextHead.y += 1;
      if (direction === 'left') nextHead.x -= 1;
      if (direction === 'right') nextHead.x += 1;

      const hitWall =
        nextHead.x < 0 ||
        nextHead.x >= BOARD_SIZE ||
        nextHead.y < 0 ||
        nextHead.y >= BOARD_SIZE;
      const hitSelf = prev.snake.some((cell) => cell.x === nextHead.x && cell.y === nextHead.y);

      if (hitWall || hitSelf) {
        return {
          ...prev,
          isRunning: false,
          isGameOver: true,
        };
      }

      const nextSnake = [nextHead, ...prev.snake];
      let nextFood = prev.food;
      let nextScore = prev.score;
      let nextSpeed = prev.speed;

      if (nextHead.x === prev.food.x && nextHead.y === prev.food.y) {
        nextScore += 1;
        nextFood = randomFood(nextSnake);
        nextSpeed = Math.max(90, prev.speed - 6);
      } else {
        nextSnake.pop();
      }

      if (nextScore > bestScore) {
        localStorage.setItem(BEST_SCORE_KEY, String(nextScore));
        setBestScore(nextScore);
      }

      return {
        ...prev,
        snake: nextSnake,
        food: nextFood,
        score: nextScore,
        speed: nextSpeed,
        direction,
      };
    });
  }, [bestScore]);

  useEffect(() => {
    if (!state.isRunning || state.isGameOver) {
      return undefined;
    }

    const timer = window.setInterval(() => tick(), state.speed);
    return () => window.clearInterval(timer);
  }, [state.isGameOver, state.isRunning, state.speed, tick]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const directionMap: Record<string, Direction | undefined> = {
        ArrowUp: 'up',
        ArrowDown: 'down',
        ArrowLeft: 'left',
        ArrowRight: 'right',
        w: 'up',
        s: 'down',
        a: 'left',
        d: 'right',
      };

      const nextDirection = directionMap[event.key];
      if (!nextDirection) {
        return;
      }

      event.preventDefault();

      setState((prev) => {
        if (isOpposite(prev.direction, nextDirection)) {
          return prev;
        }

        return {
          ...prev,
          pendingDirection: nextDirection,
          isRunning: true,
        };
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const resetGame = () => {
    setState(createInitialSnakeState());
  };

  const setDirection = (nextDirection: Direction) => {
    setState((prev) => {
      if (isOpposite(prev.direction, nextDirection)) {
        return prev;
      }

      return {
        ...prev,
        pendingDirection: nextDirection,
        isRunning: true,
      };
    });
  };

  return (
    <section className="arcade-game">
      <div className="arcade-game-header">
        <div>
          <p className="arcade-game-kicker">街机反应</p>
          <h3>贪吃蛇</h3>
          <p className="arcade-game-description">键盘或按钮控制方向，分数越高，速度越快。</p>
        </div>

        <div className="score-panels">
          <div className="score-panel">
            <span>当前长度</span>
            <strong>{state.snake.length}</strong>
          </div>
          <div className="score-panel">
            <span>历史最高</span>
            <strong>{bestScore}</strong>
          </div>
        </div>
      </div>

      <div className="arcade-toolbar">
        <button type="button" className="btn-outline" onClick={resetGame}>
          <RefreshCw size={15} strokeWidth={1.5} />
          重开
        </button>
        <button
          type="button"
          className="btn-outline"
          onClick={() => setState((prev) => ({ ...prev, isRunning: !prev.isRunning }))}
          disabled={state.isGameOver}
        >
          {state.isRunning ? <Pause size={15} strokeWidth={1.5} /> : <Play size={15} strokeWidth={1.5} />}
          {state.isRunning ? '暂停' : '继续'}
        </button>
        <div className={`status-pill ${state.isGameOver ? 'lost' : 'playing'}`}>
          {state.isGameOver ? <Trophy size={14} strokeWidth={1.5} /> : null}
          <span>{state.isGameOver ? '撞到了，下一局更快' : `速度 ${Math.round((200 - state.speed) / 10) + 1} 级`}</span>
        </div>
      </div>

      <div className="snake-board" style={{ gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)` }}>
        {Array.from({ length: BOARD_SIZE * BOARD_SIZE }).map((_, index) => {
          const x = index % BOARD_SIZE;
          const y = Math.floor(index / BOARD_SIZE);
          const snakeIndex = state.snake.findIndex((cell) => cell.x === x && cell.y === y);
          const isFood = state.food.x === x && state.food.y === y;
          const isHead = snakeIndex === 0;

          return (
            <div
              key={index}
              className={`snake-cell ${snakeIndex >= 0 ? 'snake-body' : ''} ${isHead ? 'snake-head' : ''} ${isFood ? 'snake-food' : ''}`}
            />
          );
        })}
      </div>

      <div className="control-pad">
        <button type="button" className="control-button up" onClick={() => setDirection('up')}>
          ↑
        </button>
        <div className="control-pad-middle">
          <button type="button" className="control-button" onClick={() => setDirection('left')}>
            ←
          </button>
          <button type="button" className="control-button" onClick={() => setDirection('down')}>
            ↓
          </button>
          <button type="button" className="control-button" onClick={() => setDirection('right')}>
            →
          </button>
        </div>
      </div>
    </section>
  );
}
