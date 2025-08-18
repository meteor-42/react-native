import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { layout, screens, typography, colors } from '../styles';

export default function LoadingScreen() {
  return (
    <SafeAreaView style={layout.container}>
      <View style={[layout.flex1, layout.center]}>
        <ActivityIndicator size="large" color={colors.text} />
        <Text style={{ color: colors.text, fontSize: typography.sm, letterSpacing: 3, fontWeight: '300', marginTop: 20 }}>
          ЗАГРУЗКА
        </Text>
      </View>
    </SafeAreaView>
  );
}
