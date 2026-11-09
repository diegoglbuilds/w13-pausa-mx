import type { Metadata } from "next";
import "./styles.css";
export const metadata: Metadata = { title: "Pausa MX — Decide antes de comprar", description: "Mira qué compromiso estás agregando antes de comprar. Tú decides qué datos compartir." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="es-MX"><body>{children}</body></html>; }
