import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSelector } from 'react-redux';
import { LayoutDashboard, BookOpen, Bell, Store } from 'lucide-react-native';
import VendorDashboardScreen from '../screens/Main/Vendor/VendorDashboardScreen';
import VendorBookingsScreen from '../screens/Main/Vendor/VendorBookingsScreen';
import NotificationScreen from '../screens/Main/NotificationScreen';
import VendorProfileScreen from '../screens/Main/Vendor/VendorProfileScreen';
import { useTheme } from '../theme/useTheme';

const Tab = createBottomTabNavigator();

const VendorTabs = () => {
  const { colors } = useTheme();
  const { unreadCount } = useSelector(state => state.notification);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          height: 70,
          paddingBottom: 0,
          borderTopWidth: 1,
        },
        tabBarIcon: ({ color, size, focused }) => {
          const iconSize = focused ? 26 : 22;
          if (route.name === 'Dashboard') return <LayoutDashboard color={color} size={iconSize} />;
          if (route.name === 'Bookings') return <BookOpen color={color} size={iconSize} />;
          if (route.name === 'Notifications') return <Bell color={color} size={iconSize} />;
          if (route.name === 'MyProfile') return <Store color={color} size={iconSize} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={VendorDashboardScreen} />
      <Tab.Screen name="Bookings" component={VendorBookingsScreen} />
      <Tab.Screen 
        name="Notifications" 
        component={NotificationScreen} 
        options={{
          tabBarBadge: unreadCount > 0 ? unreadCount : null,
          tabBarBadgeStyle: { backgroundColor: colors.error, color: '#fff', fontSize: 10 }
        }}
      />
      <Tab.Screen name="MyProfile" component={VendorProfileScreen} />
    </Tab.Navigator>
  );
};

export default VendorTabs;
