import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSelector } from 'react-redux';
import { Home, Calendar, Bell, User } from 'lucide-react-native';
import HomeScreen from '../screens/Main/User/HomeScreen';
import AppointmentsScreen from '../screens/Main/User/AppointmentsScreen';
import NotificationScreen from '../screens/Main/NotificationScreen';
import UserProfileScreen from '../screens/Main/User/UserProfileScreen';
import { useTheme } from '../theme/useTheme';

const Tab = createBottomTabNavigator();

const UserTabs = () => {
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
          if (route.name === 'Home') return <Home color={color} size={iconSize} />;
          if (route.name === 'Appointments') return <Calendar color={color} size={iconSize} />;
          if (route.name === 'Notifications') return <Bell color={color} size={iconSize} />;
          if (route.name === 'Profile') return <User color={color} size={iconSize} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Appointments" component={AppointmentsScreen} />
      <Tab.Screen 
        name="Notifications" 
        component={NotificationScreen} 
        options={{
          tabBarBadge: unreadCount > 0 ? unreadCount : null,
          tabBarBadgeStyle: { backgroundColor: colors.error, color: '#fff', fontSize: 10 }
        }}
      />
      <Tab.Screen name="Profile" component={UserProfileScreen} />
    </Tab.Navigator>
  );
};

export default UserTabs;
