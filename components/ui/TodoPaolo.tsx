// Segnaposto per un dato che deve dare Paolo (docs/TODO-PAOLO.md). Si vede solo
// in sviluppo: nel sito pubblicato non compare niente al suo posto.
export function TodoPaolo({ children }: { children: string }) {
  if (process.env.NODE_ENV === "production") return null;
  return (
    <span className="inline-block border border-dashed border-current px-2 py-0.5 font-mono text-xs opacity-70" title="TODO-PAOLO">
      TODO-PAOLO: {children}
    </span>
  );
}
