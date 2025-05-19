import { createPublicClient, http, type Address, WalletClient } from 'viem'
import { mantleSepoliaTestnet } from 'viem/chains'
import { BarriosGovernorABI, CONTRACT_ADDRESS } from '../contract'
import { getPublicClient, getViemClient, publicClient, getWalletAddress } from '../viem'

// Tipos para las propuestas
export interface Proposal {
  id: number
  title: string
  description: string
  proposer: Address
  votesFor: number
  votesAgainst: number
  hasVoted: boolean
}

// Tipos para las fases
export type Phase = 'Closed' | 'Proposals' | 'Voting'

export interface WinningProposal {
  id: number
  title: string
  description: string
  proposer: `0x${string}`
  votesFor: number
  date: number
}

export class AsistenciaService {
  private publicClient = getPublicClient()
  private contractAddress: Address
  private abi: any

  constructor() {
    this.contractAddress = CONTRACT_ADDRESS
    this.abi = BarriosGovernorABI
  }

  /**
   * Verifica si una dirección está autorizada
   */
  async isAuthorized(address: `0x${string}`): Promise<boolean> {
    const result = await this.publicClient.readContract({
      address: this.contractAddress,
      abi: this.abi,
      functionName: 'isAuthorized',
      args: [address]
    })
    return Boolean(result)
  }

  /**
   * Obtiene la fase actual del contrato
   */
  async getPhase(): Promise<Phase> {
    const phase = await this.publicClient.readContract({
      address: this.contractAddress,
      abi: this.abi,
      functionName: 'getPhase',
      args: []
    }) as string
    return phase as Phase
  }

  /**
   * Obtiene todas las propuestas activas
   */
  async getProposals(): Promise<Proposal[]> {
    try {
      console.log('asistencia.getProposals: Iniciando...')
      const result = await this.publicClient.readContract({
        address: this.contractAddress,
        abi: this.abi,
        functionName: 'getProposals',
        args: []
      })
      console.log('asistencia.getProposals: Resultado raw:', result)
      
      const proposals = (result as any[]).map((p) => ({
        id: Number(p.id ?? 0),
        title: p.title ?? '',
        description: p.description ?? '',
        proposer: p.proposer,
        votesFor: Number(p.votesFor ?? p.votes ?? 0),
        votesAgainst: Number(p.votesAgainst ?? 0),
        hasVoted: Boolean(p.hasVoted ?? false),
      }))
      
      console.log('asistencia.getProposals: Propuestas procesadas:', proposals)
      return proposals
    } catch (error) {
      console.error('Error al obtener propuestas:', error)
      throw error
    }
  }

  /**
   * Envía una nueva propuesta
   */
  async submitProposal(description: string, wallet: any): Promise<void> {
    console.log('submitProposal ejecutado', { description, wallet })
    if (!wallet) throw new Error('Wallet no conectada')
    try {
      const walletClient = await getViemClient(wallet)
      const [address] = await walletClient.getAddresses()
      
      // Estimar el gas necesario
      const gasEstimate = await this.publicClient.estimateContractGas({
        address: this.contractAddress,
        abi: this.abi,
        functionName: 'submitProposal',
        args: [description],
        account: address
      })
      
      console.log('Gas estimado:', gasEstimate.toString())
      
      const hash = await walletClient.writeContract({
        address: this.contractAddress,
        abi: this.abi,
        functionName: 'submitProposal',
        args: [description],
        account: address,
        gas: gasEstimate * BigInt(110) / BigInt(100), // Aumentar el gas en un 10% para tener margen
        maxFeePerGas: BigInt(1000000000), // 1 gwei
        maxPriorityFeePerGas: BigInt(100000000), // 0.1 gwei
        chain: mantleSepoliaTestnet // Especificar la red explícitamente
      })
      
      console.log('Transacción enviada:', hash)
      await this.publicClient.waitForTransactionReceipt({ hash })
      console.log('Transacción confirmada')
    } catch (error) {
      console.error('Error al enviar propuesta:', error)
      throw error
    }
  }

  /**
   * Vota por una propuesta
   */
  async vote(proposalId: number | bigint, wallet: any): Promise<void> {
    if (!wallet) throw new Error('Wallet no conectada')
    try {
      const walletClient = await getViemClient(wallet)
      const [address] = await walletClient.getAddresses()
      const hash = await walletClient.writeContract({
        address: this.contractAddress,
        abi: this.abi,
        functionName: 'voteOnProposal',
        args: [BigInt(proposalId)],
        account: address
      })
      await this.publicClient.waitForTransactionReceipt({ hash })
    } catch (error) {
      console.error('Error al votar:', error)
      throw error
    }
  }

