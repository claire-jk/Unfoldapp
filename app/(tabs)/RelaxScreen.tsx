import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Dimensions, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

const RelaxCard = ({ icon, title, subtitle, color, onPress, iconType = 'material' }: any) => (
  <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
    <LinearGradient colors={color} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.iconContainer}>
      {iconType === 'material' ? (
        <MaterialCommunityIcons name={icon} size={30} color="white" />
      ) : (
        <Ionicons name={icon} size={28} color="white" />
      )}
    </LinearGradient>
    <View style={styles.cardTextContainer}>
      <Text style={[styles.cardTitle, { fontFamily: 'Zen' }]}>{title}</Text>
      <Text style={[styles.cardSubtitle, { fontFamily: 'Zen' }]}>{subtitle}</Text>
    </View>
    <View style={styles.arrowContainer}>
      <Ionicons name="chevron-forward" size={18} color="#D1D1D1" />
    </View>
  </TouchableOpacity>
);

export default function RelaxScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      {/* 漸層背景 */}
      <LinearGradient colors={['#F5F7FF', '#FFFFFF', '#FFF5F9']} style={StyleSheet.absoluteFill} />
      
      {/* 裝飾用背景元素 - 增加層次感 */}
      <View style={[styles.decorCircle, { top: -50, left: -50, backgroundColor: '#E0E7FF80' }]} />
      <View style={[styles.decorCircle, { bottom: 100, right: -60, width: 200, height: 200, backgroundColor: '#FFD1E840' }]} />

      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          {/* 自定義導航列 */}
          <View style={styles.header}>
            <Text style={[styles.headerTitle, { fontFamily: 'Caveat' }]}>Relaxing Place</Text>
          </View>

          {/* 標題與副標題 */}
          <View style={styles.introContainer}>
            <View style={styles.titleWrapper}>
              <Text style={styles.sparkle}>✨</Text>
              <Text style={[styles.mainTitle, { fontFamily: 'Zen' }]}>找回內心的平靜</Text>
              <Text style={styles.sparkle}>✨</Text>
            </View>
            <Text style={[styles.subTitle, { fontFamily: 'Zen' }]}>
              選擇一種方式，讓心情更輕鬆 <Text style={{ fontSize: 14 }}>💫</Text>
            </Text>
          </View>

          {/* 功能卡片 */}
          <View style={styles.cardList}>
            <RelaxCard 
              icon="hand-back-right" 
              title="點擊舒壓"
              subtitle="輕輕敲擊，釋放壓力，就像敲木魚一樣療癒"
              color={['#9D85E1', '#B993D6']}
              onPress={() => navigation.navigate('TapRelax')}
            />

            <RelaxCard 
              icon="chat-processing-outline"
              title="AI 陪伴"
              subtitle="訴說你的心情，讓 AI 溫柔地傾聽"
              color={['#FF6B95', '#FE9090']}
              onPress={() => navigation.navigate('AIRelax')}
            />

            <RelaxCard 
              icon="content-cut"
              title="碎紙機"
              subtitle="寫下煩惱，看它們被粉碎消失"
              color={['#4facfe', '#00f2fe']}
              onPress={() => navigation.navigate('Shredder')}
            />
          </View>

          {/* 底部提示 */}
          <View style={styles.footer}>
            <Text style={[styles.footerNote, { fontFamily: 'Zen' }]}>
              💜 每一種方式都能幫助你找回內心的平靜
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  decorCircle: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
  },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 100 },
  header: { 
    height: 60, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginTop: 10 
  },
  headerTitle: { fontSize: 25,  color: '#333', letterSpacing: 1 ,marginTop: 30},
  introContainer: { alignItems: 'center', marginTop: 30, marginBottom: 40 },
  titleWrapper: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  mainTitle: { 
    fontSize: 26, 
    color: '#6A5AE0', 
    marginHorizontal: 8,
    textShadowColor: 'rgba(106, 90, 224, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4
  },
  sparkle: { fontSize: 20 },
  subTitle: { fontSize: 15, color: '#888', letterSpacing: 0.5 },
  cardList: { width: '100%' },
  card: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 24,
    padding: 16,
    alignItems: 'center',
    marginBottom: 18,
    // 更柔和的陰影
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    // 圖示陰影
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  cardTextContainer: { flex: 1, marginLeft: 16, marginRight: 8 },
  cardTitle: { fontSize: 19,  color: '#2D2D2D', marginBottom: 4, fontFamily: 'Zen' },
  cardSubtitle: { fontSize: 13, color: '#9A9A9A', lineHeight: 18 },
  arrowContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center'
  },
  footer: { marginTop: 20, alignItems: 'center' },
  footerNote: { color: '#BDBDBD', fontSize: 13, letterSpacing: 0.5 },
});