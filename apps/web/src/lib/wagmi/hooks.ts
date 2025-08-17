"use client";

import { 
  useWriteContract, 
  useWaitForTransactionReceipt, 
  useReadContract,
  useDeployContract,
  type BaseError 
} from 'wagmi';
import { useState, useEffect as React_useEffect } from 'react';
import { parseEther } from 'viem';
import { toast } from 'sonner';
import { 
  dCorpFactoryConfig, 
  dCorpTokenConfig, 
  dCorpVaultConfig,
  oVaultAssetOFTConfig,
  oVaultERC4626Config,
  oVaultComposerConfig,
  oVaultShareAdapterConfig,
  oVaultAssetOFTABI,
  oVaultERC4626ABI,
  oVaultComposerABI,
  oVaultShareOFTABI,
} from './contracts';
import { 
  myAssetOFTABI,
  myERC4626ABI,
  myShareOFTAdapterABI,
  myOVaultComposerABI,
} from './ovault-factory-abi';
import { LAYERZERO_ENDPOINTS } from './contracts';

// Hook for creating a new D-Corp
export function useCreateDCorp() {
  const { data: hash, writeContract, isPending, error } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = 
    useWaitForTransactionReceipt({ hash });

  const createDCorp = (
    name: string,
    symbol: string,
    capitalShare: number,
    laborShare: number,
    consumerShare: number
  ) => {
    // Simulate blockchain interaction with placeholder toast
    toast.info("🔗 Blockchain Transaction", {
      description: `Creating D-Corp "${name}" with ${capitalShare}% capital, ${laborShare}% labor, ${consumerShare}% consumer distribution`,
    });

    writeContract({
      ...dCorpFactoryConfig,
      functionName: 'createDCorp',
      args: [
        name,
        symbol,
        BigInt(capitalShare),
        BigInt(laborShare),
        BigInt(consumerShare),
      ],
    });
  };

  return {
    createDCorp,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error: error as BaseError | null,
  };
}

// Hook for minting tokens to addresses
export function useMintTokens() {
  const { data: hash, writeContract, isPending, error } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = 
    useWaitForTransactionReceipt({ hash });

  const mintTokens = (
    to: string,
    amount: string,
    stakeholderType: 0 | 1 | 2 // 0=capital, 1=labor, 2=consumer
  ) => {
    const typeLabels = ['Capital', 'Labor', 'Consumer'];
    toast.info("🪙 Token Minting", {
      description: `Minting ${amount} tokens to ${to} as ${typeLabels[stakeholderType]} stakeholder`,
    });

    writeContract({
      ...dCorpTokenConfig,
      functionName: 'mint',
      args: [
        to as `0x${string}`,
        parseEther(amount),
        stakeholderType,
      ],
    });
  };

  return {
    mintTokens,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error: error as BaseError | null,
  };
}

// Hook for airdropping tokens to multiple addresses
export function useAirdropTokens() {
  const { data: hash, writeContract, isPending, error } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = 
    useWaitForTransactionReceipt({ hash });

  const airdropTokens = (
    recipients: string[],
    amounts: string[],
    stakeholderType: 0 | 1 | 2
  ) => {
    const typeLabels = ['Capital', 'Labor', 'Consumer'];
    toast.info("🪂 Token Airdrop", {
      description: `Airdropping tokens to ${recipients.length} ${typeLabels[stakeholderType]} addresses`,
    });

    writeContract({
      ...dCorpTokenConfig,
      functionName: 'airdropToAddresses',
      args: [
        recipients as `0x${string}`[],
        amounts.map(amount => parseEther(amount)),
        stakeholderType,
      ],
    });
  };

  return {
    airdropTokens,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error: error as BaseError | null,
  };
}

// Hook for depositing to vault
export function useDepositToVault() {
  const { data: hash, writeContract, isPending, error } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = 
    useWaitForTransactionReceipt({ hash });

  const depositToVault = (amount: string) => {
    toast.info("🏦 Vault Deposit", {
      description: `Depositing ${amount} ETH to D-Corp treasury vault`,
    });

    writeContract({
      ...dCorpVaultConfig,
      functionName: 'deposit',
      value: parseEther(amount),
    });
  };

  return {
    depositToVault,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error: error as BaseError | null,
  };
}

