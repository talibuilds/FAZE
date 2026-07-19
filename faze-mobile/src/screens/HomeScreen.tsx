import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions, Alert, TextInput, Modal } from 'react-native';
import MediaImage from '../components/MediaImage';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { apiClient } from '../api/client';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../store/useAuthStore';
import Header from '../components/Header';
import { getImageSource } from '../utils/images';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Main'>;
const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const setBalance = useAuthStore(state => state.setBalance);
  const storeUser = useAuthStore(state => state.user);
  const token = useAuthStore(state => state.token);
  const [stats, setStats] = useState({ totalPublished: 0, totalPurchased: 0, walletBalance: 0, name: '' });
  const [feed, setFeed] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddBalance, setShowAddBalance] = useState(false);
  const [addAmount, setAddAmount] = useState('');
  
  // Fake Payment States
  const [paymentStep, setPaymentStep] = useState<'none' | 'method' | 'pin' | 'processing'>('none');
  const [selectedMethod, setSelectedMethod] = useState('');
  const [pin, setPin] = useState('');

  useEffect(() => {
    if (isFocused) {
      fetchData();
    }
  }, [isFocused]);

  const fetchData = async () => {
    try {
      const [statsRes, feedRes] = await Promise.all([
        apiClient.get('/user/stats'),
        apiClient.get('/media/feed')
      ]);
      setStats(statsRes.data.data);
      setBalance(statsRes.data.data.walletBalance);
      setFeed(feedRes.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBalance = () => {
    const amount = parseInt(addAmount);
    if (!amount || amount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid number of credits');
      return;
    }
    setPaymentStep('method');
  };

  const processPayment = async () => {
    setPaymentStep('processing');
    
    // Simulate slight network delay to look real and fast
    await new Promise(resolve => setTimeout(resolve, 800));

    try {
      const amount = parseInt(addAmount);
      const res = await apiClient.post('/wallet/add', { amount });
      
      setBalance(res.data.data.walletBalance);
      setStats(prev => ({ ...prev, walletBalance: res.data.data.walletBalance }));
      
      Alert.alert('Payment Successful', `Successfully added ${amount} coins to your wallet!`);
    } catch (err) {
      Alert.alert('Payment Failed', 'An error occurred during payment processing.');
    } finally {
      setPaymentStep('none');
      setPin('');
      setShowAddBalance(false);
      setAddAmount('');
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#D4AF37" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Greeting */}
      <Text style={styles.greeting}>Hello, {storeUser?.name || stats.name || 'there'}</Text>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <View style={styles.circleGold}>
            <Text style={styles.circleNumber}>{stats.totalPurchased}</Text>
          </View>
          <Text style={styles.statLabel}>Purchased</Text>
        </View>

        <View style={styles.statCard}>
          <View style={styles.circleGold}>
            <Text style={styles.circleNumber}>{stats.totalPublished}</Text>
          </View>
          <Text style={styles.statLabel}>Published</Text>
        </View>

        <TouchableOpacity style={styles.statCard} onPress={() => setShowAddBalance(!showAddBalance)}>
          <View style={styles.circleGold}>
            <Text style={styles.circleNumber}>{stats.walletBalance}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
            <Ionicons name="add-circle" size={14} color="#D4AF37" style={{ marginRight: 4 }} />
            <Text style={[styles.statLabel, { color: '#D4AF37' }]}>Add Balance</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Add Balance Input (toggled) */}
      {showAddBalance && (
        <View style={styles.addBalanceSection}>
          <Text style={styles.addBalanceTitle}>Add Credits</Text>
          <View style={styles.addBalanceRow}>
            <TextInput
              style={styles.addBalanceInput}
              placeholder="Enter amount"
              placeholderTextColor="#555"
              keyboardType="numeric"
              value={addAmount}
              onChangeText={setAddAmount}
            />
            <TouchableOpacity style={styles.addBalanceBtn} onPress={handleAddBalance}>
              <Text style={styles.addBalanceBtnText}>Add</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.quickAmounts}>
            {[100, 250, 500, 1000].map(amt => (
              <TouchableOpacity key={amt} style={styles.quickAmountChip} onPress={() => setAddAmount(String(amt))}>
                <Text style={styles.quickAmountText}>{amt}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Featured Section Header */}
      <View style={styles.featuredHeader}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={styles.sectionTitle}>Featured</Text>
        </View>
        <TouchableOpacity onPress={() => (navigation as any).navigate('Explore')}>
          <Text style={styles.browseAll}>Browse all</Text>
        </TouchableOpacity>
      </View>

      {/* Featured Cards — Dynamic top 3 items */}
      <View style={{ gap: 20 }}>
        {feed.slice(0, 3).map((item, index) => (
          <TouchableOpacity 
            key={item.id}
            style={[styles.featuredCard, { height: 250 }]} 
            onPress={() => (navigation as any).navigate('Detail', { mediaId: item.id })}
          >
            <MediaImage 
              url={item.isUnlocked && item.originalUrl ? item.originalUrl : item.previewUrl}
              mediaId={item.id}
              style={styles.featuredImage}
              contentFit="cover"
              transition={200}
            />
            
            {/* Pay to make it yours overlay */}
            {!item.isUnlocked && (
              <View style={styles.lockOverlay}>
                <View style={styles.lockCircle}>
                  <Ionicons name="lock-closed-outline" size={24} color="#D4AF37" />
                </View>
                <Text style={styles.payText}>Pay to make it yours</Text>
              </View>
            )}

            <View style={styles.featuredOverlay}>
              <Text style={styles.featuredSmallLabel}>{index === 0 ? 'TRENDING' : index === 1 ? 'NEW' : 'HOT'}</Text>
              <Text style={styles.featuredText}>{item.title || 'Explore Content'}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <View style={{ height: 100 }} />


      </ScrollView>

      {/* Fake Payment Modal */}
      {paymentStep !== 'none' && (
        <Modal transparent visible animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              {paymentStep === 'method' && (
                <>
                  <Text style={styles.modalTitle}>Select Payment Method</Text>
                  {['UPI', 'Debit Card', 'Credit Card'].map(method => (
                    <TouchableOpacity 
                      key={method} 
                      style={styles.paymentMethodBtn}
                      onPress={() => {
                        setSelectedMethod(method);
                        setPaymentStep('pin');
                      }}
                    >
                      <Ionicons name={method === 'UPI' ? 'phone-portrait-outline' : 'card-outline'} size={24} color="#D4AF37" />
                      <Text style={styles.paymentMethodText}>{method}</Text>
                      <Ionicons name="chevron-forward" size={20} color="#555" style={{ marginLeft: 'auto' }} />
                    </TouchableOpacity>
                  ))}
                  <TouchableOpacity style={styles.cancelBtn} onPress={() => setPaymentStep('none')}>
                    <Text style={styles.cancelBtnText}>Cancel</Text>
                  </TouchableOpacity>
                </>
              )}

              {paymentStep === 'pin' && (
                <>
                  <Text style={styles.modalTitle}>Enter 6-Digit PIN</Text>
                  <Text style={styles.modalSubtitle}>Paying with {selectedMethod}</Text>
                  
                  <TextInput
                    style={styles.pinInput}
                    placeholder="******"
                    placeholderTextColor="#555"
                    keyboardType="numeric"
                    secureTextEntry
                    maxLength={6}
                    value={pin}
                    onChangeText={(text) => {
                      setPin(text);
                      if (text.length === 6) {
                        processPayment();
                      }
                    }}
                    autoFocus
                  />
                  
                  <TouchableOpacity style={styles.cancelBtn} onPress={() => { setPaymentStep('method'); setPin(''); }}>
                    <Text style={styles.cancelBtnText}>Back</Text>
                  </TouchableOpacity>
                </>
              )}

              {paymentStep === 'processing' && (
                <View style={{ alignItems: 'center', paddingVertical: 20 }}>
                  <ActivityIndicator size="large" color="#D4AF37" />
                  <Text style={{ color: '#FFF', marginTop: 15, fontSize: 16, fontWeight: 'bold' }}>Processing Payment...</Text>
                </View>
              )}
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  center: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  logo: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 2,
  },
  headerCredits: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1C',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: '#333',
  },
  headerCreditsText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  greeting: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 30,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#111',
    borderRadius: 16,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#222',
    minHeight: 100,
  },
  circleGold: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 3,
    borderColor: '#D4AF37',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  circleNumber: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#888',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },

  // Add Balance Section
  addBalanceSection: {
    backgroundColor: '#111',
    borderRadius: 16,
    padding: 20,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#222',
  },
  addBalanceTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  addBalanceRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  addBalanceInput: {
    flex: 1,
    backgroundColor: '#0A0A0A',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    color: '#FFF',
    fontSize: 16,
  },
  addBalanceBtn: {
    backgroundColor: '#D4AF37',
    borderRadius: 12,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addBalanceBtnText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },
  quickAmounts: {
    flexDirection: 'row',
    gap: 10,
  },
  quickAmountChip: {
    flex: 1,
    backgroundColor: '#1C1C1C',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: 'center',
  },
  quickAmountText: {
    color: '#D4AF37',
    fontWeight: '600',
    fontSize: 14,
  },

  // Featured
  featuredHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '700',
  },
  browseAll: {
    color: '#D4AF37',
    fontSize: 14,
    fontWeight: '600',
  },
  featuredLabel: {
    color: '#555',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  featuredCard: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#111',
    position: 'relative',
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  lockOverlay: {
    ...StyleSheet.absoluteFill as any,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 10,
  },
  lockCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#D4AF37',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  payText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 8,
    textAlign: 'center',
  },
  featuredRow: {
    flexDirection: 'column',
    gap: 12,
    marginBottom: 10,
  },
  featuredCardSmall: {
    height: 140,
    borderRadius: 16,
    overflow: 'hidden',
  },
  featuredOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  featuredSmallLabel: {
    color: '#D4AF37',
    fontSize: 10,
    fontWeight: 'bold',
  },
  featuredText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  featuredTextSmall: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#111',
    borderRadius: 20,
    padding: 25,
    borderWidth: 1,
    borderColor: '#333',
  },
  modalTitle: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalSubtitle: {
    color: '#888',
    fontSize: 14,
    marginBottom: 25,
    textAlign: 'center',
  },
  paymentMethodBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1C',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  paymentMethodText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 15,
  },
  cancelBtn: {
    marginTop: 15,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#888',
    fontSize: 16,
    fontWeight: 'bold',
  },
  pinInput: {
    backgroundColor: '#1C1C1C',
    color: '#FFF',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingVertical: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D4AF37',
    letterSpacing: 10,
    marginBottom: 20,
  },
});
