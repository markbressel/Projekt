import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Image, StyleSheet, Animated, ImageBackground } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Easing } from 'react-native';

const SplashScreen = () => {
  const navigation = useNavigation();

  // Animációk a háttérre és a logóra
  const backgroundFade = useRef(new Animated.Value(0)).current;
  const logoFade = useRef(new Animated.Value(0)).current;
  const logoMovement = useRef(new Animated.Value(0)).current;

  const [logoOpacity] = useState(new Animated.Value(1));
  const [logoRotation] = useState(new Animated.Value(0));
  const [logoSize] = useState(new Animated.Value(1));

  useEffect(() => {
    // Háttér és logó fade-in animáció
    Animated.timing(backgroundFade, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: true,
    }).start();

    Animated.timing(logoFade, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: true,
    }).start();

    // Logó mozgás elindítása 2.25 másodperc után
    setTimeout(() => {
      Animated.timing(logoMovement, {
        toValue: -250, // Mozgatás felfelé
        duration: 2000,
        easing: Easing.inOut(Easing.exp),
        useNativeDriver: true,
      }).start();
    }, 2250); // Logó mozgása 2.25 másodperces késleltetéssel

    // Opacitás animáció
    Animated.timing(logoOpacity, {
      toValue: 0,
      duration: 10000, // 10 másodperc
      useNativeDriver: true,
    }).start();

    // Logó forgás animációja (végtelen ciklusban)
    Animated.loop(
      Animated.timing(logoRotation, {
        toValue: 1,
        duration: 10000, // 10 másodperc
        useNativeDriver: true,
      })
    ).start();

    // Logó méretének növelése
    Animated.timing(logoSize, {
      toValue: 1.5, // Méret növelése 1.5-szörösére
      duration: 10000, // 10 másodperc
      useNativeDriver: true,
    }).start();

    // Képernyő váltás 10 másodperc után
    setTimeout(() => {
      navigation.replace('Home');
    }, 10000); // 10 másodperc után

  }, [navigation, logoOpacity, logoRotation, logoSize]);

  // Forgás interpoláció
  const rotateInterpolate = logoRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'], // 360 fokos forgatás
  });

  // Méret interpoláció
  const sizeInterpolate = logoSize.interpolate({
    inputRange: [1, 1.5],
    outputRange: [200, 300], // Méret változása 200-ról 300-ra
  });

  return (
    <ImageBackground
      source={require('@assets/images/splash.png')} // Háttérkép
      style={[styles.backgroundImage, { opacity: backgroundFade }]} // Háttér fade-in animáció
      resizeMode="cover"
    >
      {/* Animált logó */}
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: logoFade, // Logó fade-in animáció
            transform: [
              { rotate: rotateInterpolate }, // Forgás
              { scale: sizeInterpolate }, // Méretváltoztatás
              { translateY: logoMovement }, // Logó mozgás
            ],
          }
        ]}
      >
        <Image
          source={require('@assets/images/icon.png')} // Logó kép
          style={styles.logo}
        />
      </Animated.View>

      {/* Üdvözlő szöveg */}
      <Text style={styles.text}>Üdvözlünk a Tasty alkalmazásban!</Text>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  backgroundImage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  logoContainer: {
    position: 'absolute',
    top: '30%',
    alignItems: 'center',
  },
  logo: {
    width: 200,
    height: 200,
  },
  text: {
    position: 'absolute',
    bottom: '20%',
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
  },
});

export default SplashScreen;