  /**
   * Autoriza o desautoriza a un participante
   */
  async authorize(participant: Address, authorized: boolean, wallet: any): Promise<void> {
    if (!wallet) throw new Error('Wallet no conectada')
    try {
      const walletClient = await getViemClient(wallet)
      const [ownerAddress] = await walletClient.getAddresses()
      const hash = await walletClient.writeContract({
        address: this.contractAddress,
        abi: this.abi,
        functionName: 'authorizeParticipant',
        args: [participant, authorized],
        account: ownerAddress
      })
      await this.publicClient.waitForTransactionReceipt({ hash })
    } catch (error) {
      console.error('Error al autorizar participante:', error)
      throw error
    }
  }

  async authorizeWithWallet(address: `0x${string}`, walletClient: WalletClient) {
    const [account] = await walletClient.getAddresses()
    const hash = await walletClient.writeContract({
      address: this.contractAddress,
      abi: this.abi,
      functionName: 'authorizeParticipant',
      args: [address, true],
      account,
      chain: mantleSepoliaTestnet
    })
    await this.publicClient.waitForTransactionReceipt({ hash })
  }

  async getOwner(): Promise<string> {
    return await this.publicClient.readContract({
      address: this.contractAddress,
      abi: this.abi,
      functionName: 'owner',
      args: []
    }) as string
  }

  async openVotingPeriod(wallet: any): Promise<void> {
    if (!wallet) throw new Error('Wallet no conectada')
    try {
      console.log('asistencia.openVotingPeriod: Iniciando...')
      console.log('asistencia.openVotingPeriod: Wallet recibida:', wallet)
      
      // Obtener el wallet client según el tipo de wallet
      let walletClient
      if (wallet.embeddedWallet) {
        // Es una wallet embebida de Privy
        console.log('asistencia.openVotingPeriod: Usando wallet embebida de Privy')
        walletClient = await getViemClient(wallet.embeddedWallet)
      } else if (window.ethereum) {
        // Es MetaMask
        console.log('asistencia.openVotingPeriod: Usando MetaMask')
        walletClient = await getViemClient({ ethereumProvider: window.ethereum })
      } else {
        throw new Error('No se encontró un proveedor de wallet compatible')
      }

      console.log('asistencia.openVotingPeriod: Wallet client obtenido')
      const [address] = await walletClient.getAddresses()
      console.log('asistencia.openVotingPeriod: Dirección obtenida:', address)

      // Estimar el gas necesario
      console.log('asistencia.openVotingPeriod: Estimando gas...')
      const gasEstimate = await this.publicClient.estimateContractGas({
        address: this.contractAddress,
        abi: this.abi,
        functionName: 'openVotingPeriod',
        args: [],
        account: address
      })
      
      console.log('asistencia.openVotingPeriod: Gas estimado:', gasEstimate.toString())
      
      console.log('asistencia.openVotingPeriod: Enviando transacción...')
      const hash = await walletClient.writeContract({
        address: this.contractAddress,
        abi: this.abi,
        functionName: 'openVotingPeriod',
        args: [],
        account: address,
        gas: gasEstimate * BigInt(110) / BigInt(100), // Aumentar el gas en un 10% para tener margen
        maxFeePerGas: BigInt(1000000000), // 1 gwei
        maxPriorityFeePerGas: BigInt(100000000), // 0.1 gwei
        chain: mantleSepoliaTestnet // Especificar la red explícitamente
      })
      
      console.log('asistencia.openVotingPeriod: Transacción enviada:', hash)
      await this.publicClient.waitForTransactionReceipt({ hash })
      console.log('asistencia.openVotingPeriod: Transacción confirmada')
    } catch (error) {
      console.error('Error al abrir fase de propuestas:', error)
      throw error
    }
  }