// Hook for distributing profits
export function useDistributeProfit() {
  const { data: hash, writeContract, isPending, error } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = 
    useWaitForTransactionReceipt({ hash });

  const distributeProfit = (
    totalAmount: string,
    capitalRecipients: string[],
    laborRecipients: string[],
    consumerRecipients: string[]
  ) => {
    toast.info("💰 Profit Distribution", {
      description: `Distributing ${totalAmount} ETH to ${capitalRecipients.length + laborRecipients.length + consumerRecipients.length} stakeholders`,
    });

    writeContract({
      ...dCorpVaultConfig,
      functionName: 'distributeProfit',
      args: [
        parseEther(totalAmount),
        capitalRecipients as `0x${string}`[],
        laborRecipients as `0x${string}`[],
        consumerRecipients as `0x${string}`[],
      ],
    });
  };

  return {
    distributeProfit,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error: error as BaseError | null,
  };
}

// Hook for reading vault balance
export function useVaultBalance(vaultAddress?: string) {
  const { data: balance, isLoading, error } = useReadContract({
    ...dCorpVaultConfig,
    functionName: 'getBalance',
    address: vaultAddress as `0x${string}` || dCorpVaultConfig.address,
    query: {
      enabled: !!vaultAddress,
    },
  });

  return {
    balance,
    isLoading,
    error: error as BaseError | null,
  };
}

// Hook for reading token balance
export function useTokenBalance(address?: string, tokenAddress?: string) {
  const { data: balance, isLoading, error } = useReadContract({
    ...dCorpTokenConfig,
    functionName: 'balanceOf',
    address: tokenAddress as `0x${string}` || dCorpTokenConfig.address,
    args: address ? [address as `0x${string}`] : undefined,
    query: {
      enabled: !!address,
    },
  });

  return {
    balance,
    isLoading,
    error: error as BaseError | null,
  };
}

// OVAULT HOOKS - LayerZero Cross-Chain Vault Operations

// Hook for sending assets cross-chain through OFT
export function useOVaultSendAssets() {
  const { data: hash, writeContract, isPending, error } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = 
    useWaitForTransactionReceipt({ hash });

  const sendAssets = (
    contractAddress: string,
    dstEid: number,
    to: string,
    amountLD: string,
    minAmountLD: string = "0",
    composeMsg: string = "0x",
    extraOptions: string = "0x",
    nativeFee: string = "0.1" // ETH for gas
  ) => {
    toast.info("🌉 Cross-Chain Asset Transfer", {
      description: `Sending ${amountLD} assets to chain ${dstEid}`,
    });

    // Convert address to bytes32 for LayerZero
    const toBytes32 = `0x${'0'.repeat(24)}${to.slice(2)}`;

    writeContract({
      address: contractAddress as `0x${string}`,
      abi: oVaultAssetOFTABI,
      functionName: 'send',
      args: [
        {
          dstEid,
          to: toBytes32,
          amountLD: parseEther(amountLD),
          minAmountLD: parseEther(minAmountLD),
          extraOptions,
          composeMsg,
          oftCmd: "0x",
        },
        {
          nativeFee: parseEther(nativeFee),
          lzTokenFee: 0n,
        },
        to as `0x${string}`, // refund address
      ],
      value: parseEther(nativeFee),
    });
  };

  return {
    sendAssets,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error: error as BaseError | null,
  };
}

// Hook for sending shares cross-chain through OFT
export function useOVaultSendShares() {
  const { data: hash, writeContract, isPending, error } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = 
    useWaitForTransactionReceipt({ hash });

  const sendShares = (
    contractAddress: string,
    dstEid: number,
    to: string,
    amountLD: string,
    minAmountLD: string = "0",
    composeMsg: string = "0x",
    extraOptions: string = "0x",
    nativeFee: string = "0.1"
  ) => {
    toast.info("🌉 Cross-Chain Share Transfer", {
      description: `Sending ${amountLD} shares to chain ${dstEid}`,
    });

    const toBytes32 = `0x${'0'.repeat(24)}${to.slice(2)}`;

    writeContract({
      address: contractAddress as `0x${string}`,
      abi: oVaultShareOFTABI,
      functionName: 'send',
      args: [
        {
          dstEid,
          to: toBytes32,
          amountLD: parseEther(amountLD),
          minAmountLD: parseEther(minAmountLD),
          extraOptions,
          composeMsg,
          oftCmd: "0x",
        },
        {
          nativeFee: parseEther(nativeFee),
          lzTokenFee: 0n,
        },
        to as `0x${string}`,
      ],
      value: parseEther(nativeFee),
    });
  };

  return {
    sendShares,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error: error as BaseError | null,
  };
}

