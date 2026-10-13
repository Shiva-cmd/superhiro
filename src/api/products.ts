const BASE_URL = 'https://dummyjson.com';
const REQUEST_TIMEOUT_MS = 15000;

export const PAGE_SIZE = 20;

export interface ProductSummary {
  id: number;
  title: string;
  price: number;
  rating: number;
  thumbnail: string;
  category: string;
  brand?: string;
}

export interface Review {
  rating: number;
  comment: string;
  date: string;
  reviewerName: string;
}

export interface Product extends ProductSummary {
  description: string;
  discountPercentage: number;
  stock: number;
  images: string[];
  availabilityStatus: string;
  warrantyInformation: string;
  shippingInformation: string;
  returnPolicy: string;
  reviews: Review[];
}

export interface ProductPage {
  products: ProductSummary[];
  total: number;
  skip: number;
  limit: number;
}

export class ApiError extends Error {}

async function request<T>(path: string, signal?: AbortSignal): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const onAbort = () => controller.abort();
  signal?.addEventListener('abort', onAbort);

  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      signal: controller.signal,
    });
    if (!response.ok) {
      throw new ApiError(`Request failed (HTTP ${response.status}).`);
    }
    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    if (signal?.aborted) {
      throw error;
    }
    if (controller.signal.aborted) {
      throw new ApiError('The request timed out. Please try again.');
    }
    throw new ApiError(
      'Could not reach the server. Check your connection and try again.',
    );
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener('abort', onAbort);
  }
}

const SUMMARY_FIELDS = 'title,price,rating,thumbnail,category,brand';

export function fetchProducts(
  skip = 0,
  limit = PAGE_SIZE,
  signal?: AbortSignal,
): Promise<ProductPage> {
  return request<ProductPage>(
    `/products?limit=${limit}&skip=${skip}&select=${SUMMARY_FIELDS}`,
    signal,
  );
}

export function fetchProduct(
  id: number,
  signal?: AbortSignal,
): Promise<Product> {
  return request<Product>(`/products/${id}`, signal);
}
