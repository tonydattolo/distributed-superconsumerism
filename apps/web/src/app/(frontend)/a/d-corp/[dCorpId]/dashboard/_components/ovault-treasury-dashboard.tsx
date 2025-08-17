"use client";

import { useState } from "react";
import { 
  Vault, 
  TrendingUp, 
  Globe2, 
  ArrowUpRight, 
  ArrowDownLeft,
  Zap,
  ExternalLink,
  Copy,
  RefreshCw,
  Sparkles,
} from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { 
  useOVaultTreasuryBalance, 
  useOVaultCrossChainDeposit, 
  useOVaultCrossChainTransfer,
  getChainName 
} from "@/lib/wagmi/ovault-hooks";

interface OVaultAddresses {
  hubChain: {
    eid: number;
    assetOFT: string;
    vault: string;
    shareAdapter: string;
    composer: string;
  };
  spokeChains: {
    [eid: number]: {
      assetOFT?: string;
      shareOFT?: string;
    };
  };
}

interface OVaultTreasuryDashboardProps {
  dCorpId: string;
  dCorpName: string;
  oVaultAddresses: OVaultAddresses;
  oVaultConfig: {
    assetName: string;
    assetSymbol: string;
    shareName: string;
    shareSymbol: string;
    targetChains: number[];
  };
}

