import React, { useEffect, useState } from 'react';
import { TouchableOpacity, View, Text, StyleSheet, Modal, Platform } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { auth } from '../../firebaseConfig';

export default function HomeScreen() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cameraVisible, setCameraVisible] = useState(false);
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsLoggedIn(!!user);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      alert('Successfully logged out!');
    } catch (error) {
      alert(error.message);
    }
  };

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  // If permission is null, still loading
  if (!permission) {
    return <Text>Requesting camera permissions...</Text>;
  }

  // If permission is denied
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Camera Access Needed</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={requestPermission}
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
          <TouchableOpacity style={styles.button} onPress={() => alert('Login pressed')}>
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => alert('Register pressed')}>
            <Text style={styles.buttonText}>Register</Text>
          </TouchableOpacity>
        </>
      )}

      {isLoggedIn && (
        <>
          <TouchableOpacity style={styles.button} onPress={() => alert('Upload Image pressed')}>
            <Text style={styles.buttonText}>Upload Image</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => alert('View Uploaded Images pressed')}>
            <Text style={styles.buttonText}>View Uploaded Images</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => alert('View Cropped Images pressed')}>
            <Text style={styles.buttonText}>View Cropped Images</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={handleLogout}>
            <Text style={[styles.buttonText, styles.logoutButtonText]}>Logout</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => setCameraVisible(true)}>
            <Text style={styles.buttonText}>Open Real-Time Camera</Text>
          </TouchableOpacity>
        </>
      )}

      <Modal visible={cameraVisible} animationType="slide">
        <View style={styles.cameraContainer}>
          <CameraView style={styles.camera} facing={facing}>
            <View style={styles.cameraControls}>
              <TouchableOpacity style={styles.captureButton} onPress={toggleCameraFacing}>
                <Text style={styles.captureText}>Flip Camera</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.closeButton} onPress={() => setCameraVisible(false)}>
                <Text style={styles.captureText}>Close</Text>
              </TouchableOpacity>
            </View>
          </CameraView>
        </View>
      </Modal>
    </View>
  );
}

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
});
