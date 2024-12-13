import React, { useState, useRef } from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet, ScrollView } from "react-native";
import { Camera } from "expo-camera";
import * as MediaLibrary from "expo-media-library";
import { manipulateAsync } from "expo-image-manipulator";
import * as FaceDetector from "expo-face-detector";

export default function RealTimeCamera({ navigation }) {
  const [hasPermission, setHasPermission] = useState(null);
  const [capturedImages, setCapturedImages] = useState([]);
  const [faces, setFaces] = useState([]);
  const [isFaceDetected, setIsFaceDetected] = useState(false);
  const [processing, setProcessing] = useState(false);
  const cameraRef = useRef(null);

  React.useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      const mediaStatus = await MediaLibrary.requestPermissionsAsync();
      setHasPermission(status === "granted" && mediaStatus.status === "granted");
    })();
  }, []);

  const detectFaces = async (uri: string) => {
    const { result } = await FaceDetector.detectFacesAsync(uri, {
      mode: FaceDetector.FaceDetectorMode.accurate,
      detectLandmarks: FaceDetector.FaceDetectorLandmarks.all,
      runClassifications: FaceDetector.FaceDetectorClassifications.all,
    });

    setFaces(result);
    setIsFaceDetected(result.length > 0);
    return result;
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync();
      setCapturedImage(photo.uri);

      const detectedFaces = await detectFaces(photo.uri);

      if (detectedFaces.length > 0) {
        setCapturedImages((prev) => [...prev, photo.uri]);
      } else {
        alert("No face detected in the picture.");
      }
    }
  };

  const processAndUpload = async () => {
    if (!capturedImage) return;

    try {
      setProcessing(true);

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

  const handleFaceDetected = ({ faces }) => {
    setFaces(faces);
    setIsFaceDetected(faces.length > 0);
  };

  const renderCapturedImages = () => {
    if (capturedImages.length === 0) {
      return <Text>No images with faces detected yet.</Text>;
    }

    return (
      <ScrollView contentContainerStyle={styles.imageList}>
        {capturedImages.map((imageUri, index) => (
          <Image key={index} source={{ uri: imageUri }} style={styles.preview} />
        ))}
      </ScrollView>
    );
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
      <Camera
        ref={cameraRef}
        style={styles.camera}
        type={Camera.Constants.Type.back}
        onFacesDetected={handleFaceDetected}
        faceDetectorSettings={{
          mode: FaceDetector.Constants.Mode.accurate,
        }}
      >
      </Camera>

      <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
        <Text style={styles.buttonText}>Capture</Text>
      </TouchableOpacity>

      {!isFaceDetected && (
        <Text style={styles.noFaceText}>No face detected</Text>
      )}

      <View style={styles.capturedImagesContainer}>
        <Text style={styles.capturedImagesTitle}>Captured Images with Faces:</Text>
        {renderCapturedImages()}
      </View>

      {capturedImage && (
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
  noFaceText: {
    color: "#f44336",
    fontSize: 16,
    fontWeight: "bold",
    position: "absolute",
    top: 20,
    textAlign: "center",
  },
  capturedImagesContainer: {
    padding: 20,
    alignItems: "center",
  },
  capturedImagesTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  imageList: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
});
