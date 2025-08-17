"use client";

import { 
  Activity, 
  ExternalLink, 
  Copy, 
  Clock,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { 
  getExplorerUrl, 
  getLayerZeroScanUrl, 
  getChainInfo 
} from "@/lib/wagmi/ovault-hooks";

interface TransactionStep {
  step: string;
  txHash: string;
  chainEid?: number;
  status: 'pending' | 'confirmed' | 'failed';
  timestamp?: Date;
  description: string;
}

interface OVaultTransactionTrackerProps {
  dCorpId: string;
  txHashes?: Record<string, string>;
  deploymentStatus: string;
}

export function OVaultTransactionTracker({ 
  dCorpId, 
  txHashes = {}, 
  deploymentStatus 
}: OVaultTransactionTrackerProps) {
  
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const truncateHash = (hash: string) => {
    return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
  };

  // Mock transaction steps for demo
  const transactionSteps: TransactionStep[] = [
    {
      step: 'asset_oft_hub',
      txHash: txHashes.asset_oft_hub || '0xa02efd16c29895ceead23e315ab8a00a55d44baa27879c5243cc25c7eb998a1b',
      chainEid: 40231, // Arbitrum Sepolia
      status: 'confirmed',
      timestamp: new Date(Date.now() - 300000), // 5 minutes ago
      description: 'Deploy Asset OFT on Hub Chain',
    },
    {
      step: 'vault',
      txHash: txHashes.vault || '0xb13f26c30996cea3dd42e3c5247899e54d1b5ac8a76d3f2d8c4e9f6a7b8c9d0e',
      chainEid: 40231,
      status: 'confirmed',
      timestamp: new Date(Date.now() - 240000), // 4 minutes ago
      description: 'Deploy ERC4626 Vault Contract',
    },
    {
      step: 'share_adapter',
      txHash: txHashes.share_adapter || '0xc24g37d41a07dfb4ee53f4d6358a00f65e2c6bd9b87e4g3e9d5f0a8c0d1f2e3g',
      chainEid: 40231,
      status: 'confirmed',
      timestamp: new Date(Date.now() - 180000), // 3 minutes ago
      description: 'Deploy Share OFT Adapter',
    },
    {
      step: 'composer',
      txHash: txHashes.composer || '0xd35h48e52b18efc5ff64g5e7469b11g76f3d7cea98f5h4f0ae6g1b9d2e4f3g4h',
      chainEid: 40231,
      status: 'confirmed',
      timestamp: new Date(Date.now() - 120000), // 2 minutes ago
      description: 'Deploy OVault Composer',
    },
    {
      step: 'asset_oft_40232',
      txHash: txHashes.asset_oft_40232 || '0xe46i59f63c29fgd6gg75h6f8570c22h87g4e8dfba0g6i5g1bf7h2c0e3f5g4h5i',
      chainEid: 40232, // Optimism Sepolia
      status: 'confirmed',
      timestamp: new Date(Date.now() - 90000), // 1.5 minutes ago
      description: 'Deploy Asset OFT on Optimism Sepolia',
    },
    {
      step: 'share_oft_40232',
      txHash: txHashes.share_oft_40232 || '0xf57j60g74d30ghe7hh86i7g9681d33i98h5f9egcb1h7j6h2cg8i3d1f4g6h5i6j',
      chainEid: 40232,
      status: 'confirmed',
      timestamp: new Date(Date.now() - 60000), // 1 minute ago
      description: 'Deploy Share OFT on Optimism Sepolia',
    },
    {
      step: 'asset_oft_40245',
      txHash: txHashes.asset_oft_40245 || '0xg68k71h85e41hif8ii97j8h0792e44j09i6g0fhdc2i8k7i3dh9j4e2g5h7i6j7k',
      chainEid: 40245, // Base Sepolia
      status: 'confirmed',
      timestamp: new Date(Date.now() - 45000), // 45 seconds ago
      description: 'Deploy Asset OFT on Base Sepolia',
    },
    {
      step: 'share_oft_40245',
      txHash: txHashes.share_oft_40245 || '0xh79l82i96f52ijg9jj08k9i1803f55k10j7h1gied3j9l8j4ei0k5f3h6i8j7k8l',
      chainEid: 40245,
      status: deploymentStatus === 'deployed' ? 'confirmed' : 'pending',
      timestamp: deploymentStatus === 'deployed' ? new Date(Date.now() - 30000) : undefined, // 30 seconds ago
      description: 'Deploy Share OFT on Base Sepolia',
    },
  ];

  const getStatusIcon = (status: TransactionStep['status']) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'failed':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusColor = (status: TransactionStep['status']) => {
    switch (status) {
      case 'confirmed':
        return 'text-green-600 bg-green-50 dark:bg-green-950 dark:text-green-400';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-950 dark:text-yellow-400';
      case 'failed':
        return 'text-red-600 bg-red-50 dark:bg-red-950 dark:text-red-400';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Transaction History
        </CardTitle>
        <CardDescription>
          Track all deployment transactions across chains
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {transactionSteps.map((step, index) => {
            const chainInfo = step.chainEid ? getChainInfo(step.chainEid) : null;
            
            return (
              <div key={step.step} className="relative">
                {index < transactionSteps.length - 1 && (
                  <div className="absolute left-5 top-8 bottom-0 w-0.5 bg-border" />
                )}
                
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border bg-background">
                    {getStatusIcon(step.status)}
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{step.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {chainInfo && (
                            <Badge variant="outline" className="text-xs">
                              {chainInfo.name}
                            </Badge>
                          )}
                          <Badge variant="outline" className={`text-xs ${getStatusColor(step.status)}`}>
                            {step.status}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(step.txHash, "Transaction hash")}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        
                        {step.chainEid && (
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                          >
                            <a
                              href={getExplorerUrl(step.chainEid, step.txHash, 'tx')}
                              target="_blank"
                              rel="noopener noreferrer"
                              title={`View on ${chainInfo?.explorerName}`}
                            >
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </Button>
                        )}
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                        >
                          <a
                            href={getLayerZeroScanUrl(step.txHash)}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="View on LayerZero Scan"
                          >
                            <Activity className="h-3 w-3" />
                          </a>
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <code className="bg-muted px-2 py-1 rounded">
                        {truncateHash(step.txHash)}
                      </code>
                      {step.timestamp && (
                        <span>
                          {step.timestamp.toLocaleTimeString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {deploymentStatus === 'deployed' && (
          <>
            <Separator />
            <div className="text-center">
              <Button variant="outline" className="w-full" asChild>
                <a
                  href="https://testnet.layerzeroscan.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Activity className="h-4 w-4 mr-2" />
                  View All Transactions on LayerZero Scan
                </a>
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}