//frontend/my-app/components/ui/Navbar.tsx
'use client';

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from 'next/navigation';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { ModeToggle } from "@/components/ModeToggle";
import Image from 'next/image';
import { AsistenciaService } from '@/lib/services/asistencia';

const navigation = [
  { name: 'Propuestas', href: '/propuestas' },
];

export function Navbar() {
  const pathname = usePathname();
  const { login, logout, authenticated, user } = usePrivy();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const asistencia = new AsistenciaService();
  const { wallets } = useWallets();
  const connectedWallet = wallets[0]?.address;

  useEffect(() => {
    if (!connectedWallet) {
      setIsOwner(false)
      return
    }
    async function fetchOwner() {
      try {
        const ownerAddress = await asistencia.getOwner();
        setIsOwner(
          !!connectedWallet &&
          ownerAddress?.toLowerCase() === connectedWallet?.toLowerCase()
        );
      } catch (e) {
        setIsOwner(false)
      }
    }
    fetchOwner();
  }, [connectedWallet]);

  const navItems = isOwner && connectedWallet
    ? [...navigation, { name: 'Admin', href: '/dashboard' }]
    : navigation;

  return (
    <nav className="border-b sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo y Navegación Desktop */}
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center">
                <Image
                  src="/Logo.svg"
                  alt="ComuniDAO Logo"
                  width={180}
                  height={60}
                  className="h-12 w-auto dark:invert"
                  priority
                />
              </Link>
            </div>
            <div className="hidden md:flex items-baseline space-x-4">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'px-3 py-2 text-sm font-medium rounded-md',
                    pathname === item.href
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Botones de Autenticación Desktop y ModeToggle */}
          <div className="hidden md:flex items-center space-x-2">
            {authenticated ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground truncate max-w-xs">
                  {user?.email?.address ? user.email.address : (user?.wallet?.address || 'Conectado')}
                </span>
                <Button variant="outline" onClick={logout} size="sm">
                  Salir
                </Button>
              </div>
            ) : (
              <Button onClick={login} size="sm">
                Conectar
              </Button>
            )}
            <ModeToggle />
          </div>

          {/* Botón de Menú Móvil y Sheet */}
          <div className="md:hidden flex items-center">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Abrir menú</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <nav className="flex flex-col space-y-4 mt-8">
                  {navItems.map((item) => (
                    <SheetClose asChild key={item.name}>
                      <Link
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={cn(
                          'block px-4 py-2 rounded-md text-base font-medium',
                          pathname === item.href
                            ? 'bg-primary text-primary-foreground'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        )}
                      >
                        {item.name}
                      </Link>
                    </SheetClose>
                  ))}
                  <div className="pt-4 border-t">
                    {authenticated ? (
                      <div className="flex flex-col space-y-3">
                        <span className="text-sm text-muted-foreground px-3">
                          {user?.email?.address ? user.email.address : (user?.wallet?.address || 'Conectado')}
                        </span>
                        <SheetClose asChild>
                          <Button variant="outline" onClick={() => { logout(); setIsMobileMenuOpen(false); }} className="w-full">
                            Desconectar
                          </Button>
                        </SheetClose>
                      </div>
                    ) : (
                      <SheetClose asChild>
                        <Button onClick={() => { login(); setIsMobileMenuOpen(false); }} className="w-full">
                          Conectar Wallet
                        </Button>
                      </SheetClose>
                    )}
                  </div>
                  <div className="pt-4 border-t">
                    <ModeToggle />
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
