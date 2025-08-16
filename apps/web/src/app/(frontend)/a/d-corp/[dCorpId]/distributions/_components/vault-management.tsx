"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Vault, ArrowUpCircle, ArrowDownCircle, Eye } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDepositToVault, useVaultBalance, useDistributeProfit } from "@/lib/wagmi/hooks";

const depositSchema = z.object({
  amount: z.string().min(1, "Amount required").refine(
    (val) => !isNaN(Number(val)) && Number(val) > 0,
    "Must be a positive number"
  ),
});

const distributionSchema = z.object({
  totalAmount: z.string().min(1, "Amount required").refine(
    (val) => !isNaN(Number(val)) && Number(val) > 0,
    "Must be a positive number"
  ),
  capitalAddresses: z.string().optional(),
  laborAddresses: z.string().optional(),
  consumerAddresses: z.string().optional(),
});

type DepositFormData = z.infer<typeof depositSchema>;
type DistributionFormData = z.infer<typeof distributionSchema>;

interface VaultManagementProps {
  dCorpId: string;
  vaultAddress?: string;
  distributionConfig: {
    capital: number;
    labor: number;
    consumers: number;
  };
}

export function VaultManagement({ 
  dCorpId, 
  vaultAddress, 
  distributionConfig 
}: VaultManagementProps) {
  const [showBalance, setShowBalance] = useState(false);

  // Vault balance hook
  const { balance, isLoading: balanceLoading } = useVaultBalance(vaultAddress);

  // Deposit hooks
  const {
    depositToVault,
    hash: depositHash,
    isPending: depositPending,
    isConfirming: depositConfirming,
    isConfirmed: depositConfirmed,
    error: depositError,
  } = useDepositToVault();

  // Distribution hooks
  const {
    distributeProfit,
    hash: distributionHash,
    isPending: distributionPending,
    isConfirming: distributionConfirming,
    isConfirmed: distributionConfirmed,
    error: distributionError,
  } = useDistributeProfit();

  const depositForm = useForm<DepositFormData>({
    resolver: zodResolver(depositSchema),
    defaultValues: { amount: "" },
  });

  const distributionForm = useForm<DistributionFormData>({
    resolver: zodResolver(distributionSchema),
    defaultValues: {
      totalAmount: "",
      capitalAddresses: "",
      laborAddresses: "",
      consumerAddresses: "",
    },
  });

  const onDeposit = (data: DepositFormData) => {
    depositToVault(data.amount);
  };

  const onDistribute = (data: DistributionFormData) => {
    const parseAddresses = (addressString: string): string[] => {
      return addressString
        .split('\n')
        .map(addr => addr.trim())
        .filter(addr => addr.length > 0);
    };

    const capitalAddresses = parseAddresses(data.capitalAddresses ?? "");
    const laborAddresses = parseAddresses(data.laborAddresses ?? "");
    const consumerAddresses = parseAddresses(data.consumerAddresses ?? "");

    distributeProfit(
      data.totalAmount,
      capitalAddresses,
      laborAddresses,
      consumerAddresses
    );
  };

  const formatBalance = (balance: bigint | undefined) => {
    if (!balance) return "0";
    return (Number(balance) / 1e18).toFixed(4);
  };

  return (
    <div className="space-y-6">
      {/* Vault Balance Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Vault className="h-5 w-5" />
            Treasury Vault
          </CardTitle>
          <CardDescription>
            Manage D-Corp treasury deposits and profit distributions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">Current Balance</p>
              <p className="text-2xl font-bold">
                {showBalance ? (
                  balanceLoading ? (
                    "Loading..."
                  ) : (
                    `${formatBalance(balance)} ETH`
                  )
                ) : (
                  "••••••"
                )}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowBalance(!showBalance)}
            >
              <Eye className="h-4 w-4" />
              {showBalance ? "Hide" : "Show"}
            </Button>
          </div>
          {vaultAddress && (
            <p className="text-xs text-muted-foreground mt-2 font-mono">
              Vault: {vaultAddress}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Vault Operations */}
      <Tabs defaultValue="deposit" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="deposit">Deposit</TabsTrigger>
          <TabsTrigger value="distribute">Distribute</TabsTrigger>
        </TabsList>

        {/* Deposit Tab */}
        <TabsContent value="deposit">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowUpCircle className="h-5 w-5" />
                Deposit to Vault
              </CardTitle>
              <CardDescription>
                Add funds to the D-Corp treasury vault
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...depositForm}>
                <form onSubmit={depositForm.handleSubmit(onDeposit)} className="space-y-4">
                  <FormField
                    control={depositForm.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount (ETH)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="0.1"
                            type="number"
                            step="0.001"
                            data-1p-ignore
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Deposit Transaction Status */}
                  {(depositHash ?? depositError) && (
                    <div className="p-4 border rounded-lg bg-muted/50">
                      {depositHash && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Deposit Transaction</p>
                          <p className="text-xs text-muted-foreground font-mono">
                            Hash: {depositHash}
                          </p>
                          {depositConfirming && (
                            <p className="text-sm text-yellow-600 dark:text-yellow-400">⛏️ Processing deposit...</p>
                          )}
                          {depositConfirmed && (
                            <p className="text-sm text-green-600 dark:text-green-400">✅ Deposit confirmed!</p>
                          )}
                        </div>
                      )}
                      {depositError && (
                        <div className="text-sm text-red-600 dark:text-red-400">
                          ❌ Deposit Error: {depositError.shortMessage ?? depositError.message}
                        </div>
                      )}
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={depositPending ?? depositConfirming}
                    className="w-full"
                  >
                    {depositPending 
                      ? "🔗 Sign Transaction..." 
                      : depositConfirming 
                      ? "🏦 Processing Deposit..." 
                      : "Deposit to Vault"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Distribution Tab */}
        <TabsContent value="distribute">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowDownCircle className="h-5 w-5" />
                Distribute Profits
              </CardTitle>
              <CardDescription>
                Distribute profits to stakeholders based on configured percentages
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 p-3 border rounded-lg bg-muted/50">
                <p className="text-sm font-medium">Distribution Config</p>
                <div className="flex gap-4 mt-2 text-sm">
                  <span className="text-blue-600 dark:text-blue-400">Capital: {distributionConfig.capital}%</span>
                  <span className="text-green-600 dark:text-green-400">Labor: {distributionConfig.labor}%</span>
                  <span className="text-purple-600 dark:text-purple-400">Consumer: {distributionConfig.consumers}%</span>
                </div>
              </div>

              <Form {...distributionForm}>
                <form onSubmit={distributionForm.handleSubmit(onDistribute)} className="space-y-4">
                  <FormField
                    control={distributionForm.control}
                    name="totalAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Distribution Amount (ETH)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="1.0"
                            type="number"
                            step="0.001"
                            data-1p-ignore
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={distributionForm.control}
                    name="capitalAddresses"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Capital Stakeholder Addresses (one per line)</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="0x123...&#10;0x456..."
                            className="resize-none h-20"
                            data-1p-ignore
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={distributionForm.control}
                    name="laborAddresses"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Labor Stakeholder Addresses (one per line)</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="0x789...&#10;0xabc..."
                            className="resize-none h-20"
                            data-1p-ignore
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={distributionForm.control}
                    name="consumerAddresses"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Consumer Stakeholder Addresses (one per line)</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="0xdef...&#10;0x321..."
                            className="resize-none h-20"
                            data-1p-ignore
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Distribution Transaction Status */}
                  {(distributionHash ?? distributionError) && (
                    <div className="p-4 border rounded-lg bg-muted/50">
                      {distributionHash && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Distribution Transaction</p>
                          <p className="text-xs text-muted-foreground font-mono">
                            Hash: {distributionHash}
                          </p>
                          {distributionConfirming && (
                            <p className="text-sm text-yellow-600 dark:text-yellow-400">⛏️ Processing distribution...</p>
                          )}
                          {distributionConfirmed && (
                            <p className="text-sm text-green-600 dark:text-green-400">✅ Distribution completed!</p>
                          )}
                        </div>
                      )}
                      {distributionError && (
                        <div className="text-sm text-red-600 dark:text-red-400">
                          ❌ Distribution Error: {distributionError.shortMessage ?? distributionError.message}
                        </div>
                      )}
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={distributionPending ?? distributionConfirming}
                    className="w-full"
                  >
                    {distributionPending 
                      ? "🔗 Sign Transaction..." 
                      : distributionConfirming 
                      ? "💰 Processing Distribution..." 
                      : "Distribute Profits"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}