export function OVaultTreasuryDashboard({ 
  dCorpId,
  dCorpName, 
  oVaultAddresses, 
  oVaultConfig 
}: OVaultTreasuryDashboardProps) {
  const [depositAmount, setDepositAmount] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [selectedFromChain, setSelectedFromChain] = useState<number>(oVaultAddresses.hubChain.eid);
  const [selectedToChain, setSelectedToChain] = useState<number>(oVaultConfig.targetChains[0] || 40232);

  const { 
    formattedBalance, 
    formattedShares, 
    isLoading: isLoadingBalance 
  } = useOVaultTreasuryBalance(oVaultAddresses.hubChain.vault);

  const { 
    crossChainDeposit, 
    isPending: isDepositPending 
  } = useOVaultCrossChainDeposit();

  const { 
    transferShares, 
    isPending: isTransferPending 
  } = useOVaultCrossChainTransfer();

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleDeposit = () => {
    if (!depositAmount) {
      toast.error("Please enter deposit amount");
      return;
    }

    crossChainDeposit(
      oVaultAddresses.hubChain.composer,
      selectedFromChain,
      selectedToChain,
      depositAmount,
      "0x1234567890123456789012345678901234567890" // Would use connected wallet
    );
  };

  const handleTransfer = () => {
    if (!transferAmount) {
      toast.error("Please enter transfer amount");
      return;
    }

    // Get the share OFT address for the from chain
    const fromChainAddress = selectedFromChain === oVaultAddresses.hubChain.eid 
      ? oVaultAddresses.hubChain.shareAdapter
      : oVaultAddresses.spokeChains[selectedFromChain]?.shareOFT;

    if (!fromChainAddress) {
      toast.error("Share OFT not deployed on selected chain");
      return;
    }

    transferShares(
      fromChainAddress,
      selectedFromChain,
      selectedToChain,
      transferAmount,
      "0x1234567890123456789012345678901234567890" // Would use connected wallet
    );
  };

  const availableChains = [
    { eid: oVaultAddresses.hubChain.eid, name: getChainName(oVaultAddresses.hubChain.eid), type: 'hub' },
    ...oVaultConfig.targetChains.map(eid => ({ 
      eid, 
      name: getChainName(eid), 
      type: 'spoke' as const 
    }))
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center gap-2">
              <Vault className="h-6 w-6 text-blue-500" />
              <h2 className="text-2xl font-bold">OVault Treasury</h2>
            </div>
            <Badge variant="secondary" className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
              HACKATHON
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Omnichain treasury for {dCorpName} powered by LayerZero
          </p>
        </div>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Treasury Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
            <Vault className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingBalance ? "..." : `${formattedBalance} ETH`}
            </div>
            <p className="text-xs text-muted-foreground">
              Hub chain vault balance
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Shares</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingBalance ? "..." : formattedShares}
            </div>
            <p className="text-xs text-muted-foreground">
              {oVaultConfig.shareSymbol} tokens issued
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Chains</CardTitle>
            <Globe2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {oVaultConfig.targetChains.length + 1}
            </div>
            <p className="text-xs text-muted-foreground">
              1 hub + {oVaultConfig.targetChains.length} spokes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Actions */}
      <Tabs defaultValue="deposit" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="deposit">Cross-Chain Deposit</TabsTrigger>
          <TabsTrigger value="transfer">Transfer Shares</TabsTrigger>
          <TabsTrigger value="contracts">Contract Info</TabsTrigger>
        </TabsList>

        <TabsContent value="deposit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowUpRight className="h-5 w-5" />
                Cross-Chain Deposit
              </CardTitle>
              <CardDescription>
                Deposit assets from any chain to receive vault shares
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>From Chain</Label>
                  <Select value={selectedFromChain.toString()} onValueChange={(value) => setSelectedFromChain(Number(value))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableChains.map((chain) => (
                        <SelectItem key={chain.eid} value={chain.eid.toString()}>
                          <div className="flex items-center gap-2">
                            <span>{chain.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {chain.type}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>To Chain</Label>
                  <Select value={selectedToChain.toString()} onValueChange={(value) => setSelectedToChain(Number(value))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableChains.map((chain) => (
                        <SelectItem key={chain.eid} value={chain.eid.toString()}>
                          <div className="flex items-center gap-2">
                            <span>{chain.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {chain.type}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Amount ({oVaultConfig.assetSymbol})</Label>
                <Input
                  type="number"
                  step="0.001"
                  placeholder="0.1"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  data-1p-ignore
                />
              </div>

              <Button 
                onClick={handleDeposit}
                disabled={isDepositPending}
                className="w-full"
              >
                {isDepositPending ? "Depositing..." : "Deposit Assets"}
              </Button>

              <Alert>
                <Sparkles className="h-4 w-4" />
                <AlertDescription>
                  <strong>Demo:</strong> This simulates a cross-chain deposit. Assets would be sent 
                  from the source chain and vault shares received on the destination chain.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transfer" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowDownLeft className="h-5 w-5" />
                Transfer Shares
              </CardTitle>
              <CardDescription>
                Move vault shares between chains
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>From Chain</Label>
                  <Select value={selectedFromChain.toString()} onValueChange={(value) => setSelectedFromChain(Number(value))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableChains.map((chain) => (
                        <SelectItem key={chain.eid} value={chain.eid.toString()}>
                          <div className="flex items-center gap-2">
                            <span>{chain.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {chain.type}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>To Chain</Label>
                  <Select value={selectedToChain.toString()} onValueChange={(value) => setSelectedToChain(Number(value))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableChains.map((chain) => (
                        <SelectItem key={chain.eid} value={chain.eid.toString()}>
                          <div className="flex items-center gap-2">
                            <span>{chain.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {chain.type}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Amount ({oVaultConfig.shareSymbol})</Label>
                <Input
                  type="number"
                  step="0.001"
                  placeholder="1.0"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  data-1p-ignore
                />
              </div>

              <Button 
                onClick={handleTransfer}
                disabled={isTransferPending}
                className="w-full"
              >
                {isTransferPending ? "Transferring..." : "Transfer Shares"}
              </Button>

              <Alert>
                <Sparkles className="h-4 w-4" />
                <AlertDescription>
                  <strong>Demo:</strong> This simulates cross-chain share transfers using 
                  LayerZero OFT technology.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contracts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Contract Addresses
              </CardTitle>
              <CardDescription>
                Deployed contract addresses across all chains
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Hub Chain */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  Hub Chain - {getChainName(oVaultAddresses.hubChain.eid)}
                  <Badge variant="secondary">HUB</Badge>
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-muted rounded">
                    <span className="text-sm font-medium">ERC4626 Vault</span>
                    <div className="flex items-center gap-2">
                      <code className="text-xs">{truncateAddress(oVaultAddresses.hubChain.vault)}</code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(oVaultAddresses.hubChain.vault, "Vault address")}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-muted rounded">
                    <span className="text-sm font-medium">Asset OFT</span>
                    <div className="flex items-center gap-2">
                      <code className="text-xs">{truncateAddress(oVaultAddresses.hubChain.assetOFT)}</code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(oVaultAddresses.hubChain.assetOFT, "Asset OFT address")}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-muted rounded">
                    <span className="text-sm font-medium">Share Adapter</span>
                    <div className="flex items-center gap-2">
                      <code className="text-xs">{truncateAddress(oVaultAddresses.hubChain.shareAdapter)}</code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(oVaultAddresses.hubChain.shareAdapter, "Share adapter address")}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-muted rounded">
                    <span className="text-sm font-medium">Composer</span>
                    <div className="flex items-center gap-2">
                      <code className="text-xs">{truncateAddress(oVaultAddresses.hubChain.composer)}</code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(oVaultAddresses.hubChain.composer, "Composer address")}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Spoke Chains */}
              <div>
                <h4 className="font-semibold mb-3">Spoke Chains</h4>
                <div className="space-y-4">
                  {Object.entries(oVaultAddresses.spokeChains).map(([eid, addresses]) => (
                    <div key={eid}>
                      <h5 className="text-sm font-medium mb-2 flex items-center gap-2">
                        {getChainName(Number(eid))}
                        <Badge variant="outline" className="text-xs">SPOKE</Badge>
                      </h5>
                      <div className="space-y-2">
                        {addresses.assetOFT && (
                          <div className="flex items-center justify-between p-2 bg-muted rounded">
                            <span className="text-sm">Asset OFT</span>
                            <div className="flex items-center gap-2">
                              <code className="text-xs">{truncateAddress(addresses.assetOFT)}</code>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(addresses.assetOFT!, "Asset OFT address")}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        )}
                        {addresses.shareOFT && (
                          <div className="flex items-center justify-between p-2 bg-muted rounded">
                            <span className="text-sm">Share OFT</span>
                            <div className="flex items-center gap-2">
                              <code className="text-xs">{truncateAddress(addresses.shareOFT)}</code>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(addresses.shareOFT!, "Share OFT address")}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ExternalLink className="h-5 w-5" />
                External Links
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start" asChild>
                <a href="https://docs.layerzero.network" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  LayerZero Documentation
                </a>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <a href="https://testnet.layerzeroscan.com" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  LayerZero Testnet Scanner
                </a>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}