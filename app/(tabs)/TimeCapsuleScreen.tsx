import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Dimensions,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import * as Animatable from 'react-native-animatable';

// 導入 Firebase 配置
import { addDoc, collection, onSnapshot, orderBy, query, Timestamp, where } from 'firebase/firestore';
import { auth, db } from './firebaseConfig';

const { width, height } = Dimensions.get('window');

const EMOTIONS = ['資訊過載', '不自覺比較', '得到啟發', '焦慮不安', '感到自卑', '平靜'];

const TimeCapsuleScreen = () => {
    const navigation = useNavigation();
    
    // --- 狀態控制 ---
    const [isModalVisible, setModalVisible] = useState(false);
    const [isSuccessVisible, setSuccessVisible] = useState(false);
    const [isWarningVisible, setWarningVisible] = useState(false); // 新增：美化警告框
    const [warningMsg, setWarningMsg] = useState("");
    const [isReading, setIsReading] = useState(false);
    const [selectedCapsule, setSelectedCapsule] = useState<any>(null);

    // --- 表單狀態 ---
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [triggerType, setTriggerType] = useState<'date' | 'emotion'>('date');
    const [targetDate, setTargetDate] = useState(new Date());
    const [targetEmotion, setTargetEmotion] = useState('感到自卑');
    const [showDatePicker, setShowDatePicker] = useState(false);

    // --- 膠囊數據 ---
    const [capsules, setCapsules] = useState<any[]>([]);

    // --- Firebase 實時監聽 ---
    useEffect(() => {
        const user = auth.currentUser;
        if (!user) return;

        // 監聽目前使用者的膠囊，按創建時間排序
        const q = query(
            collection(db, "Capsules"),
            where("uid", "==", user.uid),
            orderBy("createdAt", "desc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const loadedCapsules = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    // 確保將 Firebase Timestamp 轉回 Date 對象供邏輯判斷
                    unlockDateObj: data.unlockDateObj instanceof Timestamp ? data.unlockDateObj.toDate() : data.unlockDateObj
                };
            });
            setCapsules(loadedCapsules);
        }, (error) => {
            console.error("監聽失敗:", error);
        });

        return () => unsubscribe();
    }, []);

    // 儲存膠囊至 Firebase
    const handleSave = async () => {
        if (!title.trim() || !content.trim()) {
            Alert.alert("提示", "請填寫標題與內容");
            return;
        }

        const user = auth.currentUser;
        if (!user) {
            Alert.alert("錯誤", "請登入後再進行操作");
            return;
        }
        
        try {
            const capsuleData = {
                uid: user.uid,
                title: title,
                content: content,
                type: triggerType,
                unlockDateObj: triggerType === 'date' ? Timestamp.fromDate(targetDate) : null,
                unlockDateStr: triggerType === 'date' ? targetDate.toLocaleDateString('zh-TW') : null,
                unlockCondition: triggerType === 'emotion' ? targetEmotion : null,
                status: 'buried',
                createdAt: Timestamp.now(),
                createdAtStr: new Date().toLocaleDateString('zh-TW')
            };

            await addDoc(collection(db, "Capsules"), capsuleData);

            setModalVisible(false);
            
            // 動態展示成功效果
            requestAnimationFrame(() => {
                setTimeout(() => {
                    setSuccessVisible(true);
                    setTimeout(() => setSuccessVisible(false), 2500);
                }, 500);
            });

            // 清除表單
            setTitle(''); 
            setContent('');
            setTargetDate(new Date());
        } catch (error) {
            console.error("儲存失敗:", error);
            Alert.alert("錯誤", "埋藏失敗，請檢查網路連線");
        }
    };

    const handleOpenCapsule = (item: any) => {
        if (item.type === 'date') {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            // 取得解鎖日期 (處理 Date 物件或 Firebase 轉換過來的物件)
            const unlockDate = item.unlockDateObj instanceof Date ? item.unlockDateObj : new Date(item.unlockDateObj);
            
            if (unlockDate > today) {
                showWarning(`這顆種子還在土裡成長中...\n預計解鎖日：${item.unlockDateStr}`);
                return;
            }
        } else {
            showWarning(`當你之後紀錄情緒為「${item.unlockCondition}」時，我們會為你開啟。`);
            return;
        }
        setSelectedCapsule(item);
        setIsReading(true);
    };

    // 美化後的提示顯示
    const showWarning = (msg: string) => {
        setWarningMsg(msg);
        setWarningVisible(true);
        setTimeout(() => setWarningVisible(false), 3000);
    };

    const renderCapsule = (item: any) => {
        const unlockDate = item.unlockDateObj instanceof Date ? item.unlockDateObj : new Date(item.unlockDateObj);
        const isLocked = item.type === 'date' ? unlockDate > new Date() : true;

        return (
            <TouchableOpacity 
                key={item.id} 
                style={styles.capsuleCard}
                onPress={() => handleOpenCapsule(item)}
            >
                <View style={[styles.typeIndicator, { backgroundColor: item.type === 'date' ? '#60A5FA' : '#A78BFA' }]} />
                <View style={styles.capsuleMain}>
                    <Text style={styles.capsuleTitleText}>{item.title}</Text>
                    <Text style={styles.capsuleSubText}>
                        {item.type === 'date' ? `解鎖日：${item.unlockDateStr}` : `觸發條件：${item.unlockCondition}`}
                    </Text>
                </View>
                <MaterialCommunityIcons 
                    name={isLocked ? "lock" : "lock-open-variant-outline"} 
                    size={20} 
                    color={isLocked ? "#CBD5E1" : "#10B981"} 
                />
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.safeArea}>
            <StatusBar barStyle="dark-content" />

            {/* Header */}
            <View style={styles.headerContainer}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Forest' as never)}>
                    <Ionicons name="chevron-back" size={26} color="#334155" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>樹下的時光膠囊</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                <View style={styles.heroSection}>
                    <Animatable.View animation="pulse" iterationCount="infinite" style={styles.earthCircle}>
                        <MaterialCommunityIcons name="seed" size={50} color="#846046" />
                    </Animatable.View>
                    <Text style={styles.heroTitle}>埋藏成長的種子</Text>
                    <Text style={styles.heroDesc}>現在的情緒與成就，都是未來的養分</Text>
                </View>

                <View style={styles.listContainer}>
                    <View style={styles.listHeader}>
                        <Text style={styles.listLabel}>已埋藏的膠囊 ({capsules.length}/5)</Text>
                    </View>
                    
                    {capsules.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>樹下還空空的，來埋下第一顆種子吧！</Text>
                        </View>
                    ) : (
                        capsules.map((item) => renderCapsule(item))
                    )}
                    
                    {capsules.length < 5 && (
                        <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
                            <Ionicons name="add" size={24} color="#94A3B8" />
                            <Text style={styles.addBtnText}>埋下新的時光種子</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </ScrollView>

            {/* 成功 Toast */}
            {isSuccessVisible && (
                <Animatable.View animation="fadeInUp" style={styles.successToast}>
                    <MaterialCommunityIcons name="sprout" size={24} color="#fff" />
                    <Text style={styles.successToastText}>種子已深埋，靜待開花之時</Text>
                </Animatable.View>
            )}

            {/* 美化後的尚未解鎖提示 (Warning Toast) */}
            {isWarningVisible && (
                <Animatable.View animation="bounceIn" style={[styles.successToast, { backgroundColor: 'rgba(71, 85, 105, 0.95)' }]}>
                    <MaterialCommunityIcons name="lock-clock" size={22} color="#FCD34D" />
                    <Text style={styles.successToastText}>{warningMsg}</Text>
                </Animatable.View>
            )}

            {/* 撰寫膠囊 Modal */}
            <Modal visible={isModalVisible} animationType="slide" transparent={true}>
                <KeyboardAvoidingView 
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={styles.modalOverlay}
                >
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>🖋 創建時光膠囊</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#94A3B8" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView 
                            showsVerticalScrollIndicator={false} 
                            keyboardShouldPersistTaps="handled"
                            contentContainerStyle={styles.modalScrollContent}
                        >
                            <Text style={styles.inputLabel}>膠囊標題</Text>
                            <TextInput 
                                style={styles.input} 
                                placeholder="例如：給三個月後的自己"
                                placeholderTextColor="#94A3B8"
                                value={title}
                                onChangeText={setTitle}
                            />

                            <Text style={styles.inputLabel}>送達方式</Text>
                            <View style={styles.typeRow}>
                                <TouchableOpacity 
                                    style={[styles.typeTab, triggerType === 'date' && styles.typeTabActive]}
                                    onPress={() => setTriggerType('date')}
                                >
                                    <MaterialCommunityIcons name="calendar" size={20} color={triggerType === 'date' ? '#fff' : '#64748B'} />
                                    <Text style={[styles.typeTabText, triggerType === 'date' && styles.typeTabTextActive]}>特定日期</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    style={[styles.typeTab, triggerType === 'emotion' && styles.typeTabActive]}
                                    onPress={() => setTriggerType('emotion')}
                                >
                                    <MaterialCommunityIcons name="heart" size={20} color={triggerType === 'emotion' ? '#fff' : '#64748B'} />
                                    <Text style={[styles.typeTabText, triggerType === 'emotion' && styles.typeTabTextActive]}>情緒觸發</Text>
                                </TouchableOpacity>
                            </View>

                            {triggerType === 'date' ? (
                                <TouchableOpacity style={styles.selector} onPress={() => setShowDatePicker(true)}>
                                    <Text style={styles.selectorText}>選擇解鎖日期：{targetDate.toLocaleDateString('zh-TW')}</Text>
                                </TouchableOpacity>
                            ) : (
                                <View style={styles.emotionGrid}>
                                    {EMOTIONS.map(e => (
                                        <TouchableOpacity 
                                            key={e} 
                                            style={[styles.emotionChip, targetEmotion === e && styles.emotionChipActive]}
                                            onPress={() => setTargetEmotion(e)}
                                        >
                                            <Text style={[styles.emotionChipText, targetEmotion === e && styles.emotionChipTextActive]}>{e}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}

                            <Text style={styles.inputLabel}>給未來的自己</Text>
                            <TextInput 
                                style={[styles.input, styles.textArea]} 
                                multiline 
                                placeholder="寫下想說的話、當前的技能等級或心情..."
                                placeholderTextColor="#94A3B8"
                                value={content}
                                onChangeText={setContent}
                            />

                            <View style={styles.tipBox}>
                                <Text style={styles.tipText}>💡 小提示：膠囊會自動封存至雲端，即使重新登入也不會消失喔！</Text>
                            </View>
                        </ScrollView>

                        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                            <MaterialCommunityIcons name="leaf" size={20} color="#fff" />
                            <Text style={styles.saveBtnText}>埋入樹下</Text>
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </Modal>

            {/* 讀取信件 Modal */}
            <Modal visible={isReading} transparent={true} animationType="fade">
                <View style={styles.modalOverlayBackground}>
                    <Animatable.View animation="zoomIn" duration={400} style={styles.parchment}>
                        <View style={styles.parchmentEdge} />
                        <Text style={styles.parchmentDate}>埋藏於：{selectedCapsule?.createdAtStr}</Text>
                        <Text style={styles.parchmentTitle}>{selectedCapsule?.title}</Text>
                        <View style={styles.divider} />
                        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
                            <Text style={styles.parchmentContent}>{selectedCapsule?.content}</Text>
                        </ScrollView>
                        
                        <TouchableOpacity style={styles.closeLetter} onPress={() => setIsReading(false)}>
                            <Text style={styles.closeLetterText}>收起信件</Text>
                        </TouchableOpacity>
                    </Animatable.View>
                </View>
            </Modal>

            {showDatePicker && (
                <DateTimePicker
                    value={targetDate}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    minimumDate={new Date()}
                    onChange={(event, date) => {
                        setShowDatePicker(false);
                        if (date) setTargetDate(date);
                    }}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#FBFDFF' },
    headerContainer: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20, backgroundColor: '#fff',
        borderBottomLeftRadius: 30, borderBottomRightRadius: 30, elevation: 2
    },
    backButton: { width: 40, height: 40, justifyContent: 'center' },
    headerTitle: { fontSize: 18, color: '#1E293B' ,fontFamily:'Zen' },

    heroSection: { alignItems: 'center', paddingVertical: 30 },
    earthCircle: {
        width: 130, height: 130, borderRadius: 65, backgroundColor: '#EFEAE6',
        justifyContent: 'center', alignItems: 'center', marginBottom: 15,
        shadowColor: "#846046", shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2, shadowRadius: 5, elevation: 6,
        borderWidth: 4, borderColor: '#FFF'
    },
    heroTitle: { fontSize: 22, color: '#475569',fontFamily:'Zen'  },
    heroDesc: { fontSize: 14, color: '#94A3B8', marginTop: 5,fontFamily:'Zen'  },

    listContainer: { paddingHorizontal: 20 },
    listHeader: { marginBottom: 15 },
    listLabel: { fontSize: 14, fontFamily:'Zen', color: '#64748B' },
    emptyContainer: { padding: 40, alignItems: 'center' },
    emptyText: { color: '#94A3B8', fontSize: 14, textAlign: 'center',fontFamily:'Zen'  },
    capsuleCard: {
        backgroundColor: '#fff', borderRadius: 20, padding: 18, marginBottom: 14,
        flexDirection: 'row', alignItems: 'center',
        shadowColor: '#64748B', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08, shadowRadius: 8, elevation: 3
    },
    typeIndicator: { width: 6, height: 40, borderRadius: 3, marginRight: 15 },
    capsuleMain: { flex: 1 },
    capsuleTitleText: { fontSize: 16, color: '#334155',fontFamily:'Zen'  },
    capsuleSubText: { fontSize: 12, color: '#94A3B8', marginTop: 4,fontFamily:'Zen'  },
    
    addBtn: {
        height: 80, borderRadius: 24, borderStyle: 'dashed', borderWidth: 2,
        borderColor: '#E2E8F0', justifyContent: 'center', alignItems: 'center', flexDirection: 'row', marginTop: 10
    },
    addBtnText: { color: '#94A3B8', marginLeft: 8,fontFamily:'Zen'  },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalOverlayBackground: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    modalContent: {
        backgroundColor: '#fff', borderTopLeftRadius: 40, borderTopRightRadius: 40,
        padding: 25, maxHeight: height * 0.9, width: width
    },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, alignItems: 'center' },
    modalTitle: { fontSize: 20, color: '#1E293B',fontFamily:'Zen'  },
    modalScrollContent: { paddingBottom: 20 },
    inputLabel: { fontSize: 15, color: '#475569', marginTop: 15, marginBottom: 8,fontFamily:'Zen'  },
    input: {
        backgroundColor: '#F8FAFC', borderRadius: 16, padding: 15, fontSize: 16,
        color: '#334155', borderWidth: 1, borderColor: '#E2E8F0',fontFamily:'Zen' 
    },
    textArea: { height: 120, textAlignVertical: 'top' ,fontFamily:'Zen' },
    typeRow: { flexDirection: 'row', marginBottom: 15 },
    typeTab: {
        flex: 1, flexDirection: 'row', height: 45, borderRadius: 12,
        justifyContent: 'center', alignItems: 'center', backgroundColor: '#F1F5F9', marginRight: 10
    },
    typeTabActive: { backgroundColor: '#1E293B' },
    typeTabText: { marginLeft: 8, color: '#64748B',fontFamily:'Zen'  },
    typeTabTextActive: { color: '#fff' },
    selector: { backgroundColor: '#F8FAFC', padding: 15, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
    selectorText: { color: '#334155',fontFamily:'Zen'  },
    emotionGrid: { flexDirection: 'row', flexWrap: 'wrap' },
    emotionChip: {
        paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20,
        backgroundColor: '#F1F5F9', marginRight: 8, marginBottom: 8
    },
    emotionChipActive: { backgroundColor: '#A78BFA' },
    emotionChipText: { color: '#64748B', fontSize: 13 ,fontFamily:'Zen' },
    emotionChipTextActive: { color: '#fff' },
    tipBox: { backgroundColor: '#FFFBEB', padding: 12, borderRadius: 12, marginTop: 20, marginBottom: 10 },
    tipText: { color: '#B45309', fontSize: 12, lineHeight: 18,fontFamily:'Zen'  },
    saveBtn: {
        backgroundColor: '#1E293B', height: 60, borderRadius: 30,
        flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: Platform.OS === 'ios' ? 30 : 20
    },
    saveBtnText: { color: '#fff', fontSize: 18, marginLeft: 10,fontFamily:'Zen'  },

    successToast: {
        position: 'absolute', top: height * 0.45, alignSelf: 'center',
        backgroundColor: 'rgba(30, 41, 59, 0.9)', paddingHorizontal: 25, paddingVertical: 15,
        borderRadius: 40, flexDirection: 'row', alignItems: 'center', elevation: 10, zIndex: 999,
        maxWidth: width * 0.8, fontFamily: 'Zen'
    },
    successToastText: { color: '#fff', marginLeft: 10, textAlign: 'center', fontSize: 14,fontFamily:'Zen'  },

    parchment: {
        width: width * 0.88, backgroundColor: '#FDF5E6', borderRadius: 4,
        padding: 25, maxHeight: height * 0.7, transform: [{ rotate: '-1.5deg' }],
        shadowColor: '#000', shadowOffset: { width: 5, height: 10 },
        shadowOpacity: 0.3, shadowRadius: 15, elevation: 10,
        borderWidth: 1, borderColor: '#E5D3B3'
    },
    parchmentEdge: {
        position: 'absolute', top: 0, left: 0, right: 0, height: 10,
        backgroundColor: 'rgba(0,0,0,0.02)', borderBottomWidth: 1, borderColor: '#E5D3B3'
    },
    parchmentDate: { fontSize: 12, color: '#A69279' },
    parchmentTitle: { fontSize: 24, fontFamily:'Zen', color: '#5D4037', marginTop: 20 },
    divider: { height: 1, backgroundColor: '#E5D3B3', marginVertical: 15 },
    parchmentContent: {
        fontSize: 17, color: '#4E342E', lineHeight: 28, marginTop: 10, letterSpacing: 0.5,fontFamily:'Zen'
    },
    closeLetter: { marginTop: 30, alignSelf: 'center', padding: 10 },
    closeLetterText: { color: '#A69279', fontFamily: 'Zen', textDecorationLine: 'underline' }
});

export default TimeCapsuleScreen;