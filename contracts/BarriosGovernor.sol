// SPDX-License-Identifier: MIT
// @author: @_j_o_t_a__
/**
    ______              _   __           __                      ____      ___                
   / ____/___  _____   / | / /_  _______/ /__  ____     _  __   / __ \____/ (_)_______  ____ _
  / /_  / __ \/ ___/  /  |/ / / / / ___/ / _ \/ __ \   | |/_/  / / / / __  / / ___/ _ \/ __ `/
 / __/ / /_/ / /     / /|  / /_/ / /__/ /  __/ /_/ /  _>  <   / /_/ / /_/ / (__  )  __/ /_/ / 
/_/    \____/_/     /_/ |_/\__,_/\___/_/\___/\____/  /_/|_|   \____/\__,_/_/____/\___/\__,_/  
                                                                                                                                   
*/

pragma solidity ^0.8.20;

contract BarriosGovernor {
    address public owner;

    enum Phase { Closed, Proposals, Voting }
    Phase public currentPhase;

    uint256 public proposalsStartTime;
    //uint256 public constant PROPOSALS_DURATION = 7 days;
    uint256 public constant PROPOSALS_DURATION = 2 minutes;

    uint256 public proposalCount;
    uint256 public votingStartTime;

    /**
     * @notice Estructura que representa una propuesta
     */
    struct Proposal {
        uint256 id;
        address proposer;
        string description;
        uint256 votes;
    }

    /**
     * @notice Estructura que representa una propuesta ganadora
     * @param id ID de la propuesta
     * @param proposer Dirección del proponente
     * @param description Descripción de la propuesta
     * @param votes Cantidad de votos obtenidos
     * @param date Timestamp en el que ganó
     */
    struct WinningProposal {
        uint256 id;
        address proposer;
        string description;
        uint256 votes;
        uint256 date;
    }

    /**
     * @notice Historial de propuestas ganadoras
     * @dev Se agrega una nueva entrada cada vez que se cierra una votación
     */
    WinningProposal[] public winningProposals;

    mapping(uint256 => Proposal) public proposals;
    mapping(address => bool) public authorizedParticipants;
    mapping(address => bool) public hasProposed;
    mapping(address => bool) public hasVoted;

    address[] public activeParticipants;

    event PhaseChanged(Phase newPhase);
    event ProposalSubmitted(uint256 id, address proposer, string description);
    event Voted(uint256 proposalId, address voter);
    event WinnerChosen(uint256 proposalId, string description);

    modifier onlyOwner() {
        require(msg.sender == owner, "Solo el owner puede ejecutar esto");
        _;
    }

    modifier onlyAuthorized() {
        require(authorizedParticipants[msg.sender], "No estas habilitado");
        _;
    }

    constructor() {
        owner = msg.sender;
        currentPhase = Phase.Closed;
    }

    /**
     * @notice Autoriza o desautoriza a un participante en el sistema de gobernanza
     * @param participant Dirección del participante a autorizar/desautorizar
     * @param authorized Estado de autorización (true para autorizar, false para desautorizar)
     * @dev Solo puede ser llamado por el owner del contrato
     */
    function authorizeParticipant(address participant, bool authorized) external onlyOwner {
        authorizedParticipants[participant] = authorized;

        
        if (authorized && !isInArray(participant)) {
            activeParticipants.push(participant);
        }
    }

    /**
     * @notice Verifica si una dirección está en el array de participantes activos
     * @param user Dirección a verificar
     * @return bool True si la dirección está en el array, false en caso contrario
     * @dev Función interna utilizada para evitar duplicados en el array de participantes
     */
    function isInArray(address user) internal view returns (bool) {
        for (uint256 i = 0; i < activeParticipants.length; i++) {
            if (activeParticipants[i] == user) {
                return true;
            }
        }
        return false;
    }

    /**
     * @notice Verifica si una dirección está autorizada para participar
     * @param user Dirección a verificar
     * @return bool True si la dirección está autorizada, false en caso contrario
     */
    function isAuthorized(address user) external view returns (bool) {
        return authorizedParticipants[user];
    }

    /**
     * @notice Obtiene la fase actual del proceso de gobernanza en formato string
     * @return string Nombre de la fase actual ("Closed", "Proposals" o "Voting")
     */
    function getPhase() external view returns (string memory) {
        if (currentPhase == Phase.Closed) return "Closed";
        if (currentPhase == Phase.Proposals) return "Proposals";
        return "Voting";
    }

    /**
     * @notice Abre el período de propuestas
     * @dev Solo puede ser llamado por el owner y cuando el contrato está en fase Closed
     * @dev Reinicia el contador de propuestas y establece el timestamp de inicio
     */
    function openVotingPeriod() external onlyOwner {
        require(currentPhase == Phase.Closed, "Ya hay un proceso activo");

        currentPhase = Phase.Proposals;
        proposalsStartTime = block.timestamp;
        proposalCount = 0;

        emit PhaseChanged(currentPhase);
    }

    /**
     * @notice Envía una nueva propuesta al sistema
     * @param description Descripción detallada de la propuesta
     * @dev Solo puede ser llamado por participantes autorizados durante la fase de propuestas
     * @dev Cada participante solo puede enviar una propuesta por período
     * @dev La propuesta debe enviarse dentro del tiempo límite establecido
     */
    function submitProposal(string memory description) external onlyAuthorized {
        require(currentPhase == Phase.Proposals, "No estamos en fase de propuestas");
        require(block.timestamp <= proposalsStartTime + PROPOSALS_DURATION, "Ya paso el tiempo de propuestas");
        require(!hasProposed[msg.sender], "Ya enviaste una propuesta");

        proposalCount++;
        proposals[proposalCount] = Proposal({
            id: proposalCount,
            proposer: msg.sender,
            description: description,
            votes: 0
        });

        hasProposed[msg.sender] = true;

        emit ProposalSubmitted(proposalCount, msg.sender, description);
    }

    /**
     * @notice Obtiene todas las propuestas activas del período actual
     * @return Proposal[] Array con todas las propuestas activas
     * @dev Las propuestas se devuelven en orden de creación (por ID)
     */
    function getProposals() external view returns (Proposal[] memory) {
        Proposal[] memory result = new Proposal[](proposalCount);
        for (uint256 i = 1; i <= proposalCount; i++) {
            result[i - 1] = proposals[i];
        }
        return result;
    }

    /**
     * @notice Inicia la fase de votación
     * @dev Solo puede ser llamado después de que termine el período de propuestas
     * @dev Establece el timestamp de inicio de la votación
     */
    function startVotingPhase() external {
        require(currentPhase == Phase.Proposals, "No estamos en fase de propuestas");
        require(block.timestamp > proposalsStartTime + PROPOSALS_DURATION, "Aun no termina el periodo de propuestas");

        currentPhase = Phase.Voting;
        votingStartTime = block.timestamp;

        emit PhaseChanged(currentPhase);
    }

    /**
     * @notice Registra un voto para una propuesta específica
     * @param proposalId ID de la propuesta a votar
     * @dev Solo puede ser llamado por participantes autorizados durante la fase de votación
     * @dev Cada participante solo puede votar una vez
     * @dev La propuesta debe existir y ser válida
     */
    function voteOnProposal(uint256 proposalId) external onlyAuthorized {
        require(currentPhase == Phase.Voting, "No estamos en fase de votacion");
        require(!hasVoted[msg.sender], "Ya votaste");
        require(proposalId > 0 && proposalId <= proposalCount, "Propuesta invalida");

        proposals[proposalId].votes += 1;
        hasVoted[msg.sender] = true;

        emit Voted(proposalId, msg.sender);
    }

    /**
     * @notice Cierra el período de votación y determina la propuesta ganadora
     * @param tieBreakerIdIfNeeded ID de la propuesta ganadora en caso de empate
     * @dev Solo puede ser llamado por el owner durante la fase de votación
     * @dev En caso de empate, el owner debe especificar la propuesta ganadora
     * @dev Reinicia el estado del contrato para el siguiente período
     */
    function closeVotingPeriod(uint256 tieBreakerIdIfNeeded) external onlyOwner {
        require(currentPhase == Phase.Voting, "No estamos en fase de votacion");

        uint256 winningVotes = 0;
        uint256 winningProposalId = 0;
        bool tie = false;

        for (uint256 i = 1; i <= proposalCount; i++) {
            if (proposals[i].votes > winningVotes) {
                winningVotes = proposals[i].votes;
                winningProposalId = i;
                tie = false;
            } else if (proposals[i].votes == winningVotes && winningVotes > 0) {
                tie = true;
            }
        }

        if (tie) {
            require(tieBreakerIdIfNeeded > 0 && tieBreakerIdIfNeeded <= proposalCount, "Empate: se requiere desempate valido");
            winningProposalId = tieBreakerIdIfNeeded;
        }

        emit WinnerChosen(winningProposalId, proposals[winningProposalId].description);

        Proposal storage winner = proposals[winningProposalId];
        winningProposals.push(
            WinningProposal({
                id: winner.id,
                proposer: winner.proposer,
                description: winner.description,
                votes: winner.votes,
                date: block.timestamp
            })
        );

        currentPhase = Phase.Closed;

        for (uint256 i = 1; i <= proposalCount; i++) {
            delete proposals[i];
        }

        for (uint256 i = 0; i < activeParticipants.length; i++) {
            address user = activeParticipants[i];
            hasProposed[user] = false;
            hasVoted[user] = false;
        }

        emit PhaseChanged(currentPhase);
    }

    /**
     * @notice Devuelve el historial de propuestas ganadoras
     * @return Array de WinningProposal con todos los ganadores históricos
     */
    function getWinningProposals() external view returns (WinningProposal[] memory) {
        return winningProposals;
    }
}
