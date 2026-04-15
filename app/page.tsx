import { Suspense } from "react";

import { Catalog } from "@/components/catalog";
import { Header } from "@/components/header";
import { KitsHighlight } from "@/components/kits-highlight";
import { getActiveKits, getActiveProducts, getSettings } from "@/lib/store";

export const dynamic = "force-dynamic";

const goals = [
  {
    icon: "🛡️",
    label: "Imunidade & Detox",
    description: "Reforce suas defesas e elimine toxinas",
    tab: "vitae"
  },
  {
    icon: "✨",
    label: "Beleza & Pele",
    description: "Cosméticos e encapsulados para pele radiante",
    tab: "fine"
  },
  {
    icon: "💪",
    label: "Saúde Masculina",
    description: "Vitalidade, disposição e foco no dia a dia",
    tab: "men"
  },
  {
    icon: "🎁",
    label: "Kits & Combos",
    description: "Combinações prontas para melhores resultados",
    tab: "kits"
  }
];

export default async function HomePage() {
  const [products, kits, settings] = await Promise.all([
    getActiveProducts(),
    getActiveKits(),
    getSettings()
  ]);

  return (
    <div className="page-shell">
      <Header settings={settings} />

      <section className="hero">
        <div className="hero-card hero-copy">
          <p className="hero-kicker">Curitiba, PR — entrega e retirada</p>
          <h1>{settings.heroTitle}</h1>
          <p className="muted hero-body">{settings.heroDescription}</p>
          <div className="hero-actions">
            <a
              className="primary-button"
              href={`https://wa.me/${settings.whatsapp}?text=Oi! Quero ajuda para escolher o produto certo.`}
              target="_blank"
            >
              Falar no WhatsApp
            </a>
            <a className="ghost-button" href="#produtos">
              Ver catálogo
            </a>
          </div>
        </div>

        <div className="hero-card hero-side">
          <p className="section-kicker">Qual é o seu objetivo?</p>
          <p className="muted" style={{ marginTop: 6, marginBottom: 16, fontSize: "0.9rem" }}>
            Escolha uma categoria e veja os produtos certos para você.
          </p>
          <div className="goal-grid">
            {goals.map((goal) => (
              <a key={goal.tab} className="goal-card" href={`/?tab=${goal.tab}#produtos`}>
                <span className="goal-icon">{goal.icon}</span>
                <strong>{goal.label}</strong>
                <p className="muted">{goal.description}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      <KitsHighlight kits={kits.filter((kit) => kit.featured).slice(0, 3)} />

      <Suspense>
        <Catalog products={products} kits={kits} />
      </Suspense>

      {/* Selos de confiança */}
      <section className="trust-bar">
        <div className="trust-item">
          <span className="trust-icon">🚚</span>
          <div>
            <strong>Entrega em Curitiba</strong>
            <p className="muted">Entregamos no mesmo dia ou no dia seguinte na sua região</p>
          </div>
        </div>
        <div className="trust-item">
          <span className="trust-icon">✅</span>
          <div>
            <strong>Produto 100% original</strong>
            <p className="muted">Somente produtos oficiais da linha Luci Luci com garantia de qualidade</p>
          </div>
        </div>
        <div className="trust-item">
          <span className="trust-icon">💬</span>
          <div>
            <strong>Atendimento pelo WhatsApp</strong>
            <p className="muted">Tire dúvidas, escolha o produto certo e acompanhe seu pedido</p>
          </div>
        </div>
        <div className="trust-item">
          <span className="trust-icon">🔒</span>
          <div>
            <strong>Compra segura</strong>
            <p className="muted">Pague via Pix, cartão ou dinheiro com total tranquilidade</p>
          </div>
        </div>
      </section>

      {/* Como funciona */}
      <section className="content-section" id="como-funciona">
        <div className="section-heading">
          <p className="section-kicker">Como funciona</p>
          <h2>Simples, rápido e direto — do catálogo ao seu endereço</h2>
        </div>
        <div className="grid-3">
          <div className="info-card">
            <strong>1. Escolha pelo seu objetivo</strong>
            <p className="muted">Produtos e kits organizados por categoria para você decidir com mais facilidade e segurança.</p>
          </div>
          <div className="info-card">
            <strong>2. Monte seu carrinho</strong>
            <p className="muted">Adicione produtos, revise quantidades e confira o total antes de finalizar — tudo em poucos cliques.</p>
          </div>
          <div className="info-card">
            <strong>3. Receba em casa ou retire</strong>
            <p className="muted">Entrega em Curitiba ou retirada no local. Seu pedido é confirmado direto pelo WhatsApp.</p>
          </div>
        </div>
      </section>

      {/* Footer profissional */}
      <footer className="site-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <span className="brand">{settings.brandName.split(" ").map((w, i) => i === 0 ? <span key={i}>{w} </span> : <span key={i} style={{ color: "var(--green-dark)" }}>{w}</span>)}</span>
            <p className="muted">Saúde e beleza com qualidade para Curitiba e região.</p>
          </div>
          <div className="footer-links">
            <a href="#produtos">Catálogo</a>
            <a href="#como-funciona">Como funciona</a>
            <a href={`https://wa.me/${settings.whatsapp}?text=Oi! Quero fazer um pedido.`} target="_blank" rel="noopener noreferrer">WhatsApp</a>
            {settings.instagram ? <a href={settings.instagram} target="_blank" rel="noopener noreferrer">Instagram</a> : null}
          </div>
        </div>
        <div className="footer-bottom">
          <p className="muted">{settings.city} · {new Date().getFullYear()} · Todos os direitos reservados</p>
        </div>
      </footer>

      {/* Botão flutuante WhatsApp */}
      <a
        className="whatsapp-float"
        href={`https://wa.me/${settings.whatsapp}?text=Oi! Vi o site e quero saber mais sobre os produtos.`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Falar no WhatsApp"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
        <span>WhatsApp</span>
      </a>
    </div>
  );
}
