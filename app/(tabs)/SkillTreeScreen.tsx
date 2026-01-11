import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import {
    addDoc,
    collection,
    doc,
    getDoc,
    increment,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    setDoc,
    updateDoc
} from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
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
import { auth, db } from './firebaseConfig';

const { width } = Dimensions.get('window');

// --- 介面定義 ---
interface Task {
    id: string;
    title: string;
    time: string;
    completed: boolean;
}

interface UserData {
    totalExp: number;
    level: number;
    treeStage: string;
}

// --- 通用美化成功視窗組件 ---
const SuccessModal = ({ visible, message, onClose }: { visible: boolean, message: string, onClose: () => void }) => (
    <Modal visible={visible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { alignItems: 'center', padding: 30 }]}>
                <View style={styles.successIconCircle}>
                    <Ionicons name="checkmark-sharp" size={40} color="#fff" />
                </View>
                <Text style={[styles.modalHeaderTitle, { marginBottom: 10 }]}>達成成功！</Text>
                <Text style={{ color: '#64748B', fontSize: 16, textAlign: 'center', marginBottom: 25,fontFamily:'Zen' }}>{message}</Text>
                <TouchableOpacity 
                    style={[styles.confirmBtn, { width: 120, borderRadius: 20 }]} // 成功視窗按鈕稍微長一點好按
                    onPress={onClose}
                >
                    <Text style={styles.confirmBtnText}>太棒了！</Text>
                </TouchableOpacity>
            </View>
        </View>
    </Modal>
);

