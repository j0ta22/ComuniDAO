'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AsistenciaService } from '@/lib/services/asistencia'
import { type Address } from 'viem'

interface WinningProposal {
  id: number
  title: string
  description: string
  proposer: `0x${string}`
  votesFor: number
  date: number
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
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Propuestas Ganadoras</h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {winningProposals
          .filter(proposal => proposal.votesFor > 0)
          .map((proposal) => (
          <Card key={proposal.id} className="overflow-hidden">
            <CardHeader>
              <CardTitle>{proposal.title}</CardTitle>
              <CardDescription>
                Propuesta #{proposal.id}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {proposal.description}
              </p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Votos: {proposal.votesFor}
                </span>
                <span className="text-muted-foreground">
                  Ganó el: {new Intl.DateTimeFormat('es-ES', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  }).format(new Date(Number(proposal.date) * 1000))}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 