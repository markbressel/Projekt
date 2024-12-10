import React, { useEffect, useState, useRef } from 'react';
import { TouchableOpacity, View, Text, StyleSheet, Modal, Image, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { CameraView, CameraType } from 'expo-camera';
import * as FaceDetector from 'expo-face-detector';
import { auth } from '../../firebaseConfig';
import { useCameraPermissions } from '../useCameraPermissions'; // Custom hook

export default function HomeScreen() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cameraVisible, setCameraVisible] = useState(false);
  const [facing, setFacing] = useState<CameraType>('back');
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const cameraRef = useRef(null);

  const {
    cameraPermission,
    requestPermissions,
    isPermissionReady
  } = useCameraPermissions();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsLoggedIn(!!user);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      Alert.alert('Logout', 'Successfully logged out!');
    } catch (error) {
      Alert.alert('Logout Error', error.message);
    }
  };

  const detectFaces = async (uri: string) => {
    try {
      const response = await FaceDetector.detectFacesAsync(uri, {
        mode: FaceDetector.FaceDetectorMode.accurate,
        detectLandmarks: FaceDetector.FaceDetectorLandmarks.all,
        runClassifications: FaceDetector.FaceDetectorClassifications.all,
      });

      // Use response.faces instead of response.result
      if (response.faces && response.faces.length > 0) {
        console.log(`Detected ${response.faces.length} face(s)`);
        return response.faces;
      } else {
        console.log('No faces detected');
        return [];
      }
    } catch (error) {
      console.error('Face detection error:', error);
      return [];
    }
  };

  const captureImage = async () => {
    if (!cameraRef.current) {
      Alert.alert('Error', 'Camera reference is not available');
      return;
    }

    try {
      const photo = await cameraRef.current.takePictureAsync();
      const detectedFaces = await detectFaces(photo.uri);

      if (detectedFaces.length > 0) {
        setCapturedImages((prev) => [...prev, photo.uri]);
        Alert.alert('Success', `${detectedFaces.length} face(s) detected!`);
      } else {
        Alert.alert('No Face', 'No face detected in the picture.');
      }
    } catch (error) {
      Alert.alert('Capture Error', 'Failed to capture image');
      console.error(error);
    }
  };

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const renderCapturedImages = () => {
    if (capturedImages.length === 0) {
      return <Text>No images with faces detected yet.</Text>;
    }

    return (
      <ScrollView contentContainerStyle={styles.imageList}>
        {capturedImages.map((imageUri, index) => (
          <Image
            key={index}
            source={{ uri: imageUri }}
            style={styles.preview}
          />
        ))}
      </ScrollView>
    );
  };

  // Permission handling
  if (!isPermissionReady) {
    return <Text>Loading permissions...</Text>;
  }

  if (!cameraPermission) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Camera Access Needed</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={requestPermissions}
        >
          <Text style={styles.buttonText}>Grant Camera Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Üdvözöllek az Arcfelismerő Programban!</Text>

      {!isLoggedIn && (
        <>
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push('/login')}
          >
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push('/register')}
          >
            <Text style={styles.buttonText}>Register</Text>
          </TouchableOpacity>
        </>
      )}

      {isLoggedIn && (
        <>
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push('/upload-image')}
          >
            <Text style={styles.buttonText}>Upload Image</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push('/view-images')}
          >
            <Text style={styles.buttonText}>View Uploaded Images</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push('/cropped-images')}
          >
            <Text style={styles.buttonText}>View Cropped Images</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.logoutButton]}
            onPress={handleLogout}
          >
            <Text style={[styles.buttonText, styles.logoutButtonText]}>Logout</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={() => setCameraVisible(true)}
          >
            <Text style={styles.buttonText}>Open Real-Time Camera</Text>
          </TouchableOpacity>
        </>
      )}

      {/* Modal for Real-Time Camera */}
      <Modal visible={cameraVisible} animationType="slide">
        <View style={styles.cameraContainer}>
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            facing={facing}
          >
            <View style={styles.cameraControls}>
              <TouchableOpacity
                style={styles.captureButton}
                onPress={captureImage}
              >
                <Text style={styles.captureText}>Capture Image</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.captureButton}
                onPress={toggleCameraFacing}
              >
                <Text style={styles.captureText}>Flip Camera</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setCameraVisible(false)}
              >
                <Text style={styles.captureText}>Close</Text>
              </TouchableOpacity>
            </View>
          </CameraView>
        </View>
      </Modal>

      <View style={styles.capturedImagesContainer}>
        <Text style={styles.capturedImagesTitle}>Captured Images with Faces:</Text>
        {renderCapturedImages()}
      </View>
    </View>
  );
}

// Existing styles remain the same
const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 28, marginBottom: 30 },
  button: { width: '80%', height: 50, backgroundColor: '#4CAF50', borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  buttonText: { fontSize: 16, color: '#fff', fontWeight: 'bold' },
  logoutButton: { backgroundColor: '#fff', borderColor: '#4CAF50', borderWidth: 2 },
  logoutButtonText: { color: '#4CAF50' },
  cameraContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  camera: { flex: 1, width: '100%' },
  cameraControls: { flexDirection: 'row', justifyContent: 'space-around', padding: 10 },
  captureButton: { backgroundColor: '#4CAF50', padding: 15, borderRadius: 8 },
  closeButton: { backgroundColor: '#FF0000', padding: 15, borderRadius: 8 },
  captureText: { color: '#fff', fontSize: 16 },
  capturedImagesContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  capturedImagesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  imageList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  preview: {
    width: 100,
    height: 100,
    margin: 5,
    borderRadius: 8,
  },
});