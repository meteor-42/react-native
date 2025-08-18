import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AdminDashboard from './AdminDashboard';
import { layout, screens } from '../styles';

export default function DashboardScreen({ user, onLogout }) {
  return (
    <SafeAreaView style={layout.container}>
      <View style={screens.header}>
        <View style={{ flex: 1 }}>
          <Text style={screens.welcomeText}>ДОБРО ПОЖАЛОВАТЬ</Text>
          <Text style={screens.userName}>{user.name}</Text>
          <View style={{ alignSelf: 'flex-start' }}>
            <Text style={screens.roleText}>АДМИНИСТРАТОР</Text>
          </View>
        </View>
        <TouchableOpacity style={screens.logoutBtn} onPress={onLogout}>
          <Text style={screens.logoutText}>ВЫЙТИ</Text>
        </TouchableOpacity>
      </View>
      <View style={screens.content}>
        <AdminDashboard user={user} />
      </View>
    </SafeAreaView>
  );
}
