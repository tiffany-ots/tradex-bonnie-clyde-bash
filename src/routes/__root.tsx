import { Outlet } from "@tanstack/react-router";
import { HeadContent, Scripts } from "@tanstack/react-router";
import { createRootRoute } from "@tanstack/react-router";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";

import appCss from "../styles.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Tradex Party 2026 — Bonnie & Clyde" },
      { name: "description", content: "Fête des employés Tradex 2026 — Thème Bonnie & Clyde. Votez pour vos collègues préférés !" },
      { property: "og:title", content: "Tradex Party 2026 — Bonnie & Clyde" },
      { property: "og:description", content: "Fête des employés Tradex 2026 — Votez pour vos collègues préférés !" },
      { property: "og:type", content: "website" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-heading text-7xl font-bold text-primary">404</h1>
        <p className="mt-4 text-muted-foreground">Page introuvable</p>
        <a href="/" className="mt-6 inline-block rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
          Retour à l'accueil
        </a>
      </div>
    </div>
  );
}

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
