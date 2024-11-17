import React, { useEffect, useState } from 'react';
import { Button, View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { auth } from '../../firebaseConfig'; // Adjust the path to your firebaseConfig

export default function HomeScreen() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Track authentication state
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsLoggedIn(!!user); // Set `isLoggedIn` to true if there's a logged-in user
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // Logout handler
  const handleLogout = async () => {
    try {
      await auth.signOut();
      alert('Logged out successfully!');
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to the Home Screen!</Text>

      {/* Show login and register buttons if the user is not logged in */}
      {!isLoggedIn && (
        <>
          <Button title="Go to Login" onPress={() => router.push('/login')} />
          <Button title="Go to Register" onPress={() => router.push('/register')} />
        </>
      )}

      {/* Show logout and upload image buttons if the user is logged in */}
      {isLoggedIn && (
        <>
          <Button title="Upload Image" onPress={() => router.push('/upload-image')} />
          <Button title="Logout" onPress={handleLogout} />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 24, marginBottom: 20 },
});
