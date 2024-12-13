import React, { useState } from 'react';
import { TextInput, TouchableOpacity, Animated, ImageBackground, Text, View } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import { useRouter } from 'expo-router';
import wallpaper from '../assets/images/wallpapper.jpg';
import styles from './styles';

export default function RegistrationScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const titleAnim = new Animated.Value(-300);
  const subtitleAnim = new Animated.Value(300);

  React.useEffect(() => {
    Animated.timing(titleAnim, {
      toValue: 0,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    Animated.timing(subtitleAnim, {
      toValue: 0,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleRegister = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        createdAt: new Date(),
      });

      alert('Registration successful!');
      router.push('/login');
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <ImageBackground source={wallpaper} style={styles.container}>
      <Animated.Text style={[styles.title, { transform: [{ translateX: titleAnim }] }]}>
        Registration
      </Animated.Text>
      <Animated.Text style={[styles.subtitle, { transform: [{ translateX: subtitleAnim }] }]}>
        Create a new account
      </Animated.Text>

      <TextInput
        placeholder="Email"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Password"
        secureTextEntry
        style={styles.input}
        value={password}
        onChangeText={setPassword}
      />
      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Registration</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, styles.secondaryButton]}
        onPress={() => router.push('/login')}
      >
        <Text style={[styles.buttonText, styles.secondaryButtonText]}>Login</Text>
      </TouchableOpacity>
    </ImageBackground>
  );
}
