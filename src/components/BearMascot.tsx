import React, { useEffect, useRef } from 'react';
import { Animated, TouchableOpacity, Image } from 'react-native';

interface BearMascotProps {
  size?: number;
  style?: any;
}

export default function BearMascot({ size = 100, style }: BearMascotProps) {
  const bobAnim  = useRef(new Animated.Value(0)).current;
  const sipAnim  = useRef(new Animated.Value(0)).current;
  const sipRotate = sipAnim.interpolate({
    inputRange: [-1, 0],
    outputRange: ['-10deg', '0deg'],
  });

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bobAnim, { toValue: -5, duration: 1500, useNativeDriver: true }),
        Animated.timing(bobAnim, { toValue:  0, duration: 1500, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const handleSip = () => {
    Animated.sequence([
      Animated.timing(sipAnim, { toValue: -1, duration: 180, useNativeDriver: true }),
      Animated.spring(sipAnim, { toValue: 0, useNativeDriver: true, friction: 5, tension: 40 }),
    ]).start();
  };

  return (
    <TouchableOpacity onPress={handleSip} activeOpacity={0.9} style={style}>
      <Animated.View style={{ transform: [{ translateY: bobAnim }] }}>
        <Animated.View style={{ transform: [{ translateY: sipAnim }, { rotate: sipRotate }] }}>
          <Image
            source={require('../../assets/bear-mascot.png')}
            style={{ width: size, height: size, resizeMode: 'contain' }}
          />
        </Animated.View>
      </Animated.View>
    </TouchableOpacity>
  );
}
