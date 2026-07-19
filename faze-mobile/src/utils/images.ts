const NATURE_IMAGES = [
  // Nature & Landscapes
  'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800&q=80',
  'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=800&q=80',
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80',
  // Mountains
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80',
  'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=800&q=80',
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&q=80',
  // Ocean / Water
  'https://images.unsplash.com/photo-1439405326854-014607f694d7?w=800&q=80',
  'https://images.unsplash.com/photo-1498623116890-37e912163d5d?w=800&q=80',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
  // Abstract / Colorful
  'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800&q=80',
  'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=800&q=80',
  'https://images.unsplash.com/photo-1563089145-599997674d42?w=800&q=80',
  // City / Architecture
  'https://images.unsplash.com/photo-1449844908441-8829872d2607?w=800&q=80',
  'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80',
  'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800&q=80',
];

const BASE_URL = 'https://faze-backend.onrender.com/api';

export const getFallbackImage = (id?: string): string => {
  let hash = 0;
  if (id) {
    for (let i = 0; i < id.length; i++) {
      hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
  }
  const index = Math.abs(hash) % NATURE_IMAGES.length;
  return NATURE_IMAGES[index];
};

export const getImageUrl = (url?: string, id?: string): string => {
  let finalUrl = '';
  if (url) {
    if (url.startsWith('http') || url.startsWith('data:')) {
      finalUrl = url;
    } else {
      finalUrl = `${BASE_URL}/media/proxy?key=${encodeURIComponent(url)}`;
    }
  } else {
    finalUrl = getFallbackImage(id);
  }
  return finalUrl;
};

export const getImageSource = (url?: string, id?: string, token?: string | null) => {
  const finalUrl = getImageUrl(url, id);
  const isBackendUrl = finalUrl.includes('faze-backend.onrender.com');
  
  return {
    uri: finalUrl,
    ...(isBackendUrl && token ? { headers: { Authorization: `Bearer ${token}` } } : {})
  };
};

export const getDownloadHeaders = (url: string, token?: string | null): Record<string, string> | undefined => {
  const isBackendUrl = url.includes('faze-backend.onrender.com');
  return isBackendUrl && token ? { Authorization: `Bearer ${token}` } : undefined;
};
