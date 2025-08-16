"use client";

import { 
  useWriteContract, 
  useWaitForTransactionReceipt, 
  useReadContract,
  type BaseError 
} from 'wagmi';
import { parseEther } from 'viem';
import { toast } from 'sonner';
import { 
  dCorpFactoryConfig, 
  dCorpTokenConfig, 
  dCorpVaultConfig 
} from './contracts';

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