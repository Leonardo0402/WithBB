import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Quote, Send, Sparkles, Trash2 } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  author: string;
  createdAt: string;
  likes: number;
}

const STORAGE_KEY = 'messages';

const loveQuotes = [
  '遇见你，是我这段人生里最温柔的意外。',
  '和你一起过的日子，会把普通日常都变成节日。',
  '你出现之后，我开始认真珍惜每一次并肩。',
  '世界很大，但我想记住的中心总是你。',
  '如果要许愿，我希望今后的仪式感都和你有关。',
];

const defaultMessages: Message[] = [
  {
    id: '1',
    content: '今天也想认真记录一下，我很喜欢和你一起慢慢往前走。',
    author: '宝宝',
    createdAt: new Date().toISOString(),
    likes: 5,
  },
];

function readMessages() {
  const stored = localStorage.getItem(STORAGE_KEY);

  if (!stored) {
    return defaultMessages;
  }

  try {
    const parsed = JSON.parse(stored) as Message[];
    return parsed.length > 0 ? parsed : defaultMessages;
  } catch {
    return defaultMessages;
  }
}

function getRandomQuote() {
  return loveQuotes[Math.floor(Math.random() * loveQuotes.length)];
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor(diff / (1000 * 60));

  if (days > 0) return `${days} 天前`;
  if (hours > 0) return `${hours} 小时前`;
  if (minutes > 0) return `${minutes} 分钟前`;
  return '刚刚';
}

export default function Messages() {
  const [messages, setMessages] = useState<Message[]>(() => readMessages());
  const [newMessage, setNewMessage] = useState('');
  const [author, setAuthor] = useState('');
  const [randomQuote, setRandomQuote] = useState(() => getRandomQuote());

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !author.trim()) {
      return;
    }

    const message: Message = {
      id: Date.now().toString(),
      content: newMessage.trim(),
      author: author.trim(),
      createdAt: new Date().toISOString(),
      likes: 0,
    };

    setMessages((prev) => [message, ...prev]);
    setNewMessage('');
  };

  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="page-header">
          <h1 className="page-title">
            <MessageCircle className="text-charcoal-light" strokeWidth={1} />
            甜蜜留言
          </h1>
          <p className="page-subtitle">写一点只想留给对方看的话，让页面也有回信感。</p>
        </div>

        <motion.button
          type="button"
          className="glass-panel quote-panel"
          onClick={() => setRandomQuote(getRandomQuote())}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <Quote className="text-rose-gold" strokeWidth={1} />
          <p>{randomQuote}</p>
          <span>点击换一句</span>
        </motion.button>

        <div className="glass-panel form-panel">
          <div className="form-row">
            <input
              type="text"
              placeholder="你的名字"
              value={author}
              onChange={(event) => setAuthor(event.target.value)}
              className="input-minimal"
              style={{ flex: '0 0 180px' }}
            />
          </div>
          <textarea
            placeholder="想说的话写在这里……"
            value={newMessage}
            onChange={(event) => setNewMessage(event.target.value)}
            className="input-minimal"
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || !author.trim()}
              className="btn-outline"
            >
              <Send size={16} strokeWidth={1.2} />
              发送留言
            </button>
          </div>
        </div>

        <div className="list-container">
          <AnimatePresence mode="popLayout">
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ delay: index * 0.04 }}
                className="glass-panel list-item message-card"
              >
                <div className="message-card-top">
                  <div className="message-avatar">{message.author.charAt(0)}</div>
                  <div>
                    <h4>{message.author}</h4>
                    <span>{formatDate(message.createdAt)}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMessages((prev) => prev.filter((item) => item.id !== message.id))}
                    className="list-item-action"
                  >
                    <Trash2 size={16} strokeWidth={1.2} />
                  </button>
                </div>

                <p className="message-content">{message.content}</p>

                <div className="message-card-bottom">
                  <button
                    type="button"
                    className="list-item-action message-like-button"
                    onClick={() =>
                      setMessages((prev) =>
                        prev.map((item) =>
                          item.id === message.id ? { ...item, likes: item.likes + 1 } : item,
                        ),
                      )
                    }
                  >
                    <Heart size={14} strokeWidth={1.2} fill={message.likes > 0 ? 'var(--rose-gold)' : 'none'} />
                    <span>{message.likes > 0 ? message.likes : '点个喜欢'}</span>
                  </button>
                  <Sparkles size={14} strokeWidth={1.2} className="text-charcoal-light" />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
