import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Dimensions, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

export default function MonthlyReviewModal({ visible, onClose, spots }: any) {
  // 1. 基礎數據統計
  const avgRating = spots.length > 0 
    ? (spots.reduce((a: any, b: any) => a + b.rating, 0) / spots.length).toFixed(1) 
    : "0.0";
  const highRatingCount = spots.filter((s: any) => s.rating >= 4).length;

  // 2. 動態尋找「最放鬆的地方」（評分最高的地點）
  // 先複製一份陣列並排序（避免改到原資料），按評分由高到低，若分數相同按時間由新到舊
  const bestSpot = spots.length > 0 
    ? [...spots].sort((a, b) => b.rating - a.rating)[0] 
    : null;

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <LinearGradient colors={['#A18CD1', '#FBC2EB']} style={styles.topBanner}>
            <Text style={styles.bannerTitle}>情緒足跡卡</Text>
            <Text style={styles.bannerDate}>2026 年 1 月</Text>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Ionicons name="close-circle" size={28} color="white" />
            </TouchableOpacity>
          </LinearGradient>

          <ScrollView style={{ padding: 20 }}>
            {/* 三格統計 */}
            <View style={styles.statsRow}>
              <View style={[styles.statBox, { backgroundColor: '#EFFFFD' }]}>
                <Ionicons name="location-outline" size={20} color="#00A896" />
                <Text style={styles.statVal}>{spots.length}</Text>
                <Text style={styles.statLabel}>個避難所</Text>
              </View>
              <View style={[styles.statBox, { backgroundColor: '#FFF9EB' }]}>
                <Ionicons name="star-outline" size={20} color="#FFB74D" />
                <Text style={styles.statVal}>{avgRating}</Text>
                <Text style={styles.statLabel}>平均評分</Text>
              </View>
              <View style={[styles.statBox, { backgroundColor: '#FFF0F3' }]}>
                <Ionicons name="heart-outline" size={20} color="#FF4081" />
                <Text style={styles.statVal}>{highRatingCount}</Text>
                <Text style={styles.statLabel}>高分地點</Text>
              </View>
            </View>

            {/* --- 連接使用者資料：本月最放鬆 --- */}
            <View style={styles.bestSpotSection}>
              <View style={styles.sectionHeader}>
                <Ionicons name="trending-up" size={18} color="#00A896" />
                <Text style={styles.sectionTitle}>本月最放鬆的地方</Text>
              </View>
              {bestSpot ? (
                <>
                  <Text style={styles.bestSpotName}>{bestSpot.title}</Text>
                  <Text style={styles.bestSpotQuote} numberOfLines={2}>
                    「{bestSpot.description || "這裡帶給我平靜的心情..."}」
                  </Text>
                </>
              ) : (
                <Text style={styles.bestSpotQuote}>尚無數據，快去新增避難所吧！</Text>
              )}
            </View>

            {/* 情緒色彩 - 根據高分比例顯示進度 */}
            <Text style={styles.sectionTitleSmall}>你的情緒色彩</Text>
            <View style={styles.moodRow}>
              <Text style={styles.moodText}>🤩 溫暖色調 (積極指數)</Text>
              <View style={styles.progressBg}>
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      width: `${spots.length > 0 ? (highRatingCount / spots.length) * 100 : 0}%`, 
                      backgroundColor: '#FFB74D' 
                    }
                  ]} 
                />
              </View>
            </View>

            <TouchableOpacity style={styles.footerBtn} onPress={onClose}>
              <Text style={styles.footerBtnText}>關閉回顧</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  card: { width: width * 0.9, backgroundColor: 'white', borderRadius: 30, overflow: 'hidden', maxHeight: '85%' },
  topBanner: { padding: 25, alignItems: 'center' },
  bannerTitle: { color: 'white', fontSize: 22, fontFamily: 'Zen' },
  bannerDate: { color: 'rgba(255,255,255,0.8)', marginTop: 5 , fontFamily: 'Caveat' },
  closeBtn: { position: 'absolute', right: 15, top: 15 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 25 },
  statBox: { flex: 1, padding: 15, borderRadius: 20, alignItems: 'center' },
  statVal: { fontSize: 18, marginVertical: 4 , fontFamily: 'Caveat'},
  statLabel: { fontSize: 11, color: '#888', fontFamily: 'Zen' },
  bestSpotSection: { backgroundColor: '#F8F9FA', borderRadius: 20, padding: 20, borderLeftWidth: 4, borderLeftColor: '#00A896', marginBottom: 20 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  sectionTitle: { fontSize: 14, color: '#00A896', marginLeft: 5, fontFamily: 'Zen' },
  bestSpotName: { fontSize: 18, fontFamily: 'Zen' },
  bestSpotQuote: { color: '#666', fontStyle: 'italic', marginTop: 5, fontFamily: 'Zen' },
  sectionTitleSmall: { fontFamily: 'Zen', marginBottom: 15 },
  moodRow: { marginBottom: 15 },
  progressBg: { height: 8, backgroundColor: '#EEE', borderRadius: 4, marginTop: 8 },
  progressFill: { height: 8, borderRadius: 4 },
  footerBtn: { backgroundColor: '#333', padding: 15, borderRadius: 15, alignItems: 'center', marginTop: 20 },
  footerBtnText: { color: 'white', fontFamily: 'Zen' },
  moodText:{fontFamily:'Zen'}
});