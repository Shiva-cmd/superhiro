import { memo } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import type { ProductSummary } from '../api/products';
import { colors, spacing } from '../theme';

interface Props {
  product: ProductSummary;
  onPress: (product: ProductSummary) => void;
}

function ProductRow({ product, onPress }: Props) {
  return (
    <Pressable
      onPress={() => onPress(product)}
      accessibilityRole="button"
      accessibilityLabel={`${product.title}, $${product.price}`}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      testID={`product-row-${product.id}`}
    >
      <Image source={{ uri: product.thumbnail }} style={styles.thumbnail} />
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>
          {product.title}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {[product.brand, product.category].filter(Boolean).join(' · ')}
        </Text>
        <View style={styles.footer}>
          <Text style={styles.price}>${product.price.toFixed(2)}</Text>
          <Text style={styles.rating}>★ {product.rating.toFixed(1)}</Text>
        </View>
      </View>
    </Pressable>
  );
}

export default memo(ProductRow);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    padding: spacing.md,
    gap: spacing.md,
  },
  pressed: { backgroundColor: colors.background },
  thumbnail: {
    width: 72,
    height: 72,
    borderRadius: 8,
    backgroundColor: colors.border,
  },
  info: { flex: 1, justifyContent: 'space-between' },
  title: { fontSize: 16, fontWeight: '600', color: colors.text },
  meta: { fontSize: 13, color: colors.muted, textTransform: 'capitalize' },
  footer: { flexDirection: 'row', justifyContent: 'space-between' },
  price: { fontSize: 15, fontWeight: '700', color: colors.text },
  rating: { fontSize: 14, color: colors.star, fontWeight: '600' },
});
