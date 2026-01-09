import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

interface Message {
  id: string;
  text: string;
  sender: 'ai' | 'user';
}

export default function AIRelaxScreen({ navigation }: any) {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: '你好，我是你的心靈夥伴。現在感覺如何？無論是開心的、煩惱的，我都會在這裡陪著你。', sender: 'ai' },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // --- API 設定 ---
// 請嘗試修改這兩行
  const GEMINI_API_KEY = 'AIzaSyDwa780NRMDLLiLhRxKLby5y5xdbBL2jlQ'; 
  const API_URL =
  `https://generativelanguage.googleapis.com/v1/models/gemini-1.0-pro:generateContent?key=${GEMINI_API_KEY}`;


const sendMessage = async () => {
    if (inputText.trim() === '') return;

    const userMsg: Message = { id: Date.now().toString(), text: inputText, sender: 'user' };
    setMessages((prev) => [...prev, userMsg]);
    const currentInput = inputText;
    setInputText('');
    setIsTyping(true);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{
            parts: [{ text: `你是一位溫柔的心靈導師，請用繁體中文回覆，給予溫暖簡短的鼓勵：${currentInput}` }]
            }]
        })
      });

      const data = await response.json();
      
      // --- 除錯重點：印出原始資料 ---
      console.log('Gemini API 原始回傳內容:', JSON.stringify(data, null, 2));

      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        const aiResponse = data.candidates[0].content.parts[0].text;
        setMessages((prev) => [...prev, {
          id: Date.now().toString(),
          text: aiResponse.trim(),
          sender: 'ai',
        }]);
      } else if (data.error) {
        console.error('API 回報錯誤訊息:', data.error.message);
        throw new Error(data.error.message);
      } else {
        throw new Error('回傳結構中找不到 candidates');
      }

    } catch (error: any) {
      console.error("發送失敗詳情:", error.message);
      setMessages((prev) => [...prev, {
        id: 'err-' + Date.now(),
        text: `（錯誤：${error.message}）我正在深呼吸，請再試一次。`,
        sender: 'ai'
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[styles.messageWrapper, item.sender === 'user' ? styles.userWrapper : styles.aiWrapper]}>
      {item.sender === 'ai' && (
        <View style={styles.aiAvatar}>
          <MaterialCommunityIcons name="robot-love" size={24} color="white" />
        </View>
      )}
      <View style={[styles.messageBubble, item.sender === 'user' ? styles.userBubble : styles.aiBubble]}>
        <Text style={[styles.messageText, { color: item.sender === 'user' ? 'white' : '#333', fontFamily: 'Zen' }]}>
          {item.text}
        </Text>
      </View>
    </View>
  );

  return (
    <LinearGradient colors={['#FDFCFB', '#E2D1F9']} style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.navigate('Relax')}>
            <Ionicons name="chevron-back" size={28} color="#6A5AE0" />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { fontFamily: 'Zen' }]}>AI 溫柔陪伴</Text>
          <View style={{ width: 28 }} />
        </View>

        {/* 鍵盤避讓邏輯修正 */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0} // 👈 關鍵修正：針對 iOS 調整偏移量
        >
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.chatList}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
          />

          {/* 正在輸入提示 */}
          {isTyping && (
            <View style={styles.typingIndicator}>
              <ActivityIndicator size="small" color="#6A5AE0" />
              <Text style={styles.typingText}>心靈夥伴正在思考...</Text>
            </View>
          )}

          {/* 輸入區 */}
          <View style={styles.inputArea}>
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, { fontFamily: 'Zen' }]}
                placeholder="訴說你的心情..."
                value={inputText}
                onChangeText={setInputText}
                multiline
              />
              <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
                <Ionicons name="paper-plane" size={22} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 50,
    marginTop: 20,
  },
  headerTitle: { fontSize: 18, color: '#6A5AE0' },
  chatList: { padding: 20, paddingBottom: 20 },
  messageWrapper: { flexDirection: 'row', marginBottom: 20, alignItems: 'flex-end' },
  aiWrapper: { alignSelf: 'flex-start' },
  userWrapper: { alignSelf: 'flex-end', flexDirection: 'row-reverse' },
  aiAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#9D85E1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  aiBubble: { backgroundColor: 'white', borderBottomLeftRadius: 4 },
  userBubble: { backgroundColor: '#6A5AE0', borderBottomRightRadius: 4 },
  messageText: { fontSize: 15, lineHeight: 22 },
  typingIndicator: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 25, marginBottom: 10 },
  typingText: { marginLeft: 8, fontSize: 12, color: '#6A5AE0', fontStyle: 'italic' },
  inputArea: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 10 : 15, // 修正 Android 底部留白
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 5,
  },
  input: {
    flex: 1,
    maxHeight: 100,
    fontSize: 16,
    paddingVertical: 8,
    color: '#333',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6A5AE0',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});