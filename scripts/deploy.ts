import { viem } from "hardhat";
import { verify } from "../utils/verify";

async function main() {
  console.log("🚀 Iniciando deploy del contrato BarriosGovernor...");

  // Desplegar el contrato
  const BarriosGovernor = await viem.deployContract("BarriosGovernor", []);
  
  console.log("✅ Contrato desplegado en:", BarriosGovernor.address);

  // Esperar algunos bloques para la verificación
  console.log("⏳ Esperando confirmaciones...");
  await new Promise(resolve => setTimeout(resolve, 30000)); // Esperar 30 segundos

  // Verificar el contrato
  console.log("🔍 Verificando contrato...");
  try {
    await verify(BarriosGovernor.address, []);
    console.log("✅ Contrato verificado exitosamente");
  } catch (error) {
    console.error("❌ Error al verificar el contrato:", error);
  }
}

main().catch((error) => {
  console.error("❌ Error en el deploy:", error);
  process.exitCode = 1;
});