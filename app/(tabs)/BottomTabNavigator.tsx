import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import BreathingScreen from './BreathingScreen';
import HomeScreen from './HomeScreen';

const Placeholder = ({ name }: { name: string }) => (
  <View style={styles.screen}>
    <Text style={[styles.text, { fontFamily: 'GreatVibes', fontSize: 50 }]}>{name}</Text>
    <Text style={[styles.text, { fontFamily: 'Zen', fontSize: 24, marginTop: 10 }]}>
      探索美好的生活設計
    </Text>
  </View>
);

const Tab = createBottomTabNavigator();

export default function BottomTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName: any;
          // 這裡統一使用小寫名稱判斷，對應下方的 Tab.Screen name
          if (route.name === 'Home') iconName = 'home';
          else if (route.name === 'Search') iconName = 'search';
          else if (route.name === 'Post') iconName = 'add-circle';
          else if (route.name === 'Alert') iconName = 'notifications';
          else iconName = 'person';

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
        tabBarLabelStyle: {
          fontFamily: 'Zen', 
          fontSize: 12,
        },
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
          height: 60,
          paddingBottom: 5, 
          position: 'absolute', 
          bottom: 0,
          left: 0,
          right: 0,
          elevation: 0,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Search" component={() => <Placeholder name="Search" />} />
      <Tab.Screen name="Post" component={() => <Placeholder name="Post" />} />
      <Tab.Screen name="Alert" component={() => <Placeholder name="Alert" />} />
      <Tab.Screen name="Profile" component={() => <Placeholder name="Profile" />} />

      {/* 隱藏的呼吸頁面：徹底移除佔位 */}
      <Tab.Screen 
        name="Breathing" 
        component={BreathingScreen} 
        options={{ 
          tabBarButton: () => null,            // 1. 不渲染按鈕元件
          tabBarItemStyle: { display: 'none' }, // 2. 徹底從 Flex 佈局移除，解決右側空白
          tabBarStyle: { display: 'none' },     // 3. 進入呼吸練習時隱藏底部選單
        }} 
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fffaf0',
    paddingBottom: 60,
  },
  text: {
    textAlign: 'center',
  }
});