import { Kit } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

export function KitsHighlight({ kits }: { kits: Kit[] }) {
  return (
    <section className="content-section" id="kits">
      <div className="section-heading">
        <p className="section-kicker">Kits em destaque</p>
        <h2>Combos montados para facilitar a escolha e aumentar conversao</h2>
        <p className="muted">
          Cada kit foi pensado para resolver uma dor clara, elevar o ticket medio e reforcar a percepcao de valor.
        </p>
      </div>
      <div className="grid-3">
        {kits.map((kit) => (
          <article className="info-card kit-highlight-card" key={kit.id}>
            <p className="eyebrow" style={{ color: kit.accent }}>{kit.categoryLabel}</p>
            <h3>{kit.name}</h3>
            <p className="muted">{kit.shortDescription}</p>
            <div className="summary-line">
              <span>De {formatCurrency(kit.compareAtInCents)}</span>
              <strong>{formatCurrency(kit.priceInCents)}</strong>
            </div>
            <span className="pill">Economia de {formatCurrency(kit.savingsInCents)}</span>
          </article>
        ))}
      </div>
    </section>
  );
}
