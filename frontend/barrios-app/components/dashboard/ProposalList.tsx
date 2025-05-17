'use client'

import { useEffect, useState } from 'react'
import { AsistenciaService, type Proposal } from '@/lib/services/asistencia'
import { type Address } from 'viem'
import { useWallets } from '@privy-io/react-auth'
import { toast } from 'sonner'
import { ProposalCard } from './ProposalCard'

interface ProposalListProps {
  userAddress?: Address
}

export function ProposalList({ userAddress }: ProposalListProps) {
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [currentPhase, setCurrentPhase] = useState<'Closed' | 'Proposals' | 'Voting'>('Closed')
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isVoting, setIsVoting] = useState<number | null>(null)
  const asistencia = new AsistenciaService()
  const { wallets } = useWallets()

  const embeddedWallet = wallets.find(w => w.connectorType === 'embedded')
  const isWalletReady = !!embeddedWallet && !!embeddedWallet.address

  const loadData = async () => {
    try {
      setIsLoading(true)
      const [proposalsData, phase, authorized] = await Promise.all([
        asistencia.getProposals(),
        asistencia.getCurrentPhase(),
        userAddress ? asistencia.isAuthorized(userAddress) : false
      ])
      setProposals(proposalsData)
      setCurrentPhase(phase)
      setIsAuthorized(authorized)
    } catch (error) {
      console.error('Error al cargar propuestas:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [userAddress])

  const handleVote = async (proposalId: number) => {
    if (!isWalletReady) {
      toast.error('Debes conectar tu wallet embebida para votar')
      return
    }

    if (!isAuthorized) {
      toast.error('No autorizado', {
        description: 'Necesitas estar autorizado para votar'
      })
      return
    }

    if (currentPhase !== 'Voting') {
      toast.error('Fase incorrecta', {
        description: 'Solo puedes votar durante la fase de votación'
      })
      return
    }

    try {
      setIsVoting(proposalId)
      await asistencia.vote(proposalId, embeddedWallet)
      toast.success('Voto registrado', {
        description: 'Tu voto ha sido registrado correctamente'
      })
      loadData()
    } catch (error) {
      toast.error('Error al votar', {
        description: error instanceof Error ? error.message : 'No se pudo registrar el voto'
      })
    } finally {
      setIsVoting(null)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-10 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    )
  }

  if (proposals.length === 0) {
    return (
      <div className="text-center text-sm text-muted-foreground py-4">
        No hay propuestas disponibles
      </div>
    )
  }

  return (
    <div className="space-y-2 max-w-xl mx-auto">
      {proposals.map((proposal) => (
        <ProposalCard
          key={proposal.id}
          proposal={proposal}
          currentPhase={currentPhase}
          isAuthorized={isAuthorized}
          isVoting={isVoting === proposal.id}
          onVote={handleVote}
        />
      ))}
    </div>
  )
} 