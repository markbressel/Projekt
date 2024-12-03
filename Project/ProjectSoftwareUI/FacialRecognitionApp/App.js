import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import splash from './tabs/splash';  // Komponens importálása helyesen
import index from './tabs/index';    // Komponens importálása helyesen

const Stack = createStackNavigator();

const App: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Splash">
        <Stack.Screen
          name="Splash"
          component={splash}  // Helyes komponens
          options={{ headerShown: false }} // A fejléc eltüntetése
        />
        <Stack.Screen
          name="Home"
          component={index}  // Helyes komponens
          options={{ headerShown: false }} // A fejléc eltüntetése
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
