import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import React, { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';

// 匯入字體
import { Caveat_400Regular, Caveat_700Bold } from '@expo-google-fonts/caveat';
import { CormorantGaramond_400Regular, CormorantGaramond_700Bold } from '@expo-google-fonts/cormorant-garamond';
import { GreatVibes_400Regular } from '@expo-google-fonts/great-vibes';
import { ZenKurenaido_400Regular } from '@expo-google-fonts/zen-kurenaido';

import BottomTabNavigator from './BottomTabNavigator';

// 防止啟動畫面過早關閉
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded] = useFonts({
    'Zen': ZenKurenaido_400Regular,
    'Garamond': CormorantGaramond_400Regular,
    'Garamond-Bold': CormorantGaramond_700Bold,
    'GreatVibes': GreatVibes_400Regular,
    'Caveat': Caveat_400Regular,
    'Caveat-Bold': Caveat_700Bold,
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  // 這裡移除 <NavigationContainer>，因為 Expo Router 已經幫你包好了
  return (
    <View style={styles.container} onLayout={onLayoutRootView}>
      <BottomTabNavigator />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});