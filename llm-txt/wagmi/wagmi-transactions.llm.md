# Send Transaction

The following guide teaches you how to send transactions in Wagmi. The example below builds on the [Connect Wallet guide](/react/guides/connect-wallet) and uses the [useSendTransaction](/react/api/hooks/useSendTransaction) & [useWaitForTransaction](/react/api/hooks/useWaitForTransactionReceipt) hooks. 

## Example

Feel free to check out the example before moving on:

<iframe frameborder="0" width="100%" height="500px" src="https://stackblitz.com/edit/vitejs-vite-zkzqj7?embed=1&file=src%2FApp.tsx&hideExplorer=1&view=preview"></iframe>

## Steps

### 1. Connect Wallet

Follow the [Connect Wallet guide](/react/guides/connect-wallet) guide to get this set up.

### 2. Create a new component

Create your `SendTransaction` component that will contain the send transaction logic.

::: code-group

```tsx [send-transaction.tsx]
import * as React from 'react'
 
export function SendTransaction() {
  return (
    <form>
      <input name="address" placeholder="0xA0Cf…251e" required />
      <input name="value" placeholder="0.05" required />
      <button type="submit">Send</button>
    </form>
  )
}
```

:::

### 3. Add a form handler

Next, we will need to add a handler to the form that will send the transaction when the user hits "Send". This will be a basic handler in this step.

::: code-group

```tsx [send-transaction.tsx]
import * as React from 'react'
 
export function SendTransaction() {
  async function submit(e: React.FormEvent<HTMLFormElement>) { // [!code ++]
    e.preventDefault() // [!code ++]
    const formData = new FormData(e.target as HTMLFormElement) // [!code ++]
    const to = formData.get('address') as `0x${string}` // [!code ++]
    const value = formData.get('value') as string // [!code ++]
  } // [!code ++]

  return (
    <form> // [!code --]
    <form onSubmit={submit}> // [!code ++]
      <input name="address" placeholder="0xA0Cf…251e" required />
      <input name="value" placeholder="0.05" required />
      <button type="submit">Send</button>
    </form>
  )
}
```

:::

### 4. Hook up the `useSendTransaction` Hook

Now that we have the form handler, we can hook up the [`useSendTransaction` Hook](/react/api/hooks/useSendTransaction) to send the transaction.

::: code-group

```tsx [send-transaction.tsx]
import * as React from 'react'
import { useSendTransaction } from 'wagmi' // [!code ++]
import { parseEther } from 'viem' // [!code ++]
 
export function SendTransaction() {
  const { data: hash, sendTransaction } = useSendTransaction() // [!code ++]

  async function submit(e: React.FormEvent<HTMLFormElement>) { 
    e.preventDefault() 
    const formData = new FormData(e.target as HTMLFormElement) 
    const to = formData.get('address') as `0x${string}` 
    const value = formData.get('value') as string 
    sendTransaction({ to, value: parseEther(value) }) // [!code ++]
  } 

  return (
    <form onSubmit={submit}>
      <input name="address" placeholder="0xA0Cf…251e" required />
      <input name="value" placeholder="0.05" required />
      <button type="submit">Send</button>
      {hash && <div>Transaction Hash: {hash}</div>} // [!code ++]
    </form>
  )
}
```

:::

### 5. Add loading state (optional)

We can optionally add a loading state to the "Send" button while we are waiting confirmation from the user's wallet.

::: code-group

```tsx [send-transaction.tsx]
import * as React from 'react'
import { useSendTransaction } from 'wagmi' 
import { parseEther } from 'viem' 
 
export function SendTransaction() {
  const { 
    data: hash, 
    isPending, // [!code ++]
    sendTransaction 
  } = useSendTransaction() 

  async function submit(e: React.FormEvent<HTMLFormElement>) { 
    e.preventDefault() 
    const formData = new FormData(e.target as HTMLFormElement) 
    const to = formData.get('address') as `0x${string}` 
    const value = formData.get('value') as string 
    sendTransaction({ to, value: parseEther(value) }) 
  } 

  return (
    <form onSubmit={submit}>
      <input name="address" placeholder="0xA0Cf…251e" required />
      <input name="value" placeholder="0.05" required />
      <button 
        disabled={isPending} // [!code ++]
        type="submit"
      >
        Send // [!code --]
        {isPending ? 'Confirming...' : 'Send'} // [!code ++]
      </button>
      {hash && <div>Transaction Hash: {hash}</div>} 
    </form>
  )
}
```

