import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AdminDashboard from './AdminDashboard';

export default function DashboardScreen({ user, onLogout }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Text style={styles.welcomeText}>ДОБРО ПОЖАЛОВАТЬ</Text>
          <Text style={styles.userName}>{user.name}</Text>
          <View style={styles.roleContainer}>
            <Text style={styles.roleText}>АДМИНИСТРАТОР</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
          <Text style={styles.logoutText}>ВЫЙТИ</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <AdminDashboard user={user} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  userInfo: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 12,
    color: '#666',
    letterSpacing: 2,
    fontWeight: '300',
    marginBottom: 5,
  },
  userName: {
    fontSize: 24,
    color: '#fff',
    fontWeight: '100',
    marginBottom: 10,
  },
  roleContainer: {
    alignSelf: 'flex-start',
  },
  roleText: {
    fontSize: 10,
    color: '#000',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 4,
    letterSpacing: 1,
    fontWeight: '500',
  },
  logoutButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#333',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  logoutText: {
    color: '#fff',
    fontSize: 12,
    letterSpacing: 1,
    fontWeight: '300',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
});
