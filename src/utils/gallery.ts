export interface Photo {
  id: string;
  src: string;
  title?: string;
  date?: string;
  isFavorite?: boolean;
}

export const GALLERY_STORAGE_KEY = 'gallery-photos';
export const DEFAULT_PHOTO_COUNT = 49;

function toDefaultImageName(index: number) {
  return `pic-${String(index + 1).padStart(2, '0')}.jpg`;
}

function toDefaultPhoto(index: number): Photo {
  return {
    id: `pic-${index}`,
    src: `/pic/${toDefaultImageName(index)}`,
    title: `甜蜜瞬间 ${index + 1}`,
    isFavorite: false,
  };
}

export function getDefaultPhotos(): Photo[] {
  return Array.from({ length: DEFAULT_PHOTO_COUNT }, (_, index) => toDefaultPhoto(index));
}

export function normalizeStoredPhotos(photos: Photo[]): Photo[] {
  return photos.map((photo) => {
    if (photo.id.startsWith('pic-')) {
      const numericIndex = Number(photo.id.replace('pic-', ''));

      if (!Number.isNaN(numericIndex) && numericIndex >= 0 && numericIndex < DEFAULT_PHOTO_COUNT) {
        return {
          ...photo,
          src: `/pic/${toDefaultImageName(numericIndex)}`,
          title: photo.title || `甜蜜瞬间 ${numericIndex + 1}`,
        };
      }
    }

    return photo;
  });
}

export function getMemoryPhotoPool(count = 8): Photo[] {
  return getDefaultPhotos().slice(0, count);
}
