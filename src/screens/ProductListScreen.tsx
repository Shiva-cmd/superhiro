import { useCallback } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { ProductSummary } from '../api/products';
import ProductRow from '../components/ProductRow';
import {
  EmptyView,
  ErrorBanner,
  ErrorView,
  LoadingView,
  RetryButton,
} from '../components/StateViews';
import { useProducts } from '../hooks/useProducts';
import type { ProductListProps } from '../navigation/types';
import { colors, spacing } from '../theme';

export default function ProductListScreen({ navigation }: ProductListProps) {
  const {
    items,
    status,
    error,
    refreshing,
    loadingMore,
    loadMoreError,
    hasMore,
    retry,
    refresh,
    loadMore,
    retryLoadMore,
  } = useProducts();

  const openProduct = useCallback(
    (product: ProductSummary) =>
      navigation.navigate('ProductDetail', {
        id: product.id,
        summary: product,
      }),
    [navigation],
  );

  const renderItem = useCallback(
    ({ item }: { item: ProductSummary }) => (
      <ProductRow product={item} onPress={openProduct} />
    ),
    [openProduct],
  );

  if (status === 'loading') {
    return <LoadingView label="Loading products…" />;
  }

  if (status === 'error') {
    return <ErrorView message={error ?? ''} onRetry={retry} />;
  }

  const footer = loadingMore ? (
    <ActivityIndicator style={styles.footer} color={colors.primary} />
  ) : loadMoreError ? (
    <View style={styles.footer}>
      <Text style={styles.footerError}>{loadMoreError}</Text>
      <RetryButton onPress={retryLoadMore} label="Load more" />
    </View>
  ) : !hasMore && items.length > 0 ? (
    <Text style={[styles.footer, styles.footerText]}>
      You've reached the end.
    </Text>
  ) : undefined;

  return (
    <View style={styles.container}>
      {error ? <ErrorBanner message={error} onRetry={refresh} /> : null}
      <FlatList
        data={items}
        keyExtractor={item => String(item.id)}
        renderItem={renderItem}
        ItemSeparatorComponent={Separator}
        ListEmptyComponent={<EmptyView message="No products found." />}
        ListFooterComponent={footer}
        contentContainerStyle={items.length === 0 && styles.emptyContent}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        testID="product-list"
      />
    </View>
  );
}

function Separator() {
  return <View style={styles.separator} />;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginLeft: 96,
  },
  emptyContent: { flexGrow: 1 },
  footer: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
    gap: spacing.md,
  },
  footerText: { textAlign: 'center', color: colors.muted },
  footerError: { color: colors.danger, textAlign: 'center' },
});
