import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, ActivityIndicator, Button, TouchableOpacity, ImageBackground } from 'react-native';
import { collection, getDocs, query, limit, startAfter, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../firebaseConfig';

export default function ViewImagesScreen({ navigation }) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [lastVisible, setLastVisible] = useState(null);

  useEffect(() => {
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
        const userImagesCollection = collection(db, `users/${user.uid}/images`);
        const q = query(userImagesCollection, limit(10));
        const querySnapshot = await getDocs(q);
        const userImages = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setImages(userImages);
        setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);

        const unsubscribe = onSnapshot(userImagesCollection, (snapshot) => {
          const newImages = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          setImages((prevImages) => {
            const newIds = new Set(newImages.map((img) => img.id));
            const mergedImages = [
              ...prevImages.filter((img) => !newIds.has(img.id)),
              ...newImages,
            ];
            return mergedImages;
          });
        });

        return () => unsubscribe();
      } catch (error) {
        console.error('Error fetching images:', error);
        alert('Failed to load images.');
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, [user]);

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
      <ImageBackground
        source={require('../assets/images/background.jpg')}
        style={styles.container}
      >
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.loadingText}>Loading images...</Text>
      </ImageBackground>
    );
  }

  if (!images.length) {
    return (
      <ImageBackground
        source={require('../assets/images/background.jpg')}
        style={styles.container}
      >
        <Text style={styles.noImagesText}>No images uploaded yet.</Text>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground
      source={require('../assets/images/background.jpg')}
      style={styles.container}
    >
      <FlatList
        data={images}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.imageContainer}>
            <Image source={{ uri: item.imageUrl }} style={styles.image} />
            <Text style={styles.fileName}>{item.fileName}</Text>
          </View>
        )}
        onEndReached={loadMoreImages}
        onEndReachedThreshold={0.1}
      />
      <TouchableOpacity
        style={[styles.button, styles.primaryButton]}
        onPress={() => navigation.navigate('cropped-images')}
      >
        <Text style={styles.buttonText}>View Cropped Images</Text>
      </TouchableOpacity>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Transparent background to make the content stand out
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
  },
  noImagesText: {
    fontSize: 18,
    color: '#fff',
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
    color: '#fff',
  },
  button: {
    width: '80%',
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  primaryButton: {
    backgroundColor: '#000', // Black background for the primary button
  },
  buttonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});
