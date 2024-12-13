import React, { useState } from 'react';
import { TextInput, TouchableOpacity, Animated, ImageBackground, Text, View } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { useRouter } from 'expo-router';
import wallpaper from '../assets/images/wallpapper.jpg';
import styles from './styles';

export default function LoginScreen() {
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

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert('Login successful!');
      router.push('/');
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <ImageBackground source={wallpaper} style={styles.container}>
      <Animated.Text style={[styles.title, { transform: [{ translateX: titleAnim }] }]}>
        Welcome
      </Animated.Text>

      <Animated.Text style={[styles.subtitle, { transform: [{ translateX: subtitleAnim }] }]}>
        Sign in to your account
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

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.secondaryButton]}
        onPress={() => router.push('/register')}
      >
        <Text style={[styles.buttonText, styles.secondaryButtonText]}>Registration</Text>
      </TouchableOpacity>
    </ImageBackground>
  );
}
