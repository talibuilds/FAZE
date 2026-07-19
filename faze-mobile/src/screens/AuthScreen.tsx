import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, SafeAreaView, ActivityIndicator, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { apiClient, setAuthToken } from '../api/client';
import { useAuthStore } from '../store/useAuthStore';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';

WebBrowser.maybeCompleteAuthSession();

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const loginStore = useAuthStore(state => state.login);

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: '86930572836-8md9eted7rralugu4j4fdv94ajmh0okd.apps.googleusercontent.com',
  });

  React.useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      if (authentication?.accessToken) {
        fetchGoogleUserInfo(authentication.accessToken);
      }
    }
  }, [response]);

  const fetchGoogleUserInfo = async (token: string) => {
    setLoading(true);
    try {
      const res = await fetch('https://www.googleapis.com/userinfo/v2/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const user = await res.json();
      
      const result = await apiClient.post('/auth/google', {
        email: user.email,
        googleId: user.id,
        name: user.name,
      });

      const { token: backendToken, user: backendUser } = result.data.data;
      setAuthToken(backendToken);
      loginStore(backendToken, backendUser);
    } catch (e: any) {
      console.error(e);
      Alert.alert('Google Login Failed', 'Failed to authenticate with backend');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!email || !password) {
      return Alert.alert('Error', 'Please fill in all fields');
    }
    setLoading(true);
    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const payload = isLogin ? { email, password } : { name, email, password };
      const response = await apiClient.post(endpoint, payload);
      const { token, user } = response.data.data;
      setAuthToken(token);
      loginStore(token, user);
    } catch (err: any) {
      const errorData = err.response?.data?.error;
      const message = errorData?.details?.[0]?.message || errorData?.message || (err.code === 'ERR_NETWORK' ? 'Cannot connect to server. Is the backend running?' : err.message || 'Unknown error');
      Alert.alert(isLogin ? 'Login Failed' : 'Registration Failed', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        
        {/* LOGO */}
        <View style={styles.logoContainer}>
          <Image 
            source={require('../../assets/logo.png')} 
            style={styles.logoImage} 
            resizeMode="contain" 
            defaultSource={undefined}
          />
          <Text style={styles.logoText}>F A Z E</Text>
          <Text style={styles.subtitle}>Unlock what's worth it.</Text>
        </View>

        {/* TABS */}
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, isLogin && styles.activeTab]} 
            onPress={() => setIsLogin(true)}
          >
            <Text style={[styles.tabText, isLogin && styles.activeTabText]}>Log in</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, !isLogin && styles.activeTab]} 
            onPress={() => setIsLogin(false)}
          >
            <Text style={[styles.tabText, !isLogin && styles.activeTabText]}>Register</Text>
          </TouchableOpacity>
        </View>

        {/* INPUTS */}
        <View style={styles.form}>
          {!isLogin && (
            <>
              <Text style={styles.label}>Full Name</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={20} color="#888" style={styles.icon} />
                <TextInput 
                  style={styles.input} 
                  placeholder="Jane Doe" 
                  placeholderTextColor="#555"
                  value={name}
                  onChangeText={setName}
                />
              </View>
            </>
          )}

          <Text style={styles.label}>Email</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color="#888" style={styles.icon} />
            <TextInput 
              style={styles.input} 
              placeholder="you@example.com" 
              placeholderTextColor="#555"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <Text style={styles.label}>Password</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#888" style={styles.icon} />
            <TextInput 
              style={styles.input} 
              placeholder="At least 8 characters" 
              placeholderTextColor="#555"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#888" style={styles.iconRight} />
            </TouchableOpacity>
          </View>

          {isLogin && <Text style={styles.forgot}>Forgot password?</Text>}

          <TouchableOpacity style={styles.mainButton} onPress={handleSubmit} disabled={loading}>
            {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.mainButtonText}>{isLogin ? 'Log in' : 'Register'}</Text>}
          </TouchableOpacity>
        </View>

        {/* OAUTH DUMMY */}
        <View style={styles.oauthContainer}>
          <Text style={styles.orText}>or continue with</Text>
          <View style={styles.oauthRow}>
            <TouchableOpacity 
              style={styles.oauthBtn} 
              onPress={() => promptAsync()} 
              disabled={!request || loading}
            >
              <Ionicons name="logo-google" size={24} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.oauthBtn} onPress={() => Alert.alert('Coming Soon', 'Social login will be available in a future update!')}>
              <Ionicons name="logo-apple" size={24} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.oauthBtn} onPress={() => Alert.alert('Coming Soon', 'Social login will be available in a future update!')}>
              <Ionicons name="logo-github" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  content: { flex: 1, paddingHorizontal: 25, justifyContent: 'center' },
  
  logoContainer: { alignItems: 'center', marginBottom: 40 },
  logoImage: { width: 80, height: 80 },
  logoText: { color: '#FFF', fontSize: 32, fontWeight: 'bold', letterSpacing: 8, marginTop: 15 },
  subtitle: { color: '#888', fontSize: 14, marginTop: 8 },

  tabContainer: { flexDirection: 'row', backgroundColor: '#111', borderRadius: 25, padding: 4, marginBottom: 30, borderWidth: 1, borderColor: '#222' },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 21 },
  activeTab: { backgroundColor: '#1C1C1C', borderWidth: 1, borderColor: '#333' },
  tabText: { color: '#888', fontSize: 16, fontWeight: '600' },
  activeTabText: { color: '#FFF' },

  form: { marginBottom: 30 },
  label: { color: '#888', fontSize: 13, marginBottom: 8, marginLeft: 5 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0A0A0A', borderWidth: 1, borderColor: '#222', borderRadius: 12, paddingHorizontal: 15, marginBottom: 20 },
  icon: { marginRight: 10 },
  iconRight: { marginLeft: 10 },
  input: { flex: 1, color: '#FFF', fontSize: 16, paddingVertical: 15 },
  forgot: { color: '#888', fontSize: 13, alignSelf: 'flex-end', marginBottom: 20 },
  
  mainButton: { backgroundColor: '#FFF', borderRadius: 12, paddingVertical: 16, alignItems: 'center' },
  mainButtonText: { color: '#000', fontSize: 16, fontWeight: 'bold' },

  oauthContainer: { alignItems: 'center', marginTop: 10 },
  orText: { color: '#555', fontSize: 13, marginBottom: 20 },
  oauthRow: { flexDirection: 'row', gap: 20 },
  oauthBtn: { width: 60, height: 60, borderRadius: 15, backgroundColor: '#111', borderWidth: 1, borderColor: '#222', justifyContent: 'center', alignItems: 'center' },
});
