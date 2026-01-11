import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Alert, Dimensions, Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// --- 1. 匯入 Firebase 功能 ---
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth } from "./firebaseConfig";

const { width } = Dimensions.get('window');

export default function ProfileScreen({ navigation }: any) {
  const [currentUser, setCurrentUser] = useState<User | null>(auth.currentUser);
  
  // 新增：控制登出成功彈窗的狀態
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // --- 2. 監聽登入狀態變化 ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          await user.reload();
          setCurrentUser({ ...auth.currentUser } as User); 
        } catch (e) {
          setCurrentUser(user);
        }
      } else {
        setCurrentUser(null);
      }
    });
    return unsubscribe;
  }, []);

  // --- 3. 登出邏輯 ---
  const handleLogout = async () => {
    try {
      await signOut(auth);
      // 改為開啟自定義 Modal
      setShowLogoutModal(true);
    } catch (error) {
      Alert.alert("錯誤", "登出失敗，請稍後再試");
    }
  };

  // 處理關閉登出視窗並跳轉
  const confirmLogoutJump = () => {
    setShowLogoutModal(false);
    navigation.navigate('Login');
  };

  return (
    <ScrollView style={styles.container}>
      {/* 登出成功自定義彈窗 */}
      <Modal transparent visible={showLogoutModal} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.logoutModalContent}>
            <View style={styles.logoutIconCircle}>
              <Ionicons name="log-out" size={35} color="#b561ff" />
            </View>
            <Text style={styles.modalTitle}>已成功登出</Text>
            <Text style={styles.modalSubtitle}>期待下次再見到您！{"\n"}祝您有美好的一天。</Text>
            
            <TouchableOpacity 
              style={styles.confirmButton} 
              onPress={confirmLogoutJump}
            >
              <Text style={styles.confirmButtonText}>確定</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 頂部背景裝飾 */}
      <View style={styles.headerBackground} />

      <View style={styles.profileHeader}>
        {/* 頭像區域 */}
        <View style={styles.avatarContainer}>
          <Image 
            source={{ 
              uri: currentUser?.photoURL || "https://api.dicebear.com/7.x/avataaars/svg?seed=Lucky" 
            }} 
            style={styles.avatar} 
          />
          <TouchableOpacity style={styles.editBadge}>
            <Ionicons name="camera" size={18} color="white" />
          </TouchableOpacity>
        </View>

        {/* 帳號資訊 */}
        <Text style={styles.userName}>{currentUser?.displayName || "訪客使用者"}</Text>
        <Text style={styles.userEmail}>{currentUser?.email || "未登入帳號"}</Text>
        
        <View style={styles.tag}>
          <Text style={styles.tagText}>
            {currentUser ? (currentUser.providerData[0]?.providerId === 'google.com' ? 'Google 會員' : '一般會員') : '尚未登入'}
          </Text>
        </View>
      </View>

      {/* 功能選單 */}
      <View style={styles.menuSection}>
        <MenuItem icon="time-outline" text="心情歷史記錄" onPress={() => navigation.navigate('MoodHistory')} />
        <MenuItem icon="analytics-outline" text="數據分析報告" onPress={() => {}} />
        <MenuItem icon="settings-outline" text="設定" onPress={() => {}} />
        
        {currentUser ? (
          <MenuItem 
            icon="log-out-outline" 
            text="登出帳號" 
            textColor="#FF4D4D" 
            onPress={handleLogout} 
          />
        ) : (
          <MenuItem 
            icon="log-in-outline" 
            text="立即登入" 
            textColor="#b561ff" 
            onPress={() => navigation.navigate('Login')} 
          />
        )}
      </View>
    </ScrollView>
  );
}

const MenuItem = ({ icon, text, textColor = "#333", onPress }: any) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <View style={styles.menuLeft}>
      <Ionicons name={icon} size={22} color={textColor} />
      <Text style={[styles.menuText, { color: textColor }]}>{text}</Text>
    </View>
    <Ionicons name="chevron-forward" size={18} color="#CCC" />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  headerBackground: { height: 150, backgroundColor: '#b561ff', position: 'absolute', width: '100%' },
  profileHeader: { alignItems: 'center', marginTop: 80, marginBottom: 30 },
  avatarContainer: { position: 'relative' },
  avatar: { width: 120, height: 120, borderRadius: 60, borderWidth: 4, borderColor: 'white', backgroundColor: '#EEE' },
  editBadge: { position: 'absolute', bottom: 5, right: 5, backgroundColor: '#6e8eff', width: 34, height: 34, borderRadius: 17, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: 'white' },
  userName: { fontSize: 24, marginTop: 15, color: '#333', fontFamily: 'Caveat' },
  userEmail: { fontSize: 14, color: '#888', marginTop: 5, fontFamily: 'Zen' },
  tag: { backgroundColor: '#E1F5FE', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, marginTop: 10 },
  tagText: { color: '#03A9F4', fontSize: 12, fontWeight: 'bold' },
  menuSection: { backgroundColor: 'white', marginHorizontal: 20, borderRadius: 20, paddingVertical: 10, elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, marginBottom: 30 },
  menuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 15, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  menuLeft: { flexDirection: 'row', alignItems: 'center' },
  menuText: { marginLeft: 15, fontSize: 16, fontFamily: 'Zen' },

  // --- 美化彈窗樣式 ---
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutModalContent: {
    width: width * 0.75,
    backgroundColor: '#FFF',
    borderRadius: 30, // 超大圓角，告別方方正正
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 10,
  },
  logoutIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F3E5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalTitle: {
    fontFamily: 'Zen',
    fontSize: 20,
    //fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontFamily: 'Zen',
    fontSize: 14,
    color: '#777',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  confirmButton: {
    backgroundColor: '#b561ff',
    paddingVertical: 10,
    paddingHorizontal: 40,
    borderRadius: 20,
    elevation: 2,
  },
  confirmButtonText: {
    color: '#FFF',
    fontFamily: 'Zen',
    fontSize: 16,
    //fontWeight: 'bold',
  },
});