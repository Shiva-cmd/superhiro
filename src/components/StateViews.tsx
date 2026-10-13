import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { colors, spacing } from '../theme';

export function LoadingView({ label = 'Loading…' }: { label?: string }) {
  return (
    <View style={styles.center} testID="loading-view">
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.muted}>{label}</Text>
    </View>
  );
}

export function ErrorView({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <View style={styles.center} testID="error-view">
      <Text style={styles.title}>Something went wrong</Text>
      <Text style={[styles.muted, styles.message]}>{message}</Text>
      <RetryButton onPress={onRetry} />
    </View>
  );
}

export function EmptyView({ message }: { message: string }) {
  return (
    <View style={styles.center}>
      <Text style={styles.muted}>{message}</Text>
    </View>
  );
}

export function ErrorBanner({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <View style={styles.banner} testID="error-banner">
      <Text style={styles.bannerText}>{message}</Text>
      <Pressable onPress={onRetry} hitSlop={8} accessibilityRole="button">
        <Text style={styles.bannerAction}>Retry</Text>
      </Pressable>
    </View>
  );
}

export function RetryButton({
  onPress,
  label = 'Try again',
}: {
  onPress: () => void;
  label?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <Text style={styles.buttonText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.md,
  },
  title: { fontSize: 18, fontWeight: '600', color: colors.text },
  muted: { color: colors.muted, fontSize: 15 },
  message: { textAlign: 'center' },
  button: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 8,
  },
  pressed: { opacity: 0.8 },
  buttonText: { color: '#FFFFFF', fontWeight: '600', fontSize: 15 },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.dangerBackground,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  bannerText: { flex: 1, color: colors.danger, fontSize: 14 },
  bannerAction: { color: colors.danger, fontWeight: '700', fontSize: 14 },
});
