import React, { useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, StatusBar, ActivityIndicator, RefreshControl } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNotifications, markAllRead, markOneRead } from '../../store/notificationSlice';
import { useTheme } from '../../theme/useTheme';
import { Bell, Check, Clock, X, Calendar, AlertCircle } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';

const NotificationScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { list, loading, unreadCount } = useSelector(state => state.notification);
  const { colors, spacing, radius } = useTheme();

  useFocusEffect(
    React.useCallback(() => {
      dispatch(fetchNotifications());
    }, [])
  );

  const onRefresh = () => dispatch(fetchNotifications());

  const getIcon = (type) => {
    switch (type) {
      case 'booking_confirmed': return <Check size={20} color={colors.success} />;
      case 'booking_cancelled': return <X size={20} color={colors.error} />;
      case 'booking_rescheduled': return <Clock size={20} color={colors.accent} />;
      case 'new_booking_request': return <Calendar size={20} color={colors.primary} />;
      default: return <Bell size={20} color={colors.textMuted} />;
    }
  };

  const renderNotification = ({ item }) => (
    <TouchableOpacity 
      onPress={() => navigation.navigate('NotificationDetail', { notification: item })}
      style={[styles.card, { backgroundColor: item.isRead ? colors.bg : colors.card, borderBottomColor: colors.border }]}
    >
      <View style={[styles.iconCircle, { backgroundColor: item.isRead ? colors.surface : colors.primaryGlow }]}>
        {getIcon(item.type)}
      </View>
      <View style={styles.content}>
        <View style={styles.row}>
          <Text style={[styles.title, { color: colors.textPrimary, fontWeight: item.isRead ? '600' : '800' }]} numberOfLines={1}>
            {item.title.toUpperCase()}
          </Text>
          {!item.isRead && <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />}
        </View>
        <Text style={[styles.body, { color: item.isRead ? colors.textMuted : colors.textSecondary }]} numberOfLines={1}>
          {item.body}
        </Text>
        <Text style={[styles.time, { color: colors.textMuted }]}>
          {new Date(item.createdAt).toLocaleDateString()} • {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />
      
      <View style={[styles.header, { paddingHorizontal: spacing.md }]}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Notifications</Text>
          <Text style={[styles.headerSub, { color: colors.textMuted }]}>{unreadCount} unread messages</Text>
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={() => dispatch(markAllRead())}>
            <Text style={{ color: colors.primary, fontWeight: '700' }}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={list}
        keyExtractor={item => item._id}
        renderItem={renderNotification}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        ListEmptyComponent={() => (
          loading ? (
            <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
          ) : (
            <View style={styles.emptyState}>
              <Bell size={64} color={colors.border} />
              <Text style={{ color: colors.textMuted, marginTop: 16 }}>No notifications yet</Text>
            </View>
          )
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingVertical: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  headerTitle: { fontSize: 28, fontWeight: '800' },
  headerSub: { fontSize: 14, marginTop: 4 },
  card: { flexDirection: 'row', padding: 16, borderBottomWidth: 1 },
  iconCircle: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  content: { flex: 1 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  title: { fontSize: 13, flex: 1, marginRight: 8, letterSpacing: 0.5 },
  unreadDot: { width: 6, height: 6, borderRadius: 3 },
  body: { fontSize: 12, lineHeight: 18, marginTop: 2 },
  time: { fontSize: 10, marginTop: 6, fontWeight: '600', letterSpacing: 0.5 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 150 },
});

export default NotificationScreen;
