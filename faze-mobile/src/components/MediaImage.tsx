import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Image, ImageProps } from 'expo-image';
import { getFallbackImage, getImageSource } from '../utils/images';
import { useAuthStore } from '../store/useAuthStore';

interface MediaImageProps extends Omit<ImageProps, 'source'> {
  url?: string;
  mediaId?: string;
}

export default function MediaImage({ url, mediaId, style, ...props }: MediaImageProps) {
  const token = useAuthStore(state => state.token);
  
  // Initial source points to the backend proxy (or original url)
  const [source, setSource] = useState(() => getImageSource(url, mediaId, token));
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError) {
      // If the backend proxy fails (e.g. because of the redirect/header bug),
      // we immediately fall back to the direct Unsplash image URL.
      setHasError(true);
      setSource({ uri: getFallbackImage(mediaId || url) });
    }
  };

  return (
    <Image
      source={source}
      style={style}
      onError={handleError}
      {...props}
    />
  );
}
