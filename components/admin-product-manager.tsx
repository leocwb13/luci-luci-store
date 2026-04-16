"use client";

import { ChangeEvent, useState } from "react";

import { Product } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

type DraftProduct = {
  id?: string;
  slug: string;
  name: string;
  description: string;
  shortDescription: string;
  category: Product["category"];
  categoryLabel: string;
  priceInCents: number;
  packageLabel: string;
  stock: number;
  minStock: number;
  active: boolean;
  featured: boolean;
  accent: string;
  background: string;
  imageUrl: string;
  images: string[];
  notes: string;
};

type BulkEdit = { priceInCents: number; stock: number };

const emptyDraft: DraftProduct = {
  slug: "",
  name: "",
  description: "",
  shortDescription: "",
  category: "vitae",
  categoryLabel: "Linha Vitae",
  priceInCents: 0,
  packageLabel: "",
  stock: 0,
  minStock: 3,
  active: true,
  featured: false,
  accent: "#7c9887",
  background: "linear-gradient(135deg,#edf4ee,#d9e7db)",
  imageUrl: "",
  images: [],
  notes: ""
};

export function AdminProductManager({ initialProducts }: { initialProducts: Product[] }) {
  const [products, setProducts] = useState(initialProducts);
  const [draft, setDraft] = useState<DraftProduct>(emptyDraft);
  const [message, setMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // ── Edição em massa ──────────────────────────────────────────
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkEdits, setBulkEdits] = useState<Record<string, BulkEdit>>({});
  const [isSavingBulk, setIsSavingBulk] = useState(false);

  function enterBulkMode() {
    const initial: Record<string, BulkEdit> = {};
    products.forEach((p) => {
      initial[p.id] = { priceInCents: p.priceInCents ?? 0, stock: p.stock };
    });
    setBulkEdits(initial);
    setBulkMode(true);
    setMessage("");
  }

  async function saveBulkEdits() {
    setIsSavingBulk(true);
    setMessage("");

    const changed = products.filter((p) => {
      const edit = bulkEdits[p.id];
      return edit && (edit.priceInCents !== (p.priceInCents ?? 0) || edit.stock !== p.stock);
    });

    if (changed.length === 0) {
      setMessage("Nenhuma alteração para salvar.");
      setIsSavingBulk(false);
      return;
    }

    let lastProducts: Product[] = products;
    let errors = 0;

    for (const product of changed) {
      const edit = bulkEdits[product.id];
      const response = await fetch(`/api/admin/produtos/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...product,
          priceInCents: edit.priceInCents,
          stock: edit.stock
        })
      });
      const data = (await response.json()) as { products?: Product[]; error?: string };
      if (!response.ok) {
        errors++;
      } else if (data.products) {
        lastProducts = data.products;
      }
    }

    setProducts(lastProducts);
    setBulkMode(false);
    setIsSavingBulk(false);
    setMessage(
      errors > 0
        ? `Salvo com ${errors} erro(s). Verifique os produtos.`
        : `${changed.length} produto(s) atualizado(s) com sucesso.`
    );
  }

  // ── Upload de imagem principal (capa) ────────────────────────
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
      setMessage(data.error ?? "Não foi possível enviar a imagem.");
      setIsUploading(false);
      return;
    }
    setDraft((current) => ({ ...current, imageUrl: data.imageUrl ?? "" }));
    setIsUploading(false);
    setMessage("Imagem de capa enviada com sucesso.");
  }

  // ── Upload de imagens adicionais (carrossel) ─────────────────
  async function uploadExtraImage(event: ChangeEvent<HTMLInputElement>) {
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
      setMessage(data.error ?? "Não foi possível enviar a imagem.");
      setIsUploading(false);
      return;
    }
    setDraft((current) => ({ ...current, images: [...(current.images ?? []), data.imageUrl!] }));
    setIsUploading(false);
    setMessage("Imagem adicional enviada.");
    event.target.value = "";
  }

  function removeExtraImage(index: number) {
    setDraft((current) => ({
      ...current,
      images: current.images.filter((_, i) => i !== index)
    }));
  }

  // ── Salvar produto individual ────────────────────────────────
  async function saveProduct() {
    const method = draft.id ? "PUT" : "POST";
    const url = draft.id ? `/api/admin/produtos/${draft.id}` : "/api/admin/produtos";
    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft)
    });
    const data = (await response.json()) as { products?: Product[]; error?: string };
    if (!response.ok) {
      setMessage(data.error ?? "Não foi possível salvar o produto.");
      return;
    }
    setProducts(data.products ?? products);
    setDraft(emptyDraft);
    setMessage("Produto salvo com sucesso.");
  }

  async function deleteProduct(id: string) {
    const response = await fetch(`/api/admin/produtos/${id}`, { method: "DELETE" });
    const data = (await response.json()) as { products?: Product[]; error?: string };
    if (!response.ok) {
      setMessage(data.error ?? "Não foi possível remover o produto.");
      return;
    }
    setProducts(data.products ?? []);
    setMessage("Produto removido.");
  }

  // ── Modo edição em massa ─────────────────────────────────────
  if (bulkMode) {
    return (
      <div className="field-stack">
        <div className="section-heading" style={{ marginBottom: 0 }}>
          <p className="section-kicker">Edição em massa</p>
          <h2>Preço e estoque de todos os produtos</h2>
        </div>
        <p className="muted" style={{ fontSize: "0.88rem" }}>
          Edite preço (em R$) e estoque diretamente na tabela. Apenas produtos alterados serão salvos.
        </p>

        <div className="bulk-table">
          <div className="bulk-table-header">
            <span>Produto</span>
            <span>Preço (R$)</span>
            <span>Estoque</span>
          </div>
          {products.map((product) => {
            const edit = bulkEdits[product.id] ?? { priceInCents: product.priceInCents ?? 0, stock: product.stock };
            const priceChanged = edit.priceInCents !== (product.priceInCents ?? 0);
            const stockChanged = edit.stock !== product.stock;
            const hasChange = priceChanged || stockChanged;
            return (
              <div key={product.id} className={`bulk-table-row${hasChange ? " bulk-row-changed" : ""}`}>
                <span className="bulk-product-name">
                  {product.name}
                  {hasChange && <span className="bulk-changed-dot" title="Alterado">●</span>}
                </span>
                <input
                  className="field bulk-field"
                  type="number"
                  min={0}
                  step={0.01}
                  value={edit.priceInCents / 100}
                  onChange={(e) =>
                    setBulkEdits((prev) => ({
                      ...prev,
                      [product.id]: { ...edit, priceInCents: Math.round(parseFloat(e.target.value || "0") * 100) }
                    }))
                  }
                />
                <input
                  className="field bulk-field"
                  type="number"
                  min={0}
                  step={1}
                  value={edit.stock}
                  onChange={(e) =>
                    setBulkEdits((prev) => ({
                      ...prev,
                      [product.id]: { ...edit, stock: parseInt(e.target.value || "0", 10) }
                    }))
                  }
                />
              </div>
            );
          })}
        </div>

        {message ? <div className="flash">{message}</div> : null}

        <div className="header-actions">
          <button className="primary-button" type="button" onClick={saveBulkEdits} disabled={isSavingBulk}>
            {isSavingBulk ? "Salvando..." : "Salvar alterações"}
          </button>
          <button
            className="ghost-button"
            type="button"
            onClick={() => { setBulkMode(false); setMessage(""); }}
          >
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  // ── Modo normal ──────────────────────────────────────────────
  return (
    <div className="checkout-grid">
      <div className="panel field-stack">
        <h2>{draft.id ? "Editando produto" : "Novo produto"}</h2>

        <input className="field" placeholder="Nome" value={draft.name} onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))} />
        <div className="field-group">
          <input className="field" placeholder="Slug (URL amigável)" value={draft.slug} onChange={(event) => setDraft((current) => ({ ...current, slug: event.target.value }))} />
          <input className="field" placeholder="Linha exibida" value={draft.categoryLabel} onChange={(event) => setDraft((current) => ({ ...current, categoryLabel: event.target.value }))} />
        </div>
        <input className="field" placeholder="Descrição curta" value={draft.shortDescription} onChange={(event) => setDraft((current) => ({ ...current, shortDescription: event.target.value }))} />
        <textarea className="field-textarea" rows={4} placeholder="Descrição completa" value={draft.description} onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))} />
        <div className="field-group">
          <select className="field-select" value={draft.category} onChange={(event) => setDraft((current) => ({ ...current, category: event.target.value as Product["category"] }))}>
            <option value="vitae">Linha Vitae</option>
            <option value="fine">Fine & Cosméticos</option>
            <option value="men">The Men</option>
            <option value="tea">Chás Funcionais</option>
            <option value="performance">Performance</option>
            <option value="gift">Presentes</option>
            <option value="oral-care">Saúde Bucal</option>
          </select>
          <input
            className="field"
            type="number"
            min={0}
            step={0.01}
            placeholder="Preço (R$)"
            value={draft.priceInCents / 100 || ""}
            onChange={(event) => setDraft((current) => ({ ...current, priceInCents: Math.round(parseFloat(event.target.value || "0") * 100) }))}
          />
        </div>
        <div className="field-group">
          <input className="field" placeholder="Rótulo da embalagem (ex: 60 cápsulas)" value={draft.packageLabel} onChange={(event) => setDraft((current) => ({ ...current, packageLabel: event.target.value }))} />
          <input className="field" type="number" min={0} placeholder="Estoque atual" value={draft.stock || ""} onChange={(event) => setDraft((current) => ({ ...current, stock: Number(event.target.value) }))} />
        </div>
        <div className="field-group">
          <input className="field" type="number" min={0} placeholder="Estoque mínimo (alerta)" value={draft.minStock || ""} onChange={(event) => setDraft((current) => ({ ...current, minStock: Number(event.target.value) }))} />
          <input className="field" placeholder="URL da imagem (ou envie abaixo)" value={draft.imageUrl} onChange={(event) => setDraft((current) => ({ ...current, imageUrl: event.target.value }))} />
        </div>

        {/* Upload de imagem principal (capa) */}
        <div className="field-stack">
          <strong style={{ fontSize: "0.88rem" }}>Foto de capa</strong>
          <label className="ghost-button upload-button" style={{ textAlign: "center" }}>
            <input type="file" accept="image/*" hidden onChange={uploadImage} />
            {isUploading ? "Enviando..." : "📷 Enviar foto de capa"}
          </label>
          {draft.imageUrl ? (
            <div style={{ position: "relative", display: "inline-block" }}>
              <img className="admin-preview-image" src={draft.imageUrl} alt={draft.name || "Preview"} />
              <button
                className="danger-button"
                type="button"
                style={{ marginTop: 8, fontSize: "0.8rem" }}
                onClick={() => setDraft((c) => ({ ...c, imageUrl: "" }))}
              >
                Remover capa
              </button>
            </div>
          ) : null}
        </div>

        {/* Upload de imagens adicionais (carrossel) */}
        <div className="field-stack">
          <strong style={{ fontSize: "0.88rem" }}>Fotos adicionais (carrossel)</strong>
          <label className="ghost-button upload-button" style={{ textAlign: "center" }}>
            <input type="file" accept="image/*" hidden onChange={uploadExtraImage} />
            {isUploading ? "Enviando..." : "🖼️ Adicionar foto ao carrossel"}
          </label>
          {draft.images && draft.images.length > 0 ? (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
              {draft.images.map((url, i) => (
                <div key={url} style={{ position: "relative", display: "inline-block" }}>
                  <img
                    className="admin-preview-image small"
                    src={url}
                    alt={`Foto ${i + 1}`}
                    style={{ display: "block" }}
                  />
                  <button
                    className="danger-button"
                    type="button"
                    style={{ marginTop: 4, fontSize: "0.75rem", width: "100%" }}
                    onClick={() => removeExtraImage(i)}
                  >
                    Remover
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="muted" style={{ fontSize: "0.8rem" }}>
              Nenhuma foto adicional. Adicione até 10 fotos para o carrossel.
            </p>
          )}
        </div>

        <div className="field-group">
          <input className="field" placeholder="Cor de destaque (#hex)" value={draft.accent} onChange={(event) => setDraft((current) => ({ ...current, accent: event.target.value }))} />
          <input className="field" placeholder="Background CSS" value={draft.background} onChange={(event) => setDraft((current) => ({ ...current, background: event.target.value }))} />
        </div>
        <textarea className="field-textarea" rows={3} placeholder="Observações internas (não exibido ao cliente)" value={draft.notes} onChange={(event) => setDraft((current) => ({ ...current, notes: event.target.value }))} />
        <div className="header-actions">
          <label><input type="checkbox" checked={draft.active} onChange={(event) => setDraft((current) => ({ ...current, active: event.target.checked }))} /> Ativo</label>
          <label><input type="checkbox" checked={draft.featured} onChange={(event) => setDraft((current) => ({ ...current, featured: event.target.checked }))} /> Destaque</label>
        </div>
        {message ? <div className="flash">{message}</div> : null}
        <div className="header-actions">
          <button className="primary-button" type="button" onClick={saveProduct}>
            {draft.id ? "Atualizar produto" : "Criar produto"}
          </button>
          <button className="ghost-button" type="button" onClick={() => { setDraft(emptyDraft); setMessage(""); }}>
            Limpar
          </button>
        </div>
      </div>

      <div className="table-shell">
        <div className="list-row" style={{ marginBottom: 16 }}>
          <h2 style={{ margin: 0 }}>Catálogo ({products.length})</h2>
          <button className="ghost-button" type="button" onClick={enterBulkMode} style={{ fontSize: "0.85rem" }}>
            ✏️ Edição em massa
          </button>
        </div>
        <div className="mobile-admin-list">
          {products.map((product) => (
            <div className="summary-card" key={product.id}>
              <div className="summary-line">
                <strong>{product.name}</strong>
                <span className={`pill ${product.stock <= product.minStock ? "pill-danger" : ""}`}>
                  {product.stock} un.
                </span>
              </div>
              {product.imageUrl ? <img className="admin-preview-image small" src={product.imageUrl} alt={product.name} /> : null}
              <p className="muted" style={{ fontSize: "0.8rem" }}>{product.categoryLabel} · {product.slug}</p>
              <div className="list-row">
                <span>Preço</span>
                <strong>{formatCurrency(product.priceInCents)}</strong>
              </div>
              <div className="list-row">
                <span>Estoque mínimo</span>
                <strong>{product.minStock}</strong>
              </div>
              <div className="header-actions" style={{ marginTop: 8 }}>
                <button
                  className="ghost-button"
                  type="button"
                  onClick={() =>
                    setDraft({
                      id: product.id,
                      slug: product.slug,
                      name: product.name,
                      description: product.description,
                      shortDescription: product.shortDescription,
                      category: product.category,
                      categoryLabel: product.categoryLabel,
                      priceInCents: product.priceInCents ?? 0,
                      packageLabel: product.packageLabel,
                      stock: product.stock,
                      minStock: product.minStock,
                      active: product.active,
                      featured: product.featured,
                      accent: product.accent,
                      background: product.background,
                      imageUrl: product.imageUrl ?? "",
                      images: product.images ?? [],
                      notes: product.notes ?? ""
                    })
                  }
                >
                  Editar
                </button>
                <button className="danger-button" type="button" onClick={() => deleteProduct(product.id)}>Excluir</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
