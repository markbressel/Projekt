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
