"use client";

import { use } from "react";
import { api } from "@/trpc/react";
import { DashboardOverview } from "./_components/dashboard-overview";
import { OVaultSetupWizard } from "./_components/ovault-setup-wizard";
import { OVaultTreasuryDashboard } from "./_components/ovault-treasury-dashboard";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface DashboardPageProps {
  params: Promise<{
    dCorpId: string;
  }>;
}

export default function DashboardPage({ params }: DashboardPageProps) {
  const { dCorpId } = use(params);

  const { data: dashboardData, isLoading, error, refetch } = api.dCorp.getDashboardData.useQuery(
    { dCorpId },
    { 
      enabled: !!dCorpId,
      refetchInterval: 30000, // Refresh every 30 seconds
    }
  );

  const { data: oVaultStatus, isLoading: isLoadingOVault } = api.dCorp.getOVaultStatus.useQuery(
    { dCorpId },
    { 
      enabled: !!dCorpId,
      refetchInterval: 10000, // Check OVault status more frequently
    }
  );

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-16" />
            </div>
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        {/* Metrics Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-4" />
                </div>
                <Skeleton className="h-8 w-24 mb-1" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Distribution Config Skeleton */}
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-64 mb-4" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="text-center p-4 bg-muted rounded-lg">
                  <Skeleton className="h-8 w-12 mx-auto mb-2" />
                  <Skeleton className="h-4 w-24 mx-auto mb-1" />
                  <Skeleton className="h-3 w-20 mx-auto" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Bottom Cards Skeleton */}
        <div className="grid md:grid-cols-2 gap-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Skeleton className="h-5 w-5" />
                  <Skeleton className="h-6 w-32" />
                </div>
                <Skeleton className="h-4 w-48 mb-4" />
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, j) => (
                    <Skeleton key={j} className="h-12 w-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load dashboard data: {error.message}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            D-Corp not found or you don't have access to this dashboard.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Show OVault setup wizard if OVault is not deployed
  if (oVaultStatus?.oVaultStatus === "not_deployed") {
    return (
      <div className="container mx-auto py-8 px-4">
        <OVaultSetupWizard
          dCorpId={dCorpId}
          dCorpName={dashboardData.dCorp.name}
          dCorpSymbol={dashboardData.dCorp.symbol}
          onComplete={() => {
            refetch();
          }}
        />
      </div>
    );
  }

  // Show OVault treasury dashboard if deployed
  if (oVaultStatus?.oVaultStatus === "deployed" && oVaultStatus?.oVaultAddresses && oVaultStatus?.oVaultConfig) {
    return (
      <div className="container mx-auto py-8 px-4 space-y-8">
        {/* OVault Treasury Section */}
        <OVaultTreasuryDashboard
          dCorpId={dCorpId}
          dCorpName={dashboardData.dCorp.name}
          oVaultAddresses={oVaultStatus.oVaultAddresses}
          oVaultConfig={oVaultStatus.oVaultConfig}
        />
        
        {/* Traditional Dashboard */}
        <DashboardOverview
          dCorp={dashboardData.dCorp}
          metrics={dashboardData.metrics}
          recentDistributions={dashboardData.recentDistributions}
          onDataRefresh={() => refetch()}
        />
      </div>
    );
  }

  // Show deployment status if in progress
  if (oVaultStatus?.oVaultStatus === "deploying") {
    return (
      <div className="container mx-auto py-8 px-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            OVault deployment is in progress. Please wait while the omnichain vault system is being deployed.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Fallback to traditional dashboard
  return (
    <div className="container mx-auto py-8 px-4">
      <DashboardOverview
        dCorp={dashboardData.dCorp}
        metrics={dashboardData.metrics}
        recentDistributions={dashboardData.recentDistributions}
        onDataRefresh={() => refetch()}
      />
    </div>
  );
}