---
outline: deep
---

# SSR

Wagmi uses client-only external stores (such as `localStorage` and `mipd`) to show the user the most relevant data as quickly as possible on first render.

However, the caveat of using these external client stores is that frameworks which incorporate SSR (such as Next.js) will throw hydration warnings on the client when it identifies mismatches between the server-rendered HTML and the client-rendered HTML.

To stop this from happening, you can toggle on the [`ssr`](/react/api/createConfig#ssr) property in the Wagmi Config.

```tsx
import { createConfig, http } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'

const config = createConfig({ // [!code focus:99]
  chains: [mainnet, sepolia],
  ssr: true, // [!code ++]
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
})
```

Turning on the `ssr` property means that content from the external stores will be hydrated on the client after the initial mount.

## Persistence using Cookies

As a result of turning on the `ssr` property, external persistent stores like `localStorage` will be hydrated on the client **after the initial mount**.

This means that you will still see a flash of "empty" data on the client (e.g. a `"disconnected"` account instead of a `"reconnecting"` account, or an empty address instead of the last connected address) until after the first mount, when the store hydrates.

In order to persist data between the server and the client, you can use cookies.

### 1. Set up cookie storage

First, we will set up cookie storage in the Wagmi Config.

```tsx
import { 
  createConfig, 
  http, 
  cookieStorage, // [!code ++]
  createStorage // [!code ++]
} from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'

export function getConfig() {
  return createConfig({
    chains: [mainnet, sepolia],
    ssr: true,
    storage: createStorage({  // [!code ++]
      storage: cookieStorage, // [!code ++]
    }),  // [!code ++]
    transports: {
      [mainnet.id]: http(),
      [sepolia.id]: http(),
    },
  })
}
```

### 2. Hydrate the cookie

Next, we will need to add some mechanisms to hydrate the stored cookie in Wagmi.

#### Next.js App Directory

In our `app/layout.tsx` file (a [Server Component](https://nextjs.org/docs/app/building-your-application/rendering/server-components)), we will need to extract the cookie from the `headers` function and pass it to [`cookieToInitialState`](/react/api/utilities/cookieToInitialState). 

We will need to pass this result to the [`initialState` property](/react/api/WagmiProvider#initialstate) of the `WagmiProvider`. The `WagmiProvider` **must** be in a Client Component tagged with `"use client"` (see `app/providers.tsx` tab).

::: code-group
```tsx [app/layout.tsx]
import { type ReactNode } from 'react'
import { headers } from 'next/headers' // [!code ++]
import { cookieToInitialState } from 'wagmi' // [!code ++]

import { getConfig } from './config'
import { Providers } from './providers'

export default async function Layout({ children }: { children: ReactNode }) {
  const initialState = cookieToInitialState( // [!code ++]
    getConfig(), // [!code ++]
    (await headers()).get('cookie') // [!code ++]
  ) // [!code ++]
  return (
    <html lang="en">
      <body>
        <Providers> // [!code --]
        <Providers initialState={initialState}> // [!code ++]
          {children}
        </Providers>
      </body>
    </html>
  )
}

```

```tsx [app/providers.tsx]
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { type ReactNode, useState } from 'react'
import { type State, WagmiProvider } from 'wagmi'

import { getConfig } from './config'

type Props = {
  children: ReactNode,
  initialState: State | undefined, // [!code ++]
}

export function Providers({ children }: Props) {  // [!code --]
export function Providers({ children, initialState }: Props) {  // [!code ++]
  const [config] = useState(() => getConfig())
  const [queryClient] = useState(() => new QueryClient())

  return (
    <WagmiProvider config={config}> // [!code --]
    <WagmiProvider config={config} initialState={initialState}> // [!code ++]
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}

```

```tsx [app/config.ts]
import { 
  createConfig, 
  http, 
  cookieStorage,
  createStorage 
} from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'

export function getConfig() {
  return createConfig({
    chains: [mainnet, sepolia],
    ssr: true,
    storage: createStorage({  // [!code ++]
      storage: cookieStorage, // [!code ++]
    }),  // [!code ++]
    transports: {
      [mainnet.id]: http(),
      [sepolia.id]: http(),
    },
  })
}
```
:::

#### Next.js Pages Directory

Would you like to contribute this content? Feel free to [open a Pull Request](https://github.com/wevm/wagmi/pulls)!
<!-- TODO -->

#### Vanilla SSR

Would you like to contribute this content? Feel free to [open a Pull Request](https://github.com/wevm/wagmi/pulls)!
<!-- TODO -->

# Viem

[Viem](https://viem.sh) is a low-level TypeScript Interface for Ethereum that enables developers to interact with the Ethereum blockchain, including: JSON-RPC API abstractions, Smart Contract interaction, wallet & signing implementations, coding/parsing utilities and more.

**Wagmi Core** is essentially a wrapper over **Viem** that provides multi-chain functionality via [Wagmi Config](/react/api/createConfig) and automatic account management via [Connectors](/react/api/connectors).

## Leveraging Viem Actions

All of the core [Wagmi Hooks](/react/api/actions) are friendly wrappers around [Viem Actions](https://viem.sh/docs/actions/public/introduction.html) that inject a multi-chain and connector aware [Wagmi Config](/react/api/createConfig).

There may be cases where you might want to dig deeper and utilize Viem Actions directly (maybe a Hook doesn't exist in Wagmi yet). In these cases, you can create your own custom Wagmi Hook by importing Viem Actions directly via `viem/actions` and plugging in a Viem Client returned by the [`useClient` Hook](/react/api/hooks/useClient).

The example below demonstrates two different ways to utilize Viem Actions:

1. **Tree-shakable Actions (recommended):** Uses `useClient` (for public actions) and `useConnectorClient` (for wallet actions).
2. **Client Actions:** Uses `usePublicClient` (for public actions) and  `useWalletClient` (for wallet actions).

::: tip

It is highly recommended to use the **tree-shakable** method to ensure that you are only pulling modules you use, and keep your bundle size low.

:::

::: code-group

```tsx [Tree-shakable Actions]
// 1. Import modules. 
import { useMutation, useQuery } from '@tanstack/react-query'
import { http, createConfig, useClient, useConnectorClient } from 'wagmi' 
import { base, mainnet, optimism, zora } from 'wagmi/chains' 
import { getLogs, watchAsset } from 'viem/actions'

// 2. Set up a Wagmi Config 
export const config = createConfig({ 
  chains: [base, mainnet, optimism, zora], 
  transports: { 
    [base.id]: http(), 
    [mainnet.id]: http(), 
    [optimism.id]: http(), 
    [zora.id]: http(), 
  }, 
}) 

function Example() {
  // 3. Extract a Viem Client for the current active chain. // [!code hl]
  const publicClient = useClient({ config }) // [!code hl]

  // 4. Create a "custom" Query Hook that utilizes the Client. // [!code hl]
  const { data: logs } = useQuery({ // [!code hl]
    queryKey: ['logs', publicClient.uid], // [!code hl]
    queryFn: () => getLogs(publicClient, /* ... */) // [!code hl]
  }) // [!code hl]
  
  // 5. Extract a Viem Client for the current active chain & account. // [!code hl]
  const { data: walletClient } = useConnectorClient({ config }) // [!code hl]

  // 6. Create a "custom" Mutation Hook that utilizes the Client. // [!code hl]
  const { mutate } = useMutation({ // [!code hl]
    mutationFn: (asset) => watchAsset(walletClient, asset) // [!code hl]
  }) // [!code hl]

  return (
    <div>
      {/* ... */}
    </div>
  )
}
```

```tsx [Client Actions]
// 1. Import modules. 
import { useMutation, useQuery } from '@tanstack/react-query'
import { http, createConfig, useClient, useConnectorClient } from 'wagmi' 
import { base, mainnet, optimism, zora } from 'wagmi/chains' 

// 2. Set up a Wagmi Config 
export const config = createConfig({ 
  chains: [base, mainnet, optimism, zora], 
  transports: { 
    [base.id]: http(), 
    [mainnet.id]: http(), 
    [optimism.id]: http(), 
    [zora.id]: http(), 
  }, 
}) 

function Example() {
  // 3. Extract a Viem Client for the current active chain. // [!code hl]
  const publicClient = useClient({ config }) // [!code hl]

  // 4. Create a "custom" Query Hook that utilizes the Client. // [!code hl]
  const { data: logs } = useQuery({ // [!code hl]
    queryKey: ['logs', publicClient.uid], // [!code hl]
    queryFn: () => publicClient.getLogs(/* ... */) // [!code hl]
  }) // [!code hl]
  
  // 5. Extract a Viem Client for the current active chain & account. // [!code hl]
  const { data: walletClient } = useConnectorClient({ config }) // [!code hl]

  // 6. Create a "custom" Mutation Hook that utilizes the Client. // [!code hl]
  const { mutate } = useMutation({ // [!code hl]
    mutationFn: (asset) => walletClient.watchAsset(asset) // [!code hl]
  }) // [!code hl]

  return (
    <div>
      {/* ... */}
    </div>
  )
}
```

:::

## Private Key & Mnemonic Accounts

It is possible to utilize Viem's [Private Key & Mnemonic Accounts](https://viem.sh/docs/accounts/local.html) with Wagmi by explicitly passing through the account via the `account` argument on Wagmi Actions.

```tsx
import { http, createConfig, useSendTransaction } from 'wagmi' 
import { base, mainnet, optimism, zora } from 'wagmi/chains' 
import { parseEther } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'

export const config = createConfig({ 
  chains: [base, mainnet, optimism, zora], 
  transports: { 
    [base.id]: http(), 
    [mainnet.id]: http(), 
    [optimism.id]: http(), 
    [zora.id]: http(), 
  }, 
}) 

const account = privateKeyToAccount('0x...') // [!code hl]

function Example() {
  const { data: hash } = useSendTransaction({
    account, // [!code hl]
    to: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
    value: parseEther('0.001')
  })
}
```

::: info

Wagmi currently does not support hoisting Private Key & Mnemonic Accounts to the top-level Wagmi Config – meaning you have to explicitly pass through the account to every Action. If you feel like this is a feature that should be added, please [open an discussion](https://github.com/wevm/wagmi/discussions/new?category=ideas).

:::

# TanStack Query

Wagmi Hooks are not only a wrapper around the core [Wagmi Actions](/core/api/actions), but they also utilize [TanStack Query](https://tanstack.com/query/v5) to enable trivial and intuitive fetching, caching, synchronizing, and updating of asynchronous data in your React applications.

Without an asynchronous data fetching abstraction, you would need to handle all the negative side-effects that comes as a result, such as: representing finite states (loading, error, success), handling race conditions, caching against a deterministic identifier, etc.

## Queries & Mutations

Wagmi Hooks represent either a **Query** or a **Mutation**. 

**Queries** are used for fetching data (e.g. fetching a block number, reading from a contract, etc), and are typically invoked on mount by default. All queries are coupled to a unique [Query Key](#query-keys), and can be used for further operations such as refetching, prefetching, or modifying the cached data.

**Mutations** are used for mutating data (e.g. connecting/disconnecting accounts, writing to a contract, switching chains, etc), and are typically invoked in response to a user interaction. Unlike **Queries**, they are not coupled with a query key.

## Terms

- **Query**: An asynchronous data fetching (e.g. read data) operation that is tied against a unique Query Key.
- **Mutation**: An asynchronous mutating (e.g. create/update/delete data or side-effect) operation.
- **Query Key**: A unique identifier that is used to deterministically identify a query. It is typically a tuple of the query name and the query arguments.
- **Stale Data**: Data that is unused or inactive after a certain period of time.
- **Query Fetching**: The process of invoking an async query function.
- **Query Refetching**: The process of refetching **rendered** queries.
- **[Query Invalidation](https://tanstack.com/query/v5/docs/react/guides/query-invalidation)**: The process of marking query data as stale (e.g. inactive/unused), and refetching **rendered** queries.
- **[Query Prefetching](https://tanstack.com/query/v5/docs/react/guides/prefetching)**: The process of prefetching queries and seeding the cache.

## Persistence via External Stores

By default, TanStack Query persists all query data in-memory. This means that if you refresh the page, all in-memory query data will be lost. 

If you want to persist query data to an external storage, you can utilize TanStack Query's [`createSyncStoragePersister`](https://tanstack.com/query/v5/docs/react/plugins/createSyncStoragePersister) or [`createAsyncStoragePersister`](https://tanstack.com/query/v5/docs/react/plugins/createAsyncStoragePersister) to plug external storage like `localStorage`, `sessionStorage`, [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) or [`AsyncStorage`](https://reactnative.dev/docs/asyncstorage) (React Native).

### Sync Storage

Below is an example of how to set up Wagmi + TanStack Query with sync external storage like `localStorage` or `sessionStorage`.

#### Install

::: code-group
```bash [pnpm]
pnpm i @tanstack/query-sync-storage-persister @tanstack/react-query-persist-client
```

```bash [npm]
npm i @tanstack/query-sync-storage-persister @tanstack/react-query-persist-client
```

```bash [yarn]
yarn add @tanstack/query-sync-storage-persister @tanstack/react-query-persist-client
```

```bash [bun]
bun i @tanstack/query-sync-storage-persister @tanstack/react-query-persist-client
```
:::

#### Usage

```tsx
// 1. Import modules. // [!code hl]
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister' // [!code hl]
import { QueryClient } from '@tanstack/react-query' // [!code hl]
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client' // [!code hl]
import { WagmiProvider, deserialize, serialize } from 'wagmi' // [!code hl]

// 2. Create a new Query Client with a default `gcTime`. // [!code hl]
const queryClient = new QueryClient({ // [!code hl]
  defaultOptions: { // [!code hl]
    queries: { // [!code hl]
      gcTime: 1_000 * 60 * 60 * 24, // 24 hours // [!code hl]
    }, // [!code hl] 
  }, // [!code hl]
}) // [!code hl]

// 3. Set up the persister. // [!code hl]
const persister = createSyncStoragePersister({ // [!code hl]
  serialize, // [!code hl]
  storage: window.localStorage, // [!code hl]
  deserialize, // [!code hl]
}) // [!code hl]

function App() {
  return (
    <WagmiProvider config={config}>
      {/* 4. Wrap app in PersistQueryClientProvider */} // [!code hl]
      <PersistQueryClientProvider // [!code hl]
        client={queryClient} // [!code hl]
        persistOptions={{ persister }} // [!code hl]
      > // [!code hl]
        {/* ... */}
      </PersistQueryClientProvider> // [!code hl]
    </WagmiProvider>
  )
}
```

Read more about [Sync Storage Persistence](https://tanstack.com/query/v5/docs/react/plugins/createSyncStoragePersister).

### Async Storage

Below is an example of how to set up Wagmi + TanStack Query with async external storage like [`IndexedDB`](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) or [`AsyncStorage`](https://reactnative.dev/docs/asyncstorage).

#### Install

::: code-group
```bash [pnpm]
pnpm i @tanstack/query-async-storage-persister @tanstack/react-query-persist-client
```

```bash [npm]
npm i @tanstack/query-async-storage-persister @tanstack/react-query-persist-client
```

```bash [yarn]
yarn add @tanstack/query-async-storage-persister @tanstack/react-query-persist-client
```

```bash [bun]
bun i @tanstack/query-async-storage-persister @tanstack/react-query-persist-client
```
:::

#### Usage

```tsx
// 1. Import modules. // [!code hl]
import AsyncStorage from '@react-native-async-storage/async-storage' // [!code hl]
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister' // [!code hl]
import { QueryClient } from '@tanstack/react-query' // [!code hl]
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client' // [!code hl]
import { WagmiProvider, deserialize, serialize } from 'wagmi' // [!code hl]

// 2. Create a new Query Client with a default `gcTime`. // [!code hl]
const queryClient = new QueryClient({ // [!code hl]
  defaultOptions: { // [!code hl]
    queries: { // [!code hl]
      gcTime: 1_000 * 60 * 60 * 24, // 24 hours // [!code hl]
    }, // [!code hl] 
  }, // [!code hl]
}) // [!code hl]

// 3. Set up the persister. // [!code hl]
const persister = createAsyncStoragePersister({ // [!code hl]
  serialize, // [!code hl]
  storage: AsyncStorage, // [!code hl]
  deserialize, // [!code hl]
}) // [!code hl]

function App() {
  return (
    <WagmiProvider config={config}>
      {/* 4. Wrap app in PersistQueryClientProvider */} // [!code hl]
      <PersistQueryClientProvider // [!code hl]
        client={queryClient} // [!code hl]
        persistOptions={{ persister }} // [!code hl]
      > // [!code hl]
        {/* ... */}
      </PersistQueryClientProvider> // [!code hl]
    </WagmiProvider>
  )
}
```

Read more about [Async Storage Persistence](https://tanstack.com/query/v5/docs/react/plugins/createAsyncStoragePersister).

## Query Keys

Query Keys are typically used to perform advanced operations on the query such as: invalidation, refetching, prefetching, etc. 

Wagmi exports Query Keys for every Hook, and they can be retrieved via the [Hook (React)](#hook-react) or via an [Import (Vanilla JS)](#import-vanilla-js).

Read more about **Query Keys** on the [TanStack Query docs.](https://tanstack.com/query/v5/docs/react/guides/query-keys)

### Hook (React)

Each Hook returns a `queryKey` value. You would use this approach when you want to utilize the query key in a React component as it handles reactivity for you, unlike the [Import](#import-vanilla-js) method below.

```ts 
import { useBlock } from 'wagmi' // [!code hl]

function App() {
  const { queryKey } = useBlock() // [!code hl]
}
```

### Import (Vanilla JS)

Each Hook has a corresponding `get<X>QueryOptions` function that returns a query key. You would use this method when you want to utilize the query key outside of a React component in a Vanilla JS context, like in a utility function. 

```ts 
import { getBlockQueryOptions } from 'wagmi/query' // [!code hl]
import { config } from './config'

function perform() {
  const { queryKey } = getBlockQueryOptions(config, { // [!code hl]
    chainId: config.state.chainId // [!code hl]
  }) // [!code hl]
}
```

::: warning

The caveat of this method is that it does not handle reactivity for you (e.g. active account/chain changes, argument changes, etc). You would need to handle this yourself by explicitly passing through the arguments to `get<X>QueryOptions`.

:::

## Invalidating Queries

Invalidating a query is the process of marking the query data as stale (e.g. inactive/unused), and refetching the queries that are already rendered.

Read more about **Invalidating Queries** on the [TanStack Query docs.](https://tanstack.com/query/v5/docs/react/guides/query-invalidation)

#### Example: Watching a Users' Balance

You may want to "watch" a users' balance, and invalidate the balance after each incoming block. We can invoke `invalidateQueries` inside a `useEffect` with the block number as it's only dependency – this will refetch all rendered balance queries when the `blockNumber` changes.

```tsx
import { useQueryClient } from '@tanstack/react-query' 
import { useEffect } from 'react' 
import { useBlockNumber, useBalance } from 'wagmi' 

function App() {
  const queryClient = useQueryClient()
  const { data: blockNumber } = useBlockNumber({ watch: true }) // [!code hl]
  const { data: balance, queryKey } = useBalance() // [!code hl]
  
  useEffect(() => { // [!code hl]
    queryClient.invalidateQueries({ queryKey }) // [!code hl]
  }, [blockNumber]) // [!code hl]

  return <div>{balance}</div>
}
```

#### Example: After User Interaction

Maybe you want to invalidate a users' balance after some interaction. This would mark the balance as stale, and consequently refetch all rendered balance queries.

```tsx
import { useBalance } from 'wagmi'

function App() {
  // 1. Extract `queryKey` from the useBalance Hook. // [!code hl]
  const { queryKey } = useBalance() // [!code hl]

  return (
    <button
      onClick={async () => {
        // 2. Invalidate the query when the user clicks "Invalidate". // [!code hl]
        await queryClient.invalidateQueries({ queryKey }) // [!code hl]
      }}
    >
      Invalidate
    </button>
  )
}

function Example() {
  // 3. Other `useBalance` Hooks in your rendered React tree will be refetched! // [!code hl]
  const { data: balance } = useBalance() // [!code hl]

  return <div>{balance}</div>
}
```

## Fetching Queries

Fetching a query is the process of invoking the query function to retrieve data. If the query exists and the data is not invalidated or older than a given `staleTime`, then the data from the cache will be returned. Otherwise, the query will fetch for the latest data.

::: code-group
```tsx [example.tsx]
import { getBlockQueryOptions } from 'wagmi'
import { queryClient } from './app'
import { config } from './config'

export async function fetchBlockData() {
  return queryClient.fetchQuery( // [!code hl]
    getBlockQueryOptions(config, { // [!code hl]
      chainId: config.state.chainId, // [!code hl]
    } // [!code hl]
  )) // [!code hl]
}
```
<<< @/snippets/react/app.tsx[app.tsx]
<<< @/snippets/react/config.ts[config.ts]
:::

## Retrieving & Updating Query Data

You can retrieve and update query data imperatively with `getQueryData` and `setQueryData`. This is useful for scenarios where you want to retrieve or update a query outside of a React component.

Note that these functions do not invalidate or refetch queries.

::: code-group
```tsx [example.tsx]
import { getBlockQueryOptions } from 'wagmi'
import type { Block } from 'viem'
import { queryClient } from './app'
import { config } from './config'

export function getPendingBlockData() {
  return queryClient.getQueryData( // [!code hl]
    getBlockQueryOptions(config, { // [!code hl]
      chainId: config.state.chainId, // [!code hl]
      tag: 'pending' // [!code hl]
    } // [!code hl]
  )) // [!code hl]
}

export function setPendingBlockData(data: Block) {
  return queryClient.setQueryData( // [!code hl]
    getBlockQueryOptions(config, { // [!code hl]
      chainId: config.state.chainId, // [!code hl]
      tag: 'pending' // [!code hl]
    }, // [!code hl]
    data // [!code hl]
  )) // [!code hl]
}
```
<<< @/snippets/react/app.tsx[app.tsx]
<<< @/snippets/react/config.ts[config.ts]
:::

## Prefetching Queries

Prefetching a query is the process of fetching the data ahead of time and seeding the cache with the returned data. This is useful for scenarios where you want to fetch data before the user navigates to a page, or fetching data on the server to be reused on client hydration.

Read more about **Prefetching Queries** on the [TanStack Query docs.](https://tanstack.com/query/v5/docs/react/guides/prefetching)

#### Example: Prefetching in Event Handler

```tsx
import { Link } from 'next/link'
import { getBlockQueryOptions } from 'wagmi'

function App() {
  const config = useConfig()
  const chainId = useChainId()

  // 1. Set up a function to prefetch the block data. // [!code hl]
  const prefetch = () => // [!code hl]
    queryClient.prefetchQuery(getBlockQueryOptions(config, { chainId })) // [!code hl]
  

  return (
    <Link
      // 2. Add event handlers to prefetch the block data // [!code hl] 
      // when user hovers over or focuses on the button. // [!code hl]
      onMouseEnter={prefetch} // [!code hl]
      onFocus={prefetch} // [!code hl]
      to="/block-details"
    >
      Block details
    </Link>
  )
}
```

## SSR

It is possible to utilize TanStack Query's SSR strategies with Wagmi Hooks & Query Keys. Check out the [Server Rendering & Hydration](https://tanstack.com/query/v5/docs/react/guides/ssr) & [Advanced Server Rendering](https://tanstack.com/query/v5/docs/react/guides/advanced-ssr) guides.

## Devtools

TanStack Query includes dedicated [Devtools](https://tanstack.com/query/latest/docs/framework/react/devtools) that assist in visualizing and debugging your queries, their cache states, and much more. You will have to pass a custom `queryKeyFn` to your `QueryClient` for Devtools to correctly serialize BigInt values for display. Alternatively, You can use the `hashFn` from `@wagmi/core/query`, which already handles this serialization.

#### Install

::: code-group
```bash [pnpm]
pnpm i @tanstack/react-query-devtools
```

```bash [npm]
npm i @tanstack/react-query-devtools
```

```bash [yarn]
yarn add @tanstack/react-query-devtools
```

```bash [bun]
bun i @tanstack/react-query-devtools
```
:::

#### Usage

```tsx
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"; // [!code hl]
import { hashFn } from "@wagmi/core/query"; // [!code hl]

const queryClient = new QueryClient({
  defaultOptions: { // [!code hl]
    queries: { // [!code hl]
      queryKeyHashFn: hashFn, // [!code hl]
    }, // [!code hl]
  }, // [!code hl]
});
```

# Connect Wallet

The ability for a user to connect their wallet is a core function for any Dapp. It allows users to perform tasks such as: writing to contracts, signing messages, or sending transactions.

Wagmi contains everything you need to get started with building a Connect Wallet module. To get started, you can either use a [third-party library](#third-party-libraries) or [build your own](#build-your-own).

## Third-party Libraries

You can use a pre-built Connect Wallet module from a third-party library such as:

- [ConnectKit](https://docs.family.co/connectkit) - [Guide](https://docs.family.co/connectkit/getting-started)
- [AppKit](https://reown.com/appkit) - [Guide](https://docs.reown.com/appkit/next/core/installation)
- [RainbowKit](https://www.rainbowkit.com/) - [Guide](https://www.rainbowkit.com/docs/installation)
- [Dynamic](https://www.dynamic.xyz/) - [Guide](https://docs.dynamic.xyz/quickstart)
- [Privy](https://privy.io) - [Guide](https://docs.privy.io/guide/react/wallets/usage/wagmi)

The above libraries are all built on top of Wagmi, handle all the edge cases around wallet connection, and provide a seamless Connect Wallet UX that you can use in your Dapp.

## Build Your Own

Wagmi provides you with the Hooks to get started building your own Connect Wallet module. 

It takes less than five minutes to get up and running with Browser Wallets, WalletConnect, and Coinbase Wallet.

### 1. Configure Wagmi

Before we get started with building the functionality of the Connect Wallet module, we will need to set up the Wagmi configuration.

Let's create a `config.ts` file and export a `config` object.

::: code-group

```tsx [config.ts]
import { http, createConfig } from 'wagmi'
import { base, mainnet, optimism } from 'wagmi/chains'
import { injected, metaMask, safe, walletConnect } from 'wagmi/connectors'

const projectId = '<WALLETCONNECT_PROJECT_ID>'

export const config = createConfig({
  chains: [mainnet, base],
  connectors: [
    injected(),
    walletConnect({ projectId }),
    metaMask(),
    safe(),
  ],
  transports: {
    [mainnet.id]: http(),
    [base.id]: http(),
  },
})
```

:::

In the above configuration, we want to set up connectors for Injected (browser), WalletConnect (browser + mobile), MetaMask, and Safe wallets. This configuration uses the **Mainnet** and **Base** chains, but you can use whatever you want.

::: warning

Make sure to replace the `projectId` with your own WalletConnect Project ID, if you wish to use WalletConnect! 

[Get your Project ID](https://cloud.reown.com/)

:::

### 2. Wrap App in Context Provider

Next, we will need to wrap our React App with Context so that our application is aware of Wagmi & React Query's reactive state and in-memory caching.

::: code-group

```tsx [app.tsx]
 // 1. Import modules
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { config } from './config'

// 2. Set up a React Query client.
const queryClient = new QueryClient()

function App() {
  // 3. Wrap app with Wagmi and React Query context.
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}> 
        {/** ... */} 
      </QueryClientProvider> 
    </WagmiProvider>
  )
}
```

```tsx [config.ts]
import { http, createConfig } from 'wagmi'
import { base, mainnet, optimism } from 'wagmi/chains'
import { injected, metaMask, safe, walletConnect } from 'wagmi/connectors'

const projectId = '<WALLETCONNECT_PROJECT_ID>'

export const config = createConfig({
  chains: [mainnet, base],
  connectors: [
    injected(),
    walletConnect({ projectId }),
    metaMask(),
    safe(),
  ],
  transports: {
    [mainnet.id]: http(),
    [base.id]: http(),
  },
})
```

:::

### 3. Display Wallet Options

After that, we will create a `WalletOptions` component that will display our connectors. This will allow users to select a wallet and connect.

Below, we are rendering a list of `connectors` retrieved from `useConnect`. When the user clicks on a connector, the `connect` function will connect the users' wallet.

::: code-group

```tsx [wallet-options.tsx]
import * as React from 'react'
import { Connector, useConnect } from 'wagmi'

export function WalletOptions() {
  const { connectors, connect } = useConnect()

  return connectors.map((connector) => (
    <button key={connector.uid} onClick={() => connect({ connector })}>
      {connector.name}
    </button>
  ))
}
```

```tsx [app.tsx]
 // 1. Import modules
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { config } from './config'

// 2. Set up a React Query client.
const queryClient = new QueryClient()

function App() {
  // 3. Wrap app with Wagmi and React Query context.
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}> 
        {/* ... */}
      </QueryClientProvider> 
    </WagmiProvider>
  )
}
```

```tsx [config.ts]
import { http, createConfig } from 'wagmi'
import { base, mainnet, optimism } from 'wagmi/chains'
import { injected, metaMask, safe, walletConnect } from 'wagmi/connectors'

const projectId = '<WALLETCONNECT_PROJECT_ID>'

export const config = createConfig({
  chains: [mainnet, base],
  connectors: [
    injected(),
    walletConnect({ projectId }),
    metaMask(),
    safe(),
  ],
  transports: {
    [mainnet.id]: http(),
    [base.id]: http(),
  },
})
```

:::

### 4. Display Connected Account

Lastly, if an account is connected, we want to show some basic information, like the connected address and ENS name and avatar.

Below, we are using hooks like `useAccount`, `useEnsAvatar` and `useEnsName` to extract this information.

We are also utilizing `useDisconnect` to show a "Disconnect" button so a user can disconnect their wallet.

::: code-group

```tsx [account.tsx]
import { useAccount, useDisconnect, useEnsAvatar, useEnsName } from 'wagmi'

export function Account() {
  const { address } = useAccount()
  const { disconnect } = useDisconnect()
  const { data: ensName } = useEnsName({ address })
  const { data: ensAvatar } = useEnsAvatar({ name: ensName! })

  return (
    <div>
      {ensAvatar && <img alt="ENS Avatar" src={ensAvatar} />}
      {address && <div>{ensName ? `${ensName} (${address})` : address}</div>}
      <button onClick={() => disconnect()}>Disconnect</button>
    </div>
  )
}
```

```tsx [wallet-options.tsx]
import * as React from 'react'
import { Connector, useConnect } from 'wagmi'

export function WalletOptions() {
  const { connectors, connect } = useConnect()

  return connectors.map((connector) => (
    <WalletOption
      key={connector.uid}
      connector={connector}
      onClick={() => connect({ connector })}
    />
  ))
}

function WalletOption({
  connector,
  onClick,
}: {
  connector: Connector
  onClick: () => void
}) {
  const [ready, setReady] = React.useState(false)

  React.useEffect(() => {
    ;(async () => {
      const provider = await connector.getProvider()
      setReady(!!provider)
    })()
  }, [connector])

  return (
    <button disabled={!ready} onClick={onClick}>
      {connector.name}
    </button>
  )
}
```

```tsx [app.tsx]
 // 1. Import modules
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { config } from './config'

// 2. Set up a React Query client.
const queryClient = new QueryClient()

function App() {
  // 3. Wrap app with Wagmi and React Query context.
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}> 
        {/* ... */}
      </QueryClientProvider> 
    </WagmiProvider>
  )
}
```

```tsx [config.ts]
import { http, createConfig } from 'wagmi'
import { base, mainnet, optimism } from 'wagmi/chains'
import { injected, metaMask, safe, walletConnect } from 'wagmi/connectors'

const projectId = '<WALLETCONNECT_PROJECT_ID>'

export const config = createConfig({
  chains: [mainnet, base],
  connectors: [
    injected(),
    walletConnect({ projectId }),
    metaMask(),
    safe(),
  ],
  transports: {
    [mainnet.id]: http(),
    [base.id]: http(),
  },
})
```

:::

### 5. Wire it up!

Finally, we can wire up our Wallet Options and Account components to our application's entrypoint.

::: code-group

```tsx [app.tsx]
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider, useAccount } from 'wagmi'
import { config } from './config'
import { Account } from './account' // [!code ++]
import { WalletOptions } from './wallet-options' // [!code ++]

const queryClient = new QueryClient()

function ConnectWallet() { // [!code ++]
  const { isConnected } = useAccount() // [!code ++]
  if (isConnected) return <Account /> // [!code ++]
  return <WalletOptions /> // [!code ++]
} // [!code ++]

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}> 
        <ConnectWallet /> // [!code ++]
      </QueryClientProvider> 
    </WagmiProvider>
  )
}
```

```tsx [account.tsx]
import { useAccount, useDisconnect, useEnsAvatar, useEnsName } from 'wagmi'

export function Account() {
  const { address } = useAccount()
  const { disconnect } = useDisconnect()
  const { data: ensName } = useEnsName({ address })
  const { data: ensAvatar } = useEnsAvatar({ name: ensName! })

  return (
    <div>
      {ensAvatar && <img alt="ENS Avatar" src={ensAvatar} />}
      {address && <div>{ensName ? `${ensName} (${address})` : address}</div>}
      <button onClick={() => disconnect()}>Disconnect</button>
    </div>
  )
}
```

```tsx [wallet-options.tsx]
import * as React from 'react'
import { Connector, useConnect } from 'wagmi'

export function WalletOptions() {
  const { connectors, connect } = useConnect()

  return connectors.map((connector) => (
    <WalletOption
      key={connector.uid}
      connector={connector}
      onClick={() => connect({ connector })}
    />
  ))
}

function WalletOption({
  connector,
  onClick,
}: {
  connector: Connector
  onClick: () => void
}) {
  const [ready, setReady] = React.useState(false)

  React.useEffect(() => {
    ;(async () => {
      const provider = await connector.getProvider()
      setReady(!!provider)
    })()
  }, [connector])

  return (
    <button disabled={!ready} onClick={onClick}>
      {connector.name}
    </button>
  )
}
```

```tsx [config.ts]
import { http, createConfig } from 'wagmi'
import { base, mainnet, optimism } from 'wagmi/chains'
import { injected, metaMask, safe, walletConnect } from 'wagmi/connectors'

const projectId = '<WALLETCONNECT_PROJECT_ID>'

export const config = createConfig({
  chains: [mainnet, base],
  connectors: [
    injected(),
    walletConnect({ projectId }),
    metaMask(),
    safe(),
  ],
  transports: {
    [mainnet.id]: http(),
    [base.id]: http(),
  },
})
```

:::

### Playground

Want to see the above steps all wired up together in an end-to-end example? Check out the below StackBlitz playground.

<br/>

<iframe frameborder="0" width="100%" height="500px" src="https://stackblitz.com/edit/vitejs-vite-ujbsuv?embed=1&file=src%2FApp.tsx&hideExplorer=1&view=preview"></iframe>

<script setup>
const docsPath = 'react'
</script>

# FAQ / Troubleshooting

Collection of frequently asked questions with ideas on how to troubleshoot and resolve them.

<!--@include: @shared/faq.md-->

## How does Wagmi work?

Until there's a more in-depth write-up about Wagmi internals, here is the gist:

- Wagmi is essentially a wrapper around [Viem](https://viem.sh) and TanStack Query that adds connector and multichain support.
- [Connectors](/react/api/connectors) allow Wagmi and Ethereum accounts to communicate with each other.
- The Wagmi [`Config`](/react/api/createConfig#config) manages connections established between Wagmi and Connectors, as well as some global state. [Connections](/react/api/createConfig#connection) come with one or more addresses and a chain ID.
  - If there are connections, the Wagmi `Config` listens for connection changes and updates the [`chainId`](/react/api/createConfig#chainid) based on the ["current" connection](/react/api/createConfig#current). (The Wagmi `Config` can have [many connections established](/react/api/createConfig#connections) at once, but only one connection can be the "current" connection. Usually this is the connection from the last connector that is connected, but can change based on event emitted from other connectors or through the [`useSwitchAccount`](/react/api/hooks/useSwitchAccount) hook and [`switchAccount`](/core/api/actions/switchAccount) action.)
  - If there are no connections, the Wagmi `Config` defaults the global state `chainId` to the first chain it was created with or last established connection.
  - The global `chainId` can be changed directly using the [`useSwitchChain`](/react/api/hooks/useSwitchChain) hook and [`switchChain`](/core/api/actions/switchChain) action. This works when there are no connections as well as for most connectors (not all connectors support chain switching).
- Wagmi uses the global `chainId` (from the "current" connection or global state) to internally create Viem Client's, which are used by hooks and actions.
- Hooks are constructed by TanStack Query options helpers, exported by the `'@wagmi/core/query'` entrypoint, and some additional code to wire up type parameters, hook into React Context, etc.
- There are three types of hooks: query hooks, mutation hooks, and config hooks. Query hooks, like [`useCall`](/react/api/hooks/useCall), generally read blockchain state and mutation hooks, like [`useSendTransaction`](/react/api/hooks/useSendTransaction), usually change state through sending transactions via the "current" connection. Config hooks are for getting data from and managing the Wagmi `Config` instance, e.g. [`useChainId`](/react/api/hooks/useChainId) and `useSwitchAccount`. Query and mutation hooks usually have corresponding [Viem actions.](https://viem.sh)
