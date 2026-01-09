import { Ionicons } from '@expo/vector-icons';
import { ReactNativeZoomableView } from '@openspacelabs/react-native-zoomable-view';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Dimensions, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { auth, db } from './firebaseConfig';

// 匯入獨立的 Modal 組件
import AddSpotModal from './AddSpotModal';
import MonthlyReviewModal from './MonthlyReviewModal';
import SpotDetailModal from './SpotDetailModal';
import SpotListModal from './SpotListModal';

const { width, height } = Dimensions.get('window');

export default function MapScreen({ navigation }: any) {
  const [spots, setSpots] = useState<any[]>([]);
  const [isAddVisible, setIsAddVisible] = useState(false);
  const [selectedSpot, setSelectedSpot] = useState<any>(null);
  
  // 新增：控制列表與回顧的顯示狀態
  const [listVisible, setListVisible] = useState(false);
  const [reviewVisible, setReviewVisible] = useState(false);
  
  const [activeTab, setActiveTab] = useState('map'); // 管理 地圖/列表 切換狀態

  // 1. 監聽 Firebase 數據
  useEffect(() => {
    // 監聽登入狀態的切換 (登入/登出/重新登入)
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
        if (user) {
        console.log("當前使用者已登入:", user.uid);
        
        // 確保使用 user.uid 進行查詢
        const q = query(
            collection(db, "healingSpots"), 
            where("userId", "==", user.uid)
        );

        const unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ 
            id: doc.id, 
            ...doc.data() 
            }));
            setSpots(data);
        }, (error) => {
            console.error("Firestore 監聽失敗:", error);
        });

        return () => unsubscribeSnapshot();
        } else {
        console.log("使用者未登入，清空資料");
        setSpots([]);
        }
    });

    return () => unsubscribeAuth();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* --- 頂部導覽列 --- */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#555" />
          <Text style={styles.headerLabel}>返回</Text>
        </TouchableOpacity>

        <View style={styles.actionGroup}>
          {/* 地圖/列表 切換 (點擊列表時開啟 SpotListModal) */}
          <View style={styles.tabSwitcher}>
            <TouchableOpacity 
              style={[styles.tabBtn, activeTab === 'map' && styles.activeTab]}
              onPress={() => setActiveTab('map')}
            >
              <Text style={activeTab === 'map' ? styles.activeTabText : styles.tabText}>地圖</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tabBtn, activeTab === 'list' && styles.activeTab]}
              onPress={() => {
                setActiveTab('list');
                setListVisible(true); // 開啟列表 Modal
              }}
            >
              <Text style={activeTab === 'list' ? styles.activeTabText : styles.tabText}>列表</Text>
            </TouchableOpacity>
          </View>

          {/* 月度回顧按鈕 */}
          <TouchableOpacity 
            style={styles.historyBtn} 
            onPress={() => setReviewVisible(true)} // 開啟回顧 Modal
          >
            <Ionicons name="calendar-outline" size={18} color="#333" />
            <Text style={styles.historyText}>月度回顧</Text>
          </TouchableOpacity>

          {/* 添加避難所按鈕 */}
          <TouchableOpacity style={styles.addBtn} onPress={() => setIsAddVisible(true)}>
            <Text style={styles.addBtnText}>+ 添加避難所</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* --- 無限網格畫布區域 (原有功能保留) --- */}
      <View style={styles.canvasWrapper}>
        <ReactNativeZoomableView
          maxZoom={1.5}
          minZoom={0.5}
          zoomStep={0.5}
          initialZoom={1}
          bindToBorders={false}
          style={styles.zoomableView}
        >
          <View style={styles.gridBackground} />

          {spots.map((spot) => (
            <TouchableOpacity 
              key={spot.id} 
              style={[styles.markerWrapper, { left: spot.x, top: spot.y }]}
              onPress={() => setSelectedSpot(spot)}
            >
              <View style={[styles.markerCircle, { backgroundColor: spot.tags?.includes('自然') ? '#4DB6AC' : '#FFB74D' }]}>
                <Ionicons name="star" size={14} color="white" />
              </View>
              <View style={styles.markerTag}>
                <Text style={styles.markerTitle}>{spot.title}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ReactNativeZoomableView>
      </View>

      {/* --- 獨立組件調用 --- */}
      
      {/* 1. 添加地點 Modal */}
      <AddSpotModal 
        visible={isAddVisible} 
        onClose={() => setIsAddVisible(false)} 
      />
      
      {/* 2. 地點詳情 Modal */}
      <SpotDetailModal 
        spot={selectedSpot} 
        onClose={() => setSelectedSpot(null)} 
      />

      {/* 3. 列表 Modal (新增) */}
      <SpotListModal 
        visible={listVisible} 
        onClose={() => {
            setListVisible(false);
            setActiveTab('map'); // 關閉後自動切換回地圖標籤
        }} 
        spots={spots} 
      />

      {/* 4. 月度回顧 Modal (新增) */}
      <MonthlyReviewModal 
        visible={reviewVisible} 
        onClose={() => setReviewVisible(false)} 
        spots={spots} 
      />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E0F7F7' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    zIndex: 10,
    paddingTop: 30,
    paddingBottom: 15,
  },
  backButton: { flexDirection: 'row', alignItems: 'center', marginRight: 10 },
  headerLabel: { fontSize: 15, color: '#555', fontFamily: 'Zen' },
  actionGroup: { flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'flex-end' },
  tabSwitcher: { 
    flexDirection: 'row', 
    backgroundColor: '#F0F0F0', 
    borderRadius: 20, 
    padding: 2, 
    marginRight: 8 
  },
  tabBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 18 },
  activeTab: { backgroundColor: 'white', elevation: 2 },
  tabText: { fontSize: 12, color: '#888', fontFamily: 'Zen' },
  activeTabText: { fontSize: 12, color: '#333', fontFamily: 'Zen' },
  historyBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginRight: 8, 
    backgroundColor: 'white', 
    paddingHorizontal: 8, 
    paddingVertical: 7, 
    borderRadius: 8, 
    borderWidth: 1, 
    borderColor: '#ddd' 
  },
  historyText: { marginLeft: 4, color: '#333', fontSize: 12, fontFamily: 'Zen' },
  addBtn: { backgroundColor: '#00A896', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8 },
  addBtnText: { color: 'white',  fontSize: 12, fontFamily: 'Zen' },
  canvasWrapper: { flex: 1, overflow: 'hidden' },
  zoomableView: { width: 2000, height: 2000, backgroundColor: '#E0F7F7' },
  gridBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  markerWrapper: { position: 'absolute', alignItems: 'center' },
  markerCircle: {
    width: 36, height: 36, borderRadius: 18,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: 'white',
    elevation: 4,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3,
  },
  markerTag: {
    backgroundColor: 'white',
    paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: 10, marginTop: 4,
    elevation: 3,
  },
  markerTitle: { fontSize: 12, color: '#444', fontWeight: '500', fontFamily: 'Zen' },
});