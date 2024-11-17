//import React from 'react';
//import { View, Text, Button, StyleSheet } from 'react-native';
//import * as ImagePicker from 'expo-image-picker';
//
//export default function UploadImageScreen() {
//  const pickImage = async () => {
//    let result = await ImagePicker.launchImageLibraryAsync({
//      mediaTypes: ImagePicker.MediaTypeOptions.Images,
//      allowsEditing: true,
//      quality: 1,
//    });
//
//    if (!result.cancelled) {
//      console.log(result.uri); // Image URI
//      // Future work: Add functionality to send the image to the server.
//    }
//  };
//
//  return (
//    <View style={styles.container}>
//      <Text style={styles.title}>Upload Image</Text>
//      <Button title="Choose an Image" onPress={pickImage} />
//    </View>
//  );
//}
//
//const styles = StyleSheet.create({
//  container: { flex: 1, justifyContent: 'center', padding: 20 },
//  title: { fontSize: 24, marginBottom: 20 },
//});
