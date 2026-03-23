import { useState } from 'react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Timeline from './pages/Timeline';
import Gallery from './pages/Gallery';
import Wishlist from './pages/Wishlist';
import Messages from './pages/Messages';

type PageType = 'home' | 'timeline' | 'gallery' | 'wishlist' | 'messages';

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
      default:
        return <Home />;
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar currentPage={currentPage} onPageChange={(page) => setCurrentPage(page as PageType)} />
      <main className="relative">
        {renderPage()}
      </main>
    </div>
  );
}

export default App;
