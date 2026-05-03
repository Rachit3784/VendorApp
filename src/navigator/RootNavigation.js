import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useDispatch, useSelector } from 'react-redux';
import { fetchVendors } from '../store/vendorSlice';
import { fetchVendorProfile } from '../store/vendorSlice';
import { fetchNotifications } from '../store/notificationSlice';
import Auth from './Auth';
import Main from './Main';
import SplashScreen from '../screens/Splash/SplashScreen';

const Stack = createNativeStackNavigator();

const RootNavigation = () => {
  const dispatch = useDispatch();
  const { user, splashDone } = useSelector(state => state.auth);

  useEffect(() => {
    if (user) {
      // Initial sync on login/session load
      dispatch(fetchNotifications());
      if (user.role === 'vendor') {
        dispatch(fetchVendorProfile());
      } else {
        dispatch(fetchVendors());
      }
    }
  }, [user]);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!splashDone ? (
        <Stack.Screen name="Splash" component={SplashScreen} />
      ) : user ? (
        <Stack.Screen name="Main" component={Main} />
      ) : (
        <Stack.Screen name="Auth" component={Auth} />
      )}
    </Stack.Navigator>
  );
};

export default RootNavigation;