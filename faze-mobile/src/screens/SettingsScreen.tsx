import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../store/useAuthStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { apiClient } from '../api/client';
import Header from '../components/Header';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function SettingsScreen() {
  const logout = useAuthStore(state => state.logout);
  const storeUser = useAuthStore(state => state.user);
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const isFocused = useIsFocused();
  const [name, setName] = useState(storeUser?.name || 'User');
  const [email, setEmail] = useState(storeUser?.email || '');

  const fetchProfile = useCallback(async () => {
    try {
      const res = await apiClient.get('/user/stats');
      setName(res.data.data.name || storeUser?.name || 'User');
    } catch (err) {
      // Fall back to store data if API fails
      if (storeUser?.name) setName(storeUser.name);
      console.error(err);
    }
  }, [storeUser]);

  // Re-fetch whenever this screen gains focus (e.g. after editing profile)
  useEffect(() => {
    if (isFocused) {
      fetchProfile();
    }
  }, [isFocused]);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const renderMenuItem = (icon: any, title: string, onPress?: () => void, color = '#FFF') => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuItemLeft}>
        <Ionicons name={icon} size={24} color={color} />
        <Text style={[styles.menuItemText, { color }]}>{title}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#555" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView>
        <Text style={styles.headerTitle}>Settings</Text>

      <View style={styles.profileSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getInitials(name)}</Text>
        </View>
        <Text style={styles.profileName}>{name}</Text>
        {email ? <Text style={styles.profileEmail}>{email}</Text> : null}
      </View>

      <View style={styles.menuSection}>
        {renderMenuItem("person-outline", "Edit Profile", () => navigation.navigate('EditProfile'))}
        {renderMenuItem("list-outline", "Transaction History", () => navigation.navigate('TransactionHistory'))}
        {renderMenuItem("shield-checkmark-outline", "Privacy Policy", () => navigation.navigate('PrivacyPolicy'))}
        {renderMenuItem("chatbubble-ellipses-outline", "Feedback", () => navigation.navigate('Feedback'))}
        {renderMenuItem("mail-outline", "Contact Us", () => navigation.navigate('ContactUs'))}
        
        <View style={styles.divider} />
        
        {renderMenuItem("log-out-outline", "Logout", logout, "#ff4444")}
      </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 30,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#D4AF37',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  avatarText: {
    color: '#000',
    fontSize: 32,
    fontWeight: 'bold',
  },
  profileName: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  profileEmail: {
    color: '#888',
    fontSize: 14,
    marginTop: 4,
  },
  menuSection: {
    paddingHorizontal: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#222',
    marginVertical: 10,
  }
});
