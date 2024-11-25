import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Platform, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, setDoc } from 'firebase/firestore';
import { db,auth, storage } from '../firebaseConfig';

export default function UploadImageScreen() {
  const [image, setImage] = useState(null);
  const [imageName, setImageName] = useState(null);
  const [uploading, setUploading] = useState(false);

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
      // Show image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        allowsMultipleSelection: false,
      });

      if (!result.canceled) {
        // Handle the selected asset
        const selectedAsset = result.assets[0];
        if (selectedAsset) {
          setImage(selectedAsset.uri);
          // Get filename from URI
          const fileName = selectedAsset.uri.split('/').pop() || 'unnamed_image';
          setImageName(fileName);
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      alert('Error selecting image. Please try again.');
    }
  };

  const uploadImage = async () => {
    if (!image) return;
  
    try {
      const formData = new FormData();
      formData.append("file", {
        uri: image,
        name: `photo_${Date.now()}.jpg`,
        type: "image/jpeg",
      });
  
      const response = await fetch("http://<YOUR_BACKEND_SERVER_IP>:8000/upload/", {
        method: "POST",
        headers: {
          "Content-Type": "multipart/form-data",
        },
        body: formData,
      });
  
      const result = await response.json();
      if (response.ok) {
        alert(`Image uploaded: ${result.filename}`);
      } else {
        alert(`Upload failed: ${result.message}`);
      }
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Upload Image</Text>

      <TouchableOpacity
        style={styles.pickButton}
        onPress={pickImage}
        disabled={uploading}
      >
        <Text style={styles.buttonText}>Pick Image</Text>
      </TouchableOpacity>

      {imageName && (
        <Text style={styles.fileName}>
          Selected File: {imageName}
        </Text>
      )}

      {image && (
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: image }}
            style={styles.image}
            resizeMode="contain"
          />
        </View>
      )}

      {uploading ? (
        <View style={styles.uploadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.uploadingText}>Uploading...</Text>
        </View>
      ) : (
        <TouchableOpacity
          style={[
            styles.uploadButton,
            (!image || uploading) && styles.disabledButton
          ]}
          onPress={uploadImage}
          disabled={!image || uploading}
        >
          <Text style={styles.buttonText}>Upload Image</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    marginBottom: 30,
    fontWeight: 'bold',
    color: '#333',
  },
  fileName: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  imageContainer: {
    marginVertical: 20,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  image: {
    width: 300,
    height: 300,
    backgroundColor: '#f0f0f0',
  },
  pickButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
    marginBottom: 10,
    width: '80%',
    alignItems: 'center',
  },
  uploadButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
    marginTop: 10,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  uploadingContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  uploadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
});