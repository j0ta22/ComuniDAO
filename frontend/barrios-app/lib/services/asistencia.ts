import { createPublicClient, http, type Address, WalletClient } from 'viem'
import { mantleSepoliaTestnet } from 'viem/chains'
import { BarriosGovernorABI, CONTRACT_ADDRESS } from '../contract'
import { getPublicClient, getViemClient, publicClient } from '../viem'

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

interface WinningProposal {
  id: bigint
  proposer: `0x${string}`
  description: string
  votes: bigint
  date: bigint
}

export class AsistenciaService {
  private publicClient = getPublicClient()

  /**
   * Verifica si una dirección está autorizada
   */
  async isAuthorized(address: Address): Promise<boolean> {
    try {
      const result = await this.publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: BarriosGovernorABI,
        functionName: 'isAuthorized',
        args: [address]
      })
      return result as boolean
    } catch (error) {
      console.error('Error al verificar autorización:', error)
      return false
    }
  }

  /**
   * Obtiene la fase actual del contrato
   */
  async getCurrentPhase(): Promise<Phase> {
    try {
      const result = await this.publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: BarriosGovernorABI,
        functionName: 'getPhase'
      })
      return result as Phase
    } catch (error) {
      console.error('Error al obtener fase:', error)
      return 'Closed'
    }
  }

  /**
   * Obtiene todas las propuestas activas
   */
  async getProposals(): Promise<Proposal[]> {
    try {
      const result = await getPublicClient().readContract({
        address: CONTRACT_ADDRESS,
        abi: BarriosGovernorABI,
        functionName: 'getProposals'
      })
      return (result as any[]).map((p) => ({
        id: Number(p.id ?? 0),
        title: p.title ?? '',
        description: p.description ?? '',
        proposer: p.proposer,
        votesFor: Number(p.votesFor ?? p.votes ?? 0),
        votesAgainst: Number(p.votesAgainst ?? 0),
        hasVoted: Boolean(p.hasVoted ?? false),
      }))
    } catch (error) {
      console.error('Error al obtener propuestas:', error)
      return []
    }
  }

  /**
   * Envía una nueva propuesta
   */
  async submitProposal(description: string, privyUser: any): Promise<void> {
    console.log('submitProposal ejecutado', { description, privyUser });
    if (!privyUser) throw new Error('Wallet no conectada')
    try {
      const walletClient = await getViemClient(privyUser)
      const [address] = await walletClient.getAddresses()
      const hash = await walletClient.writeContract({
        address: CONTRACT_ADDRESS,
        abi: BarriosGovernorABI,
        functionName: 'submitProposal',
        args: [description],
        account: address
      })
      await this.publicClient.waitForTransactionReceipt({ hash })
    } catch (error) {
      console.error('Error al enviar propuesta:', error)
      throw error
    }
  }

  /**
   * Vota por una propuesta
   */
  async vote(proposalId: number | bigint, privyUser: any): Promise<void> {
    if (!privyUser) throw new Error('Wallet no conectada')
    try {
      const walletClient = await getViemClient(privyUser)
      const [address] = await walletClient.getAddresses()
      const hash = await walletClient.writeContract({
        address: CONTRACT_ADDRESS,
        abi: BarriosGovernorABI,
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
  async authorize(address: string, privyUser: any): Promise<void> {
    if (!privyUser) throw new Error('Wallet no conectada')
    const walletClient = await getViemClient(privyUser)
    const [account] = await walletClient.getAddresses()
    const hash = await walletClient.writeContract({
      address: CONTRACT_ADDRESS,
      abi: BarriosGovernorABI,
      functionName: 'authorizeParticipant',
      args: [address as `0x${string}`, true],
      account
    })
    await publicClient.waitForTransactionReceipt({ hash })
  }

  async authorizeWithWallet(address: `0x${string}`, walletClient: WalletClient) {
    const [account] = await walletClient.getAddresses()
    const hash = await walletClient.writeContract({
      address: CONTRACT_ADDRESS,
      abi: BarriosGovernorABI,
      functionName: 'authorizeParticipant',
      args: [address, true],
      account,
      chain: mantleSepoliaTestnet
    })
    await publicClient.waitForTransactionReceipt({ hash })
  }

  async getOwner(): Promise<string> {
    return await this.publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: BarriosGovernorABI,
      functionName: 'owner'
    }) as string
  }

  async openProposalsPeriod(privyUser: any): Promise<void> {
    if (!privyUser) throw new Error('Wallet no conectada')
    const walletClient = await getViemClient(privyUser)
    const [account] = await walletClient.getAddresses()
    const hash = await walletClient.writeContract({
      address: CONTRACT_ADDRESS,
      abi: BarriosGovernorABI,
      functionName: 'openVotingPeriod',
      args: [],
      account
    })
    await publicClient.waitForTransactionReceipt({ hash })
  }

  async openVotingPeriod(privyUser: any): Promise<void> {
    if (!privyUser) throw new Error('Wallet no conectada')
    const walletClient = await getViemClient(privyUser)
    const [account] = await walletClient.getAddresses()
    const hash = await walletClient.writeContract({
      address: CONTRACT_ADDRESS,
      abi: BarriosGovernorABI,
      functionName: 'startVotingPhase',
      args: [],
      account
    })
    await publicClient.waitForTransactionReceipt({ hash })
  }

  async closeVotingPeriod(tieBreakerId: bigint, privyUser: any): Promise<void> {
    if (!privyUser) throw new Error('Wallet no conectada')
    const walletClient = await getViemClient(privyUser)
    const [account] = await walletClient.getAddresses()
    const hash = await walletClient.writeContract({
      address: CONTRACT_ADDRESS,
      abi: BarriosGovernorABI,
      functionName: 'closeVotingPeriod',
      args: [tieBreakerId],
      account
    })
    await publicClient.waitForTransactionReceipt({ hash })
  }

  async getWinningProposals() {
    try {
      const publicClient = getPublicClient()
      const result = await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: BarriosGovernorABI,
        functionName: 'getWinningProposals'
      }) as readonly WinningProposal[]

      return result.map(proposal => ({
        id: Number(proposal.id),
        title: `Propuesta #${Number(proposal.id)}`,
        description: proposal.description,
        proposer: proposal.proposer,
        votesFor: Number(proposal.votes)
      }))
    } catch (error) {
      console.error('Error al obtener propuestas ganadoras:', error)
      throw new Error('No se pudieron cargar las propuestas ganadoras')
    }
  }
}

