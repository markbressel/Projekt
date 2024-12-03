import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ImageBackground, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { auth } from '../../firebaseConfig';
import Title from '../Components/Title';
import CustomButton from '../Components/CustomButton';

const HomeScreen: React.FC = () => {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

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
    <ImageBackground
      source={require('../../assets/images/background.jpg')}
      style={styles.container}
    >
      <Title text="Welcome to IFD" style={styles.title} />

      {!isLoggedIn && (
        <>
          <CustomButton text="Login" onPress={() => router.push('/login')} style={styles.button} textStyle={styles.buttonText} />
          <CustomButton text="Register" onPress={() => router.push('/register')} style={styles.button} textStyle={styles.buttonText} />
        </>
      )}

      {isLoggedIn && (
        <>
<<<<<<< Updated upstream
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
=======
          <CustomButton text="Upload Image" onPress={() => router.push('/upload-image')} style={styles.button} textStyle={styles.buttonText} />
          <CustomButton text="View Uploaded Images" onPress={() => router.push('/view-images')} style={styles.button} textStyle={styles.buttonText} />
          <CustomButton
            text="Logout"
            onPress={handleLogout}
            style={[styles.button, styles.logoutButton]}
            textStyle={[styles.buttonText, styles.logoutButtonText]}
          />
>>>>>>> Stashed changes
        </>
      )}
    </ImageBackground>
  );
};

HomeScreen.options = {
  headerShown: false, // Eltünteti a fejlécet, így a "X" gomb is eltűnik
  headerLeft: () => null, // Eltünteti a bal felső sarokban lévő gombot
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 40,
    textAlign: 'center',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 10
  },
  button: {
    width: '80%',
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5
  },
  buttonText: {
    fontSize: 18,
    color: '#000',
    fontWeight: 'bold',
    letterSpacing: 1
  },
  logoutButton: {
    backgroundColor: '#fff',
    borderColor: '#fff',
    borderWidth: 2
  },
  logoutButtonText: {
    color: '#000'
  },
});

export default HomeScreen;
