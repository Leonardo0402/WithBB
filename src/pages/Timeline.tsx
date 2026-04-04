import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Plus, X } from 'lucide-react';

interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  location?: string;
  isSpecial?: boolean;
}

const STORAGE_KEY = 'timeline-events';

const initialEvents: TimelineEvent[] = [
  {
    id: '1',
    date: '2025-12-14',
    title: '我们的开始',
    description: '从这一天起，故事终于有了双人章节。',
    isSpecial: true,
  },
  {
    id: '2',
    date: '2026-02-14',
    title: '第一份节日仪式感',
    description: '一起认真过节，从礼物到散步都变得值得反复记住。',
    location: '徐州',
    isSpecial: true,
  },
];

const DiamondHeart = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-rose-gold inline" style={{ width: '14px', height: '14px' }}>
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" />
  </svg>
);

function readEvents() {
  const stored = localStorage.getItem(STORAGE_KEY);

  if (!stored) {
    return initialEvents;
  }

  try {
    const parsed = JSON.parse(stored) as TimelineEvent[];
    return parsed.length > 0 ? parsed : initialEvents;
  } catch {
    return initialEvents;
  }
}

export default function Timeline() {
  const [events, setEvents] = useState<TimelineEvent[]>(() => readEvents());
  const [isAdding, setIsAdding] = useState(false);
  const [newEvent, setNewEvent] = useState<Partial<TimelineEvent>>({
    date: '',
    title: '',
    description: '',
    location: '',
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  }, [events]);

  const handleAddEvent = () => {
    if (!newEvent.date || !newEvent.title || !newEvent.description) {
      return;
    }

    const event: TimelineEvent = {
      id: Date.now().toString(),
      date: newEvent.date,
      title: newEvent.title,
      description: newEvent.description,
      location: newEvent.location,
      isSpecial: false,
    };

    setEvents((prev) =>
      [...prev, event].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    );
    setNewEvent({ date: '', title: '', description: '', location: '' });
    setIsAdding(false);
  };

  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ width: '100%' }}>
        <div className="page-header">
          <h1 className="page-title">
            <Calendar className="text-charcoal-light" strokeWidth={1} />
            我们的时光
          </h1>
          <p className="page-subtitle">把值得纪念的事按顺序排开，回头看就知道走了多远。</p>
        </div>

        <div className="action-bar">
          <button type="button" onClick={() => setIsAdding((prev) => !prev)} className="btn-outline">
            {isAdding ? <X size={16} strokeWidth={1} /> : <Plus size={16} strokeWidth={1} />}
            <span>{isAdding ? '取消' : '添加回忆'}</span>
          </button>
        </div>

        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="glass-panel form-panel"
            style={{ overflow: 'hidden' }}
          >
            <h3 className="section-caption">补一条新的时光节点</h3>
            <div className="form-row">
              <input
                type="date"
                value={newEvent.date}
                onChange={(event) => setNewEvent({ ...newEvent, date: event.target.value })}
                className="input-minimal"
              />
              <input
                type="text"
                placeholder="地点（可选）"
                value={newEvent.location}
                onChange={(event) => setNewEvent({ ...newEvent, location: event.target.value })}
                className="input-minimal"
              />
            </div>
            <input
              type="text"
              placeholder="标题"
              value={newEvent.title}
              onChange={(event) => setNewEvent({ ...newEvent, title: event.target.value })}
              className="input-minimal"
            />
            <textarea
              placeholder="写一点当时的细节"
              value={newEvent.description}
              onChange={(event) => setNewEvent({ ...newEvent, description: event.target.value })}
              className="input-minimal"
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="button" onClick={handleAddEvent} className="btn-outline">
                保存回忆
              </button>
            </div>
          </motion.div>
        )}

        <div className="timeline-wrapper">
          <div className="timeline-line" />
          <div>
            {events.map((event, index) => {
              const date = new Date(event.date);
              const isLeft = index % 2 === 0;

              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                  className={`timeline-item ${isLeft ? 'left' : 'right'}`}
                >
                  <div className="timeline-dot">
                    <div className="timeline-dot-inner" />
                  </div>

                  <div className="timeline-content">
                    <div className="glass-panel" style={{ padding: '24px', position: 'relative' }}>
                      <div className="timeline-date-block">
                        <span className="timeline-date">
                          {date.getFullYear()}.{String(date.getMonth() + 1).padStart(2, '0')}.{String(date.getDate()).padStart(2, '0')}
                        </span>
                        {event.isSpecial ? <DiamondHeart /> : null}
                      </div>

                      <h3 className="section-title">{event.title}</h3>
                      <p className="body-copy">{event.description}</p>

                      {event.location ? (
                        <div className="timeline-location">
                          <MapPin size={12} strokeWidth={1} />
                          <span>{event.location}</span>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
