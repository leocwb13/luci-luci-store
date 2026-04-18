import Link from "next/link";
import { notFound } from "next/navigation";

import { Header } from "@/components/header";
import { ProductPageView } from "@/components/product-page-view";
import { getKitBySlug, getSettings } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function KitPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [kit, settings] = await Promise.all([getKitBySlug(slug), getSettings()]);
  if (!kit || !kit.active) notFound();

  return (
    <div className="page-shell">
      <Header settings={settings} />
      <ProductPageView item={kit} />
      <section className="hero product-hero">
        <div className="hero-card hero-copy">
          <p className="hero-kicker" style={{ color: kit.accent }}>{kit.categoryLabel}</p>
          <h1>{kit.name}</h1>
          <p className="muted hero-body">{kit.shortDescription}</p>
          <div className="summary-stack">
            <div className="summary-line"><span>Preco do kit</span><strong>{formatCurrency(kit.priceInCents)}</strong></div>
            <div className="summary-line"><span>Preco separado</span><strong>{formatCurrency(kit.compareAtInCents)}</strong></div>
            <div className="summary-line"><span>Economia</span><strong>{formatCurrency(kit.savingsInCents)}</strong></div>
          </div>
          <div className="hero-actions">
            <Link href="/checkout" className="primary-button">Ir para checkout</Link>
            <a className="ghost-button" href={`https://wa.me/${settings.whatsapp}?text=Ola! Quero saber mais sobre o ${kit.name}.`} target="_blank">Falar no WhatsApp</a>
          </div>
        </div>
        <aside className="hero-card hero-side" style={{ background: kit.background }}>
          {kit.imageUrl ? (
            <img className="product-image product-detail-image" src={kit.imageUrl} alt={kit.name} />
          ) : (
            <div className="placeholder-tube product-visual" style={{ borderColor: kit.accent }}>
              {kit.imageLabel.map((line) => <span key={line}>{line}</span>)}
            </div>
          )}
          <div className="info-card">
            <strong>{kit.targetAudience}</strong>
            <p className="muted">{kit.description}</p>
          </div>
        </aside>
      </section>

      <section className="content-section">
        <div className="panel content-panel">
          <div className="section-heading compact-heading">
            <p className="section-kicker">Itens do kit</p>
            <h2>O que vem na composição</h2>
          </div>
          <div className="faq-list">
            {kit.items.map((item) => (
              <div className="info-card" key={item.productId}>
                <strong>{item.quantity}x {item.name}</strong>
                <p className="muted">{item.benefit}</p>
              </div>
            ))}
          </div>
          <span className="pill" style={{ marginTop: 12, display: "inline-block" }}>{kit.savingsPercent}% de economia real</span>
        </div>
      </section>
    </div>
  );
}
