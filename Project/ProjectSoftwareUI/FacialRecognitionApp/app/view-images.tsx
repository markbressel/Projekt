import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet } from 'react-native';
import { auth, db } from '../firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';

export default function ViewImagesScreen() {
  const [images, setImages] = useState([]);
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) return;

    const fetchImages = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, `users/${user.uid}/images`));
        const userImages = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setImages(userImages);
      } catch (error) {
        console.error('Error fetching images:', error);
        alert('Failed to load images.');
      }
    };

    fetchImages();
  }, [user]);

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>You must be logged in to view your images.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Uploaded Images</Text>
      <FlatList
        data={images}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.imageContainer}>
            <Image source={{ uri: item.imageUrl }} style={styles.image} />
            <Text style={styles.fileName}>{item.fileName}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f7f8fa' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  error: { fontSize: 18, color: 'red', textAlign: 'center' },
  imageContainer: { marginBottom: 20, alignItems: 'center' },
  image: { width: 200, height: 200, borderRadius: 8 },
  fileName: { marginTop: 10, fontSize: 16, color: '#666' },
});
