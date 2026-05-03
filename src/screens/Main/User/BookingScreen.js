import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Alert, StatusBar } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAvailableSlots } from '../../../store/vendorSlice';
import { bookAppointment } from '../../../store/appointmentSlice';
import { useTheme } from '../../../theme/useTheme';
import { ChevronLeft, Calendar, Clock, MessageSquare, MapPin, CheckCircle2 } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const BookingScreen = ({ route, navigation }) => {
  const { vendorId } = route.params;
  const dispatch = useDispatch();
  const { availableSlots, slotsLoading } = useSelector(state => state.vendor);
  const { bookingLoading } = useSelector(state => state.appointment);
  const { user } = useSelector(state => state.auth);
  const { colors, spacing, radius } = useTheme();

  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTime, setSelectedTime] = useState(null);
  const [reason, setReason] = useState('');
  const [location, setLocation] = useState({
    street: user?.location?.street || '',
    city: user?.location?.city || '',
    state: user?.location?.state || '',
    pinCode: user?.location?.pinCode || '',
    country: user?.location?.country || 'India',
  });

  useEffect(() => {
    dispatch(fetchAvailableSlots({ vendorId, date: selectedDate }));
    setSelectedTime(null);
  }, [selectedDate]);

  const handleNext = () => {
    if (step === 1 && !selectedTime) return Alert.alert('Error', 'Please select a time slot.');
    if (step === 2 && !reason.trim()) return Alert.alert('Error', 'Please enter a reason for the appointment.');
    if (step === 3 && (!location.city.trim() || !location.street.trim())) return Alert.alert('Error', 'Please enter your street and city.');
    
    if (step < 4) setStep(step + 1);
    else handleConfirm();
  };

  const handleConfirm = async () => {
    const data = {
      vendorId,
      appointmentDate: selectedDate,
      appointmentTime: selectedTime,
      reason,
      userLocation: location,
    };
    
    const result = await dispatch(bookAppointment(data));
    if (!result.error) {
      Alert.alert('Success', 'Your appointment request has been sent!', [
        { text: 'View Appointments', onPress: () => navigation.navigate('Appointments') },
        { text: 'Back to Professional', onPress: () => navigation.goBack() }
      ]);
    } else {
      Alert.alert('Booking Failed', result.payload || 'Unknown error occurred.');
    }
  };

  const renderStepIndicator = () => (
    <View style={styles.indicatorContainer}>
      {[1, 2, 3, 4].map(i => (
        <React.Fragment key={i}>
          <View style={[styles.stepDot, { backgroundColor: i <= step ? colors.primary : colors.border }]}>
            <Text style={[styles.stepNum, { color: i <= step ? colors.primaryText : colors.textMuted }]}>{i}</Text>
          </View>
          {i < 4 && <View style={[styles.stepLine, { backgroundColor: i < step ? colors.primary : colors.border }]} />}
        </React.Fragment>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />
      
      {/* Header */}
      <View style={[styles.header, { paddingHorizontal: spacing.md }]}>
        <TouchableOpacity onPress={() => step > 1 ? setStep(step - 1) : navigation.goBack()}>
          <ChevronLeft color={colors.textPrimary} size={28} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>BOOK APPOINTMENT</Text>
        <View style={{ width: 28 }} />
      </View>

      {renderStepIndicator()}

      <ScrollView style={{ flex: 1, padding: spacing.md }} showsVerticalScrollIndicator={false}>
        
        {step === 1 && (
          <View>
            <View style={styles.sectionHeader}>
              <Calendar size={18} color={colors.primary} />
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>SELECT DATE & TIME</Text>
            </View>
            
            <View style={styles.dateRow}>
              {[0, 1, 2, 3, 4].map(offset => {
                const d = new Date();
                d.setDate(d.getDate() + offset);
                const iso = d.toISOString().split('T')[0];
                const label = offset === 0 ? 'Today' : d.toLocaleDateString('en-US', { weekday: 'short' });
                const dateNum = d.getDate();
                const isSelected = selectedDate === iso;
                
                return (
                  <TouchableOpacity 
                    key={iso} 
                    onPress={() => setSelectedDate(iso)}
                    style={[styles.dateItem, { backgroundColor: isSelected ? colors.primary : colors.card, borderColor: isSelected ? colors.primary : colors.border, borderRadius: radius.md }]}
                  >
                    <Text style={[styles.dateLabel, { color: isSelected ? colors.primaryText : colors.textMuted }]}>{label}</Text>
                    <Text style={[styles.dateValue, { color: isSelected ? colors.primaryText : colors.textPrimary }]}>{dateNum}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={[styles.sectionHeader, { marginTop: 32 }]}>
              <Clock size={18} color={colors.primary} />
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>AVAILABLE SLOTS</Text>
            </View>

            {slotsLoading ? (
              <ActivityIndicator color={colors.primary} style={{ marginTop: 20 }} />
            ) : availableSlots.length > 0 ? (
              <View style={styles.slotsGrid}>
                {availableSlots.map(time => {
                  const isSelected = selectedTime === time;
                  return (
                    <TouchableOpacity 
                      key={time} 
                      onPress={() => setSelectedTime(time)}
                      style={[styles.slotItem, { backgroundColor: isSelected ? colors.primary : colors.surface, borderColor: isSelected ? colors.primary : colors.border, borderRadius: radius.md }]}
                    >
                      <Text style={[styles.slotText, { color: isSelected ? colors.primaryText : colors.textPrimary }]}>{time}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : (
              <Text style={{ color: colors.error, marginTop: 12, fontSize: 13, fontWeight: '600' }}>No slots available for this date.</Text>
            )}
          </View>
        )}

        {step === 2 && (
          <View>
            <View style={styles.sectionHeader}>
              <MessageSquare size={18} color={colors.primary} />
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>REASON FOR CONNECTION</Text>
            </View>
            <TextInput
              multiline
              numberOfLines={6}
              placeholder="Describe why you want to meet..."
              placeholderTextColor={colors.textMuted}
              value={reason}
              onChangeText={setReason}
              style={[styles.textArea, { backgroundColor: colors.card, color: colors.textPrimary, borderColor: colors.border, borderRadius: radius.md }]}
            />
          </View>
        )}

        {step === 3 && (
          <View>
            <View style={styles.sectionHeader}>
              <MapPin size={18} color={colors.primary} />
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>YOUR LOCATION</Text>
            </View>
            <TextInput 
              placeholder="Street Address" 
              placeholderTextColor={colors.textMuted}
              value={location.street}
              onChangeText={t => setLocation({...location, street: t})}
              style={[styles.input, { backgroundColor: colors.card, color: colors.textPrimary, borderColor: colors.border, borderRadius: radius.md }]}
            />
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TextInput 
                placeholder="City" 
                placeholderTextColor={colors.textMuted}
                value={location.city}
                onChangeText={t => setLocation({...location, city: t})}
                style={[styles.input, { flex: 1, backgroundColor: colors.card, color: colors.textPrimary, borderColor: colors.border, borderRadius: radius.md }]}
              />
              <TextInput 
                placeholder="Pin Code" 
                placeholderTextColor={colors.textMuted}
                value={location.pinCode}
                onChangeText={t => setLocation({...location, pinCode: t})}
                style={[styles.input, { flex: 1, backgroundColor: colors.card, color: colors.textPrimary, borderColor: colors.border, borderRadius: radius.md }]}
              />
            </View>
            <TextInput 
              placeholder="State" 
              placeholderTextColor={colors.textMuted}
              value={location.state}
              onChangeText={t => setLocation({...location, state: t})}
              style={[styles.input, { backgroundColor: colors.card, color: colors.textPrimary, borderColor: colors.border, borderRadius: radius.md }]}
            />
          </View>
        )}

        {step === 4 && (
          <View style={[styles.confirmCard, { backgroundColor: colors.card, borderRadius: radius.md, borderColor: colors.border }]}>
            <CheckCircle2 size={48} color={colors.success} style={{ alignSelf: 'center', marginBottom: 16 }} />
            <Text style={[styles.confirmTitle, { color: colors.textPrimary }]}>CONFIRM BOOKING</Text>
            
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textMuted }]}>DATE:</Text>
              <Text style={[styles.confirmValue, { color: colors.textPrimary }]}>{selectedDate}</Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textMuted }]}>TIME:</Text>
              <Text style={[styles.confirmValue, { color: colors.textPrimary }]}>{selectedTime}</Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textMuted }]}>LOCATION:</Text>
              <Text style={[styles.confirmValue, { color: colors.textPrimary, textAlign: 'right' }]} numberOfLines={2}>{location.street}, {location.city}</Text>
            </View>
            
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            
            <Text style={[styles.confirmLabel, { color: colors.textMuted, marginBottom: 4 }]}>REASON:</Text>
            <Text style={[styles.confirmValue, { color: colors.textSecondary, fontStyle: 'italic', fontWeight: '400' }]}>"{reason}"</Text>
          </View>
        )}

      </ScrollView>

      {/* Footer Navigation */}
      <View style={[styles.footer, { borderTopColor: colors.border, backgroundColor: colors.bg }]}>
        <TouchableOpacity 
          style={[styles.nextButton, { backgroundColor: colors.primary, borderRadius: radius.md }]}
          onPress={handleNext}
          disabled={bookingLoading}
          activeOpacity={0.8}
        >
          {bookingLoading ? (
            <ActivityIndicator color={colors.primaryText} />
          ) : (
            <Text style={[styles.nextButtonText, { color: colors.primaryText }]}>
              {step === 4 ? 'CONFIRM & BOOK' : 'CONTINUE'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  headerTitle: { fontSize: 16, fontWeight: '800', letterSpacing: 1.5 },
  indicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
    paddingHorizontal: 40,
  },
  stepDot: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  stepNum: { fontSize: 10, fontWeight: '800' },
  stepLine: { flex: 1, height: 1, marginHorizontal: 4 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 13, fontWeight: '800', marginLeft: 10, letterSpacing: 1 },
  dateRow: { flexDirection: 'row', justifyContent: 'space-between' },
  dateItem: { flex: 1, paddingVertical: 10, alignItems: 'center', marginHorizontal: 4, borderWidth: 1 },
  dateLabel: { fontSize: 8, fontWeight: '700', textTransform: 'uppercase', marginBottom: 2 },
  dateValue: { fontSize: 15, fontWeight: '800' },
  slotsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  slotItem: { width: '31.5%', paddingVertical: 12, alignItems: 'center', borderWidth: 1 },
  slotText: { fontSize: 13, fontWeight: '700' },
  textArea: { padding: 16, textAlignVertical: 'top', borderWidth: 1, fontSize: 15, height: 120 },
  input: { padding: 14, borderWidth: 1, fontSize: 14, marginBottom: 12 },
  confirmCard: { padding: 20, borderWidth: 1 },
  confirmTitle: { fontSize: 16, fontWeight: '800', textAlign: 'center', marginBottom: 24, letterSpacing: 2 },
  confirmRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  confirmLabel: { fontSize: 12, fontWeight: '700' },
  confirmValue: { fontSize: 12, fontWeight: '800', flex: 1, textAlign: 'right' },
  divider: { height: 1, marginVertical: 16 },
  footer: { padding: 20, borderTopWidth: 1 },
  nextButton: { height: 54, alignItems: 'center', justifyContent: 'center' },
  nextButtonText: { fontSize: 14, fontWeight: '800', letterSpacing: 1.5 },
});

export default BookingScreen;