  async startVotingPhase(wallet: any): Promise<void> {
    if (!wallet) throw new Error('Wallet no conectada')
    try {
      console.log('asistencia.startVotingPhase: Iniciando...')
      console.log('asistencia.startVotingPhase: Wallet recibida:', wallet)
      
      // Obtener el wallet client según el tipo de wallet
      let walletClient
      if (wallet.embeddedWallet) {
        // Es una wallet embebida de Privy
        console.log('asistencia.startVotingPhase: Usando wallet embebida de Privy')
        walletClient = await getViemClient(wallet.embeddedWallet)
      } else if (window.ethereum) {
        // Es MetaMask
        console.log('asistencia.startVotingPhase: Usando MetaMask')
        walletClient = await getViemClient({ ethereumProvider: window.ethereum })
      } else {
        throw new Error('No se encontró un proveedor de wallet compatible')
      }

      console.log('asistencia.startVotingPhase: Wallet client obtenido')
      const [address] = await walletClient.getAddresses()
      console.log('asistencia.startVotingPhase: Dirección obtenida:', address)

      // Estimar el gas necesario
      console.log('asistencia.startVotingPhase: Estimando gas...')
      const gasEstimate = await this.publicClient.estimateContractGas({
        address: this.contractAddress,
        abi: this.abi,
        functionName: 'startVotingPhase',
        args: [],
        account: address
      })
      
      console.log('asistencia.startVotingPhase: Gas estimado:', gasEstimate.toString())
      
      console.log('asistencia.startVotingPhase: Enviando transacción...')
      const hash = await walletClient.writeContract({
        address: this.contractAddress,
        abi: this.abi,
        functionName: 'startVotingPhase',
        args: [],
        account: address,
        gas: gasEstimate * BigInt(110) / BigInt(100), // Aumentar el gas en un 10% para tener margen
        maxFeePerGas: BigInt(1000000000), // 1 gwei
        maxPriorityFeePerGas: BigInt(100000000), // 0.1 gwei
        chain: mantleSepoliaTestnet // Especificar la red explícitamente
      })
      
      console.log('asistencia.startVotingPhase: Transacción enviada:', hash)
      await this.publicClient.waitForTransactionReceipt({ hash })
      console.log('asistencia.startVotingPhase: Transacción confirmada')
    } catch (error) {
      console.error('Error al abrir periodo de votación:', error)
      throw error
    }
  }

  async closeVotingPeriod(proposalId: bigint, wallet: any): Promise<void> {
    if (!wallet) throw new Error('Wallet no conectada')
    try {
      console.log('asistencia.closeVotingPeriod: Iniciando...')
      console.log('asistencia.closeVotingPeriod: Wallet recibida:', wallet)
      
      // Obtener el wallet client según el tipo de wallet
      let walletClient
      if (wallet.embeddedWallet) {
        // Es una wallet embebida de Privy
        console.log('asistencia.closeVotingPeriod: Usando wallet embebida de Privy')
        walletClient = await getViemClient(wallet.embeddedWallet)
      } else if (window.ethereum) {
        // Es MetaMask
        console.log('asistencia.closeVotingPeriod: Usando MetaMask')
        walletClient = await getViemClient({ ethereumProvider: window.ethereum })
      } else {
        throw new Error('No se encontró un proveedor de wallet compatible')
      }

      console.log('asistencia.closeVotingPeriod: Wallet client obtenido')
      const [address] = await walletClient.getAddresses()
      console.log('asistencia.closeVotingPeriod: Dirección obtenida:', address)

      // Estimar el gas necesario
      console.log('asistencia.closeVotingPeriod: Estimando gas...')
      const gasEstimate = await this.publicClient.estimateContractGas({
        address: this.contractAddress,
        abi: this.abi,
        functionName: 'closeVotingPeriod',
        args: [proposalId],
        account: address
      })
      
      console.log('asistencia.closeVotingPeriod: Gas estimado:', gasEstimate.toString())
      
      console.log('asistencia.closeVotingPeriod: Enviando transacción...')
      const hash = await walletClient.writeContract({
        address: this.contractAddress,
        abi: this.abi,
        functionName: 'closeVotingPeriod',
        args: [proposalId],
        account: address,
        gas: gasEstimate * BigInt(110) / BigInt(100), // Aumentar el gas en un 10% para tener margen
        maxFeePerGas: BigInt(1000000000), // 1 gwei
        maxPriorityFeePerGas: BigInt(100000000), // 0.1 gwei
        chain: mantleSepoliaTestnet // Especificar la red explícitamente
      })
      
      console.log('asistencia.closeVotingPeriod: Transacción enviada:', hash)
      await this.publicClient.waitForTransactionReceipt({ hash })
      console.log('asistencia.closeVotingPeriod: Transacción confirmada')
    } catch (error) {
      console.error('Error al cerrar periodo de votación:', error)
      throw error
    }
  }

  async getWinningProposals(): Promise<WinningProposal[]> {
    try {
      const result = await this.publicClient.readContract({
        address: this.contractAddress,
        abi: this.abi,
        functionName: 'getWinningProposals',
        args: []
      })
      
      return (result as any[]).map((p) => ({
        id: Number(p.id ?? 0),
        title: p.title ?? '',
        description: p.description ?? '',
        proposer: p.proposer,
        votesFor: Number(p.votesFor ?? p.votes ?? 0),
        date: Number(p.date ?? p.timestamp ?? 0)
      }))
    } catch (error) {
      console.error('Error al obtener propuestas ganadoras:', error)
      throw error
    }
  }
}

