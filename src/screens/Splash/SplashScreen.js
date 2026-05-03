import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet, StatusBar, Dimensions } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { loadSession, setSplashDone } from '../../store/authSlice';
import { useTheme } from '../../theme/useTheme';

const { width } = Dimensions.get('window');

const SplashScreen = () => {
  const dispatch = useDispatch();
  const { colors } = useTheme();

  // Animation refs
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const lineAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // ── Intro animation sequence
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 20,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(lineAnim, {
        toValue: 1,
        duration: 1500,
        delay: 400,
        useNativeDriver: false, // width doesn't support native driver
      }),
    ]).start(() => {
      // Small delay before marking splash as done
      setTimeout(() => {
        dispatch(loadSession()).then(() => {
          dispatch(setSplashDone());
        });
      }, 800);
    });
  }, []);

  const s = styles(colors);

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />

      <Animated.View style={[s.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <View style={s.logoContainer}>
          <Text style={s.logoText}>VC</Text>
          <Animated.View style={[s.line, { width: lineAnim.interpolate({
            inputRange: [0, 1],
            outputRange: ['0%', '100%']
          }) }]} />
        </View>
        <Text style={s.title}>VENDOR CONNECT</Text>
        <Text style={s.subtitle}>Est. 2026 • Professional Services</Text>
      </Animated.View>

      <View style={s.footer}>
        <Text style={s.footerText}>CLASSIC • RELIABLE • SECURE</Text>
      </View>
    </View>
  );
};

const styles = (C) => StyleSheet.create({
  container: {
    flex: 1, 
    backgroundColor: C.bg,
    alignItems: 'center', 
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  logoText: {
    fontSize: 72,
    fontWeight: '200', // Thin, classic look
    color: C.primary,
    letterSpacing: 8,
  },
  line: {
    height: 1,
    backgroundColor: C.primary,
    marginTop: -4,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: C.textPrimary,
    letterSpacing: 4,
    marginTop: 12,
  },
  subtitle: {
    fontSize: 12,
    color: C.textMuted,
    marginTop: 8,
    fontStyle: 'italic',
    letterSpacing: 1,
  },
  footer: {
    position: 'absolute',
    bottom: 60,
  },
  footerText: {
    fontSize: 10,
    fontWeight: '700',
    color: C.textMuted,
    letterSpacing: 3,
  },
});

export default SplashScreen;
