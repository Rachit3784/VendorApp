import React, { useState, useRef, useEffect, memo } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Animated,
  KeyboardAvoidingView, Platform, ScrollView,
  TouchableWithoutFeedback, Keyboard, StyleSheet,
  StatusBar, ActivityIndicator, Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { signup, clearError } from '../../store/authSlice';
import { useTheme } from '../../theme/useTheme';

const InputField = memo(({ name, label, placeholder, secure, keyType,
  value, error, onChangeText, colors, radius }) => {

  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.fieldWrap}>
      <Text style={[styles.label, { color: isFocused ? colors.primary : colors.textMuted }]}>{label}</Text>
      <View style={[
        styles.inputWrap,
        { 
          borderColor: error ? colors.error : (isFocused ? colors.primary : colors.border), 
          backgroundColor: colors.surface,
          borderRadius: radius.md
        },
      ]}>
        <TextInput
          value={value}
          onChangeText={t => onChangeText(name, t)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          secureTextEntry={secure}
          keyboardType={keyType || 'default'}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          selectionColor={colors.primary}
          style={[styles.input, { color: colors.textPrimary }]}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>
      {error ? <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text> : null}
    </View>
  );
});

const SignupScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector(s => s.auth);
  const { colors, spacing, radius } = useTheme();

  const [form, setForm] = useState({
    fullname: '',
    userName: '',
    mobileNumber: '',
    password: '',
    role: 'customer', // Changed from 'user' to 'customer' to match backend
  });
  const [errors, setErrors] = useState({});

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }).start();
    return () => dispatch(clearError());
  }, []);

  useEffect(() => {
    if (error) Alert.alert('Registration Error', error);
  }, [error]);

  const handleChange = (name, text) => {
    setForm(prev => ({ ...prev, [name]: text }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    dispatch(clearError());
  };

  const handleSignup = () => {
    let err = {};
    if (form.fullname.length < 2) err.fullname = 'NAME IS TOO SHORT';
    if (form.userName.length < 3) err.userName = 'USERNAME MUST BE AT LEAST 3 CHARS';
    if (!/^[0-9]{10}$/.test(form.mobileNumber)) err.mobileNumber = 'ENTER A VALID 10-DIGIT NUMBER';
    if (form.password.length < 6) err.password = 'PASSWORD MUST BE AT LEAST 6 CHARACTERS';
    setErrors(err);
    if (Object.keys(err).length > 0) return;

    dispatch(signup(form));
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={[styles.container, { backgroundColor: colors.bg }]}>
        <StatusBar barStyle="light-content" backgroundColor={colors.bg} />
        
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
            
            <Animated.View style={{ opacity: fadeAnim }}>
              <View style={styles.header}>
                <Text style={[styles.logoText, { color: colors.primary }]}>VC</Text>
                <Text style={[styles.title, { color: colors.textPrimary }]}>REGISTRATION</Text>
                <Text style={[styles.subtitle, { color: colors.textMuted }]}>JOIN OUR PROFESSIONAL NETWORK</Text>
              </View>

              <View style={[styles.form, { marginTop: spacing.lg }]}>
                {/* Role Switcher */}
                <View style={styles.roleContainer}>
                  <TouchableOpacity 
                    onPress={() => setForm({...form, role: 'customer'})}
                    style={[styles.roleBtn, { backgroundColor: form.role === 'customer' ? colors.primary : colors.card, borderColor: colors.border, borderRadius: radius.md }]}
                  >
                    <Text style={[styles.roleText, { color: form.role === 'customer' ? colors.primaryText : colors.textMuted }]}>I'M A CLIENT</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={() => setForm({...form, role: 'vendor'})}
                    style={[styles.roleBtn, { backgroundColor: form.role === 'vendor' ? colors.primary : colors.card, borderColor: colors.border, borderRadius: radius.md }]}
                  >
                    <Text style={[styles.roleText, { color: form.role === 'vendor' ? colors.primaryText : colors.textMuted }]}>I'M A VENDOR</Text>
                  </TouchableOpacity>
                </View>

                <InputField
                  name="fullname" label="FULL NAME" placeholder="JOHN DOE"
                  value={form.fullname} error={errors.fullname}
                  onChangeText={handleChange} colors={colors} radius={radius}
                />
                <InputField
                  name="userName" label="USERNAME" placeholder="johndoe123"
                  value={form.userName} error={errors.userName}
                  onChangeText={handleChange} colors={colors} radius={radius}
                />
                <InputField
                  name="mobileNumber" label="MOBILE NUMBER" placeholder="0000000000"
                  keyType="numeric" value={form.mobileNumber}
                  error={errors.mobileNumber} onChangeText={handleChange}
                  colors={colors} radius={radius}
                />
                <InputField
                  name="password" label="PASSWORD" placeholder="••••••••" secure
                  value={form.password} error={errors.password}
                  onChangeText={handleChange} colors={colors} radius={radius}
                />

                <TouchableOpacity
                  activeOpacity={0.8} onPress={handleSignup}
                  style={[styles.submitBtn, { backgroundColor: colors.primary, borderRadius: radius.md }]}
                  disabled={loading}
                >
                  {loading
                    ? <ActivityIndicator color={colors.primaryText} />
                    : <Text style={[styles.submitBtnText, { color: colors.primaryText }]}>COMPLETE REGISTRATION</Text>
                  }
                </TouchableOpacity>

                <View style={styles.footer}>
                  <Text style={[styles.footerText, { color: colors.textMuted }]}>ALREADY REGISTERED?</Text>
                  <TouchableOpacity onPress={() => navigation?.goBack()}>
                    <Text style={[styles.footerLink, { color: colors.primary }]}>SIGN IN HERE</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Animated.View>

          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 30, paddingVertical: 40 },
  header: { alignItems: 'center', marginBottom: 10 },
  logoText: { fontSize: 40, fontWeight: '200', letterSpacing: 8, marginBottom: 8 },
  title: { fontSize: 22, fontWeight: '800', letterSpacing: 3, marginBottom: 4 },
  subtitle: { fontSize: 9, fontWeight: '600', letterSpacing: 1.5 },
  roleContainer: { flexDirection: 'row', gap: 12, marginBottom: 24, marginTop: 10 },
  roleBtn: { flex: 1, paddingVertical: 14, alignItems: 'center', borderWidth: 1 },
  roleText: { fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  fieldWrap: { marginBottom: 16 },
  label: { fontSize: 9, fontWeight: '800', letterSpacing: 1.5, marginBottom: 8, marginLeft: 2 },
  inputWrap: { borderWidth: 1, paddingHorizontal: 16 },
  input: { fontSize: 15, paddingVertical: 12, letterSpacing: 1 },
  errorText: { fontSize: 9, marginTop: 6, fontWeight: '700', letterSpacing: 0.5 },
  submitBtn: { paddingVertical: 18, alignItems: 'center', marginTop: 10 },
  submitBtnText: { fontSize: 13, fontWeight: '800', letterSpacing: 2 },
  footer: { marginTop: 24, alignItems: 'center' },
  footerText: { fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  footerLink: { fontSize: 12, fontWeight: '800', marginTop: 8, letterSpacing: 1.5 },
});

export default SignupScreen;