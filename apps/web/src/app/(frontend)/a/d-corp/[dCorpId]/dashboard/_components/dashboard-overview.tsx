"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  DollarSign, 
  Users, 
  Clock, 
  TrendingUp, 
  Calendar,
  ArrowUpRight,
  FileText,
  AlertCircle
} from "lucide-react";
import { type DCorp, type Distribution } from "@/server/db/schema";
import { TreasuryManagement } from "./treasury-management";

interface DashboardOverviewProps {
  dCorp: DCorp;
  metrics: {
    treasuryBalance: string;
    totalDistributed: string;
    memberCount: number;
  };
  recentDistributions: Distribution[];
  onDataRefresh?: () => void;
}

export function DashboardOverview({ dCorp, metrics, recentDistributions, onDataRefresh }: DashboardOverviewProps) {
  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(parseFloat(amount));
  };

  const getNextQuarter = () => {
    const now = new Date();
    const currentQuarter = Math.floor(now.getMonth() / 3) + 1;
    const nextQuarter = currentQuarter === 4 ? 1 : currentQuarter + 1;
    const nextYear = currentQuarter === 4 ? now.getFullYear() + 1 : now.getFullYear();
    return `${nextYear}-Q${nextQuarter}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{dCorp.name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="secondary">{dCorp.symbol}</Badge>
            <Badge variant={dCorp.isActive ? "default" : "secondary"}>
              {dCorp.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
        </div>
        <Button>
          <ArrowUpRight className="w-4 h-4 mr-2" />
          View Public Profile
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Treasury Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.treasuryBalance)}</div>
            <p className="text-xs text-muted-foreground">
              Available for distribution
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Distributed</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.totalDistributed)}</div>
            <p className="text-xs text-muted-foreground">
              Lifetime distributions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.memberCount}</div>
            <p className="text-xs text-muted-foreground">
              Active stakeholders
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Distribution Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Profit Distribution Configuration</CardTitle>
          <CardDescription>
            Locked distribution percentages for your D-Corp
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{dCorp.capitalPercentage}%</div>
              <div className="text-sm text-blue-600 dark:text-blue-400">Capital Providers</div>
              <div className="text-xs text-muted-foreground mt-1">
                Investors & shareholders
              </div>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
              <div className="text-2xl font-bold text-green-700 dark:text-green-300">{dCorp.laborPercentage}%</div>
              <div className="text-sm text-green-600 dark:text-green-400">Labor Contributors</div>
              <div className="text-xs text-muted-foreground mt-1">
                Workers & contributors
              </div>
            </div>
            <div className="text-center p-4 bg-amber-50 dark:bg-amber-950 rounded-lg">
              <div className="text-2xl font-bold text-amber-700 dark:text-amber-300">{dCorp.consumerPercentage}%</div>
              <div className="text-sm text-amber-600 dark:text-amber-400">Consumers</div>
              <div className="text-xs text-muted-foreground mt-1">
                Customers & users
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Treasury Management */}
        <TreasuryManagement 
          dCorp={dCorp} 
          onTreasuryUpdate={() => onDataRefresh?.()} 
        />

        {/* Pending Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Pending Actions
            </CardTitle>
            <CardDescription>
              Items requiring your attention
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {parseFloat(metrics.treasuryBalance) > 1000 && (
              <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                <div>
                  <p className="font-medium text-blue-800 dark:text-blue-200">Create Distribution</p>
                  <p className="text-sm text-blue-600 dark:text-blue-400">
                    Treasury balance ready for distribution
                  </p>
                </div>
                <Button size="sm" variant="outline">
                  Distribute
                </Button>
              </div>
            )}

            {metrics.memberCount < 5 && (
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                <div>
                  <p className="font-medium text-green-800 dark:text-green-200">Invite Members</p>
                  <p className="text-sm text-green-600 dark:text-green-400">
                    Expand your D-Corp stakeholder base
                  </p>
                </div>
                <Button size="sm" variant="outline">
                  Invite
                </Button>
              </div>
            )}

            {parseFloat(metrics.treasuryBalance) === 0 && (
              <div className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-950 rounded-lg border border-amber-200 dark:border-amber-800">
                <div>
                  <p className="font-medium text-amber-800 dark:text-amber-200">Fund Treasury</p>
                  <p className="text-sm text-amber-600 dark:text-amber-400">
                    Add funds to enable distributions
                  </p>
                </div>
                <Button size="sm" variant="outline">
                  Add Funds
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Latest updates and changes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentDistributions.length > 0 ? (
              recentDistributions.slice(0, 3).map((distribution) => (
                <div key={distribution.id} className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      Distribution processed for {distribution.quarter}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(distribution.totalAmount)} distributed
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {distribution.status}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="text-center py-4">
                <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  No recent activity
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}