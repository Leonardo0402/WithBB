import { useState } from 'react';
import Navbar from './components/Navbar';
import Gallery from './pages/Gallery';
import Games from './pages/Games';
import Home from './pages/Home';
import Messages from './pages/Messages';
import Timeline from './pages/Timeline';
import Wishlist from './pages/Wishlist';
import type { PageType } from './types/app';

function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('home');

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home />;
      case 'timeline':
        return <Timeline />;
      case 'gallery':
        return <Gallery />;
      case 'wishlist':
        return <Wishlist />;
      case 'messages':
        return <Messages />;
      case 'games':
        return <Games />;
      default:
        return <Home />;
    }
  };

  return (
    <div className="app-shell">
      <Navbar currentPage={currentPage} onPageChange={setCurrentPage} />
      <main className="relative">{renderPage()}</main>
    </div>
  );
}

export default App;
