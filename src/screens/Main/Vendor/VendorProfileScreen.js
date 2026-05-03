import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, ActivityIndicator, Alert, Switch, StatusBar, Modal, FlatList } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchVendorProfile, updateVendorProfile } from '../../../store/vendorSlice';
import { logout, updateProfile as updateUserProfile } from '../../../store/authSlice';
import { useTheme } from '../../../theme/useTheme';
import { Camera, MapPin, Clock, FileText, LogOut, Save, Image as ImageIcon, X, Plus, Trash2 } from 'lucide-react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import api from '../../../services/api';

const Section = ({ title, icon, children, colors, radius }) => (
  <View style={styles.section}>
    <View style={styles.sectionHeader}>
      {icon}
      <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{title}</Text>
    </View>
    <View style={[styles.sectionContent, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: radius.md }]}>
      {children}
    </View>
  </View>
);

const VendorProfileScreen = () => {
  const dispatch = useDispatch();
  const { dashboard, loading: vendorLoading } = useSelector(state => state.vendor);
  const { user, loading: userLoading } = useSelector(state => state.auth);
  const { colors, spacing, radius } = useTheme();

  const vendor = dashboard?.vendor;

  const [form, setForm] = useState({
    fullname: user?.fullname || '',
    workTitle: vendor?.workTitle || '',
    description: vendor?.vendorDescription || '',
    location: {
      street: vendor?.vendorLocation?.street || '',
      city: vendor?.vendorLocation?.city || '',
      state: vendor?.vendorLocation?.state || '',
      pinCode: vendor?.vendorLocation?.pinCode || '',
    }
  });

  const [timings, setTimings] = useState(vendor?.timings || []);
  const [images, setImages] = useState(vendor?.images || []);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (vendor) {
      setForm({
        fullname: user?.fullname || '',
        workTitle: vendor.workTitle || '',
        description: vendor.vendorDescription || '',
        location: {
          street: vendor.vendorLocation?.street || '',
          city: vendor.vendorLocation?.city || '',
          state: vendor.vendorLocation?.state || '',
          pinCode: vendor.vendorLocation?.pinCode || '',
        }
      });
      setTimings(vendor.timings || []);
      setImages(vendor.images || []);
    }
  }, [vendor]);

  // ─── Image Handling ────────────────────────────────────────────────────────
  
  const handlePickProfile = async () => {
    const result = await launchImageLibrary({ mediaType: 'photo', quality: 0.7 });
    if (result.assets && result.assets[0]) {
      uploadProfileImage(result.assets[0]);
    }
  };

  const uploadProfileImage = async (asset) => {
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('profileImage', {
        uri: asset.uri,
        type: asset.type,
        name: asset.fileName || 'profile.jpg',
      });

      const res = await api.put('/users/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        dispatch(fetchVendorProfile());
        Alert.alert('Success', 'Profile picture updated.');
      }
    } catch (error) {
      Alert.alert('Upload Failed', error.response?.data?.message || 'Error uploading image');
    } finally {
      setUploading(false);
    }
  };

  const handlePickGallery = async () => {
    if (images.length >= 4) return Alert.alert('Limit Reached', 'You can upload up to 4 office images.');
    
    const result = await launchImageLibrary({ mediaType: 'photo', quality: 0.7 });
    if (result.assets && result.assets[0]) {
      uploadGalleryImage(result.assets[0]);
    }
  };

  const uploadGalleryImage = async (asset) => {
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('images', {
        uri: asset.uri,
        type: asset.type,
        name: asset.fileName || 'office.jpg',
      });

      const res = await api.post('/vendors/me/images', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        dispatch(fetchVendorProfile());
        Alert.alert('Success', 'Gallery image added.');
      }
    } catch (error) {
      Alert.alert('Upload Failed', error.response?.data?.message || 'Error uploading image');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = async (imgUrl) => {
    try {
      setUploading(true);
      const res = await api.delete('/vendors/me/images', { data: { imageUrl: imgUrl } });
      if (res.data.success) {
        dispatch(fetchVendorProfile());
      }
    } catch (error) {
      Alert.alert('Error', 'Could not remove image');
    } finally {
      setUploading(false);
    }
  };

  // ─── Timings Handling ──────────────────────────────────────────────────────

  const toggleDay = (dayIndex) => {
    const newTimings = [...timings];
    newTimings[dayIndex] = { ...newTimings[dayIndex], open: !newTimings[dayIndex].open };
    setTimings(newTimings);
  };

  // Simple auto-generator for 30min slots e.g. 09:00 to 18:00
  const generateDefaultSlots = () => {
    const slots = [];
    for (let h = 9; h < 18; h++) {
      const hh = h.toString().padStart(2, '0');
      slots.push(`${hh}:00`);
      slots.push(`${hh}:30`);
    }
    return slots;
  };

  const handleUpdate = async () => {
    // Ensure all days have some default slots if they are open
    const updatedTimings = timings.map(t => ({
      ...t,
      slots: t.slots.length > 0 ? t.slots : (t.open ? generateDefaultSlots() : [])
    }));

    const result = await dispatch(updateVendorProfile({
      workTitle: form.workTitle,
      vendorDescription: form.description,
      vendorLocation: form.location,
      timings: updatedTimings
    }));

    if (form.fullname !== user.fullname) {
      await dispatch(updateUserProfile({ fullname: form.fullname }));
    }

    if (!result.error) {
      Alert.alert('Success', 'Business profile updated successfully!');
    } else {
      Alert.alert('Error', result.payload || 'Update failed');
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', onPress: () => dispatch(logout()), style: 'destructive' }
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />
      
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Profile Header */}
        <View style={styles.header}>
          <View style={styles.avatarWrap}>
            <TouchableOpacity 
              style={[styles.avatar, { borderColor: colors.primary }]}
              onPress={handlePickProfile}
              disabled={uploading}
            >
              {user?.profileImage ? (
                <Image source={{ uri: user.profileImage }} style={styles.avatarImg} />
              ) : (
                <Text style={[styles.avatarText, { color: colors.primary }]}>{user?.fullname?.charAt(0)}</Text>
              )}
              <View style={[styles.editAvatarBtn, { backgroundColor: colors.primary }]}>
                {uploading ? <ActivityIndicator size="small" color="#fff" /> : <Camera size={12} color="#fff" />}
              </View>
            </TouchableOpacity>
          </View>
          <Text style={[styles.nameText, { color: colors.textPrimary }]}>{user?.fullname?.toUpperCase()}</Text>
          <Text style={[styles.roleText, { color: colors.textMuted }]}>CERTIFIED VENDOR • EST. 2024</Text>
        </View>

        <View style={{ paddingHorizontal: spacing.md }}>
          {/* Business Details */}
          <Section title="BUSINESS DETAILS" icon={<FileText size={16} color={colors.primary} />} colors={colors} radius={radius}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textMuted }]}>BUSINESS NAME</Text>
              <TextInput 
                value={form.fullname} 
                onChangeText={t => setForm({...form, fullname: t})} 
                style={[styles.input, { color: colors.textPrimary }]} 
              />
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textMuted }]}>PROFESSIONAL TITLE</Text>
              <TextInput 
                value={form.workTitle} 
                placeholder="e.g. Master Barber"
                placeholderTextColor={colors.textMuted}
                onChangeText={t => setForm({...form, workTitle: t})} 
                style={[styles.input, { color: colors.textPrimary }]} 
              />
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textMuted }]}>SERVICES DESCRIPTION</Text>
              <TextInput 
                value={form.description} 
                multiline
                placeholder="Describe your expertise..."
                placeholderTextColor={colors.textMuted}
                onChangeText={t => setForm({...form, description: t})} 
                style={[styles.input, { color: colors.textPrimary, height: 80, textAlignVertical: 'top' }]} 
              />
            </View>
          </Section>

          {/* Office Gallery */}
          <Section title="OFFICE GALLERY (MAX 4)" icon={<ImageIcon size={16} color={colors.primary} />} colors={colors} radius={radius}>
            <View style={styles.galleryContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ padding: 12 }}>
                {images.map((img, idx) => (
                  <View key={idx} style={styles.galleryItem}>
                    <Image source={{ uri: img }} style={[styles.galleryImg, { borderRadius: radius.sm }]} />
                    <TouchableOpacity 
                      style={[styles.removeImgBtn, { backgroundColor: colors.error }]} 
                      onPress={() => handleRemoveImage(img)}
                    >
                      <X size={12} color="#fff" />
                    </TouchableOpacity>
                  </View>
                ))}
                {images.length < 4 && (
                  <TouchableOpacity 
                    style={[styles.addImgBtn, { borderColor: colors.border, borderRadius: radius.sm }]}
                    onPress={handlePickGallery}
                    disabled={uploading}
                  >
                    {uploading ? <ActivityIndicator color={colors.primary} /> : <Plus size={24} color={colors.primary} />}
                  </TouchableOpacity>
                )}
              </ScrollView>
            </View>
          </Section>

          {/* Location */}
          <Section title="OFFICE LOCATION" icon={<MapPin size={16} color={colors.primary} />} colors={colors} radius={radius}>
            <TextInput 
              placeholder="Street Address" 
              placeholderTextColor={colors.textMuted}
              value={form.location.street}
              onChangeText={t => setForm({...form, location: {...form.location, street: t}})}
              style={[styles.input, { color: colors.textPrimary, padding: 16 }]}
            />
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={{ flexDirection: 'row' }}>
              <TextInput 
                placeholder="City" 
                placeholderTextColor={colors.textMuted}
                value={form.location.city}
                onChangeText={t => setForm({...form, location: {...form.location, city: t}})}
                style={[styles.input, { flex: 1, color: colors.textPrimary, padding: 16 }]}
              />
              <View style={{ width: 1, backgroundColor: colors.border }} />
              <TextInput 
                placeholder="Pin Code" 
                placeholderTextColor={colors.textMuted}
                value={form.location.pinCode}
                onChangeText={t => setForm({...form, location: {...form.location, pinCode: t}})}
                style={[styles.input, { flex: 1, color: colors.textPrimary, padding: 16 }]}
              />
            </View>
          </Section>

          {/* Working Hours */}
          <Section title="WORKING DAYS & HOURS" icon={<Clock size={16} color={colors.primary} />} colors={colors} radius={radius}>
            {['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'].map((day, i) => {
              const dayTiming = timings.find(t => t.day === day) || { day, open: false, slots: [] };
              const dayIndexInState = timings.findIndex(t => t.day === day);
              
              const localToggle = () => {
                if (dayIndexInState === -1) {
                  setTimings([...timings, { day, open: true, slots: generateDefaultSlots() }]);
                } else {
                  const newTimings = [...timings];
                  newTimings[dayIndexInState] = { ...newTimings[dayIndexInState], open: !newTimings[dayIndexInState].open };
                  setTimings(newTimings);
                }
              };

              return (
                <View key={day} style={[styles.dayRow, i < 6 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
                  <View>
                    <Text style={[styles.dayName, { color: colors.textPrimary }]}>{day.toUpperCase()}</Text>
                    <Text style={[styles.slotInfo, { color: dayTiming.open ? colors.primary : colors.textMuted }]}>
                      {dayTiming.open ? '09:00 AM - 06:00 PM' : 'CLOSED'}
                    </Text>
                  </View>
                  <Switch 
                    value={dayTiming.open} 
                    onValueChange={localToggle}
                    trackColor={{ false: colors.border, true: colors.primaryGlow }}
                    thumbColor={dayTiming.open ? colors.primary : colors.textMuted}
                  />
                </View>
              );
            })}
          </Section>

          {/* Save Button (Moved inside ScrollView) */}
          <TouchableOpacity 
            style={[styles.saveBtn, { backgroundColor: colors.primary, borderRadius: radius.md, marginBottom: 20 }]}
            onPress={handleUpdate}
            disabled={vendorLoading || userLoading || uploading}
          >
            {(vendorLoading || userLoading || uploading) ? (
              <ActivityIndicator color={colors.primaryText} />
            ) : (
              <Text style={[styles.saveBtnText, { color: colors.primaryText }]}>SAVE BUSINESS PROFILE</Text>
            )}
          </TouchableOpacity>

          {/* Logout */}
          <TouchableOpacity 
            style={[styles.logoutBtn, { borderColor: colors.error, borderRadius: radius.md, marginBottom: 60 }]} 
            onPress={handleLogout}
          >
            <LogOut size={18} color={colors.error} />
            <Text style={[styles.logoutText, { color: colors.error }]}>TERMINATE SESSION</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { alignItems: 'center', paddingVertical: 40 },
  avatarWrap: { marginBottom: 16 },
  avatar: { width: 90, height: 90, borderRadius: 45, borderWidth: 1, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  avatarImg: { width: '100%', height: '100%', borderRadius: 45 },
  avatarText: { fontSize: 32, fontWeight: '300' },
  editAvatarBtn: { position: 'absolute', bottom: 0, right: 0, width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#fff' },
  nameText: { fontSize: 20, fontWeight: '800', letterSpacing: 2 },
  roleText: { fontSize: 10, marginTop: 6, letterSpacing: 1.5, fontWeight: '600' },
  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 11, fontWeight: '800', marginLeft: 8, letterSpacing: 1.5 },
  sectionContent: { borderWidth: 1, overflow: 'hidden' },
  inputGroup: { padding: 16 },
  label: { fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  input: { fontSize: 16, padding: 0, marginTop: 4 },
  divider: { height: 1 },
  galleryContainer: { minHeight: 100 },
  galleryItem: { marginRight: 12, position: 'relative' },
  galleryImg: { width: 80, height: 80, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  removeImgBtn: { position: 'absolute', top: -5, right: -5, width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  addImgBtn: { width: 80, height: 80, borderStyle: 'dashed', borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  dayRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  dayName: { fontSize: 12, fontWeight: '800', letterSpacing: 1 },
  slotInfo: { fontSize: 10, marginTop: 4, fontWeight: '600' },
  logoutBtn: { paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, borderWidth: 1 },
  logoutText: { fontSize: 12, fontWeight: '800', letterSpacing: 1 },
  saveBtn: { 
    height: 54, alignItems: 'center', justifyContent: 'center', marginTop: 10,
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 2
  },
  saveBtnText: { fontSize: 14, fontWeight: '800', letterSpacing: 2 },
});

export default VendorProfileScreen;
