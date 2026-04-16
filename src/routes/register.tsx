import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/register")({
  component: RegisterPage,
  head: () => ({
    meta: [
      { title: "S'inscrire — Tradex Party 2026" },
      { name: "description", content: "Inscrivez-vous comme candidat dans les catégories de vote." },
    ],
  }),
});

interface Category {
  id: string;
  name: string;
  description: string | null;
}

function RegisterPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState("");
  const [fullName, setFullName] = useState("");
  const [department, setDepartment] = useState("");
  const [description, setDescription] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase.from("categories").select("*").order("created_at", { ascending: false });
      if (data) setCategories(data);
      setLoading(false);
    };
    fetchCategories();
  }, []);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: "error", text: "La photo ne doit pas dépasser 5 Mo." });
        return;
      }
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    setMessage(null);
    if (!fullName.trim()) {
      setMessage({ type: "error", text: "Le nom est obligatoire." });
      return;
    }
    if (!photoFile) {
      setMessage({ type: "error", text: "La photo est obligatoire." });
      return;
    }
    if (!selectedCategory) {
      setMessage({ type: "error", text: "Veuillez sélectionner une catégorie." });
      return;
    }

    setSubmitting(true);

    // Upload photo
    const fileExt = photoFile.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const { error: uploadError } = await supabase.storage
      .from("candidate-photos")
      .upload(fileName, photoFile);

    if (uploadError) {
      setMessage({ type: "error", text: "Erreur lors de l'upload de la photo." });
      setSubmitting(false);
      return;
    }

    const { data: urlData } = supabase.storage.from("candidate-photos").getPublicUrl(fileName);

    const { error: insertError } = await supabase.from("candidates").insert({
      category_id: selectedCategory,
      full_name: fullName.trim(),
      department: department.trim() || null,
      description: description.trim() || null,
      photo_url: urlData.publicUrl,
    });

    if (insertError) {
      setMessage({ type: "error", text: "Erreur lors de l'inscription. Réessayez." });
    } else {
      setMessage({ type: "success", text: "Inscription réussie ! 🎉" });
      setFullName("");
      setDepartment("");
      setDescription("");
      setPhotoFile(null);
      setPhotoPreview(null);
      setSelectedCategory("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
    setSubmitting(false);
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:py-16">
      <h1 className="font-heading text-3xl font-bold text-foreground sm:text-4xl">
        S'inscrire comme candidat
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Remplissez le formulaire pour participer aux votes
      </p>

      {message && (
        <div
          className={`mt-6 rounded-md px-4 py-3 text-sm font-medium ${
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
          <p className="text-muted-foreground">Aucune catégorie disponible. L'administrateur doit d'abord créer des catégories.</p>
        </div>
      ) : (
        <div className="mt-8 rounded-xl border border-border bg-card p-6 space-y-5">
          {/* Category */}
          <div>
            <label className="text-sm font-medium text-card-foreground">Catégorie *</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Choisir une catégorie</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Full name */}
          <div>
            <label className="text-sm font-medium text-card-foreground">Nom complet *</label>
            <input
              type="text"
              placeholder="Votre nom complet"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Photo */}
          <div>
            <label className="text-sm font-medium text-card-foreground">Photo *</label>
            <div className="mt-2 flex items-center gap-4">
              {photoPreview ? (
                <img src={photoPreview} alt="Aperçu" className="h-20 w-20 rounded-xl object-cover border border-border" />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/30 text-muted-foreground text-xs text-center px-1">
                  Aucune photo
                </div>
              )}
              <div className="flex-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="w-full text-sm text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-primary-foreground hover:file:bg-primary/90 file:cursor-pointer"
                />
                <p className="mt-1 text-xs text-muted-foreground">Max 5 Mo, JPG/PNG</p>
              </div>
            </div>
          </div>

          {/* Department */}
          <div>
            <label className="text-sm font-medium text-card-foreground">Poste / Département <span className="text-muted-foreground">(facultatif)</span></label>
            <input
              type="text"
              placeholder="Ex: Marketing, Finance..."
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium text-card-foreground">Description <span className="text-muted-foreground">(facultatif)</span></label>
            <textarea
              placeholder="Quelques mots sur vous..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {submitting ? "Inscription en cours..." : "S'inscrire"}
          </button>
        </div>
      )}
    </div>
  );
}
