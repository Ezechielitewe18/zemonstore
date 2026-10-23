// ZEMON STORE - Génération de facture PDF (sans dépendance externe)

function pdfSafeText(value) {
  return String(value).replace(/[^\x00-\xFF]/g, "?");
}

function pdfEscape(value) {
  return pdfSafeText(value)
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    .replace(/\r?\n/g, " ");
}

function pdfWrap(text, maxChars) {
  const words = String(text).split(/\s+/).filter(Boolean);
  const lines = [];
  let line = "";
  words.forEach((word) => {
    if ((line + " " + word).trim().length > maxChars) {
      if (line) lines.push(line);
      line = word;
    } else {
      line = line ? line + " " + word : word;
    }
  });
  if (line) lines.push(line);
  return lines.length ? lines : [""];
}

function buildInvoicePdf(invoice) {
  const content = [];
  const left = 50;
  const right = 545;

  const fill = (r, g, b) => content.push(`${r} ${g} ${b} rg`);
  const text = (value, x, y, size, bold) => {
    content.push(
      `BT /${bold ? "F2" : "F1"} ${size} Tf 1 0 0 1 ${x.toFixed(2)} ${y.toFixed(2)} Tm (${pdfEscape(value)}) Tj ET`
    );
  };
  const rightText = (value, xRight, y, size, bold) => {
    const width = String(value).length * size * 0.5;
    text(value, xRight - width, y, size, bold);
  };
  const line = (x1, y1, x2, y2, gray) => {
    const g = typeof gray === "number" ? gray : 0.8;
    content.push(`${g} ${g} ${g} RG 0.8 w ${x1} ${y1} m ${x2} ${y2} l S`);
  };

  // Bandeau d'en-tête
  fill(0.18, 0.62, 0.18);
  content.push("0 780 595 62 re f");
  fill(1, 1, 1);
  text("ZEMON STORE", left, 805, 20, true);
  text("Accessoires iPhone - Kinshasa", left, 789, 9, false);
  rightText("FACTURE", right, 805, 12, true);
  rightText(invoice.number, right, 789, 9, false);

  fill(0, 0, 0);
  rightText("Date : " + invoice.date, right, 758, 9, false);

  // Client
  text("FACTURE À", left, 738, 8, true);
  text(invoice.name, left, 721, 12, true);
  let clientY = 706;
  const clientLines = [invoice.phone, invoice.address, invoice.email, invoice.payment ? "Paiement : " + invoice.payment : ""];
  clientLines.filter(Boolean).forEach((value) => {
    const wrapped = pdfWrap(value, 52);
    wrapped.forEach((w) => {
      text(w, left, clientY, 9, false);
      clientY -= 12;
    });
  });

  // Tableau des articles
  let y = Math.min(640, clientY - 22);
  line(left, y + 12, right, y + 12, 0.8);
  text("ARTICLE", left, y, 8, true);
  text("QTÉ", 395, y, 8, true);
  rightText("MONTANT", right, y, 8, true);
  line(left, y - 6, right, y - 6, 0.8);
  y -= 22;

  invoice.items.forEach((item) => {
    const nameLines = pdfWrap(item.name, 46);
    const meta = [item.model, item.variant].filter(Boolean).join(" - ");

    text(nameLines[0], left, y, 9.5, true);
    let offset = 0;
    for (let i = 1; i < nameLines.length; i += 1) {
      offset += 11;
      text(nameLines[i], left, y - offset, 9.5, true);
    }
    if (meta) {
      offset += 11;
      fill(0.45, 0.45, 0.45);
      text(pdfWrap(meta, 52)[0], left, y - offset, 8, false);
      fill(0, 0, 0);
    }

    text(String(item.qty), 400, y, 9.5, false);
    rightText(item.line, right, y, 9.5, true);
    y -= offset + 20;
  });

  // Totaux
  const totalsY = Math.max(y - 14, 250);
  fill(0.96, 0.96, 0.96);
  content.push(`330 ${(totalsY - 72).toFixed(2)} 215 92 re f`);
  fill(0, 0, 0);

  text("Sous-total USD", 342, totalsY, 9, false);
  rightText(invoice.totals.subUsdText, right, totalsY, 9, false);
  text("Sous-total FC", 342, totalsY - 14, 9, false);
  rightText(invoice.totals.subFcText, right, totalsY - 14, 9, false);
  text("Livraison (Kinshasa)", 342, totalsY - 28, 9, false);
  rightText("5 000 FC", right, totalsY - 28, 9, false);
  line(342, totalsY - 38, right, totalsY - 38, 0.75);
  text("TOTAL USD", 342, totalsY - 52, 9, true);
  rightText(invoice.totals.totalUsdText, right, totalsY - 52, 10, true);
  text("TOTAL FC", 342, totalsY - 66, 9, true);
  rightText(invoice.totals.totalFcText, right, totalsY - 66, 10, true);

  // Informations de paiement
  let infoY = Math.min(totalsY - 96, 180);
  if (invoice.hasZero) {
    text("Certains prix sont à confirmer avec le vendeur.", left, infoY, 8.5, false);
    infoY -= 14;
  }
  text("Paiement : " + (invoice.payment || "M-Pesa ou espèces à la livraison"), left, infoY, 9, true);
  infoY -= 14;
  text("M-Pesa (Mobile Money) : +243 818 395 949", left, infoY, 8.5, false);
  infoY -= 13;
  text("Assistance 24h/24, 7j/7 - WhatsApp : +243 818 395 949", left, infoY, 8.5, false);

  // Pied de page
  line(left, 70, right, 70, 0.8);
  fill(0.45, 0.45, 0.45);
  text("Merci pour votre confiance.", left, 52, 8.5, false);
  rightText("Facture générée par ZEMON STORE", right, 52, 8.5, false);
  fill(0, 0, 0);

  const contentStr = content.join("\n");

  const objects = [];
  objects.push("<< /Type /Catalog /Pages 2 0 R >>");
  objects.push("<< /Type /Pages /Kids [3 0 R] /Count 1 >>");
  objects.push(
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>"
  );
  objects.push("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>");
  objects.push("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>");
  objects.push("<< /Length " + contentStr.length + " >>\nstream\n" + contentStr + "\nendstream");

  let pdf = "%PDF-1.4\n";
  const offsets = [0];

  objects.forEach((body, index) => {
    offsets.push(pdf.length);
    pdf += index + 1 + " 0 obj\n" + body + "\nendobj\n";
  });

  const xrefStart = pdf.length;
  pdf += "xref\n0 " + (objects.length + 1) + "\n";
  pdf += "0000000000 65535 f \n";
  for (let i = 1; i <= objects.length; i += 1) {
    pdf += String(offsets[i]).padStart(10, "0") + " 00000 n \n";
  }
  pdf += "trailer\n<< /Size " + (objects.length + 1) + " /Root 1 0 R >>\n";
  pdf += "startxref\n" + xrefStart + "\n%%EOF";

  const bytes = new Uint8Array(pdf.length);
  for (let i = 0; i < pdf.length; i += 1) {
    bytes[i] = pdf.charCodeAt(i) & 0xff;
  }
  return bytes;
}

function downloadInvoicePdf(invoice) {
  const bytes = buildInvoicePdf(invoice);
  const blob = new Blob([bytes], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "Facture-" + invoice.number + ".pdf";
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 3000);
}
