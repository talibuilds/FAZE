import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { apiClient } from '../api/client';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function EditProfileScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [originalUsername, setOriginalUsername] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    apiClient.get('/user/stats')
      .then(res => {
        setName(res.data.data.name !== 'User' ? res.data.data.name : '');
        setEmail(res.data.data.email || '');
        setUsername(res.data.data.username || '');
        setOriginalUsername(res.data.data.username || '');
      })
      .catch(err => {
        console.error(err);
        Alert.alert('Error', 'Failed to load profile');
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!username || username === originalUsername) {
      setUsernameAvailable(null);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setCheckingUsername(true);
      try {
        const res = await apiClient.post('/user/check-username', { username });
        setUsernameAvailable(res.data.data.available);
      } catch (e) {
        setUsernameAvailable(null);
      } finally {
        setCheckingUsername(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [username, originalUsername]);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Name cannot be empty');
      return;
    }
    if (!username.trim()) {
      Alert.alert('Validation Error', 'Username cannot be empty');
      return;
    }
    if (usernameAvailable === false) {
      Alert.alert('Validation Error', 'Username is not available');
      return;
    }

    setSaving(true);
    try {
      await apiClient.put('/user/profile', { 
        name: name.trim(),
        username: username.trim()
      });
      Alert.alert('Success', 'Profile updated successfully', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (err: any) {
      console.error(err);
      Alert.alert('Error', err.response?.data?.error?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={{ width: 40 }} />
      </View>
      
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#D4AF37" />
        </View>
      ) : (
        <View style={styles.content}>
          <Text style={styles.label}>Full Name</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={20} color="#888" style={styles.icon} />
            <TextInput 
              style={styles.input} 
              placeholder="Your Name" 
              placeholderTextColor="#555"
              value={name}
              onChangeText={setName}
            />
          </View>
          <Text style={styles.label}>Email (Read-only)</Text>
          <View style={[styles.inputContainer, { opacity: 0.5 }]}>
            <Ionicons name="mail-outline" size={20} color="#888" style={styles.icon} />
            <TextInput 
              style={styles.input} 
              value={email}
              editable={false}
            />
          </View>

          <Text style={styles.label}>Username</Text>
          <View style={[styles.inputContainer, usernameAvailable === false ? styles.inputError : null]}>
            <Ionicons name="at-outline" size={20} color="#888" style={styles.icon} />
            <TextInput 
              style={styles.input} 
              placeholder="Username" 
              placeholderTextColor="#555"
              value={username}
              onChangeText={(text) => setUsername(text.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {checkingUsername ? (
              <ActivityIndicator size="small" color="#888" />
            ) : username !== originalUsername && usernameAvailable !== null ? (
              <Ionicons 
                name={usernameAvailable ? "checkmark-circle" : "close-circle"} 
                size={20} 
                color={usernameAvailable ? "#4CAF50" : "#F44336"} 
              />
            ) : null}
          </View>
          
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving || usernameAvailable === false}>
            {saving ? <ActivityIndicator color="#000" /> : <Text style={styles.saveBtnText}>Save Changes</Text>}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
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
  label: { color: '#888', fontSize: 13, marginBottom: 8, marginLeft: 5 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0A0A0A', borderWidth: 1, borderColor: '#222', borderRadius: 12, paddingHorizontal: 15, marginBottom: 30 },
  icon: { marginRight: 10 },
  input: { flex: 1, color: '#FFF', fontSize: 16, paddingVertical: 15 },
  inputError: { borderColor: '#F44336' },
  saveBtn: { backgroundColor: '#D4AF37', borderRadius: 12, paddingVertical: 16, alignItems: 'center' },
  saveBtnText: { color: '#000', fontSize: 16, fontWeight: 'bold' }
});
