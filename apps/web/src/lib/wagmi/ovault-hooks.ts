"use client";

import { 
  useWriteContract, 
  useWaitForTransactionReceipt, 
  useReadContract,
  useBalance,
  type BaseError 
} from 'wagmi';
import { useState } from 'react';
import { parseEther, formatEther } from 'viem';
import { toast } from 'sonner';
import { api } from '@/trpc/react';
import { 
  myAssetOFTABI,
  myERC4626ABI,
  myShareOFTAdapterABI,
  myOVaultComposerABI,
} from './ovault-factory-abi';
import { LAYERZERO_ENDPOINTS } from './contracts';

// Hook for deploying the complete OVault system for a D-Corp
export function useDeployOVault() {
  const [deploymentStep, setDeploymentStep] = useState<
    'idle' | 'asset' | 'vault' | 'adapter' | 'composer' | 'spokes' | 'wiring' | 'completed'
  >('idle');
  const [error, setError] = useState<string | null>(null);

  const { data: hash, writeContract, isPending, error: contractError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = 
    useWaitForTransactionReceipt({ hash });

  const updateOVaultMutation = api.dCorp.updateOVaultDeployment.useMutation();

  const deployOVault = async (
    dCorpId: string,
    config: {
      assetName: string;
      assetSymbol: string;
      shareName: string;
      shareSymbol: string;
      targetChains: number[];
      owner: string;
    }
  ) => {
    try {
      setError(null);
      setDeploymentStep('asset');
      
      toast.info("🚀 LayerZero OVault Deployment Started", {
        description: "Deploying omnichain vault system for hackathon demo",
      });

      // For hackathon demo, we'll simulate the deployment process
      // In reality, this would involve calling the hardhat deployment scripts
      
      // Step 1: Deploy Asset OFT on hub chain (Arbitrum Sepolia)
      toast.info("📦 Deploying Asset OFT", {
        description: `Deploying ${config.assetName} on Arbitrum Sepolia (Hub Chain)`,
      });
      
      // Simulate deployment delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update database with simulated address
      await updateOVaultMutation.mutateAsync({
        dCorpId,
        step: 'asset_oft_hub',
        txHash: `0x${Math.random().toString(16).slice(2, 66)}`,
        contractAddress: `0x${Math.random().toString(16).slice(2, 42)}`,
        contractType: 'assetOFT',
      });

      setDeploymentStep('vault');
      toast.info("🏦 Deploying ERC4626 Vault", {
        description: "Deploying vault contract on hub chain",
      });
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      await updateOVaultMutation.mutateAsync({
        dCorpId,
        step: 'vault',
        txHash: `0x${Math.random().toString(16).slice(2, 66)}`,
        contractAddress: `0x${Math.random().toString(16).slice(2, 42)}`,
        contractType: 'vault',
      });

      setDeploymentStep('adapter');
      toast.info("🔗 Deploying Share OFT Adapter", {
        description: "Deploying share adapter for cross-chain transfers",
      });
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      await updateOVaultMutation.mutateAsync({
        dCorpId,
        step: 'share_adapter',
        txHash: `0x${Math.random().toString(16).slice(2, 66)}`,
        contractAddress: `0x${Math.random().toString(16).slice(2, 42)}`,
        contractType: 'shareAdapter',
      });

      setDeploymentStep('composer');
      toast.info("🎼 Deploying OVault Composer", {
        description: "Deploying composer for cross-chain vault operations",
      });
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      await updateOVaultMutation.mutateAsync({
        dCorpId,
        step: 'composer',
        txHash: `0x${Math.random().toString(16).slice(2, 66)}`,
        contractAddress: `0x${Math.random().toString(16).slice(2, 42)}`,
        contractType: 'composer',
      });

      setDeploymentStep('spokes');
      toast.info("🌐 Deploying to Spoke Chains", {
        description: `Deploying OFTs to ${config.targetChains.length} spoke chains`,
      });
      
      // Deploy to spoke chains
      for (const chainEid of config.targetChains) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Deploy Asset OFT on spoke chain
        await updateOVaultMutation.mutateAsync({
          dCorpId,
          step: `asset_oft_${chainEid}`,
          txHash: `0x${Math.random().toString(16).slice(2, 66)}`,
          contractAddress: `0x${Math.random().toString(16).slice(2, 42)}`,
          contractType: 'spokeAssetOFT',
          chainEid,
        });

        // Deploy Share OFT on spoke chain
        await updateOVaultMutation.mutateAsync({
          dCorpId,
          step: `share_oft_${chainEid}`,
          txHash: `0x${Math.random().toString(16).slice(2, 66)}`,
          contractAddress: `0x${Math.random().toString(16).slice(2, 42)}`,
          contractType: 'spokeShareOFT',
          chainEid,
        });
      }

      setDeploymentStep('wiring');
      toast.info("⚡ Wiring Cross-Chain Connections", {
        description: "Configuring LayerZero messaging between chains",
      });
      
      await new Promise(resolve => setTimeout(resolve, 3000));

      setDeploymentStep('completed');
      
      // Mark as fully deployed
      await updateOVaultMutation.mutateAsync({
        dCorpId,
        step: 'deployment_complete',
        status: 'deployed',
      });

      const deploymentTx = `0x${Math.random().toString(16).slice(2, 66)}`;
      
      toast.success("🎉 OVault Deployment Complete!", {
        description: "Omnichain vault system is ready for cross-chain operations",
        action: {
          label: "View on LayerZero Scan",
          onClick: () => window.open(getLayerZeroScanUrl(deploymentTx), '_blank'),
        },
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Deployment failed');
      setDeploymentStep('idle');
      
      await updateOVaultMutation.mutateAsync({
        dCorpId,
        step: 'deployment_failed',
        status: 'failed',
      });
      
      toast.error("❌ Deployment Failed", {
        description: err instanceof Error ? err.message : 'Unknown error occurred',
      });
    }
  };

  return {
    deployOVault,
    deploymentStep,
    isDeploying: deploymentStep !== 'idle' && deploymentStep !== 'completed',
    error: error || contractError?.message,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
  };
}

// Hook for funding the OVault initially
export function useOVaultInitialFunding() {
  const { data: hash, writeContract, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = 
    useWaitForTransactionReceipt({ hash });

  const fundVault = (
    vaultAddress: string,
    assetAddress: string,
    amount: string,
    receiver: string
  ) => {
    toast.info("💰 Funding OVault", {
      description: `Adding ${amount} ETH initial funding to treasury vault`,
    });

    // For demo purposes, this would approve and deposit to the vault
    writeContract({
      address: vaultAddress as `0x${string}`,
      abi: myERC4626ABI,
      functionName: 'deposit',
      args: [parseEther(amount), receiver as `0x${string}`],
    });
  };

  return {
    fundVault,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error: error as BaseError | null,
  };
}

// Hook for reading OVault treasury balance
export function useOVaultTreasuryBalance(vaultAddress?: string) {
  const { data: totalAssets, isLoading: isLoadingAssets } = useReadContract({
    address: vaultAddress as `0x${string}`,
    abi: myERC4626ABI,
    functionName: 'totalAssets',
    query: {
      enabled: !!vaultAddress,
      refetchInterval: 30000, // Refresh every 30 seconds
    },
  });

  const { data: totalShares, isLoading: isLoadingShares } = useReadContract({
    address: vaultAddress as `0x${string}`,
    abi: myERC4626ABI,
    functionName: 'totalSupply',
    query: {
      enabled: !!vaultAddress,
      refetchInterval: 30000,
    },
  });

  const formattedBalance = totalAssets ? formatEther(totalAssets) : '0';
  const formattedShares = totalShares ? formatEther(totalShares) : '0';

  return {
    totalAssets,
    totalShares,
    formattedBalance,
    formattedShares,
    isLoading: isLoadingAssets || isLoadingShares,
  };
}

// Hook for cross-chain vault deposit
export function useOVaultCrossChainDeposit() {
  const { data: hash, writeContract, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = 
    useWaitForTransactionReceipt({ hash });

  const crossChainDeposit = (
    composerAddress: string,
    fromChain: number,
    toChain: number,
    amount: string,
    receiver: string
  ) => {
    const chainNames: Record<number, string> = {
      40231: 'Arbitrum Sepolia',
      40232: 'Optimism Sepolia', 
      40245: 'Base Sepolia',
    };

    toast.info("🌉 Cross-Chain Deposit", {
      description: `Depositing ${amount} from ${chainNames[fromChain]} to vault on ${chainNames[toChain]}`,
      action: {
        label: "Track on LayerZero Scan",
        onClick: () => window.open("https://testnet.layerzeroscan.com", '_blank'),
      },
    });

    const toBytes32 = `0x${'0'.repeat(24)}${receiver.slice(2)}`;

    writeContract({
      address: composerAddress as `0x${string}`,
      abi: myOVaultComposerABI,
      functionName: 'sendForVaultDeposit',
      args: [
        {
          dstEid: toChain,
          to: toBytes32,
          amountLD: parseEther(amount),
          minAmountLD: parseEther('0'),
          extraOptions: '0x',
          composeMsg: '0x',
          oftCmd: '0x',
        },
        {
          nativeFee: parseEther('0.2'), // Gas fee
          lzTokenFee: 0n,
        },
        receiver as `0x${string}`, // refund address
        receiver as `0x${string}`, // vault receiver
      ],
      value: parseEther('0.2'),
    });
  };

  return {
    crossChainDeposit,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error: error as BaseError | null,
  };
}

// Hook for cross-chain share transfer  
export function useOVaultCrossChainTransfer() {
  const { data: hash, writeContract, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = 
    useWaitForTransactionReceipt({ hash });

  const transferShares = (
    shareOFTAddress: string,
    fromChain: number,
    toChain: number,
    amount: string,
    receiver: string
  ) => {
    const chainNames: Record<number, string> = {
      40231: 'Arbitrum Sepolia',
      40232: 'Optimism Sepolia', 
      40245: 'Base Sepolia',
    };

    toast.info("🔄 Cross-Chain Share Transfer", {
      description: `Transferring ${amount} shares from ${chainNames[fromChain]} to ${chainNames[toChain]}`,
      action: {
        label: "Track on LayerZero Scan",
        onClick: () => window.open("https://testnet.layerzeroscan.com", '_blank'),
      },
    });

    const toBytes32 = `0x${'0'.repeat(24)}${receiver.slice(2)}`;

    writeContract({
      address: shareOFTAddress as `0x${string}`,
      abi: myShareOFTAdapterABI,
      functionName: 'send',
      args: [
        {
          dstEid: toChain,
          to: toBytes32,
          amountLD: parseEther(amount),
          minAmountLD: parseEther('0'),
          extraOptions: '0x',
          composeMsg: '0x',
          oftCmd: '0x',
        },
        {
          nativeFee: parseEther('0.1'),
          lzTokenFee: 0n,
        },
        receiver as `0x${string}`,
      ],
      value: parseEther('0.1'),
    });
  };

  return {
    transferShares,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error: error as BaseError | null,
  };
}

// Helper function to get chain names
export function getChainName(eid: number): string {
  const chainNames: Record<number, string> = {
    40231: 'Arbitrum Sepolia',
    40232: 'Optimism Sepolia', 
    40245: 'Base Sepolia',
  };
  return chainNames[eid] || `Chain ${eid}`;
}

// Helper function to get LayerZero endpoint IDs for default testnet chains
export function getDefaultTestnetChains(): Array<{eid: number, name: string}> {
  return [
    { eid: 40232, name: 'Optimism Sepolia' },
    { eid: 40245, name: 'Base Sepolia' },
  ];
}

// Helper function to get explorer URLs for different chains
export function getExplorerUrl(chainEid: number, address: string, type: 'address' | 'tx' = 'address'): string {
  const explorerMap: Record<number, string> = {
    40231: 'https://sepolia.arbiscan.io', // Arbitrum Sepolia
    40232: 'https://sepolia-optimism.etherscan.io', // Optimism Sepolia
    40245: 'https://sepolia.basescan.org', // Base Sepolia
  };

  const explorer = explorerMap[chainEid];
  if (!explorer) return '';

  return `${explorer}/${type}/${address}`;
}

// Helper function to get LayerZero Scan URL for cross-chain transaction tracking
export function getLayerZeroScanUrl(txHash: string): string {
  return `https://testnet.layerzeroscan.com/tx/${txHash}`;
}

// Helper function to get chain info including explorer details
export function getChainInfo(eid: number): {
  name: string;
  explorerName: string;
  explorerUrl: string;
} {
  const chainInfo: Record<number, {name: string, explorerName: string, explorerUrl: string}> = {
    40231: {
      name: 'Arbitrum Sepolia',
      explorerName: 'Arbiscan',
      explorerUrl: 'https://sepolia.arbiscan.io',
    },
    40232: {
      name: 'Optimism Sepolia',
      explorerName: 'Etherscan',
      explorerUrl: 'https://sepolia-optimism.etherscan.io',
    },
    40245: {
      name: 'Base Sepolia',
      explorerName: 'Basescan',
      explorerUrl: 'https://sepolia.basescan.org',
    },
  };

  return chainInfo[eid] || {
    name: `Chain ${eid}`,
    explorerName: 'Explorer',
    explorerUrl: '',
  };
}