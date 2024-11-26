import React, { useState, useEffect } from "react";
import { View, FlatList, Image, StyleSheet, Text } from "react-native";
import axios from "axios";

export default function CroppedImagesScreen() {
  const [croppedImages, setCroppedImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCroppedImages = async () => {
      try {
        const response = await axios.get("http://127.0.0.1.:8000/display_faces/");
        setCroppedImages(response.data.images);
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
      <View style={styles.container}>
        <Text>Loading cropped images...</Text>
      </View>
    );
  }

  return (
    <FlatList
      contentContainerStyle={styles.container}
      data={croppedImages}
      keyExtractor={(item, index) => index.toString()}
      renderItem={({ item }) => (
        <View style={styles.imageContainer}>
          <Image source={{ uri: item }} style={styles.image} />
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#f7f8fa",
    alignItems: "center",
  },
  imageContainer: {
    marginBottom: 20,
    alignItems: "center",
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 8,
  },
});
