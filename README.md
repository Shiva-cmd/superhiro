# superhiro

A small React Native (bare CLI, TypeScript) app that browses products from the public [DummyJSON](https://dummyjson.com/docs/products) API.

## Features

- **Product list**: fetches products page by page (20 at a time) and loads more as you scroll.
- **Detail screen**: tap a product to see its image gallery, price and discount, stock, shipping and warranty details, and reviews. The title and image from the list show right away while the full product loads.
- **Loading, error and empty states**: both screens show a spinner while loading and a message with a **Try again** button when a request fails. Requests time out after 15 seconds, and failure messages say whether it was a network error, a timeout or a server error.
- **Pull to refresh**: works on both screens. If a refresh fails, the data already on screen stays and a banner with a Retry button appears above it.
- In-flight requests are cancelled when you leave a screen or start a new request, so a slow response can't overwrite newer data.

## Requirements

- Node 22.11 or newer
- iOS: Xcode, plus Ruby/Bundler for CocoaPods
- Android: Android Studio with an Android SDK and an emulator (or a connected device)

See the official [environment setup guide](https://reactnative.dev/docs/set-up-your-environment) if this is your first React Native project.

## Run it

```bash
npm install

# iOS (first time only, or after adding native dependencies)
cd ios && bundle install && bundle exec pod install && cd ..

npm start           # start Metro, then in a second terminal:
npm run ios         # or: npm run android
```

## Checks

```bash
npm run lint
npx tsc --noEmit
```

## Project structure

```
App.tsx                      Navigation stack (list → detail)
src/
  api/products.ts            API client: types, timeout, readable errors
  hooks/useProducts.ts       List state (reducer): load, refresh, paginate
  hooks/useProduct.ts        Single-product state: load, refresh
  screens/                   ProductListScreen, ProductDetailScreen
  components/                ProductRow, Loading/Error/Empty views, error banner
  navigation/types.ts        Typed route params
```

## Libraries

- [`@react-navigation/native-stack`](https://reactnavigation.org/): native stack navigation
- `react-native-safe-area-context` and `react-native-screens`: needed by React Navigation

Fetching and state use plain `fetch` and React hooks, with no extra data-fetching library.
