import { StyleSheet } from 'react-native';
import { colors } from './colors';
import { spacing } from './spacing';
import { typography } from './typography';

export const lists = StyleSheet.create({
  section: { flex: 1, backgroundColor: colors.background, paddingHorizontal: spacing.lg, paddingTop: spacing.lg },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: spacing.sm },
  sectionTitle: { fontSize: typography.sm, color: colors.text, fontWeight: typography.weightLight, letterSpacing: typography.letterWide },
  actionIcons: { flexDirection: 'row', gap: spacing.md },
  iconButton: { padding: 4 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: colors.textMuted, fontSize: typography.sm, fontStyle: 'italic' },
  listContent: { paddingBottom: spacing.lg },
  // item blocks
  number:   { fontSize: typography.sm, color: '#666', fontWeight: typography.weightLight },
  info:     { flex: 1, marginRight: spacing.md },
  title:    { fontSize: typography.lg, color: colors.text, fontWeight: typography.weightLight, marginBottom: 6 },
  subtitle: { fontSize: typography.sm, color: '#666' },
  numberContainer: { width: 24, marginRight: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: '#252525' },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 6 },
  actionsRow: { flexDirection: 'row', gap: spacing.md },
  actionBtn: { padding: 6 },
  // badges
  badge: { paddingHorizontal: spacing.md, paddingVertical: 4 },
  badgeTextDark: { fontSize: typography.xs, color: colors.accentLightText, fontWeight: 'bold', letterSpacing: typography.letterWide, paddingVertical: 4 },
  badgeTextLight: { fontSize: typography.xs, color: colors.text, fontWeight: 'bold', letterSpacing: typography.letterWide, paddingVertical: 4 },
  hiddenBadge: { backgroundColor: '#666', paddingHorizontal: spacing.md, paddingVertical: 4 },
  // score
  score: { fontSize: 16, color: colors.text, fontWeight: 'bold', marginRight: spacing.md },
  // pagination
  pagination: { marginTop: spacing.lg, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 4 },
  pageBtn: { width: 32, height: 32, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  pageBtnActive: { backgroundColor: colors.accentLight, borderColor: colors.accentLight },
  pageBtnText: { color: colors.text, fontSize: typography.sm },
  pageBtnTextActive: { color: colors.accentLightText },
});