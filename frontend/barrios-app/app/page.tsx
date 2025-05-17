'use client';

import { Navbar } from "@/components/ui/Navbar";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import Image from 'next/image';

// Contenido para las tarjetas de instrucciones
const instructionalCards = [
  {
    title: "1. Conectate y Participá",
    description: "Empezá tu camino en ComuniDAO iniciando sesión. Una vez adentro, tu billetera digital se va a conectar automáticamente, y vas a poder interactuar de forma segura con todas las funciones de la plataforma.",
    content: "Usá el botón 'Conectar' en la barra de navegación para entrar con tu mail."
  },
  {
    title: "2. Proponé Mejoras para tu Barrio",
    description: "¿Tenés una idea para mejorar el barrio? En la sección 'Propuestas', vas a poder escribir y mandar tus iniciativas para que los vecinos las vean y las tengan en cuenta.",
    content: "Andá a la sección 'Propuestas' y usá el formulario para contar tu idea. ¡Acordate de tener tu cuenta conectada!"
  },
  {
    title: "3. Votá y Decidí el Futuro",
    description: "Tu voz cuenta. Mirá las propuestas activas y votá las que creas que van a traer más beneficios para el barrio. La participación de todos define el rumbo de la comunidad.",
    content: "Explorá la lista de propuestas y hacé clic en 'Votar' en las que quieras apoyar. Tu voto queda registrado de forma segura en la blockchain."
  }
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col items-center justify-center space-y-8 py-12">
          <div className="flex flex-col items-center space-y-4 text-center">
            <Image
              src="/Logo.svg"
              alt="ComuniDAO Logo"
              width={720}
              height={240}
              className="h-48 w-auto dark:invert"
              priority
            />
            <p className="max-w-[700px] text-muted-foreground md:text-xl">
              Participá en la toma de decisiones de tu barrio de forma segura y transparente usando blockchain.
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {instructionalCards.map((card, index) => (
            <Card key={index} className="flex flex-col">
              <CardHeader>
                <CardTitle>{card.title}</CardTitle>
                <CardDescription>{card.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-sm text-muted-foreground">{card.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
