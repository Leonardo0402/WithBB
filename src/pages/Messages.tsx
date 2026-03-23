import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Heart, Send, Sparkles, Trash2, Quote } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  author: string;
  createdAt: string;
  likes: number;
}

const loveQuotes = [
  '遇见你，是我这辈子最美好的意外。',
  '我想和你一起，走过每一个春夏秋冬。',
  '有你在身边，每一天都是情人节。',
  '你是我心中最柔软的地方。',
  '愿我们的爱情，像星星一样永恒。',
  '和你在一起的每一秒，都是幸福的。',
  '你是我想要共度余生的人。',
  '爱情不是寻找完美的人，而是学会用完美的眼光看待不完美的人。',
];

const initialMessages: Message[] = [
  {
    id: '1',
    content: '今天也是爱你的一天！',
    author: '宝宝',
    createdAt: new Date().toISOString(),
    likes: 5,
  },
];

export default function Messages() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [newMessage, setNewMessage] = useState('');
  const [author, setAuthor] = useState('');
  const [randomQuote, setRandomQuote] = useState('');

  useEffect(() => {
    const savedMessages = localStorage.getItem('messages');
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    }
    setRandomQuote(loveQuotes[Math.floor(Math.random() * loveQuotes.length)]);
  }, []);

  useEffect(() => {
    localStorage.setItem('messages', JSON.stringify(messages));
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim() && author.trim()) {
      const message: Message = {
        id: Date.now().toString(),
        content: newMessage.trim(),
        author: author.trim(),
        createdAt: new Date().toISOString(),
        likes: 0,
      };
      setMessages([message, ...messages]);
      setNewMessage('');
    }
  };

  const handleLike = (id: string) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === id ? { ...msg, likes: msg.likes + 1 } : msg
      )
    );
  };

  const handleDelete = (id: string) => {
    setMessages((prev) => prev.filter((msg) => msg.id !== id));
  };

  const refreshQuote = () => {
    setRandomQuote(loveQuotes[Math.floor(Math.random() * loveQuotes.length)]);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));

    if (days > 0) return `${days}天前`;
    if (hours > 0) return `${hours}小时前`;
    if (minutes > 0) return `${minutes}分钟前`;
    return '刚刚';
  };

  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        
        <div className="page-header">
          <h1 className="page-title">
            <MessageCircle className="text-charcoal-light" strokeWidth={1} />
            甜蜜留言
          </h1>
          <p className="page-subtitle">写下想对对方说的话</p>
        </div>

        <motion.div
          className="glass-panel"
          style={{ padding: '32px', textAlign: 'center', cursor: 'pointer', marginBottom: '40px' }}
          onClick={refreshQuote}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <Quote className="text-rose-gold mx-auto mb-4" strokeWidth={1} />
          <p className="font-serif text-charcoal italic mb-3" style={{ fontSize: '1.1rem', letterSpacing: '0.05em' }}>
            "{randomQuote}"
          </p>
          <p className="text-xs text-charcoal-light tracking-wide">点击切换</p>
        </motion.div>

        <div className="glass-panel form-panel">
          <div className="form-row">
            <input
              type="text"
              placeholder="你的名字"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="input-minimal"
              style={{ flex: '0 0 150px' }}
            />
          </div>
          <textarea
            placeholder="写下你想说的话..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="input-minimal"
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || !author.trim()}
              className="btn-outline"
              style={{ opacity: (!newMessage.trim() || !author.trim()) ? 0.5 : 1 }}
            >
              <Send size={16} strokeWidth={1} /> 发送留言
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
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
                className="glass-panel list-item"
                style={{ flexDirection: 'column', gap: '12px' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ 
                      width: '32px', height: '32px', 
                      borderRadius: '50%', border: '1px solid var(--rose-gold)', 
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: 'var(--serif)', color: 'var(--rose-gold)', fontSize: '0.9rem'
                    }}>
                      {message.author.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-charcoal font-serif">{message.author}</h4>
                      <span className="text-xs text-charcoal-light" style={{ letterSpacing: '0.05em' }}>
                        {formatDate(message.createdAt)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(message.id)}
                    className="list-item-action"
                  >
                    <Trash2 size={16} strokeWidth={1} />
                  </button>
                </div>

                <p className="text-charcoal-light my-2 leading-relaxed whitespace-pre-wrap font-serif">
                  {message.content}
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                  <button
                    onClick={() => handleLike(message.id)}
                    className="list-item-action"
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}
                  >
                    <Heart
                      size={14}
                      strokeWidth={1}
                      fill={message.likes > 0 ? 'var(--rose-gold)' : 'none'}
                      color={message.likes > 0 ? 'var(--rose-gold)' : 'currentColor'}
                    />
                    <span style={{ color: message.likes > 0 ? 'var(--rose-gold)' : '' }}>
                      {message.likes > 0 ? message.likes : '点赞'}
                    </span>
                  </button>
                  <Sparkles size={14} strokeWidth={1} className="text-charcoal-light" style={{ opacity: 0.5 }} />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {messages.length === 0 && (
          <div className="empty-state">
            <MessageCircle size={32} strokeWidth={1} />
            <p>还没有留言，来写第一条吧！</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
