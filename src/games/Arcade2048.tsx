import { useCallback, useEffect, useRef, useState } from 'react';
import { RefreshCw, Trophy } from 'lucide-react';

type Direction = 'up' | 'down' | 'left' | 'right';

interface Game2048State {
  board: number[][];
  score: number;
  best: number;
  status: 'playing' | 'won' | 'lost';
}

const STORAGE_KEY = 'arcade-2048-best';

function createEmptyBoard() {
  return Array.from({ length: 4 }, () => Array(4).fill(0));
}

function cloneBoard(board: number[][]) {
  return board.map((row) => [...row]);
}

function spawnRandomTile(board: number[][]) {
  const nextBoard = cloneBoard(board);
  const emptyCells: Array<{ row: number; col: number }> = [];

  nextBoard.forEach((row, rowIndex) => {
    row.forEach((value, colIndex) => {
      if (value === 0) {
        emptyCells.push({ row: rowIndex, col: colIndex });
      }
    });
  });

  if (emptyCells.length === 0) {
    return nextBoard;
  }

  const target = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  nextBoard[target.row][target.col] = Math.random() < 0.9 ? 2 : 4;
  return nextBoard;
}

function mergeLine(line: number[]) {
  const compacted = line.filter(Boolean);
  const merged: number[] = [];
  let gained = 0;

  for (let index = 0; index < compacted.length; index += 1) {
    const current = compacted[index];
    const next = compacted[index + 1];

    if (current !== 0 && current === next) {
      const mergedValue = current * 2;
      merged.push(mergedValue);
      gained += mergedValue;
      index += 1;
    } else {
      merged.push(current);
    }
  }

  while (merged.length < 4) {
    merged.push(0);
  }

  return { line: merged, gained };
}

function applyMove(board: number[][], direction: Direction) {
  const nextBoard = createEmptyBoard();
  let scoreDelta = 0;

  for (let index = 0; index < 4; index += 1) {
    let line = [];

    switch (direction) {
      case 'left':
        line = [...board[index]];
        break;
      case 'right':
        line = [...board[index]].reverse();
        break;
      case 'up':
        line = board.map((row) => row[index]);
        break;
      case 'down':
        line = board.map((row) => row[index]).reverse();
        break;
    }

    const { line: mergedLine, gained } = mergeLine(line);
    const normalized = direction === 'right' || direction === 'down' ? [...mergedLine].reverse() : mergedLine;
    scoreDelta += gained;

    switch (direction) {
      case 'left':
      case 'right':
        nextBoard[index] = normalized;
        break;
      case 'up':
      case 'down':
        normalized.forEach((value, rowIndex) => {
          nextBoard[rowIndex][index] = value;
        });
        break;
    }
  }

  const moved = board.some((row, rowIndex) =>
    row.some((value, colIndex) => value !== nextBoard[rowIndex][colIndex]));

  return { board: nextBoard, scoreDelta, moved };
}

function hasMoves(board: number[][]) {
  if (board.some((row) => row.includes(0))) {
    return true;
  }

  for (let row = 0; row < 4; row += 1) {
    for (let col = 0; col < 4; col += 1) {
      const current = board[row][col];
      const right = board[row][col + 1];
      const down = board[row + 1]?.[col];

      if (current === right || current === down) {
        return true;
      }
    }
  }

  return false;
}

function getInitialGame(best: number): Game2048State {
  let board = createEmptyBoard();
  board = spawnRandomTile(spawnRandomTile(board));

  return {
    board,
    score: 0,
    best,
    status: 'playing',
  };
}

function getTileClassName(value: number) {
  return value === 0 ? 'tile-empty' : `tile-${Math.min(value, 4096)}`;
}

export default function Arcade2048() {
  const [game, setGame] = useState<Game2048State>(() => {
    const best = Number(localStorage.getItem(STORAGE_KEY) ?? '0');
    return getInitialGame(best);
  });
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const resetGame = () => {
    setGame((prev) => getInitialGame(prev.best));
  };

  const moveGame = useCallback((direction: Direction) => {
    setGame((prev) => {
      if (prev.status === 'lost') {
        return prev;
      }

      const { board, scoreDelta, moved } = applyMove(prev.board, direction);
      if (!moved) {
        return prev;
      }

      const nextBoard = spawnRandomTile(board);
      const nextScore = prev.score + scoreDelta;
      const nextBest = Math.max(prev.best, nextScore);
      const reachedGoal = nextBoard.some((row) => row.some((cell) => cell >= 2048));
      const status = !hasMoves(nextBoard) ? 'lost' : reachedGoal ? 'won' : 'playing';

      localStorage.setItem(STORAGE_KEY, String(nextBest));

      return {
        board: nextBoard,
        score: nextScore,
        best: nextBest,
        status,
      };
    });
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const mapping: Record<string, Direction | undefined> = {
        ArrowUp: 'up',
        ArrowDown: 'down',
        ArrowLeft: 'left',
        ArrowRight: 'right',
        w: 'up',
        s: 'down',
        a: 'left',
        d: 'right',
      };

      const direction = mapping[event.key];
      if (!direction) {
        return;
      }

      event.preventDefault();
      moveGame(direction);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [moveGame]);

  return (
    <section className="arcade-game">
      <div className="arcade-game-header">
        <div>
          <p className="arcade-game-kicker">数字益智</p>
          <h3>2048</h3>
          <p className="arcade-game-description">方向键或滑动控制，合并相同数字，冲到 2048 以上。</p>
        </div>

        <div className="score-panels">
          <div className="score-panel">
            <span>本局分数</span>
            <strong>{game.score}</strong>
          </div>
          <div className="score-panel">
            <span>历史最佳</span>
            <strong>{game.best}</strong>
          </div>
        </div>
      </div>

      <div className="arcade-toolbar">
        <button type="button" className="btn-outline" onClick={resetGame}>
          <RefreshCw size={15} strokeWidth={1.5} />
          重新开局
        </button>
        <div className={`status-pill ${game.status}`}>
          {game.status === 'won' ? <Trophy size={14} strokeWidth={1.5} /> : null}
          <span>
            {game.status === 'won'
              ? '你已经冲到 2048 了'
              : game.status === 'lost'
                ? '已经没有可移动的格子'
                : '继续合并更大的数字'}
          </span>
        </div>
      </div>

      <div
        className="game-2048-board"
        onTouchStart={(event) => {
          const touch = event.changedTouches[0];
          touchStartRef.current = { x: touch.clientX, y: touch.clientY };
        }}
        onTouchEnd={(event) => {
          if (!touchStartRef.current) {
            return;
          }

          const touch = event.changedTouches[0];
          const deltaX = touch.clientX - touchStartRef.current.x;
          const deltaY = touch.clientY - touchStartRef.current.y;
          const horizontal = Math.abs(deltaX) > Math.abs(deltaY);

          if (Math.max(Math.abs(deltaX), Math.abs(deltaY)) < 24) {
            touchStartRef.current = null;
            return;
          }

          moveGame(horizontal ? (deltaX > 0 ? 'right' : 'left') : deltaY > 0 ? 'down' : 'up');
          touchStartRef.current = null;
        }}
      >
        {game.board.flat().map((value, index) => (
          <div key={index} className={`game-2048-tile ${getTileClassName(value)}`}>
            {value === 0 ? '' : value}
          </div>
        ))}
      </div>

      <p className="arcade-footnote">桌面端支持方向键，移动端支持滑动。数字越大，配色越热。</p>
    </section>
  );
}
