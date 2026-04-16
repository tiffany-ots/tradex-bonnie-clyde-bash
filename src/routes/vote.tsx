import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/vote")({
  component: VotePage,
  head: () => ({
    meta: [
      { title: "Voter — Tradex Party 2026" },
      { name: "description", content: "Votez pour vos collègues préférés dans chaque catégorie." },
    ],
  }),
});

interface Category {
  id: string;
  name: string;
  description: string | null;
}

interface Candidate {
  id: string;
  category_id: string;
  full_name: string;
  department: string | null;
  photo_url: string | null;
  description: string | null;
}

function VotePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [voterName, setVoterName] = useState("");
  const [votedFor, setVotedFor] = useState<Set<string>>(new Set());
  const [voting, setVoting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const [catRes, candRes] = await Promise.all([
        supabase.from("categories").select("*").order("created_at", { ascending: false }),
        supabase.from("candidates").select("*"),
      ]);
      if (catRes.data) setCategories(catRes.data);
      if (candRes.data) setCandidates(candRes.data as Candidate[]);
      setLoading(false);
    };
    fetchData();
  }, []);

  const vote = async (candidateId: string) => {
    if (!voterName.trim()) {
      setMessage({ type: "error", text: "Veuillez entrer votre nom avant de voter." });
      return;
    }
    setVoting(true);
    setMessage(null);

    const { error } = await supabase.from("votes").insert({
      candidate_id: candidateId,
      voter_name: voterName.trim(),
    });

    if (error) {
      if (error.code === "23505") {
        setMessage({ type: "error", text: "Vous avez déjà voté pour ce candidat !" });
      } else {
        setMessage({ type: "error", text: "Erreur lors du vote. Réessayez." });
      }
    } else {
      setVotedFor((prev) => new Set(prev).add(candidateId));
      setMessage({ type: "success", text: "Vote enregistré !" });
    }
    setVoting(false);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:py-16">
      <h1 className="font-heading text-3xl font-bold text-foreground sm:text-4xl">
        Voter
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Entrez votre nom puis votez pour vos collègues préférés
      </p>

      <div className="mt-6 rounded-xl border border-border bg-card p-4">
        <label className="text-sm font-medium text-card-foreground">Votre nom</label>
        <input
          type="text"
          placeholder="Entrez votre nom complet"
          value={voterName}
          onChange={(e) => setVoterName(e.target.value)}
          className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {message && (
        <div
          className={`mt-4 rounded-md px-4 py-3 text-sm font-medium ${
            message.type === "success"
              ? "bg-accent text-accent-foreground"
              : "bg-destructive/10 text-destructive"
          }`}
        >
          {message.text}
        </div>
      )}

      {loading ? (
        <div className="mt-12 text-center text-muted-foreground">Chargement...</div>
      ) : categories.length === 0 ? (
        <div className="mt-12 rounded-xl border border-dashed border-border bg-muted/30 p-12 text-center">
          <p className="text-muted-foreground">Aucune catégorie disponible pour le moment.</p>
        </div>
      ) : (
        <div className="mt-8 space-y-8">
          {categories.map((cat) => {
            const catCandidates = candidates.filter((c) => c.category_id === cat.id);
            if (catCandidates.length === 0) return null;
            return (
              <div key={cat.id}>
                <h2 className="font-heading text-xl font-bold text-foreground">{cat.name}</h2>
                {cat.description && (
                  <p className="mt-1 text-sm text-muted-foreground">{cat.description}</p>
                )}
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {catCandidates.map((cand) => {
                    const hasVoted = votedFor.has(cand.id);
                    return (
                      <div
                        key={cand.id}
                        className={`card-hover rounded-xl border p-4 text-center transition-colors ${
                          hasVoted ? "border-primary bg-accent" : "border-border bg-card"
                        }`}
                      >
                        {cand.photo_url ? (
                          <img src={cand.photo_url} alt={cand.full_name} className="mx-auto h-16 w-16 rounded-full object-cover" />
                        ) : (
                          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 font-heading text-xl font-bold text-primary">
                            {cand.full_name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <p className="mt-3 text-sm font-semibold text-card-foreground">
                          {cand.full_name}
                        </p>
                        {cand.department && (
                          <p className="text-xs text-muted-foreground">{cand.department}</p>
                        )}
                        {cand.description && (
                          <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{cand.description}</p>
                        )}
                        <button
                          onClick={() => vote(cand.id)}
                          disabled={voting || hasVoted}
                          className={`mt-3 w-full rounded-md px-4 py-2 text-xs font-semibold transition-colors ${
                            hasVoted
                              ? "bg-primary/20 text-primary cursor-default"
                              : "bg-primary text-primary-foreground hover:bg-primary/90"
                          }`}
                        >
                          {hasVoted ? "✓ Voté" : "Voter"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
