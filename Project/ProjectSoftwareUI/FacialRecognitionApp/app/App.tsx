import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { splash } from './tabs/splash';
import { index } from './tabs/index';


const Stack = createStackNavigator();

const App: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Splash">
        <Stack.Screen
          name="Splash"
          component={SplashScreen}
          options={{ headerShown: false }}  // Fejléc elrejtése a Splash képernyőn
        />
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ headerShown: false }}  // Fejléc elrejtése a Home képernyőn
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
