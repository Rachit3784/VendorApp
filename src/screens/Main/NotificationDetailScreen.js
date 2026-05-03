import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { useDispatch } from 'react-redux';
import { markOneRead } from '../../store/notificationSlice';
import { useTheme } from '../../theme/useTheme';
import { ChevronLeft, Bell, Check, Clock, X, Calendar, AlertCircle } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const NotificationDetailScreen = ({ route, navigation }) => {
  const { notification } = route.params;
  const dispatch = useDispatch();
  const { colors, spacing, radius } = useTheme();

  useEffect(() => {
    if (!notification.isRead) {
      dispatch(markOneRead(notification._id));
    }
  }, []);



  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />
      
      {/* Header */}
      <View style={[styles.header, { paddingHorizontal: spacing.md }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft color={colors.textPrimary} size={28} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>DETAIL VIEW</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.md, paddingTop: 40 }}>

        <View style={styles.content}>
          <Text style={[styles.date, { color: colors.textMuted }]}>
            {new Date(notification.createdAt).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </Text>
          <Text style={[styles.time, { color: colors.textMuted }]}>
            {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>

          <Text style={[styles.title, { color: colors.textPrimary }]}>{notification.title}</Text>
          
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          
          <Text style={[styles.body, { color: colors.textSecondary }]}>{notification.body}</Text>
        </View>

        <TouchableOpacity 
          style={[styles.closeBtn, { backgroundColor: colors.primary, borderRadius: radius.md }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={[styles.closeBtnText, { color: colors.primaryText }]}>DISMISS VIEW</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 10, fontWeight: '800', letterSpacing: 2 },
  content: { paddingHorizontal: 8 },
  date: { fontSize: 12, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase' },
  time: { fontSize: 11, marginTop: 4, marginBottom: 16 },
  title: { fontSize: 24, fontWeight: '800', lineHeight: 32, letterSpacing: 0.5 },
  divider: { height: 1, width: 40, marginVertical: 24 },
  body: { fontSize: 16, lineHeight: 26, letterSpacing: 0.3 },
  closeBtn: {
    marginTop: 48,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: { fontSize: 12, fontWeight: '800', letterSpacing: 2 },
});

export default NotificationDetailScreen;
