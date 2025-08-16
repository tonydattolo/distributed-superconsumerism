// Mock contract addresses for demo purposes
export const DCORP_CONTRACTS = {
  factory: '0x1234567890123456789012345678901234567890' as const,
  vault: '0x2345678901234567890123456789012345678901' as const,
  token: '0x3456789012345678901234567890123456789012' as const,
} as const;

// D-Corp Factory ABI - for creating new D-Corps
export const dCorpFactoryABI = [
  {
    name: 'createDCorp',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'name', type: 'string' },
      { name: 'symbol', type: 'string' },
      { name: 'capitalShare', type: 'uint256' },
      { name: 'laborShare', type: 'uint256' },
      { name: 'consumerShare', type: 'uint256' },
    ],
    outputs: [
      { name: 'dCorpAddress', type: 'address' },
      { name: 'tokenAddress', type: 'address' },
      { name: 'vaultAddress', type: 'address' },
    ],
  },
  {
    name: 'DCorpCreated',
    type: 'event',
    inputs: [
      { name: 'creator', type: 'address', indexed: true },
      { name: 'dCorpAddress', type: 'address', indexed: true },
      { name: 'tokenAddress', type: 'address', indexed: true },
      { name: 'vaultAddress', type: 'address', indexed: false },
      { name: 'name', type: 'string', indexed: false },
      { name: 'symbol', type: 'string', indexed: false },
    ],
  },
] as const;

// D-Corp Token ABI - ERC20 with additional features
export const dCorpTokenABI = [
  // Standard ERC20
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: 'balance', type: 'uint256' }],
  },
  {
    name: 'totalSupply',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: 'supply', type: 'uint256' }],
  },
  {
    name: 'transfer',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: 'success', type: 'bool' }],
  },
  // D-Corp specific functions
  {
    name: 'mint',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
      { name: 'stakeholderType', type: 'uint8' }, // 0=capital, 1=labor, 2=consumer
    ],
    outputs: [],
  },
  {
    name: 'airdropToAddresses',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'recipients', type: 'address[]' },
      { name: 'amounts', type: 'uint256[]' },
      { name: 'stakeholderType', type: 'uint8' },
    ],
    outputs: [],
  },
] as const;

// D-Corp Vault ABI - for managing treasury and distributions
export const dCorpVaultABI = [
  {
    name: 'deposit',
    type: 'function',
    stateMutability: 'payable',
    inputs: [],
    outputs: [],
  },
  {
    name: 'getBalance',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: 'balance', type: 'uint256' }],
  },
  {
    name: 'distributeProfit',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'totalAmount', type: 'uint256' },
      { name: 'capitalRecipients', type: 'address[]' },
      { name: 'laborRecipients', type: 'address[]' },
      { name: 'consumerRecipients', type: 'address[]' },
    ],
    outputs: [],
  },
  {
    name: 'emergencyWithdraw',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [],
  },
  {
    name: 'ProfitDistributed',
    type: 'event',
    inputs: [
      { name: 'totalAmount', type: 'uint256', indexed: false },
      { name: 'capitalAmount', type: 'uint256', indexed: false },
      { name: 'laborAmount', type: 'uint256', indexed: false },
      { name: 'consumerAmount', type: 'uint256', indexed: false },
      { name: 'timestamp', type: 'uint256', indexed: false },
    ],
  },
] as const;

// Combined contract configurations
export const dCorpFactoryConfig = {
  address: DCORP_CONTRACTS.factory,
  abi: dCorpFactoryABI,
} as const;

export const dCorpTokenConfig = {
  address: DCORP_CONTRACTS.token,
  abi: dCorpTokenABI,
} as const;

export const dCorpVaultConfig = {
  address: DCORP_CONTRACTS.vault,
  abi: dCorpVaultABI,
} as const;