"use client";

import { useState, type ReactNode } from "react";
import { WagmiProvider, type State } from "wagmi";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { TRPCReactProvider } from "@/trpc/react";

import { getConfig } from "@/lib/wagmi/config";

type Props = {
  children: ReactNode;
  initialState: State | undefined;
};

export function Providers({ children, initialState }: Props) {
  const [config] = useState(() => getConfig());
  return (
    <WagmiProvider config={config} initialState={initialState}>
      <TRPCReactProvider>
        <RainbowKitProvider>{children}</RainbowKitProvider>
      </TRPCReactProvider>
    </WagmiProvider>
  );
}
