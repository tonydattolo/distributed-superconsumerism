"use client";

import { use } from "react";
import { api } from "@/trpc/react";
import { DistributionForm } from "./_components/distribution-form";
import { DistributionHistory } from "./_components/distribution-history";
import { VaultManagement } from "./_components/vault-management";
import { AirdropForm } from "./_components/airdrop-form";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface DistributionsPageProps {
  params: Promise<{
    dCorpId: string;
  }>;
}

export default function DistributionsPage({ params }: DistributionsPageProps) {
  const { dCorpId } = use(params);

  const { data: dCorp, isLoading: dCorpLoading } = api.dCorp.getById.useQuery(
    { dCorpId },
    { enabled: !!dCorpId }
  );

  const { 
    data: distributions, 
    isLoading: distributionsLoading, 
    refetch: refetchDistributions 
  } = api.dCorp.getDistributions.useQuery(
    { dCorpId },
    { enabled: !!dCorpId }
  );

  const isLoading = dCorpLoading || distributionsLoading;

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center gap-4 mb-6">
          <Skeleton className="h-10 w-10" />
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>

        {/* Form Skeleton */}
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <Skeleton className="h-6 w-32" />
              <div className="grid md:grid-cols-2 gap-4">
                <Skeleton className="h-20" />
                <Skeleton className="h-20" />
              </div>
              <Skeleton className="h-24" />
              <Skeleton className="h-10 w-32 ml-auto" />
            </div>
          </CardContent>
        </Card>

        {/* History Skeleton */}
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!dCorp) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            D-Corp not found or you don't have access to this page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/a/d-corp/${dCorpId}/dashboard`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Distributions</h1>
          <p className="text-muted-foreground">
            Manage profit distributions for {dCorp.name}
          </p>
        </div>
      </div>

      {/* Vault Management with Blockchain Integration */}
      <VaultManagement
        dCorpId={dCorpId}
        vaultAddress={dCorp.vaultAddress}
        distributionConfig={dCorp.distributionConfig}
      />

      {/* Token Airdrop */}
      <AirdropForm />

      {/* Traditional Distribution Form */}
      <DistributionForm 
        dCorp={dCorp} 
        onSuccess={() => refetchDistributions()}
      />

      {/* Distribution History */}
      {distributions && (
        <DistributionHistory distributions={distributions} />
      )}
    </div>
  );
}