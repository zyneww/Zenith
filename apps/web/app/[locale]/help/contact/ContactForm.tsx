"use client";
import { useState } from "react";
import { CheckCircle, AlertTriangle, Loader2 } from "lucide-react";

export default function ContactForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "Support Technique",
    message: "",
  });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) setStatus("success");
      else setStatus("error");
    } catch {
      setStatus("error");
    }
  }

  const inputCls =
    "w-full bg-inset border border-surface rounded-md px-4 py-3 text-primary placeholder-tertiary focus:border-accent outline-none transition-colors";

  return (
    <form onSubmit={onSubmit} className="bg-card border border-surface rounded-xl p-6 space-y-5">
      <div>
        <label className="block text-sm text-secondary mb-2">Nom</label>
        <input
          className={inputCls}
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
      </div>
      <div>
        <label className="block text-sm text-secondary mb-2">Email</label>
        <input
          type="email"
          className={inputCls}
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
      </div>
      <div>
        <label className="block text-sm text-secondary mb-2">Sujet</label>
        <select
          className={inputCls}
          value={form.subject}
          onChange={(e) => setForm({ ...form, subject: e.target.value })}
        >
          <option>Support Technique</option>
          <option>Facturation</option>
          <option>Politique de confidentialité</option>
          <option>Presse/Media</option>
          <option>Partenariat</option>
        </select>
      </div>
      <div>
        <label className="block text-sm text-secondary mb-2">Message</label>
        <textarea
          rows={6}
          className={inputCls}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          required
        />
      </div>
      <button
        type="submit"
        disabled={status === "loading"}
        className="bg-brand-blue text-on-accent rounded-full px-6 py-3 font-mono text-sm uppercase tracking-wider hover:bg-brand-blue-active transition-colors disabled:opacity-50 inline-flex items-center gap-2"
      >
        {status === "loading" ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" /> Envoi…
          </>
        ) : (
          "Envoyer le message"
        )}
      </button>

      {status === "success" && (
        <p className="flex items-center gap-2 text-up text-sm pt-2">
          <CheckCircle className="w-4 h-4" /> Message envoyé. Réponse sous 24h.
        </p>
      )}
      {status === "error" && (
        <p className="flex items-center gap-2 text-down text-sm pt-2">
          <AlertTriangle className="w-4 h-4" /> Erreur d'envoi, réessayez ou écrivez à team@zenith.xyz
        </p>
      )}
    </form>
  );
}
