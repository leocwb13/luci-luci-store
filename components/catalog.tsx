"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import { Kit, Product } from "@/lib/types";

import { ProductCard } from "./product-card";

const tabs = [
  { key: "todos", label: "Todos" },
  { key: "kits", label: "Kits" },
  { key: "vitaminas", label: "Vitaminas" },
  { key: "vitae", label: "Saúde & Detox" },
  { key: "fine", label: "Beleza & Pele" },
  { key: "men", label: "Saúde Masculina" }
] as const;

type TabKey = (typeof tabs)[number]["key"];

export function Catalog({ products, kits }: { products: Product[]; kits: Kit[] }) {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as TabKey) ?? "todos";
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<TabKey>(
    tabs.some((t) => t.key === initialTab) ? initialTab : "todos"
  );

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesTab =
        activeTab === "todos"
          ? true
          : activeTab === "kits"
            ? false
            : product.category === activeTab;
      const haystack = `${product.name} ${product.description} ${product.shortDescription}`.toLowerCase();
      return matchesTab && haystack.includes(query.toLowerCase());
    });
  }, [activeTab, products, query]);

  const filteredKits = useMemo(() => {
    return kits.filter((kit) => {
      const matchesTab = activeTab === "todos" || activeTab === "kits";
      const haystack = `${kit.name} ${kit.description} ${kit.shortDescription}`.toLowerCase();
      return matchesTab && haystack.includes(query.toLowerCase());
    });
  }, [activeTab, kits, query]);

  return (
    <section className="catalog-section" id="produtos">
      <div className="section-heading">
        <p className="section-kicker">Catalogo</p>
        <h2>Produtos individuais e kits montados para você</h2>
        <p className="muted">
          Busque por dores, beneficios e publicos. O site agora organiza produtos avulsos e combos em uma mesma experiencia.
        </p>
      </div>

      <div className="catalog-toolbar">
        <input
          className="search-input"
          placeholder="Buscar por nome, beneficio, dor ou categoria"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <div className="tabs">
          {tabs.map((tab) => (
            <button key={tab.key} type="button" className={tab.key === activeTab ? "tab active" : "tab"} onClick={() => setActiveTab(tab.key)}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {filteredKits.length > 0 ? (
        <div className="content-section" id="kits">
          <div className="section-heading compact-heading">
            <p className="section-kicker">Kits</p>
            <h2>Combos para aumentar ticket medio e facilitar a decisao</h2>
          </div>
          <div className="product-grid">
            {filteredKits.map((kit) => (
              <ProductCard key={kit.id} item={kit} />
            ))}
          </div>
        </div>
      ) : null}

      {filteredProducts.length > 0 ? (
        <div className="content-section">
          <div className="section-heading compact-heading">
            <p className="section-kicker">Produtos</p>
            <h2>Linhas e tratamentos avulsos</h2>
          </div>
          <div className="product-grid">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} item={product} />
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
