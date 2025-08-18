import { StyleSheet } from 'react-native';
import { colors } from './colors';
import { spacing } from './spacing';
import { typography } from './typography';

export const forms = StyleSheet.create({
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.8)', paddingHorizontal: spacing.lg },
  modalContent: { backgroundColor: colors.background, width: '100%', borderWidth: 1, borderColor: colors.border, padding: spacing.xl },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xl, paddingBottom: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  modalTitle: { fontSize: typography.sm, color: colors.text, fontWeight: typography.weightLight, letterSpacing: typography.letterWide },
  inputLabel: { fontSize: typography.sm, color: colors.text, marginBottom: spacing.sm, fontWeight: typography.weightLight },
  textInput: { backgroundColor: '#111', borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.md, paddingVertical: 10, color: colors.text, fontSize: typography.md, marginBottom: spacing.lg },
  roleRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg },
  roleBtn: { flex: 1, paddingVertical: 10, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  roleBtnActive: { backgroundColor: colors.accentLight, borderColor: colors.accentLight },
  roleBtnText: { color: colors.text, fontSize: typography.sm, fontWeight: typography.weightLight },
  roleBtnTextActive: { color: colors.accentLightText },
  statsRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg },
  statInputContainer: { flex: 1 },
  statInput: { backgroundColor: '#111', borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.md, paddingVertical: 10, color: colors.text, fontSize: typography.md },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.lg },
  cancelBtn: { flex: 1, backgroundColor: 'transparent', borderWidth: 1, borderColor: '#666', paddingVertical: 12, alignItems: 'center', marginRight: spacing.md },
  cancelBtnText: { color: colors.text, fontSize: typography.sm, fontWeight: typography.weightLight, letterSpacing: typography.letterWide },
  saveBtn: { flex: 1, backgroundColor: colors.accentLight, paddingVertical: 12, alignItems: 'center', marginLeft: spacing.md },
  saveBtnText: { color: colors.accentLightText, fontSize: typography.sm, fontWeight: typography.weightLight, letterSpacing: typography.letterWide },
});
