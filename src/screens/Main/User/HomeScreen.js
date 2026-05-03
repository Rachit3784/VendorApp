import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ScrollView, StyleSheet, TouchableOpacity, Image, StatusBar, ActivityIndicator, RefreshControl, Dimensions } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchVendors } from '../../../store/vendorSlice';
import { useTheme } from '../../../theme/useTheme';
import VendorCard from '../../../components/VendorCard';
import { Search, User, MapPin } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const HomeScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { list, loading } = useSelector(state => state.vendor);
  const { user } = useSelector(state => state.auth);
  const { colors, spacing, radius } = useTheme();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    dispatch(fetchVendors());
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchVendors());
    setRefreshing(false);
  };


  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />
      
      {/* Header */}
      <View style={[styles.header, { paddingHorizontal: spacing.md }]}>
        <View>
          <Text style={[styles.greeting, { color: colors.textMuted }]}>WELCOME BACK,</Text>
          <Text style={[styles.username, { color: colors.textPrimary }]}>{user?.fullname?.toUpperCase() || 'CLIENT'}</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <TouchableOpacity 
            style={[styles.profileButton, { borderColor: colors.border, borderRadius: radius.full }]}
            onPress={() => navigation.navigate('Search')}
          >
            <Search size={22} color={colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.profileButton, { borderColor: colors.primary, borderRadius: radius.full }]}
            onPress={() => navigation.navigate('Profile')}
          >
            {user?.profileImage ? (
              <Image source={{ uri: user.profileImage }} style={styles.profileImg} />
            ) : (
              <User size={24} color={colors.primary} />
            )}
          </TouchableOpacity>
        </View>
      </View>


      <FlatList
        data={list}
        keyExtractor={item => item._id}
        renderItem={({ item, index }) => (
          <VendorCard 
            vendor={item} 
            index={index} 
            onPress={() => navigation.navigate('VendorDetail', { id: item._id })} 
          />
        )}
        ListHeaderComponent={() => (
          <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>RECOMMENDED NEAR YOU</Text>
          </View>
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        ListEmptyComponent={() => (
          loading ? (
            <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={{ color: colors.textMuted, textAlign: 'center' }}>No professionals available in your area yet.</Text>
            </View>
          )
        )}
        contentContainerStyle={{ paddingHorizontal: 0, paddingBottom: 40 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 24,
  },
  greeting: { fontSize: 10, fontWeight: '700', letterSpacing: 2 },
  username: { fontSize: 20, fontWeight: '800', marginTop: 2, letterSpacing: 1 },
  profileButton: { 
    width: 48, height: 48, borderWidth: 1, 
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden' 
  },
  profileImg: { width: '100%', height: '100%' },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    marginBottom: 20,
  },
  searchText: { marginLeft: 12, fontSize: 13, letterSpacing: 0.5 },
  emptyContainer: { padding: 40, alignItems: 'center' },
});

export default HomeScreen;
