import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, ActivityIndicator, Alert, StatusBar } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { logout, updateProfile } from '../../../store/authSlice';
import { useTheme } from '../../../theme/useTheme';
import { Camera, MapPin, User, LogOut, Save, ChevronRight, Phone } from 'lucide-react-native';
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

const UserProfileScreen = () => {
  const dispatch = useDispatch();
  const { user, loading } = useSelector(state => state.auth);
  const { colors, spacing, radius } = useTheme();

  const [form, setForm] = useState({
    fullname: user?.fullname || '',
    bio: user?.bio || '',
    location: {
      street: user?.location?.street || '',
      city: user?.location?.city || '',
      state: user?.location?.state || '',
      pinCode: user?.location?.pinCode || '',
    }
  });

  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        fullname: user.fullname || '',
        bio: user.bio || '',
        location: {
          street: user.location?.street || '',
          city: user.location?.city || '',
          state: user.location?.state || '',
          pinCode: user.location?.pinCode || '',
        }
      });
    }
  }, [user]);

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
        Alert.alert('Success', 'Profile picture updated.');
      }
    } catch (error) {
      Alert.alert('Upload Failed', 'Error uploading image');
    } finally {
      setUploading(false);
    }
  };

  const handleUpdate = async () => {
    const result = await dispatch(updateProfile(form));
    if (!result.error) {
      Alert.alert('Success', 'Profile updated successfully!');
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
          <Text style={[styles.roleText, { color: colors.textMuted }]}>CLIENT MEMBER • EST. 2026</Text>
        </View>

        <View style={{ paddingHorizontal: spacing.md }}>
          {/* Basic Info */}
          <Section title="PERSONAL DETAILS" icon={<User size={16} color={colors.primary} />} colors={colors} radius={radius}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textMuted }]}>FULL NAME</Text>
              <TextInput 
                value={form.fullname} 
                onChangeText={t => setForm({...form, fullname: t})} 
                style={[styles.input, { color: colors.textPrimary }]} 
              />
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textMuted }]}>CONTACT NUMBER</Text>
              <Text style={{ color: colors.textPrimary, fontSize: 16, marginTop: 4 }}>{user?.mobileNumber}</Text>
            </View>
          </Section>

          {/* Address */}
          <Section title="OFFICE / HOME ADDRESS" icon={<MapPin size={16} color={colors.primary} />} colors={colors} radius={radius}>
            <TextInput 
              placeholder="Street" 
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

          {/* Save Button (Moved inside ScrollView) */}
          <TouchableOpacity 
            style={[styles.saveBtn, { backgroundColor: colors.primary, borderRadius: radius.md, marginBottom: 20 }]}
            onPress={handleUpdate}
            disabled={loading || uploading}
          >
            {(loading || uploading) ? (
              <ActivityIndicator color={colors.primaryText} />
            ) : (
              <Text style={[styles.saveBtnText, { color: colors.primaryText }]}>SAVE PROFILE</Text>
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
  logoutBtn: { paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, borderWidth: 1 },
  logoutText: { fontSize: 12, fontWeight: '800', letterSpacing: 1 },
  saveBtn: { 
    height: 54, alignItems: 'center', justifyContent: 'center', marginTop: 10,
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 2
  },
  saveBtnText: { fontSize: 14, fontWeight: '800', letterSpacing: 2 },
});

export default UserProfileScreen;
