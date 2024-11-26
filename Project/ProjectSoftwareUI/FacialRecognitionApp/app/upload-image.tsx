import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, setDoc } from 'firebase/firestore';
import { db, auth, storage } from '../firebaseConfig';
import Toast from 'react-native-toast-message';

export default function UploadImageScreen() {
  const [image, setImage] = useState(null);
  const [imageName, setImageName] = useState(null);

  // Request permissions when component mounts
  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          alert('Sorry, we need camera roll permissions to make this work!');
        }
      }
    })();
  }, []);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        const selectedAsset = result.assets[0];
        setImage(selectedAsset.uri);
        const fileName = selectedAsset.uri.split('/').pop() || 'unnamed_image';
        setImageName(fileName);
      }
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Error picking image', text2: error.message });
    }
  };

  const uploadImage = async () => {
    if (!image) return;

    try {
      const user = auth.currentUser;
      if (!user) {
        Toast.show({ type: 'error', text1: 'Error', text2: 'You must be logged in to upload an image.' });
        return;
      }

      const response = await fetch(image);
      const blob = await response.blob();
      const timestamp = Date.now();
      const fileExtension = imageName?.split('.').pop() || 'jpg';
      const fileName = `${timestamp}.${fileExtension}`;
      const storageRef = ref(storage, `users/${user.uid}/images/${fileName}`);

      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);

      await setDoc(doc(db, `users/${user.uid}/images`, `${timestamp}`), {
        imageUrl: downloadURL,
        fileName: imageName || 'Unnamed File',
        uploadedAt: new Date().toISOString(),
      });

      setImage(null);
      setImageName(null);
      Toast.show({ type: 'success', text1: 'Success', text2: 'Image uploaded successfully!' });
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Upload Failed', text2: error.message });
    }
  };

  return (
    <View style={styles.container}>
      <Toast />
      <Text style={styles.title}>Upload Image</Text>

      <TouchableOpacity style={styles.pickButton} onPress={pickImage}>
        <Text style={styles.buttonText}>Pick Image</Text>
      </TouchableOpacity>

      {imageName && <Text style={styles.fileName}>Selected File: {imageName}</Text>}

      {image && (
        <View style={styles.imageContainer}>
          <Image source={{ uri: image }} style={styles.image} resizeMode="contain" />
        </View>
      )}

      <TouchableOpacity
        style={[styles.uploadButton, !image && styles.disabledButton]}
        onPress={uploadImage}
        disabled={!image}
      >
        <Text style={styles.buttonText}>Upload Image</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, marginBottom: 30, fontWeight: 'bold', color: '#333' },
  fileName: { marginTop: 10, fontSize: 16, color: '#666', textAlign: 'center' },
  imageContainer: { marginVertical: 20, borderRadius: 10, overflow: 'hidden', borderWidth: 1, borderColor: '#ddd' },
  image: { width: 300, height: 300, backgroundColor: '#f0f0f0' },
  pickButton: { backgroundColor: '#4CAF50', paddingHorizontal: 30, paddingVertical: 15, borderRadius: 8, marginBottom: 10 },
  uploadButton: { backgroundColor: '#2196F3', paddingHorizontal: 30, paddingVertical: 15, borderRadius: 8, marginTop: 10 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  disabledButton: { backgroundColor: '#cccccc' },
});
