import React, { useRef, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Animated, Dimensions } from 'react-native';
import { Star, MapPin, ChevronRight, CheckCircle, ShieldCheck } from 'lucide-react-native';
import { useTheme } from '../theme/useTheme';

const { width } = Dimensions.get('window');

const VendorCard = ({ vendor, onPress, index }) => {
  const { colors, radius } = useTheme();
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        delay: index * 100,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 20,
        friction: 8,
        delay: index * 100,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  const coverImage = vendor.images && vendor.images.length > 0 ? vendor.images[0] : 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?q=80&w=800&auto=format&fit=crop';
  const profileImage = vendor.vendorId?.profileImage;
  const name = vendor.vendorId?.fullname?.toUpperCase() || 'NEW PROFESSIONAL';
  const work = vendor.workTitle?.toUpperCase() || 'SERVICES';
  const rating = vendor.avgRating || 0;
  const location = vendor.vendorLocation?.city?.toUpperCase() || 'AVAILABLE';

  return (
    <Animated.View style={[styles.container, { 
      backgroundColor: colors.card, 
      borderColor: colors.border,
      borderRadius: radius.lg,
      opacity: fadeAnim,
      transform: [{ translateY: slideAnim }]
    }]}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={styles.content}>
        {/* Top Cover Image Section */}
        <View style={styles.coverWrapper}>
          <Image source={{ uri: coverImage }} style={styles.coverImage} />
          <View style={[styles.statusBadge, { backgroundColor: colors.success + 'CC' }]}>
            <ShieldCheck size={10} color="#fff" />
            <Text style={styles.statusText}>VERIFIED</Text>
          </View>
        </View>

        {/* Profile Pic - LinkedIn Style (Overlapping) */}
        <View style={[styles.profilePicWrapper, { borderColor: colors.card, backgroundColor: colors.surface }]}>
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.profilePic} />
          ) : (
            <Text style={[styles.placeholderText, { color: colors.primary }]}>{name.charAt(0)}</Text>
          )}
        </View>

        {/* Details Section */}
        <View style={styles.details}>
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.name, { color: colors.textPrimary }]} numberOfLines={1}>{name}</Text>
              <Text style={[styles.work, { color: colors.primary }]} numberOfLines={1}>{work}</Text>
            </View>
            <View style={[styles.ratingBadge, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Star size={12} color={colors.star} fill={colors.star} />
              <Text style={[styles.ratingText, { color: colors.textPrimary }]}>{rating.toFixed(1)}</Text>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.footerRow}>
            <View style={styles.locationGroup}>
              <MapPin size={12} color={colors.textMuted} />
              <Text style={[styles.locationText, { color: colors.textMuted }]} numberOfLines={1}>{location}</Text>
            </View>
            <TouchableOpacity
              onPress={onPress}
            style={[styles.bookBtn, { backgroundColor: colors.primary, borderRadius: radius.sm }]}>
              <Text style={[styles.bookBtnText, { color: colors.primaryText }]}>VIEW PROFILE</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 13,
    marginVertical: 12,
    borderWidth: 1,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  content: { position: 'relative' },
  coverWrapper: { width: '100%', height: 120, position: 'relative' },
  coverImage: { width: '100%', height: '100%' },
  statusBadge: { 
    position: 'absolute', top: 12, right: 12, 
    paddingHorizontal: 8, paddingVertical: 4, 
    borderRadius: 4, flexDirection: 'row', alignItems: 'center', gap: 4 
  },
  statusText: { fontSize: 8, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },
  profilePicWrapper: { 
    width: 64, height: 64, borderRadius: 32, 
    borderWidth: 3, position: 'absolute', 
    top: 88, left: 16, zIndex: 5,
    alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden'
  },
  profilePic: { width: '100%', height: '100%' },
  placeholderText: { fontSize: 24, fontWeight: '300' },
  details: { padding: 16, paddingTop: 40 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  name: { fontSize: 16, fontWeight: '800', letterSpacing: 0.5 },
  work: { fontSize: 11, fontWeight: '700', marginTop: 2, letterSpacing: 1 },
  ratingBadge: { 
    flexDirection: 'row', alignItems: 'center', 
    paddingHorizontal: 8, paddingVertical: 4, 
    borderRadius: 6, borderWidth: 1, gap: 4 
  },
  ratingText: { fontSize: 12, fontWeight: '800' },
  divider: { height: 1, marginVertical: 12, opacity: 0.5 },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  locationGroup: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  locationText: { fontSize: 11, fontWeight: '600', letterSpacing: 0.5 },
  bookBtn: { paddingHorizontal: 12, paddingVertical: 8 },
  bookBtnText: { fontSize: 9, fontWeight: '900', letterSpacing: 1 },
});

export default VendorCard;
