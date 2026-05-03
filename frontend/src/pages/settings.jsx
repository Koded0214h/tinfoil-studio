import * as React from "react";
import {
  AlertTriangle,
  Check,
  Loader2,
  RotateCcw,
  Save,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { getAvatarConfig, updateAvatarConfig } from "@/api/avatars";
import { cn } from "@/lib/utils";

const PLATFORMS = ["instagram", "tiktok", "youtube"];
const AVATAR_ID = "vera";

export default function SettingsPage() {
  const [original, setOriginal] = React.useState(null);
  const [draft, setDraft] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [savedAt, setSavedAt] = React.useState(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const config = await getAvatarConfig(AVATAR_ID);
      setOriginal(config);
      setDraft(structuredClone(config));
    } catch (err) {
      setError(err.detail || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const onChange = (key, value) => {
    setDraft((d) => ({ ...d, [key]: value }));
  };

  const onHashtagChange = (platform, value) => {
    setDraft((d) => ({
      ...d,
      hashtag_set: { ...d.hashtag_set, [platform]: value },
    }));
  };

  const dirty = React.useMemo(() => {
    if (!original || !draft) return false;
    return JSON.stringify(original) !== JSON.stringify(draft);
  }, [original, draft]);

  const onSave = async (event) => {
    event.preventDefault();
    if (!dirty || saving) return;
    setSaving(true);
    setError(null);
    try {
      const next = await updateAvatarConfig(AVATAR_ID, {
        visual_prompt: draft.visual_prompt,
        motion_prompt: draft.motion_prompt,
        caption_template: draft.caption_template,
        hashtag_set: draft.hashtag_set,
      });
      setOriginal(next);
      setDraft(structuredClone(next));
      setSavedAt(new Date());
    } catch (err) {
      setError(err.detail || err.message);
    } finally {
      setSaving(false);
    }
  };

  const onRevert = () => {
    if (!original) return;
    setDraft(structuredClone(original));
  };

  return (
    <main className="relative mx-auto max-w-3xl px-6 pb-24 pt-32">
      <header className="space-y-2">
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.4em] text-white/40">
          settings · avatar
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Vera config
        </h1>
        <p className="max-w-xl text-sm text-white/55">
          These prompts are prepended to every image and video generation call.
          They are how Vera stays Vera across runs.
        </p>
      </header>

      {loading && (
        <div className="mt-12 flex items-center gap-2 text-sm text-white/55">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading avatar config…
        </div>
      )}

      {error && (
        <div className="mt-8 rounded-2xl border border-red-500/25 bg-red-500/[0.06] p-4 text-sm text-red-200">
          <AlertTriangle className="mr-2 inline h-4 w-4" />
          {error}
        </div>
      )}

      {draft && (
        <form onSubmit={onSave} className="mt-10 space-y-8">
          <Field
            label="Visual prompt"
            hint="Prepended to every image generation request."
            badge="DALL·E 3"
          >
            <textarea
              value={draft.visual_prompt}
              onChange={(event) =>
                onChange("visual_prompt", event.target.value)
              }
              rows={4}
              className={inputClasses}
            />
          </Field>

          <Field
            label="Motion prompt"
            hint="Prepended to every Seedance video request."
            badge="Seedance 2.0"
          >
            <textarea
              value={draft.motion_prompt}
              onChange={(event) =>
                onChange("motion_prompt", event.target.value)
              }
              rows={3}
              className={inputClasses}
            />
          </Field>

          <Field
            label="Caption template"
            hint="Use {topic} and {hashtags} as placeholders."
            badge="Upload-Post"
          >
            <textarea
              value={draft.caption_template}
              onChange={(event) =>
                onChange("caption_template", event.target.value)
              }
              rows={3}
              className={cn(inputClasses, "font-mono text-sm")}
            />
          </Field>

          <Field
            label="Hashtag set"
            hint="One line per platform; injected as {hashtags} in the caption."
          >
            <div className="space-y-3">
              {PLATFORMS.map((p) => (
                <div key={p} className="flex items-start gap-3">
                  <span className="mt-3 w-20 text-xs uppercase tracking-[0.25em] text-white/45">
                    {p}
                  </span>
                  <input
                    value={draft.hashtag_set?.[p] || ""}
                    onChange={(event) => onHashtagChange(p, event.target.value)}
                    className={cn(inputClasses, "flex-1")}
                  />
                </div>
              ))}
            </div>
          </Field>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/5 pt-6">
            <div className="text-xs text-white/45">
              {savedAt && !dirty && (
                <span className="inline-flex items-center gap-1.5 text-emerald-300">
                  <Check className="h-3.5 w-3.5" />
                  Saved at {savedAt.toLocaleTimeString()}
                </span>
              )}
              {dirty && (
                <span className="inline-flex items-center gap-1.5 text-amber-300">
                  <Sparkles className="h-3.5 w-3.5" />
                  Unsaved changes
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={!dirty || saving}
                onClick={onRevert}
              >
                <RotateCcw className="mr-2 h-3.5 w-3.5" />
                Revert
              </Button>
              <Button type="submit" disabled={!dirty || saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      )}
    </main>
  );
}

const inputClasses =
  "block w-full rounded-lg border border-white/10 bg-black/40 px-3.5 py-2.5 text-sm text-white placeholder-white/30 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/40";

function Field({ label, hint, badge, children }) {
  return (
    <label className="block space-y-2">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-sm font-medium text-white">{label}</span>
        {badge && (
          <span className="rounded-full border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[0.6rem] uppercase tracking-[0.3em] text-white/45">
            {badge}
          </span>
        )}
      </div>
      {children}
      {hint && <p className="text-xs text-white/45">{hint}</p>}
    </label>
  );
}
