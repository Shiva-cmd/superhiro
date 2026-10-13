import { useEffect } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { Product } from '../api/products';
import { ErrorBanner, ErrorView, LoadingView } from '../components/StateViews';
import { useProduct } from '../hooks/useProduct';
import type { ProductDetailProps } from '../navigation/types';
import { colors, spacing } from '../theme';

const IMAGE_SIZE = Dimensions.get('window').width;

export default function ProductDetailScreen({
  route,
  navigation,
}: ProductDetailProps) {
  const { id, summary } = route.params;
  const { product, loading, refreshing, error, retry, refresh } =
    useProduct(id);

  const title = product?.title ?? summary?.title;
  useEffect(() => {
    if (title) {
      navigation.setOptions({ title });
    }
  }, [navigation, title]);

  if (!product) {
    if (loading) {
      return <LoadingView label="Loading product…" />;
    }
    return <ErrorView message={error ?? ''} onRetry={retry} />;
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={refresh}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      }
      testID="product-detail"
    >
      {error ? <ErrorBanner message={error} onRetry={refresh} /> : null}
      <Gallery
        images={product.images.length ? product.images : [product.thumbnail]}
      />
      <ProductInfo product={product} />
    </ScrollView>
  );
}

function Gallery({ images }: { images: string[] }) {
  return (
    <FlatList
      data={images}
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      keyExtractor={uri => uri}
      renderItem={({ item }) => (
        <Image
          source={{ uri: item }}
          style={styles.image}
          resizeMode="contain"
        />
      )}
    />
  );
}

function ProductInfo({ product }: { product: Product }) {
  const originalPrice = product.price / (1 - product.discountPercentage / 100);

  return (
    <View style={styles.body}>
      <Text style={styles.meta}>
        {[product.brand, product.category].filter(Boolean).join(' · ')}
      </Text>
      <Text style={styles.title}>{product.title}</Text>

      <View style={styles.priceRow}>
        <Text style={styles.price}>${product.price.toFixed(2)}</Text>
        {product.discountPercentage > 0 ? (
          <>
            <Text style={styles.originalPrice}>
              ${originalPrice.toFixed(2)}
            </Text>
            <Text style={styles.discount}>
              -{Math.round(product.discountPercentage)}%
            </Text>
          </>
        ) : null}
      </View>

      <Text style={styles.rating}>
        ★ {product.rating.toFixed(1)}
        <Text style={styles.muted}> · {product.reviews.length} reviews</Text>
      </Text>

      <Text style={styles.description}>{product.description}</Text>

      <Section title="Details">
        <InfoRow
          label="Availability"
          value={`${product.availabilityStatus} (${product.stock} left)`}
        />
        <InfoRow label="Shipping" value={product.shippingInformation} />
        <InfoRow label="Warranty" value={product.warrantyInformation} />
        <InfoRow label="Returns" value={product.returnPolicy} />
      </Section>

      {product.reviews.length > 0 ? (
        <Section title="Reviews">
          {product.reviews.map((review, index) => (
            <View key={`${review.reviewerName}-${index}`} style={styles.review}>
              <View style={styles.reviewHeader}>
                <Text style={styles.reviewer}>{review.reviewerName}</Text>
                <Text style={styles.reviewRating}>
                  {'★'.repeat(review.rating)}
                  {'☆'.repeat(5 - review.rating)}
                </Text>
              </View>
              <Text style={styles.reviewComment}>{review.comment}</Text>
            </View>
          ))}
        </Section>
      ) : null}
    </View>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.card },
  image: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE * 0.8,
    backgroundColor: colors.background,
  },
  body: { padding: spacing.lg, gap: spacing.sm },
  meta: { fontSize: 13, color: colors.muted, textTransform: 'capitalize' },
  title: { fontSize: 22, fontWeight: '700', color: colors.text },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.sm },
  price: { fontSize: 22, fontWeight: '700', color: colors.text },
  originalPrice: {
    fontSize: 15,
    color: colors.muted,
    textDecorationLine: 'line-through',
  },
  discount: { fontSize: 15, fontWeight: '600', color: colors.success },
  rating: { fontSize: 15, color: colors.star, fontWeight: '600' },
  muted: { color: colors.muted, fontWeight: '400' },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.text,
    marginTop: spacing.sm,
  },
  section: { marginTop: spacing.lg, gap: spacing.sm },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: colors.text },
  infoRow: { flexDirection: 'row', gap: spacing.md },
  infoLabel: { width: 100, color: colors.muted, fontSize: 14 },
  infoValue: { flex: 1, color: colors.text, fontSize: 14 },
  review: {
    paddingVertical: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    gap: spacing.xs,
  },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  reviewer: { fontWeight: '600', color: colors.text },
  reviewRating: { color: colors.star },
  reviewComment: { color: colors.text },
});
