import { View, Text } from 'react-native'
import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/Auth/LoginScreen';

import WelcomeScreen from '../screens/Auth/WelcomeScreen';
import SignupScreen from '../screens/Auth/SignupScreen';

const Auth = () => {
    const Stack = createNativeStackNavigator();
  return (
    <Stack.Navigator>
      <Stack.Screen name="Welcome" component={WelcomeScreen} options={{headerShown : false}}/>
      <Stack.Screen name="Login" component={LoginScreen} options={{headerShown : false}}/>
      <Stack.Screen name="Signup" component={SignupScreen} options={{headerShown : false}} />
    </Stack.Navigator>
  )
}

export default Auth