:::

### 6. Wait for transaction receipt (optional)

We can also display the transaction confirmation status to the user by using the [`useWaitForTransactionReceipt` Hook](/react/api/hooks/useWaitForTransactionReceipt). 

::: code-group

```tsx [send-transaction.tsx]
import * as React from 'react'
import { 
  useSendTransaction, 
  useWaitForTransactionReceipt // [!code ++]
} from 'wagmi' 
import { parseEther } from 'viem' 
 
export function SendTransaction() {
  const { 
    data: hash, 
    isPending, 
    sendTransaction 
  } = useSendTransaction() 

  async function submit(e: React.FormEvent<HTMLFormElement>) { 
    e.preventDefault() 
    const formData = new FormData(e.target as HTMLFormElement) 
    const to = formData.get('address') as `0x${string}` 
    const value = formData.get('value') as string 
    sendTransaction({ to, value: parseEther(value) }) 
  } 

  const { isLoading: isConfirming, isSuccess: isConfirmed } = // [!code ++]
    useWaitForTransactionReceipt({ // [!code ++]
      hash, // [!code ++]
    }) // [!code ++]

  return (
    <form onSubmit={submit}>
      <input name="address" placeholder="0xA0Cf…251e" required />
      <input name="value" placeholder="0.05" required />
      <button 
        disabled={isPending} 
        type="submit"
      >
        {isPending ? 'Confirming...' : 'Send'} 
      </button>
      {hash && <div>Transaction Hash: {hash}</div>} 
      {isConfirming && <div>Waiting for confirmation...</div>} // [!code ++]
      {isConfirmed && <div>Transaction confirmed.</div>} // [!code ++]
    </form>
  )
}
```

:::

### 7. Handle errors (optional)

If the user rejects the transaction, or the user does not have enough funds to cover the transaction, we can display an error message to the user.

::: code-group

```tsx [send-transaction.tsx]
import * as React from 'react'
import { 
  type BaseError, // [!code ++]
  useSendTransaction, 
  useWaitForTransactionReceipt 
} from 'wagmi' 
import { parseEther } from 'viem' 
 
export function SendTransaction() {
  const { 
    data: hash,
    error, // [!code ++] 
    isPending, 
    sendTransaction 
  } = useSendTransaction() 

  async function submit(e: React.FormEvent<HTMLFormElement>) { 
    e.preventDefault() 
    const formData = new FormData(e.target as HTMLFormElement) 
    const to = formData.get('address') as `0x${string}` 
    const value = formData.get('value') as string 
    sendTransaction({ to, value: parseEther(value) }) 
  } 

  const { isLoading: isConfirming, isSuccess: isConfirmed } = 
    useWaitForTransactionReceipt({ 
      hash, 
    }) 

  return (
    <form onSubmit={submit}>
      <input name="address" placeholder="0xA0Cf…251e" required />
      <input name="value" placeholder="0.05" required />
      <button 
        disabled={isPending} 
        type="submit"
      >
        {isPending ? 'Confirming...' : 'Send'} 
      </button>
      {hash && <div>Transaction Hash: {hash}</div>} 
      {isConfirming && <div>Waiting for confirmation...</div>} 
      {isConfirmed && <div>Transaction confirmed.</div>} 
      {error && ( // [!code ++]
        <div>Error: {(error as BaseError).shortMessage || error.message}</div> // [!code ++]
      )} // [!code ++]
    </form>
  )
}
```

:::

### 8. Wire it up!

Finally, we can wire up our Send Transaction component to our application's entrypoint.

::: code-group

```tsx [app.tsx]
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider, useAccount } from 'wagmi'
import { config } from './config'
import { SendTransaction } from './send-transaction' // [!code ++]

const queryClient = new QueryClient()

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}> 
        <SendTransaction /> // [!code ++]
      </QueryClientProvider> 
    </WagmiProvider>
  )
}
```

