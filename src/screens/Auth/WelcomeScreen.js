import React, { useRef, useEffect } from 'react'
import { View, Text, Dimensions, Animated, TouchableOpacity, StyleSheet, StatusBar, ImageBackground } from 'react-native'
import { LogIn, UserPlus, ShieldCheck, Sparkles } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../theme/useTheme';

const { width, height } = Dimensions.get('window');

const WelcomeScreen = () => {
  const { colors, spacing, radius } = useTheme();
  const navigation = useNavigation();

  const titleAnim = useRef(new Animated.Value(0)).current;
  const cardAnim = useRef(new Animated.Value(0)).current;
  const buttonAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(300),
      Animated.parallel([
        Animated.spring(titleAnim, { toValue: 1, tension: 20, friction: 7, useNativeDriver: true }),
        Animated.spring(cardAnim, { toValue: 1, tension: 15, friction: 8, useNativeDriver: true }),
        Animated.spring(buttonAnim, { toValue: 1, tension: 10, friction: 7, useNativeDriver: true })
      ])
    ]).start();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />
      
      {/* 🔹 DECORATIVE BACKGROUND ELEMENTS */}
      <View style={[styles.glow, { backgroundColor: colors.primaryGlow, top: -height * 0.2, right: -width * 0.2 }]} />
      <View style={[styles.glow, { backgroundColor: colors.primaryGlow, bottom: -height * 0.1, left: -width * 0.3 }]} />

      <View style={styles.content}>
        {/* 🔹 TOP SECTION */}
        <Animated.View style={[styles.header, { 
          opacity: titleAnim,
          transform: [{ translateY: titleAnim.interpolate({ inputRange: [0, 1], outputRange: [40, 0] }) }]
        }]}>
          <View style={styles.badge}>
            <Sparkles size={14} color={colors.primary} />
            <Text style={[styles.badgeText, { color: colors.primary }]}>PREMIUM SERVICE PLATFORM</Text>
          </View>
          
          <Text style={[styles.welcomeText, { color: colors.textMuted }]}>WELCOME TO</Text>
          <Text style={[styles.brandText, { color: colors.textPrimary }]}>V <Text style={{ color: colors.primary }}>C</Text></Text>
          <View style={[styles.brandUnderline, { backgroundColor: colors.primary }]} />
        </Animated.View>

        {/* 🔹 CENTER CARD */}
        <Animated.View style={[styles.mainCard, {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderRadius: radius.xl,
          opacity: cardAnim,
          transform: [{ scale: cardAnim.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1] }) }]
        }]}>
          <ShieldCheck size={32} color={colors.primary} style={{ marginBottom: 16 }} />
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>PROFESSIONAL NETWORK</Text>
          <Text style={[styles.cardDesc, { color: colors.textSecondary }]}>
            Connect with verified local professionals or manage your service business with our elite appointment ecosystem.
          </Text>
        </Animated.View>

        {/* 🔹 BUTTONS */}
        <Animated.View style={[styles.footer, {
          opacity: buttonAnim,
          transform: [{ translateY: buttonAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }]
        }]}>
          
          <TouchableOpacity
            onPress={() => navigation.navigate("Login")}
            activeOpacity={0.85}
            style={[styles.primaryBtn, { backgroundColor: colors.primary, borderRadius: radius.md }]}
          >
            <LogIn size={18} color={colors.primaryText} />
            <Text style={[styles.primaryBtnText, { color: colors.primaryText }]}>SIGN IN TO ACCOUNT</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate("Signup")}
            activeOpacity={0.8}
            style={[styles.secondaryBtn, { borderColor: colors.border, borderRadius: radius.md }]}
          >
            <UserPlus size={18} color={colors.textPrimary} />
            <Text style={[styles.secondaryBtnText, { color: colors.textPrimary }]}>CREATE NEW PROFILE</Text>
          </TouchableOpacity>

          <Text style={[styles.termsText, { color: colors.textMuted }]}>
            BY CONTINUING YOU AGREE TO OUR TERMS OF SERVICE
          </Text>
        </Animated.View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, overflow: 'hidden' },
  glow: { position: 'absolute', width: width * 0.8, height: width * 0.8, borderRadius: width * 0.4, opacity: 0.4 },
  content: { flex: 1, padding: 32, justifyContent: 'space-between', zIndex: 10 },
  header: { marginTop: 60, alignItems: 'center' },
  badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 20, marginBottom: 24, gap: 8 },
  badgeText: { fontSize: 9, fontWeight: '800', letterSpacing: 1.5 },
  welcomeText: { fontSize: 13, fontWeight: '700', letterSpacing: 4 },
  brandText: { fontSize: 42, fontWeight: '900', marginTop: 4, letterSpacing: -1 },
  brandUnderline: { height: 4, width: 40, marginTop: 12 },
  mainCard: { padding: 32, alignItems: 'center', borderWidth: 1, elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20 },
  cardTitle: { fontSize: 14, fontWeight: '800', letterSpacing: 2, marginBottom: 12 },
  cardDesc: { fontSize: 14, textAlign: 'center', lineHeight: 22, opacity: 0.8 },
  footer: { width: '100%', marginBottom: 20 },
  primaryBtn: { height: 58, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 16, elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  primaryBtnText: { fontSize: 12, fontWeight: '800', letterSpacing: 2 },
  secondaryBtn: { height: 58, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, borderWidth: 1, backgroundColor: 'rgba(255,255,255,0.02)' },
  secondaryBtnText: { fontSize: 12, fontWeight: '800', letterSpacing: 2 },
  termsText: { fontSize: 9, textAlign: 'center', marginTop: 24, fontWeight: '600', letterSpacing: 1, opacity: 0.6 }
});

export default WelcomeScreen;