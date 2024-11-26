import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { collection, getDocs, query, limit, startAfter, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../firebaseConfig';

export default function ViewImagesScreen() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [lastVisible, setLastVisible] = useState(null); // For pagination

  useEffect(() => {
    // Monitor authentication state
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        setUser(null);
        setImages([]);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchImages = async () => {
      try {
        setLoading(true);

        // Fetch image metadata from Firestore
        const userImagesCollection = collection(db, `users/${user.uid}/images`);

        // Initial fetch (first batch)
        const q = query(userImagesCollection, limit(10)); // Fetch first 10 images
        const querySnapshot = await getDocs(q);

        const userImages = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setImages(userImages);
        setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]); // Store last visible document for pagination

        // Real-time updates with onSnapshot
        const unsubscribe = onSnapshot(userImagesCollection, (snapshot) => {
          const newImages = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          setImages((prevImages) => {
            const newIds = new Set(newImages.map((img) => img.id));
            const mergedImages = [...prevImages.filter((img) => !newIds.has(img.id)), ...newImages];
            return mergedImages;
          });
        });

        return () => unsubscribe(); // Unsubscribe when component unmounts
      } catch (error) {
        console.error('Error fetching images:', error);
        alert('Failed to load images.');
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, [user]);

  // Function to load more images (pagination)
  const loadMoreImages = async () => {
    try {
      setLoading(true);

      const userImagesCollection = collection(db, `users/${user.uid}/images`);
      const q = query(userImagesCollection, limit(10), startAfter(lastVisible));
      const querySnapshot = await getDocs(q);

      const newImages = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setImages([...images, ...newImages]);
      setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
    } catch (error) {
      console.error('Error loading more images:', error);
      alert('Failed to load more images.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading images...</Text>
      </View>
    );
  }

  if (!images.length) {
    return (
      <View style={styles.container}>
        <Text style={styles.noImagesText}>No images uploaded yet.</Text>
      </View>
    );
  }

  return (
    <FlatList
      contentContainerStyle={styles.container}
      data={images}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={styles.imageContainer}>
          <Image source={{ uri: item.imageUrl }} style={styles.image} />
          <Text style={styles.fileName}>{item.fileName}</Text>
        </View>
      )}
      onEndReached={loadMoreImages} // Trigger loadMoreImages when user scrolls to the end
      onEndReachedThreshold={0.1} // Trigger when user is close to the end
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f7f8fa',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  noImagesText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
  },
  imageContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  fileName: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
});
