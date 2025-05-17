//lib/contract.ts
import { type Address } from 'viem'

// Dirección del contrato desplegado en Mantle Sepolia
export const CONTRACT_ADDRESS: Address = '0x407D06E8cbe2d8Bd023319ee6A64412F4C5e0bdd'

// ABI del contrato BarriosGovernor
export const BarriosGovernorABI = [
    {
        "inputs": [],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "address",
                "name": "participant",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "bool",
                "name": "authorized",
                "type": "bool"
            }
        ],
        "name": "ParticipantAuthorized",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "enum BarriosGovernor.Phase",
                "name": "newPhase",
                "type": "uint8"
            }
        ],
        "name": "PhaseChanged",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "id",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "address",
                "name": "proposer",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "string",
                "name": "description",
                "type": "string"
            }
        ],
        "name": "ProposalSubmitted",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "proposalId",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "address",
                "name": "voter",
                "type": "address"
            }
        ],
        "name": "Voted",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "proposalId",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "string",
                "name": "description",
                "type": "string"
            }
        ],
        "name": "WinnerChosen",
        "type": "event"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "participant",
                "type": "address"
            },
            {
                "internalType": "bool",
                "name": "authorized",
                "type": "bool"
            }
        ],
        "name": "authorizeParticipant",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "tieBreakerIdIfNeeded",
                "type": "uint256"
            }
        ],
        "name": "closeVotingPeriod",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "currentPhase",
        "outputs": [
            {
                "internalType": "enum BarriosGovernor.Phase",
                "name": "",
                "type": "uint8"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getPhase",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getProposals",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "uint256",
                        "name": "id",
                        "type": "uint256"
                    },
                    {
                        "internalType": "address",
                        "name": "proposer",
                        "type": "address"
                    },
                    {
                        "internalType": "string",
                        "name": "description",
                        "type": "string"
                    },
                    {
                        "internalType": "uint256",
                        "name": "votes",
                        "type": "uint256"
                    }
                ],
                "internalType": "struct BarriosGovernor.Proposal[]",
                "name": "",
                "type": "tuple[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "user",
                "type": "address"
            }
        ],
        "name": "isAuthorized",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "openVotingPeriod",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "owner",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "proposalCount",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "proposals",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "id",
                "type": "uint256"
            },
            {
                "internalType": "address",
                "name": "proposer",
                "type": "address"
            },
            {
                "internalType": "string",
                "name": "description",
                "type": "string"
            },
            {
                "internalType": "uint256",
                "name": "votes",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "proposalsStartTime",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "description",
                "type": "string"
            }
        ],
        "name": "submitProposal",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "startVotingPhase",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "proposalId",
                "type": "uint256"
            }
        ],
        "name": "voteOnProposal",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "votingStartTime",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getWinningProposals",
        "outputs": [
            {
                "components": [
                    { "internalType": "uint256", "name": "id", "type": "uint256" },
                    { "internalType": "address", "name": "proposer", "type": "address" },
                    { "internalType": "string", "name": "description", "type": "string" },
                    { "internalType": "uint256", "name": "votes", "type": "uint256" },
                    { "internalType": "uint256", "name": "date", "type": "uint256" }
                ],
                "internalType": "struct BarriosGovernor.WinningProposal[]",
                "name": "",
                "type": "tuple[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
] as const
