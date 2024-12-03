import React, { useEffect, useState } from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { auth } from '../../firebaseConfig';

export default function HomeScreen() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Üdvözöllek az Arcfelismerő Programban!</Text>

      {!isLoggedIn && (
        <>
          <TouchableOpacity style={styles.button} onPress={() => router.push('/login')}>
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => router.push('/register')}>
            <Text style={styles.buttonText}>Register</Text>
          </TouchableOpacity>
        </>
      )}

      {isLoggedIn && (
        <>
          <TouchableOpacity style={styles.button} onPress={() => router.push('/upload-image')}>
            <Text style={styles.buttonText}>Upload Image</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => router.push('/view-images')}>
            <Text style={styles.buttonText}>View Uploaded Images</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={handleLogout}>
            <Text style={[styles.buttonText, styles.logoutButtonText]}>Logout</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => router.push('/cropped-images')}>
            <Text style={styles.buttonText}>View Cropped Images</Text>
          </TouchableOpacity>
        </>
      )}
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
});
