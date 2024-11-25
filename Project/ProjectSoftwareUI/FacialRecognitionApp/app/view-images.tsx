import React, { useEffect, useState } from 'react';
import { Text, Image, StyleSheet, ScrollView } from 'react-native';

export default function ViewImagesScreen() {
  const [images, setImages] = useState([]);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await fetch("http://<YOUR_BACKEND_SERVER_IP>:8000/display_faces/");
        const result = await response.json();
        setImages(result.images); // Backend should return a list of image URLs or base64 data
      } catch (error) {
        alert(`Error fetching images: ${error.message}`);
      }
    };

    fetchImages();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {images.length > 0 ? (
        images.map((image, index) => (
          <Image
            key={index}
            source={{ uri: image }}
            style={styles.image}
          />
        ))
      ) : (
        <Text>No images available.</Text>
      )}
    </ScrollView>
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
