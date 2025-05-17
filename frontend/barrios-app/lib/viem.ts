//lib/viem.ts
import { createPublicClient, createWalletClient, http, custom, type Address } from 'viem';
import { mantleSepoliaTestnet } from 'viem/chains';

// Cliente público para lecturas
export const publicClient = createPublicClient({
  chain: mantleSepoliaTestnet,
  transport: http(process.env.NEXT_PUBLIC_MANTLE_RPC_URL)
});

// Función para obtener el cliente público
export function getPublicClient() {
  return publicClient;
}

// Función para obtener el cliente de wallet usando el provider de Privy
export async function getViemClient(privyUser: any) {
  console.log('getViemClient ejecutado', { 
    userId: privyUser?.id,
    hasWallets: !!privyUser?.wallets?.length,
    walletCount: privyUser?.wallets?.length,
    isAuthenticated: !!privyUser,
    linkedAccounts: privyUser?.linkedAccounts
  });
  
  if (!privyUser) {
    throw new Error('Usuario no autenticado. Por favor, inicia sesión primero.');
  }

  // Verificar si hay wallets conectadas o cuentas vinculadas
  const hasWallets = privyUser.wallets && privyUser.wallets.length > 0;
  const hasLinkedAccounts = privyUser.linkedAccounts && privyUser.linkedAccounts.length > 0;

  if (!hasWallets && !hasLinkedAccounts) {
    throw new Error('No hay wallet conectada. Por favor, conecta una wallet en tu perfil de Privy.');
  }

  let provider;
  let walletAddress;

  // Intentar obtener el provider de la wallet conectada
  if (hasWallets) {
    const wallet = privyUser.wallets[0];
    console.log('Wallet encontrada:', {
      address: wallet.address,
      type: wallet.walletClientType,
      hasProvider: !!wallet.ethereumProvider
    });

    if (typeof wallet?.getEthereumProvider === 'function') {
      console.log('Usando getEthereumProvider()');
      provider = await wallet.getEthereumProvider();
    } else if (wallet?.ethereumProvider) {
      console.log('Usando ethereumProvider directo');
      provider = wallet.ethereumProvider;
    } else if (typeof wallet?.getProvider === 'function') {
      console.log('Usando getProvider()');
      provider = await wallet.getProvider();
    }
    walletAddress = wallet.address;
  }

  // Si no hay provider de wallet, intentar obtenerlo de las cuentas vinculadas
  if (!provider && hasLinkedAccounts) {
    const linkedAccount = privyUser.linkedAccounts.find((acc: any) => acc.type === 'wallet');
    if (linkedAccount) {
      console.log('Cuenta vinculada encontrada:', linkedAccount);
      
      // Para MetaMask, intentar obtener el provider directamente de window.ethereum
      if (linkedAccount.walletClientType === 'metamask' && typeof window !== 'undefined' && window.ethereum) {
        console.log('Usando window.ethereum para MetaMask');
        provider = window.ethereum;
      } else if (typeof linkedAccount?.getEthereumProvider === 'function') {
        console.log('Usando getEthereumProvider() de la cuenta vinculada');
        provider = await linkedAccount.getEthereumProvider();
      } else if (linkedAccount?.ethereumProvider) {
        console.log('Usando ethereumProvider de la cuenta vinculada');
        provider = linkedAccount.ethereumProvider;
      }
      walletAddress = linkedAccount.address;
    }
  }

  if (!provider) {
    console.error('No se pudo obtener el provider:', { privyUser });
    throw new Error('No se pudo conectar con la wallet. Por favor, intenta reconectar tu wallet.');
  }

  try {
    // Forzar conexión y red correcta
    await provider.request({ method: 'eth_requestAccounts' });

    const chainId = await provider.request({ method: 'eth_chainId' });
    console.log('chainId actual:', chainId);

    if (chainId !== '0x138b') {
      console.log('Cambiando a red Mantle Sepolia...');
      try {
        await provider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x138b' }],
        });
        console.log('Red cambiada exitosamente');
      } catch (err) {
        console.error('Error cambiando de red:', err);
        throw new Error('Por favor, cambia manualmente a la red Mantle Sepolia en tu wallet.');
      }
    }

    const walletClient = createWalletClient({
      chain: mantleSepoliaTestnet,
      transport: custom(provider)
    });

    console.log('Wallet client creado exitosamente');
    return walletClient;
  } catch (error) {
    console.error('Error en getViemClient:', error);
    throw error;
  }
}

// Función para obtener la dirección de la wallet
export async function getWalletAddress(privyUser: any): Promise<Address> {
  if (!privyUser) {
    throw new Error('Usuario no autenticado. Por favor, inicia sesión primero.');
  }

  // Verificar si hay wallets conectadas o cuentas vinculadas
  const hasWallets = privyUser.wallets && privyUser.wallets.length > 0;
  const hasLinkedAccounts = privyUser.linkedAccounts && privyUser.linkedAccounts.length > 0;

  if (!hasWallets && !hasLinkedAccounts) {
    throw new Error('No hay wallet conectada. Por favor, conecta una wallet en tu perfil de Privy.');
  }

  if (hasWallets) {
    const address = privyUser.wallets[0].address as Address;
    console.log('Dirección de wallet obtenida:', address);
    return address;
  }

  // Si no hay wallets, buscar en las cuentas vinculadas
  const linkedAccount = privyUser.linkedAccounts.find((acc: any) => acc.type === 'wallet');
  if (!linkedAccount) {
    throw new Error('No se encontró una wallet vinculada');
  }

  const address = linkedAccount.address as Address;
  console.log('Dirección de wallet obtenida de cuenta vinculada:', address);
  return address;
}


