import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient'; // 確保已安裝
import React, { useState } from 'react';
import { Dimensions, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MoodCircle from './MoodCircle';

const { width, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function HomeScreen() {
  const [moodValue, setMoodValue] = useState(50);
  const [modalVisible, setModalVisible] = useState(false); // 控制彈窗狀態
  const navigation = useNavigation<any>();

  const getMoodData = () => {
    if (moodValue < 25) return { color: '#FF6B6B', emoji: 'sad-outline', label: '有點難過' };
    if (moodValue < 50) return { color: '#FFD93D', emoji: 'sunny-outline', label: '平靜的一天' };
    if (moodValue < 75) return { color: '#6BCB77', emoji: 'happy-outline', label: '心情不錯' };
    return { color: '#4D96FF', emoji: 'rocket-outline', label: '超級開心！' };
  };

  const { color, emoji, label } = getMoodData();

  const handleLater = () => {
    setModalVisible(false);
    
    if (moodValue < 25) {
      // 傳送一個參數告訴呼吸頁面：結束後請跳轉到登入
      navigation.navigate('Breathing', { redirectTo: 'Login' });
    } else {
      alert('感謝分享今日心情！');
    }
  };

  // 修改提交邏輯：改為顯示彈窗
  const handleSubmit = () => {
    if (moodValue < 25) {
      // 情況 A：心情低落 -> 直接去呼吸練習，並傳入 redirectTo 參數
      navigation.navigate('Breathing', { redirectTo: 'Login' });
    } else {
      // 情況 B：心情正常/開心 -> 留在原地顯示登入引導彈窗
      setModalVisible(true);
    }
  };

  const handleLoginPress = () => {
    setModalVisible(false);
    navigation.navigate('Login');
  };

  const handleRegisterPress = () => {
    setModalVisible(false);
    navigation.navigate('Register');
  };

  return (
    <View style={{ flex: 1 }}>
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

          <View style={[styles.mascotContainer, { backgroundColor: color + '20' }]}>
            <Ionicons name={emoji as any} size={80} color={color} />
            <Text style={[styles.mascotLabel, { color, fontFamily: 'Zen' }]}>{label}</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.submitButton, { backgroundColor: color }]}
          onPress={handleSubmit}
        >
          <Text style={styles.submitText}>提交今日心情</Text>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* --- 新增的引導登入彈窗 --- */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.closeIcon} onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={24} color="#999" />
            </TouchableOpacity>

            <LinearGradient colors={['#6e8eff', '#b561ff']} style={styles.iconCircle}>
              <Ionicons name="log-in-outline" size={40} color="white" />
            </LinearGradient>

            <Text style={styles.modalTitle}>記錄您的情緒旅程</Text>
            <Text style={styles.modalSubtitle}>
              登入您的帳號，即可保存每日的情緒記錄，追蹤您的心情變化。
            </Text>

            <View style={styles.featureList}>
              <View style={styles.featureItem}>
                <View style={[styles.dot, { backgroundColor: '#6e8eff' }]} />
                <Text style={styles.featureText}>保存每日情緒記錄</Text>
              </View>
              <View style={styles.featureItem}>
                <View style={[styles.dot, { backgroundColor: '#b561ff' }]} />
                <Text style={styles.featureText}>查看情緒趨勢圖表</Text>
              </View>
              <View style={styles.featureItem}>
                <View style={[styles.dot, { backgroundColor: '#4ade80' }]} />
                <Text style={styles.featureText}>獲得個人化的心理建議</Text>
              </View>
            </View>

            <TouchableOpacity onPress={handleLoginPress} activeOpacity={0.8}>
              <LinearGradient colors={['#4facfe', '#b561ff']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.loginBtn}>
                <Text style={styles.loginBtnText}>立即登入</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.laterBtn} onPress={() => setModalVisible(false)}>
              <Text style={styles.laterBtnText}>稍後再說</Text>
            </TouchableOpacity>

            <View style={styles.modalFooter}>
              <Text style={styles.footerText}>還沒有帳號？ </Text>
              <TouchableOpacity onPress={handleRegisterPress}>
                <Text style={styles.registerLink}>立即註冊</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  // --- 原有樣式保持不變 ---
  container: { flex: 1, backgroundColor: '#FFF' },
  scrollContent: { paddingTop: 60, alignItems: 'center' },
  headerTitle: { fontFamily: 'Zen', color: '#b561ffff', fontSize: 24, textAlign: 'center', marginBottom: 20 },
  content: { alignItems: 'center', paddingHorizontal: 20 },
  question: { fontFamily: 'Zen', fontSize: 22, marginBottom: 8 },
  instruction: { fontFamily: 'Zen', fontSize: 18, color: '#888', textAlign: 'center', marginBottom: 30 },
  circleContainer: { justifyContent: 'center', alignItems: 'center', position: 'relative' },
  scoreContainer: { position: 'absolute', alignItems: 'center' },
  scoreText: { fontSize: 48, fontWeight: 'bold' },
  mascotContainer: { marginTop: 40, padding: 20, borderRadius: 100, alignItems: 'center', width: 160, height: 160, justifyContent: 'center' },
  mascotLabel: { marginTop: 10, fontSize: 18, fontWeight: '600' },
  submitButton: { marginTop: 40, width: '80%', paddingVertical: 15, borderRadius: 30, alignItems: 'center', shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 5, elevation: 5 },
  submitText: { color: '#FFF', fontSize: 18, fontFamily: 'Zen' },

  // --- 新增 Modal 專屬樣式 ---
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: width * 0.85, backgroundColor: 'white', borderRadius: 30, padding: 25, alignItems: 'center', elevation: 10 },
  closeIcon: { alignSelf: 'flex-end', padding: 5 },
  iconCircle: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 22, color: '#333', marginBottom: 10, fontFamily: 'Zen' },
  modalSubtitle: { fontSize: 14, color: '#666', textAlign: 'center', lineHeight: 20, marginBottom: 25, fontFamily: 'Zen' },
  featureList: { width: '100%', marginBottom: 30 },
  featureItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, paddingHorizontal: 10 },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 15 },
  featureText: { fontSize: 15, color: '#444', fontFamily: 'Zen' },
  loginBtn: { width: width * 0.7, paddingVertical: 15, borderRadius: 30, alignItems: 'center', marginBottom: 10 },
  loginBtnText: { color: 'white', fontSize: 16, fontFamily: 'Zen' },
  laterBtn: { width: width * 0.7, paddingVertical: 15, borderRadius: 30, borderWidth: 1, borderColor: '#EEE', alignItems: 'center', marginBottom: 20 },
  laterBtnText: { color: '#888', fontFamily: 'Zen' },
  modalFooter: { flexDirection: 'row' },
  footerText: { color: '#999', fontFamily: 'Zen' },
  registerLink: { color: '#6e8eff', fontFamily: 'Zen' },
});