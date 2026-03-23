import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Sparkles } from 'lucide-react';

interface TimeTogether {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

// Custom diamond heart outline SVG to fit "geometric line-art heart"
const DiamondHeart = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="diamond-heart">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" stroke="currentColor" strokeWidth="1" strokeLinejoin="round"/>
  </svg>
);

export default function Home() {
  const [timeTogether, setTimeTogether] = useState<TimeTogether>({
    days: 0, hours: 0, minutes: 0, seconds: 0,
  });

  const startDate = new Date('2025-12-14').getTime();

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date().getTime();
      const distance = now - startDate;

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeTogether({ days, hours, minutes, seconds });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatZero = (num: number) => (num < 10 ? `0${num}` : `${num}`);

  return (
    <div className="home-container">
      {/* Floating Particles */}
      <div className="particles-container">
        {[...Array(6)].map((_, i) => (
          <div key={i} className={`particle particle-${i}`}>
            <DiamondHeart />
          </div>
        ))}
      </div>

      <motion.div 
        className="glass-panel main-panel"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
      >
        {/* Soft Sparkle Effect Over Glass */}
        <div className="glass-sparkles"></div>

        <header className="home-header">
          <h1 className="title">
            <span className="name">宝宝</span>
            <span className="heart-divider"><DiamondHeart /></span>
            <span className="name">贝贝</span>
          </h1>
          <p className="subtitle">从第一次相遇到现在，每一天都是最好的礼物</p>
          <div className="calendar-icon-wrapper">
            <Calendar className="calendar-icon" strokeWidth={1} size={16} />
          </div>
        </header>

        <main className="counter-section">
          <div className="counter-row">
            <div className="counter-item">
              <span className="number enormous text-rose-gold">{timeTogether.days}</span>
              <span className="label text-charcoal">天</span>
            </div>
          </div>
          <div className="counter-row sub-row">
            <div className="counter-item">
              <span className="number text-rose-gold">{formatZero(timeTogether.hours)}</span>
              <span className="label text-charcoal">小时</span>
            </div>
            <div className="counter-item">
              <span className="number text-rose-gold">{formatZero(timeTogether.minutes)}</span>
              <span className="label text-charcoal">分钟</span>
            </div>
            <div className="counter-item">
              <span className="number text-rose-gold">{formatZero(timeTogether.seconds)}</span>
              <span className="label text-charcoal">秒</span>
            </div>
          </div>
        </main>

      </motion.div>

      {/* Quote as a modest colophon outside/bottom right of the window */}
      <motion.div 
        className="quote-colophon"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
      >
        <Sparkles className="sparkle-icon" strokeWidth={1} size={14} />
        <p className="quote-text">遇见你，是我这辈子最美好的意外。</p>
      </motion.div>

    </div>
  );
}
