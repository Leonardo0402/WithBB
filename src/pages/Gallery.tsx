import { useEffect, useState } from 'react';
import type { ChangeEvent, MouseEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Grid3x3, Heart, Image as ImageIcon, LayoutGrid, RefreshCw, Upload, X } from 'lucide-react';
import {
  GALLERY_STORAGE_KEY,
  getDefaultPhotos,
  normalizeStoredPhotos,
  type Photo,
} from '../utils/gallery';

function readPhotos() {
  const stored = localStorage.getItem(GALLERY_STORAGE_KEY);

  if (!stored) {
    return getDefaultPhotos();
  }

  try {
    const parsed = JSON.parse(stored) as Photo[];
    return parsed.length > 0 ? normalizeStoredPhotos(parsed) : getDefaultPhotos();
  } catch {
    return getDefaultPhotos();
  }
}

export default function Gallery() {
  const [photos, setPhotos] = useState<Photo[]>(() => readPhotos());
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'masonry'>('masonry');

  useEffect(() => {
    localStorage.setItem(GALLERY_STORAGE_KEY, JSON.stringify(photos));
  }, [photos]);

  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;

    if (!files) {
      return;
    }

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        const newPhoto: Photo = {
          id: `upload-${Date.now()}-${Math.random()}`,
          src: String(loadEvent.target?.result ?? ''),
          title: file.name.replace(/\.[^/.]+$/, ''),
          date: new Date().toISOString().split('T')[0],
          isFavorite: false,
        };

        setPhotos((prev) => [newPhoto, ...prev]);
      };
      reader.readAsDataURL(file);
    });

    event.target.value = '';
  };

  const toggleFavorite = (id: string, event: MouseEvent) => {
    event.stopPropagation();
    setPhotos((prev) =>
      prev.map((photo) =>
        photo.id === id ? { ...photo, isFavorite: !photo.isFavorite } : photo,
      ),
    );
  };

  const deletePhoto = (id: string, event: MouseEvent) => {
    event.stopPropagation();
    setPhotos((prev) => prev.filter((photo) => photo.id !== id));
    setSelectedPhoto((prev) => (prev?.id === id ? null : prev));
  };

  const resetPhotos = () => {
    const defaults = getDefaultPhotos();
    setPhotos(defaults);
    setSelectedPhoto(null);
  };

  return (
    <div className="page-container gallery-page">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="page-header">
          <h1 className="page-title">
            <ImageIcon className="text-charcoal-light" strokeWidth={1} />
            甜蜜相册
          </h1>
          <p className="page-subtitle">把照片放进页面里，也把回忆做成可以反复翻看的墙面。</p>
        </div>

        <div className="action-bar gallery-actions">
          <div className="filter-bar" style={{ marginBottom: 0 }}>
            <button type="button" onClick={() => setViewMode('grid')} className={`filter-btn ${viewMode === 'grid' ? 'active' : ''}`}>
              <Grid3x3 size={14} strokeWidth={1.2} />
              宫格
            </button>
            <button type="button" onClick={() => setViewMode('masonry')} className={`filter-btn ${viewMode === 'masonry' ? 'active' : ''}`}>
              <LayoutGrid size={14} strokeWidth={1.2} />
              瀑布流
            </button>
            <button type="button" onClick={resetPhotos} className="filter-btn">
              <RefreshCw size={14} strokeWidth={1.2} />
              重置
            </button>
          </div>

          <label className="btn-outline upload-button">
            <Upload size={16} strokeWidth={1.2} />
            <span>上传照片</span>
            <input type="file" accept="image/*" multiple onChange={handleFileUpload} />
          </label>
        </div>

        <p className="gallery-summary">当前共有 {photos.length} 张照片，点击任意图片可放大查看。</p>

        {photos.length === 0 ? (
          <div className="empty-state">
            <ImageIcon size={32} strokeWidth={1} />
            <p>这里还没有照片，先上传几张你最喜欢的合照吧。</p>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'gallery-grid' : 'gallery-masonry'}>
            {photos.map((photo, index) => (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.02 }}
                className={`${viewMode === 'grid' ? 'gallery-item' : 'gallery-masonry-item'} glass-panel`}
                onClick={() => setSelectedPhoto(photo)}
              >
                <img src={photo.src} alt={photo.title ?? '相册图片'} loading="lazy" />
                <div className="gallery-overlay">
                  <div>
                    <p className="gallery-title">{photo.title ?? '甜蜜瞬间'}</p>
                    {photo.date ? <p className="gallery-meta">{photo.date}</p> : null}
                  </div>
                  <div className="gallery-actions-inline">
                    <button type="button" onClick={(event) => toggleFavorite(photo.id, event)} className="list-item-action">
                      <Heart size={16} strokeWidth={1.2} fill={photo.isFavorite ? 'var(--rose-gold)' : 'none'} />
                    </button>
                    <button type="button" onClick={(event) => deletePhoto(photo.id, event)} className="list-item-action">
                      <X size={16} strokeWidth={1.2} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {selectedPhoto ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="gallery-lightbox"
            onClick={() => setSelectedPhoto(null)}
          >
            <button type="button" className="gallery-close" onClick={() => setSelectedPhoto(null)}>
              <X size={24} strokeWidth={1.2} />
            </button>
            <motion.div
              initial={{ scale: 0.96 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.96 }}
              className="gallery-lightbox-content"
              onClick={(event) => event.stopPropagation()}
            >
              <img src={selectedPhoto.src} alt={selectedPhoto.title ?? '相册图片'} />
              <div className="gallery-lightbox-meta">
                <p>{selectedPhoto.title ?? '甜蜜瞬间'}</p>
                {selectedPhoto.date ? <span>{selectedPhoto.date}</span> : null}
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
