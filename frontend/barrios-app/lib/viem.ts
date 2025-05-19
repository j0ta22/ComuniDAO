//lib/viem.ts
import { createPublicClient, createWalletClient, custom, http, type Address } from 'viem';
import { mantleSepoliaTestnet } from 'viem/chains';

// Cliente público para lecturas
export const publicClient = createPublicClient({
  chain: mantleSepoliaTestnet,
  transport: http('https://rpc.sepolia.mantle.xyz')
});

// Función para obtener el cliente público
export function getPublicClient() {
  return publicClient;
}

// Función para obtener el cliente de wallet usando el provider de Privy
export async function getViemClient(wallet: any) {
  if (!wallet) throw new Error('No se proporcionó wallet');

  let provider;
  // Si es una wallet embebida de Privy
  if (typeof wallet.getEthereumProvider === 'function') {
    provider = await wallet.getEthereumProvider();
  } else if (wallet.ethereumProvider) {
    provider = wallet.ethereumProvider;
  } 
  // Si es MetaMask
  else if (window.ethereum) {
    provider = window.ethereum;
  }

  if (!provider) {
    throw new Error('No se encontró el provider de la wallet');
  }

  // Forzar conexión y red correcta
  await provider.request({ method: 'eth_requestAccounts' });

  const chainId = await provider.request({ method: 'eth_chainId' });
  console.log('chainId actual:', chainId);

  if (chainId !== '0x138b') {
    try {
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x138b' }],
      });
    } catch (err) {
      console.error('Error cambiando de red', err);
    }
  }

  // Crear un provider personalizado que use eth_sendTransaction
  const customProvider = {
    ...provider,
    request: async ({ method, params }: { method: string; params: any[] }) => {
      if (method === 'wallet_sendTransaction') {
        return provider.request({
          method: 'eth_sendTransaction',
          params
        });
      }
      return provider.request({ method, params });
    }
  };

  return createWalletClient({
    chain: mantleSepoliaTestnet,
    transport: custom(customProvider)
  });
}

// Función para obtener la dirección de la wallet
export async function getWalletAddress(wallet: any): Promise<Address> {
  if (!wallet) throw new Error('No se proporcionó wallet');
  
  // Si es una wallet embebida de Privy
  if (wallet.address) {
    return wallet.address as Address;
  }
  // Si es MetaMask
  else if (window.ethereum) {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    return accounts[0] as Address;
  }
  
  throw new Error('No se pudo obtener la dirección de la wallet');
}


