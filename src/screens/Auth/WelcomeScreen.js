import { View, Text, Dimensions, Animated, TouchableOpacity } from 'react-native'
import React, { useRef, useEffect } from 'react'
import { Lamp, LogIn } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

const WelcomeScreen = () => {

  const titleAnim = useRef(new Animated.Value(0)).current;
  const cardAnim = useRef(new Animated.Value(0)).current;
  const buttonAnim = useRef(new Animated.Value(0)).current;
  const navigation = useNavigation();

  useEffect(() => {

    
    Animated.sequence([
      Animated.spring(titleAnim, {
        toValue: 1,
        tension: 40,
        friction: 6,
        useNativeDriver: true
      }),
      Animated.spring(cardAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true
      }),
      Animated.spring(buttonAnim, {
        toValue: 1,
        tension: 60,
        friction: 8,
        useNativeDriver: true
      })
    ]).start();

  }, []);

  return (
    <View style={{
      flex: 1,
      backgroundColor: '#020617',
      justifyContent: 'space-between',
      paddingVertical: 60,
      alignItems: 'center'
    }}>

      {/* 🔹 TOP SECTION */}
      <Animated.View style={{
        alignItems: 'center',
        opacity: titleAnim,
        transform: [
          {
            translateY: titleAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [-80, 0]
            })
          }
        ]
      }}>

        <Text style={{
          fontSize: 18,
          color: '#94a3b8',
          letterSpacing: 2
        }}>
          WELCOME TO
        </Text>

        <Text style={{
          fontSize: 42,
          fontWeight: '800',
          color: '#4bc381',
          marginTop: 10
        }}>
          Vendors App
        </Text>

      </Animated.View>


      {/* 🔹 CENTER CARD */}
      <Animated.View style={{
        width: width * 0.85,
        borderRadius: 24,
        backgroundColor: '#0f172a',
        padding: 25,
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
        opacity: cardAnim,
        transform: [
          {
            scale: cardAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.8, 1]
            })
          }
        ]
      }}>

        <Text style={{
          color: '#e2e8f0',
          fontSize: 16,
          lineHeight: 24,
          textAlign: 'center'
        }}>
          Discover vendors, connect with customers, and manage your business seamlessly.
        </Text>

      </Animated.View>


      {/* 🔹 BUTTONS */}
      <Animated.View style={{
        width: '85%',
        opacity: buttonAnim,
        transform: [
          {
            translateY: buttonAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [100, 0]
            })
          }
        ]
      }}>

        {/* LOGIN */}
        <TouchableOpacity
        onPress={()=>{
          navigation.navigate("Login")
        }}
          activeOpacity={0.8}
          style={{
            backgroundColor: '#4bc381',
            paddingVertical: 16,
            borderRadius: 16,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 15,
            shadowColor: '#4bc381',
            shadowOpacity: 0.4,
            shadowRadius: 10,
            elevation: 5
          }}
        >
          <LogIn size={20} color="#022c22" />
          <Text style={{
            marginLeft: 10,
            fontWeight: '700',
            fontSize: 16,
            color: '#022c22'
          }}>
            Login
          </Text>
        </TouchableOpacity>

        {/* SIGNUP */}
        <TouchableOpacity
        onPress={()=>{
            navigation.navigate("Signup")
        }}
          activeOpacity={0.8}
          style={{
            borderWidth: 1.5,
            borderColor: '#4bc381',
            paddingVertical: 16,
            borderRadius: 16,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <Lamp size={20} color="#4bc381" />
          <Text style={{
            marginLeft: 10,
            fontWeight: '700',
            fontSize: 16,
            color: '#4bc381'
          }}>
            Create Account
          </Text>
        </TouchableOpacity>

      </Animated.View>

    </View>
  )
}

export default WelcomeScreen;