import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { Camera } from "expo-camera";
import * as MediaLibrary from "expo-media-library";
import { manipulateAsync } from "expo-image-manipulator";

export default function RealTimeCamera({ navigation }) {
  const [hasPermission, setHasPermission] = useState(null);
  const [camera, setCamera] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [processing, setProcessing] = useState(false);

  React.useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      const mediaStatus = await MediaLibrary.requestPermissionsAsync();
      setHasPermission(status === "granted" && mediaStatus.status === "granted");
    })();
  }, []);

  const takePicture = async () => {
    if (camera) {
      const photo = await camera.takePictureAsync();
      setCapturedImage(photo.uri);
    }
  };

  const processAndUpload = async () => {
    if (!capturedImage) return;

    try {
      setProcessing(true);

      // Compress image using expo-image-manipulator
      const compressedImage = await manipulateAsync(capturedImage, [], {
        compress: 0.8,
        format: "jpeg",
      });

      const formData = new FormData();
      formData.append("file", {
        uri: compressedImage.uri,
        type: "image/jpeg",
        name: `captured_image_${Date.now()}.jpg`,
      });

      // Replace with your backend API URL
      const response = await fetch("http://192.168.0.106:8000/upload/", {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const result = await response.json();

      if (response.ok) {
        alert("Image uploaded and processed successfully!");
        console.log(result);
      } else {
        console.error(result);
        alert("Failed to process image.");
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred while processing the image.");
    } finally {
      setProcessing(false);
    }
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text>Requesting Camera Permissions...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text>No access to camera.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {!capturedImage ? (
        <>
          <Camera
            ref={(ref) => setCamera(ref)}
            style={styles.camera}
            type={Camera.Constants.Type.back}
          />
          <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
            <Text style={styles.buttonText}>Capture</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Image source={{ uri: capturedImage }} style={styles.preview} />
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={processAndUpload}
            disabled={processing}
          >
            <Text style={styles.buttonText}>
              {processing ? "Processing..." : "Upload & Detect Faces"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.captureButton}
            onPress={() => setCapturedImage(null)}
          >
            <Text style={styles.buttonText}>Retake</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f7f8fa",
  },
  camera: {
    flex: 1,
    width: "100%",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  captureButton: {
    backgroundColor: "#4CAF50",
    padding: 20,
    borderRadius: 50,
    position: "absolute",
    bottom: 50,
    alignSelf: "center",
  },
  uploadButton: {
    backgroundColor: "#2196F3",
    padding: 20,
    borderRadius: 8,
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  preview: {
    width: "90%",
    height: "70%",
    borderRadius: 8,
    marginVertical: 20,
  },
});
