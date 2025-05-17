// my-app/providers/RootProvider.tsx
'use client';
import { PrivyProvider } from '@privy-io/react-auth';
import React from 'react';
import { ThemeProvider } from '@/components/theme-provider';

// Interfaz para la configuración de la cadena, compatible con Privy
interface CustomChain {
  id: number;
  name: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: {
    default: {
      http: string[];
    };
    public?: {
      http: string[];
    };
  };
  blockExplorerUrls?: {
    default: {
      name: string;
      url: string;
    };
  };
}

// Definir las cadenas fuera para mayor claridad
const mantleSepolia: CustomChain = {
  id: 5003,
  name: 'Mantle Sepolia',
  nativeCurrency: {
    name: 'Mantle',
    symbol: 'MNT',
    decimals: 18,
  },
  rpcUrls: {
    default: { http: [process.env.NEXT_PUBLIC_MANTLE_RPC_URL || 'https://rpc.sepolia.mantle.xyz'] },
    public: { http: [process.env.NEXT_PUBLIC_MANTLE_RPC_URL || 'https://rpc.sepolia.mantle.xyz'] },
  },
  blockExplorerUrls: {
    default: { name: 'Mantle Sepolia Explorer', url: 'https://explorer.sepolia.mantle.xyz' },
  },
};

const ethereumMainnet: CustomChain = {
  id: 1,
  name: 'Ethereum Mainnet',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: { http: [`https://mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_API_KEY || ''}`] },
    public: { http: [`https://mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_API_KEY || ''}`] },
  },
  blockExplorerUrls: {
    default: { name: 'Etherscan', url: 'https://etherscan.io' },
  },
};

export default function RootProvider({ children }: { children: React.ReactNode }) {
  const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
  if (!privyAppId) {
    throw new Error("Missing NEXT_PUBLIC_PRIVY_APP_ID env var");
  }

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <PrivyProvider
        appId={privyAppId}
        config={{
          loginMethods: ['email', 'wallet'],
          embeddedWallets: {
            createOnLogin: 'users-without-wallets',
          },
          appearance: {
            theme: 'dark',
            accentColor: '#676FFF',
          },
          supportedChains: [ethereumMainnet, mantleSepolia] as any // Usar 'as any' temporalmente para evitar problemas de tipo complejos con Privy
        }}
      >
        {children}
      </PrivyProvider>
    </ThemeProvider>
  );
}
