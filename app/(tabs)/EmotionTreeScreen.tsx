import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { useNavigation } from '@react-navigation/native';
import { getAuth } from 'firebase/auth';
import { doc, getDoc, getFirestore, increment, setDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
    Animated,
    Dimensions,
    Modal,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

const { width } = Dimensions.get('window');

const EmotionTreeScreen = () => {
    const navigation = useNavigation();
    const auth = getAuth();
    const db = getFirestore();
    const user = auth.currentUser;

    // --- 狀態控制 ---
    const [purifyPercent, setPurifyPercent] = useState(0); // 初始從 0 開始
    const [recordCount, setRecordCount] = useState(0);
    const [totalHours, setTotalHours] = useState(0);
    const [emotionScore, setEmotionScore] = useState(50);
    const [lastNegative, setLastNegative] = useState(''); // 存儲最近的負面比較內容
    
    const [isModalVisible, setModalVisible] = useState(false);
    const [isSuccessVisible, setSuccessVisible] = useState(false); // 成功彈窗
    
    // --- 紀錄輸入表單狀態 ---
    const [hours, setHours] = useState(1);
    const [selectedMood, setSelectedMood] = useState('');
    const [negativeCompare, setNegativeCompare] = useState('');
    const [positiveInspire, setPositiveInspire] = useState('');

    useEffect(() => {
        if (user) { fetchUserData(); }
    }, [user]);

    const fetchUserData = async () => {
        try {
            const docRef = doc(db, "users", user!.uid, "emotionStats", "current");
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                setPurifyPercent(data.purifyPercent || 0);
                setRecordCount(data.recordCount || 0);
                setTotalHours(data.totalHours || 0);
                setEmotionScore(data.emotionScore || 50);
                setLastNegative(data.lastNegative || '');
            }
        } catch (error) {
            console.error("讀取數據失敗:", error);
        }
    };

    const handleCompleteRecord = async () => {
        if (!selectedMood) return;

        try {
            const statsRef = doc(db, "users", user!.uid, "emotionStats", "current");
            const today = new Date().toISOString().split('T')[0];
            const historyRef = doc(db, "users", user!.uid, "logs", today);

            const newPurify = Math.min(purifyPercent + 10, 100);

            // 更新 Firebase
            await setDoc(statsRef, {
                purifyPercent: newPurify,
                recordCount: increment(1),
                totalHours: increment(hours),
                lastNegative: negativeCompare, // 儲存最後一次的文字以便顯示在過濾器
                lastUpdated: new Date()
            }, { merge: true });

            await setDoc(historyRef, {
                hours,
                mood: selectedMood,
                negativeCompare,
                positiveInspire,
                timestamp: new Date()
            }, { merge: true });

            // 更新本地狀態
            setPurifyPercent(newPurify);
            setRecordCount(prev => prev + 1);
            setTotalHours(prev => prev + hours);
            setLastNegative(negativeCompare);
            
            setModalVisible(false);
            setSuccessVisible(true); // 顯示美化後的成功彈窗

            // 重置
            setNegativeCompare('');
            setPositiveInspire('');
            setSelectedMood('');
        } catch (error) {
            console.error("儲存失敗", error);
        }
    };

    // --- 動態計算花朵成長 ---
    const getTreeStage = () => {
        if (purifyPercent < 30) return { name: 'seed', size: 60, color: '#94A3B8', label: '種子萌芽中' };
        if (purifyPercent < 70) return { name: 'sprout', size: 85, color: '#4ADE80', label: '茁壯成長中' };
        return { name: 'flower-tulip', size: 110, color: '#FB7185', label: '盛開綻放中' };
    };

    const tree = getTreeStage();
    const avgDailyHours = recordCount > 0 ? (totalHours / recordCount).toFixed(1) : 0;

    const moods = [
        { label: '資訊過載', icon: '🤯', color: '#FFF1F2' },
        { label: '不自覺比較', icon: '😒', color: '#F1F5F9' },
        { label: '得到啟發', icon: '✨', color: '#FEF9C3' },
        { label: '焦慮不安', icon: '😰', color: '#EEF2FF' },
        { label: '感到自卑', icon: '😞', color: '#F8FAFC' },
        { label: '平靜', icon: '😌', color: '#ECFDF5' },
    ];

    return (
        <View style={styles.safeArea}>
            <StatusBar barStyle="dark-content" />
            
            {/* Header */}
            <View style={styles.headerContainer}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backCircle}>
                    <Ionicons name="chevron-back" size={24} color="#1E293B" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>成長情緒樹</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                
                {/* 1. 情緒樹主卡片 */}
                <View style={styles.emotionMainCard}>
                    <View style={styles.progressContainer}>
                        <View style={styles.progressTextRow}>
                            <Text style={styles.progressLabel}>心靈淨化進度</Text>
                            <Text style={styles.progressValue}>{purifyPercent}%</Text>
                        </View>
                        <View style={styles.progressBarBg}>
                            <Animated.View style={[styles.progressBarFill, { width: `${purifyPercent}%` }]} />
                        </View>
                    </View>

                    <View style={styles.treeDisplayArea}>
                        <MaterialCommunityIcons name={tree.name as any} size={tree.size} color={tree.color} />
                        <View style={styles.purifyingBadge}>
                            <Text style={styles.purifyingText}>{tree.label} ✨</Text>
                        </View>
                    </View>

                    <View style={styles.statsRow}>
                        <View style={styles.statBox}><Text style={styles.statVal}>{recordCount}</Text><Text style={styles.statLab}>紀錄次數</Text></View>
                        <View style={styles.statBox}><Text style={styles.statVal}>{avgDailyHours}h</Text><Text style={styles.statLab}>平均日社群</Text></View>
                        <View style={styles.statBox}><Text style={styles.statVal}>{emotionScore}</Text><Text style={styles.statLab}>情緒分數</Text></View>
                    </View>
                </View>

                {/* 2. 社群過濾器 (轉念回饋) */}
                {lastNegative !== '' && (
                    <View style={styles.filterCard}>
                        <View style={styles.filterHeader}>
                            <MaterialCommunityIcons name="auto-fix" size={20} color="#8B5CF6" />
                            <Text style={styles.filterTitle}>努姆的社群過濾器</Text>
                        </View>
                        <View style={styles.quoteBox}>
                            <Text style={styles.oldText}>「{lastNegative}」</Text>
                            <Ionicons name="arrow-down" size={16} color="#CBD5E1" style={{marginVertical: 4}} />
                            <Text style={styles.newText}>努姆提示：這只是螢幕上的碎片，不是你生活的全部。你現在擁有的平靜比讚數更珍貴。🌱</Text>
                        </View>
                    </View>
                )}

                {/* 3. 按鈕區 */}
                <TouchableOpacity style={styles.mainActionBtn} onPress={() => setModalVisible(true)}>
                    <Ionicons name="add-circle" size={24} color="#fff" />
                    <Text style={styles.mainActionBtnText}>記錄今日社群使用</Text>
                </TouchableOpacity>

                {/* --- 舒壓專區入口 (新增回來) --- */}
                <TouchableOpacity 
                    style={styles.relaxEntryCard} 
                    onPress={() => navigation.navigate('Relax' as never)}
                >
                    <View style={styles.relaxIconCircle}>
                        {/* 這裡已將 leaf 改為 rose，顏色改為玫瑰粉紅 */}
                        <MaterialCommunityIcons name="flower-outline" size={26} color="#8000FF" />
                    </View>
                    <View style={{flex: 1, marginLeft: 15}}>
                        <Text style={styles.relaxEntryTitle}>進入舒壓專區</Text>
                        <Text style={styles.relaxEntrySub}>當感到焦慮時，來這裡釋放壓力</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
                </TouchableOpacity>

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* --- 輸入紀錄 Modal --- */}
            <Modal visible={isModalVisible} animationType="slide" transparent={true}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalIndicator} />
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>今日心靈寫作</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                                <Ionicons name="close" size={22} color="#64748B" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            <Text style={styles.inputLabel}>今日社群時數：{hours} 小時</Text>
                            <Slider
                                style={{width: '100%', height: 40}}
                                minimumValue={0} maximumValue={12} step={0.5}
                                value={hours} onValueChange={setHours}
                                minimumTrackTintColor="#A78BFA"
                            />

                            <Text style={styles.inputLabel}>當下的心情</Text>
                            <View style={styles.moodGrid}>
                                {moods.map((m) => (
                                    <TouchableOpacity 
                                        key={m.label}
                                        style={[styles.moodItem, {backgroundColor: m.color}, selectedMood === m.label && styles.moodSelected]}
                                        onPress={() => setSelectedMood(m.label)}
                                    >
                                        <Text style={{fontSize: 22}}>{m.icon}</Text>
                                        <Text style={styles.moodText}>{m.label}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <Text style={styles.inputLabel}>負面比較 (剛才在螢幕上看到了什麼？)</Text>
                            <TextInput 
                                style={styles.textInput} placeholder="例如：看到朋友的生活好像很精彩..."
                                value={negativeCompare} onChangeText={setNegativeCompare} multiline
                            />

                            <TouchableOpacity style={styles.submitBtn} onPress={handleCompleteRecord}>
                                <Text style={styles.submitBtnText}>儲存並淨化</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* --- 成功美化 Modal --- */}
            <Modal visible={isSuccessVisible} transparent={true} animationType="fade">
                <View style={styles.successOverlay}>
                    <View style={styles.successBox}>
                        <View style={styles.successIconBg}>
                            <Ionicons name="checkmark-circle" size={60} color="#10B981" />
                        </View>
                        <Text style={styles.successTitle}>紀錄成功！</Text>
                        <Text style={styles.successSub}>你的情緒樹又長大了一點，心靈清晰度 +10%</Text>
                        <TouchableOpacity style={styles.successConfirmBtn} onPress={() => setSuccessVisible(false)}>
                            <Text style={styles.successConfirmText}>太棒了</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#F1F5F9' },
    container: { flex: 1, padding: 20 },
    headerContainer: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20, backgroundColor: '#fff',
        borderBottomLeftRadius: 35, borderBottomRightRadius: 35, elevation: 2
    },
    backCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 18, fontFamily: 'Zen', color: '#1E293B', letterSpacing: 1 },
    
    emotionMainCard: { backgroundColor: '#fff', borderRadius: 32, padding: 24, elevation: 4, shadowColor: '#64748B', shadowOpacity: 0.1, shadowRadius: 10 },
    progressContainer: { marginBottom: 20 },
    progressTextRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8},
    progressLabel: { fontSize: 13, color: '#64748B', fontFamily: 'Zen'  },
    progressValue: { fontSize: 13, color: '#8B5CF6', fontFamily: 'Caveat'  },
    progressBarBg: { height: 12, backgroundColor: '#F1F5F9', borderRadius: 6, overflow: 'hidden' },
    progressBarFill: { height: '100%', backgroundColor: '#8B5CF6' },
    
    treeDisplayArea: { height: 200, backgroundColor: '#FDF2F8', borderRadius: 24, marginVertical: 10, justifyContent: 'center', alignItems: 'center' },
    purifyingBadge: { backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, marginTop: 15, elevation: 2 },
    purifyingText: { fontSize: 13, color: '#F43F5E', fontFamily: 'Zen'  },
    
    statsRow: { flexDirection: 'row', marginTop: 20, paddingTop: 20, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
    statBox: { flex: 1, alignItems: 'center' },
    statVal: { fontSize: 20, fontFamily: 'Caveat', color: '#1E293B' },
    statLab: { fontSize: 11, color: '#94A3B8', marginTop: 4, fontFamily: 'Zen'  },

    filterCard: { backgroundColor: '#F5F3FF', borderRadius: 24, padding: 20, marginTop: 20, borderWidth: 1, borderColor: '#DDD6FE' },
    filterHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    filterTitle: { fontSize: 15, fontFamily: 'Zen' , color: '#5B21B6', marginLeft: 8 },
    quoteBox: { alignItems: 'center' },
    oldText: { fontSize: 13, color: '#94A3B8', fontStyle: 'italic', textAlign: 'center' },
    newText: { fontSize: 14, color: '#4C1D95', fontFamily: 'Zen' , textAlign: 'center', lineHeight: 20 },

    mainActionBtn: { backgroundColor: '#1E293B', borderRadius: 20, padding: 18, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 24, elevation: 4 },
    mainActionBtnText: { color: '#fff', fontSize: 16, fontFamily: 'Zen' , marginLeft: 10 },

    // 舒壓專區入口樣式
    relaxEntryCard: { 
        backgroundColor: '#fff', borderRadius: 24, padding: 16, marginTop: 16, 
        flexDirection: 'row', alignItems: 'center', elevation: 2,
        shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5
    },
    relaxIconCircle: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#ECFDF5', justifyContent: 'center', alignItems: 'center' },
    relaxEntryTitle: { fontSize: 16, fontFamily: 'Zen' , color: '#334155' },
    relaxEntrySub: { fontSize: 12, color: '#64748B', marginTop: 2, fontFamily: 'Zen'  },

    // Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.6)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 40, borderTopRightRadius: 40, padding: 28, height: '88%' },
    modalIndicator: { width: 40, height: 5, backgroundColor: '#E2E8F0', borderRadius: 3, alignSelf: 'center', marginBottom: 15 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    modalTitle: { fontSize: 22, fontFamily: 'Zen' , color: '#1E293B' },
    closeBtn: { padding: 5 },
    inputLabel: { fontSize: 15, fontFamily: 'Zen' , color: '#475569', marginTop: 20, marginBottom: 12 },
    moodGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    moodItem: { width: '31%', paddingVertical: 15, borderRadius: 20, alignItems: 'center', marginBottom: 10 },
    moodSelected: { borderWidth: 2, borderColor: '#A78BFA' },
    moodText: { marginTop: 6, fontSize: 12, color: '#334155', fontFamily: 'Zen' },
    textInput: { backgroundColor: '#F8FAFC', borderRadius: 20, padding: 18, height: 100, textAlignVertical: 'top', fontSize: 14 },
    submitBtn: { backgroundColor: '#8B5CF6', borderRadius: 20, padding: 18, alignItems: 'center', marginTop: 30, marginBottom: 20 },
    submitBtnText: { color: '#fff', fontSize: 17, fontFamily: 'Zen'  },

    // Success Modal
    successOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
    successBox: { width: '85%', backgroundColor: '#fff', borderRadius: 40, padding: 30, alignItems: 'center' },
    successIconBg: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#ECFDF5', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
    successTitle: { fontSize: 24, fontWeight: '800', color: '#065F46', marginBottom: 10 },
    successSub: { fontSize: 15, color: '#64748B', textAlign: 'center', lineHeight: 22, marginBottom: 25 },
    successConfirmBtn: { backgroundColor: '#10B981', paddingHorizontal: 40, paddingVertical: 15, borderRadius: 25 },
    successConfirmText: { color: '#fff', fontWeight: '700', fontSize: 16 }
});

export default EmotionTreeScreen;