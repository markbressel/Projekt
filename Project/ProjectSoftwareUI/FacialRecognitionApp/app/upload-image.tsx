import React, { useState } from 'react';
import { View, Text, Button, Image, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';

export default function UploadImageScreen() {
  const [image, setImage] = useState(null);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.uri);
    }
  };

  const uploadImage = async () => {
    if (!image) return;

    const response = await fetch(image);
    const blob = await response.blob();

    const storageRef = ref(storage, `images/${Date.now()}`);
    await uploadBytes(storageRef, blob);

    const downloadURL = await getDownloadURL(storageRef);

    await setDoc(doc(db, 'images', `${Date.now()}`), {
      imageUrl: downloadURL,
      uploadedAt: new Date(),
    });

    alert('Image Uploaded!');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Upload Image</Text>
      <Button title="Pick Image" onPress={pickImage} />
      {image && <Image source={{ uri: image }} style={styles.image} />}
      <Button title="Upload Image" onPress={uploadImage} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 24, marginBottom: 20 },
  image: { width: 200, height: 200, marginTop: 20 },
});
