/**
 * Lightweight PDF generator using browser print dialog.
 * Replaces jspdf with zero dependencies — uses a hidden iframe + window.print().
 */

interface GeneratePDFOptions {
  title: string;
  content: string;
  styles?: string;
  filename?: string;
  pageSize?: 'letter' | 'a4' | 'custom';
  customSize?: { width: string; height: string };
  orientation?: 'portrait' | 'landscape';
}

const sanitize = (str: string): string => {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
};

const BASE_STYLES = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  @page { margin: 0.5in; }
  body {
    font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
    color: #1c1917;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
    color-adjust: exact !important;
  }
  img { max-width: 100%; }
`;

export function generatePDF({ title, content, styles = '', filename, pageSize = 'letter', customSize, orientation = 'portrait' }: GeneratePDFOptions): void {
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = 'none';
  iframe.style.opacity = '0';
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument || iframe.contentWindow?.document;
  if (!doc) {
    document.body.removeChild(iframe);
    return;
  }

  let pageSizeCSS = '';
  if (customSize) {
    pageSizeCSS = `@page { size: ${customSize.width} ${customSize.height} ${orientation}; margin: 0; }`;
  } else {
    pageSizeCSS = `@page { size: ${pageSize} ${orientation}; margin: 0.5in; }`;
  }

  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      <style>
        ${BASE_STYLES}
        ${pageSizeCSS}
        ${styles}
      </style>
    </head>
    <body>${content}</body>
    </html>
  `);
  doc.close();

  // Wait for images to load before printing
  const images = doc.querySelectorAll('img');
  const imagePromises = Array.from(images).map(img =>
    img.complete ? Promise.resolve() : new Promise<void>(resolve => {
      img.onload = () => resolve();
      img.onerror = () => resolve();
    })
  );

  Promise.all(imagePromises).then(() => {
    setTimeout(() => {
      iframe.contentWindow?.print();
      // Clean up after print dialog closes
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);
    }, 250);
  });
}

/**
 * Generate a branded flyer PDF via print dialog.
 */
export function generateFlyerPDF(opts: {
  companyName: string;
  tagline: string;
  headline: string;
  hook: string;
  phone: string;
  qrUrl: string;
  logoUrl?: string;
  primaryColor: string;
}): void {
  const { companyName, tagline, headline, hook, phone, qrUrl, logoUrl, primaryColor } = opts;

  const safeCompanyName = sanitize(companyName);
  const safeTagline = sanitize(tagline);
  const safeHeadline = sanitize(headline);
  const safeHook = sanitize(hook);
  const safePhone = sanitize(phone);
  const safePrimaryColor = sanitize(primaryColor);

  const logoHTML = logoUrl
    ? `<img src="${sanitize(logoUrl)}" alt="Logo" style="width:80px;height:80px;object-fit:contain;position:absolute;top:10px;left:20px;" />`
    : '';

  const content = `
    <div class="flyer">
      <div class="header" style="background-color:${safePrimaryColor};">
        ${logoHTML}
        <h1>${safeCompanyName}</h1>
        <p class="tagline">${safeTagline}</p>
      </div>
      <div class="body">
        <h2>${safeHeadline}</h2>
        <p class="hook">${safeHook}</p>
      </div>
      <div class="footer">
        <div class="cta">
          <span class="label">Book Today</span>
          <span class="phone">${safePhone}</span>
        </div>
        <img src="${sanitize(qrUrl)}" alt="QR Code" class="qr" />
      </div>
    </div>
  `;

  const styles = `
    .flyer {
      width: 100%;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      font-family: 'Georgia', 'Times New Roman', serif;
    }
    .header {
      position: relative;
      padding: 40px 30px 30px;
      text-align: center;
      color: white;
    }
    .header h1 {
      font-size: 32pt;
      font-weight: 900;
      letter-spacing: 0.02em;
    }
    .header .tagline {
      font-size: 14pt;
      margin-top: 6px;
      opacity: 0.9;
      font-style: italic;
    }
    .body {
      flex: 1;
      padding: 40px 30px;
    }
    .body h2 {
      font-size: 24pt;
      font-weight: 700;
      color: #1c1917;
      margin-bottom: 16px;
    }
    .body .hook {
      font-size: 12pt;
      line-height: 1.7;
      color: #57534e;
      max-width: 500px;
    }
    .footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 24px 30px;
      border-top: 2px dashed #e7e5e4;
      margin: 0 20px 20px;
      border-radius: 16px;
      background: #fafaf9;
    }
    .cta .label {
      display: block;
      font-size: 8pt;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.2em;
      color: #a8a29e;
      margin-bottom: 4px;
    }
    .cta .phone {
      font-size: 14pt;
      font-weight: 700;
      color: #1c1917;
    }
    .qr {
      width: 80px;
      height: 80px;
      border: 1px solid #e7e5e4;
      border-radius: 12px;
      padding: 6px;
      background: white;
    }
  `;

  generatePDF({
    title: `${safeCompanyName}_Flyer`,
    content,
    styles,
    orientation: 'portrait',
  });
}

