import { useState, useEffect } from 'react';
import { Camera } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import { Alert } from 'react-native';

export function useCameraPermissions() {
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(null);
  const [mediaLibraryPermission, setMediaLibraryPermission] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      const cameraResult = await Camera.requestCameraPermissionsAsync();
      setCameraPermission(cameraResult.status === 'granted');

      const mediaResult = await MediaLibrary.requestPermissionsAsync();
      setMediaLibraryPermission(mediaResult.status === 'granted');
    })();
  }, []);

  const requestPermissions = async () => {
    try {
      const cameraResult = await Camera.requestCameraPermissionsAsync();
      setCameraPermission(cameraResult.status === 'granted');

      const mediaResult = await MediaLibrary.requestPermissionsAsync();
      setMediaLibraryPermission(mediaResult.status === 'granted');

      if (cameraResult.status !== 'granted' || mediaResult.status !== 'granted') {
        Alert.alert(
          'Permissions Required',
          'Camera and Media Library access are needed for this feature.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error requesting permissions:', error);
      Alert.alert('Error', 'Failed to request permissions');
    }
  };

  return {
    cameraPermission,
    mediaLibraryPermission,
    requestPermissions,
    isPermissionReady: cameraPermission !== null && mediaLibraryPermission !== null,
    allPermissionsGranted: cameraPermission && mediaLibraryPermission
  };
}