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
  // // Get wagmi initial state from cookies for SSR
  // let initialState;
  // try {
  //   const cookieHeader = (await headers()).get("cookie");

  //   // Extract wagmi state cookie and decode it
  //   const wagmiCookie = cookieHeader
  //     ?.split(";")
  //     .find((c) => c.trim().startsWith("wagmi."))
  //     ?.split("=")[1];

  //   const decodedCookie = wagmiCookie ? decodeURIComponent(wagmiCookie) : null;
  //   initialState = cookieToInitialState(getConfig(), decodedCookie);
  // } catch (error) {
  //   // If cookie parsing fails, start with undefined state
  //   console.warn("Failed to parse wagmi cookie state:", error);
  //   initialState = undefined;
  // }

  return (
    <html lang="en" suppressHydrationWarning>
      {/* <head>
        // React Scan - visualize rerenders https://react-scan.million.dev/
        <script
          src="https://unpkg.com/react-scan/dist/auto.global.js"
          async
        ></script>
      </head> */}
      {/* <PostHogProvider> */}
      <body className={cn("min-h-screen font-sans antialiased")}>
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
      </body>
      {/* </PostHogProvider> */}
    </html>
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
