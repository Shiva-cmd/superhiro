import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ProductSummary } from '../api/products';

export type RootStackParamList = {
  ProductList: undefined;
  // The summary from the list is passed along so the detail screen can show
  // the title and image immediately while the full product loads.
  ProductDetail: { id: number; summary?: ProductSummary };
};

export type ProductListProps = NativeStackScreenProps<
  RootStackParamList,
  'ProductList'
>;
export type ProductDetailProps = NativeStackScreenProps<
  RootStackParamList,
  'ProductDetail'
>;
