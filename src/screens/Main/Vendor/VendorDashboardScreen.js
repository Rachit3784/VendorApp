import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, ActivityIndicator, RefreshControl, Dimensions, Image } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchVendorProfile } from '../../../store/vendorSlice';
import { useTheme } from '../../../theme/useTheme';
import { Calendar, CheckCircle2, Clock, XCircle, TrendingUp, Users, User } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import { fetchNotifications } from '../../../store/notificationSlice';

const { width } = Dimensions.get('window');

const VendorDashboardScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { dashboard, loading } = useSelector(state => state.vendor);
  const { user } = useSelector(state => state.auth);
  const { colors, spacing, radius } = useTheme();
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      dispatch(fetchVendorProfile());
      dispatch(fetchNotifications());
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchVendorProfile());
    setRefreshing(false);
  };

  const stats = dashboard?.stats || { total: 0, pending: 0, confirmed: 0, cancelled: 0 };

  const StatCard = ({ title, value, icon, color, bg }) => (
    <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: radius.md }]}>
      <View style={[styles.statIcon, { backgroundColor: bg }]}>{icon}</View>
      <Text style={[styles.statValue, { color: colors.textPrimary }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.textMuted }]}>{title.toUpperCase()}</Text>
    </View>
  );

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.bg }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      showsVerticalScrollIndicator={false}
    >
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />
      
      {/* Header */}
      <View style={[styles.header, { paddingHorizontal: spacing.md }]}>
        <View>
          <Text style={[styles.greeting, { color: colors.textMuted }]}>BUSINESS PORTAL</Text>
          <Text style={[styles.username, { color: colors.textPrimary }]}>{user?.fullname?.toUpperCase()}</Text>
        </View>
        <TouchableOpacity 
          style={[styles.profileButton, { borderColor: colors.primary, borderRadius: radius.full }]}
          onPress={() => navigation.navigate('MyProfile')}
        >
          {user?.profileImage ? (
            <Image source={{ uri: user.profileImage }} style={styles.profileImg} />
          ) : (
            <User size={24} color={colors.primary} />
          )}
        </TouchableOpacity>
      </View>

      {loading && !refreshing ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 100 }} />
      ) : (
        <View style={{ padding: spacing.md }}>
          {/* Main Stats Grid */}
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>BUSINESS OVERVIEW</Text>
          <View style={styles.statsGrid}>
            <StatCard 
              title="Requests" 
              value={stats.total} 
              icon={<Calendar color={colors.primary} size={20} />} 
              bg={colors.primaryGlow} 
            />
            <StatCard 
              title="Pending" 
              value={stats.pending} 
              icon={<Clock color={colors.pending} size={20} />} 
              bg={colors.pendingBg} 
            />
            <StatCard 
              title="Success" 
              value={stats.confirmed} 
              icon={<CheckCircle2 color={colors.success} size={20} />} 
              bg={colors.successBg} 
            />
            <StatCard 
              title="Failed" 
              value={stats.cancelled} 
              icon={<XCircle color={colors.error} size={20} />} 
              bg={colors.errorBg} 
            />
          </View>

          {/* Quick Actions */}
          <Text style={[styles.sectionTitle, { color: colors.textPrimary, marginTop: 32 }]}>MANAGEMENT</Text>
          <View style={styles.actionRow}>
            <TouchableOpacity 
              style={[styles.actionCard, { backgroundColor: colors.surface, borderRadius: radius.md, borderColor: colors.border, borderWidth: 1 }]}
              onPress={() => navigation.navigate('Bookings')}
            >
              <Users color={colors.primary} size={24} />
              <Text style={[styles.actionText, { color: colors.textPrimary }]}>MANAGE BOOKINGS</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionCard, { backgroundColor: colors.surface, borderRadius: radius.md, borderColor: colors.border, borderWidth: 1 }]}
              onPress={() => navigation.navigate('MyProfile')}
            >
              <TrendingUp color={colors.accent} size={24} />
              <Text style={[styles.actionText, { color: colors.textPrimary }]}>UPDATE PROFILE</Text>
            </TouchableOpacity>
          </View>

          {/* Info Card */}
          <View style={[styles.infoCard, { backgroundColor: colors.card, borderRadius: radius.md, borderColor: colors.primary, borderLeftWidth: 4 }]}>
            <Text style={[styles.infoTitle, { color: colors.primary }]}>PROFESSIONAL TIP</Text>
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              Keeping your business details up to date ensures customers can find and trust your services easily.
            </Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingVertical: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  greeting: { fontSize: 10, fontWeight: '700', letterSpacing: 2 },
  username: { fontSize: 20, fontWeight: '800', marginTop: 2, letterSpacing: 1 },
  profileButton: { 
    width: 48, height: 48, borderWidth: 1, 
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden' 
  },
  profileImg: { width: '100%', height: '100%' },
  sectionTitle: { fontSize: 12, fontWeight: '800', marginBottom: 16, letterSpacing: 1.5 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 },
  statCard: { width: (width - 48) / 2, padding: 16, borderWidth: 1 },
  statIcon: { width: 40, height: 40, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  statValue: { fontSize: 22, fontWeight: '800', marginBottom: 4, letterSpacing: 1 },
  statLabel: { fontSize: 9, fontWeight: '700', letterSpacing: 1 },
  actionRow: { flexDirection: 'row', gap: 12 },
  actionCard: { flex: 1, padding: 20, alignItems: 'center', justifyContent: 'center' },
  actionText: { fontSize: 11, fontWeight: '800', marginTop: 12, textAlign: 'center', letterSpacing: 1 },
  infoCard: { padding: 20, marginTop: 40, borderWidth: 1, borderTopColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: 'transparent' },
  infoTitle: { fontSize: 13, fontWeight: '800', marginBottom: 8, letterSpacing: 1 },
  infoText: { fontSize: 14, lineHeight: 22, fontStyle: 'italic' },
});

export default VendorDashboardScreen;
