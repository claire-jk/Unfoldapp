import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// --- 1. 匯入 Firebase 配置 ---
import { collection, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { auth, db } from "./firebaseConfig";

export default function MoodHistoryScreen() {
  const navigation = useNavigation();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // --- 2. 監聽 Firestore 數據 ---
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setLoading(false);
      return;
    }

    // 建立查詢：對應 userId 並按時間排序
    // 注意：如果您的 Firestore 欄位名稱不同（例如 createdAt），請自行修改
    const q = query(
      collection(db, "moods"),
      where("userId", "==", user.uid),
      orderBy("timestamp", "desc") 
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const moodData: any[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        // 格式化日期顯示 (假設您存的是 Firestore Timestamp)
        const dateString = data.timestamp?.toDate ? 
          data.timestamp.toDate().toLocaleDateString() : "未知日期";

        moodData.push({
        id: doc.id,
        date: data.timestamp?.toDate ? data.timestamp.toDate().toLocaleDateString() : "讀取中...",
        score: data.score,
        label: data.label,
        color: data.color,
        emoji: data.emoji,
        });
      });
      setHistory(moodData);
      setLoading(false);
    }, (error) => {
      console.log("🔥 Firestore 報錯詳情:", error.code, error.message);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const renderItem = ({ item }: any) => (
    <View style={styles.historyCard}>
      <View style={[styles.colorBar, { backgroundColor: item.color }]} />
      <View style={styles.cardContent}>
        <View>
          <Text style={styles.dateText}>{item.date}</Text>
          <Text style={[styles.labelSmall, { color: item.color }]}>{item.label}</Text>
        </View>
        <View style={styles.scoreContainer}>
          <Ionicons name={item.emoji} size={20} color={item.color} style={{ marginRight: 8 }} />
          <Text style={[styles.scoreText, { color: item.color }]}>{item.score}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Profile' as never)}>
          <Ionicons name="chevron-back" size={26} color="#334155" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>心情歷史記錄</Text>
        <View style={{ width: 28 }} /> 
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#b561ff" />
          <Text style={styles.loadingText}>讀取中...</Text>
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listPadding}
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons name="document-text-outline" size={60} color="#DDD" />
              <Text style={styles.emptyText}>尚無任何記錄{"\n"}去首頁寫下今日心情吧！</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  backButton: { width: 40, height: 40, justifyContent: 'center' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20, backgroundColor: '#fff',
    borderBottomLeftRadius: 30, borderBottomRightRadius: 30, elevation: 2
  },
  headerTitle: { fontSize: 20, fontFamily: 'Zen', color: '#333' },
  listPadding: { padding: 20 },
  historyCard: {
    backgroundColor: '#FFF', borderRadius: 15, marginBottom: 15,
    flexDirection: 'row', overflow: 'hidden', elevation: 3,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8,
  },
  colorBar: { width: 6 },
  cardContent: {
    flex: 1, flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', padding: 15
  },
  dateText: { fontSize: 14, color: '#888', marginBottom: 4, fontFamily: 'Caveat' },
  labelSmall: { fontSize: 16, fontWeight: '600', fontFamily: 'Zen' },
  scoreContainer: { flexDirection: 'row', alignItems: 'center' },
  scoreText: { fontSize: 24, fontFamily: 'Zen', minWidth: 30, textAlign: 'right' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100 },
  loadingText: { marginTop: 10, color: '#666', fontFamily: 'Zen' },
  emptyText: { textAlign: 'center', marginTop: 15, color: '#999', fontFamily: 'Zen', lineHeight: 22 }
});