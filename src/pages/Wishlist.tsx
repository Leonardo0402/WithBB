import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Gift, Heart, MapPin, Plus, Sparkles, X } from 'lucide-react';

interface Wish {
  id: string;
  title: string;
  description?: string;
  category: 'place' | 'thing';
  completed: boolean;
  createdAt: string;
}

const STORAGE_KEY = 'wishlist';

const initialWishes: Wish[] = [
  {
    id: '1',
    title: '一起去陌生的城市住两天',
    description: '不赶行程，只把散步和吃饭都慢下来。',
    category: 'place',
    completed: false,
    createdAt: '2026-01-01',
  },
  {
    id: '2',
    title: '一起看一次完整日出',
    description: '最好是提前准备好热饮和毛毯。',
    category: 'thing',
    completed: false,
    createdAt: '2026-01-05',
  },
  {
    id: '3',
    title: '一起做一顿认真的晚餐',
    description: '从买菜到摆盘都算作约会的一部分。',
    category: 'thing',
    completed: false,
    createdAt: '2026-01-10',
  },
];

function readWishes() {
  const stored = localStorage.getItem(STORAGE_KEY);

  if (!stored) {
    return initialWishes;
  }

  try {
    const parsed = JSON.parse(stored) as Wish[];
    return parsed.length > 0 ? parsed : initialWishes;
  } catch {
    return initialWishes;
  }
}

export default function Wishlist() {
  const [wishes, setWishes] = useState<Wish[]>(() => readWishes());
  const [isAdding, setIsAdding] = useState(false);
  const [newWish, setNewWish] = useState<Partial<Wish>>({
    title: '',
    description: '',
    category: 'thing',
  });
  const [filter, setFilter] = useState<'all' | 'place' | 'thing'>('all');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(wishes));
  }, [wishes]);

  const handleAddWish = () => {
    if (!newWish.title?.trim()) {
      return;
    }

    const wish: Wish = {
      id: Date.now().toString(),
      title: newWish.title.trim(),
      description: newWish.description?.trim(),
      category: newWish.category ?? 'thing',
      completed: false,
      createdAt: new Date().toISOString().split('T')[0],
    };

    setWishes((prev) => [wish, ...prev]);
    setNewWish({ title: '', description: '', category: 'thing' });
    setIsAdding(false);
  };

  const filteredWishes = wishes.filter((wish) => (filter === 'all' ? true : wish.category === filter));
  const completedCount = wishes.filter((wish) => wish.completed).length;
  const progress = wishes.length > 0 ? (completedCount / wishes.length) * 100 : 0;

  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="page-header">
          <h1 className="page-title">
            <Gift className="text-charcoal-light" strokeWidth={1} />
            心愿清单
          </h1>
          <p className="page-subtitle">把想一起完成的事收进一张清单，慢慢勾掉也很有成就感。</p>
        </div>

        <div className="glass-panel progress-container">
          <span>完成进度</span>
          <div className="progress-bar">
            <motion.div className="progress-fill" initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.8 }} />
          </div>
          <span>{completedCount} / {wishes.length}</span>
        </div>

        <div className="action-bar wishlist-actions">
          <div className="filter-bar" style={{ marginBottom: 0 }}>
            {(['all', 'place', 'thing'] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setFilter(value)}
                className={`filter-btn ${filter === value ? 'active' : ''}`}
              >
                {value === 'all' ? '全部' : value === 'place' ? '想去的地方' : '想做的事'}
              </button>
            ))}
          </div>
          <button type="button" onClick={() => setIsAdding((prev) => !prev)} className="btn-outline">
            {isAdding ? <X size={16} strokeWidth={1.2} /> : <Plus size={16} strokeWidth={1.2} />}
            <span>{isAdding ? '取消' : '添加心愿'}</span>
          </button>
        </div>

        {isAdding ? (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="glass-panel form-panel">
            <h3 className="section-caption">写下一件想一起完成的事</h3>
            <div className="form-row">
              <button
                type="button"
                onClick={() => setNewWish((prev) => ({ ...prev, category: 'place' }))}
                className={`btn-outline ${newWish.category === 'place' ? 'active' : ''}`}
              >
                <MapPin size={16} strokeWidth={1.2} />
                想去的地方
              </button>
              <button
                type="button"
                onClick={() => setNewWish((prev) => ({ ...prev, category: 'thing' }))}
                className={`btn-outline ${newWish.category === 'thing' ? 'active' : ''}`}
              >
                <Heart size={16} strokeWidth={1.2} />
                想做的事
              </button>
            </div>
            <input
              type="text"
              placeholder="心愿标题"
              value={newWish.title}
              onChange={(event) => setNewWish((prev) => ({ ...prev, title: event.target.value }))}
              className="input-minimal"
            />
            <textarea
              placeholder="可以补一点细节，比如想怎么实现"
              value={newWish.description}
              onChange={(event) => setNewWish((prev) => ({ ...prev, description: event.target.value }))}
              className="input-minimal"
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="button" className="btn-outline" onClick={handleAddWish}>
                <Check size={16} strokeWidth={1.2} />
                确认添加
              </button>
            </div>
          </motion.div>
        ) : null}

        <div className="list-container">
          {filteredWishes.map((wish, index) => (
            <motion.div
              key={wish.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              className={`glass-panel list-item wish-item ${wish.completed ? 'completed' : ''}`}
            >
              <button
                type="button"
                onClick={() =>
                  setWishes((prev) =>
                    prev.map((item) =>
                      item.id === wish.id ? { ...item, completed: !item.completed } : item,
                    ),
                  )
                }
                className={`wish-checkbox ${wish.completed ? 'completed' : ''}`}
              >
                {wish.completed ? <Check size={12} strokeWidth={2} /> : null}
              </button>

              <div className="list-item-content">
                <div className="list-item-title">
                  {wish.category === 'place' ? <MapPin size={14} strokeWidth={1.2} /> : <Heart size={14} strokeWidth={1.2} />}
                  {wish.title}
                  {wish.title.includes('一起') ? <Sparkles size={14} strokeWidth={1.2} /> : null}
                </div>
                {wish.description ? <p className="list-item-desc">{wish.description}</p> : null}
                <div className="list-item-meta">{wish.createdAt}</div>
              </div>

              <button
                type="button"
                onClick={() => setWishes((prev) => prev.filter((item) => item.id !== wish.id))}
                className="list-item-action"
              >
                <X size={16} strokeWidth={1.2} />
              </button>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
