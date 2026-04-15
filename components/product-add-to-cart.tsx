"use client";

import { useCart } from "./cart-context";

type Props = {
    id: string;
    slug: string;
    name: string;
    categoryLabel: string;
    priceInCents: number;
    packageLabel: string;
    shortDescription: string;
    stock: number;
};

export function ProductAddToCart({ id, slug, name, categoryLabel, priceInCents, packageLabel, shortDescription, stock }: Props) {
    const { addItem, openDrawer } = useCart();

    function handleAdd() {
        addItem({
            kind: "product",
            itemId: id,
            slug,
            name,
            categoryLabel,
            unitPriceInCents: priceInCents,
            packageLabel,
            summary: shortDescription
        });
        openDrawer();
    }

    if (stock <= 0) {
        return <button className="primary-button full-width" disabled>Produto indisponível</button>;
    }

    return (
        <button className="primary-button full-width" type="button" onClick={handleAdd}>
            Adicionar ao carrinho
        </button>
    );
}