// Hook for depositing to vault (hub chain only)
export function useOVaultDeposit() {
  const { data: hash, writeContract, isPending, error } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = 
    useWaitForTransactionReceipt({ hash });

  const deposit = (
    vaultAddress: string,
    assets: string,
    receiver: string
  ) => {
    toast.info("🏦 Vault Deposit", {
      description: `Depositing ${assets} assets to vault`,
    });

    writeContract({
      address: vaultAddress as `0x${string}`,
      abi: oVaultERC4626ABI,
      functionName: 'deposit',
      args: [
        parseEther(assets),
        receiver as `0x${string}`,
      ],
    });
  };

  return {
    deposit,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error: error as BaseError | null,
  };
}

// Hook for redeeming from vault (hub chain only)
export function useOVaultRedeem() {
  const { data: hash, writeContract, isPending, error } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = 
    useWaitForTransactionReceipt({ hash });

  const redeem = (
    vaultAddress: string,
    shares: string,
    receiver: string,
    owner: string
  ) => {
    toast.info("🏦 Vault Redeem", {
      description: `Redeeming ${shares} shares from vault`,
    });

    writeContract({
      address: vaultAddress as `0x${string}`,
      abi: oVaultERC4626ABI,
      functionName: 'redeem',
      args: [
        parseEther(shares),
        receiver as `0x${string}`,
        owner as `0x${string}`,
      ],
    });
  };

  return {
    redeem,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error: error as BaseError | null,
  };
}

