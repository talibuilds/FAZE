import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function FeedbackScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(0);
  const [saving, setSaving] = useState(false);

  const handleSubmit = () => {
    if (!feedback.trim()) {
      Alert.alert('Validation Error', 'Please write some feedback before submitting');
      return;
    }

    setSaving(true);
    // Simulate API call (in a real app, POST to /api/feedback)
    setTimeout(() => {
      setSaving(false);
      Alert.alert('Thank You!', 'Your feedback has been submitted successfully. We appreciate your input!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    }, 1000);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Feedback</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.description}>
          We would love to hear your thoughts, suggestions, concerns, or problems with anything so we can improve!
        </Text>

        {/* Star Rating */}
        <Text style={styles.label}>How would you rate your experience?</Text>
        <View style={styles.starsRow}>
          {[1, 2, 3, 4, 5].map(star => (
            <TouchableOpacity key={star} onPress={() => setRating(star)}>
              <Ionicons 
                name={star <= rating ? "star" : "star-outline"} 
                size={36} 
                color={star <= rating ? "#D4AF37" : "#555"} 
              />
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Your feedback</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Describe your feedback here..." 
          placeholderTextColor="#555"
          value={feedback}
          onChangeText={setFeedback}
          multiline
          textAlignVertical="top"
        />

        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={saving}>
          {saving ? <ActivityIndicator color="#000" /> : <Text style={styles.submitBtnText}>Submit Feedback</Text>}
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
  description: { color: '#AAA', fontSize: 15, marginBottom: 25, lineHeight: 22 },
  label: { color: '#888', fontSize: 13, marginBottom: 10, marginLeft: 2, fontWeight: '600' },
  starsRow: { flexDirection: 'row', gap: 8, marginBottom: 25 },
  input: { height: 150, backgroundColor: '#111', borderWidth: 1, borderColor: '#222', borderRadius: 12, padding: 15, color: '#FFF', fontSize: 16, marginBottom: 25 },
  submitBtn: { backgroundColor: '#D4AF37', borderRadius: 12, paddingVertical: 16, alignItems: 'center' },
  submitBtnText: { color: '#000', fontSize: 16, fontWeight: 'bold' },
});
