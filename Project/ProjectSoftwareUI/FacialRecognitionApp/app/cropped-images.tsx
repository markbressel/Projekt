import React, { useEffect, useState } from "react";
import { View, FlatList, Image, StyleSheet, ActivityIndicator, Text, ImageBackground } from "react-native";
import { auth } from "../firebaseConfig";
import wallpaper from '../assets/images/wallpapper.jpg';

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

        const response = await fetch(`http://192.168.0.106:8000/get-cropped-images/?user_id=${user.uid}`);
        if (!response.ok) {
          throw new Error("Failed to fetch cropped images");
        }

        const result = await response.json();
        setCroppedImages(result.cropped_images || []);
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
      <ImageBackground source={wallpaper} style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading cropped images...</Text>
      </ImageBackground>
    );
  }

  if (!croppedImages.length) {
    return (
      <ImageBackground source={wallpaper} style={styles.container}>
        <Text style={styles.noImagesText}>No cropped images found.</Text>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground source={wallpaper} style={styles.container}>
      <FlatList
        contentContainerStyle={styles.imageList}
        data={croppedImages}
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