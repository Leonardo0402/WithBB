import { useState } from 'react';
import { Clock, Gamepad2, Gift, Home, Image, Menu, MessageCircle, X } from 'lucide-react';
import type { PageType } from '../types/app';

interface NavbarProps {
  currentPage: PageType;
  onPageChange: (page: PageType) => void;
}

const navItems: Array<{ id: PageType; label: string; icon: typeof Home }> = [
  { id: 'home', label: '首页', icon: Home },
  { id: 'timeline', label: '时光', icon: Clock },
  { id: 'gallery', label: '相册', icon: Image },
  { id: 'wishlist', label: '心愿', icon: Gift },
  { id: 'messages', label: '留言', icon: MessageCircle },
  { id: 'games', label: '游戏', icon: Gamepad2 },
];

export default function Navbar({ currentPage, onPageChange }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handlePageChange = (page: PageType) => {
    onPageChange(page);
    setIsMenuOpen(false);
  };

  return (
    <nav className="navbar glass-panel">
      <div className="navbar-container">
        <div className="navbar-logo">
          <span className="logo-text">我们的故事</span>
        </div>

        <div className="navbar-links desktop-only">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handlePageChange(item.id)}
                className={`nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon className="nav-icon" size={16} strokeWidth={isActive ? 2 : 1.5} />
                <span className="nav-label">{item.label}</span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          className="mobile-menu-btn"
          onClick={() => setIsMenuOpen((prev) => !prev)}
          aria-label="切换导航菜单"
        >
          {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {isMenuOpen && (
        <div className="mobile-menu glass-panel">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handlePageChange(item.id)}
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
