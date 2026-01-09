import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import BreathingScreen from './BreathingScreen';
import HomeScreen from './HomeScreen';
import LoginScreen from './LoginScreen';
import MapScreen from './MapScreen';
import ProfileScreen from './ProfileScreen';
import RegisterScreen from './RegisterScreen';

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
        tabBarIcon: ({ color, size, focused }) => {
          let iconName: any;
          // 這裡統一使用小寫名稱判斷，對應下方的 Tab.Screen name
          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } 
          // 2. 修正這裡的語法錯誤
          else if (route.name === 'Map') {
            iconName = focused ? 'map' : 'map-outline'; 
          } 
          else if (route.name === 'Post') {
            iconName = focused ? 'add-circle' : 'add-circle-outline';
          } 
          else if (route.name === 'Alert') {
            iconName = focused ? 'notifications' : 'notifications-outline';
          } 
          else {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#8000FF',
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
      <Tab.Screen name="Map" component={MapScreen} />
      <Tab.Screen name="Post" component={() => <Placeholder name="Post" />} />
      <Tab.Screen name="Alert" component={() => <Placeholder name="Alert" />} />
      <Tab.Screen name="Profile" component={ProfileScreen} />

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
      <Tab.Screen 
        name="Login" 
        component={LoginScreen} 
        options={{ 
          tabBarButton: () => null,
          tabBarItemStyle: { display: 'none' }, // 徹底移除佔位
          tabBarStyle: { display: 'none' }      // 進入登入頁隱藏 Footer
        }} 
      />
      <Tab.Screen 
        name="Register" 
        component={RegisterScreen} 
        options={{ 
          tabBarButton: () => null,
          tabBarItemStyle: { display: 'none' },
          tabBarStyle: { display: 'none' } 
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