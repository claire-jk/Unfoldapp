import { Ionicons } from '@expo/vector-icons';
import { ReactNativeZoomableView } from '@openspacelabs/react-native-zoomable-view';
import React, { useState } from 'react';
import { Dimensions, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width, height } = Dimensions.get('window');

// 模擬使用者的療癒點位資料
const initialSpots = [
  { id: '1', title: '秘密小公園', x: width * 0.3, y: height * 0.4, color: '#FFB74D' },
  { id: '2', title: '我家後巷', x: width * 0.5, y: height * 0.2, color: '#FFB74D' },
  { id: '3', title: '轉角咖啡店', x: width * 0.6, y: height * 0.6, color: '#4DB6AC' },
];

export default function MapScreen({ navigation }: any) {
  const [spots] = useState(initialSpots);

  return (
    <SafeAreaView style={styles.container}>
      {/* 頂部導覽列 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#555" />
          <Text style={styles.headerLabel}>返回</Text>
        </TouchableOpacity>

        <View style={styles.titleGroup}>
          <Ionicons name="location" size={20} color="#00A896" />
          <Text style={styles.titleText}>療癒地圖</Text>
        </View>

        <View style={styles.actionGroup}>
          <View style={styles.tabSwitcher}>
            <TouchableOpacity style={[styles.tabBtn, styles.activeTab]}><Text>地圖</Text></TouchableOpacity>
            <TouchableOpacity style={styles.tabBtn}><Text>列表</Text></TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.historyBtn}>
            <Ionicons name="calendar-outline" size={18} color="#333" />
            <Text style={styles.historyText}>月度回顧</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.addBtn}>
            <Text style={styles.addBtnText}>+ 添加避難所</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 無限網格畫布區域 */}
      <View style={styles.canvasWrapper}>
        <ReactNativeZoomableView
          maxZoom={1.5}
          minZoom={0.5}
          zoomStep={0.5}
          initialZoom={1}
          bindToBorders={false} // 允許自由拖動，不受邊界限制
          style={styles.zoomableView}
        >
          {/* 背景網格 */}
          <View style={styles.gridBackground} />

          {/* 渲染點位 */}
          {spots.map((spot) => (
            <View 
              key={spot.id} 
              style={[styles.markerWrapper, { left: spot.x, top: spot.y }]}
            >
              <View style={[styles.markerCircle, { backgroundColor: spot.color }]}>
                <Ionicons name="star" size={14} color="white" />
              </View>
              <View style={styles.markerTag}>
                <Text style={styles.markerTitle}>{spot.title}</Text>
              </View>
            </View>
          ))}
        </ReactNativeZoomableView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E0F7F7' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    zIndex: 10,
  },
  backButton: { flexDirection: 'row', alignItems: 'center', marginRight: 20 },
  headerLabel: { fontSize: 16, color: '#555', marginLeft: 4 },
  titleGroup: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  titleText: { fontSize: 18, fontWeight: '600', color: '#333', marginLeft: 6 },
  actionGroup: { flexDirection: 'row', alignItems: 'center' },
  tabSwitcher: { marginLeft: -5,flexDirection: 'row', backgroundColor: '#F0F0F0', borderRadius: 20, padding: 2, marginRight: 10 },
  tabBtn: { paddingHorizontal: 15, paddingVertical: 6, borderRadius: 18 },
  activeTab: { backgroundColor: 'white', elevation: 2 },
  historyBtn: { flexDirection: 'row', alignItems: 'center', marginRight: 15, backgroundColor: 'white', padding: 8, borderRadius: 8, borderWidth: 1, borderColor: '#ddd' },
  historyText: { marginLeft: 5, color: '#333' },
  addBtn: { backgroundColor: '#00A896', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8, marginLeft: -10 },
  addBtnText: { color: 'white', fontWeight: 'bold' },
  
  // 畫布與網格
  canvasWrapper: { flex: 1, overflow: 'hidden' },
  zoomableView: { width: 2000, height: 2000, backgroundColor: '#E0F7F7' },
  gridBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    // 使用重複線條建立網格感
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.05)',
    // 這裡實務上可以用一張小的網格圖片重複填充 (repeat) 或是用 Canvas 繪製
  },

  // 標記樣式
  markerWrapper: { position: 'absolute', alignItems: 'center' },
  markerCircle: {
    width: 36, height: 36, borderRadius: 18,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 3, borderColor: 'white',
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3,
  },
  markerTag: {
    backgroundColor: 'white',
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 12, marginTop: 8,
    elevation: 3,
  },
  markerTitle: { fontSize: 14, color: '#444', fontWeight: '500' },
});