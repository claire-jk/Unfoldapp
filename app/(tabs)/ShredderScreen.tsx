import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Easing,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const { width, height } = Dimensions.get('window');

// 升級版碎片組件：加入縮放與更強的彈射
const AdvancedShard = ({ children, animValues, index }: any) => {
  // 分散軌跡：讓碎片以放射狀噴出
  const angle = (index / 8) * Math.PI * 2; // 將碎片均勻噴向 360 度
  const distance = width * 0.8;

  const translateX = animValues.slide.interpolate({
    inputRange: [0, 1],
    outputRange: [0, Math.cos(angle) * distance * (Math.random() + 0.5)],
  });
  const translateY = animValues.slide.interpolate({
    inputRange: [0, 1],
    outputRange: [0, Math.sin(angle) * distance * (Math.random() + 0.5)],
  });
  const scale = animValues.slide.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.2, 0], // 先稍微放大再縮小消失，更有彈射感
  });
  const rotate = animValues.slide.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', `${(Math.random() - 0.5) * 720}deg`], // 旋轉兩圈
  });

  return (
    <Animated.View
      style={[
        styles.shard,
        {
          opacity: animValues.fade,
          transform: [{ translateX }, { translateY }, { rotate }, { scale }],
        },
      ]}
    >
      <Text style={[styles.shardText, { fontFamily: 'Zen' }]}>{children}</Text>
    </Animated.View>
  );
};

export default function ShredderScreen({ navigation }: any) {
  const [inputText, setInputText] = useState('');
  const [isShredding, setIsShredding] = useState(false);
  const [shards, setShards] = useState<string[]>([]);
  
  const animValue = useRef(new Animated.Value(0)).current;

  const handleShred = () => {
    if (inputText.trim() === '' || isShredding) return;

    // 將文字切成 8 份更細小的碎片，噴發感更強
    const newShards = [];
    const textToSplit = inputText.length > 20 ? inputText : inputText + " 清空煩惱 ";
    const partSize = Math.ceil(textToSplit.length / 8);
    for (let i = 0; i < 8; i++) {
      newShards.push(textToSplit.substring(i * partSize, (i + 1) * partSize));
    }
    
    setShards(newShards);
    setIsShredding(true);

    animValue.setValue(0);
    Animated.timing(animValue, {
      toValue: 1,
      duration: 1000,
      easing: Easing.out(Easing.back(1.5)), // 加入回彈感，讓噴發更有力
      useNativeDriver: true,
    }).start(() => {
      setIsShredding(false);
      setShards([]);
      setInputText('');
    });
  };

  return (
    <LinearGradient colors={['#FDFCFB', '#E2D1F9', '#E0C3FC']} style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header - 已修改為返回箭頭 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.navigate('Relax')} style={styles.backButton}>
            <Ionicons name="chevron-back" size={30} color="#6A5AE0" />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { fontFamily: 'Zen' }]}>煩惱碎紙機</Text>
          <View style={{ width: 32 }} />
        </View>

        <View style={styles.content}>
          <View style={styles.topInfo}>
            <MaterialCommunityIcons name="wind-power" size={24} color="#6A5AE0" />
            <Text style={[styles.instructionText, { fontFamily: 'Zen' }]}>寫下它，讓它消失在風中</Text>
          </View>

          {/* 紙條區域 */}
          <View style={[styles.paperWrapper, isShredding && { opacity: 0, transform: [{ scale: 0.8 }] }]}>
            <View style={styles.paperBase}>
              <TextInput
                style={[styles.textInput, { fontFamily: 'Zen' }]}
                placeholder="在此傾訴那些不開心的事..."
                placeholderTextColor="#BBB"
                multiline
                value={inputText}
                onChangeText={setInputText}
                editable={!isShredding}
              />
            </View>
            <View style={styles.paperTearEdge} />
          </View>

          {/* 華麗噴發層 */}
          {isShredding && (
            <View style={styles.shredOverlay} pointerEvents="none">
              {shards.map((text, index) => (
                <AdvancedShard 
                  key={index} 
                  index={index} 
                  animValues={{
                    slide: animValue,
                    fade: animValue.interpolate({ inputRange: [0, 0.7, 1], outputRange: [1, 1, 0] })
                  }}
                >
                  {text}
                </AdvancedShard>
              ))}
            </View>
          )}

          <TouchableOpacity 
            style={[styles.shredButton, (!inputText || isShredding) && styles.disabledButton]} 
            onPress={handleShred}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#9D85E1', '#6A5AE0']}
              style={styles.buttonGradient}
            >
              <MaterialCommunityIcons name="shredder" size={26} color="white" />
              <Text style={[styles.shredButtonText, { fontFamily: 'Zen' }]}>徹底清空</Text>
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.bottomDecor}>
             <MaterialCommunityIcons name="creation" size={20} color="#6A5AE0" />
             <Text style={[styles.bottomText, { fontFamily: 'Zen' }]}>一掃而空，心就輕了</Text>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15, height: 120 },
  backButton: { padding: 5 },
  headerTitle: { fontSize: 20, color: '#6A5AE0', fontFamily: 'Zen' },
  content: { flex: 1, alignItems: 'center', paddingHorizontal: 25, justifyContent: 'center' },
  topInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 25 },
  instructionText: { fontSize: 16, color: '#666', marginLeft: 8 },
  
  paperWrapper: {
    width: '100%',
    height: height * 0.3,
    backgroundColor: '#FFF',
    borderRadius: 4,
    elevation: 10,
    shadowColor: '#6A5AE0',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#FFD1D1', // 筆記本裝飾線
  },
  paperBase: { flex: 1 },
  textInput: {
    flex: 1,
    fontSize: 18,
    color: '#444',
    lineHeight: 30,
    textAlignVertical: 'top',
  },
  paperTearEdge: {
    position: 'absolute',
    bottom: -5,
    left: 0,
    right: 0,
    height: 10,
    // 這裡可以放一張鋸齒狀底圖或用代碼模擬
  },

  shredButton: {
    width: '100%',
    height: 60,
    borderRadius: 30,
    marginTop: 60,
    overflow: 'hidden',
    elevation: 8,
  },
  buttonGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: { opacity: 0.4 },
  shredButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold', marginLeft: 12 },

  shredOverlay: {
    position: 'absolute',
    top: height * 0.35,
    width: '100%',
    alignItems: 'center',
  },
  shard: {
    position: 'absolute',
    padding: 12,
    backgroundColor: 'white',
    borderRadius: 2,
    borderWidth: 0.5,
    borderColor: '#EEE',
    elevation: 5,
    minWidth: 80,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
  },
  shardText: { fontSize: 14, color: '#333' },

  bottomDecor: { marginTop: 40, alignItems: 'center' },
  bottomText: { color: '#8E7CF0', fontSize: 14, marginTop: 8, fontStyle: 'italic' },
});