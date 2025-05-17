'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AsistenciaService } from '@/lib/services/asistencia'
import { usePrivy, useWallets } from '@privy-io/react-auth'
import { toast } from 'sonner'

interface VoteFormProps {
  proposalId: number
  onVoteSuccess?: () => void
}

export function VoteForm({ proposalId, onVoteSuccess }: VoteFormProps) {
  const { user, ready, authenticated } = usePrivy()
  const { wallets } = useWallets()
  const [isVoting, setIsVoting] = useState(false)
  const asistencia = new AsistenciaService()

  // Usar la wallet embebida de Privy correctamente
  const embeddedWallet = wallets.find(w => w.connectorType === 'embedded')
  const isWalletReady =
    !!embeddedWallet &&
    !!embeddedWallet.address &&
    typeof embeddedWallet.getEthereumProvider === 'function'

  // Log de depuración de estado de la wallet y autenticación
  console.log({
    ready,
    authenticated,
    user,
    embeddedWallet,
    walletAddress: embeddedWallet?.address,
    hasGetEthereumProvider: typeof embeddedWallet?.getEthereumProvider === 'function',
    isWalletReady,
    proposalId
  })

  const handleVote = async () => {
    if (!isWalletReady) {
      toast.error('Debes conectar tu wallet embebida para votar')
      return
    }
    setIsVoting(true)
    try {
      await asistencia.vote(proposalId, embeddedWallet)
      toast.success('Voto registrado correctamente')
      onVoteSuccess?.()
    } catch (error) {
      console.error('Error al votar:', error)
      toast.error('Error al registrar el voto')
    } finally {
      setIsVoting(false)
    }
  }

  return (
    <Card>
      <CardContent className="flex gap-4">
        <Button
          variant="default"
          onClick={handleVote}
          disabled={isVoting || !isWalletReady}
          className="flex-1"
        >
          Votar
        </Button>
        {!isWalletReady && (
          <div className="text-sm text-red-500 mt-2">
            Conecta tu wallet embebida de Privy para poder votar.
          </div>
        )}
      </CardContent>
    </Card>
  )
} 