```tsx [send-transaction.tsx]
import * as React from 'react'
import { 
  type BaseError, 
  useSendTransaction, 
  useWaitForTransactionReceipt 
} from 'wagmi' 
import { parseEther } from 'viem' 
 
export function SendTransaction() {
  const { 
    data: hash,
    error, 
    isPending, 
    sendTransaction 
  } = useSendTransaction() 

  async function submit(e: React.FormEvent<HTMLFormElement>) { 
    e.preventDefault() 
    const formData = new FormData(e.target as HTMLFormElement) 
    const to = formData.get('address') as `0x${string}` 
    const value = formData.get('value') as string 
    sendTransaction({ to, value: parseEther(value) }) 
  } 

  const { isLoading: isConfirming, isSuccess: isConfirmed } = 
    useWaitForTransactionReceipt({ 
      hash, 
    }) 

  return (
    <form onSubmit={submit}>
      <input name="address" placeholder="0xA0Cf…251e" required />
      <input name="value" placeholder="0.05" required />
      <button 
        disabled={isPending} 
        type="submit"
      >
        {isPending ? 'Confirming...' : 'Send'} 
      </button>
      {hash && <div>Transaction Hash: {hash}</div>} 
      {isConfirming && <div>Waiting for confirmation...</div>} 
      {isConfirmed && <div>Transaction confirmed.</div>} 
      {error && ( 
        <div>Error: {(error as BaseError).shortMessage || error.message}</div> 
      )} 
    </form>
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

[See the Example.](#example)

# Write to Contract

The [`useWriteContract` Hook](/react/api/hooks/useWriteContract) allows you to mutate data on a smart contract, from a `payable` or `nonpayable` (write) function. These types of functions require gas to be executed, hence a transaction is broadcasted in order to change the state.

In the guide below, we will teach you how to implement a "Mint NFT" form that takes in a dynamic argument (token ID) using Wagmi. The example below builds on the [Connect Wallet guide](/react/guides/connect-wallet) and uses the [useWriteContract](/react/api/hooks/useWriteContract) & [useWaitForTransaction](/react/api/hooks/useWaitForTransactionReceipt) hooks. 

If you have already completed the [Sending Transactions guide](/react/guides/send-transaction), this guide will look very similar! That's because writing to a contract internally broadcasts & sends a transaction.

## Example

Feel free to check out the example before moving on:

<iframe frameborder="0" width="100%" height="500px" src="https://stackblitz.com/edit/vitejs-vite-f5uwlm?embed=1&file=src%2FApp.tsx&hideExplorer=1&view=preview"></iframe>

## Steps

### 1. Connect Wallet

Follow the [Connect Wallet guide](/react/guides/connect-wallet) guide to get this set up.

### 2. Create a new component

Create your `MintNFT` component that will contain the Mint NFT logic.

::: code-group

```tsx [mint-nft.tsx]
import * as React from 'react'
 
export function MintNFT() {
  return (
    <form>
      <input name="tokenId" placeholder="69420" required />
      <button type="submit">Mint</button>
    </form>
  )
}
```

:::

### 3. Add a form handler

Next, we will need to add a handler to the form that will send the transaction when the user hits "Mint". This will be a basic handler in this step.

::: code-group

```tsx [mint-nft.tsx]
import * as React from 'react'
 
export function MintNFT() {
  async function submit(e: React.FormEvent<HTMLFormElement>) { // [!code ++]
    e.preventDefault() // [!code ++]
    const formData = new FormData(e.target as HTMLFormElement) // [!code ++]
    const tokenId = formData.get('tokenId') as string // [!code ++]
  } // [!code ++]

  return (
    <form> // [!code --]
    <form onSubmit={submit}> // [!code ++]
      <input name="tokenId" placeholder="69420" required />
      <button type="submit">Mint</button>
    </form>
  )
}
```

:::

### 4. Hook up the `useWriteContract` Hook

Now that we have the form handler, we can hook up the [`useWriteContract` Hook](/react/api/hooks/useWriteContract) to send the transaction.

::: code-group

```tsx [mint-nft.tsx]
import * as React from 'react'
import { useWriteContract } from 'wagmi' // [!code ++]
import { abi } from './abi' // [!code ++]
 
export function MintNFT() {
  const { data: hash, writeContract } = useWriteContract() // [!code ++]

  async function submit(e: React.FormEvent<HTMLFormElement>) { 
    e.preventDefault() 
    const formData = new FormData(e.target as HTMLFormElement) 
    const tokenId = formData.get('tokenId') as string 
    writeContract({ // [!code ++]
      address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2', // [!code ++]
      abi, // [!code ++]
      functionName: 'mint', // [!code ++]
      args: [BigInt(tokenId)], // [!code ++]
    }) // [!code ++]
  } 

  return (
    <form onSubmit={submit}>
      <input name="tokenId" placeholder="69420" required />
      <button type="submit">Mint</button>
      {hash && <div>Transaction Hash: {hash}</div>} // [!code ++]
    </form>
  )
}
```

```ts [abi.ts]
export const abi = [
  {
    name: 'mint',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ internalType: 'uint32', name: 'tokenId', type: 'uint32' }],
    outputs: [],
  },
] as const
```

:::

### 5. Add loading state (optional)

We can optionally add a loading state to the "Mint" button while we are waiting confirmation from the user's wallet.

::: code-group

```tsx [mint-nft.tsx]
import * as React from 'react'
import { useWriteContract } from 'wagmi'
import { abi } from './abi'
 
