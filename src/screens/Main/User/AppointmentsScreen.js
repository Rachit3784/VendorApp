import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, StatusBar, ActivityIndicator, RefreshControl } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserAppointments, cancelAppointment } from '../../../store/appointmentSlice';
import { useTheme } from '../../../theme/useTheme';
import { Calendar, Clock, MapPin, CheckCircle2, XCircle, Clock3, Trash2 } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Alert } from 'react-native';

const AppointmentsScreen = () => {
  const dispatch = useDispatch();
  const { userAppointments: list, loading } = useSelector(state => state.appointment);
  const { colors, spacing, radius } = useTheme();
  const [filter, setFilter] = useState(''); // 'pending', 'confirmed', 'cancelled'
  const [refreshing, setRefreshing] = useState(false);
  const [tabLoading, setTabLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    const load = async () => {
      setTabLoading(true);
      await dispatch(fetchUserAppointments(filter));
      setTabLoading(false);
    };
    load();
  }, [filter]);

  const onRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchUserAppointments(filter));
    setRefreshing(false);
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'confirmed': return { color: colors.success, bg: colors.successBg, icon: <CheckCircle2 size={14} color={colors.success} /> };
      case 'cancelled': return { color: colors.error, bg: colors.errorBg, icon: <XCircle size={14} color={colors.error} /> };
      default: return { color: colors.pending, bg: colors.pendingBg, icon: <Clock3 size={14} color={colors.pending} /> };
    }
  };

  const handleCancel = (id) => {
    Alert.alert(
      'Cancel Appointment',
      'Are you sure you want to cancel this appointment request?',
      [
        { text: 'No', style: 'cancel' },
        { 
          text: 'Yes, Cancel', 
          style: 'destructive',
          onPress: async () => {
            setCancellingId(id);
            await dispatch(cancelAppointment(id));
            setCancellingId(null);
          }
        }
      ]
    );
  };

  const renderAppointment = ({ item }) => {
    const statusStyle = getStatusStyle(item.status);
    const vendor = item.vendorId;

    return (
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: radius.md }]}>
        <View style={styles.cardHeader}>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
            {statusStyle.icon}
            <Text style={[styles.statusText, { color: statusStyle.color }]}>{item.status.toUpperCase()}</Text>
          </View>
          <Text style={[styles.dateText, { color: colors.textMuted }]}>{new Date(item.createdAt).toLocaleDateString()}</Text>
        </View>

        <View style={styles.cardBody}>
          <Text style={[styles.vendorName, { color: colors.textPrimary }]}>{vendor?.fullname?.toUpperCase()}</Text>
          
          <View style={styles.infoRow}>
            <Calendar size={12} color={colors.primary} />
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>{item.appointmentDate}</Text>
            <Clock size={12} color={colors.primary} style={{ marginLeft: 12 }} />
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>{item.appointmentTime}</Text>
          </View>

          <View style={[styles.infoRow, { marginTop: 6 }]}>
            <MapPin size={12} color={colors.textMuted} />
            <Text style={[styles.infoText, { color: colors.textMuted }]} numberOfLines={1}>
              {item.userLocation?.city?.toUpperCase()}, {item.userLocation?.state?.toUpperCase()}
            </Text>
          </View>

          {item.vendorNote ? (
            <View style={[styles.noteBox, { backgroundColor: colors.surface, borderRadius: radius.sm, borderColor: colors.border, borderLeftWidth: 3, borderLeftColor: colors.primary }]}>
              <Text style={[styles.noteLabel, { color: colors.primary }]}>PROFESSIONAL NOTE:</Text>
              <Text style={[styles.noteText, { color: colors.textSecondary }]}>{item.vendorNote}</Text>
            </View>
          ) : null}

          {item.status === 'pending' && (
            <TouchableOpacity 
              style={[styles.cancelBtn, { borderColor: colors.error, borderRadius: radius.sm }]}
              onPress={() => handleCancel(item._id)}
              disabled={cancellingId === item._id}
            >
              {cancellingId === item._id ? (
                <ActivityIndicator size="small" color={colors.error} />
              ) : (
                <>
                  <Trash2 size={14} color={colors.error} />
                  <Text style={[styles.cancelBtnText, { color: colors.error }]}>CANCEL REQUEST</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />
      
      <View style={[styles.header, { paddingHorizontal: spacing.md }]}>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>MY APPOINTMENTS</Text>
      </View>

      {/* Filter Tabs */}
      <View style={[styles.filterBar, { borderBottomColor: colors.border }]}>
        {[
          { label: 'ALL', value: '' },
          { label: 'PENDING', value: 'pending' },
          { label: 'CONFIRMED', value: 'confirmed' },
          { label: 'CANCELLED', value: 'cancelled' },
        ].map(f => (
          <TouchableOpacity 
            key={f.value} 
            onPress={() => setFilter(f.value)}
            style={[styles.filterTab, filter === f.value && { borderBottomColor: colors.primary }]}
          >
            <Text style={[styles.filterText, { color: filter === f.value ? colors.primary : colors.textMuted, fontWeight: filter === f.value ? '800' : '500' }]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {tabLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textMuted }]}>FETCHING {filter.toUpperCase() || 'ALL'} APPOINTMENTS...</Text>
        </View>
      ) : (
        <FlatList
          data={list}
          keyExtractor={item => item._id}
          renderItem={renderAppointment}
          contentContainerStyle={{ padding: spacing.md, paddingBottom: 120 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
          ListEmptyComponent={() => (
            <View style={styles.emptyState}>
              <Calendar size={48} color={colors.border} />
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>NO APPOINTMENTS FOUND</Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingVertical: 20 },
  headerTitle: { fontSize: 18, fontWeight: '800', letterSpacing: 2 },
  filterBar: { flexDirection: 'row', paddingHorizontal: 16, borderBottomWidth: 1 },
  filterTab: { paddingVertical: 14, marginRight: 24, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  filterText: { fontSize: 10, letterSpacing: 1 },
  card: { padding: 16, marginBottom: 16, borderWidth: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  statusText: { fontSize: 9, fontWeight: '800', marginLeft: 4, letterSpacing: 0.5 },
  dateText: { fontSize: 11, fontWeight: '600' },
  vendorName: { fontSize: 16, fontWeight: '800', marginBottom: 8, letterSpacing: 1 },
  infoRow: { flexDirection: 'row', alignItems: 'center' },
  infoText: { fontSize: 12, marginLeft: 6, fontWeight: '500' },
  noteBox: { marginTop: 16, padding: 12, borderWidth: 1, borderTopColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: 'transparent' },
  noteLabel: { fontSize: 8, fontWeight: '800', letterSpacing: 1, marginBottom: 4 },
  noteText: { fontSize: 13, fontStyle: 'italic', lineHeight: 18 },
  cancelBtn: { 
    marginTop: 16, paddingVertical: 10, 
    borderWidth: 1, borderStyle: 'dashed',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 
  },
  cancelBtnText: { fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 120 },
  emptyText: { fontSize: 10, fontWeight: '700', marginTop: 16, letterSpacing: 2 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { marginTop: 16, fontSize: 10, fontWeight: '800', letterSpacing: 1.5 },
});

export default AppointmentsScreen;
