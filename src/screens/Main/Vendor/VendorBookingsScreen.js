import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, StatusBar, ActivityIndicator, RefreshControl, Alert, TextInput, Image } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchVendorAppointments, updateAppointmentStatus } from '../../../store/appointmentSlice';
import { useTheme } from '../../../theme/useTheme';
import { Calendar, Clock, MapPin, User, Check, X, MessageSquare } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import { fetchVendorProfile } from '../../../store/vendorSlice';
import { fetchNotifications } from '../../../store/notificationSlice';

const VendorBookingsScreen = () => {
  const dispatch = useDispatch();
  const { vendorAppointments: list, loading } = useSelector(state => state.appointment);
  const { colors, spacing, radius } = useTheme();
  const [filter, setFilter] = useState('pending');
  const [refreshing, setRefreshing] = useState(false);
  const [tabLoading, setTabLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  useFocusEffect(
    React.useCallback(() => {
      const load = async () => {
        setTabLoading(true);
        await dispatch(fetchVendorAppointments(filter));
        setTabLoading(false);
      };
      load();
      dispatch(fetchVendorProfile());
      dispatch(fetchNotifications());
    }, [filter])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchVendorAppointments(filter));
    setRefreshing(false);
  };

  const handleAction = async (id, status) => {
    setActionLoading(id);
    const result = await dispatch(updateAppointmentStatus({ id, status, vendorNote: 'Processed by vendor' }));
    setActionLoading(null);
    
    if (result.error) {
      Alert.alert('Error', result.payload || 'Action failed');
    } else {
      // Invisible refresh of other stats
      dispatch(fetchVendorProfile());
      dispatch(fetchNotifications());
      
      if (status === 'confirmed') {
        Alert.alert('Success', 'Appointment confirmed. Other pending requests for this slot have been automatically cancelled.');
      }
    }
  };

  const renderBooking = ({ item }) => {
    const customer = item.customerId;
    const isPending = item.status === 'pending';

    return (
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: radius.lg }]}>
        <View style={styles.cardHeader}>
          <View style={styles.customerInfo}>
            <View style={[styles.avatar, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}>
              {customer?.profileImage ? (
                <Image source={{ uri: customer.profileImage }} style={styles.avatarImg} />
              ) : (
                <Text style={[styles.avatarText, { color: colors.primary }]}>{customer?.fullname?.charAt(0)}</Text>
              )}
            </View>
            <View style={{ marginLeft: 12 }}>
              <Text style={[styles.customerName, { color: colors.textPrimary }]}>{customer?.fullname}</Text>
              <Text style={[styles.customerPhone, { color: colors.textMuted }]}>{customer?.mobileNumber}</Text>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: colors.surface }]}>
            <Text style={[styles.statusText, { color: isPending ? colors.pending : (item.status === 'confirmed' ? colors.success : colors.error) }]}>
              {item.status.toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.infoRow}>
            <Calendar size={14} color={colors.primary} />
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>{item.appointmentDate}</Text>
            <Clock size={14} color={colors.primary} style={{ marginLeft: 16 }} />
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>{item.appointmentTime}</Text>
          </View>

          <View style={[styles.infoRow, { marginTop: 8 }]}>
            <MessageSquare size={14} color={colors.accent} />
            <Text style={[styles.infoText, { color: colors.textSecondary, flex: 1 }]} numberOfLines={2}>
              "{item.reason}"
            </Text>
          </View>

          <View style={[styles.infoRow, { marginTop: 8 }]}>
            <MapPin size={14} color={colors.textMuted} />
            <Text style={[styles.infoText, { color: colors.textMuted }]} numberOfLines={1}>
              {item.userLocation?.street}, {item.userLocation?.city}
            </Text>
          </View>
        </View>

        {isPending && (
          <View style={styles.cardFooter}>
            <TouchableOpacity 
              style={[styles.actionBtn, { backgroundColor: colors.errorBg, borderColor: colors.error }]}
              onPress={() => handleAction(item._id, 'cancelled')}
              disabled={actionLoading === item._id}
            >
              <X size={20} color={colors.error} />
              <Text style={[styles.actionBtnText, { color: colors.error }]}>Reject</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionBtn, { backgroundColor: colors.successBg, borderColor: colors.success }]}
              onPress={() => handleAction(item._id, 'confirmed')}
              disabled={actionLoading === item._id}
            >
              {actionLoading === item._id ? (
                <ActivityIndicator size="small" color={colors.success} />
              ) : (
                <>
                  <Check size={20} color={colors.success} />
                  <Text style={[styles.actionBtnText, { color: colors.success }]}>Accept</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />
      
      <View style={[styles.header, { paddingHorizontal: spacing.md }]}>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Bookings</Text>
      </View>

      <View style={styles.filterBar}>
        {[
          { label: 'All', value: '' },
          { label: 'Pending', value: 'pending' },
          { label: 'Confirmed', value: 'confirmed' },
          { label: 'Cancelled', value: 'cancelled' },
        ].map(f => (
          <TouchableOpacity 
            key={f.value} 
            onPress={() => setFilter(f.value)}
            style={[styles.filterTab, filter === f.value && { borderBottomColor: colors.primary }]}
          >
            <Text style={[styles.filterText, { color: filter === f.value ? colors.primary : colors.textMuted, fontWeight: filter === f.value ? '700' : '400' }]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {tabLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textMuted }]}>FETCHING {filter.toUpperCase() || 'ALL'} BOOKINGS...</Text>
        </View>
      ) : (
        <FlatList
          data={list}
          keyExtractor={item => item._id}
          renderItem={renderBooking}
          contentContainerStyle={{ padding: spacing.md, paddingBottom: 100 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
          ListEmptyComponent={() => (
            <View style={styles.emptyState}>
              <Clock size={64} color={colors.border} />
              <Text style={{ color: colors.textMuted, marginTop: 16 }}>No bookings in this category</Text>
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingVertical: 16 },
  headerTitle: { fontSize: 24, fontWeight: '800' },
  filterBar: { flexDirection: 'row', paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  filterTab: { paddingVertical: 12, marginRight: 24, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  filterText: { fontSize: 14 },
  card: { padding: 16, marginBottom: 16, borderWidth: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  customerInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  avatarImg: { width: '100%', height: '100%' },
  avatarText: { fontSize: 18, fontWeight: '800' },
  customerName: { fontSize: 16, fontWeight: '700' },
  customerPhone: { fontSize: 12 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusText: { fontSize: 10, fontWeight: '800' },
  cardBody: { marginBottom: 16 },
  infoRow: { flexDirection: 'row', alignItems: 'center' },
  infoText: { fontSize: 14, marginLeft: 8 },
  cardFooter: { flexDirection: 'row', gap: 12, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)', paddingTop: 16 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 8, borderWidth: 1 },
  actionBtnText: { fontSize: 14, fontWeight: '700', marginLeft: 8 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 100 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { marginTop: 16, fontSize: 10, fontWeight: '800', letterSpacing: 1.5 },
});

export default VendorBookingsScreen;
