"use client"

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { useWallets, usePrivy } from '@privy-io/react-auth'
import { AsistenciaService } from '@/lib/services/asistencia'
import { toast } from 'sonner'

export function AdminPanel() {
  const [owner, setOwner] = useState<string | null>(null)
  const [isOwner, setIsOwner] = useState(false)
  const [addressToAuthorize, setAddressToAuthorize] = useState('')
  const [addressToCheck, setAddressToCheck] = useState('')
  const [checkResult, setCheckResult] = useState<null | boolean>(null)
  const [checking, setChecking] = useState(false)
  const [loading, setLoading] = useState(false)
  const asistencia = new AsistenciaService()
  const { wallets } = useWallets()
  const connectedWallet = wallets[0]?.address
  const { user } = usePrivy()
  const [currentPhase, setCurrentPhase] = useState<'Closed' | 'Proposals' | 'Voting'>('Closed')

  useEffect(() => {
    async function fetchOwner() {
      try {
        const ownerAddress = await asistencia.getOwner()
        setOwner(ownerAddress)
        setIsOwner(
          !!connectedWallet &&
          ownerAddress?.toLowerCase() === connectedWallet?.toLowerCase()
        )
        await fetchCurrentPhase()
      } catch (e) {
        toast.error('No se pudo obtener el owner del contrato')
      }
    }
    fetchOwner()
  }, [connectedWallet])

  const fetchCurrentPhase = async () => {
    try {
      const phase = await asistencia.getPhase()
      console.log('Fase actual:', phase)
      setCurrentPhase(phase as 'Closed' | 'Proposals' | 'Voting')
    } catch (error) {
      console.error('Error al obtener la fase actual:', error)
    }
  }

  if (!isOwner) return null

  const handleAuthorize = async () => {
    if (!addressToAuthorize) return toast.error('Ingresa un address válido')
    if (!user?.wallet) return toast.error('Por favor, conecta tu wallet primero')
    setLoading(true)
    try {
      await asistencia.authorize(addressToAuthorize as `0x${string}`, true, user.wallet)
      toast.success('Cuenta autorizada correctamente')
      setAddressToAuthorize('')
    } catch (e) {
      toast.error('Error al autorizar cuenta')
    } finally {
      setLoading(false)
    }
  }

  const handleCheckAuthorization = async () => {
    if (!addressToCheck) return toast.error('Ingresa un address válido')
    setChecking(true)
    setCheckResult(null)
    try {
      const isAuth = await asistencia.isAuthorized(addressToCheck as `0x${string}`)
      setCheckResult(isAuth)
    } catch (e) {
      toast.error('Error al chequear autorización')
      setCheckResult(null)
    } finally {
      setChecking(false)
    }
  }

  const handleOpenProposals = async () => {
    if (!user?.wallet) {
      toast.error('Por favor, conecta tu wallet primero')
      return
    }
    if (currentPhase !== 'Closed') {
      toast.error('No se puede abrir la fase de propuestas en este momento')
      return
    }
    try {
      setLoading(true)
      console.log('handleOpenProposals: Iniciando...')
      await asistencia.openVotingPeriod(user.wallet)
      console.log('handleOpenProposals: Completado')
      toast.success('Fase de propuestas abierta correctamente')
      await fetchCurrentPhase()
    } catch (error) {
      console.error('Error al abrir fase de propuestas:', error)
      toast.error('Error al abrir fase de propuestas')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenVoting = async () => {
    if (!user?.wallet) {
      toast.error('Por favor, conecta tu wallet primero')
      return
    }
    if (currentPhase !== 'Proposals') {
      toast.error('No se puede abrir el periodo de votación en este momento')
      return
    }
    try {
      setLoading(true)
      console.log('handleOpenVoting: Iniciando...')
      console.log('handleOpenVoting: Fase actual:', currentPhase)
      console.log('handleOpenVoting: Llamando a asistencia.startVotingPhase con wallet:', user.wallet)
      await asistencia.startVotingPhase(user.wallet)
      console.log('handleOpenVoting: startVotingPhase completado')
      toast.success('Periodo de votación abierto correctamente')
      await fetchCurrentPhase()
    } catch (error) {
      console.error('Error al abrir periodo de votación:', error)
      toast.error('Error al abrir periodo de votación')
    } finally {
      setLoading(false)
    }
  }

  const handleCloseVoting = async () => {
    if (!user?.wallet) {
      toast.error('Por favor, conecta tu wallet primero')
      return
    }
    if (currentPhase !== 'Voting') {
      toast.error('No se puede cerrar el periodo de votación en este momento')
      return
    }
    try {
      setLoading(true)
      console.log('handleCloseVoting: Iniciando...')
      await asistencia.closeVotingPeriod(BigInt(0), user.wallet)
      console.log('handleCloseVoting: Completado')
      toast.success('Periodo de votación cerrado correctamente')
      await fetchCurrentPhase()
    } catch (error) {
      console.error('Error al cerrar periodo de votación:', error)
      toast.error('Error al cerrar periodo de votación')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full border border-border rounded-xl bg-muted/50 p-4 md:p-8 mt-8 space-y-8">
      <div className="text-center">
        <h2 className="text-xl font-bold mb-6">Control de autorizaciones</h2>
        
        {/* Bloque para autorizar cuentas */}
        <div className="max-w-md mx-auto space-y-4">
          <div className="font-semibold">Autorizar cuenta</div>
          <div className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Address a autorizar"
              value={addressToAuthorize}
              onChange={e => setAddressToAuthorize(e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Button 
              onClick={handleAuthorize} 
              disabled={loading || !addressToAuthorize}
              className="w-full"
            >
              Autorizar cuenta
            </Button>
          </div>
        </div>

        {/* Bloque para chequear autorización */}
        <div className="max-w-md mx-auto space-y-4 mt-8">
          <div className="font-semibold">Chequear autorización</div>
          <div className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Address a chequear"
              value={addressToCheck}
              onChange={e => setAddressToCheck(e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Button 
              onClick={handleCheckAuthorization} 
              disabled={checking || !addressToCheck}
              className="w-full"
            >
              Chequear autorización
            </Button>
          </div>
          {checkResult !== null && (
            <div className={`mt-2 text-sm font-medium ${checkResult ? 'text-green-600' : 'text-red-500'}`}>
              {checkResult ? 'Autorizada ✅' : 'No autorizada ❌'}
            </div>
          )}
        </div>
      </div>

      {/* Bloque para control de periodos */}
      <div className="text-center">
        <div className="font-semibold mb-4">Control de periodos</div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            onClick={handleOpenProposals} 
            disabled={loading} 
            variant="secondary"
            className="w-full sm:w-auto"
          >
            Abrir periodo de propuestas
          </Button>
          <Button 
            onClick={handleOpenVoting} 
            disabled={loading} 
            variant="secondary"
            className="w-full sm:w-auto"
          >
            Abrir periodo de votación
          </Button>
          <Button 
            onClick={handleCloseVoting} 
            disabled={loading} 
            variant="destructive"
            className="w-full sm:w-auto"
          >
            Cerrar periodo de votación
          </Button>
        </div>
      </div>
    </div>
  )
} 