'use client'

import { ProposalList } from '@/components/dashboard/ProposalList'
import { ProposalForm } from '@/components/dashboard/ProposalForm'
import { WinningProposals } from '@/components/dashboard/WinningProposals'
import { AsistenciaService } from '@/lib/services/asistencia'
import { usePrivy } from '@privy-io/react-auth'
import { type Address } from 'viem'
import { useEffect, useState } from 'react'
import { Navbar } from '@/components/ui/Navbar'

export default function PropuestasPage() {
  const { user } = usePrivy()
  const userAddress = user?.wallet?.address as Address | undefined
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [currentPhase, setCurrentPhase] = useState<'Closed' | 'Proposals' | 'Voting'>('Closed')
  const asistencia = new AsistenciaService()

  useEffect(() => {
    const checkAuthorization = async () => {
      if (userAddress) {
        try {
          const [authorized, phase] = await Promise.all([
            asistencia.isAuthorized(userAddress),
            asistencia.getPhase()
          ])
          setIsAuthorized(authorized)
          setCurrentPhase(phase)
        } catch (error) {
          console.error('Error al verificar estado:', error)
        }
      }
    }
    checkAuthorization()
  }, [userAddress])

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="flex flex-col gap-4">
          <h1 className="text-3xl font-bold text-center">Propuestas</h1>
          <p className="text-muted-foreground text-center">
            {currentPhase === 'Closed' 
              ? 'El período de propuestas está cerrado'
              : currentPhase === 'Proposals'
              ? 'Envía tu propuesta para ser votada por la comunidad'
              : 'Vota por las propuestas que consideres más importantes'}
          </p>
        </div>

        <div className="max-w-2xl mx-auto space-y-8">
          <ProposalList userAddress={userAddress} />
          <ProposalForm 
            currentPhase={currentPhase}
            isAuthorized={isAuthorized}
            onProposalSuccess={() => {
              // La lista se actualizará automáticamente
            }}
          />
        </div>

        {/* Sección de propuestas ganadoras */}
        <div className="mt-12">
          <WinningProposals />
        </div>
      </div>
    </div>
  )
} 