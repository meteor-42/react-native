import { StyleSheet } from 'react-native';
import { colors } from './colors';
import { spacing } from './spacing';

export const layout = StyleSheet.create({
  flex1: { flex: 1 },
  row: { flexDirection: 'row' },
  col: { flexDirection: 'column' },
  center: { justifyContent: 'center', alignItems: 'center' },
  between: { justifyContent: 'space-between', alignItems: 'center' },
  container: { flex: 1, backgroundColor: colors.background },
  surface: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  pSm: { padding: spacing.sm },
  pMd: { padding: spacing.md },
  pLg: { padding: spacing.lg },
  pxLg: { paddingHorizontal: spacing.lg },
  pyLg: { paddingVertical: spacing.lg },
  divider: { borderBottomWidth: 1, borderBottomColor: colors.border },
});