export function MintNFT() {
  const { 
    data: hash, 
    isPending, // [!code ++]
    writeContract 
  } = useWriteContract() 

  async function submit(e: React.FormEvent<HTMLFormElement>) { 
    e.preventDefault() 
    const formData = new FormData(e.target as HTMLFormElement) 
    const tokenId = formData.get('tokenId') as string 
    writeContract({
      address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
      abi,
      functionName: 'mint',
      args: [BigInt(tokenId)],
    })
  } 

  return (
    <form onSubmit={submit}>
      <input name="tokenId" placeholder="69420" required />
      <button 
        disabled={isPending} // [!code ++]
        type="submit"
      >
        Mint // [!code --]
        {isPending ? 'Confirming...' : 'Mint'} // [!code ++]
      </button>
      {hash && <div>Transaction Hash: {hash}</div>}
    </form>
  )
}
```

```ts [abi.ts]
export const abi = [
  {
    name: 'mint',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ internalType: 'uint32', name: 'tokenId', type: 'uint32' }],
    outputs: [],
  },
] as const
```

:::

### 6. Wait for transaction receipt (optional)

We can also display the transaction confirmation status to the user by using the [`useWaitForTransactionReceipt` Hook](/react/api/hooks/useWaitForTransactionReceipt). 

::: code-group

```tsx [mint-nft.tsx]
import * as React from 'react'
import { 
  useWaitForTransactionReceipt, // [!code ++]
  useWriteContract 
} from 'wagmi'
import { abi } from './abi'
 
export function MintNFT() {
  const { 
    data: hash, 
    isPending, 
    writeContract 
  } = useWriteContract() 

  async function submit(e: React.FormEvent<HTMLFormElement>) { 
    e.preventDefault() 
    const formData = new FormData(e.target as HTMLFormElement) 
    const tokenId = formData.get('tokenId') as string 
    writeContract({
      address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
      abi,
      functionName: 'mint',
      args: [BigInt(tokenId)],
    })
  } 

  const { isLoading: isConfirming, isSuccess: isConfirmed } = // [!code ++]
    useWaitForTransactionReceipt({ // [!code ++]
      hash, // [!code ++]
    }) // [!code ++]

  return (
    <form onSubmit={submit}>
      <input name="tokenId" placeholder="69420" required />
      <button 
        disabled={isPending} 
        type="submit"
      >
        {isPending ? 'Confirming...' : 'Mint'} 
      </button>
      {hash && <div>Transaction Hash: {hash}</div>}
      {isConfirming && <div>Waiting for confirmation...</div>} // [!code ++]
      {isConfirmed && <div>Transaction confirmed.</div>} // [!code ++]
    </form>
  )
}
```

```ts [abi.ts]
export const abi = [
  {
    name: 'mint',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ internalType: 'uint32', name: 'tokenId', type: 'uint32' }],
    outputs: [],
  },
] as const
```

:::

### 7. Handle errors (optional)

If the user rejects the transaction, or the contract reverts, we can display an error message to the user.

::: code-group

```tsx [mint-nft.tsx]
import * as React from 'react'
import { 
  type BaseError, // [!code ++]
  useWaitForTransactionReceipt, 
  useWriteContract 
} from 'wagmi'
import { abi } from './abi'
 
