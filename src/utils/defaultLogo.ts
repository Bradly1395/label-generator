// Clean high-resolution SICOSA SVG logo data URI for defaults
export const DEFAULT_LOGO_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200" width="400" height="200">
  <rect width="100%" height="100%" fill="%230f172a" rx="16"/>
  <g transform="translate(40, 30)">
    <!-- Industrial Shield / Hexagon Graphic -->
    <path d="M40 10 L80 32 L80 78 L40 100 L0 78 L0 32 Z" fill="%230284c7" stroke="%2338bdf8" stroke-width="4"/>
    <path d="M40 28 L64 42 L64 68 L40 82 L16 68 L16 42 Z" fill="%230f172a" stroke="%2338bdf8" stroke-width="3"/>
    <circle cx="40" cy="55" r="12" fill="%2338bdf8"/>
    
    <!-- Typography -->
    <text x="100" y="65" font-family="Arial, Helvetica, sans-serif" font-weight="900" font-size="44" fill="%23ffffff" letter-spacing="4">SICOSA</text>
    <text x="102" y="92" font-family="Arial, Helvetica, sans-serif" font-weight="600" font-size="14" fill="%2394a3b8" letter-spacing="6">SOLUCIONES INDUSTRIALES</text>
  </g>
</svg>`;

// Convert SVG to data URL PNG if needed for PPTX
export async function svgToPngBase64(svgUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || 400;
      canvas.height = img.naturalHeight || 200;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      } else {
        resolve(svgUrl);
      }
    };
    img.onerror = () => {
      resolve(svgUrl);
    };
    img.src = svgUrl;
  });
}
