"use client";

import { useState } from "react";

type Props = {
  images?: string[];
  imageUrl?: string | null;
  imageLabel: string[];
  accent: string;
  name: string;
};

export function ProductCarousel({ images, imageUrl, imageLabel, accent, name }: Props) {
  const allImages: string[] = [];
  if (images && images.length > 0) {
    allImages.push(...images);
  } else if (imageUrl) {
    allImages.push(imageUrl);
  }

  const [current, setCurrent] = useState(0);

  if (allImages.length === 0) {
    return (
      <div className="placeholder-tube product-visual" style={{ borderColor: accent }}>
        {imageLabel.map((line) => (
          <span key={line}>{line}</span>
        ))}
      </div>
    );
  }

  if (allImages.length === 1) {
    return <img className="product-image product-detail-image" src={allImages[0]} alt={name} />;
  }

  function prev() {
    setCurrent((c) => (c === 0 ? allImages.length - 1 : c - 1));
  }

  function next() {
    setCurrent((c) => (c === allImages.length - 1 ? 0 : c + 1));
  }

  return (
    <div className="carousel">
      <button className="carousel-btn carousel-prev" type="button" onClick={prev} aria-label="Anterior">
        &#8592;
      </button>
      <img
        className="product-image product-detail-image"
        src={allImages[current]}
        alt={`${name} - foto ${current + 1}`}
      />
      <button className="carousel-btn carousel-next" type="button" onClick={next} aria-label="Próximo">
        &#8594;
      </button>
      <div className="carousel-dots">
        {allImages.map((_, i) => (
          <button
            key={i}
            className={`carousel-dot${i === current ? " active" : ""}`}
            type="button"
            onClick={() => setCurrent(i)}
            aria-label={`Imagem ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
