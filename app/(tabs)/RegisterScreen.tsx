import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
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

// --- 匯入 Firebase ---
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "./firebaseConfig";

const { width, height } = Dimensions.get('window');

export default function RegisterScreen() {
    const navigation = useNavigation<any>();

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    // 密碼顯示狀態
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isConfirmVisible, setIsConfirmVisible] = useState(false);

    // 2. 新增成功 Modal 狀態
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const handleRegister = async () => {
        if (!username || !email || !password) {
            Alert.alert("提示", "請填寫所有欄位");
            return;
        }
        if (password !== confirmPassword) {
            Alert.alert("錯誤", "兩次輸入的密碼不一致");
            return;
        }

        setIsLoading(true);

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            await updateProfile(user, { displayName: username });
            await user.reload();

            setIsLoading(false);
            // 3. 改為開啟自定義 Modal 而非系統 Alert
            setShowSuccessModal(true);
        } catch (error: any) {
            setIsLoading(false);
            let errorMessage = "註冊時發生錯誤";
            if (error.code === 'auth/email-already-in-use') errorMessage = "此電子郵件已被註冊過";
            if (error.code === 'auth/weak-password') errorMessage = "密碼強度不足 (至少 6 個字元)";
            if (error.code === 'auth/invalid-email') errorMessage = "電子郵件格式不正確";
            Alert.alert("註冊失敗", errorMessage);
        }
    };

    const handleGoogleRegister = () => {
        Alert.alert("提示", "請至登入頁面點擊 Google 登入，系統會自動為您建立帳號。");
    };

    return (
        <View style={styles.container}>
            {/* 載入中遮罩 */}
            {isLoading && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#b561ffff" />
                    <Text style={styles.loadingText}>建立帳號中...</Text>
                </View>
            )}

            {/* 自定義成功彈窗 (Success Modal) */}
            <Modal
                transparent
                visible={showSuccessModal}
                animationType="fade"
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.iconCircle}>
                            <Ionicons name="checkmark-sharp" size={40} color="#FFF" />
                        </View>
                        <Text style={styles.modalTitle}>註冊成功</Text>
                        <Text style={styles.modalSubtitle}>歡迎加入，{username}！{"\n"}開始記錄您的精彩每一天吧。</Text>
                        
                        <TouchableOpacity 
                            style={styles.modalButton} 
                            onPress={() => {
                                setShowSuccessModal(false);
                                navigation.navigate('Home');
                            }}
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

            <View style={styles.header}>
                <Text style={styles.title}>加入我們</Text>
                <Text style={styles.subtitle}>建立帳號，開始記錄您的每一天</Text>
            </View>

            <View style={styles.form}>
                <TextInput 
                    style={styles.input} 
                    placeholder="使用者名稱" 
                    placeholderTextColor="#999"
                    value={username}
                    onChangeText={setUsername}
                />
                <TextInput 
                    style={styles.input} 
                    placeholder="電子郵件" 
                    placeholderTextColor="#999"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                />

                <View style={styles.passwordContainer}>
                    <TextInput 
                        style={styles.passwordInput} 
                        placeholder="密碼" 
                        placeholderTextColor="#999"
                        secureTextEntry={!isPasswordVisible} 
                        value={password}
                        onChangeText={setPassword}
                    />
                    <TouchableOpacity style={styles.eyeIcon} onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
                        <Ionicons name={isPasswordVisible ? "eye-outline" : "eye-off-outline"} size={22} color="#999" />
                    </TouchableOpacity>
                </View>

                <View style={styles.passwordContainer}>
                    <TextInput 
                        style={styles.passwordInput} 
                        placeholder="確認密碼" 
                        placeholderTextColor="#999"
                        secureTextEntry={!isConfirmVisible} 
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                    />
                    <TouchableOpacity style={styles.eyeIcon} onPress={() => setIsConfirmVisible(!isConfirmVisible)}>
                        <Ionicons name={isConfirmVisible ? "eye-outline" : "eye-off-outline"} size={22} color="#999" />
                    </TouchableOpacity>
                </View>
                
                <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
                    <Text style={styles.registerText}>註冊帳號</Text>
                </TouchableOpacity>

                <View style={styles.divider}>
                    <View style={styles.line} />
                    <Text style={styles.dividerText}>或快速連結</Text>
                    <View style={styles.line} />
                </View>

                <TouchableOpacity style={styles.googleButton} onPress={handleGoogleRegister}>
                    <Ionicons name="logo-google" size={20} color="#3586eaff" style={{ marginRight: 10 }} />
                    <Text style={styles.googleButtonText}>使用 Google 帳號註冊</Text>
                </TouchableOpacity>

                <View style={styles.footerLinks}>
                    <Text style={styles.alreadyAccount}>已經有帳號了？</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                        <Text style={styles.loginLinkText}>回登入頁</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFF', padding: 30, paddingTop: 60 },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        zIndex: 1000,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: { marginTop: 10, fontFamily: 'Zen', color: '#b561ffff' },
    backButton: { position: 'absolute', top: 50, left: 20 },
    header: { marginBottom: 30, marginTop: 20, alignItems: 'center' },
    title: { fontFamily: 'Zen', fontSize: 32, color: '#333', marginBottom: 10 },
    subtitle: { fontFamily: 'Zen', fontSize: 16, color: '#888' },
    form: { width: '100%' },
    input: {
        backgroundColor: '#F5F5F5',
        padding: 15,
        borderRadius: 15,
        marginBottom: 12,
        fontFamily: 'Zen',
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        borderRadius: 15,
        marginBottom: 12,
    },
    passwordInput: { flex: 1, padding: 15, fontFamily: 'Zen' },
    eyeIcon: { padding: 10, marginRight: 5 },
    registerButton: {
        backgroundColor: '#b561ffff',
        padding: 18,
        borderRadius: 30,
        alignItems: 'center',
        marginTop: 10,
        shadowColor: '#b561ffff',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
    },
    registerText: { color: '#FFF', fontFamily: 'Zen', fontSize: 18 },
    divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
    line: { flex: 1, height: 1, backgroundColor: '#EEE' },
    dividerText: { marginHorizontal: 10, color: '#AAA', fontFamily: 'Zen', fontSize: 14 },
    googleButton: {
        flexDirection: 'row', backgroundColor: '#FFF', padding: 15, borderRadius: 30,
        alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#EEE',
    },
    googleButtonText: { color: '#333', fontFamily: 'Zen', fontSize: 16, fontWeight: '600' },
    footerLinks: { flexDirection: 'row', justifyContent: 'center', marginTop: 25 },
    alreadyAccount: { fontFamily: 'Zen', color: '#888' },
    loginLinkText: { fontFamily: 'Zen', color: '#b561ffff',  marginLeft: 5 },

    // --- Modal 樣式 ---
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: width * 0.8,
        backgroundColor: '#FFF',
        borderRadius: 25,
        padding: 30,
        alignItems: 'center',
        elevation: 10,
    },
    iconCircle: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#b561ffff',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontFamily: 'Zen',
        fontSize: 24,
        //fontWeight: 'bold',
        color: '#000000ff',
        marginBottom: 10,
    },
    modalSubtitle: {
        fontFamily: 'Zen',
        fontSize: 15,
        color: '#666',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 25,
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
        //fontWeight: 'bold',
    },
});