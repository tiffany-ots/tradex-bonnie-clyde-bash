import { createFileRoute, Link } from "@tanstack/react-router";
import heroImage from "@/assets/hero-bonnie-clyde.jpg";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Tradex Party 2026 — Bonnie & Clyde" },
      { name: "description", content: "Fête des employés Tradex le 25 avril 2026. Thème Bonnie & Clyde. Inscrivez-vous et votez !" },
    ],
  }),
});

function Index() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Bonnie and Clyde themed party"
            className="h-full w-full object-cover"
            width={1920}
            height={800}
          />
          <div className="absolute inset-0 hero-gradient opacity-70" />
        </div>
        <div className="relative mx-auto max-w-4xl px-4 py-24 text-center sm:py-32 md:py-40">
          <p className="text-sm font-medium uppercase tracking-[0.3em] text-gold">
            25 Avril 2026
          </p>
          <h1 className="mt-4 font-heading text-4xl font-black text-primary-foreground sm:text-6xl md:text-7xl leading-tight">
            Bonnie <span className="italic">&</span> Clyde
          </h1>
          <p className="mt-2 font-heading text-xl text-primary-foreground/80 sm:text-2xl">
            Fête des Employés Tradex
          </p>
          <p className="mx-auto mt-6 max-w-xl text-sm text-primary-foreground/70 leading-relaxed">
            Préparez vos plus beaux costumes et venez célébrer avec toute l'équipe Tradex.
            Votez pour vos collègues dans différentes catégories !
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              to="/categories"
              className="rounded-md bg-primary-foreground px-8 py-3 text-sm font-semibold text-primary transition-colors hover:bg-primary-foreground/90"
            >
              Voir les catégories
            </Link>
            <Link
              to="/vote"
              className="rounded-md border border-primary-foreground/30 px-8 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-foreground/10"
            >
              Voter maintenant
            </Link>
          </div>
        </div>
      </section>

      {/* Info cards */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
        <h2 className="text-center font-heading text-3xl font-bold text-foreground sm:text-4xl">
          Comment ça marche ?
        </h2>
        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {[
            {
              step: "01",
              title: "Découvrir les catégories",
              desc: "Consultez les catégories de vote créées par l'administrateur.",
            },
            {
              step: "02",
              title: "S'inscrire",
              desc: "Inscrivez-vous avec votre photo dans la catégorie de votre choix.",
            },
            {
              step: "03",
              title: "Voter",
              desc: "Votez pour vos collègues préférés dans chaque catégorie. Les résultats sont en temps réel !",
            },
          ].map((item) => (
            <div
              key={item.step}
              className="card-hover rounded-xl border border-border bg-card p-6 text-center"
            >
              <span className="text-gradient font-heading text-4xl font-black">
                {item.step}
              </span>
              <h3 className="mt-3 font-heading text-lg font-bold text-card-foreground">
                {item.title}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="hero-gradient py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="font-heading text-3xl font-bold text-primary-foreground sm:text-4xl">
            Prêt à participer ?
          </h2>
          <p className="mt-4 text-primary-foreground/70">
            Commencez par explorer les catégories ou créez-en une nouvelle !
          </p>
          <Link
            to="/categories"
            className="mt-8 inline-block rounded-md bg-primary-foreground px-8 py-3 text-sm font-semibold text-primary transition-colors hover:bg-primary-foreground/90"
          >
            Commencer
          </Link>
        </div>
      </section>
    </div>
  );
}
