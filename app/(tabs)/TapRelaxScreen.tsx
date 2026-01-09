import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef, useState } from 'react';
import { Animated, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function TapRelaxScreen({ navigation }: any) {
  const [count, setCount] = useState(0);
  const scaleAnim = useRef(new Animated.Value(1)).current; // 縮放動畫
  const floatAnim = useRef(new Animated.Value(0)).current; // 文字漂浮動畫
  const opacityAnim = useRef(new Animated.Value(0)).current; // 文字透明度

  const handleTap = () => {
    // 1. 觸發震動反饋 (輕微點擊感)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // 2. 增加計數
    setCount(prev => prev + 1);

    // 3. 執行縮放動畫 (先縮小再彈回)
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start();

    // 4. 執行文字飄浮動畫 (+1 平靜)
    floatAnim.setValue(0);
    opacityAnim.setValue(1);
    Animated.parallel([
      Animated.timing(floatAnim, {
        toValue: -100,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <LinearGradient colors={['#F5F7FF', '#FFF5F9']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* 返回按鈕 */}
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Relax')}>
          <MaterialCommunityIcons name="chevron-left" size={32} color="#6A5AE0" />
        </TouchableOpacity>

        <View style={styles.content}>
          <Text style={[styles.title, { fontFamily: 'Caveat' }]}>Stress Relief </Text>
          <Text style={[styles.subtitle, { fontFamily: 'Zen' }]}>敲擊螢幕，排解煩惱</Text>

          {/* 計數器 */}
          <View style={styles.counterContainer}>
            <Text style={styles.counterLabel}>累積平靜值</Text>
            <Text style={styles.counterValue}>{count}</Text>
          </View>

          {/* 核心敲擊區 */}
          <View style={styles.tapArea}>
            <Animated.View style={[styles.floatingTextContainer, { 
              transform: [{ translateY: floatAnim }], 
              opacity: opacityAnim 
            }]}>
              <Text style={styles.floatingText}>平靜 +1</Text>
            </Animated.View>

            <TouchableOpacity 
              activeOpacity={1} 
              onPress={handleTap}
            >
              <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                <LinearGradient 
                  colors={['#9D85E1', '#8A2BE2']} 
                  style={styles.woodFish}
                >
                  <MaterialCommunityIcons name="hand-back-right" size={80} color="white" />
                </LinearGradient>
              </Animated.View>
            </TouchableOpacity>
          </View>

          <Text style={styles.hintText}>每一次點擊，都是與內心的對話</Text>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  backButton: { padding: 16 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'space-around', paddingBottom: 50 },
  title: { fontSize: 28, color: '#6A5AE0' },
  subtitle: { fontSize: 16, color: '#888', marginTop: 8, fontFamily: 'Zen' },
  counterContainer: { alignItems: 'center' },
  counterLabel: { fontSize: 14, color: '#A0A0A0', marginBottom: 5, fontFamily: 'Zen' },
  counterValue: { fontSize: 48, color: '#333', fontFamily: 'Caveat' },
  tapArea: { alignItems: 'center', justifyContent: 'center', height: 300, width: '100%' },
  woodFish: {
    width: 180,
    height: 180,
    borderRadius: 90,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#8A2BE2',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
  },
  floatingTextContainer: { position: 'absolute', top: 20 },
  floatingText: { fontSize: 20, color: '#6A5AE0', fontFamily: 'Zen' },
  hintText: { color: '#BDBDBD', fontSize: 14, fontStyle: 'italic', fontFamily: 'Zen' },
});