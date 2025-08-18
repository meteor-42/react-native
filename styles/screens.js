import { StyleSheet } from "react-native";
import { colors } from "./colors";
import { spacing } from "./spacing";
import { typography } from "./typography";

export const screens = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
  },
  welcomeText: {
    fontSize: typography.sm,
    color: colors.textMuted,
    letterSpacing: typography.letterWider,
    fontWeight: typography.weightLight,
  },
  userName: {
    fontSize: typography.h2,
    color: colors.text,
    fontWeight: typography.weightThin,
    marginBottom: spacing.xs,
  },
  roleText: {
    fontSize: typography.xs,
    color: colors.accentLightText,
    backgroundColor: colors.accentLight,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    letterSpacing: typography.letterWide,
    fontWeight: "500",
  },
  logoutBtn: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
  },
  logoutText: {
    color: colors.text,
    fontSize: typography.sm,
    letterSpacing: typography.letterWide,
    fontWeight: typography.weightLight,
  },
});
