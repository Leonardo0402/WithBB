import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bird, Gamepad2, Grid3x3, Heart, MessageCircle, Sparkles, Worm } from 'lucide-react';
import Arcade2048 from '../games/Arcade2048';
import BirdSiegeGame from '../games/BirdSiegeGame';
import MemoryMatchGame from '../games/MemoryMatchGame';
import SnakeGame from '../games/SnakeGame';
import TurtleSoupGame from '../games/TurtleSoupGame';
import type { ArcadeGameId } from '../types/games';

const gameCards: Array<{
  id: ArcadeGameId;
  title: string;
  subtitle: string;
  icon: typeof Grid3x3;
}> = [
  { id: '2048', title: '2048', subtitle: '滑动数字，冲击更高分。', icon: Grid3x3 },
  { id: 'bird', title: '弹弓攻城', subtitle: '三张手工关卡，拼手感也拼角度。', icon: Bird },
  { id: 'snake', title: '贪吃蛇', subtitle: '方向、节奏、速度，一局比一局快。', icon: Worm },
  { id: 'memory', title: '记忆翻牌', subtitle: '把你们的照片翻成一场配对挑战。', icon: Heart },
  { id: 'turtleSoup', title: '海龟汤', subtitle: 'GLM-4.6V 实时主持，猜到最后才算赢。', icon: MessageCircle },
];

function renderGame(activeGame: ArcadeGameId) {
  switch (activeGame) {
    case '2048':
      return <Arcade2048 />;
    case 'bird':
      return <BirdSiegeGame />;
    case 'snake':
      return <SnakeGame />;
    case 'memory':
      return <MemoryMatchGame />;
    case 'turtleSoup':
      return <TurtleSoupGame />;
    default:
      return <Arcade2048 />;
  }
}

export default function Games() {
  const [activeGame, setActiveGame] = useState<ArcadeGameId>('2048');

  return (
    <div className="page-container arcade-page">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
        <div className="page-header">
          <h1 className="page-title">
            <Gamepad2 className="text-charcoal-light" strokeWidth={1.2} />
            游戏乐园
          </h1>
          <p className="page-subtitle">在恋爱网站里留一块能反复打开的小型游乐场。</p>
        </div>

        <div className="arcade-hero glass-panel">
          <div>
            <p className="arcade-eyebrow">Five Games / One Stage</p>
            <h2 className="arcade-heading">经典玩法，一页全收。</h2>
          </div>
          <div className="arcade-badges">
            <span className="arcade-badge">
              <Sparkles size={14} strokeWidth={1.4} />
              原创视觉
            </span>
            <span className="arcade-badge">
              <Heart size={14} strokeWidth={1.4} />
              情侣相册联动
            </span>
            <span className="arcade-badge">
              <MessageCircle size={14} strokeWidth={1.4} />
              AI 海龟汤
            </span>
          </div>
        </div>

        <div className="arcade-selector-grid">
          {gameCards.map((game) => {
            const Icon = game.icon;
            const isActive = activeGame === game.id;

            return (
              <button
                key={game.id}
                type="button"
                className={`arcade-selector-card glass-panel ${isActive ? 'active' : ''}`}
                onClick={() => setActiveGame(game.id)}
              >
                <div className="arcade-selector-top">
                  <Icon size={18} strokeWidth={1.5} />
                  <span>{game.title}</span>
                </div>
                <p>{game.subtitle}</p>
              </button>
            );
          })}
        </div>

        <div className="arcade-stage glass-panel">{renderGame(activeGame)}</div>
      </motion.div>
    </div>
  );
}