/**
 * Generate a branded sticker PDF via print dialog.
 */
export function generateStickerPDF(opts: {
  companyName: string;
  stickerText: string;
  stickerStyle: 'round' | 'square' | 'diecut';
  bgColor: string;
  primaryColor: string;
  location?: string;
  logoUrl?: string;
}): void {
  const { companyName, stickerText, stickerStyle, bgColor, primaryColor, location, logoUrl } = opts;

  const safeStickerText = sanitize(stickerText);
  const safeCompanyName = sanitize(companyName);
  const safePrimaryColor = sanitize(primaryColor);
  const safeLocation = location ? sanitize(location) : undefined;

  const isDieCut = stickerStyle === 'diecut';
  const currentBg = isDieCut ? '#ffffff' : sanitize(bgColor);

  let borderRadius = '0';
  let clipPath = 'none';
  if (stickerStyle === 'round') {
    borderRadius = '50%';
  } else if (stickerStyle === 'square') {
    borderRadius = '16px';
  } else {
    borderRadius = '24px';
    clipPath = 'polygon(10% 0, 90% 0, 100% 10%, 100% 90%, 90% 100%, 10% 100%, 0 90%, 0 10%)';
  }

  const logoHTML = logoUrl
    ? `<img src="${sanitize(logoUrl)}" alt="Logo" class="sticker-logo" />`
    : '';

  const content = `
    <div class="sticker-page">
      <div class="sticker" style="
        background-color: ${currentBg};
        border-radius: ${borderRadius};
        clip-path: ${clipPath};
        ${!isDieCut && currentBg === '#ffffff' ? 'border: 1px solid #e5e5e5;' : ''}
      ">
        ${logoHTML}
        <h2 style="color: ${safePrimaryColor};">${safeStickerText}</h2>
        ${safeLocation ? `<div class="location">${safeLocation}</div>` : ''}
      </div>
    </div>
  `;

  const styles = `
    @page { size: 100mm 100mm; margin: 0; }
    body { display: flex; align-items: center; justify-content: center; width: 100mm; height: 100mm; }
    .sticker-page {
      width: 100mm;
      height: 100mm;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .sticker {
      width: 96mm;
      height: 96mm;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 10mm;
      position: relative;
    }
    .sticker-logo {
      width: 30mm;
      height: 30mm;
      object-fit: contain;
      margin-bottom: 8px;
    }
    .sticker h2 {
      font-size: 16pt;
      font-weight: 900;
      font-family: 'Georgia', serif;
      font-style: italic;
      letter-spacing: -0.02em;
      line-height: 1.2;
      word-break: break-word;
      max-width: 80mm;
    }
    .location {
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid rgba(0,0,0,0.05);
      width: 100%;
      font-size: 7pt;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.3em;
      opacity: 0.4;
    }
  `;

  generatePDF({
    title: `${safeCompanyName}_Sticker`,
    content,
    styles,
    orientation: 'landscape',
    customSize: { width: '100mm', height: '100mm' },
  });
}
