import React, { useEffect, useState } from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { auth } from '../../firebaseConfig'; // Adjust the path to your firebaseConfig

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
      alert('Sikeres kijelentkezés!');
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
            <Text style={styles.buttonText}>Bejelentkezés</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => router.push('/register')}>
            <Text style={styles.buttonText}>Regisztráció</Text>
          </TouchableOpacity>
        </>
      )}

      {isLoggedIn && (
        <>
          <TouchableOpacity style={styles.button} onPress={() => router.push('/upload-image')}>
            <Text style={styles.buttonText}>Kép Feltöltése</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={handleLogout}>
            <Text style={[styles.buttonText, styles.logoutButtonText]}>Kijelentkezés</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f7f8fa',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 30,
  },
  button: {
    width: '80%',
    height: 50,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: '#fff',
    borderColor: '#4CAF50',
    borderWidth: 2,
  },
  logoutButtonText: {
    color: '#4CAF50',
  },
});
