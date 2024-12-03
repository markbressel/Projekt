import React, { useEffect, useState } from "react";
import { View, FlatList, Image, StyleSheet, ActivityIndicator, Text } from "react-native";
import { collection, getDocs } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";

export default function CroppedImagesScreen() {
  const [croppedImages, setCroppedImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCroppedImages = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          alert("You must be logged in to view your cropped images.");
          setLoading(false);
          return;
        }

        const croppedImagesCollection = collection(db, `users/${user.uid}/cropped_images`);
        const querySnapshot = await getDocs(croppedImagesCollection);

        const images = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setCroppedImages(images);
      } catch (error) {
        console.error("Error fetching cropped images:", error);
        alert("Failed to load cropped images.");
      } finally {
        setLoading(false);
      }
    };

    fetchCroppedImages();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading cropped images...</Text>
      </View>
    );
  }

  if (!croppedImages.length) {
    return (
      <View style={styles.container}>
        <Text style={styles.noImagesText}>No cropped images found.</Text>
      </View>
    );
  }

  return (
    <FlatList
      contentContainerStyle={styles.container}
      data={croppedImages}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={styles.imageContainer}>
          <Image source={{ uri: item.imageUrl }} style={styles.image} />
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, backgroundColor: "#f7f8fa", alignItems: "center" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 10, fontSize: 16, color: "#666" },
  noImagesText: { fontSize: 18, color: "#666", textAlign: "center" },
  imageContainer: { marginBottom: 20, alignItems: "center" },
  image: { width: 200, height: 200, borderRadius: 8 },
});
