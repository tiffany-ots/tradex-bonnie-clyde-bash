import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/dashboard")({
  component: AdminDashboard,
  head: () => ({
    meta: [
      { title: "Dashboard Admin — Tradex Party 2026" },
      { name: "description", content: "Tableau de bord administrateur." },
    ],
  }),
});

interface Category {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

interface Candidate {
  id: string;
  category_id: string;
  full_name: string;
  department: string | null;
  photo_url: string | null;
  description: string | null;
  created_at: string;
}

interface Vote {
  id: string;
  candidate_id: string;
  voter_name: string;
  created_at: string;
}

function AdminDashboard() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "candidates" | "categories" | "votes">("overview");

  // Category form
  const [showCatForm, setShowCatForm] = useState(false);
  const [catName, setCatName] = useState("");
  const [catDesc, setCatDesc] = useState("");

  useEffect(() => {
    if (sessionStorage.getItem("tradex_admin") !== "true") {
      navigate({ to: "/admin" });
    }
  }, [navigate]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [catRes, candRes, voteRes] = await Promise.all([
      supabase.from("categories").select("*").order("created_at", { ascending: false }),
      supabase.from("candidates").select("*").order("created_at", { ascending: false }),
      supabase.from("votes").select("*").order("created_at", { ascending: false }),
    ]);
    if (catRes.data) setCategories(catRes.data as Category[]);
    if (candRes.data) setCandidates(candRes.data as Candidate[]);
    if (voteRes.data) setVotes(voteRes.data as Vote[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleLogout = () => {
    sessionStorage.removeItem("tradex_admin");
    navigate({ to: "/admin" });
  };

  const addCategory = async () => {
    if (!catName.trim()) return;
    await supabase.from("categories").insert({ name: catName.trim(), description: catDesc.trim() || null });
    setCatName("");
    setCatDesc("");
    setShowCatForm(false);
    fetchData();
  };

  const deleteCategory = async (id: string) => {
    await supabase.from("categories").delete().eq("id", id);
    fetchData();
  };

  const deleteCandidate = async (id: string) => {
    await supabase.from("candidates").delete().eq("id", id);
    fetchData();
  };

  const getCategoryName = (catId: string) => categories.find((c) => c.id === catId)?.name ?? "—";
  const getCandidateName = (candId: string) => candidates.find((c) => c.id === candId)?.full_name ?? "—";

  const totalVoters = new Set(votes.map((v) => v.voter_name)).size;

  const tabs = [
    { key: "overview" as const, label: "Vue d'ensemble", icon: "📊" },
    { key: "candidates" as const, label: "Inscrits", icon: "👥" },
    { key: "categories" as const, label: "Catégories", icon: "📁" },
    { key: "votes" as const, label: "Votes", icon: "🗳️" },
  ];

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="font-heading text-3xl font-bold text-foreground">Dashboard Admin</h1>
          <p className="mt-1 text-sm text-muted-foreground">Gestion de l'événement Tradex Party 2026</p>
        </div>
        <button
          onClick={handleLogout}
          className="self-start rounded-xl border border-border px-5 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
        >
          Déconnexion
        </button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-8">
        {[
          { label: "Catégories", value: categories.length, color: "bg-primary/10 text-primary" },
          { label: "Inscrits", value: candidates.length, color: "bg-accent text-accent-foreground" },
          { label: "Votes", value: votes.length, color: "bg-chart-3/15 text-chart-3" },
          { label: "Votants uniques", value: totalVoters, color: "bg-chart-5/15 text-chart-5" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{stat.label}</p>
            <p className={`mt-2 font-heading text-3xl font-bold ${stat.color.split(" ")[1]}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl bg-muted p-1 mb-6 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.key
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span>{tab.icon}</span>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Recent candidates */}
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="border-b border-border p-5">
              <h3 className="font-heading text-lg font-bold text-card-foreground">Derniers inscrits</h3>
            </div>
            {candidates.length === 0 ? (
              <p className="p-5 text-sm text-muted-foreground">Aucun inscrit pour le moment.</p>
            ) : (
              <div className="divide-y divide-border">
                {candidates.slice(0, 5).map((c) => (
                  <div key={c.id} className="flex items-center gap-3 px-5 py-3">
                    {c.photo_url ? (
                      <img src={c.photo_url} alt={c.full_name} className="h-10 w-10 rounded-full object-cover" />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-heading text-sm font-bold text-primary">
                        {c.full_name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-card-foreground truncate">{c.full_name}</p>
                      <p className="text-xs text-muted-foreground">{getCategoryName(c.category_id)}</p>
                    </div>
                    {c.department && (
                      <span className="text-xs text-muted-foreground hidden sm:inline">{c.department}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Votes per category */}
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="border-b border-border p-5">
              <h3 className="font-heading text-lg font-bold text-card-foreground">Votes par catégorie</h3>
            </div>
            <div className="divide-y divide-border">
              {categories.map((cat) => {
                const catCandIds = candidates.filter((c) => c.category_id === cat.id).map((c) => c.id);
                const catVotes = votes.filter((v) => catCandIds.includes(v.candidate_id)).length;
                const maxVotes = Math.max(1, ...categories.map((ct) => {
                  const ids = candidates.filter((c) => c.category_id === ct.id).map((c) => c.id);
                  return votes.filter((v) => ids.includes(v.candidate_id)).length;
                }));
                return (
                  <div key={cat.id} className="px-5 py-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-card-foreground">{cat.name}</p>
                      <span className="text-sm font-bold text-primary">{catVotes}</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full hero-gradient transition-all duration-500"
                        style={{ width: `${(catVotes / maxVotes) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeTab === "candidates" && (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="border-b border-border p-5">
            <h3 className="font-heading text-lg font-bold text-card-foreground">
              Tous les inscrits ({candidates.length})
            </h3>
          </div>
          {candidates.length === 0 ? (
            <p className="p-5 text-sm text-muted-foreground">Aucun inscrit.</p>
          ) : (
            <div className="divide-y divide-border">
              {candidates.map((c) => {
                const candVotes = votes.filter((v) => v.candidate_id === c.id).length;
                return (
                  <div key={c.id} className="flex items-center gap-3 px-5 py-3">
                    {c.photo_url ? (
                      <img src={c.photo_url} alt={c.full_name} className="h-10 w-10 rounded-full object-cover" />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-heading text-sm font-bold text-primary">
                        {c.full_name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-card-foreground truncate">{c.full_name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{getCategoryName(c.category_id)}</span>
                        {c.department && <><span>•</span><span>{c.department}</span></>}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-medium text-primary">{candVotes} vote{candVotes !== 1 ? "s" : ""}</span>
                      <button
                        onClick={() => deleteCandidate(c.id)}
                        className="rounded-lg bg-destructive/10 px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/20 transition-colors"
                      >
                        Retirer
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === "categories" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setShowCatForm(!showCatForm)}
              className="rounded-xl hero-gradient px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20 hover:brightness-110 transition-all"
            >
              {showCatForm ? "Annuler" : "+ Nouvelle catégorie"}
            </button>
          </div>

          {showCatForm && (
            <div className="rounded-2xl border border-border bg-card p-6">
              <h3 className="font-heading text-lg font-bold text-card-foreground mb-4">Nouvelle catégorie</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Nom de la catégorie"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <textarea
                  placeholder="Description (optionnel)"
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                  rows={2}
                  className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
                <button
                  onClick={addCategory}
                  className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Créer
                </button>
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            {categories.length === 0 ? (
              <p className="p-5 text-sm text-muted-foreground">Aucune catégorie.</p>
            ) : (
              <div className="divide-y divide-border">
                {categories.map((cat) => {
                  const catCandCount = candidates.filter((c) => c.category_id === cat.id).length;
                  const catCandIds = candidates.filter((c) => c.category_id === cat.id).map((c) => c.id);
                  const catVotes = votes.filter((v) => catCandIds.includes(v.candidate_id)).length;
                  return (
                    <div key={cat.id} className="flex items-center justify-between px-5 py-4">
                      <div>
                        <p className="text-sm font-medium text-card-foreground">{cat.name}</p>
                        {cat.description && (
                          <p className="text-xs text-muted-foreground mt-0.5">{cat.description}</p>
                        )}
                        <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
                          <span>{catCandCount} inscrit{catCandCount !== 1 ? "s" : ""}</span>
                          <span>{catVotes} vote{catVotes !== 1 ? "s" : ""}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteCategory(cat.id)}
                        className="rounded-lg bg-destructive/10 px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/20 transition-colors"
                      >
                        Supprimer
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "votes" && (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="border-b border-border p-5">
            <h3 className="font-heading text-lg font-bold text-card-foreground">
              Historique des votes ({votes.length})
            </h3>
          </div>
          {votes.length === 0 ? (
            <p className="p-5 text-sm text-muted-foreground">Aucun vote pour le moment.</p>
          ) : (
            <div className="divide-y divide-border max-h-[500px] overflow-y-auto">
              {votes.map((v) => (
                <div key={v.id} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <p className="text-sm text-card-foreground">
                      <span className="font-medium">{v.voter_name}</span>
                      <span className="text-muted-foreground"> a voté pour </span>
                      <span className="font-medium">{getCandidateName(v.candidate_id)}</span>
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(v.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
