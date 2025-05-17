'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AsistenciaService } from '@/lib/services/asistencia'
import { type Address } from 'viem'

interface WinningProposal {
  id: number
  title: string
  description: string
  proposer: Address
  votesFor: number
}

export function WinningProposals() {
  const [winningProposals, setWinningProposals] = useState<WinningProposal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const asistencia = new AsistenciaService()

  useEffect(() => {
    async function fetchWinningProposals() {
      try {
        setLoading(true)
        const proposals = await asistencia.getWinningProposals()
        setWinningProposals(proposals)
        setError(null)
      } catch (err) {
        console.error('Error al obtener propuestas ganadoras:', err)
        setError('No se pudieron cargar las propuestas ganadoras')
      } finally {
        setLoading(false)
      }
    }

    fetchWinningProposals()
  }, [])

  if (loading) {
    return (
      <div className="w-full text-center py-8">
        <p className="text-muted-foreground">Cargando propuestas ganadoras...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full text-center py-8">
        <p className="text-destructive">{error}</p>
      </div>
    )
  }

  if (winningProposals.length === 0) {
    return (
      <div className="w-full text-center py-8">
        <p className="text-muted-foreground">No hay propuestas ganadoras aún</p>
      </div>
    )
  }

  return (
    <div className="w-full space-y-6">
      <h2 className="text-2xl font-bold text-center mb-8">Propuestas Ganadoras</h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {winningProposals.map((proposal) => (
          <Card key={proposal.id} className="flex flex-col">
            <CardHeader>
              <CardTitle className="line-clamp-2">{proposal.title}</CardTitle>
              <CardDescription>
                Propuesta #{proposal.id} • {proposal.votesFor} votos
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <p className="text-sm text-muted-foreground line-clamp-3">
                {proposal.description}
              </p>
              <div className="mt-4 text-xs text-muted-foreground">
                Propuesta por: {proposal.proposer.slice(0, 6)}...{proposal.proposer.slice(-4)}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 