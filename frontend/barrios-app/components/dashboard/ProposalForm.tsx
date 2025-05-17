'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { AsistenciaService } from '@/lib/services/asistencia'
import { toast } from 'sonner'
import { type ControllerRenderProps } from 'react-hook-form'
import { usePrivy, useWallets } from '@privy-io/react-auth'

const formSchema = z.object({
  description: z.string()
    .min(10, 'La propuesta debe tener al menos 10 caracteres')
    .max(500, 'La propuesta no puede exceder los 500 caracteres')
})

type FormValues = z.infer<typeof formSchema>

interface ProposalFormProps {
  currentPhase: 'Closed' | 'Proposals' | 'Voting'
  isAuthorized: boolean
  onProposalSuccess?: () => void
}

export function ProposalForm({ currentPhase, isAuthorized, onProposalSuccess }: ProposalFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const asistencia = new AsistenciaService()
  const { user, ready, authenticated } = usePrivy()
  const { wallets } = useWallets()

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
    isAuthorized,
    currentPhase
  })

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: ''
    }
  })

  const onSubmit = async (values: FormValues) => {
    console.log('onSubmit llamado', { values, user, ready, authenticated, isAuthorized, currentPhase, embeddedWallet });
    if (!isAuthorized) {
      toast.error('No autorizado', { description: 'Necesitas estar autorizado para enviar propuestas' })
      return
    }
    if (currentPhase !== 'Proposals') {
      toast.error('Fase incorrecta', { description: 'Solo puedes enviar propuestas durante la fase de propuestas' })
      return
    }
    if (!isWalletReady) {
      toast.error('Debes conectar tu wallet embebida antes de enviar una propuesta')
      return
    }
    try {
      setIsSubmitting(true)
      console.log('Llamando a submitProposal con:', values.description, embeddedWallet)
      await asistencia.submitProposal(values.description, embeddedWallet)
      toast.success('Propuesta enviada', { description: 'Tu propuesta ha sido enviada correctamente' })
      form.reset()
      onProposalSuccess?.()
    } catch (error) {
      toast.error('Error al enviar propuesta', { description: error instanceof Error ? error.message : 'No se pudo enviar la propuesta' })
      console.error('Error en submitProposal:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full border border-border rounded-xl bg-muted/50 p-2 md:p-6">
      <div className="mb-4">
        <div className="text-lg font-bold">Nueva Propuesta</div>
        <div className="text-muted-foreground text-sm">Envía una propuesta para ser votada por la comunidad</div>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="description"
            render={({ field }: { field: ControllerRenderProps<FormValues, 'description'> }) => (
              <FormItem>
                <FormLabel>Descripción</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe tu propuesta..."
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  La propuesta debe ser clara y concisa
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button 
            type="submit" 
            className="w-full"
            disabled={!isAuthorized || currentPhase !== 'Proposals' || isSubmitting || !isWalletReady}
          >
            {isSubmitting ? 'Enviando...' : 'Enviar Propuesta'}
          </Button>
          {!isWalletReady && (
            <div className="text-sm text-red-500 mt-2">
              Conecta tu wallet embebida de Privy para poder enviar propuestas.
            </div>
          )}
        </form>
      </Form>
      <div className="flex flex-col items-start space-y-2 mt-4">
        <p className="text-sm text-muted-foreground">
          Estado actual: {currentPhase === 'Proposals' ? 'Abierto para propuestas' : 'Cerrado para propuestas'}
        </p>
        {!isAuthorized && (
          <p className="text-sm text-destructive">
            Necesitas estar autorizado para enviar propuestas
          </p>
        )}
      </div>
    </div>
  )
} 