export function MintNFT() {
  const { 
    data: hash,
    error, // [!code ++]  
    isPending, 
    writeContract 
  } = useWriteContract() 

  async function submit(e: React.FormEvent<HTMLFormElement>) { 
    e.preventDefault() 
    const formData = new FormData(e.target as HTMLFormElement) 
    const tokenId = formData.get('tokenId') as string 
    writeContract({
      address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
      abi,
      functionName: 'mint',
      args: [BigInt(tokenId)],
    })
  } 

  const { isLoading: isConfirming, isSuccess: isConfirmed } = 
    useWaitForTransactionReceipt({ 
      hash, 
    }) 

  return (
    <form onSubmit={submit}>
      <input name="tokenId" placeholder="69420" required />
      <button 
        disabled={isPending} 
        type="submit"
      >
        {isPending ? 'Confirming...' : 'Mint'} 
      </button>
      {hash && <div>Transaction Hash: {hash}</div>}
      {isConfirming && <div>Waiting for confirmation...</div>} 
      {isConfirmed && <div>Transaction confirmed.</div>} 
      {error && ( // [!code ++]
        <div>Error: {(error as BaseError).shortMessage || error.message}</div> // [!code ++]
      )} // [!code ++]
    </form>
  )
}
```

```ts [abi.ts]
export const abi = [
  {
    name: 'mint',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ internalType: 'uint32', name: 'tokenId', type: 'uint32' }],
    outputs: [],
  },
] as const
```

:::

### 8. Wire it up!

Finally, we can wire up our Mint NFT component to our application's entrypoint.

::: code-group

```tsx [app.tsx]
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider, useAccount } from 'wagmi'
import { config } from './config'
import { MintNft } from './mint-nft' // [!code ++]

const queryClient = new QueryClient()

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}> 
        <MintNft /> // [!code ++]
      </QueryClientProvider> 
    </WagmiProvider>
  )
}
```

```tsx [mint-nft.tsx]
import * as React from 'react'
import { 
  type BaseError, 
  useWaitForTransactionReceipt, 
  useWriteContract 
} from 'wagmi'
import { abi } from './abi'
 
export function MintNFT() {
  const { 
    data: hash,
    error,   
    isPending, 
    writeContract 
  } = useWriteContract() 

  async function submit(e: React.FormEvent<HTMLFormElement>) { 
    e.preventDefault() 
    const formData = new FormData(e.target as HTMLFormElement) 
    const tokenId = formData.get('tokenId') as string 
    writeContract({
      address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
      abi,
      functionName: 'mint',
      args: [BigInt(tokenId)],
    })
  } 

  const { isLoading: isConfirming, isSuccess: isConfirmed } = 
    useWaitForTransactionReceipt({ 
      hash, 
    }) 

  return (
    <form onSubmit={submit}>
      <input name="tokenId" placeholder="69420" required />
      <button 
        disabled={isPending} 
        type="submit"
      >
        {isPending ? 'Confirming...' : 'Mint'} 
      </button>
      {hash && <div>Transaction Hash: {hash}</div>}
      {isConfirming && <div>Waiting for confirmation...</div>} 
      {isConfirmed && <div>Transaction confirmed.</div>} 
      {error && ( 
        <div>Error: {(error as BaseError).shortMessage || error.message}</div> 
      )} 
    </form>
  )
}
```

```ts [abi.ts]
export const abi = [
  {
    name: 'mint',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ internalType: 'uint32', name: 'tokenId', type: 'uint32' }],
    outputs: [],
  },
] as const
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

