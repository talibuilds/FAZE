import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Dimensions } from 'react-native';
import MediaImage from '../components/MediaImage';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { apiClient } from '../api/client';
import Header from '../components/Header';
import { useAuthStore } from '../store/useAuthStore';
import { Ionicons } from '@expo/vector-icons';
import { getImageUrl, getImageSource, getDownloadHeaders } from '../utils/images';
import { getIndianName } from '../utils/helpers';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

type DetailRouteProp = RouteProp<RootStackParamList, 'Detail'>;
const { width } = Dimensions.get('window');

export default function DetailScreen() {
  const route = useRoute<DetailRouteProp>();
  const navigation = useNavigation();
  const { mediaId } = route.params;
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const token = useAuthStore(state => state.token);
  const user = useAuthStore(state => state.user);
  
  // We don't have the media details natively passed via params in this simple setup.
  // In a real app we'd fetch media details (title, price, previewUrl) first.
  // For the sake of matching the UI exactly, let's fetch feed again to find this media.
  const [mediaData, setMediaData] = useState<any>(null);
  const setBalance = useAuthStore(state => state.setBalance);

  const fetchOriginal = async () => {
    try {
      const response = await apiClient.get(`/media/${mediaId}/original`);
      setOriginalUrl(response.data.data.originalUrl);
    } catch (err: any) {
      if (err.response?.status === 403) {
        setOriginalUrl(null);
      } else {
        console.error(err);
      }
    }
  };

  const fetchDetails = async () => {
    try {
      // Inefficient, but works for our simple assignment. Finding the item in the feed.
      const feedRes = await apiClient.get('/media/feed');
      const item = feedRes.data.data.find((m: any) => m.id === mediaId);
      if (item) setMediaData(item);
    } catch (err) {
      console.error(err);
    }
  };

  const loadData = async () => {
    setLoading(true);
    await Promise.all([fetchOriginal(), fetchDetails()]);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [mediaId]);

  const handlePurchase = async () => {
    setLoading(true);
    try {
      await apiClient.post(`/media/${mediaId}/unlock`);
      
      // Update wallet balance locally after purchase
      const walletRes = await apiClient.get('/wallet');
      setBalance(walletRes.data.data.walletBalance);

      await fetchOriginal();
    } catch (err: any) {
      Alert.alert('Purchase Failed', err.response?.data?.error?.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      "Delete Media",
      "Are you sure you want to delete this media?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            try {
              await apiClient.delete(`/media/${mediaId}`);
              Alert.alert('Deleted', 'Media has been deleted.');
              navigation.goBack();
            } catch (err: any) {
              console.error(err);
              Alert.alert('Error', 'Failed to delete media.');
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleDownload = async () => {
    try {
      const uriToDownload = getImageUrl(originalUrl || mediaData?.originalUrl, mediaId); 
      const fileUri = (FileSystem as any).documentDirectory + `faze_${mediaId}.jpg`;
      
      if (uriToDownload.startsWith('data:')) {
        const base64Data = uriToDownload.split(',')[1];
        await FileSystem.writeAsStringAsync(fileUri, base64Data, { encoding: FileSystem.EncodingType.Base64 });
      } else {
        await FileSystem.downloadAsync(uriToDownload, fileUri, {
          headers: getDownloadHeaders(uriToDownload, token)
        });
      }
      
      Alert.alert('Success', 'Image saved to your Gallery!');
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to save image.');
    }
  };

  const handleShare = async () => {
    try {
      const uriToDownload = getImageUrl(originalUrl || mediaData?.originalUrl, mediaId); 
      const fileUri = (FileSystem as any).documentDirectory + `faze_share_${mediaId}.jpg`;
      
      let shareUri = fileUri;
      if (uriToDownload.startsWith('data:')) {
        const base64Data = uriToDownload.split(',')[1];
        await FileSystem.writeAsStringAsync(fileUri, base64Data, { encoding: FileSystem.EncodingType.Base64 });
      } else {
        const result = await FileSystem.downloadAsync(uriToDownload, fileUri, {
          headers: getDownloadHeaders(uriToDownload, token)
        });
        shareUri = result.uri;
      }
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(shareUri);
      } else {
        Alert.alert('Error', 'Sharing is not available on this device');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to share image.');
    }
  };

  if (loading || !mediaData) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#D4AF37" /></View>;
  }

  const isUnlocked = !!originalUrl;
  const isOwner = user?.email === mediaData?.ownerEmail;

  return (
    <View style={styles.container}>
      <Header showBack />

      <View style={styles.imageSection}>
        {isUnlocked ? (
          <MediaImage 
            url={originalUrl}
            mediaId={mediaId}
            style={styles.fullImage} 
            contentFit="contain" 
            transition={200}
          />
        ) : (
          <View style={styles.lockedImageContainer}>
            <MediaImage 
              url={mediaData.previewUrl}
              mediaId={mediaId}
              style={styles.fullImage} 
              contentFit="cover" 
              transition={200}
            />
            <View style={styles.lockOverlay}>
              <View style={styles.lockCircleLarge}>
                <Ionicons name="lock-closed-outline" size={40} color="#D4AF37" />
              </View>
              <Text style={styles.tapToUnlock}>Pay to make it yours</Text>
            </View>
          </View>
        )}
      </View>

      <View style={styles.detailsSection}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{mediaData.title || 'Untitled Art'}</Text>
          {isOwner && (
            <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
              <Ionicons name="trash-outline" size={24} color="#F44336" />
            </TouchableOpacity>
          )}
        </View>
        <Text style={styles.ownerText}>Created by: {mediaData.ownerEmail ? mediaData.ownerEmail.split('@')[0] : 'Unknown'}</Text>
        
        {isUnlocked ? (
          <>
            <View style={styles.unlockedBadge}>
              <Text style={styles.unlockedBadgeText}>Unlocked</Text>
            </View>
            <Text style={styles.description}>
              {mediaData.description || 'No description provided.'}
            </Text>
            <View style={styles.actionButtonsContainer}>
                <TouchableOpacity style={styles.actionButton} onPress={handleDownload}>
                  <Ionicons name="download-outline" size={24} color="#000" />
                  <Text style={styles.actionButtonText}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
                  <Ionicons name="share-outline" size={24} color="#000" />
                  <Text style={styles.actionButtonText}>Share</Text>
                </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            <Text style={styles.description}>
              {mediaData.description || 'No description provided.'}
            </Text>
            <TouchableOpacity style={styles.purchaseBtn} onPress={handlePurchase}>
              <Text style={styles.purchaseBtnText}>Unlock for {mediaData.price} coins</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
  
  imageSection: { width: width, height: width, backgroundColor: '#111' },
  fullImage: { width: '100%', height: '100%' },
  
  lockedImageContainer: { flex: 1, position: 'relative' },
  blurredImage: { width: '100%', height: '100%', opacity: 0.7 },
  lockOverlay: { ...StyleSheet.absoluteFill as any, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  lockCircleLarge: { width: 80, height: 80, borderRadius: 40, borderWidth: 2, borderColor: '#D4AF37', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.7)' },
  tapToUnlock: { color: '#FFF', marginTop: 15, fontSize: 18, fontWeight: 'bold' },

  detailsSection: { padding: 25, flex: 1 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  title: { color: '#FFF', fontSize: 24, fontWeight: 'bold' },
  deleteButton: { padding: 5 },
  ownerText: { color: '#888', fontSize: 14, marginBottom: 15 },
  
  unlockedBadge: { alignSelf: 'flex-start', borderWidth: 1, borderColor: '#4CAF50', borderRadius: 15, paddingHorizontal: 12, paddingVertical: 6, marginBottom: 20 },
  unlockedBadgeText: { color: '#4CAF50', fontSize: 12, fontWeight: 'bold' },
  
  lockedBadge: { alignSelf: 'flex-start', borderWidth: 1, borderColor: '#F44336', borderRadius: 15, paddingHorizontal: 12, paddingVertical: 6, marginBottom: 20 },
  lockedBadgeText: { color: '#F44336', fontSize: 12, fontWeight: 'bold' },

  description: { color: '#888', fontSize: 14, lineHeight: 22, marginBottom: 30 },

  purchaseBtn: { backgroundColor: '#D4AF37', borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 'auto' },
  purchaseBtnText: { color: '#000', fontSize: 16, fontWeight: 'bold' },
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: 15,
    marginTop: 20,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#D4AF37',
    paddingVertical: 14,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  actionButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
