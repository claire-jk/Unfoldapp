import { Ionicons } from '@expo/vector-icons';
import { doc, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { db } from './firebaseConfig';

export default function SpotDetailModal({ spot, onClose }: any) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  // 編輯用的狀態
  const [title, setTitle] = useState('');
  const [rating, setRating] = useState(0);
  const [description, setDescription] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const tagsOptions = ['安靜', '咖啡', '看海', '自然', '好視野', '私密', '熱鬧'];

  // 當 spot 傳入時，初始化編輯數據
  useEffect(() => {
    if (spot) {
      setTitle(spot.title);
      setRating(spot.rating);
      setDescription(spot.description);
      setSelectedTags(spot.tags || []);
      setIsEditing(false); // 每次切換地點時先回到唯讀模式
    }
  }, [spot]);

  if (!spot) return null;

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const spotRef = doc(db, "healingSpots", spot.id);
      await updateDoc(spotRef, {
        title: title.trim(),
        rating,
        description: description.trim(),
        tags: selectedTags,
      });
      setIsEditing(false);
    } catch (e) {
      console.error("更新失敗:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={!!spot} animationType="fade" transparent>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* --- Header 區域 --- */}
            <View style={styles.cardHeader}>
              <Ionicons name="location" size={24} color="#00A896" />
              {isEditing ? (
                <TextInput 
                  style={[styles.cardTitle, styles.inputUnderline]} 
                  value={title} 
                  onChangeText={setTitle}
                />
              ) : (
                <Text style={styles.cardTitle}>{spot.title}</Text>
              )}
              
              {/* 編輯/儲存 按鈕 */}
              <TouchableOpacity onPress={isEditing ? handleUpdate : () => setIsEditing(true)}>
                {loading ? (
                  <ActivityIndicator size="small" color="#00A896" />
                ) : (
                  <Ionicons 
                    name={isEditing ? "checkmark-circle" : "create-outline"} 
                    size={28} 
                    color="#00A896" 
                  />
                )}
              </TouchableOpacity>

              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close-circle" size={30} color="#ccc" />
              </TouchableOpacity>
            </View>
            
            {/* --- 評分區域 --- */}
            <View style={styles.ratingRow}>
              {[1, 2, 3, 4, 5].map((s) => (
                <TouchableOpacity 
                  key={s} 
                  disabled={!isEditing} 
                  onPress={() => setRating(s)}
                >
                  <Ionicons 
                    name={ (isEditing ? rating : spot.rating) >= s ? "star" : "star-outline"} 
                    size={isEditing ? 28 : 18} 
                    color="#FFB74D" 
                  />
                </TouchableOpacity>
              ))}
              <Text style={styles.ratingText}>{isEditing ? rating : spot.rating}/5</Text>
            </View>

            {/* --- 標籤區域 --- */}
            <Text style={styles.sectionLabel}>特點</Text>
            <View style={styles.tagRow}>
              {(isEditing ? tagsOptions : spot.tags || []).map((t: string) => {
                const isSelected = selectedTags.includes(t);
                return (
                  <TouchableOpacity 
                    key={t} 
                    disabled={!isEditing}
                    style={[
                      styles.displayTag, 
                      isEditing && isSelected && styles.tagActive,
                      isEditing && !isSelected && { backgroundColor: '#F0F0F0' }
                    ]}
                    onPress={() => setSelectedTags(prev => 
                      prev.includes(t) ? prev.filter(item => item !== t) : [...prev, t]
                    )}
                  >
                    <Text style={{ fontFamily: 'Zen', color: isEditing && isSelected ? '#fff' : '#00A896' }}>{t}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* --- 描述區域 --- */}
            <Text style={styles.sectionLabel}>我的感受</Text>
            <View style={styles.descBox}>
              {isEditing ? (
                <TextInput 
                  style={styles.descInput} 
                  value={description} 
                  onChangeText={setDescription}
                  multiline
                />
              ) : (
                <Text style={styles.descText}>{spot.description || "尚未填寫感受。"}</Text>
              )}
            </View>

            {/* --- 提醒區域 --- */}
            {!isEditing && (
              <View style={styles.recommendBox}>
                <Text style={styles.recommendTitle}>🌟 療癒提醒</Text>
                <Text style={styles.recommendText}>當你感到疲憊時，記得回來這裡散散心。</Text>
              </View>
            )}

            {isEditing && (
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setIsEditing(false)}>
                <Text style={styles.cancelBtnText}>取消編輯</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  card: { width: '85%', backgroundColor: 'white', borderRadius: 25, padding: 20, maxHeight: '80%' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 15 },
  cardTitle: { fontSize: 22, fontFamily: 'Zen', flex: 1 },
  inputUnderline: { borderBottomWidth: 1, borderBottomColor: '#00A896', paddingBottom: 2 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 4 },
  ratingText: { fontSize: 16, marginLeft: 5, color: '#666', fontFamily: 'Caveat' },
  sectionLabel: { fontSize: 16, fontFamily: 'Zen', marginTop: 15, color: '#333' },
  tagRow: { flexDirection: 'row', gap: 8, marginTop: 10, flexWrap: 'wrap'},
  displayTag: { backgroundColor: '#E0F2F1', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 15 },
  tagActive: { backgroundColor: '#00A896' },
  descBox: { backgroundColor: '#F9F9F9', padding: 15, borderRadius: 12, marginTop: 10 },
  descText: { lineHeight: 22, color: '#444' },
  descInput: { lineHeight: 22, color: '#444', minHeight: 80, textAlignVertical: 'top' },
  recommendBox: { backgroundColor: '#FFF9C4', padding: 15, borderRadius: 12, marginTop: 20 },
  recommendTitle: { fontFamily: 'Zen', marginBottom: 5 },
  recommendText: { fontFamily: 'Zen' },
  cancelBtn: { marginTop: 20, alignItems: 'center', padding: 10 },
  cancelBtnText: { color: '#888', fontFamily: 'Zen' }
});