[See the Example.](#example)

# Read from Contract

The [`useReadContract` Hook](/react/api/hooks/useReadContract) allows you to read data on a smart contract, from a `view` or `pure` (read-only) function. They can only read the state of the contract, and cannot make any changes to it. Since read-only methods do not change the state of the contract, they do not require any gas to be executed, and can be called by any user without the need to pay for gas.

The component below shows how to retrieve the token balance of an address from the [Wagmi Example](https://etherscan.io/token/0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2) contract

:::code-group
```tsx [read-contract.tsx]
import { useReadContract } from 'wagmi'
import { wagmiContractConfig } from './contracts'

function ReadContract() {
  const { data: balance } = useReadContract({
    ...wagmiContractConfig,
    functionName: 'balanceOf',
    args: ['0x03A71968491d55603FFe1b11A9e23eF013f75bCF'],
  })

  return (
    <div>Balance: {balance?.toString()}</div>
  )
}
```
```ts [contracts.ts]
export const wagmiContractConfig = {
  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
  abi: [
    {
      type: 'function',
      name: 'balanceOf',
      stateMutability: 'view',
      inputs: [{ name: 'account', type: 'address' }],
      outputs: [{ type: 'uint256' }],
    },
    {
      type: 'function',
      name: 'totalSupply',
      stateMutability: 'view',
      inputs: [],
      outputs: [{ name: 'supply', type: 'uint256' }],
    },
  ],
} as const
```
:::

If `useReadContract` depends on another value (`address` in the example below), you can use the [`query.enabled`](/react/api/hooks/useReadContract#enabled) option to prevent the query from running until the dependency is ready.

```tsx
const { data: balance } = useReadContract({
  ...wagmiContractConfig,
  functionName: 'balanceOf',
  args: [address],
  query: { // [!code focus]
    enabled: !!address, // [!code focus]
  }, // [!code focus]
})
```

## Loading & Error States

The [`useReadContract` Hook](/react/api/hooks/useReadContract) also returns loading & error states, which can be used to display a loading indicator while the data is being fetched, or an error message if contract execution reverts.

:::code-group

```tsx [read-contract.tsx]
import { type BaseError, useReadContract } from 'wagmi'

function ReadContract() {
  const { 
    data: balance,
    error, // [!code ++]
    isPending // [!code ++]
  } = useReadContract({
    ...wagmiContractConfig,
    functionName: 'balanceOf',
    args: ['0x03A71968491d55603FFe1b11A9e23eF013f75bCF'],
  })

  if (isPending) return <div>Loading...</div> // [!code ++]

  if (error) // [!code ++]
    return ( // [!code ++]
      <div> // [!code ++]
        Error: {(error as BaseError).shortMessage || error.message} // [!code ++]
      </div> // [!code ++]
    )  // [!code ++]

  return (
    <div>Balance: {balance?.toString()}</div>
  )
}
```

## Refetching On Blocks

The [`useBlockNumber` Hook](/react/api/hooks/useBlockNumber) can be utilized to refetch or [invalidate](https://tanstack.com/query/latest/docs/framework/react/guides/query-invalidation) the contract data on a specific block interval.

:::code-group
```tsx [read-contract.tsx (refetch)]
import { useEffect } from 'react'
import { useBlockNumber, useReadContract } from 'wagmi'

function ReadContract() {
  const { data: balance, refetch } = useReadContract({
    ...wagmiContractConfig,
    functionName: 'balanceOf',
    args: ['0x03A71968491d55603FFe1b11A9e23eF013f75bCF'],
  })
  const { data: blockNumber } = useBlockNumber({ watch: true })

  useEffect(() => {
    // want to refetch every `n` block instead? use the modulo operator!
    // if (blockNumber % 5 === 0) refetch() // refetch every 5 blocks
    refetch()
  }, [blockNumber])

  return (
    <div>Balance: {balance?.toString()}</div>
  )
}
```
```tsx [read-contract.tsx (invalidate)]
import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useBlockNumber, useReadContract } from 'wagmi'

function ReadContract() {
  const queryClient = useQueryClient()
  const { data: balance, refetch } = useReadContract({
    ...wagmiContractConfig,
    functionName: 'balanceOf',
    args: ['0x03A71968491d55603FFe1b11A9e23eF013f75bCF'],
  })
  const { data: blockNumber } = useBlockNumber({ watch: true })

  useEffect(() => {
    // if `useReadContract` is in a different hook/component,
    // you can import `readContractQueryKey` from `'wagmi/query'` and
    // construct a one-off query key to use for invalidation
    queryClient.invalidateQueries({ queryKey })
  }, [blockNumber, queryClient])

  return (
    <div>Balance: {balance?.toString()}</div>
  )
}
```
:::

## Calling Multiple Functions

We can use the [`useReadContract` Hook](/react/api/hooks/useReadContract) multiple times in a single component to call multiple functions on the same contract, but this ends up being hard to manage as the number of functions increases, especially when we also want to deal with loading & error states. 

Luckily, to make this easier, we can use the [`useReadContracts` Hook](/react/api/hooks/useReadContracts) to call multiple functions in a single call.

:::code-group

```tsx [read-contract.tsx]
import { type BaseError, useReadContracts } from 'wagmi'

function ReadContract() {
  const { 
    data,
    error,
    isPending
  } = useReadContracts({ 
    contracts: [{ 
      ...wagmiContractConfig,
      functionName: 'balanceOf',
      args: ['0x03A71968491d55603FFe1b11A9e23eF013f75bCF'],
    }, { 
      ...wagmiContractConfig, 
      functionName: 'ownerOf', 
      args: [69n], 
    }, { 
      ...wagmiContractConfig, 
      functionName: 'totalSupply', 
    }] 
  }) 
  const [balance, ownerOf, totalSupply] = data || [] 

  if (isPending) return <div>Loading...</div>

  if (error)
    return (
      <div>
        Error: {(error as BaseError).shortMessage || error.message}
      </div>
    ) 

  return (
    <>
      <div>Balance: {balance?.toString()}</div>
      <div>Owner of Token 69: {ownerOf?.toString()}</div> 
      <div>Total Supply: {totalSupply?.toString()}</div> 
    </>
  )
}
```

:::