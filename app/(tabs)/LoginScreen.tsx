import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

// --- 匯入 Firebase 與 Google Auth 套件 ---
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser'; // 修正: 視環境可能為 expo-web-browser
import { GoogleAuthProvider, signInWithCredential, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebaseConfig";

// 確保瀏覽器登入後能正確跳回 App
if (typeof WebBrowser !== 'undefined' && WebBrowser.maybeCompleteAuthSession) {
  WebBrowser.maybeCompleteAuthSession();
}

const { width } = Dimensions.get('window');

export default function LoginScreen() {
  const navigation = useNavigation<any>();

  // 狀態管理
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false); // 控制成功彈窗
  const [isPasswordVisible, setIsPasswordVisible] = useState(false); // 密碼眼睛開關

  // Google 登入 Request
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: '299653731568-allk6hi7f7vtpp07gn50hfd9g48j3fcp.apps.googleusercontent.com',
  });

  // 監聽 Google 登入結果
  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params ?? {};
      if (!id_token) {
        Alert.alert("Google 登入失敗", "未取得 id_token");
        return;
      }
      const credential = GoogleAuthProvider.credential(id_token);

      setIsLoading(true);
      signInWithCredential(auth, credential)
        .then(() => {
          setIsLoading(false);
          setShowSuccessModal(true); // 觸發成功彈窗
        })
        .catch((err) => {
          setIsLoading(false);
          Alert.alert("Google 登入失敗", err.message);
        });
    }
  }, [response]);

  // 一般 Email 登入邏輯
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("提示", "請輸入帳號與密碼");
      return;
    }
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setIsLoading(false);
      setShowSuccessModal(true); // 觸發成功彈窗
    } catch (error: any) {
      setIsLoading(false);
      let msg = "帳號或密碼錯誤";
      if (error.code === 'auth/user-not-found') msg = "找不到此帳號";
      if (error.code === 'auth/wrong-password') msg = "密碼錯誤";
      Alert.alert("登入失敗", msg);
    }
  };

  // 點擊 Modal 確定後的動作
  const handleSuccessConfirm = () => {
    setShowSuccessModal(false);
    navigation.navigate('Home');
  };

  return (
    <View style={styles.container}>
      {/* 載入中遮罩 */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#b561ffff" />
        </View>
      )}

      {/* 成功登入自定義彈窗 */}
      <Modal transparent visible={showSuccessModal} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.iconCircle}>
              <Ionicons name="happy-outline" size={40} color="#FFF" />
            </View>
            <Text style={styles.modalTitle}>登入成功</Text>
            <Text style={styles.modalSubtitle}>歡迎回來！{"\n"}今天的心情如何呢？</Text>
            
            <TouchableOpacity 
              style={styles.modalButton} 
              onPress={handleSuccessConfirm}
            >
              <Text style={styles.modalButtonText}>進入首頁</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 返回按鈕 */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={28} color="#333" />
      </TouchableOpacity>

      {/* 標題區域 */}
      <View style={styles.header}>
        <Text style={styles.title}>歡迎回來</Text>
        <Text style={styles.subtitle}>登入後即可永久保存您的心情軌跡</Text>
      </View>

      {/* 表單區域 */}
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="電子郵件"
          placeholderTextColor="#999"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        
        {/* 密碼輸入（含眼睛） */}
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="密碼"
            placeholderTextColor="#999"
            secureTextEntry={!isPasswordVisible}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)} style={styles.eyeIcon}>
            <Ionicons name={isPasswordVisible ? "eye-outline" : "eye-off-outline"} size={22} color="#999" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginText}>立即登入</Text>
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.line} />
          <Text style={styles.dividerText}>或使用</Text>
          <View style={styles.line} />
        </View>

        {/* Google 登入 */}
        <TouchableOpacity
          style={styles.googleButton}
          disabled={!request}
          onPress={() => promptAsync()}
        >
          <Ionicons name="logo-google" size={20} color="#3586eaff" style={{ marginRight: 10 }} />
          <Text style={styles.googleButtonText}>使用 Google 帳號登入</Text>
        </TouchableOpacity>

        <View style={styles.footerLinks}>
          <Text style={styles.noAccount}>還沒有帳號？</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.signUpText}>立即註冊</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF', padding: 30, paddingTop: 80 },
  loadingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,255,255,0.5)', justifyContent: 'center', alignItems: 'center', zIndex: 10 },
  backButton: { position: 'absolute', top: 50, left: 20 },
  header: { marginBottom: 40, marginTop: 20, alignItems: 'center' },
  title: { fontFamily: 'Zen', fontSize: 32, color: '#333', marginBottom: 10 },
  subtitle: { fontFamily: 'Zen', fontSize: 16, color: '#888' },
  form: { width: '100%' },
  input: {
    backgroundColor: '#F5F5F5',
    padding: 15,
    borderRadius: 15,
    marginBottom: 15,
    fontFamily: 'Zen',
  },
  // 密碼框容器樣式
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 15,
    marginBottom: 15,
  },
  passwordInput: { flex: 1, padding: 15, fontFamily: 'Zen' },
  eyeIcon: { paddingRight: 15 },
  loginButton: {
    backgroundColor: '#b561ffff',
    padding: 18,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#b561ffff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  loginText: { color: '#FFF', fontFamily: 'Zen', fontSize: 18 },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 25 },
  line: { flex: 1, height: 1, backgroundColor: '#EEE' },
  dividerText: { marginHorizontal: 10, color: '#AAA', fontFamily: 'Zen', fontSize: 14 },
  googleButton: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EEE',
    elevation: 2,
  },
  googleButtonText: { color: '#333', fontFamily: 'Zen', fontSize: 16, fontWeight: '600' },
  footerLinks: { flexDirection: 'row', justifyContent: 'center', marginTop: 30 },
  noAccount: { fontFamily: 'Zen', color: '#888' },
  signUpText: { fontFamily: 'Zen', color: '#b561ffff', marginLeft: 5, fontWeight: 'bold' },

  // --- Modal 美化樣式 ---
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width * 0.75,
    backgroundColor: '#FFF',
    borderRadius: 30,
    padding: 25,
    alignItems: 'center',
  },
  iconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#b561ffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalTitle: {
    fontFamily: 'Zen',
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  modalSubtitle: {
    fontFamily: 'Zen',
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  modalButton: {
    backgroundColor: '#b561ffff',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 20,
  },
  modalButtonText: {
    color: '#FFF',
    fontFamily: 'Zen',
    fontSize: 16,
    fontWeight: 'bold',
  },
});