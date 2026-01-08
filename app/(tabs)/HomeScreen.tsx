import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { Dimensions, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MoodCircle from './MoodCircle';

// 匯入 Firebase 監控狀態
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebaseConfig";

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const [moodValue, setMoodValue] = useState(50);
  const [modalVisible, setModalVisible] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false); // 追蹤是否已提交
  const [isLoggedIn, setIsLoggedIn] = useState(false);     // 追蹤登入狀態
  const navigation = useNavigation<any>();

  // --- 1. 監聽登入狀態 ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsLoggedIn(true);
        // 如果使用者本來開著彈窗去登入，回來後我們自動視為提交成功
        if (modalVisible) {
          setHasSubmitted(true);
          setModalVisible(false);
        }
      } else {
        setIsLoggedIn(false);
      }
    });
    return unsubscribe;
  }, [modalVisible]);

  // --- 2. 取得心情對應資料 ---
  const getMoodData = () => {
    if (moodValue < 25) return { color: '#FF6B6B', emoji: 'sad-outline', label: '有點難過', feedback: '深呼吸... 沒關係的，每個人都有低潮的時候。這份情緒我幫你收好了，要不要去練習放鬆一下？' };
    if (moodValue < 50) return { color: '#FFD93D', emoji: 'sunny-outline', label: '平靜的一天', feedback: '平靜也是一種幸福。在穩定的節奏中，感受當下的自己吧！' };
    if (moodValue < 75) return { color: '#6BCB77', emoji: 'happy-outline', label: '心情不錯', feedback: '聽起來是不錯的一天！記得把這份小確幸存進心裡的存錢筒喔。' };
    return { color: '#4D96FF', emoji: 'rocket-outline', label: '超級開心！', feedback: '太棒了！你的正能量閃閃發光，希望這份快樂能延續到明天！' };
  };

  const { color, emoji, label, feedback } = getMoodData();

  // --- 3. 提交邏輯 ---
  const handleSubmit = () => {
    if (moodValue < 25) {
      // 情況 A：心情低落 -> 去呼吸練習
      navigation.navigate('Breathing', { redirectTo: isLoggedIn ? 'Home' : 'Login' });
    } else {
      if (!isLoggedIn) {
        // 情況 B：沒登入 -> 顯示引導彈窗
        setModalVisible(true);
      } else {
        // 情況 C：已登入 -> 直接顯示回饋
        setHasSubmitted(true);
      }
    }
  };

  const handleLoginPress = () => {
    // 這裡不關閉 Modal，交由 useEffect 處理自動提交
    navigation.navigate('Login');
  };

  const handleRegisterPress = () => {
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

        {/* --- 4. 動態顯示：按鈕 或 心理評語 --- */}
        {!hasSubmitted ? (
          <TouchableOpacity 
            style={[styles.submitButton, { backgroundColor: color }]}
            onPress={handleSubmit}
          >
            <Text style={styles.submitText}>提交今日心情</Text>
          </TouchableOpacity>
        ) : (
          <View style={[styles.feedbackCard, { borderColor: color }]}>
            <View style={styles.feedbackHeader}>
              <Ionicons name="sparkles" size={20} color={color} />
              <Text style={styles.feedbackTitle}>給你的小悄悄話</Text>
            </View>
            <Text style={styles.feedbackText}>{feedback}</Text>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* --- 引導登入彈窗 --- */}
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
              登入您的帳號，即可保存剛剛選擇的心情 ({moodValue})，追蹤您的心情變化。
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
            </View>

            <TouchableOpacity onPress={handleLoginPress} activeOpacity={0.8}>
              <LinearGradient colors={['#4facfe', '#b561ff']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.loginBtn}>
                <Text style={styles.loginBtnText}>立即登入</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.laterBtn} onPress={() => {setModalVisible(false); setHasSubmitted(true);}}>
              <Text style={styles.laterBtnText}>不登入，直接查看回饋</Text>
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

  // --- 新增：回饋卡片樣式 ---
  feedbackCard: {
    marginTop: 40,
    width: '85%',
    backgroundColor: '#FFF',
    borderRadius: 25,
    padding: 25,
    alignItems: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  feedbackHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  feedbackTitle: { fontFamily: 'Zen', fontSize: 18, fontWeight: 'bold', color: '#333', marginLeft: 8 },
  feedbackText: { fontFamily: 'Zen', fontSize: 15, color: '#555', textAlign: 'center', lineHeight: 24 },

  // --- Modal 樣式 ---
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: width * 0.85, backgroundColor: 'white', borderRadius: 30, padding: 25, alignItems: 'center', elevation: 10 },
  closeIcon: { alignSelf: 'flex-end', padding: 5 },
  iconCircle: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 22, color: '#333', marginBottom: 10, fontFamily: 'Zen', textAlign: 'center' },
  modalSubtitle: { fontSize: 14, color: '#666', textAlign: 'center', lineHeight: 20, marginBottom: 25, fontFamily: 'Zen' },
  featureList: { width: '100%', marginBottom: 30 },
  featureItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, paddingHorizontal: 10 },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 15 },
  featureText: { fontSize: 15, color: '#444', fontFamily: 'Zen' },
  loginBtn: { width: width * 0.7, paddingVertical: 15, borderRadius: 30, alignItems: 'center', marginBottom: 10 },
  loginBtnText: { color: 'white', fontSize: 16, fontFamily: 'Zen' },
  laterBtn: { width: width * 0.7, paddingVertical: 12, borderRadius: 30, borderWidth: 1, borderColor: '#EEE', alignItems: 'center', marginBottom: 20 },
  laterBtnText: { color: '#888', fontFamily: 'Zen', fontSize: 13 },
  modalFooter: { flexDirection: 'row' },
  footerText: { color: '#999', fontFamily: 'Zen' },
  registerLink: { color: '#6e8eff', fontFamily: 'Zen' },
});