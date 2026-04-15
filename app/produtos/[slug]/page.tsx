import Link from "next/link";
import { notFound } from "next/navigation";

import { Header } from "@/components/header";
import { ProductPageView } from "@/components/product-page-view";
import { getActiveKits, getProductBySlug, getSettings } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [product, settings, kits] = await Promise.all([getProductBySlug(slug), getSettings(), getActiveKits()]);
  if (!product || !product.active) notFound();

  const relatedKits = kits.filter((kit) => kit.items.some((item) => item.productId === product.id)).slice(0, 3);

  return (
    <div className="page-shell">
      <Header settings={settings} />
      <ProductPageView item={product} />
      <section className="hero product-hero">
        <div className="hero-card hero-copy">
          <p className="hero-kicker" style={{ color: product.accent }}>{product.categoryLabel}</p>
          <h1>{product.name}</h1>
          <p className="muted hero-body">{product.shortDescription}</p>
          <div className="summary-stack">
            <div className="summary-line"><span>Preco</span><strong>{formatCurrency(product.priceInCents)}</strong></div>
            <div className="summary-line"><span>Apresentacao</span><strong>{product.packageLabel}</strong></div>
            <div className="summary-line"><span>Estoque</span><strong>{product.stock} unidades</strong></div>
          </div>
          <div className="hero-actions">
            <Link href="/checkout" className="primary-button">Ir para checkout</Link>
            <a className="ghost-button" href={`https://wa.me/${settings.whatsapp}?text=Ola! Quero saber mais sobre ${product.name}.`} target="_blank">Tirar duvidas no WhatsApp</a>
          </div>
        </div>

        <aside className="hero-card hero-side" style={{ background: product.background }}>
          {product.imageUrl ? (
            <img className="product-image product-detail-image" src={product.imageUrl} alt={product.name} />
          ) : (
            <div className="placeholder-tube product-visual" style={{ borderColor: product.accent }}>
              {product.imageLabel.map((line) => <span key={line}>{line}</span>)}
            </div>
          )}
          <div className="info-card">
            <strong>{product.commercialPitch}</strong>
            <p className="muted">{product.description}</p>
          </div>
        </aside>
      </section>

      <section className="content-section product-content-grid">
        <div className="panel content-panel">
          <div className="section-heading compact-heading">
            <p className="section-kicker">Beneficios principais</p>
            <h2>Por que esse produto se destaca</h2>
          </div>
          <div className="benefit-list">
            {product.benefits.map((benefit) => <div className="benefit-card" key={benefit}>{benefit}</div>)}
          </div>
        </div>

        <div className="panel content-panel">
          <div className="section-heading compact-heading">
            <p className="section-kicker">Para quem e</p>
            <h2>Perfil ideal</h2>
          </div>
          <p className="muted">{product.recommendedFor}</p>
          <div className="tag-list">
            {product.highlights.map((highlight) => <span className="pill" key={highlight}>{highlight}</span>)}
          </div>
        </div>
      </section>

      <section className="content-section product-content-grid">
        <div className="panel content-panel">
          <div className="section-heading compact-heading">
            <p className="section-kicker">Modo de uso</p>
            <h2>Como encaixar na rotina</h2>
          </div>
          <p className="muted">{product.usage}</p>
        </div>
        <div className="panel content-panel">
          <div className="section-heading compact-heading">
            <p className="section-kicker">Ativos e composicao</p>
            <h2>O que sustenta a proposta</h2>
          </div>
          <ul className="simple-list">
            {product.ingredients.map((ingredient) => <li key={ingredient}>{ingredient}</li>)}
          </ul>
        </div>
      </section>

      {product.faq.length > 0 ? (
        <section className="content-section">
          <div className="panel content-panel">
            <div className="section-heading compact-heading">
              <p className="section-kicker">Perguntas frequentes</p>
              <h2>Tire duvidas antes de comprar</h2>
            </div>
            <div className="faq-list">
              {product.faq.map((entry) => (
                <div className="info-card" key={entry.question}>
                  <strong>{entry.question}</strong>
                  <p className="muted">{entry.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {relatedKits.length > 0 ? (
        <section className="content-section">
          <div className="section-heading">
            <p className="section-kicker">Kits relacionados</p>
            <h2>Combos que usam esse produto</h2>
          </div>
          <div className="grid-3">
            {relatedKits.map((kit) => (
              <div className="info-card" key={kit.id}>
                <strong>{kit.name}</strong>
                <p className="muted">{kit.shortDescription}</p>
                <div className="summary-line"><span>Kit</span><strong>{formatCurrency(kit.priceInCents)}</strong></div>
                <Link className="ghost-button" href={`/kits/${kit.slug}`}>Ver kit</Link>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
