import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ContactUsScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const handleEmail = () => {
    Linking.openURL('mailto:support@faze.app').catch(() => {
      Alert.alert('Error', 'Unable to open email client.');
    });
  };

  const handleTwitter = () => {
    Linking.openURL('https://twitter.com/fazeapp').catch(() => {
      Alert.alert('Error', 'Unable to open browser.');
    });
  };

  const handleInstagram = () => {
    Linking.openURL('https://instagram.com/fazeapp').catch(() => {
      Alert.alert('Error', 'Unable to open browser.');
    });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Contact Us</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.description}>
          Have questions or need assistance? Reach out to our team using any of the options below. We typically respond within 24 hours.
        </Text>
        
        <TouchableOpacity style={styles.card} onPress={handleEmail}>
          <View style={[styles.cardIcon, { backgroundColor: '#1a180e' }]}>
            <Ionicons name="mail" size={24} color="#D4AF37" />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Email Support</Text>
            <Text style={styles.cardSubtitle}>support@faze.app</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#555" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={handleTwitter}>
          <View style={[styles.cardIcon, { backgroundColor: '#0d1b2a' }]}>
            <Ionicons name="logo-twitter" size={24} color="#1DA1F2" />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Twitter</Text>
            <Text style={styles.cardSubtitle}>@fazeapp</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#555" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={handleInstagram}>
          <View style={[styles.cardIcon, { backgroundColor: '#1a0d1a' }]}>
            <Ionicons name="logo-instagram" size={24} color="#E1306C" />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Instagram</Text>
            <Text style={styles.cardSubtitle}>@fazeapp</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#555" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1C1C1C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: { padding: 20, paddingTop: 10 },
  description: { color: '#AAA', fontSize: 15, marginBottom: 30, lineHeight: 22 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#111', padding: 18, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: '#222' },
  cardIcon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 15 },
  cardContent: { flex: 1 },
  cardTitle: { color: '#FFF', fontSize: 16, fontWeight: 'bold', marginBottom: 3 },
  cardSubtitle: { color: '#888', fontSize: 14 },
});