const SkillTreeScreen = () => {
    const navigation = useNavigation();
    
    // 狀態管理
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState<UserData>({ totalExp: 0, level: 1, treeStage: '萌芽期' });
    const [tasks, setTasks] = useState<Task[]>([]);

    // Modal 控制
    const [rainModalVisible, setRainModalVisible] = useState(false);
    const [fruitModalVisible, setFruitModalVisible] = useState(false);
    const [taskModalVisible, setTaskModalVisible] = useState(false);
    const [successVisible, setSuccessVisible] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');

    // 表單輸入
    const [rainContent, setRainContent] = useState('');
    const [skillName, setSkillName] = useState('');
    const [skillDesc, setSkillDesc] = useState('');
    const [newTaskTitle, setNewTaskTitle] = useState('');
    
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [selectedTime, setSelectedTime] = useState(new Date());

    // --- 核心邏輯：計算等級與視覺狀態 ---
    const getTreeVisual = (level: number) => {
        if (level >= 10) return { icon: "pine-tree", stage: "成就之樹", color: "#059669" };
        if (level >= 6) return { icon: "tree", stage: "茁壯期", color: "#10b981" };
        if (level >= 3) return { icon: "leaf", stage: "成長期", color: "#34d399" };
        return { icon: "sprout", stage: "萌芽期", color: "#6ee7b7" };
    };

    const showSuccess = (msg: string) => {
        setSuccessMsg(msg);
        setSuccessVisible(true);
    };

    // 統一處理經驗值與等級更新
    const updateExpAndCheckLevelUp = async (userRef: any, currentTotalExp: number, gainedExp: number) => {
        const newTotalExp = currentTotalExp + gainedExp;
        const newLevel = Math.floor(newTotalExp / 100) + 1;
        const oldLevel = Math.floor(currentTotalExp / 100) + 1;
        const visual = getTreeVisual(newLevel);

        const updateData: any = {
            totalExp: increment(gainedExp),
            level: newLevel,
            treeStage: visual.stage
        };

        await updateDoc(userRef, updateData);

        if (newLevel > oldLevel) {
            Alert.alert("🎊 恭喜升級！", `你的技能樹已進化到 Lv.${newLevel}，邁入「${visual.stage}」！`);
        }
    };

    // --- 初始化與監聽 ---
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) { setLoading(false); return; }

    const initUser = async () => {
        // 修正處：Users -> users
        const userRef = doc(db, "users", user.uid); 
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) {
            await setDoc(userRef, { totalExp: 0, level: 1, treeStage: "萌芽期", createdAt: serverTimestamp() });
        }
    };
    initUser();

    // 修正處：Users -> users
    const unsubscribeUser = onSnapshot(doc(db, "users", user.uid), (snapshot) => {
        if (snapshot.exists()) {
            setUserData(snapshot.data() as UserData);
        }
        setLoading(false);
    });

    // 修正處：Users -> users
    const q = query(collection(db, "users", user.uid, "Tasks"), orderBy("time", "asc"));
    const unsubscribeTasks = onSnapshot(q, (snapshot) => {
        const taskList = snapshot.docs.map(d => ({ id: d.id, ...(d.data() as Omit<Task, 'id'>) })) as Task[];
        setTasks(taskList);
    });

    return () => { unsubscribeUser(); unsubscribeTasks(); };
  }, []);

    // --- 功能函式 ---
    const formatTime = (date: Date) => {
        const h = date.getHours().toString().padStart(2, '0');
        const m = date.getMinutes().toString().padStart(2, '0');
        return `${h}:${m}`;
    };

    const handleTimeChange = (event: DateTimePickerEvent, date?: Date) => {
        if (Platform.OS === 'android') setShowTimePicker(false);
        if (date) setSelectedTime(date);
    };

    const handleAddTask = async () => {
        if (!newTaskTitle.trim()) return Alert.alert("提醒", "請填寫任務內容");
        const user = auth.currentUser;
        if (!user) return;
        try {
            const timeString = formatTime(selectedTime);
            await addDoc(collection(db, "users", user.uid, "Tasks"), {
                title: newTaskTitle,
                time: timeString,
                completed: false,
                createdAt: serverTimestamp(),
            });
            setNewTaskTitle('');
            setTaskModalVisible(false);
            // 不自動跳成功視窗，讓任務直接出現在清單中
        } catch (e) { console.error(e); }
    };

    const toggleTaskComplete = async (taskId: string, currentStatus: boolean) => {
        const user = auth.currentUser;
        if (!user || currentStatus) return;
        try {
            const userRef = doc(db, "users", user.uid);
            await updateDoc(doc(db, "users", user.uid, "Tasks", taskId), { completed: true });
            await updateExpAndCheckLevelUp(userRef, userData.totalExp, 10);
            showSuccess("任務達成！\n經驗值 +10");
        } catch (e) { console.error(e); }
    };

    const handleRainSubmit = async () => {
        if (!rainContent.trim()) return;
        const user = auth.currentUser;
        if (!user) return;
        try {
            const userRef = doc(db, "users", user.uid);
            await addDoc(collection(db, "users", user.uid, "Records"), {
                type: "rain", content: rainContent, timestamp: serverTimestamp()
            });
            await updateExpAndCheckLevelUp(userRef, userData.totalExp, 20);
            setRainContent('');
            setRainModalVisible(false);
            showSuccess("挫折已化為成長的養分\n(+20 EXP)");
        } catch (e) { console.error(e); }
    };

    const handleFruitSubmit = async () => {
        if (!skillName.trim()) return;
        const user = auth.currentUser;
        if (!user) return;
        try {
            const userRef = doc(db, "users", user.uid);
            await addDoc(collection(db, "users", user.uid, "Tasks"), {
                type: "fruit", title: skillName, description: skillDesc, timestamp: serverTimestamp()
            });
            await updateExpAndCheckLevelUp(userRef, userData.totalExp, 50);
            setSkillName(''); setSkillDesc('');
            setFruitModalVisible(false);
            showSuccess("你的成就閃耀著光芒\n(+50 EXP)");
        } catch (e) { console.error(e); }
    };

    if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#10b981" /></View>;

    const expPercent = Math.min((userData.totalExp % 100), 100);
    const treeVisual = getTreeVisual(userData.level);

    return (
        <View style={styles.safeArea}>
            <StatusBar barStyle="dark-content" />
            
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Forest' as never)}>
                    <Ionicons name="chevron-back" size={26} color="#334155" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>成長技能樹</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                {/* 1. 成長狀態卡片 */}
                <View style={styles.mainCard}>
                    <View style={styles.cardHeader}>
                        <View style={[styles.badge, {backgroundColor: treeVisual.color}]}>
                            <Text style={styles.badgeText}>Lv.{userData.level}</Text>
                        </View>
                        <Text style={styles.treeStageText}>{treeVisual.stage}</Text>
                    </View>

                    <View style={styles.treeVisual}>
                        <View style={[styles.treeCircle, {borderColor: treeVisual.color + '40'}]}>
                            <MaterialCommunityIcons
                                name={treeVisual.icon as any}
                                size={90} color={treeVisual.color}
                            />
                            {userData.level >= 10 && (
                                <View style={styles.appleOverlay}>
                                    <MaterialCommunityIcons name="apple" size={24} color="#ef4444" />
                                </View>
                            )}
                        </View>
                    </View>

                    <View style={styles.expSection}>
                        <View style={styles.expInfo}>
                            <Text style={styles.expLabel}>下一級進度</Text>
                            <Text style={[styles.expValue, {color: treeVisual.color}]}>{expPercent}%</Text>
                        </View>
                        <View style={styles.progressBarBg}>
                            <View style={[styles.progressBarFill, { width: `${expPercent}%`, backgroundColor: treeVisual.color }]} />
                        </View>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.statsGrid}>
                        <View style={styles.statItem}>
                            <Text style={[styles.statNum, { color: '#10b981' }]}>{tasks.filter(t => t.completed).length}</Text>
                            <Text style={styles.statLabel}>任務完成</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={[styles.statNum, { color: '#3b82f6' }]}>{userData.totalExp}</Text>
                            <Text style={styles.statLabel}>累積經驗</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={[styles.statNum, { color: '#f59e0b' }]}>{Math.floor(userData.totalExp / 50)}</Text>
                            <Text style={styles.statLabel}>結成技能</Text>
                        </View>
                    </View>
                </View>

                {/* 2. 任務清單 */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>智能小秘書</Text>
                    <TouchableOpacity onPress={() => setTaskModalVisible(true)}>
                        <Text style={styles.addText}>+ 新增任務</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.taskContainer}>
                    {tasks.length === 0 ? (
                        <Text style={styles.emptyText}>今天還沒安排任務 🌱</Text>
                    ) : (
                        tasks.map(task => (
                            <TouchableOpacity 
                                key={task.id} 
                                style={[styles.taskItem, task.completed && styles.taskItemDone]}
                                onPress={() => toggleTaskComplete(task.id, task.completed)}
                            >
                                <View style={[styles.timeTag, task.completed && styles.timeTagDone]}>
                                    <Text style={styles.timeText}>{task.time}</Text>
                                </View>
                                <Text style={[styles.taskTitle, task.completed && styles.taskTextDone]}>{task.title}</Text>
                                <Ionicons
                                    name={task.completed ? "checkmark-circle" : "ellipse-outline"}
                                    size={24} color={task.completed ? "#10b981" : "#cbd5e1"}
                                />
                            </TouchableOpacity>
                        ))
                    )}
                </View>

                {/* 3. 功能按鈕 */}
                <View style={styles.actionRow}>
                    <TouchableOpacity style={[styles.actionBtn, {backgroundColor: '#eff6ff'}]} onPress={() => setRainModalVisible(true)}>
                        <View style={[styles.iconCircle, {backgroundColor: '#3b82f6'}]}>
                            <Ionicons name="rainy" size={20} color="#fff" />
                        </View>
                        <Text style={styles.actionBtnTitle}>灌溉雨水</Text>
                        <Text style={styles.actionBtnSub}>+20 EXP</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.actionBtn, {backgroundColor: '#fffbeb'}]} onPress={() => setFruitModalVisible(true)}>
                        <View style={[styles.iconCircle, {backgroundColor: '#f59e0b'}]}>
                            <Ionicons name="sunny" size={20} color="#fff" />
                        </View>
                        <Text style={styles.actionBtnTitle}>收穫果實</Text>
                        <Text style={styles.actionBtnSub}>+50 EXP</Text>
                    </TouchableOpacity>
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* --- Modals --- */}
            
            {/* 新任務 Modal */}
            <Modal visible={taskModalVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalHeaderTitle}>新任務</Text>
                        <Text style={styles.inputLabel}>時間</Text>
                        <TouchableOpacity style={styles.styledInput} onPress={() => setShowTimePicker(true)}>
                            <Text style={{fontSize: 16}}>{formatTime(selectedTime)}</Text>
                        </TouchableOpacity>
                        {showTimePicker && (
                            <DateTimePicker
                                value={selectedTime}
                                mode="time"
                                is24Hour={true}
                                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                onChange={handleTimeChange}
                            />
                        )}
                        <Text style={styles.inputLabel}>內容</Text>
                        <TextInput style={styles.styledInput} placeholder="輸入任務..." value={newTaskTitle} onChangeText={setNewTaskTitle} />
                        
                        <View style={styles.modalBtnRow}>
                            <TouchableOpacity style={styles.cancelBtnCircle} onPress={() => setTaskModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#64748B" />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.confirmBtn} onPress={handleAddTask}>
                                <Text style={styles.confirmBtnText}>開始</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* 灌溉雨水 Modal */}
            <Modal visible={rainModalVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
                            <Text style={styles.modalHeaderTitle}>灌溉雨水 🌧️</Text>
                            <TextInput 
                                style={styles.styledTextArea} 
                                placeholder="寫下今天遭遇的挫折吧~" 
                                multiline 
                                value={rainContent} 
                                onChangeText={setRainContent} 
                            />
                            {/* 修正：圓形按鈕置中，移除寬度100% */}
                            <TouchableOpacity 
                                style={[styles.confirmBtn, {backgroundColor: '#3b82f6', alignSelf: 'center'}]} 
                                onPress={handleRainSubmit}
                            >
                                <Text style={[styles.confirmBtnText, {fontSize: 14}]}>提交{"\n"}成長</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity onPress={() => setRainModalVisible(false)} style={styles.closeBtn}>
                                <Text style={{color: '#94A3B8', fontFamily: 'Zen'}}>暫時取消</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* 結成果實 Modal */}
            <Modal visible={fruitModalVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
                            <Text style={styles.modalHeaderTitle}>結成果實 🍎</Text>
                            <Text style={styles.inputLabel}>技能標籤</Text>
                            <TextInput style={styles.styledInput} placeholder="例如：React Native 達人" value={skillName} onChangeText={setSkillName} />
                            <Text style={styles.inputLabel}>心得筆記</Text>
                            <TextInput style={styles.styledTextArea} placeholder="簡短記錄你的心路歷程..." multiline value={skillDesc} onChangeText={setSkillDesc} />
                            
                            {/* 修正：圓形按鈕置中 */}
                            <TouchableOpacity 
                                style={[styles.confirmBtn, {backgroundColor: '#f59e0b', alignSelf: 'center'}]} 
                                onPress={handleFruitSubmit}
                            >
                                <Text style={[styles.confirmBtnText, {fontSize: 14}]}>確認{"\n"}收穫</Text>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => setFruitModalVisible(false)} style={styles.closeBtn}>
                                <Text style={{color: '#94A3B8', fontFamily: 'Zen'}}>下次再收</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            <SuccessModal visible={successVisible} message={successMsg} onClose={() => setSuccessVisible(false)} />
        </View>
    );
};

