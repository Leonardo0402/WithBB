import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image as ImageIcon, X, Heart, Upload, Grid, LayoutGrid, RefreshCw } from 'lucide-react';

interface Photo {
  id: string;
  src: string;
  title?: string;
  date?: string;
  isFavorite?: boolean;
}

export const loadImagesFromPublic = async (): Promise<Photo[]> => {
  try {
    const response = await fetch('/pic/');
    if (response.ok) {
      const text = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, 'text/html');
      const links = doc.querySelectorAll('a');
      const images: Photo[] = [];
      links.forEach((link, index) => {
        const href = link.getAttribute('href');
        if (href && /\.(jpg|jpeg|png|gif|webp)$/i.test(href)) {
          images.push({
            id: `pic-${index}`, src: `/pic/${href}`, title: `美好瞬间 ${index + 1}`, isFavorite: false,
          });
        }
      });
      return images;
    }
  } catch (error) {
    console.log('无法自动加载图片列表');
  }
  return [];
};

const getDefaultImages = (): Photo[] => {
  const imageFiles = [
    '微信图片_20260322204303_808_104.jpg', '微信图片_20260322204307_812_104.jpg', '微信图片_20260322204308_813_104.jpg',
    '微信图片_20260322204309_814_104.jpg', '微信图片_20260322204310_815_104.jpg', '微信图片_20260322204312_816_104.jpg',
    '微信图片_20260322204313_817_104.jpg', '微信图片_20260322204314_818_104.jpg', '微信图片_20260322204315_819_104.jpg',
    '微信图片_20260322204316_820_104.jpg', '微信图片_20260322204317_821_104.jpg', '微信图片_20260322204319_822_104.jpg',
    '微信图片_20260322204320_823_104.jpg', '微信图片_20260322204321_824_104.jpg', '微信图片_20260322204322_825_104.jpg',
    '微信图片_20260322204323_826_104.jpg', '微信图片_20260322204324_827_104.jpg', '微信图片_20260322204325_828_104.jpg',
    '微信图片_20260322204326_829_104.jpg', '微信图片_20260322204328_830_104.jpg', '微信图片_20260322204329_831_104.jpg',
    '微信图片_20260322204330_832_104.jpg', '微信图片_20260322204332_833_104.jpg', '微信图片_20260322204334_834_104.jpg',
    '微信图片_20260322204335_835_104.jpg', '微信图片_20260322204336_836_104.jpg', '微信图片_20260322204337_837_104.jpg',
    '微信图片_20260322204338_838_104.jpg', '微信图片_20260322204340_839_104.jpg', '微信图片_20260322204341_840_104.jpg',
    '微信图片_20260322204342_841_104.jpg', '微信图片_20260322204343_842_104.jpg', '微信图片_20260322204344_843_104.jpg',
    '微信图片_20260322204345_844_104.jpg', '微信图片_20260322204347_845_104.jpg', '微信图片_20260322204348_846_104.jpg',
    '微信图片_20260322204349_847_104.jpg', '微信图片_20260322204350_848_104.jpg', '微信图片_20260322204352_849_104.jpg',
    '微信图片_20260322204353_850_104.jpg', '微信图片_20260322204354_851_104.jpg', '微信图片_20260322204355_852_104.jpg',
    '微信图片_20260322204356_853_104.jpg', '微信图片_20260322204357_854_104.jpg', '微信图片_20260322204358_855_104.jpg',
    '微信图片_20260322204400_856_104.jpg', '微信图片_20260322204401_857_104.jpg', '微信图片_20260322204402_858_104.jpg',
    '微信图片_20260322204403_859_104.jpg',
  ];
  return imageFiles.map((filename, index) => ({
    id: `pic-${index}`,
    src: `/pic/${filename}`,
    title: `美好瞬间 ${index + 1}`,
    isFavorite: false,
  }));
};

