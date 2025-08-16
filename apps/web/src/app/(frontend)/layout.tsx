import "@/styles/globals.css";
import "@rainbow-me/rainbowkit/styles.css";

import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { headers } from "next/headers";
import { cookieToInitialState } from "wagmi";

import { Providers } from "./providers";
import { getConfig } from "@/lib/wagmi/config";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "../_components/app-sidebar";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const initialState = cookieToInitialState(
    getConfig(),
    (await headers()).get("cookie"),
  );

  return (
    <TooltipProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <Providers initialState={initialState}>
          <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
              <div className="relative flex h-full flex-1 flex-col">
                <StickyHeader />
                {children}
              </div>
            </SidebarInset>
          </SidebarProvider>
        </Providers>
        <Toaster richColors />
      </ThemeProvider>
    </TooltipProvider>
  );
}

const StickyHeader = () => {
  return (
    <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur">
      <div className="flex h-14 items-center justify-between px-2">
        <div className="flex items-center space-x-4">
          <SidebarTrigger />
        </div>
        <div className="flex items-center space-x-4">
          <ConnectButton />
        </div>
      </div>
    </header>
  );
};