// --- 樣式表 ---
const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20, backgroundColor: '#fff',
        borderBottomLeftRadius: 30, borderBottomRightRadius: 30, elevation: 2
    },
    backButton: { width: 40, height: 40, justifyContent: 'center' },
    headerTitle: { fontSize: 20, color: '#1E293B' ,fontFamily: 'Zen'},
    iconBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
    container: { flex: 1, padding: 20 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    
    mainCard: { 
        backgroundColor: '#fff', borderRadius: 32, padding: 24, marginBottom: 25, 
        elevation: 10, shadowColor: '#10b981', shadowOpacity: 0.15, shadowRadius: 20 
    },
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    badge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, marginRight: 10 },
    badgeText: { color: '#fff', fontSize: 12, fontFamily: 'Caveat' },
    treeStageText: { fontSize: 18, fontFamily: 'Zen', color: '#334155' },
    
    treeVisual: { alignItems: 'center', marginVertical: 10 },
    treeCircle: { 
        width: 150, height: 150, borderRadius: 75, backgroundColor: '#F8FAFC', 
        justifyContent: 'center', alignItems: 'center', borderWidth: 2, position: 'relative'
    },
    appleOverlay: { position: 'absolute', top: 35, right: 35 },
    
    expSection: { marginTop: 20 },
    expInfo: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    expLabel: { fontSize: 13, color: '#64748B', fontFamily: 'Zen' },
    expValue: { fontSize: 14, fontFamily: 'Caveat' },
    progressBarBg: { height: 10, backgroundColor: '#F1F5F9', borderRadius: 5, overflow: 'hidden' },
    progressBarFill: { height: '100%', borderRadius: 5 },
    
    divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 20 },
    statsGrid: { flexDirection: 'row', justifyContent: 'space-between' },
    statItem: { alignItems: 'center', flex: 1 },
    statNum: { fontSize: 20, marginBottom: 4 ,fontFamily: 'Caveat'},
    statLabel: { fontSize: 11, color: '#94A3B8', fontFamily: 'Zen' },

    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    sectionTitle: { fontSize: 18, fontFamily: 'Zen', color: '#1E293B' },
    addText: { color: '#10B981', fontFamily: 'Zen' },
    taskContainer: { backgroundColor: '#fff', borderRadius: 24, padding: 10, marginBottom: 25 },
    taskItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', padding: 15, borderRadius: 18, marginBottom: 10 },
    taskItemDone: { opacity: 0.5 },
    timeTag: { backgroundColor: '#E2E8F0', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, marginRight: 12 },
    timeTagDone: { backgroundColor: '#CBD5E1' },
    timeText: { fontSize: 12, fontFamily: 'Caveat', color: '#475569' },
    taskTitle: { flex: 1, fontSize: 15, fontFamily: 'Zen', color: '#1E293B' },
    taskTextDone: { textDecorationLine: 'line-through', color: '#94A3B8' },
    emptyText: { textAlign: 'center', color: '#94A3B8', padding: 20 ,fontFamily: 'Zen'},

    actionRow: { flexDirection: 'row', justifyContent: 'space-between' },
    actionBtn: { width: '48%', borderRadius: 24, padding: 20, alignItems: 'center', elevation: 2 },
    iconCircle: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
    actionBtnTitle: { fontSize: 16, fontFamily: 'Zen', color: '#1E293B' },
    actionBtnSub: { fontSize: 12, color: '#64748B', fontFamily: 'Zen' },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.6)', justifyContent: 'center', padding: 20 },
    modalContent: { 
        backgroundColor: '#fff', 
        borderRadius: 35, 
        padding: 25,
        maxHeight: '85%'
    },
    modalHeaderTitle: { fontSize: 22, fontFamily: 'Zen', color: '#1E293B', marginBottom: 20, textAlign: 'center' },
    inputLabel: { fontSize: 14, fontFamily: 'Zen', color: '#64748B', marginBottom: 8 },
    styledInput: { width: '100%', backgroundColor: '#F1F5F9', padding: 15, borderRadius: 15, marginBottom: 20,fontFamily: 'Zen' },
    styledTextArea: { width: '100%', backgroundColor: '#F1F5F9', padding: 15, borderRadius: 15, height: 100, marginBottom: 20, textAlignVertical: 'top', fontFamily: 'Zen' },
    modalBtnRow: { flexDirection: 'row', width: '100%', justifyContent: 'space-around', alignItems: 'center', marginTop: 10 },
    
    // 圓形取消鍵
    cancelBtnCircle: { 
        width: 60, height: 60, borderRadius: 30, backgroundColor: '#F1F5F9',
        justifyContent: 'center', alignItems: 'center'
    },
    // 正圓形確認鍵
    confirmBtn: { 
        width: 70, 
        height: 70,
        borderRadius: 35,
        backgroundColor: '#10B981', 
        justifyContent: 'center', 
        alignItems: 'center',
        shadowColor: "#10B981",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    confirmBtnText: { 
        color: '#fff', 
        fontFamily: 'Zen', 
        fontSize: 16, 
        textAlign: 'center',
        lineHeight: 20 
    },
    
    successIconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#10B981',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        shadowColor: "#10B981",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.4,
        shadowRadius: 15,
        elevation: 10,
    },
    closeBtn: { marginTop: 20, padding: 10, alignItems: 'center' }
});

export default SkillTreeScreen;