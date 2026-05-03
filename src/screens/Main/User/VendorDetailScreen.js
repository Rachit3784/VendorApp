import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Image, StyleSheet, TouchableOpacity, StatusBar, ActivityIndicator, FlatList, Dimensions, Alert, Modal, TextInput } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchVendorById, submitRating } from '../../../store/vendorSlice';
import { useTheme } from '../../../theme/useTheme';
import { ChevronLeft, MapPin, Clock, Star, CheckCircle, Phone, AlertCircle, X } from 'lucide-react-native';
import RatingStars from '../../../components/RatingStars';

const { width } = Dimensions.get('window');

const VendorDetailScreen = ({ route, navigation }) => {
  const { id } = route.params;
  const dispatch = useDispatch();
  const { selectedVendor: vendor, loading } = useSelector(state => state.vendor);
  const { colors, spacing, radius } = useTheme();
  const [activeImage, setActiveImage] = useState(0);
  const [showGallery, setShowGallery] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [userStars, setUserStars] = useState(5);
  const [userReview, setUserReview] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);

  useEffect(() => {
    dispatch(fetchVendorById(id));
  }, [id]);

  if (loading || !vendor) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.bg }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const officeImages = vendor.images.length > 0 ? vendor.images : ['https://via.placeholder.com/800x600'];
  const name = vendor.vendorId?.fullname?.toUpperCase();
  const profileImage = vendor.vendorId?.profileImage;
  
  // Validation check
  const isProfileIncomplete = !vendor.workTitle || !vendor.vendorDescription || !vendor.vendorLocation?.city;

  const handleBookPress = () => {
    if (isProfileIncomplete) {
      Alert.alert(
        'Profile Incomplete',
        'This professional hasn\'t completed their profile details yet. Booking is currently unavailable.',
        [{ text: 'Go Back', onPress: () => navigation.goBack() }]
      );
      return;
    }
    navigation.navigate('Booking', { vendorId: vendor.vendorId._id });
  };

  const openGallery = (index) => {
    setGalleryIndex(index);
    setShowGallery(true);
  };

  const handleRateSubmit = async () => {
    setSubmittingRating(true);
    const result = await dispatch(submitRating({ vendorId: vendor._id, stars: userStars, review: userReview }));
    setSubmittingRating(false);
    
    if (result.error) {
      Alert.alert('Error', result.payload || 'Failed to submit rating');
    } else {
      Alert.alert('Success', 'Thank you for your feedback!');
      setShowRatingModal(false);
      setUserReview('');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Top Image Slider */}
        <View style={styles.imageSlider}>
          <FlatList
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(e) => {
              const x = e.nativeEvent.contentOffset.x;
              setActiveImage(Math.round(x / width));
            }}
            data={officeImages}
            keyExtractor={(_, i) => i.toString()}
            renderItem={({ item, index }) => (
              <TouchableOpacity activeOpacity={0.9} onPress={() => openGallery(index)}>
                <Image source={{ uri: item }} style={styles.sliderImage} />
              </TouchableOpacity>
            )}
          />
          <View style={styles.sliderDots}>
            {officeImages.map((_, i) => (
              <View 
                key={i} 
                style={[styles.dot, { backgroundColor: i === activeImage ? colors.primary : 'rgba(255,255,255,0.4)' }]} 
              />
            ))}
          </View>
          
          <TouchableOpacity 
            style={[styles.backButton, { backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: radius.full }]}
            onPress={() => navigation.goBack()}
          >
            <ChevronLeft color="#fff" size={24} />
          </TouchableOpacity>
        </View>

        <View style={[styles.content, { paddingHorizontal: spacing.md }]}>
          {/* Vendor Header */}
          <View style={styles.profileHeader}>
            <View style={styles.headerInfo}>
              <Text style={[styles.name, { color: colors.textPrimary }]}>{name}</Text>
              <Text style={[styles.workTitle, { color: colors.primary }]}>{vendor.workTitle?.toUpperCase() || 'NEW PROFESSIONAL'}</Text>
              <View style={styles.ratingRow}>
                <RatingStars rating={vendor.avgRating} />
                <Text style={[styles.ratingCount, { color: colors.textMuted }]}>({vendor.ratings?.length || 0} REVIEWS)</Text>
              </View>
              <TouchableOpacity 
                style={[styles.rateBtn, { borderColor: colors.primary, borderRadius: radius.sm }]}
                onPress={() => setShowRatingModal(true)}
              >
                <Star size={12} color={colors.primary} fill={colors.primary} />
                <Text style={[styles.rateBtnText, { color: colors.primary }]}>RATE PROFESSIONAL</Text>
              </TouchableOpacity>
            </View>
            <View style={[styles.profilePicWrap, { borderColor: colors.primary }]}>
              <Image source={{ uri: profileImage || 'https://via.placeholder.com/100' }} style={styles.profilePic} />
            </View>
          </View>

          {/* Stats Bar */}
          <View style={[styles.statsBar, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: radius.md }]}>
            <View style={styles.statItem}>
              <CheckCircle size={18} color={colors.success} />
              <Text style={[styles.statValue, { color: colors.textPrimary }]}>{vendor.totalAcceptedAppointments}</Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>DONE</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <Star size={18} color={colors.star} />
              <Text style={[styles.statValue, { color: colors.textPrimary }]}>{vendor.avgRating.toFixed(1)}</Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>RATING</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <Phone size={18} color={colors.accent} />
              <Text style={[styles.statValue, { color: colors.textPrimary }]}>VERIFIED</Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>STATUS</Text>
            </View>
          </View>

          {isProfileIncomplete && (
            <View style={[styles.warningBox, { backgroundColor: colors.errorBg, borderColor: colors.error, borderRadius: radius.md }]}>
              <AlertCircle size={20} color={colors.error} />
              <Text style={[styles.warningText, { color: colors.error }]}>This professional's profile is still under review/incomplete.</Text>
            </View>
          )}

          {/* Description */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>ABOUT PROFESSIONAL</Text>
            <Text style={[styles.description, { color: colors.textSecondary }]}>{vendor.vendorDescription || 'No description provided by the professional yet.'}</Text>
          </View>

          {/* Location */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>BUSINESS LOCATION</Text>
            <View style={styles.row}>
              <MapPin size={16} color={colors.primary} />
              <Text style={[styles.infoText, { color: colors.textSecondary, marginLeft: 8 }]}>
                {vendor.vendorLocation?.street}, {vendor.vendorLocation?.city}, {vendor.vendorLocation?.state}
              </Text>
            </View>
          </View>

          {/* Timings */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>WEEKLY AVAILABILITY</Text>
            {vendor.timings.length > 0 ? (
              vendor.timings.map((t, idx) => (
                <View key={idx} style={[styles.timingRow, { borderBottomColor: colors.border }]}>
                  <Text style={[styles.dayText, { color: colors.textPrimary, fontWeight: t.open ? '700' : '400' }]}>{t.day.toUpperCase()}</Text>
                  <Text style={[styles.timeText, { color: t.open ? colors.primary : colors.textMuted }]}>
                    {t.open ? `${t.slots[0]} - ${t.slots[t.slots.length-1]}` : 'CLOSED'}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={{ color: colors.textMuted, fontStyle: 'italic' }}>Schedule not available.</Text>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <View style={[styles.footer, { borderTopColor: colors.border, backgroundColor: colors.bg }]}>
        <TouchableOpacity 
          style={[styles.bookButton, { backgroundColor: isProfileIncomplete ? colors.border : colors.primary, borderRadius: radius.md }]}
          onPress={handleBookPress}
          activeOpacity={0.8}
        >
          <Text style={[styles.bookButtonText, { color: isProfileIncomplete ? colors.textMuted : colors.primaryText }]}>
            {isProfileIncomplete ? 'BOOKING UNAVAILABLE' : 'RESERVE APPOINTMENT'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Rating Interface Overlay */}
      {showRatingModal && (
        <View style={[StyleSheet.absoluteFill, styles.modalOverlay, { zIndex: 999 }]}>
          <View style={[styles.ratingModal, { backgroundColor: colors.card, borderRadius: radius.lg }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>RATE EXPERIENCE</Text>
              <TouchableOpacity onPress={() => setShowRatingModal(false)} style={styles.closeModalBtn}>
                <X size={24} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map(s => (
                <TouchableOpacity 
                  key={s} 
                  onPress={() => setUserStars(s)}
                  activeOpacity={0.7}
                  style={styles.starTouch}
                >
                  <Star 
                    size={40} 
                    color={s <= userStars ? colors.star : colors.starEmpty} 
                    fill={s <= userStars ? colors.star : 'transparent'} 
                  />
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.inputWrapper}>
              <TextInput
                style={[styles.reviewInput, { 
                  backgroundColor: colors.surface, 
                  color: colors.textPrimary, 
                  borderColor: colors.border,
                  borderRadius: radius.md 
                }]}
                placeholder="Write your review here (optional)..."
                placeholderTextColor={colors.textMuted}
                multiline
                numberOfLines={4}
                value={userReview}
                onChangeText={setUserReview}
              />
            </View>

            <TouchableOpacity 
              style={[styles.submitBtn, { backgroundColor: colors.primary, borderRadius: radius.md }]}
              onPress={handleRateSubmit}
              disabled={submittingRating}
            >
              {submittingRating ? (
                <ActivityIndicator color={colors.primaryText} />
              ) : (
                <Text style={[styles.submitBtnText, { color: colors.primaryText }]}>SUBMIT RATING</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  imageSlider: { width: width, height: 300, position: 'relative' },
  sliderImage: { width: width, height: 300 },
  sliderDots: {
    position: 'absolute', bottom: 20, width: '100%',
    flexDirection: 'row', justifyContent: 'center', gap: 6
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  backButton: {
    position: 'absolute', top: 50, left: 20, padding: 10,
  },
  content: { marginTop: 24 },
  profileHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  headerInfo: { flex: 1 },
  name: { fontSize: 22, fontWeight: '800', letterSpacing: 1 },
  workTitle: { fontSize: 12, fontWeight: '700', marginTop: 4, letterSpacing: 1 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  ratingCount: { fontSize: 10, marginLeft: 8, fontWeight: '600' },
  profilePicWrap: { width: 70, height: 70, borderRadius: 35, borderWidth: 1, overflow: 'hidden' },
  profilePic: { width: '100%', height: '100%' },
  statsBar: {
    flexDirection: 'row', padding: 16, marginBottom: 32,
    justifyContent: 'space-between', alignItems: 'center', borderWidth: 1
  },
  statItem: { alignItems: 'center', flex: 1 },
  statValue: { fontSize: 16, fontWeight: '800', marginVertical: 4, letterSpacing: 1 },
  statLabel: { fontSize: 9, fontWeight: '700', letterSpacing: 1 },
  statDivider: { width: 1, height: 30 },
  warningBox: { flexDirection: 'row', alignItems: 'center', padding: 16, marginBottom: 24, borderWidth: 1, gap: 12 },
  warningText: { fontSize: 12, flex: 1, fontWeight: '600' },
  section: { marginBottom: 32 },
  sectionTitle: { fontSize: 12, fontWeight: '800', marginBottom: 12, letterSpacing: 1.5 },
  description: { fontSize: 14, lineHeight: 24, opacity: 0.8 },
  row: { flexDirection: 'row', alignItems: 'center' },
  infoText: { fontSize: 14, flex: 1 },
  timingRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1 },
  dayText: { fontSize: 12, letterSpacing: 1 },
  timeText: { fontSize: 12, fontWeight: '700' },
  footer: {
    position: 'absolute', bottom: 0, width: '100%',
    padding: 20, borderTopWidth: 1,
  },
  bookButton: {
    height: 54, alignItems: 'center', justifyContent: 'center',
    elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2, shadowRadius: 4,
  },
  bookButtonText: { fontSize: 14, fontWeight: '800', letterSpacing: 2 },
  closeGallery: {
    position: 'absolute', top: 50, right: 20, zIndex: 10,
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center'
  },
  fullImageContainer: { width: width, height: '100%', justifyContent: 'center' },
  fullImage: { width: '100%', height: '80%' },
  rateBtn: { 
    flexDirection: 'row', alignItems: 'center', gap: 6, 
    alignSelf: 'flex-start', marginTop: 12, paddingHorizontal: 10, paddingVertical: 6,
    borderWidth: 1, borderStyle: 'dashed'
  },
  rateBtnText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: 20 },
  ratingModal: { padding: 24, elevation: 5 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 14, fontWeight: '800', letterSpacing: 2 },
  closeModalBtn: { padding: 4 },
  starsContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 32 },
  starTouch: { padding: 8 },
  inputWrapper: { width: '100%', marginBottom: 32 },
  reviewInput: { 
    height: 120, padding: 16, textAlignVertical: 'top', 
    borderWidth: 1, fontSize: 14 
  },
  submitBtn: { width: '100%', height: 54, alignItems: 'center', justifyContent: 'center' },
  submitBtnText: { fontSize: 12, fontWeight: '800', letterSpacing: 2 },
});

export default VendorDetailScreen;
