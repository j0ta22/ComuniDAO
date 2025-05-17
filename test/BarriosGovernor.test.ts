import { expect } from "chai";
import hre from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { network } from "hardhat";
import { keccak256, encodeEventTopics } from "viem";

  async function deployBarriosGovernorFixture() {
    const [owner, user1, user2] = await hre.viem.getWalletClients();
    const BarriosGovernor = await hre.viem.deployContract("BarriosGovernor", []);
    return {
      owner,
      user1,
      user2,
      BarriosGovernor,
    };
  }

describe("Tests de BarriosGovernor", function () {
  it("El owner debería ser quien despliega el contrato", async () => {
    const { owner, BarriosGovernor } = await loadFixture(deployBarriosGovernorFixture);
    const contractOwner = await BarriosGovernor.read.owner();
    expect(contractOwner.toLowerCase()).to.equal(owner.account.address);
  });

  it("Solo el owner puede autorizar participantes", async () => {
    const { BarriosGovernor, user1, owner } = await loadFixture(deployBarriosGovernorFixture);
    await BarriosGovernor.write.authorizeParticipant([user1.account.address, true]);
    const autorizado = await BarriosGovernor.read.isAuthorized([user1.account.address]);
    expect(autorizado).to.be.true;
  });

  it("No autorizado no puede crear propuesta", async () => {
    const { BarriosGovernor, user1, owner } = await loadFixture(deployBarriosGovernorFixture);
    await BarriosGovernor.write.openVotingPeriod();
    await expect(
      BarriosGovernor.write.submitProposal(["Mi propuesta"], { account: user1.account })
    ).to.be.rejectedWith("No estas habilitado");
  });

  it("Participantes autorizados pueden crear propuestas en fase de propuestas", async () => {
    const { BarriosGovernor, user1 } = await loadFixture(deployBarriosGovernorFixture);
    await BarriosGovernor.write.authorizeParticipant([user1.account.address, true]);
    await BarriosGovernor.write.openVotingPeriod();

    await BarriosGovernor.write.submitProposal(["Mi propuesta"], { account: user1.account });
    const propuestas = await BarriosGovernor.read.getProposals();
    expect(propuestas.length).to.equal(1);
    expect(propuestas[0].description).to.equal("Mi propuesta");
  });

  it("La fase cambia correctamente: propuestas -> votación -> cerrado", async () => {
    const { BarriosGovernor } = await loadFixture(deployBarriosGovernorFixture);
    await BarriosGovernor.write.openVotingPeriod();
    let fase = await BarriosGovernor.read.currentPhase();
    expect(Number(fase)).to.equal(1); // Proposals

    // Simular que pasaron 2 minutos
    await network.provider.send("evm_increaseTime", [120]);
    await network.provider.send("evm_mine");

    await BarriosGovernor.write.startVotingPhase();
    fase = await BarriosGovernor.read.currentPhase();
    expect(Number(fase)).to.equal(2); // Voting

    await BarriosGovernor.write.closeVotingPeriod([0n]); // Cerrando votación
    fase = await BarriosGovernor.read.currentPhase();
    expect(Number(fase)).to.equal(0); // Closed
  });

  it("Owner desempata si hay empate", async () => {
    const { BarriosGovernor, owner, user1, user2 } = await loadFixture(deployBarriosGovernorFixture);
    await BarriosGovernor.write.authorizeParticipant([user1.account.address, true]);
    await BarriosGovernor.write.authorizeParticipant([user2.account.address, true]);
    await BarriosGovernor.write.openVotingPeriod();

    await BarriosGovernor.write.submitProposal(["Propuesta 1"], { account: user1.account });
    await BarriosGovernor.write.submitProposal(["Propuesta 2"], { account: user2.account });

    // Simular que paso el periodo de propuestas
    await network.provider.send("evm_increaseTime", [120]);
    await network.provider.send("evm_mine");

    await BarriosGovernor.write.startVotingPhase();
    await BarriosGovernor.write.voteOnProposal([1n], { account: user1.account }); // Voto por 1
    await BarriosGovernor.write.voteOnProposal([2n], { account: user2.account }); // Voto por 2

    // Verificar ganador antes del cierre
    const propuestasAntes = await BarriosGovernor.read.getProposals();
    expect(propuestasAntes[1].description).to.equal("Propuesta 2");
    expect(propuestasAntes[1].votes).to.equal(1n);
    expect(propuestasAntes[0].votes).to.equal(1n);

    // Cierre con empate, owner elige
    await BarriosGovernor.write.closeVotingPeriod([2n]); // Owner elige propuesta 2 como ganadora

    // Después del cierre, solo verificar que el array está vacío
    const propuestasDespues = await BarriosGovernor.read.getProposals();
    propuestasDespues.forEach(p => {
      expect(p.id).to.equal(0n)
      expect(p.proposer).to.equal('0x0000000000000000000000000000000000000000')
      expect(p.description).to.equal('')
      expect(p.votes).to.equal(0n)
    })
  });

  it("No se puede votar en fase incorrecta", async () => {
    const { BarriosGovernor, user1 } = await loadFixture(deployBarriosGovernorFixture);
    await BarriosGovernor.write.authorizeParticipant([user1.account.address, true]);
    await expect(
      BarriosGovernor.write.voteOnProposal([1n], { account: user1.account })
    ).to.be.rejectedWith("No estamos en fase de votacion");
  });

  it("No se puede votar dos veces", async () => {
    const { BarriosGovernor, user1 } = await loadFixture(deployBarriosGovernorFixture);
    await BarriosGovernor.write.authorizeParticipant([user1.account.address, true]);
    await BarriosGovernor.write.openVotingPeriod();
    await BarriosGovernor.write.submitProposal(["Propuesta"], { account: user1.account });
    
    // Simular que pasaron 2 minutos
    await network.provider.send("evm_increaseTime", [120]);
    await network.provider.send("evm_mine");
    
    await BarriosGovernor.write.startVotingPhase();
    await BarriosGovernor.write.voteOnProposal([1n], { account: user1.account });
    await expect(
      BarriosGovernor.write.voteOnProposal([1n], { account: user1.account })
    ).to.be.rejectedWith("Ya votaste");
  });

  it("Emite evento correcto al cambiar fase", async () => {
    const { BarriosGovernor } = await loadFixture(deployBarriosGovernorFixture);
    const hash = await BarriosGovernor.write.openVotingPeriod();
    const client = await hre.viem.getPublicClient();
    const receipt = await client.getTransactionReceipt({ hash });
    
    const eventTopic = encodeEventTopics({
      abi: [{
        name: 'PhaseChanged',
        type: 'event',
        inputs: [{ type: 'uint8', name: 'newPhase' }]
      }],
      eventName: 'PhaseChanged'
    })[0];
    
    const event = receipt.logs.find((log: { topics: string[] }) => 
      log.topics[0] === eventTopic
    );
    expect(event).to.not.be.undefined;
  });

  it("No se pueden crear propuestas después del tiempo límite", async () => {
    const { BarriosGovernor, user1 } = await loadFixture(deployBarriosGovernorFixture);
    await BarriosGovernor.write.authorizeParticipant([user1.account.address, true]);
    await BarriosGovernor.write.openVotingPeriod();
    
    // Simular que pasaron 2 minutos
    await network.provider.send("evm_increaseTime", [120]);
    await network.provider.send("evm_mine");
    
    await expect(
      BarriosGovernor.write.submitProposal(["Propuesta tardía"], { account: user1.account })
    ).to.be.rejectedWith("Ya paso el tiempo de propuestas");
  });

  it("Estado se resetea correctamente después de cerrar votación", async () => {
    const { BarriosGovernor, user1 } = await loadFixture(deployBarriosGovernorFixture);
    await BarriosGovernor.write.authorizeParticipant([user1.account.address, true]);
    await BarriosGovernor.write.openVotingPeriod();
    await BarriosGovernor.write.submitProposal(["Propuesta"], { account: user1.account });
    
    // Simular que pasaron 2 minutos
    await network.provider.send("evm_increaseTime", [120]);
    await network.provider.send("evm_mine");
    
    await BarriosGovernor.write.startVotingPhase();
    await BarriosGovernor.write.voteOnProposal([1n], { account: user1.account });
    // Verificar estado antes del cierre
    const propuestasAntes = await BarriosGovernor.read.getProposals();
    expect(propuestasAntes.length).to.equal(1);
    expect(propuestasAntes[0].votes).to.equal(1n);
    // Cerrar votación
    await BarriosGovernor.write.closeVotingPeriod([1n]);
    // Después del cierre, solo verificar que el array está vacío
    const propuestasDespues = await BarriosGovernor.read.getProposals();
    propuestasDespues.forEach(p => {
      expect(p.id).to.equal(0n)
      expect(p.proposer).to.equal('0x0000000000000000000000000000000000000000')
      expect(p.description).to.equal('')
      expect(p.votes).to.equal(0n)
    })
    const hasVoted = await BarriosGovernor.read.hasVoted([user1.account.address]);
    expect(hasVoted).to.be.false;
  });

  it("Flujo completo de gobernanza funciona correctamente", async () => {
    const { BarriosGovernor, user1, user2 } = await loadFixture(deployBarriosGovernorFixture);
    // Autorizar participantes
    await BarriosGovernor.write.authorizeParticipant([user1.account.address, true]);
    await BarriosGovernor.write.authorizeParticipant([user2.account.address, true]);
    // Fase de propuestas
    await BarriosGovernor.write.openVotingPeriod();
    await BarriosGovernor.write.submitProposal(["Propuesta 1"], { account: user1.account });
    await BarriosGovernor.write.submitProposal(["Propuesta 2"], { account: user2.account });
    // Fase de votación
    await network.provider.send("evm_increaseTime", [120]);
    await network.provider.send("evm_mine");
    await BarriosGovernor.write.startVotingPhase();
    await BarriosGovernor.write.voteOnProposal([1n], { account: user1.account });
    await BarriosGovernor.write.voteOnProposal([2n], { account: user2.account });
    // Verificar estado antes del cierre
    const propuestasAntes = await BarriosGovernor.read.getProposals();
    expect(propuestasAntes.length).to.equal(2);
    expect(propuestasAntes[0].votes).to.equal(1n);
    expect(propuestasAntes[1].votes).to.equal(1n);
    // Cerrar votación
    await BarriosGovernor.write.closeVotingPeriod([1n]);
    // Después del cierre, solo verificar que el array está vacío
    const propuestasDespues = await BarriosGovernor.read.getProposals();
    propuestasDespues.forEach(p => {
      expect(p.id).to.equal(0n)
      expect(p.proposer).to.equal('0x0000000000000000000000000000000000000000')
      expect(p.description).to.equal('')
      expect(p.votes).to.equal(0n)
    })
  });

  it("No se puede iniciar votación antes del tiempo límite", async () => {
    const { BarriosGovernor } = await loadFixture(deployBarriosGovernorFixture);
    await BarriosGovernor.write.openVotingPeriod();
    await expect(
      BarriosGovernor.write.startVotingPhase()
    ).to.be.rejectedWith("Aun no termina el periodo de propuestas");
  });

  it("No se puede crear propuesta en fase incorrecta", async () => {
    const { BarriosGovernor, user1 } = await loadFixture(deployBarriosGovernorFixture);
    await BarriosGovernor.write.authorizeParticipant([user1.account.address, true]);
    await expect(
      BarriosGovernor.write.submitProposal(["Propuesta"], { account: user1.account })
    ).to.be.rejectedWith("No estamos en fase de propuestas");
  });
});

