import Link from "next/link";
import { notFound } from "next/navigation";

import { Header } from "@/components/header";
import { ProductAddToCart } from "@/components/product-add-to-cart";
import { ProductCarousel } from "@/components/product-carousel";
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

      {/* Hero do produto */}
      <section className="hero product-hero">
        <div className="hero-card hero-copy">
          <p className="hero-kicker" style={{ color: product.accent }}>{product.categoryLabel}</p>
          <h1>{product.name}</h1>
          <p className="muted hero-body">{product.shortDescription}</p>

          <div className="summary-stack" style={{ margin: "16px 0" }}>
            <div className="summary-line">
              <span>Preço</span>
              <strong style={{ fontSize: "1.4rem", color: product.accent }}>{formatCurrency(product.priceInCents)}</strong>
            </div>
            <div className="summary-line">
              <span>Apresentação</span>
              <strong>{product.packageLabel}</strong>
            </div>
            <div className="summary-line">
              <span>Disponibilidade</span>
              <strong style={{ color: product.stock > 0 ? "var(--green-dark)" : "red" }}>
                {product.stock > 0 ? `${product.stock} em estoque` : "Indisponível"}
              </strong>
            </div>
          </div>

          <div className="field-stack" style={{ gap: 10 }}>
            <ProductAddToCart
              id={product.id}
              slug={product.slug}
              name={product.name}
              categoryLabel={product.categoryLabel}
              priceInCents={product.priceInCents ?? 0}
              packageLabel={product.packageLabel}
              shortDescription={product.shortDescription}
              stock={product.stock}
            /><a className="ghost-button full-width" href={`https://wa.me/${settings.whatsapp}?text=Ola! Quero saber mais sobre ${product.name}.`} target="_blank" style={{ textAlign: "center" }}>Tirar dúvidas no WhatsApp</a>
          </div>
        </div>

        <aside className="hero-card hero-side" style={{ background: product.background }}>
          <ProductCarousel
            images={product.images}
            imageUrl={product.imageUrl}
            imageLabel={product.imageLabel}
            accent={product.accent}
            name={product.name}
          />
          {product.commercialPitch ? (
            <div className="info-card" style={{ marginTop: 16 }}>
              <strong>{product.commercialPitch}</strong>
            </div>
          ) : null}
        </aside>
      </section >

      {/* Benefícios e Para quem é */}
      {
        product.benefits.length > 0 ? (
          <section className="content-section product-content-grid">
            <div className="panel content-panel">
              <div className="section-heading compact-heading">
                <p className="section-kicker">Benefícios principais</p>
                <h2>Por que esse produto se destaca</h2>
              </div>
              <div className="benefit-list">
                {product.benefits.map((benefit) => (
                  <div className="benefit-card" key={benefit}>{benefit}</div>
                ))}
              </div>
            </div>

            <div className="panel content-panel">
              <div className="section-heading compact-heading">
                <p className="section-kicker">Para quem é</p>
                <h2>Perfil ideal</h2>
              </div>
              <p className="muted">{product.recommendedFor}</p>
              {product.highlights.length > 0 ? (
                <div className="tag-list" style={{ marginTop: 12 }}>
                  {product.highlights.map((highlight) => (
                    <span className="pill" key={highlight}>{highlight}</span>
                  ))}
                </div>
              ) : null}
            </div>
          </section>
        ) : null
      }

      {/* Modo de uso e Ingredientes */}
      {
        (product.usage || product.ingredients.length > 0) ? (
          <section className="content-section product-content-grid">
            {product.usage ? (
              <div className="panel content-panel">
                <div className="section-heading compact-heading">
                  <p className="section-kicker">Modo de uso</p>
                  <h2>Como usar na rotina</h2>
                </div>
                <p className="muted">{product.usage}</p>
              </div>
            ) : null}
            {product.ingredients.length > 0 ? (
              <div className="panel content-panel">
                <div className="section-heading compact-heading">
                  <p className="section-kicker">Composição</p>
                  <h2>Ativos e ingredientes</h2>
                </div>
                <ul className="simple-list">
                  {product.ingredients.map((ingredient) => (
                    <li key={ingredient}>{ingredient}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </section>
        ) : null
      }

      {/* FAQ */}
      {
        product.faq.length > 0 ? (
          <section className="content-section">
            <div className="panel content-panel">
              <div className="section-heading compact-heading">
                <p className="section-kicker">Dúvidas frequentes</p>
                <h2>Perguntas antes de comprar</h2>
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
        ) : null
      }

      {/* Kits relacionados */}
      {
        relatedKits.length > 0 ? (
          <section className="content-section">
            <div className="section-heading">
              <p className="section-kicker">Kits relacionados</p>
              <h2>Combos que usam esse produto</h2>
            </div>
            <div className="grid-3">
              {relatedKits.map((kit) => (
                <Link className="info-card" key={kit.id} href={`/kits/${kit.slug}`} style={{ textDecoration: "none", color: "inherit", display: "block" }}>
                  <strong>{kit.name}</strong>
                  <p className="muted">{kit.shortDescription}</p>
                  <div className="summary-line" style={{ marginTop: 8 }}>
                    <span>Kit</span>
                    <strong>{formatCurrency(kit.priceInCents)}</strong>
                  </div>
                  <span className="pill" style={{ marginTop: 8, display: "inline-block" }}>Economia de {formatCurrency(kit.savingsInCents)}</span>
                </Link>
              ))}
            </div>
          </section>
        ) : null
      }
    </div >
  );
}