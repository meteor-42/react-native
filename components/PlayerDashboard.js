import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';

export default function PlayerDashboard({ user }) {
  const [playerStats, setPlayerStats] = useState({
    level: Math.floor(user.points / 100) + 1, // Уровень основан на очках
    experience: user.points,
    nextLevelExp: (Math.floor(user.points / 100) + 1) * 100,
    totalPredictions: user.total_predictions,
    correctPredictions: user.correct_predictions,
    winRate: user.total_predictions > 0 ? Math.round((user.correct_predictions / user.total_predictions) * 100) : 0,
    rank: user.rank_position > 0 ? `#${user.rank_position}` : 'Без ранга',
    points: user.points,
  });

  const [recentActivity, setRecentActivity] = useState([
    { id: 1, action: 'Выиграл матч', time: '2 часа назад', points: '+25' },
    { id: 2, action: 'Достижение разблокировано', time: '1 день назад', points: '+50' },
    { id: 3, action: 'Проиграл матч', time: '2 дня назад', points: '-15' },
    { id: 4, action: 'Вошел в игру', time: '3 дня назад', points: '+5' },
  ]);

  const experienceProgress = (playerStats.experience / playerStats.nextLevelExp) * 100;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ПРОФИЛЬ ИГРОКА</Text>

        <View style={styles.playerCard}>
          <View style={styles.levelContainer}>
            <Text style={styles.levelNumber}>{playerStats.level}</Text>
            <Text style={styles.levelLabel}>УРОВЕНЬ</Text>
          </View>

          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${experienceProgress}%` }]} />
            </View>
            <Text style={styles.experienceText}>
              {playerStats.experience} / {playerStats.nextLevelExp} XP
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>СТАТИСТИКА</Text>

        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{playerStats.totalPredictions}</Text>
            <Text style={styles.statName}>ПРОГНОЗОВ</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statValue}>{playerStats.correctPredictions}</Text>
            <Text style={styles.statName}>ТОЧНЫХ</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statValue}>{playerStats.winRate}%</Text>
            <Text style={styles.statName}>ТОЧНОСТЬ</Text>
          </View>
        </View>

        <View style={styles.additionalStats}>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>ОЧКИ:</Text>
            <Text style={styles.statValue}>{playerStats.points}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>ПОЗИЦИЯ В РЕЙТИНГЕ:</Text>
            <Text style={styles.statValue}>{playerStats.rank}</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ПОСЛЕДНЯЯ АКТИВНОСТЬ</Text>

        {recentActivity.map((activity) => (
          <View key={activity.id} style={styles.activityItem}>
            <View style={styles.activityInfo}>
              <Text style={styles.activityAction}>{activity.action}</Text>
              <Text style={styles.activityTime}>{activity.time}</Text>
            </View>
            <Text style={[
              styles.activityPoints,
              activity.points.startsWith('+') ? styles.positivePoints : styles.negativePoints
            ]}>
              {activity.points}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>БЫСТРЫЕ ДЕЙСТВИЯ</Text>

        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>НАЙТИ ИГРУ</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionButton, styles.secondaryButton]}>
          <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>
            ПРОСМОТРЕТЬ РЕЙТИНГ
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionButton, styles.secondaryButton]}>
          <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>
            НАСТРОЙКИ ПРОФИЛЯ
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 14,
    color: '#fff',
    letterSpacing: 2,
    fontWeight: '300',
    marginBottom: 20,
  },
  playerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111',
    padding: 20,
    marginBottom: 20,
  },
  levelContainer: {
    alignItems: 'center',
    marginRight: 20,
  },
  levelNumber: {
    fontSize: 32,
    color: '#fff',
    fontWeight: '100',
    marginBottom: 5,
  },
  levelLabel: {
    fontSize: 10,
    color: '#666',
    letterSpacing: 1,
  },
  progressContainer: {
    flex: 1,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#333',
    marginBottom: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#fff',
  },
  experienceText: {
    fontSize: 12,
    color: '#666',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 20,
    borderWidth: 1,
    borderColor: '#222',
    marginHorizontal: 5,
  },
  statValue: {
    fontSize: 20,
    color: '#fff',
    fontWeight: '100',
    marginBottom: 8,
  },
  statName: {
    fontSize: 10,
    color: '#666',
    letterSpacing: 1,
    textAlign: 'center',
  },
  activityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#111',
  },
  activityInfo: {
    flex: 1,
  },
  activityAction: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '300',
    marginBottom: 3,
  },
  activityTime: {
    fontSize: 12,
    color: '#666',
  },
  activityPoints: {
    fontSize: 14,
    fontWeight: '500',
  },
  positivePoints: {
    color: '#4CAF50',
  },
  negativePoints: {
    color: '#F44336',
  },
  actionButton: {
    backgroundColor: '#fff',
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 15,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#333',
  },
  actionButtonText: {
    color: '#000',
    fontSize: 12,
    letterSpacing: 1,
    fontWeight: '500',
  },
  secondaryButtonText: {
    color: '#fff',
  },
  additionalStats: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#222',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    letterSpacing: 1,
  },
});
