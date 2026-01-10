import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Dimensions, ImageBackground, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

const ForestScreen = ({ navigation }: any) => {
  const features = [
    {
      id: 'SkillTree',
      title: "技能樹",
      description: "失敗為成功之母。記錄你的挫折與新技能，讓每一次經驗都成為成長的養分。",
      icon: "fitness",
      colors: ['#4ade80', '#0ea5e9'] as const, // 更有活力的綠藍漸層
      iconBg: "#ecfdf5",
      iconColor: "#059669"
    },
    {
      id: 'EmotionTree',
      title: "情緒樹",
      description: "將負面思考轉為正面思考。培養內心的平靜，讓焦慮化為成長的力量。",
      icon: "leaf",
      colors: ['#22c55e', '#10b981'] as const, // 深綠漸層
      iconBg: "#f0fdf4",
      iconColor: "#15803d"
    },
    {
      id: 'TimeCapsule',
      title: "時空膠囊",
      description: "寫信給未來的自己。將心情與期許埋進土中，等待時光為你帶來答案。",
      icon: "mail-open",
      colors: ['#fb923c', '#f59e0b'] as const, // 暖橘漸層
      iconBg: "#fffbeb",
      iconColor: "#b45309"
    }
  ];

  return (
    <View style={styles.container}>
      {/* 基礎漸層背景 */}
      <LinearGradient colors={['#6d28d9', '#a78bfa', '#ddd6fe']} style={StyleSheet.absoluteFill} />
      
      {/* 疊加一層薄薄的背景圖增加質感 (可更換為你自己的森林圖) */}
      <ImageBackground 
        source={{ uri: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=400' }} 
        style={StyleSheet.absoluteFill}
        imageStyle={{ opacity: 0.2 }}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* 頂部標題區 */}
        <View style={styles.header}>
          <View style={styles.iconCircleWrapper}>
            <LinearGradient colors={['rgba(255,255,255,0.5)', 'rgba(255,255,255,0.1)']} style={styles.iconCircle}>
              <Ionicons name="sparkles" size={26} color="white" />
            </LinearGradient>
          </View>
          <Text style={styles.title}>心靈森林</Text>
          <View style={styles.line} />
          <Text style={styles.subtitle}>在這片寧靜的森林中找到療癒內心的力量</Text>
        </View>

        {/* 功能卡片 */}
        {features.map((item, index) => (
          <TouchableOpacity 
            key={index} 
            activeOpacity={0.8}
            onPress={() => navigation?.navigate(item.id)}
            style={styles.cardShadow}
          >
            <LinearGradient 
              colors={item.colors} 
              style={styles.card} 
              start={{x: 0, y: 0}} 
              end={{x: 1, y: 1}}
            >
              {/* 圖示裝飾 */}
              <View style={[styles.cardIconCircle, { backgroundColor: 'white' }]}>
                <Ionicons name={item.icon as any} size={32} color={item.iconColor} />
              </View>

              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardDesc}>{item.description}</Text>
              
              <View style={styles.cardFooterContainer}>
                <View style={styles.divider} />
                <View style={styles.footerRow}>
                  <Text style={styles.cardFooter}>開始探索</Text>
                  <Ionicons name="arrow-forward-circle" size={20} color="white" style={{ opacity: 0.8 }} />
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ))}

        <View style={styles.footerDecoration}>
          <Text style={styles.footerText}>讓心靈在森林中自由呼吸</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 25, alignItems: 'center', paddingTop: 70, paddingBottom: 120 },
  
  // 標題樣式
  header: { alignItems: 'center', marginBottom: 40 },
  iconCircleWrapper: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  iconCircle: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginBottom: 15, borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)' },
  title: { fontSize: 36, color: 'white', letterSpacing: 6, fontFamily: 'Zen', fontWeight: 'bold', textShadowColor: 'rgba(0, 0, 0, 0.2)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 10 },
  line: { width: 30, height: 3, backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: 2, marginVertical: 12 },
  subtitle: { color: 'white', opacity: 0.85, fontSize: 14, fontFamily: 'Zen', textAlign: 'center', letterSpacing: 1 },

  // 卡片樣式
  cardShadow: {
    width: width - 50,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 10,
  },
  card: { borderRadius: 30, padding: 25, alignItems: 'center', overflow: 'hidden' },
  cardIconCircle: { width: 68, height: 68, borderRadius: 34, justifyContent: 'center', alignItems: 'center', marginBottom: 18, 
    // 加入微弱陰影讓 Icon 浮現
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4,
  },
  cardTitle: { color: 'white', fontSize: 22, fontFamily: 'Zen', fontWeight: '700', marginBottom: 10, letterSpacing: 1 },
  cardDesc: { color: 'white', textAlign: 'center', opacity: 0.9, lineHeight: 22, marginBottom: 20, paddingHorizontal: 5, fontSize: 15, fontFamily: 'Zen' },
  
  // 卡片底部
  cardFooterContainer: { width: '100%', alignItems: 'center' },
  divider: { width: '80%', height: 1, backgroundColor: 'rgba(255,255,255,0.25)', marginBottom: 15 },
  footerRow: { flexDirection: 'row', alignItems: 'center' },
  cardFooter: { color: 'white', opacity: 0.9, fontSize: 15, fontFamily: 'Zen', marginRight: 5, fontWeight: '600' },

  // 頁尾
  footerDecoration: { marginTop: 20, flexDirection: 'row', alignItems: 'center', borderTopWidth: 0.5, borderTopColor: 'rgba(255,255,255,0.3)', paddingTop: 20, width: '60%', justifyContent: 'center' },
  footerText: { color: 'white', opacity: 0.6, fontSize: 13, fontFamily: 'Zen', fontStyle: 'italic' }
});

export default ForestScreen;