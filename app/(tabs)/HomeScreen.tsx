import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native'; // 1. 引入導航鉤子
import React, { useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MoodCircle from './MoodCircle';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function HomeScreen() {
  const [moodValue, setMoodValue] = useState(50);
  const navigation = useNavigation<any>(); // 2. 初始化導航

  // 根據數值決定顏色與表情
  const getMoodData = () => {
    if (moodValue < 25) return { color: '#FF6B6B', emoji: 'sad-outline', label: '有點難過' };
    if (moodValue < 50) return { color: '#FFD93D', emoji: 'sunny-outline', label: '平靜的一天' };
    if (moodValue < 75) return { color: '#6BCB77', emoji: 'happy-outline', label: '心情不錯' };
    return { color: '#4D96FF', emoji: 'rocket-outline', label: '超級開心！' };
  };

  const { color, emoji, label } = getMoodData();

  // 3. 提交邏輯：判斷是否導向呼吸練習
  const handleSubmit = () => {
    if (moodValue < 25) {
      // 確保你在 BottomTabNavigator 中有註冊名為 'Breathing' 的 Screen
      navigation.navigate('Breathing');
    } else {
      alert('感謝分享今日心情！祝你有個美好的一天。');
    }
  };

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.headerTitle}>心情日記</Text>
      
      <View style={styles.content}>
        <Text style={styles.question}>今天的心情如何？</Text>
        <Text style={styles.instruction}>請拖曳圓環上的控制點來選擇您今日的心情</Text>

        <View style={styles.circleContainer}>
          <MoodCircle onMoodChange={setMoodValue} color={color} />
          <View style={styles.scoreContainer}>
            <Text style={[styles.scoreText, { color }]}>{moodValue}</Text>
          </View>
        </View>

        {/* 吉祥物區域 */}
        <View style={[styles.mascotContainer, { backgroundColor: color + '20' }]}>
          <Ionicons name={emoji as any} size={80} color={color} />
          <Text style={[styles.mascotLabel, { color, fontFamily: 'Zen' }]}>{label}</Text>
        </View>
      </View>

      {/* 4. 修改按鈕的 onPress 綁定 handleSubmit */}
      <TouchableOpacity 
        style={[styles.submitButton, { backgroundColor: color }]}
        onPress={handleSubmit}
      >
        <Text style={styles.submitText}>提交今日心情</Text>
      </TouchableOpacity>

      {/* 底部緩衝，防止被 Footer 擋住按鈕 */}
      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#FFF' 
  },
  scrollContent: {
    paddingTop: 60,
    alignItems: 'center',
  },
  headerTitle: { fontFamily: 'Zen', color: '#b561ffff', fontSize: 24, textAlign: 'center', marginBottom: 20 },
  content: { alignItems: 'center', paddingHorizontal: 20 },
  question: { fontFamily: 'Zen', fontSize: 22, marginBottom: 8 },
  instruction: { fontFamily: 'Zen', fontSize: 18, color: '#888', textAlign: 'center', marginBottom: 30 },
  circleContainer: { justifyContent: 'center', alignItems: 'center', position: 'relative' },
  scoreContainer: { position: 'absolute', alignItems: 'center' },
  scoreText: { fontSize: 48, fontWeight: 'bold' },
  mascotContainer: { 
    marginTop: 40, 
    padding: 20, 
    borderRadius: 100, 
    alignItems: 'center',
    width: 160,
    height: 160,
    justifyContent: 'center'
  },
  mascotLabel: { marginTop: 10, fontSize: 18, fontWeight: '600' },
  submitButton: {
    marginTop: 40,
    width: '80%',
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  submitText: { color: '#FFF', fontSize: 18, fontFamily: 'Zen' }
});