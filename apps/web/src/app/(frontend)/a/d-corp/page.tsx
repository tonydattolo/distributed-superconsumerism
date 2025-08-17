"use client";

import { useState } from "react";
import Link from "next/link";
import { useAccount } from "wagmi";
import { formatDistanceToNow } from "date-fns";
import { ArrowRight, Building2, PlusCircle, Users, Wallet } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/trpc/react";

export default function DCorpListPage() {
  const { address: walletAddress } = useAccount();

  const { data: userDCorps, isLoading } = api.dCorp.getUserDCorps.useQuery(
    { walletAddress: walletAddress! },
    { enabled: !!walletAddress }
  );

  if (!walletAddress) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <div className="text-center">
          <Building2 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-3xl font-bold mb-4">Connect Your Wallet</h1>
          <p className="text-muted-foreground mb-8">
            Please connect your Ethereum wallet to view your D-Corps.
          </p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            <Wallet className="h-4 w-4 mr-2" />
            Refresh Page
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Your D-Corps</h1>
          <p className="text-muted-foreground mt-2">
            Manage your Distributed Corporations
          </p>
        </div>
        <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
          <Link href="/a/d-corp/create">
            <PlusCircle className="h-4 w-4 mr-2" />
            Create D-Corp
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-4">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <div className="flex justify-between">
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-24" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : !userDCorps || userDCorps.length === 0 ? (
        <div className="text-center py-16">
          <Building2 className="h-16 w-16 mx-auto text-muted-foreground mb-6" />
          <h2 className="text-2xl font-semibold mb-4">No D-Corps Yet</h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            You haven't created or joined any Distributed Corporations yet. 
            Start by creating your first D-Corp to manage profit distribution and governance.
          </p>
          <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
            <Link href="/a/d-corp/create">
              <PlusCircle className="h-5 w-5 mr-2" />
              Create Your First D-Corp
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {userDCorps.map(({ dCorp, role }) => {
            const getRoleColor = (role: string) => {
              switch (role) {
                case "founder":
                  return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
                case "admin":
                  return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
                default:
                  return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
              }
            };

            const formatCurrency = (value: string | null) => {
              if (!value) return "$0.00";
              const num = parseFloat(value);
              return new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
              }).format(num);
            };

            return (
              <Card key={dCorp.id} className="group hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl">{dCorp.name}</CardTitle>
                      <CardDescription className="mt-1">
                        Symbol: {dCorp.symbol}
                      </CardDescription>
                    </div>
                    <Badge className={getRoleColor(role)} variant="secondary">
                      {role}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {dCorp.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {dCorp.description}
                    </p>
                  )}

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Treasury</p>
                      <p className="font-medium">
                        {formatCurrency(dCorp.treasuryBalance)}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Distributed</p>
                      <p className="font-medium">
                        {formatCurrency(dCorp.totalDistributed)}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center">
                      <p className="text-muted-foreground">Capital</p>
                      <p className="font-medium">{dCorp.capitalPercentage}%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-muted-foreground">Labor</p>
                      <p className="font-medium">{dCorp.laborPercentage}%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-muted-foreground">Consumer</p>
                      <p className="font-medium">{dCorp.consumerPercentage}%</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <p className="text-xs text-muted-foreground">
                      Created {formatDistanceToNow(new Date(dCorp.createdAt))} ago
                    </p>
                    <Button asChild size="sm" variant="ghost" className="group-hover:bg-primary group-hover:text-primary-foreground">
                      <Link href={`/a/d-corp/${dCorp.id}/dashboard`}>
                        View
                        <ArrowRight className="h-3 w-3 ml-1" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}