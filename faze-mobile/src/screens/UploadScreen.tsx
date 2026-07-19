import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { apiClient } from '../api/client';
import Header from '../components/Header';

type UploadRouteProp = RouteProp<any, 'Upload'>;

export default function UploadScreen() {
  const route = useRoute<UploadRouteProp>();
  const initialImage = route.params?.imageUri || null;

  const [image, setImage] = useState<string | null>(initialImage);
  const [price, setPrice] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const pickImage = async () => {
    // Request permissions
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      return Alert.alert('Permission needed', 'Sorry, we need camera roll permissions to make this work!');
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const uploadImage = async () => {
    if (!image) return Alert.alert('Error', 'Please select an image');
    if (!price) return Alert.alert('Error', 'Please enter a price');

    setLoading(true);
    try {
      const formData = new FormData();
      if (title) formData.append('title', title);
      if (description) formData.append('description', description);
      if (tags.length > 0) formData.append('tags', tags.join(', '));
      formData.append('price', price);
      
      const filename = image.split('/').pop() || 'upload.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image/jpeg`;

      formData.append('image', { uri: image, name: filename, type } as any);

      await apiClient.post('/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      Alert.alert('Success', 'Media uploaded successfully!');
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Upload Failed', err.response?.data?.error?.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header showBack subtitle="NEW UPLOAD" title="Publish media" />
      
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        
        <TouchableOpacity style={styles.pickerBox} onPress={pickImage}>
          {image ? (
            <Image source={{ uri: image }} style={styles.previewImage} contentFit="cover" transition={200} />
          ) : (
            <View style={styles.pickerInner}>
              <View style={styles.pickerCircle}>
                <Ionicons name="add" size={24} color="#D4AF37" />
              </View>
              <Text style={styles.pickerTitle}>Select an image</Text>
              <Text style={styles.pickerSubtitle}>JPEG or PNG, up to 10MB</Text>
            </View>
          )}
        </TouchableOpacity>

        <Text style={styles.label}>Title</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Give it a name" 
          placeholderTextColor="#555"
          value={title}
          onChangeText={setTitle}
        />

        <Text style={styles.label}>Description</Text>
        <TextInput 
          style={[styles.input, styles.textArea]} 
          placeholder="Describe your media..." 
          placeholderTextColor="#555"
          multiline
          numberOfLines={3}
          value={description}
          onChangeText={setDescription}
        />

        <Text style={styles.label}>Tags (optional)</Text>
        <View style={styles.tagsContainer}>
          {tags.map((tag, index) => (
            <View key={index} style={styles.tagPill}>
              <Text style={styles.tagText}>{tag}</Text>
              <TouchableOpacity onPress={() => setTags(tags.filter((_, i) => i !== index))}>
                <Ionicons name="close-circle" size={16} color="#000" style={styles.tagCloseIcon} />
              </TouchableOpacity>
            </View>
          ))}
          <TextInput 
            style={[styles.input, styles.tagInput]} 
            placeholder={tags.length === 0 ? "Type and press space..." : ""} 
            placeholderTextColor="#555"
            value={tagInput}
            onChangeText={(text) => {
              if (text.endsWith(' ') || text.endsWith(',')) {
                const newTag = text.slice(0, -1).trim();
                if (newTag && !tags.includes(newTag)) {
                  setTags([...tags, newTag]);
                }
                setTagInput('');
              } else {
                setTagInput(text);
              }
            }}
            onSubmitEditing={() => {
              const newTag = tagInput.trim();
              if (newTag && !tags.includes(newTag)) {
                setTags([...tags, newTag]);
              }
              setTagInput('');
            }}
          />
        </View>

        <Text style={styles.label}>Unlock price</Text>
        <View style={styles.priceInputContainer}>
          <TextInput 
            style={styles.priceInput} 
            placeholder="0" 
            placeholderTextColor="#555"
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
          />
          <Text style={styles.priceLabel}>coins</Text>
        </View>

        <Text style={styles.helperText}>
          Others will only see a blurred preview until they unlock this with coins. The original file stays private on our servers.
        </Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.publishBtn} 
            onPress={uploadImage} 
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.publishBtnText}>Publish</Text>}
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  content: { padding: 20 },
  
  pickerBox: { width: '100%', height: 200, borderWidth: 1, borderColor: '#333', borderRadius: 15, borderStyle: 'dashed', overflow: 'hidden', marginBottom: 25, backgroundColor: '#0A0A0A' },
  previewImage: { width: '100%', height: '100%' },
  pickerInner: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  pickerCircle: { width: 50, height: 50, borderRadius: 25, borderWidth: 1, borderColor: '#D4AF37', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  pickerTitle: { color: '#FFF', fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
  pickerSubtitle: { color: '#666', fontSize: 12 },

  label: { color: '#888', fontSize: 13, marginBottom: 8 },
  input: { backgroundColor: '#0A0A0A', borderWidth: 1, borderColor: '#222', borderRadius: 12, paddingHorizontal: 15, paddingVertical: 15, color: '#FFF', fontSize: 16, marginBottom: 20 },
  textArea: { height: 100, textAlignVertical: 'top' },
  
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', backgroundColor: '#0A0A0A', borderWidth: 1, borderColor: '#222', borderRadius: 12, padding: 10, marginBottom: 20, minHeight: 54 },
  tagPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#D4AF37', borderRadius: 20, paddingVertical: 6, paddingHorizontal: 12, margin: 4 },
  tagText: { color: '#000', fontSize: 14, fontWeight: 'bold' },
  tagCloseIcon: { marginLeft: 6 },
  tagInput: { flex: 1, minWidth: 100, backgroundColor: 'transparent', borderWidth: 0, paddingHorizontal: 5, paddingVertical: 5, marginBottom: 0 },
  
  priceInputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0A0A0A', borderWidth: 1, borderColor: '#222', borderRadius: 12, paddingHorizontal: 15 },
  priceInput: { flex: 1, color: '#FFF', fontSize: 16, paddingVertical: 15 },
  priceLabel: { color: '#888', fontSize: 16, marginLeft: 10 },

  helperText: { color: '#666', fontSize: 13, lineHeight: 18, marginTop: 20, marginBottom: 30 },

  buttonContainer: { gap: 15 },
  publishBtn: { backgroundColor: '#D4AF37', borderRadius: 12, paddingVertical: 16, alignItems: 'center' },
  publishBtnText: { color: '#000', fontSize: 16, fontWeight: 'bold' },
  cancelBtn: { backgroundColor: '#111', borderRadius: 12, paddingVertical: 16, alignItems: 'center', borderWidth: 1, borderColor: '#222' },
  cancelBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});
