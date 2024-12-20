import React, { useEffect, useState } from "react";
import { View, FlatList, Image, StyleSheet, ActivityIndicator, Text, ImageBackground } from "react-native";
import { auth } from "../firebaseConfig";
import wallpaper from '../assets/images/wallpapper.jpg';

export default function ViewImagesScreen() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          alert("You must be logged in to view your images.");
          setLoading(false);
          return;
        }

        const response = await fetch(`http://192.168.0.106:8000/get-images/?user_id=${user.uid}`);
        const result = await response.json();
        setImages(result.images || []);
      } catch (error) {
        console.error("Error fetching images:", error);
        alert("Failed to load images.");
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, []);

  if (loading) {
    return (
      <ImageBackground source={wallpaper} style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading images...</Text>
      </ImageBackground>
    );
  }

  if (!images.length) {
    return (
      <ImageBackground source={wallpaper} style={styles.container}>
        <Text style={styles.noImagesText}>No images uploaded yet.</Text>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground source={wallpaper} style={styles.container}>
      <FlatList
        contentContainerStyle={styles.imageList}
        data={images}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.imageContainer}>
            <Image source={{ uri: item }} style={styles.image} />
          </View>
        )}
      />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, backgroundColor: "rgba(247, 248, 250, 0.8)", alignItems: "center" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 10, fontSize: 16, color: "#666" },
  noImagesText: { fontSize: 18, color: "#666", textAlign: "center" },
  imageList: { alignItems: "center" },
  imageContainer: { marginBottom: 20, alignItems: "center" },
  image: { width: 200, height: 200, borderRadius: 8 },
});