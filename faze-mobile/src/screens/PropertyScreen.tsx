import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import MediaImage from '../components/MediaImage';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { apiClient } from '../api/client';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../store/useAuthStore';
import Header from '../components/Header';
import { getImageSource } from '../utils/images';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Main'>;

export default function PropertyScreen() {
  const navigation = useNavigation<NavigationProp>();
  const isFocused = useIsFocused();
  const insets = useSafeAreaInsets();
  const token = useAuthStore(state => state.token);
  const [published, setPublished] = useState<any[]>([]);
  const [purchased, setPurchased] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'purchased' | 'published'>('purchased');

  useEffect(() => {
    if (isFocused) {
      fetchProperty();
    }
  }, [isFocused]);

  const fetchProperty = async () => {
    try {
      const response = await apiClient.get('/user/my-property');
      setPublished(response.data.data.published);
      setPurchased(response.data.data.purchased);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#D4AF37" />
      </View>
    );
  }

  const activeData = tab === 'purchased' ? purchased : published;

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.cardContainer}>
      <TouchableOpacity 
        style={styles.card}
        onPress={() => navigation.navigate('Detail' as any, { mediaId: item.id })}
      >
        <MediaImage 
          url={item.isUnlocked && item.originalUrl ? item.originalUrl : item.previewUrl}
          mediaId={item.id}
          style={styles.image} 
          contentFit="cover"
          transition={200}
        />
        <View style={styles.cardOverlay}>
          <Text style={styles.title}>{item.title || 'Untitled'}</Text>
        </View>
      </TouchableOpacity>
      
      {tab === 'published' && (
        <View style={styles.insightsContainer}>
          <View style={styles.insightsHeader}>
            <Text style={styles.insightsTitle}>Performance Insights</Text>
            <Text style={styles.earningsText}>+{item.totalCollected || 0} coins</Text>
          </View>
          
          {item.buyers && item.buyers.length > 0 ? (
            <View style={styles.buyersList}>
              <Text style={styles.buyersLabel}>Buyers:</Text>
              <Text style={styles.buyersText} numberOfLines={2}>
                {item.buyers.join(', ')}
              </Text>
            </View>
          ) : (
            <Text style={styles.noBuyersText}>No buyers yet.</Text>
          )}
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Header />
      
      <View style={[styles.tabContainer, { marginTop: 20 }]}>
        <TouchableOpacity 
          style={[styles.tab, tab === 'purchased' && styles.activeTab]}
          onPress={() => setTab('purchased')}
        >
          <Text style={[styles.tabText, tab === 'purchased' && styles.activeTabText]}>Purchased</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, tab === 'published' && styles.activeTab]}
          onPress={() => setTab('published')}
        >
          <Text style={[styles.tabText, tab === 'published' && styles.activeTabText]}>Published</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={activeData}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Nothing here yet.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  center: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginHorizontal: 20,
    marginTop: 0,
    marginBottom: 15,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#111',
    borderRadius: 10,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#333',
  },
  tabText: {
    color: '#888',
    fontWeight: '600',
  },
  activeTabText: {
    color: '#D4AF37',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  cardContainer: {
    marginBottom: 25,
    backgroundColor: '#111',
    borderRadius: 15,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#222',
  },
  card: {
    width: '100%',
    aspectRatio: 1,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  cardOverlay: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    zIndex: 10,
  },
  title: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  insightsContainer: {
    padding: 15,
    backgroundColor: '#1C1C1C',
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  insightsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  insightsTitle: {
    color: '#888',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  earningsText: {
    color: '#D4AF37',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buyersList: {
    marginTop: 5,
  },
  buyersLabel: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  buyersText: {
    color: '#AAA',
    fontSize: 12,
    lineHeight: 18,
  },
  noBuyersText: {
    color: '#555',
    fontSize: 12,
    fontStyle: 'italic',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    color: '#888',
    fontSize: 16,
  }
});
