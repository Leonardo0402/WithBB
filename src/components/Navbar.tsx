import { useState } from 'react';
import { Home, Clock, Image, Gift, MessageCircle, Menu, X } from 'lucide-react';

interface NavbarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

const navItems = [
  { id: 'home', label: '首页', icon: Home },
  { id: 'timeline', label: '时光', icon: Clock },
  { id: 'gallery', label: '相册', icon: Image },
  { id: 'wishlist', label: '心愿', icon: Gift },
  { id: 'messages', label: '留言', icon: MessageCircle },
];

export default function Navbar({ currentPage, onPageChange }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="navbar glass-panel">
      <div className="navbar-container">
        <div className="navbar-logo">
          <span className="logo-text">我们的故事</span>
        </div>

        {/* Desktop Navigation */}
        <div className="navbar-links desktop-only">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onPageChange(item.id)}
                className={`nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon className="nav-icon" size={16} strokeWidth={isActive ? 2 : 1.5} />
                <span className="nav-label">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="mobile-menu-btn"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="mobile-menu glass-panel">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onPageChange(item.id);
                  setIsMenuOpen(false);
                }}
                className={`mobile-nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon className="nav-icon" size={18} strokeWidth={isActive ? 2 : 1.5} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </nav>
  );
}
