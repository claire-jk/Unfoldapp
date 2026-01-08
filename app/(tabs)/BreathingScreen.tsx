import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width, height } = Dimensions.get('window');

export default function BreathingScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  
  // 取得從 Home 傳來的參數
  const { redirectTo } = route.params || {};

  const onBreathingComplete = () => {
    // 練習結束時的邏輯
    if (redirectTo === 'Login') {
      // 1.5 秒後自動導向登入，給使用者一點緩衝時間
      setTimeout(() => {
        navigation.navigate('Login');
      }, 1500);
    } else {
      navigation.goBack();
    }
  };
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current; // 用於美化後的完成畫面
  
  const [status, setStatus] = useState('吸氣...');
  const [timeLeft, setTimeLeft] = useState(60);
  const [isFinished, setIsFinished] = useState(false); // 控制是否顯示完成畫面

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinishEffect(); // 觸發美化後的結束效果
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const breathingCycle = () => {
      setStatus('吸氣...');
      Animated.timing(scaleAnim, {
        toValue: 1.6,
        duration: 4000,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) {
          setStatus('吐氣...');
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 4000,
            useNativeDriver: true,
          }).start(({ finished }) => {
            if (finished) breathingCycle();
          });
        }
      });
    };

    breathingCycle();
    return () => {
      clearInterval(timer);
      scaleAnim.stopAnimation();
    };
  }, []);

  // --- 美化後的結束邏輯 ---
  const handleFinishEffect = () => {
    setIsFinished(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <View style={styles.container}>
      {/* 1. 原始練習畫面內容 */}
      <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
        <Ionicons name="close" size={30} color="#666" />
      </TouchableOpacity>

      <View style={styles.timerContainer}>
        <Ionicons name="timer-outline" size={20} color="#00796B" style={{ marginRight: 5 }} />
        <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
      </View>

      <Text style={styles.title}>讓我們一起放鬆心情</Text>
      
      <Animated.View style={[styles.circle, { transform: [{ scale: scaleAnim }] }]}>
        <View style={styles.innerCircle}>
          <Text style={styles.breathingText}>{status}</Text>
        </View>
      </Animated.View>

      <Text style={styles.instruction}>跟著圓圈的節奏深呼吸</Text>

      {/* 2. 美化後的全螢幕完成 Overlay */}
      {isFinished && (
        <Animated.View style={[styles.finishOverlay, { opacity: fadeAnim }]}>
          <View style={styles.finishCard}>
            <Ionicons name="heart" size={80} color="#FF6B6B" />
            <Text style={styles.finishTitle}>練習完成</Text>
            <Text style={styles.finishSub}>太棒了！您已經完成了{"\n"}1 分鐘的放鬆練習。</Text>
            
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={onBreathingComplete}
            >
              <Text style={styles.backButtonText}>回到首頁</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E0F2F1', justifyContent: 'center', alignItems: 'center' },
  closeButton: { position: 'absolute', top: 50, right: 20, zIndex: 10 },
  timerContainer: {
    position: 'absolute', top: 55, flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.6)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20,
  },
  timerText: { fontFamily: 'Zen', fontSize: 16, color: '#00796B' },
  title: { fontFamily: 'Zen', fontSize: 24, marginBottom: 80, color: '#00695C' },
  circle: { width: 180, height: 180, borderRadius: 90, backgroundColor: '#80CBC4', justifyContent: 'center', alignItems: 'center', opacity: 0.5 },
  innerCircle: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#4DB6AC', justifyContent: 'center', alignItems: 'center' },
  breathingText: { color: '#FFF', fontSize: 20, fontFamily: 'Zen' },
  instruction: { marginTop: 80, fontFamily: 'Zen', fontSize: 18, color: '#00796B' },

  // --- 結束畫面的樣式 ---
  finishOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 105, 92, 0.85)', // 深綠色透明背景
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  finishCard: {
    width: width * 0.8,
    backgroundColor: '#FFF',
    borderRadius: 30,
    padding: 30,
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  finishTitle: { fontFamily: 'Zen', fontSize: 28, color: '#00695C', marginTop: 15 },
  finishSub: { fontFamily: 'Zen', fontSize: 16, color: '#666', textAlign: 'center', marginTop: 10, lineHeight: 24 },
  backButton: {
    marginTop: 30,
    backgroundColor: '#4DB6AC',
    paddingHorizontal: 40,
    paddingVertical: 12,
    borderRadius: 25,
  },
  backButtonText: { color: '#FFF', fontFamily: 'Zen', fontSize: 18 }
});