// Hook for cross-chain vault deposit through composer
export function useOVaultCrossChainDeposit() {
  const { data: hash, writeContract, isPending, error } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = 
    useWaitForTransactionReceipt({ hash });

  const crossChainDeposit = (
    composerAddress: string,
    dstEid: number,
    assetAmount: string,
    vaultReceiver: string,
    shareReceiver: string,
    minShares: string = "0",
    nativeFee: string = "0.2" // Higher fee for compose operations
  ) => {
    toast.info("🌉 Cross-Chain Vault Deposit", {
      description: `Depositing ${assetAmount} assets cross-chain for vault shares`,
    });

    const toBytes32 = `0x${'0'.repeat(24)}${shareReceiver.slice(2)}`;

    writeContract({
      address: composerAddress as `0x${string}`,
      abi: oVaultComposerABI,
      functionName: 'sendForVaultDeposit',
      args: [
        {
          dstEid,
          to: toBytes32,
          amountLD: parseEther(assetAmount),
          minAmountLD: parseEther(minShares),
          extraOptions: "0x",
          composeMsg: "0x",
          oftCmd: "0x",
        },
        {
          nativeFee: parseEther(nativeFee),
          lzTokenFee: 0n,
        },
        shareReceiver as `0x${string}`, // refund address
        vaultReceiver as `0x${string}`, // vault receiver
      ],
      value: parseEther(nativeFee),
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

// Hook for cross-chain vault redeem through composer
export function useOVaultCrossChainRedeem() {
  const { data: hash, writeContract, isPending, error } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = 
    useWaitForTransactionReceipt({ hash });

  const crossChainRedeem = (
    composerAddress: string,
    dstEid: number,
    shareAmount: string,
    vaultReceiver: string,
    assetReceiver: string,
    minAssets: string = "0",
    nativeFee: string = "0.2"
  ) => {
    toast.info("🌉 Cross-Chain Vault Redeem", {
      description: `Redeeming ${shareAmount} shares cross-chain for assets`,
    });

    const toBytes32 = `0x${'0'.repeat(24)}${assetReceiver.slice(2)}`;

    writeContract({
      address: composerAddress as `0x${string}`,
      abi: oVaultComposerABI,
      functionName: 'sendForVaultRedeem',
      args: [
        {
          dstEid,
          to: toBytes32,
          amountLD: parseEther(shareAmount),
          minAmountLD: parseEther(minAssets),
          extraOptions: "0x",
          composeMsg: "0x",
          oftCmd: "0x",
        },
        {
          nativeFee: parseEther(nativeFee),
          lzTokenFee: 0n,
        },
        assetReceiver as `0x${string}`, // refund address
        vaultReceiver as `0x${string}`, // vault receiver
      ],
      value: parseEther(nativeFee),
    });
  };

  return {
    crossChainRedeem,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error: error as BaseError | null,
  };
}

// Hook for reading vault state
export function useOVaultState(vaultAddress?: string) {
  const { data: totalAssets, isLoading: isLoadingAssets } = useReadContract({
    address: vaultAddress as `0x${string}`,
    abi: oVaultERC4626ABI,
    functionName: 'totalAssets',
    query: {
      enabled: !!vaultAddress,
    },
  });

  const { data: assetToken, isLoading: isLoadingAsset } = useReadContract({
    address: vaultAddress as `0x${string}`,
    abi: oVaultERC4626ABI,
    functionName: 'asset',
    query: {
      enabled: !!vaultAddress,
    },
  });

  return {
    totalAssets,
    assetToken,
    isLoading: isLoadingAssets || isLoadingAsset,
  };
}

// Hook for previewing vault operations
export function useOVaultPreview(vaultAddress?: string) {
  const previewDeposit = (assets: string) => {
    return useReadContract({
      address: vaultAddress as `0x${string}`,
      abi: oVaultERC4626ABI,
      functionName: 'previewDeposit',
      args: [parseEther(assets)],
      query: {
        enabled: !!vaultAddress && !!assets,
      },
    });
  };

  const previewRedeem = (shares: string) => {
    return useReadContract({
      address: vaultAddress as `0x${string}`,
      abi: oVaultERC4626ABI,
      functionName: 'previewRedeem',
      args: [parseEther(shares)],
      query: {
        enabled: !!vaultAddress && !!shares,
      },
    });
  };

  return {
    previewDeposit,
    previewRedeem,
  };
}

// OVAULT FACTORY - Deploy complete OVault system for D-Corp

// Hook for deploying AssetOFT (first step of OVault system)
export function useDeployAssetOFT() {
  const { data: hash, deployContract, isPending, error } = useDeployContract();
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = 
    useWaitForTransactionReceipt({ hash });

  const deployAssetOFT = (
    name: string,
    symbol: string,
    lzEndpoint: string,
    delegate: string
  ) => {
    toast.info("🪙 Deploying Asset OFT", {
      description: `Deploying ${name} as LayerZero Omnichain Fungible Token`,
    });

    // For now, we'll need the bytecode. This is a simplified version.
    // In practice, you'd import the actual compiled bytecode from artifacts
    const placeholderBytecode = "0x608060405234801561001057600080fd5b50..." as `0x${string}`;

    deployContract({
      abi: myAssetOFTABI,
      bytecode: placeholderBytecode,
      args: [name, symbol, lzEndpoint as `0x${string}`, delegate as `0x${string}`],
    });
  };

  return {
    deployAssetOFT,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error: error as BaseError | null,
  };
}

// Simplified approach: Deploy OVault step-by-step
export function useDeployOVaultHub() {
  const [currentStep, setCurrentStep] = useState<'asset' | 'vault' | 'adapter' | 'composer' | 'completed'>('asset');
  const [deployedAddresses, setDeployedAddresses] = useState<{
    assetOFT?: string;
    vault?: string;
    shareAdapter?: string;
    composer?: string;
  }>({});

  const assetOFT = useDeployAssetOFT();

  const startDeployment = (
    assetName: string,
    assetSymbol: string,
    shareName: string,
    shareSymbol: string,
    owner: string
  ) => {
    // Get LayerZero endpoint for current chain (Base Sepolia)
    const lzEndpoint = LAYERZERO_ENDPOINTS[40245]; // Base Sepolia
    
    assetOFT.deployAssetOFT(assetName, assetSymbol, lzEndpoint, owner);
  };

  // Handle step progression
  React_useEffect(() => {
    if (assetOFT.isConfirmed && assetOFT.hash && currentStep === 'asset') {
      // Get deployed address from transaction receipt
      // For now using placeholder
      setDeployedAddresses(prev => ({
        ...prev,
        assetOFT: "0x..." // Would parse from transaction receipt
      }));
      setCurrentStep('vault');
      toast.success("✅ Asset OFT deployed! Next: ERC4626 Vault");
    }
  }, [assetOFT.isConfirmed, currentStep]);

  return {
    startDeployment,
    currentStep,
    deployedAddresses,
    isDeploying: assetOFT.isPending || assetOFT.isConfirming,
    error: assetOFT.error,
    hash: assetOFT.hash,
  };
}