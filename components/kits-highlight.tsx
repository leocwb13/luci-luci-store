import Link from "next/link";

import { Kit } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

export function KitsHighlight({ kits }: { kits: Kit[] }) {
  return (
    <section className="content-section" id="kits">
      <div className="section-heading">
        <p className="section-kicker">Kits em destaque</p>
        <h2>Combos que as clientes mais pedem — com desconto real</h2>
        <p className="muted">
          Cada kit reúne os produtos mais pedidos para um objetivo específico. Mais praticidade, mais resultado, menos gasto.
        </p>
      </div>
      <div className="grid-3" style={{ justifyItems: "center" }}>
        {kits.map((kit) => (
          <Link href={`/kits/${kit.slug}`} key={kit.id} style={{ textDecoration: "none", color: "inherit" }}>
            <article className="info-card kit-highlight-card" style={{ cursor: "pointer", height: "100%" }}>
              <p className="eyebrow" style={{ color: kit.accent }}>{kit.categoryLabel}</p>
              <h3>{kit.name}</h3>
              <p className="muted">{kit.shortDescription}</p>
              <div className="summary-line">
                <span>De {formatCurrency(kit.compareAtInCents)}</span>
                <strong>{formatCurrency(kit.priceInCents)}</strong>
              </div>
              <span className="pill">Economia de {formatCurrency(kit.savingsInCents)}</span>
            </article>
          </Link>
        ))}
      </div>
    </section>
  );
}