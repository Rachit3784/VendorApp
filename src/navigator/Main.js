import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import UserTabs from './UserTabs';
import VendorTabs from './VendorTabs';
import VendorDetailScreen from '../screens/Main/User/VendorDetailScreen';
import BookingScreen from '../screens/Main/User/BookingScreen';
import SearchScreen from '../screens/Main/User/SearchScreen';
import SearchResultsScreen from '../screens/Main/User/SearchResultsScreen';
import NotificationDetailScreen from '../screens/Main/NotificationDetailScreen';

const Stack = createNativeStackNavigator();

const Main = () => {
  const { user } = useSelector((state) => state.auth);
  const isVendor = user?.role === 'vendor';

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isVendor ? (
        <Stack.Screen name="VendorTabs" component={VendorTabs} />
      ) : (
        <Stack.Screen name="UserTabs" component={UserTabs} />
      )}
      <Stack.Screen name="VendorDetail" component={VendorDetailScreen} />
      <Stack.Screen name="Booking" component={BookingScreen} />
      <Stack.Screen name="Search" component={SearchScreen} />
      <Stack.Screen name="SearchResults" component={SearchResultsScreen} />
      <Stack.Screen name="NotificationDetail" component={NotificationDetailScreen} />
    </Stack.Navigator>
  );
};

export default Main;