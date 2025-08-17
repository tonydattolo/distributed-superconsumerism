// Mock contract addresses for demo purposes
export const DCORP_CONTRACTS = {
  factory: '0x1234567890123456789012345678901234567890' as const,
  vault: '0x2345678901234567890123456789012345678901' as const,
  token: '0x3456789012345678901234567890123456789012' as const,
} as const;

// LayerZero Endpoint addresses for different chains
export const LAYERZERO_ENDPOINTS = {
  // Base Sepolia (Hub)
  40245: '0x6EDCE65403992e310A62460808c4b910D972f10f' as const,
  // Optimism Sepolia  
  40232: '0x6EDCE65403992e310A62460808c4b910D972f10f' as const,
  // Arbitrum Sepolia
  40231: '0x6EDCE65403992e310A62460808c4b910D972f10f' as const,
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

// OVault Asset OFT ABI - for cross-chain asset transfers
export const oVaultAssetOFTABI = [
  {
    name: 'send',
    type: 'function',
    stateMutability: 'payable',
    inputs: [
      { name: '_sendParam', type: 'tuple', components: [
        { name: 'dstEid', type: 'uint32' },
        { name: 'to', type: 'bytes32' },
        { name: 'amountLD', type: 'uint256' },
        { name: 'minAmountLD', type: 'uint256' },
        { name: 'extraOptions', type: 'bytes' },
        { name: 'composeMsg', type: 'bytes' },
        { name: 'oftCmd', type: 'bytes' },
      ]},
      { name: '_fee', type: 'tuple', components: [
        { name: 'nativeFee', type: 'uint256' },
        { name: 'lzTokenFee', type: 'uint256' },
      ]},
      { name: '_refundAddress', type: 'address' },
    ],
    outputs: [
      { name: 'msgReceipt', type: 'tuple', components: [
        { name: 'guid', type: 'bytes32' },
        { name: 'nonce', type: 'uint64' },
        { name: 'fee', type: 'tuple', components: [
          { name: 'nativeFee', type: 'uint256' },
          { name: 'lzTokenFee', type: 'uint256' },
        ]},
      ]},
      { name: 'oftReceipt', type: 'tuple', components: [
        { name: 'amountSentLD', type: 'uint256' },
        { name: 'amountReceivedLD', type: 'uint256' },
      ]},
    ],
  },
  {
    name: 'quoteSend',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: '_sendParam', type: 'tuple', components: [
        { name: 'dstEid', type: 'uint32' },
        { name: 'to', type: 'bytes32' },
        { name: 'amountLD', type: 'uint256' },
        { name: 'minAmountLD', type: 'uint256' },
        { name: 'extraOptions', type: 'bytes' },
        { name: 'composeMsg', type: 'bytes' },
        { name: 'oftCmd', type: 'bytes' },
      ]},
      { name: '_payInLzToken', type: 'bool' },
    ],
    outputs: [
      { name: 'fee', type: 'tuple', components: [
        { name: 'nativeFee', type: 'uint256' },
        { name: 'lzTokenFee', type: 'uint256' },
      ]},
    ],
  },
  // Standard ERC20 functions
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: 'balance', type: 'uint256' }],
  },
  {
    name: 'approve',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: 'success', type: 'bool' }],
  },
] as const;

// OVault ERC4626 Vault ABI - for deposit/redeem operations
export const oVaultERC4626ABI = [
  {
    name: 'deposit',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'assets', type: 'uint256' },
      { name: 'receiver', type: 'address' },
    ],
    outputs: [{ name: 'shares', type: 'uint256' }],
  },
  {
    name: 'redeem',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'shares', type: 'uint256' },
      { name: 'receiver', type: 'address' },
      { name: 'owner', type: 'address' },
    ],
    outputs: [{ name: 'assets', type: 'uint256' }],
  },
  {
    name: 'previewDeposit',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'assets', type: 'uint256' }],
    outputs: [{ name: 'shares', type: 'uint256' }],
  },
  {
    name: 'previewRedeem',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'shares', type: 'uint256' }],
    outputs: [{ name: 'assets', type: 'uint256' }],
  },
  {
    name: 'totalAssets',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: 'totalManagedAssets', type: 'uint256' }],
  },
  {
    name: 'asset',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: 'assetTokenAddress', type: 'address' }],
  },
] as const;

// OVault Composer ABI - for cross-chain vault operations
export const oVaultComposerABI = [
  {
    name: 'sendForVaultDeposit',
    type: 'function',
    stateMutability: 'payable',
    inputs: [
      { name: '_sendParam', type: 'tuple', components: [
        { name: 'dstEid', type: 'uint32' },
        { name: 'to', type: 'bytes32' },
        { name: 'amountLD', type: 'uint256' },
        { name: 'minAmountLD', type: 'uint256' },
        { name: 'extraOptions', type: 'bytes' },
        { name: 'composeMsg', type: 'bytes' },
        { name: 'oftCmd', type: 'bytes' },
      ]},
      { name: '_fee', type: 'tuple', components: [
        { name: 'nativeFee', type: 'uint256' },
        { name: 'lzTokenFee', type: 'uint256' },
      ]},
      { name: '_refundAddress', type: 'address' },
      { name: '_vaultReceiver', type: 'address' },
    ],
    outputs: [],
  },
  {
    name: 'sendForVaultRedeem',
    type: 'function',
    stateMutability: 'payable',
    inputs: [
      { name: '_sendParam', type: 'tuple', components: [
        { name: 'dstEid', type: 'uint32' },
        { name: 'to', type: 'bytes32' },
        { name: 'amountLD', type: 'uint256' },
        { name: 'minAmountLD', type: 'uint256' },
        { name: 'extraOptions', type: 'bytes' },
        { name: 'composeMsg', type: 'bytes' },
        { name: 'oftCmd', type: 'bytes' },
      ]},
      { name: '_fee', type: 'tuple', components: [
        { name: 'nativeFee', type: 'uint256' },
        { name: 'lzTokenFee', type: 'uint256' },
      ]},
      { name: '_refundAddress', type: 'address' },
      { name: '_vaultReceiver', type: 'address' },
    ],
    outputs: [],
  },
] as const;

// OVault Share OFT ABI - same as Asset OFT but for shares
export const oVaultShareOFTABI = oVaultAssetOFTABI;

// OVault contract configurations (addresses will be set dynamically per D-Corp)
// These are template configs - actual addresses come from database after deployment
export const createOVaultAssetOFTConfig = (address: string) => ({
  address: address as `0x${string}`,
  abi: oVaultAssetOFTABI,
} as const);

export const createOVaultERC4626Config = (address: string) => ({
  address: address as `0x${string}`,
  abi: oVaultERC4626ABI,
} as const);

export const createOVaultComposerConfig = (address: string) => ({
  address: address as `0x${string}`,
  abi: oVaultComposerABI,
} as const);

export const createOVaultShareAdapterConfig = (address: string) => ({
  address: address as `0x${string}`,
  abi: oVaultShareOFTABI,
} as const);