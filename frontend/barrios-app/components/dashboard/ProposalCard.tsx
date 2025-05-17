'use client'

import { Button } from '@/components/ui/button'
import { type Address } from 'viem'

interface Proposal {
  id: number
  title: string
  description: string
  proposer: Address
  votesFor: number
  hasVoted: boolean
}

interface ProposalCardProps {
  proposal: Proposal
  currentPhase: 'Closed' | 'Proposals' | 'Voting'
  isAuthorized: boolean
  isVoting: boolean
  onVote: (proposalId: number) => void
}

export function ProposalCard({ proposal, currentPhase, isAuthorized, isVoting, onVote }: ProposalCardProps) {
  return (
    <div className="flex items-center justify-between p-2 md:p-6 bg-muted/50 rounded-xl w-full border border-border">
      <div className="flex flex-col gap-0.5 text-left">
        <span className="text-base md:text-lg font-medium">
          {proposal.description || 'Sin título'}
        </span>
        <span className="text-xs text-muted-foreground break-all">
          {proposal.proposer}
        </span>
        <span className="text-xs text-muted-foreground">
          ({proposal.votesFor} votos)
        </span>
      </div>
      {currentPhase === 'Voting' && !proposal.hasVoted && (
        <Button
          size="sm"
          onClick={() => onVote(proposal.id)}
          disabled={!isAuthorized || isVoting}
        >
          {isVoting ? 'Votando...' : 'Votar'}
        </Button>
      )}
      {proposal.hasVoted && (
        <span className="text-xs text-green-500 ml-2">Ya votaste</span>
      )}
    </div>
  )
}