describe("BarriosGovernor - getWinningProposals", function () {
  it("debe guardar y exponer la propuesta ganadora con todos los datos", async function () {
    const { BarriosGovernor, owner, user1, user2 } = await loadFixture(deployBarriosGovernorFixture);

    // Autorizar usuarios
    await BarriosGovernor.write.authorizeParticipant([user1.account.address, true]);
    await BarriosGovernor.write.authorizeParticipant([user2.account.address, true]);

    // Owner abre periodo de propuestas
    await BarriosGovernor.write.openVotingPeriod();

    // user1 y user2 envían propuestas
    await BarriosGovernor.write.submitProposal(["Propuesta de user1"], { account: user1.account });
    await BarriosGovernor.write.submitProposal(["Propuesta de user2"], { account: user2.account });

    // Simula que termina el periodo de propuestas (avanza el tiempo)
    await network.provider.send("evm_increaseTime", [120]);
    await network.provider.send("evm_mine");

    // Owner inicia la fase de votación
    await BarriosGovernor.write.startVotingPhase();

    // user1 y user2 votan por la propuesta 1
    await BarriosGovernor.write.voteOnProposal([1n], { account: user1.account });
    await BarriosGovernor.write.voteOnProposal([1n], { account: user2.account });

    // Owner cierra la votación (no hay empate)
    await BarriosGovernor.write.closeVotingPeriod([0n]);

    // Consulta el historial de ganadores
    const winners = await BarriosGovernor.read.getWinningProposals();
    expect(winners.length).to.equal(1);
    expect(winners[0].id).to.equal(1n);
    expect(winners[0].proposer.toLowerCase()).to.equal(user1.account.address.toLowerCase());
    expect(winners[0].description).to.equal("Propuesta de user1");
    expect(winners[0].votes).to.equal(2n);
    expect(Number(winners[0].date)).to.be.gt(0);
  });
});