export default function Gallery() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'masonry'>('masonry');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedPhotos = localStorage.getItem('gallery-photos');
    if (savedPhotos) {
      const parsed = JSON.parse(savedPhotos);
      if (parsed.length > 0) {
        setPhotos(parsed);
        setIsLoading(false);
        return;
      }
    }
    const defaultImages = getDefaultImages();
    setPhotos(defaultImages);
    localStorage.setItem('gallery-photos', JSON.stringify(defaultImages));
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (photos.length > 0) {
      localStorage.setItem('gallery-photos', JSON.stringify(photos));
    }
  }, [photos]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const newPhoto: Photo = {
            id: `upload-${Date.now()}-${Math.random()}`,
            src: e.target?.result as string,
            title: file.name.split('.')[0],
            date: new Date().toISOString().split('T')[0],
            isFavorite: false,
          };
          setPhotos((prev) => [newPhoto, ...prev]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPhotos((prev) =>
      prev.map((photo) =>
        photo.id === id ? { ...photo, isFavorite: !photo.isFavorite } : photo
      )
    );
  };

  const deletePhoto = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPhotos((prev) => prev.filter((photo) => photo.id !== id));
    if (selectedPhoto?.id === id) {
      setSelectedPhoto(null);
    }
  };

  const refreshPhotos = () => {
    setIsLoading(true);
    const defaultImages = getDefaultImages();
    setPhotos(defaultImages);
    localStorage.setItem('gallery-photos', JSON.stringify(defaultImages));
    setIsLoading(false);
  };

  return (
    <div className="page-container" style={{ maxWidth: '1000px' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        
        <div className="page-header">
          <h1 className="page-title">
            <ImageIcon className="text-charcoal-light" strokeWidth={1} />
            甜蜜相册
          </h1>
          <p className="page-subtitle">记录我们的每一个美好瞬间</p>
        </div>

        <div className="action-bar" style={{ justifyContent: 'space-between' }}>
          <div className="filter-bar" style={{ marginBottom: 0 }}>
            <button
              onClick={() => setViewMode('grid')}
              className={`filter-btn ${viewMode === 'grid' ? 'active' : ''}`}
            >
              <Grid size={14} strokeWidth={1} />
            </button>
            <button
              onClick={() => setViewMode('masonry')}
              className={`filter-btn ${viewMode === 'masonry' ? 'active' : ''}`}
            >
              <LayoutGrid size={14} strokeWidth={1} />
            </button>
            <button onClick={refreshPhotos} className="filter-btn" style={{ padding: '6px 10px' }} title="刷新图片">
              <RefreshCw size={14} strokeWidth={1} />
            </button>
          </div>

          <label className="btn-outline cursor-pointer relative" style={{ overflow: 'hidden' }}>
            <Upload size={16} strokeWidth={1} />
            <span>上传照片</span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileUpload}
              style={{ position: 'absolute', opacity: 0, left: 0, top: 0, width: '100%', height: '100%', cursor: 'pointer' }}
            />
          </label>
        </div>

        <div className="text-center mb-8">
          <span className="text-charcoal-light text-sm tracking-wide">
            共 <span className="font-serif text-charcoal">{photos.length}</span> 张照片
          </span>
        </div>

        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', height: '200px', alignItems: 'center' }}>
            <div className="spinner" style={{ width: '30px', height: '30px', border: '1px solid var(--rose-gold)', borderRightColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
          </div>
        ) : photos.length === 0 ? (
          <div className="empty-state">
            <ImageIcon size={32} strokeWidth={1} />
            <p>还没有照片，快上传一些美好回忆吧！</p>
            <button onClick={refreshPhotos} className="btn-outline mt-4">
              <RefreshCw size={14} strokeWidth={1} /> 重新加载
            </button>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'gallery-grid' : 'gallery-masonry'}>
            {photos.map((photo, index) => (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.03 }}
                className={`${viewMode === 'grid' ? 'gallery-item' : 'gallery-masonry-item'} glass-panel`}
                onClick={() => setSelectedPhoto(photo)}
              >
                <img
                  src={photo.src}
                  alt={photo.title}
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Crect width="100" height="100" fill="%23FCFAFA"/%3E%3Ctext x="50" y="50" font-size="12" fill="%23B76E79" text-anchor="middle" dy=".3em"%3E加载失败%3C/text%3E%3C/svg%3E';
                  }}
                />
                
                <div className="gallery-overlay">
                  <div>
                    <p className="gallery-title">{photo.title}</p>
                    {photo.date && <p className="text-xs text-charcoal-light mt-1">{photo.date}</p>}
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={(e) => toggleFavorite(photo.id, e)} className="list-item-action">
                      <Heart size={16} strokeWidth={1} fill={photo.isFavorite ? 'var(--rose-gold)' : 'none'} color={photo.isFavorite ? 'var(--rose-gold)' : 'currentColor'} />
                    </button>
                    <button onClick={(e) => deletePhoto(photo.id, e)} className="list-item-action">
                      <X size={16} strokeWidth={1} />
                    </button>
                  </div>
                </div>

                {photo.isFavorite && (
                  <div style={{ position: 'absolute', top: '12px', left: '12px' }}>
                    <Heart size={14} strokeWidth={1} fill="var(--rose-gold)" color="var(--rose-gold)" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(252, 250, 250, 0.9)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}
            onClick={() => setSelectedPhoto(null)}
          >
            <button
              style={{ position: 'absolute', top: '40px', right: '40px', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--charcoal)' }}
              onClick={() => setSelectedPhoto(null)}
            >
              <X size={24} strokeWidth={1} />
            </button>
            
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              style={{ position: 'relative', maxWidth: '100%', maxHeight: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedPhoto.src}
                alt={selectedPhoto.title}
                style={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain', borderRadius: '4px', boxShadow: 'var(--shadow-subtle)' }}
              />
              {(selectedPhoto.title || selectedPhoto.date) && (
                <div style={{ marginTop: '20px', textAlign: 'center' }}>
                  {selectedPhoto.title && <p className="font-serif text-charcoal">{selectedPhoto.title}</p>}
                  {selectedPhoto.date && <p className="text-xs text-charcoal-light mt-1 tracking-widest">{selectedPhoto.date}</p>}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
