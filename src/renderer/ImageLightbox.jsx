import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function ImageLightbox({ image, onClose }) {
  useEffect(() => {
    if (!image) return;

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose();
      }
    };

    window.addEventListener('keydown', onKeyDown, true);
    return () => window.removeEventListener('keydown', onKeyDown, true);
  }, [image, onClose]);

  if (!image) return null;

  return (
    <div className="image-lightbox" onClick={onClose}>
      <button className="image-lightbox-close" onClick={onClose} title="Close">
        <X size={20} />
      </button>
      <img src={image.src} alt={image.alt || ''} onClick={(event) => event.stopPropagation()} />
      {image.alt && <span className="image-lightbox-caption">{image.alt}</span>}
    </div>
  );
}
