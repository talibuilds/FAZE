import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Dimensions, TextInput, ScrollView, Alert } from 'react-native';
import MediaImage from '../components/MediaImage';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { RootStackParamList } from '../navigation/AppNavigator';
import { apiClient } from '../api/client';
import { useAuthStore } from '../store/useAuthStore';
import Header from '../components/Header';
import { getImageSource } from '../utils/images';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Main'>;
const { width } = Dimensions.get('window');
const cardWidth = width - 40; // 1 column with padding

export default function FeedScreen() {
  const [feed, setFeed] = useState<any[]>([]);
  const navigation = useNavigation<NavigationProp>();
  const isFocused = useIsFocused();
  const token = useAuthStore(state => state.token);
  const setBalance = useAuthStore(state => state.setBalance);
  const setTransactions = useAuthStore(state => state.setTransactions);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  
  const FILTERS = ['All', 'Nature', 'Mountains', 'Ocean', 'Abstract', 'City'];

  const fetchFeed = async () => {
    try {
      const endpoint = activeFilter !== 'All' ? `/media/feed?tag=${activeFilter}` : '/media/feed';
      const response = await apiClient.get(endpoint);
      setFeed(response.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchWallet = async () => {
    try {
      const response = await apiClient.get('/wallet');
      setBalance(response.data.data.walletBalance);
      setTransactions(response.data.data.transactions);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (isFocused) {
      fetchFeed();
      fetchWallet();
    }
  }, [isFocused, activeFilter]);

  const handleFabPress = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      return Alert.alert('Permission needed', 'Sorry, we need camera roll permissions to make this work!');
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    
    if (!result.canceled && result.assets[0].uri) {
      navigation.navigate('Upload', { imageUri: result.assets[0].uri } as any);
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => navigation.navigate('Detail', { mediaId: item.id })}
    >
      <View style={styles.imageContainer}>
        <MediaImage 
          url={item.isUnlocked && item.originalUrl ? item.originalUrl : item.previewUrl}
          mediaId={item.id}
          style={styles.image}
          contentFit="cover"
          transition={200}
        />
        
        {/* Overlays */}
        {item.isUnlocked ? (
          <View style={styles.badgeSuccess}>
            <Ionicons name="checkmark" size={16} color="#FFF" />
          </View>
        ) : (
          <>
            <View style={styles.overlayIcon}>
              <View style={styles.lockCircle}>
                <Ionicons name="lock-closed-outline" size={20} color="#D4AF37" />
              </View>
              <Text style={styles.payText}>Pay to make it yours</Text>
            </View>
            <View style={styles.priceBadge}>
              <Text style={styles.priceBadgeText}>{item.price}</Text>
            </View>
          </>
        )}
      </View>
      
      <View style={styles.cardInfo}>
        <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
        <Text style={[styles.subtitle, item.isUnlocked && styles.subtitleSuccess]}>
          {item.isUnlocked ? 'Unlocked' : `${item.price} coins to unlock`}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const filteredFeed = feed.filter(item => {
    const searchLower = searchQuery.toLowerCase();
    const titleMatch = item.title?.toLowerCase().includes(searchLower);
    const descMatch = item.description?.toLowerCase().includes(searchLower);
    const tagsMatch = item.tags?.toLowerCase().includes(searchLower);
    const matchesSearch = titleMatch || descMatch || tagsMatch || false;
    
    // For demo purposes, we also mock filter by category name in title, tags, or desc.
    const filterLower = activeFilter.toLowerCase();
    const matchesFilter = activeFilter === 'All' || 
                          (item.title?.toLowerCase().includes(filterLower) || 
                           item.tags?.toLowerCase().includes(filterLower) || 
                           item.description?.toLowerCase().includes(filterLower) || 
                          (item.id.charCodeAt(0) % FILTERS.length === FILTERS.indexOf(activeFilter)));
                          
    return matchesSearch && matchesFilter;
  });

  return (
    <View style={styles.container}>
      <Header subtitle="FEED" title="Browse content" />
      
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
        <TextInput 
          style={styles.searchInput}
          placeholder="Search amazing images..."
          placeholderTextColor="#888"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.filtersWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersContainer}>
          {FILTERS.map(filter => (
            <TouchableOpacity 
              key={filter} 
              style={[styles.filterPill, activeFilter === filter && styles.filterPillActive]}
              onPress={() => setActiveFilter(filter)}
            >
              <Text style={[styles.filterText, activeFilter === filter && styles.filterTextActive]}>
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      
      <FlatList
        data={filteredFeed}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />

      <TouchableOpacity 
        style={styles.fab} 
        onPress={handleFabPress}
      >
        <Ionicons name="add" size={32} color="#000" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111',
    marginHorizontal: 20,
    borderRadius: 12,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#333',
    marginBottom: 15,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: '#FFF',
    fontSize: 16,
    paddingVertical: 12,
  },
  filtersWrapper: {
    marginBottom: 15,
  },
  filtersContainer: {
    paddingHorizontal: 20,
    gap: 10,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#333',
  },
  filterPillActive: {
    backgroundColor: '#D4AF37',
    borderColor: '#D4AF37',
  },
  filterText: {
    color: '#888',
    fontWeight: 'bold',
  },
  filterTextActive: {
    color: '#000',
  },
  list: { paddingHorizontal: 20, paddingBottom: 100 },
  card: { width: cardWidth, marginBottom: 25, backgroundColor: '#111', borderRadius: 15, overflow: 'hidden' },
  imageContainer: { width: '100%', height: cardWidth * 1.0, position: 'relative' },
  image: { width: '100%', height: '100%' },
  
  overlayIcon: { ...StyleSheet.absoluteFill as any, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 10 },
  lockCircle: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: '#D4AF37', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.7)' },
  payText: { color: '#FFF', fontSize: 12, fontWeight: 'bold', marginTop: 8, textAlign: 'center', paddingHorizontal: 10 },
  
  priceBadge: { position: 'absolute', top: 10, right: 10, backgroundColor: '#1C1C1C', borderWidth: 1, borderColor: '#333', borderRadius: 15, paddingHorizontal: 8, paddingVertical: 4 },
  priceBadgeText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  
  badgeSuccess: { position: 'absolute', top: 10, right: 10, backgroundColor: '#2E7D32', width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },

  cardInfo: { padding: 12 },
  title: { color: '#FFF', fontSize: 14, fontWeight: '600', marginBottom: 4 },
  subtitle: { color: '#888', fontSize: 12 },
  subtitleSuccess: { color: '#4CAF50' },

  fab: { position: 'absolute', bottom: 30, right: 30, width: 60, height: 60, borderRadius: 30, backgroundColor: '#D4AF37', justifyContent: 'center', alignItems: 'center', shadowColor: '#D4AF37', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 }
});
