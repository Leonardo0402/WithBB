import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Gift, Heart, MapPin, Check, Plus, X, Sparkles } from 'lucide-react';

interface Wish {
  id: string;
  title: string;
  description?: string;
  category: 'place' | 'thing';
  completed: boolean;
  createdAt: string;
}

const initialWishes: Wish[] = [
  {
    id: '1',
    title: '想和你去好多地方',
    description: '一起去探索这个世界的美好',
    category: 'place',
    completed: false,
    createdAt: '2024-01-01',
  },
  {
    id: '2',
    title: '一起看日出日落',
    description: '在海边或山顶，看太阳升起和落下',
    category: 'thing',
    completed: false,
    createdAt: '2024-01-01',
  },
  {
    id: '3',
    title: '一起学做一道菜',
    description: '为对方做一顿美味的晚餐',
    category: 'thing',
    completed: false,
    createdAt: '2024-01-01',
  },
];

export default function Wishlist() {
  const [wishes, setWishes] = useState<Wish[]>(initialWishes);
  const [isAdding, setIsAdding] = useState(false);
  const [newWish, setNewWish] = useState<Partial<Wish>>({
    title: '', description: '', category: 'thing',
  });
  const [filter, setFilter] = useState<'all' | 'place' | 'thing'>('all');

  useEffect(() => {
    const savedWishes = localStorage.getItem('wishlist');
    if (savedWishes) {
      setWishes(JSON.parse(savedWishes));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(wishes));
  }, [wishes]);

  const handleAddWish = () => {
    if (newWish.title) {
      const wish: Wish = {
        id: Date.now().toString(),
        title: newWish.title,
        description: newWish.description,
        category: newWish.category || 'thing',
        completed: false,
        createdAt: new Date().toISOString().split('T')[0],
      };
      setWishes([wish, ...wishes]); 
      setNewWish({ title: '', description: '', category: 'thing' });
      setIsAdding(false);
    }
  };

  const toggleComplete = (id: string) => {
    setWishes((prev) =>
      prev.map((wish) =>
        wish.id === id ? { ...wish, completed: !wish.completed } : wish
      )
    );
  };

  const deleteWish = (id: string) => {
    setWishes((prev) => prev.filter((wish) => wish.id !== id));
  };

  const filteredWishes = wishes.filter((wish) =>
    filter === 'all' ? true : wish.category === filter
  );

  const completedCount = wishes.filter((w) => w.completed).length;
  const progress = wishes.length > 0 ? (completedCount / wishes.length) * 100 : 0;

  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        
        <div className="page-header">
          <h1 className="page-title">
            <Gift className="text-charcoal-light" strokeWidth={1} />
            心愿清单
          </h1>
          <p className="page-subtitle">记录我们想一起完成的事情</p>
        </div>

        <div className="glass-panel progress-container">
          <span className="text-sm text-charcoal-light">完成进度</span>
          <div className="progress-bar">
            <motion.div
              className="progress-fill"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
          <span className="text-sm text-charcoal-light" style={{ minWidth: '40px', textAlign: 'right' }}>
            {completedCount} / {wishes.length}
          </span>
        </div>

        <div className="action-bar" style={{ justifyContent: 'space-between' }}>
          <div className="filter-bar" style={{ marginBottom: 0 }}>
            {(['all', 'place', 'thing'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`filter-btn ${filter === f ? 'active' : ''}`}
              >
                {f === 'all' ? '全部' : f === 'place' ? '想去的地方' : '想做的事'}
              </button>
            ))}
          </div>
          <button onClick={() => setIsAdding(!isAdding)} className="btn-outline">
            {isAdding ? <X size={16} strokeWidth={1} /> : <Plus size={16} strokeWidth={1} />}
            <span>{isAdding ? '取消' : '添加心愿'}</span>
          </button>
        </div>

        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-panel form-panel"
            style={{ overflow: 'hidden' }}
          >
            <h3 className="text-lg font-serif mb-2 text-charcoal">添加新心愿</h3>
            <div className="form-row">
              <button
                onClick={() => setNewWish({ ...newWish, category: 'place' })}
                className={`btn-outline ${newWish.category === 'place' ? 'active' : ''}`}
                style={{ flex: 1, justifyContent: 'center', borderColor: newWish.category === 'place' ? 'var(--rose-gold)' : '' }}
              >
                <MapPin size={16} strokeWidth={1} /> 想去的地方
              </button>
              <button
                onClick={() => setNewWish({ ...newWish, category: 'thing' })}
                className={`btn-outline ${newWish.category === 'thing' ? 'active' : ''}`}
                style={{ flex: 1, justifyContent: 'center', borderColor: newWish.category === 'thing' ? 'var(--rose-gold)' : '' }}
              >
                <Heart size={16} strokeWidth={1} /> 想做的事
              </button>
            </div>
            <input
              type="text"
              placeholder="心愿标题"
              value={newWish.title}
              onChange={(e) => setNewWish({ ...newWish, title: e.target.value })}
              className="input-minimal"
            />
            <textarea
              placeholder="详细描述（可选）..."
              value={newWish.description}
              onChange={(e) => setNewWish({ ...newWish, description: e.target.value })}
              className="input-minimal"
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
              <button onClick={handleAddWish} className="btn-outline">
                <Check size={16} strokeWidth={1} /> 确认添加
              </button>
            </div>
          </motion.div>
        )}

        <div className="list-container">
          {filteredWishes.map((wish, index) => (
            <motion.div
              key={wish.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`glass-panel list-item wish-item ${wish.completed ? 'completed' : ''}`}
            >
              <button
                onClick={() => toggleComplete(wish.id)}
                className={`wish-checkbox ${wish.completed ? 'completed' : ''}`}
              >
                {wish.completed && <Check size={12} strokeWidth={2} />}
              </button>

              <div className="list-item-content">
                <div className="list-item-title">
                  {wish.category === 'place' ? (
                    <MapPin size={14} strokeWidth={1} className="text-charcoal-light" />
                  ) : (
                    <Heart size={14} strokeWidth={1} className="text-charcoal-light" />
                  )}
                  {wish.title}
                  {wish.title.includes('好多') && <Sparkles size={14} strokeWidth={1} className="text-charcoal-light" />}
                </div>
                {wish.description && <p className="list-item-desc">{wish.description}</p>}
                <div className="list-item-meta">{wish.createdAt}</div>
              </div>

              <button
                onClick={() => deleteWish(wish.id)}
                className="list-item-action"
                style={{ padding: '8px' }}
              >
                <X size={16} strokeWidth={1} />
              </button>
            </motion.div>
          ))}
        </div>

        {filteredWishes.length === 0 && (
          <div className="empty-state">
            <Gift size={32} strokeWidth={1} />
            <p>还没有心愿，快添加一些吧！</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
