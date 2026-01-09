import { Ionicons } from '@expo/vector-icons';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import React, { useState } from 'react';
import { Dimensions, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { auth, db } from './firebaseConfig';

const { width } = Dimensions.get('window');

export default function AddSpotModal({ visible, onClose }: any) {
  const [title, setTitle] = useState('');
  const [rating, setRating] = useState(0);
  const [description, setDescription] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  
  // 控制自定義成功彈窗
  const [showSuccess, setShowSuccess] = useState(false);

  const tagsOptions = ['安靜', '咖啡', '看海', '自然', '好視野', '私密', '熱鬧'];

  const handleSubmit = async () => {
    const user = auth.currentUser;
    if (!user || !title) return;

    setLoading(true);
    try {
      await addDoc(collection(db, "healingSpots"), {
        userId: user.uid,
        title: title.trim(),
        rating,
        description: description.trim(),
        tags: selectedTags,
        x: Math.random() * 1000 + 400,
        y: Math.random() * 1000 + 400,
        createdAt: serverTimestamp(),
      });

      // 關閉輸入界面，顯示美化後的成功訊息
      setShowSuccess(true);
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAllDone = () => {
    setShowSuccess(false);
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setTitle('');
    setRating(0);
    setDescription('');
    setSelectedTags([]);
  };

  return (
    <>
      {/* 1. 主輸入 Modal */}
      <Modal visible={visible && !showSuccess} animationType="slide" transparent>
        <View style={styles.overlay}>
          <View style={styles.content}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.headerTitle}>添加情緒避難所</Text>
                <Text style={styles.headerSub}>記錄讓你感到安全的地方</Text>
              </View>
              <TouchableOpacity onPress={onClose} disabled={loading}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.label}>地點名稱 *</Text>
              <TextInput 
                style={styles.input} 
                placeholder="例如：秘密小公園" 
                value={title} 
                onChangeText={setTitle} 
              />

              <Text style={styles.label}>給這個地方打分</Text>
              <View style={styles.starRow}>
                {[1, 2, 3, 4, 5].map(s => (
                  <TouchableOpacity key={s} onPress={() => setRating(s)}>
                    <Ionicons 
                      name={rating >= s ? "star" : "star-outline"} 
                      size={32} 
                      color="#FFB74D" 
                    />
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>這地方帶給你什麼感受？</Text>
              <View style={styles.tagGrid}>
                {tagsOptions.map(tag => (
                  <TouchableOpacity 
                    key={tag} 
                    style={[styles.tagBox, selectedTags.includes(tag) && styles.tagBoxActive]}
                    onPress={() => setSelectedTags(prev => 
                      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
                    )}
                  >
                    <Text style={[styles.tagText, selectedTags.includes(tag) && styles.tagTextActive]}>
                      {tag}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>描述你的感受</Text>
              <TextInput 
                style={[styles.input, { height: 100, textAlignVertical: 'top' }]} 
                multiline 
                placeholder="在這裡寫下你的心情..."
                value={description} 
                onChangeText={setDescription} 
              />
            </ScrollView>

            <View style={styles.footer}>
              <TouchableOpacity 
                style={[styles.submitBtn, loading && { opacity: 0.6 }]} 
                onPress={handleSubmit}
                disabled={loading}
              >
                <Text style={styles.submitBtnText}>{loading ? "正在標記地點..." : "添加避難所"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 2. 自定義「美化版」成功訊息 Modal */}
      <Modal visible={showSuccess} transparent animationType="fade">
        <View style={styles.successOverlay}>
          <View style={styles.successCard}>
            <View style={styles.iconCircle}>
              <Ionicons name="sparkles" size={40} color="#00A896" />
            </View>
            
            <Text style={styles.successTitle}>成功新增療癒景點</Text>
            <Text style={styles.successMessage}>
              「{title}」已經加入地圖{"\n"}
              當你感到疲憊時，記得回來散散心。
            </Text>

            <TouchableOpacity style={styles.doneBtn} onPress={handleAllDone}>
              <Text style={styles.doneBtnText}>太好了</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  // 原有樣式優化
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  content: { backgroundColor: 'white', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 25, height: '88%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 15 },
  headerTitle: { fontSize: 22, color: '#333', fontFamily: 'Zen' },
  headerSub: { fontSize: 13, color: '#888', marginTop: 2, fontFamily: 'Zen' },
  label: { fontSize: 15, fontWeight: '600', marginTop: 22, marginBottom: 10, color: '#444' , fontFamily: 'Zen' },
  input: { backgroundColor: '#F8F9FA', borderRadius: 16, padding: 15, fontSize: 16, color: '#333', fontFamily: 'Zen' },
  starRow: { flexDirection: 'row', gap: 12 },
  tagGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tagBox: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, backgroundColor: '#F0F2F2' },
  tagBoxActive: { backgroundColor: '#E0F7F7', borderWidth: 1, borderColor: '#00A896' },
  tagText: { color: '#666', fontSize: 14, fontFamily: 'Zen' },
  tagTextActive: { color: '#00A896', fontWeight: '600', fontFamily: 'Zen' },
  footer: { marginTop: 30, marginBottom: 10 },
  submitBtn: { backgroundColor: '#00A896', padding: 18, borderRadius: 18, alignItems: 'center', shadowColor: '#00A896', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  submitBtnText: { color: 'white', fontSize: 17,fontFamily: 'Zen' },

  // --- 新增：自定義成功視窗樣式 ---
  successOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successCard: {
    width: width * 0.85,
    backgroundColor: 'white',
    borderRadius: 35, // 大圓角
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EFFFFD',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 22,
    color: '#333',
    marginBottom: 12,
    fontFamily: 'Zen'
  },
  successMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
    fontFamily: 'Zen'
  },
  doneBtn: {
    backgroundColor: '#00A896',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    width: '100%',
    alignItems: 'center',
  },
  doneBtnText: {
    color: 'white',
    fontSize: 16, 
    fontFamily: 'Zen'
  },
});