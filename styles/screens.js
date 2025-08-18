import { StyleSheet } from "react-native";
import { colors } from "./colors";
import { spacing } from "./spacing";
import { typography } from "./typography";

export const screens = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: spacing.sm,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  userName: {
    fontSize: typography.h2,
    color: colors.text,
    fontWeight: typography.weightThin,
  },
  roleText: {
    fontSize: typography.xs,
    color: colors.accentLightText,
    backgroundColor: colors.warning,
    paddingHorizontal: spacing.md,
    paddingVertical: 1,
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
