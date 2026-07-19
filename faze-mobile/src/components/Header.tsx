import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Modal, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CoinPill from './CoinPill';
import { useAuthStore } from '../store/useAuthStore';

interface Props {
  showBack?: boolean;
  title?: string;
  subtitle?: string;
}

export default function Header({ showBack, title, subtitle }: Props) {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const balance = useAuthStore(state => state.walletBalance);



  return (
    <View style={[styles.container, { paddingTop: insets.top + 10 }]}>
      <View style={styles.left}>
        {showBack ? (
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={20} color="#888" />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.headerLeftContainer}>
            <Image source={require('../../assets/logo.png')} style={styles.logoImage} resizeMode="contain" />
            <Text style={styles.logoText}>FAZE</Text>
          </View>
        )}
      </View>
      <TouchableOpacity onPress={() => navigation.navigate('TransactionHistory')}>
        <CoinPill balance={balance} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: '#000',
  },
  left: {
    flex: 1,
  },
  headerLeftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  logoutBtn: {
    padding: 5,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    color: '#888',
    marginLeft: 5,
    fontSize: 16,
  },
  subtitle: {
    color: '#D4AF37', // Gold
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  title: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: 'bold',
  },
  logoImage: {
    width: 24,
    height: 24,
  },
  logoText: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#111',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  emptyTx: {
    color: '#888',
    textAlign: 'center',
    padding: 20,
  },
  txList: {
    paddingBottom: 40,
  },
  txRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  txLeft: {
    flex: 1,
  },
  txReason: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  txDate: {
    color: '#888',
    fontSize: 12,
  },
  txAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  txCredit: {
    color: '#4CD964',
  },
  txDebit: {
    color: '#FF3B30',
  },
});
