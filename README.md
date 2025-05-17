# CouniDAO - Sistema de Gobernanza Descentralizada

ComuniDAO es una aplicación de gobernanza descentralizada que permite a los residentes de un barrio participar en la toma de decisiones de manera transparente y segura utilizando tecnología blockchain.

## Características Principales

- 🔐 Autenticación segura con Privy
- 📝 Sistema de propuestas y votaciones
- 👥 Gestión de participantes autorizados
- 🏆 Seguimiento de propuestas ganadoras
- 📱 Interfaz responsive y amigable
- 🔗 Integración con Mantle Sepolia Testnet

## Requisitos Previos

- Node.js (v18 o superior)
- MetaMask u otra wallet compatible con EVM
- Cuenta en Privy (para desarrollo)

## Instalación

1. Clonar el repositorio:
```bash
git clone https://github.com/tu-usuario/barrios-governor.git
cd barrios-governor
```

2. Instalar dependencias del contrato:
```bash
npm install
```

3. Instalar dependencias del frontend:
```bash
cd frontend/barrios-app
npm install
```

## Configuración

1. Configurar variables de entorno:
```bash
# En frontend/barrios-app/.env.local
NEXT_PUBLIC_PRIVY_APP_ID=tu_app_id_de_privy
```

2. Configurar la red Mantle Sepolia en MetaMask:
- Network Name: Mantle Sepolia
- RPC URL: https://rpc.testnet.mantle.xyz
- Chain ID: 5003
- Currency Symbol: MNT

## Desarrollo

1. Compilar y desplegar el contrato:
```bash
npx hardhat compile
npx hardhat run scripts/deploy.ts --network mantleSepolia
```

2. Iniciar el servidor de desarrollo:
```bash
cd frontend/barrios-app
npm run dev
```

## Uso

1. **Conectar Wallet**:
   - Haz clic en "Conectar Wallet" en la esquina superior derecha
   - Selecciona tu wallet preferida (MetaMask, Coinbase Wallet, etc.)

2. **Panel de Administración**:
   - Accede al panel de administración con una wallet autorizada
   - Gestiona participantes y fases de votación

3. **Crear Propuestas**:
   - Navega a la sección de propuestas
   - Haz clic en "Nueva Propuesta"
   - Completa el formulario y envía tu propuesta

4. **Votar**:
   - Durante la fase de votación, revisa las propuestas activas
   - Selecciona una propuesta y vota a favor o en contra

## Estructura del Proyecto

```
barrios-governor/
├── contracts/              # Contratos inteligentes
│   └── BarriosGovernor.sol
├── frontend/              # Aplicación Next.js
│   └── barrios-app/
│       ├── components/    # Componentes React
│       ├── lib/          # Utilidades y servicios
│       └── pages/        # Rutas de la aplicación
├── scripts/              # Scripts de despliegue
└── test/                # Pruebas unitarias
    ├── BarriosGovernor.test.ts  # Pruebas del contrato
    └── helpers/         # Utilidades para pruebas
```

## Tecnologías Utilizadas

- **Smart Contracts**: Solidity, Hardhat
- **Frontend**: Next.js 14, React, TypeScript
- **Web3**: Viem, Privy
- **UI**: Shadcn UI, Tailwind CSS
- **Blockchain**: Mantle Sepolia Testnet

## Contribuir

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE.md](LICENSE.md) para más detalles.

## Contacto

Para soporte o consultas, por favor abre un issue en el repositorio.
