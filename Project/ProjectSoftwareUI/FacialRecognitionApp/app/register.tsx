<<<<<<< Updated upstream
    import React, { useState } from 'react';
    import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
    import { createUserWithEmailAndPassword } from 'firebase/auth';
    import { doc, setDoc } from 'firebase/firestore';
    import { auth, db } from '../firebaseConfig';
    import { useRouter } from 'expo-router';

    export default function RegistrationScreen() {
      const [email, setEmail] = useState('');
      const [password, setPassword] = useState('');
      const router = useRouter();

      const handleRegister = async () => {
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          const user = userCredential.user;


          await setDoc(doc(db, 'users', user.uid), {
            email: user.email,
            createdAt: new Date(),
          });

          alert('Sikeres regisztráció!');
          router.push('/login'); // Navigálás a bejelentkezési oldalra
        } catch (error) {
          alert(error.message);
        }
      };

      return (
        <View style={styles.container}>
          <Text style={styles.title}>Regisztráció</Text>
          <Text style={styles.subtitle}>Hozz létre egy új fiókot</Text>
          <TextInput
            placeholder="Email"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            placeholder="Jelszó"
            secureTextEntry
            style={styles.input}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity style={styles.button} onPress={handleRegister}>
            <Text style={styles.buttonText}>Regisztráció</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={() => router.push('/login')}
          >
            <Text style={[styles.buttonText, styles.secondaryButtonText]}>Bejelentkezés</Text>
          </TouchableOpacity>
        </View>
      );
=======
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ImageBackground } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { useRouter } from 'expo-router';
import CustomButton from '../app/Components/CustomButton';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert('Registration success!');
      router.push('/');
    } catch (error) {
      alert(error.message);
>>>>>>> Stashed changes
    }

<<<<<<< Updated upstream
    const styles = StyleSheet.create({
      container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f7f8fa',
        padding: 20,
      },
      title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
      },
      subtitle: {
        fontSize: 18,
        color: '#666',
        marginBottom: 30,
      },
      input: {
        width: '100%',
        height: 50,
        backgroundColor: '#fff',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
        paddingHorizontal: 15,
        marginBottom: 20,
        fontSize: 16,
      },
      button: {
        width: '100%',
        height: 50,
        backgroundColor: '#4CAF50',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
      },
      buttonText: {
        fontSize: 16,
        color: '#fff',
        fontWeight: 'bold',
      },
      secondaryButton: {
        backgroundColor: '#fff',
        borderColor: '#4CAF50',
        borderWidth: 2,
      },
      secondaryButtonText: {
        color: '#4CAF50',
      },
    });
=======
  return (
    <ImageBackground
      source={require('../assets/images/background.jpg')}
      style={styles.container}
    >
      <Text style={styles.title}>Welcome</Text>
      <Text style={styles.subtitle}>Please register an account</Text>
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
      <CustomButton
        text="Log in"
        onPress={handleLogin}
        style={[styles.button, styles.primaryButton]}
        textStyle={styles.buttonText}
      />
      <CustomButton
        text="Sing up"
        onPress={() => router.push('/register')}
        style={[styles.button, styles.secondaryButton]}
        textStyle={[styles.buttonText, styles.secondaryButtonText]}
      />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Átlátszó fekete háttér
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 15,
    marginBottom: 20,
    fontSize: 16,
  },
  button: {
    width: '80%',
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  primaryButton: {
    backgroundColor: '#fff', // Fekete háttér
  },
  secondaryButton: {
    backgroundColor: '#fff', // Fehér háttér
    borderColor: '#000',
    borderWidth: 2,
  },
  buttonText: {
    fontSize: 16,
    color: '#000', // Fehér szöveg a fő gombon
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  secondaryButtonText: {
    color: '#000', // Fekete szöveg a másodlagos gombon
  },
});
>>>>>>> Stashed changes
