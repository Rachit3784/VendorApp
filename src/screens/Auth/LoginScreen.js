import React, { useState, useRef, useEffect, memo } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Animated,
  KeyboardAvoidingView, Platform, ScrollView,
  TouchableWithoutFeedback, Keyboard, StyleSheet,
  StatusBar, ActivityIndicator, Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { login, clearError } from '../../store/authSlice';
import { useTheme } from '../../theme/useTheme';

// ─── Refined Input ──────────────────────────────────────────────────────────
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

const LoginScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector(s => s.auth);
  const { colors, spacing, radius } = useTheme();

  const [form, setForm] = useState({ mobileNumber: '', password: '' });
  const [errors, setErrors] = useState({});

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 20, friction: 7, useNativeDriver: true }),
    ]).start();
    return () => dispatch(clearError());
  }, []);

  useEffect(() => {
    if (error) Alert.alert('Access Denied', error);
  }, [error]);

  const handleChange = (name, text) => {
    setForm(prev => ({ ...prev, [name]: text }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    dispatch(clearError());
  };

  const handleLogin = () => {
    let err = {};
    if (!/^[0-9]{10}$/.test(form.mobileNumber)) err.mobileNumber = 'ENTER A VALID 10-DIGIT NUMBER';
    if (form.password.length < 1) err.password = 'PASSWORD IS REQUIRED';
    setErrors(err);
    if (Object.keys(err).length > 0) return;

    dispatch(login(form));
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={[styles.container, { backgroundColor: colors.bg }]}>
        <StatusBar barStyle="light-content" backgroundColor={colors.bg} />
        
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
            
            <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
              {/* Header */}
              <View style={styles.header}>
                <Text style={[styles.logoText, { color: colors.primary }]}>VC</Text>
                <Text style={[styles.title, { color: colors.textPrimary }]}>SIGN IN</Text>
                <Text style={[styles.subtitle, { color: colors.textMuted }]}>SECURE MEMBER PORTAL</Text>
              </View>

              {/* Form */}
              <View style={[styles.form, { marginTop: spacing.xl }]}>
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
                  activeOpacity={0.8} onPress={handleLogin}
                  style={[styles.submitBtn, { backgroundColor: colors.primary, borderRadius: radius.md }]}
                  disabled={loading}
                >
                  {loading
                    ? <ActivityIndicator color={colors.primaryText} />
                    : <Text style={[styles.submitBtnText, { color: colors.primaryText }]}>AUTHENTICATE SESSION</Text>
                  }
                </TouchableOpacity>

                <View style={styles.footer}>
                  <Text style={[styles.footerText, { color: colors.textMuted }]}>NEW TO THE PLATFORM?</Text>
                  <TouchableOpacity onPress={() => navigation?.navigate('Signup')}>
                    <Text style={[styles.footerLink, { color: colors.primary }]}>CREATE ACCOUNT</Text>
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
  scroll: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 30, paddingVertical: 60 },
  header: { alignItems: 'center', marginBottom: 20 },
  logoText: { fontSize: 48, fontWeight: '200', letterSpacing: 10, marginBottom: 10 },
  title: { fontSize: 24, fontWeight: '800', letterSpacing: 4, marginBottom: 4 },
  subtitle: { fontSize: 10, fontWeight: '600', letterSpacing: 2 },
  fieldWrap: { marginBottom: 20 },
  label: { fontSize: 9, fontWeight: '800', letterSpacing: 1.5, marginBottom: 8, marginLeft: 2 },
  inputWrap: { borderWidth: 1, paddingHorizontal: 16 },
  input: { fontSize: 16, paddingVertical: 14, letterSpacing: 1 },
  errorText: { fontSize: 9, marginTop: 6, fontWeight: '700', letterSpacing: 0.5 },
  submitBtn: { paddingVertical: 18, alignItems: 'center', marginTop: 10, elevation: 2 },
  submitBtnText: { fontSize: 13, fontWeight: '800', letterSpacing: 2 },
  footer: { marginTop: 32, alignItems: 'center' },
  footerText: { fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  footerLink: { fontSize: 12, fontWeight: '800', marginTop: 8, letterSpacing: 1.5 },
});

export default LoginScreen;