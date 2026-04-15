"use client";

import { ChangeEvent, useMemo, useState } from "react";

import { Kit, Product } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

function calculateCompareAt(items: Kit["items"], products: Product[]) {
  return items.reduce((total, item) => {
    const product = products.find((entry) => entry.id === item.productId);
    return total + (product?.priceInCents ?? 0) * item.quantity;
  }, 0);
}

type DiscountMode = "percent" | "fixed";

export function AdminKitManager({ initialKits, products }: { initialKits: Kit[]; products: Product[] }) {
  const [kits, setKits] = useState(initialKits);
  const [draft, setDraft] = useState<Kit | null>(null);
  const [message, setMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [discountMode, setDiscountMode] = useState<DiscountMode>("percent");
  const [discountValue, setDiscountValue] = useState(0);

  const emptyDraft: Kit = {
    id: "",
    slug: "",
    name: "",
    shortDescription: "",
    description: "",
    categoryLabel: "Kits",
    priceInCents: 0,
    compareAtInCents: 0,
    savingsInCents: 0,
    savingsPercent: 0,
    targetAudience: "",
    salesTip: "",
    ctaText: "",
    accent: "#7c9887",
    background: "linear-gradient(135deg,#edf4ee,#d9e7db)",
    imageLabel: ["Kit", "Luci", "Luci"],
    imageUrl: "",
    notes: "",
    featured: false,
    active: true,
    items: []
  };

  const currentDraft = draft ?? emptyDraft;
  const compareAtPreview = useMemo(() => calculateCompareAt(currentDraft.items, products), [currentDraft.items, products]);

  // Calcula preço automático pelo desconto definido
  const autoPrice = useMemo(() => {
    if (compareAtPreview === 0) return 0;
    if (discountMode === "percent") {
      return Math.round(compareAtPreview * (1 - discountValue / 100));
    }
    return Math.max(compareAtPreview - Math.round(discountValue * 100), 0);
  }, [compareAtPreview, discountMode, discountValue]);

  const effectivePrice = currentDraft.priceInCents > 0 ? currentDraft.priceInCents : autoPrice;
  const savingsPreview = Math.max(compareAtPreview - effectivePrice, 0);

  async function uploadImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch("/api/admin/upload", {
      method: "POST",
      body: formData
    });
    const data = (await response.json()) as { imageUrl?: string; error?: string };
    if (!response.ok || !data.imageUrl) {
      setMessage(data.error ?? "Nao foi possivel enviar a imagem.");
      setIsUploading(false);
      return;
    }
    setDraft({ ...currentDraft, imageUrl: data.imageUrl ?? "" });
    setIsUploading(false);
    setMessage("Imagem enviada com sucesso.");
  }

  async function saveKit() {
    const finalPrice = currentDraft.priceInCents > 0 ? currentDraft.priceInCents : autoPrice;
    const current = {
      ...currentDraft,
      priceInCents: finalPrice,
      compareAtInCents: compareAtPreview,
      savingsInCents: Math.max(compareAtPreview - finalPrice, 0),
      savingsPercent: compareAtPreview > 0 ? Math.round((Math.max(compareAtPreview - finalPrice, 0) / compareAtPreview) * 100) : 0
    };
    const method = current.id ? "PUT" : "POST";
    const url = current.id ? `/api/admin/kits/${current.id}` : "/api/admin/kits";
    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(current)
    });
    const data = (await response.json()) as { kits?: Kit[]; error?: string };
    if (!response.ok) {
      setMessage(data.error ?? "Nao foi possivel salvar o kit.");
      return;
    }
    setKits(data.kits ?? kits);
    setDraft(null);
    setMessage("Kit salvo com sucesso.");
  }

  async function deleteKit(id: string) {
    const response = await fetch(`/api/admin/kits/${id}`, { method: "DELETE" });
    const data = (await response.json()) as { kits?: Kit[]; error?: string };
    if (!response.ok) {
      setMessage(data.error ?? "Nao foi possivel remover o kit.");
      return;
    }
    setKits(data.kits ?? []);
    setMessage("Kit removido.");
  }

  return (
    <div className="checkout-grid">
      <div className="panel field-stack">
        <h2>Gestao de kits</h2>
        <input className="field" placeholder="Nome do kit" value={currentDraft.name} onChange={(event) => setDraft({ ...currentDraft, name: event.target.value })} />
        <div className="field-group">
          <input className="field" placeholder="Slug" value={currentDraft.slug} onChange={(event) => setDraft({ ...currentDraft, slug: event.target.value })} />
          <input className="field" placeholder="Categoria exibida" value={currentDraft.categoryLabel} onChange={(event) => setDraft({ ...currentDraft, categoryLabel: event.target.value })} />
        </div>
        <input className="field" placeholder="Descricao curta" value={currentDraft.shortDescription} onChange={(event) => setDraft({ ...currentDraft, shortDescription: event.target.value })} />
        <textarea className="field-textarea" rows={4} placeholder="Descricao" value={currentDraft.description} onChange={(event) => setDraft({ ...currentDraft, description: event.target.value })} />
        <div className="field-group">
          <input className="field" type="number" min={0} step={0.01} placeholder="Preço do kit (R$)" value={currentDraft.priceInCents > 0 ? currentDraft.priceInCents / 100 : ""} onChange={(event) => setDraft({ ...currentDraft, priceInCents: Math.round(parseFloat(event.target.value || "0") * 100) })} />
          <input className="field" placeholder="URL da imagem" value={currentDraft.imageUrl ?? ""} onChange={(event) => setDraft({ ...currentDraft, imageUrl: event.target.value })} />
        </div>
        <div className="field-stack">
          <label className="ghost-button upload-button">
            <input type="file" accept="image/*" hidden onChange={uploadImage} />
            {isUploading ? "Enviando imagem..." : "Enviar foto"}
          </label>
          {currentDraft.imageUrl ? <img className="admin-preview-image" src={currentDraft.imageUrl} alt={currentDraft.name || "Preview do kit"} /> : null}
        </div>
        <div className="field-group">
          <textarea className="field-textarea" rows={3} placeholder="Publico-alvo" value={currentDraft.targetAudience} onChange={(event) => setDraft({ ...currentDraft, targetAudience: event.target.value })} />
          <textarea className="field-textarea" rows={3} placeholder="Dica de venda" value={currentDraft.salesTip} onChange={(event) => setDraft({ ...currentDraft, salesTip: event.target.value })} />
        </div>
        <input className="field" placeholder="CTA do kit" value={currentDraft.ctaText} onChange={(event) => setDraft({ ...currentDraft, ctaText: event.target.value })} />
        <textarea className="field-textarea" rows={3} placeholder="Observacoes internas" value={currentDraft.notes ?? ""} onChange={(event) => setDraft({ ...currentDraft, notes: event.target.value })} />
        {/* Configuração de desconto */}
        <div className="panel field-stack" style={{ background: "rgba(124,152,135,0.06)", boxShadow: "none" }}>
          <strong style={{ fontSize: "0.88rem", color: "var(--green-dark)" }}>Desconto automático</strong>
          <div className="field-group">
            <select
              className="field-select"
              value={discountMode}
              onChange={(event) => setDiscountMode(event.target.value as DiscountMode)}
            >
              <option value="percent">Desconto em % (percentual)</option>
              <option value="fixed">Desconto em R$ (valor fixo)</option>
            </select>
            <input
              className="field"
              type="number"
              min={0}
              step={discountMode === "percent" ? 1 : 0.01}
              placeholder={discountMode === "percent" ? "Ex: 15 (15%)" : "Ex: 30 (R$ 30)"}
              value={discountValue}
              onChange={(event) => setDiscountValue(Number(event.target.value))}
            />
          </div>
          <div className="summary-card" style={{ boxShadow: "none" }}>
            <div className="list-row"><span>Preço separado (soma)</span><strong>{formatCurrency(compareAtPreview)}</strong></div>
            <div className="list-row"><span>Preço do kit (com desconto)</span><strong>{formatCurrency(effectivePrice)}</strong></div>
            <div className="list-row"><span>Economia</span><strong style={{ color: "var(--green-dark)" }}>{formatCurrency(savingsPreview)}</strong></div>
          </div>
          <p className="muted" style={{ fontSize: "0.78rem" }}>
            Se você deixar o campo "Preço do kit em centavos" em zero, o preço será calculado automaticamente pelo desconto acima.
          </p>
        </div>
        <div className="field-stack">
          <strong>Produtos do kit</strong>
          {products.map((product) => {
            const existing = currentDraft.items.find((item) => item.productId === product.id);
            return (
              <div key={product.id} className="summary-card">
                <label className="checkbox-row">
                  <input
                    type="checkbox"
                    checked={Boolean(existing)}
                    onChange={(event) =>
                      setDraft({
                        ...currentDraft,
                        items: event.target.checked
                          ? [...currentDraft.items, { productId: product.id, name: product.name, quantity: 1, benefit: product.shortDescription }]
                          : currentDraft.items.filter((item) => item.productId !== product.id)
                      })
                    }
                  />
                  <span>{product.name}</span>
                </label>
                {existing ? (
                  <div className="field-group compact-grid">
                    <input
                      className="field"
                      type="number"
                      min={1}
                      value={existing.quantity}
                      onChange={(event) =>
                        setDraft({
                          ...currentDraft,
                          items: currentDraft.items.map((item) =>
                            item.productId === product.id ? { ...item, quantity: Number(event.target.value) || 1 } : item
                          )
                        })
                      }
                    />
                    <input
                      className="field"
                      value={existing.benefit}
                      onChange={(event) =>
                        setDraft({
                          ...currentDraft,
                          items: currentDraft.items.map((item) =>
                            item.productId === product.id ? { ...item, benefit: event.target.value } : item
                          )
                        })
                      }
                    />
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
        {message ? <div className="flash">{message}</div> : null}
        <div className="header-actions">
          <label><input type="checkbox" checked={currentDraft.active} onChange={(event) => setDraft({ ...currentDraft, active: event.target.checked })} /> Ativo</label>
          <label><input type="checkbox" checked={currentDraft.featured} onChange={(event) => setDraft({ ...currentDraft, featured: event.target.checked })} /> Destaque</label>
        </div>
        <div className="header-actions">
          <button className="primary-button" type="button" onClick={saveKit}>Salvar kit</button>
          <button className="ghost-button" type="button" onClick={() => setDraft(null)}>Limpar</button>
        </div>
      </div>

      <div className="table-shell">
        <h2>Kits cadastrados</h2>
        <div className="mobile-admin-list">
          {kits.map((kit) => (
            <div className="summary-card" key={kit.id}>
              <div className="summary-line">
                <strong>{kit.name}</strong>
                <span className="pill">{kit.items.length} itens</span>
              </div>
              {kit.imageUrl ? <img className="admin-preview-image small" src={kit.imageUrl} alt={kit.name} /> : null}
              <div className="list-row">
                <span>Preco</span>
                <strong>{formatCurrency(kit.priceInCents)}</strong>
              </div>
              <div className="list-row">
                <span>Economia</span>
                <strong>{formatCurrency(kit.savingsInCents)}</strong>
              </div>
              <div className="header-actions">
                <button className="ghost-button" type="button" onClick={() => setDraft(kit)}>Editar</button>
                <button className="danger-button" type="button" onClick={() => deleteKit(kit.id)}>Excluir</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
