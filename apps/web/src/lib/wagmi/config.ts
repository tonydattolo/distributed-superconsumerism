import { createConfig, http, cookieStorage, createStorage } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";

export function getConfig() {
  return createConfig({
    chains: [mainnet, sepolia],
    ssr: true,
    storage: createStorage({
      storage: cookieStorage,
    }),
    transports: {
      [mainnet.id]: http(),
      [sepolia.id]: http(),
    },
  });
}
// import { createConfig, http, cookieStorage, createStorage } from "wagmi";
// import { mainnet, sepolia, optimism, arbitrum, base } from "wagmi/chains";
// import {
//   injected,
//   metaMask,
//   safe,
//   // walletConnect,
//   coinbaseWallet,
// } from "wagmi/connectors";

// // Custom anvil chain for local development
// const anvil = {
//   id: 31337,
//   name: "Anvil",
//   network: "anvil",
//   nativeCurrency: {
//     name: "Ether",
//     symbol: "ETH",
//     decimals: 18,
//   },
//   rpcUrls: {
//     default: {
//       http: ["http://127.0.0.1:8545"],
//     },
//     public: {
//       http: ["http://127.0.0.1:8545"],
//     },
//   },
// } as const;

// // WalletConnect project ID from environment
// // CENTRALIZATION CONCERN: WalletConnect requires a cloud Project ID that could be revoked
// // by a third party, potentially taking down our wallet connection service. For now, we're
// // disabling WalletConnect to avoid this dependency. This means:
// // - Mobile wallet connections (QR code scanning) won't work
// // - Users lose access to mobile wallets like MetaMask Mobile, Trust Wallet, etc.
// // - Hardware wallet connections via mobile apps are unavailable
// // - Professional traders using mobile wallet security are excluded
// // Trade-off: Better decentralization vs reduced wallet compatibility
// // Alternative: Self-host WalletConnect relay or use direct deep links in the future
// // const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID'

// // Define chains based on environment
// const chains = [
//   mainnet,
//   sepolia,
//   optimism,
//   arbitrum,
//   base,
//   ...(process.env.NODE_ENV === "development" ? [anvil] : []),
// ] as const;

// // Create wagmi configuration
// export function getConfig() {
//   return createConfig({
//     chains,
//     connectors: [
//       injected(),
//       // walletConnect({
//       //   projectId,
//       //   showQrModal: true
//       // }), // DISABLED: Avoiding centralization dependency on WalletConnect cloud
//       metaMask(),
//       coinbaseWallet({
//         appName: "D-CORP",
//         appLogoUrl: "/logo.png",
//       }),
//       safe(),
//     ],
//     ssr: true,
//     storage: createStorage({
//       storage: cookieStorage,
//     }),
//     transports: {
//       [mainnet.id]: http(),
//       [sepolia.id]: http(),
//       [optimism.id]: http(),
//       [arbitrum.id]: http(),
//       [base.id]: http(),
//       ...(process.env.NODE_ENV === "development" && {
//         [anvil.id]: http(),
//       }),
//     },
//   });
// }

// // TypeScript declaration merging for better type inference
// declare module "wagmi" {
//   interface Register {
//     config: ReturnType<typeof getConfig>;
//   }
// }

// // Note: Don't export a static config instance to prevent SSR hydration issues
// // Always use getConfig() function to create fresh instances
