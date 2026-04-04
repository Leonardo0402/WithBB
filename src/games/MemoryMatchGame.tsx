import { useEffect, useState } from 'react';
import { Eye, RefreshCw, Timer } from 'lucide-react';
import { getMemoryPhotoPool } from '../utils/gallery';

interface MemoryCard {
  id: string;
  image: string;
  title: string;
  pairId: string;
  matched: boolean;
}

function shuffle<T>(items: T[]) {
  const next = [...items];

  for (let index = next.length - 1; index > 0; index -= 1) {
    const target = Math.floor(Math.random() * (index + 1));
    [next[index], next[target]] = [next[target], next[index]];
  }

  return next;
}

function createDeck() {
  return shuffle(
    getMemoryPhotoPool(8).flatMap((photo, index) => [
      {
        id: `${photo.id}-a`,
        image: photo.src,
        title: photo.title ?? `照片 ${index + 1}`,
        pairId: `pair-${index}`,
        matched: false,
      },
      {
        id: `${photo.id}-b`,
        image: photo.src,
        title: photo.title ?? `照片 ${index + 1}`,
        pairId: `pair-${index}`,
        matched: false,
      },
    ]),
  );
}

export default function MemoryMatchGame() {
  const [cards, setCards] = useState<MemoryCard[]>(() => createDeck());
  const [flippedIds, setFlippedIds] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [showAll, setShowAll] = useState(false);

  const matchedCount = cards.filter((card) => card.matched).length;
  const isCompleted = matchedCount === cards.length;
  const revealedIds = new Set([...flippedIds, ...(showAll ? cards.map((card) => card.id) : [])]);

  useEffect(() => {
    if (isCompleted) {
      return undefined;
    }

    const timer = window.setInterval(() => setSeconds((prev) => prev + 1), 1000);
    return () => window.clearInterval(timer);
  }, [isCompleted]);

  useEffect(() => {
    if (flippedIds.length !== 2) {
      return undefined;
    }

    const [firstId, secondId] = flippedIds;
    const first = cards.find((card) => card.id === firstId);
    const second = cards.find((card) => card.id === secondId);

    if (!first || !second) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      if (first.pairId === second.pairId) {
        setCards((prev) =>
          prev.map((card) => (card.pairId === first.pairId ? { ...card, matched: true } : card)),
        );
      }

      setFlippedIds([]);
    }, 700);

    return () => window.clearTimeout(timer);
  }, [cards, flippedIds]);

  const resetDeck = () => {
    setCards(createDeck());
    setFlippedIds([]);
    setMoves(0);
    setSeconds(0);
    setShowAll(false);
  };

  const revealHint = () => {
    setShowAll(true);
    window.setTimeout(() => setShowAll(false), 1400);
  };

  const handleFlip = (card: MemoryCard) => {
    if (showAll || card.matched || flippedIds.includes(card.id) || flippedIds.length >= 2) {
      return;
    }

    const next = [...flippedIds, card.id];
    setFlippedIds(next);

    if (next.length === 2) {
      setMoves((prev) => prev + 1);
    }
  };

  return (
    <section className="arcade-game">
      <div className="arcade-game-header">
        <div>
          <p className="arcade-game-kicker">相册联动</p>
          <h3>记忆翻牌</h3>
          <p className="arcade-game-description">从你们自己的照片里抽出配对卡，越少步数越漂亮。</p>
        </div>

        <div className="score-panels">
          <div className="score-panel">
            <span>步数</span>
            <strong>{moves}</strong>
          </div>
          <div className="score-panel">
            <span>计时</span>
            <strong>{seconds}s</strong>
          </div>
        </div>
      </div>

      <div className="arcade-toolbar">
        <button type="button" className="btn-outline" onClick={resetDeck}>
          <RefreshCw size={15} strokeWidth={1.5} />
          洗牌重开
        </button>
        <button type="button" className="btn-outline" onClick={revealHint}>
          <Eye size={15} strokeWidth={1.5} />
          一眼提示
        </button>
        <div className={`status-pill ${isCompleted ? 'won' : 'playing'}`}>
          <Timer size={14} strokeWidth={1.5} />
          <span>{isCompleted ? '全部配对成功' : `已配对 ${matchedCount / 2} / ${cards.length / 2}`}</span>
        </div>
      </div>

      <div className="memory-grid">
        {cards.map((card) => {
          const isVisible = card.matched || revealedIds.has(card.id);

          return (
            <button
              key={card.id}
              type="button"
              className={`memory-card ${isVisible ? 'visible' : ''}`}
              onClick={() => handleFlip(card)}
            >
              <div className="memory-card-inner">
                <div className="memory-card-face memory-card-front">
                  <span>♥</span>
                </div>
                <div className="memory-card-face memory-card-back">
                  <img src={card.image} alt={card.title} />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
