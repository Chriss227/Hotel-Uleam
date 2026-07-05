import { money, nightsBetween, reservationTotals } from "./formatters";

function normalizeText(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x20-\x7E]/g, "")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

function pdfTextLine(text, x, y, size = 11) {
  return `BT /F1 ${size} Tf ${x} ${y} Td (${normalizeText(text)}) Tj ET`;
}

function createPdf(lines) {
  const content = lines.join("\n");
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`
  ];

  let pdf = "%PDF-1.4\n";
  const offsets = [0];

  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return new Blob([pdf], { type: "application/pdf" });
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function downloadInvoicePdf(invoice) {
  const lines = [
    pdfTextLine("HOTEL ULEAM", 50, 742, 22),
    pdfTextLine("Factura de check-out", 50, 716, 15),
    pdfTextLine(`Factura: ${invoice.id}`, 380, 742, 11),
    pdfTextLine(`Fecha: ${invoice.createdAtLabel}`, 380, 724, 11),
    pdfTextLine("Datos del cliente", 50, 682, 14),
    pdfTextLine(`Cliente: ${invoice.clientName}`, 50, 660),
    pdfTextLine(`Cedula: ${invoice.identification}`, 50, 642),
    pdfTextLine(`Correo: ${invoice.email}`, 50, 624),
    pdfTextLine(`Reserva: ${invoice.reservationId}`, 50, 606),
    pdfTextLine("Datos de estadia", 50, 574, 14),
    pdfTextLine(`Habitacion: ${invoice.roomId} - ${invoice.roomName}`, 50, 552),
    pdfTextLine(`Ingreso: ${invoice.checkIn}`, 50, 534),
    pdfTextLine(`Salida: ${invoice.checkOut}`, 50, 516),
    pdfTextLine("Detalle", 50, 478, 14),
    pdfTextLine("Concepto", 50, 454, 11),
    pdfTextLine("Valor", 470, 454, 11),
    pdfTextLine(`Hospedaje reservado (${invoice.nights} noche${invoice.nights === 1 ? "" : "s"})`, 50, 432),
    pdfTextLine(invoice.lodgingTotalLabel, 470, 432),
    pdfTextLine("Minibar", 50, 414),
    pdfTextLine(invoice.minibarLabel, 470, 414),
    pdfTextLine("Restaurante", 50, 396),
    pdfTextLine(invoice.restaurantLabel, 470, 396),
    pdfTextLine("Lavanderia", 50, 378),
    pdfTextLine(invoice.laundryLabel, 470, 378),
    pdfTextLine("Total consumos", 50, 346, 12),
    pdfTextLine(invoice.servicesTotalLabel, 470, 346, 12),
    pdfTextLine("TOTAL A PAGAR EN CHECK-OUT", 50, 314, 15),
    pdfTextLine(invoice.grandTotalLabel, 430, 314, 15),
    pdfTextLine("El hospedaje no se vuelve a cobrar en este check-out.", 50, 278, 11),
    pdfTextLine("Gracias por su visita.", 50, 252, 11)
  ];

  const blob = createPdf(lines);
  downloadBlob(blob, `${invoice.id}.pdf`);
}

export function downloadReservationReceiptPdf(reservation, room) {
  if (!reservation || !room) return;
  const totals = reservationTotals(room, reservation);
  const nights = nightsBetween(reservation.checkIn, reservation.checkOut);
  const payment = reservation.payment || {};
  const methodLabels = {
    card: "Tarjeta de credito",
    debit: "Tarjeta de debito",
    transfer: "Transferencia bancaria",
    cash: "Pago en recepcion"
  };
  const paymentLabel = methodLabels[payment.method] || (reservation.paid ? "Pagado" : "Pendiente");
  const generatedAt = new Date().toLocaleString("es-EC");

  const lines = [
    pdfTextLine("HOTEL ULEAM", 50, 742, 22),
    pdfTextLine("Comprobante de reserva", 50, 716, 15),
    pdfTextLine(`Comprobante: ${reservation.id}`, 360, 742, 11),
    pdfTextLine(`Fecha: ${generatedAt}`, 360, 724, 11),
    pdfTextLine("Datos del cliente", 50, 682, 14),
    pdfTextLine(`Cliente: ${reservation.clientName}`, 50, 660),
    pdfTextLine(`Cedula/RUC: ${reservation.identification}`, 50, 642),
    pdfTextLine(`Correo: ${reservation.email}`, 50, 624),
    pdfTextLine(`Telefono: ${reservation.phone}`, 50, 606),
    pdfTextLine("Datos de la reserva", 50, 574, 14),
    pdfTextLine(`Reserva: ${reservation.id}`, 50, 552),
    pdfTextLine(`Estado: ${reservation.status}`, 50, 534),
    pdfTextLine(`Habitacion: ${reservation.roomId} - ${room.name}`, 50, 516),
    pdfTextLine(`Tipo: ${room.type}`, 50, 498),
    pdfTextLine(`Ingreso: ${reservation.checkIn}`, 50, 480),
    pdfTextLine(`Salida: ${reservation.checkOut}`, 50, 462),
    pdfTextLine(`Huespedes: ${reservation.guests}`, 50, 444),
    pdfTextLine(`Noches: ${nights}`, 50, 426),
    pdfTextLine("Detalle de valores", 50, 388, 14),
    pdfTextLine("Concepto", 50, 364, 11),
    pdfTextLine("Valor", 470, 364, 11),
    pdfTextLine(`Hospedaje (${nights} noche${nights === 1 ? "" : "s"})`, 50, 342),
    pdfTextLine(money(totals.subtotal), 470, 342),
    pdfTextLine("IVA 12%", 50, 324),
    pdfTextLine(money(totals.taxes), 470, 324),
    pdfTextLine("TOTAL RESERVA", 50, 292, 15),
    pdfTextLine(money(reservation.total || totals.total), 430, 292, 15),
    pdfTextLine(`Metodo de pago: ${paymentLabel}`, 50, 250, 11),
    pdfTextLine("Presenta este comprobante al llegar al hotel.", 50, 212, 11)
  ];

  const blob = createPdf(lines);
  downloadBlob(blob, `COMPROBANTE-${reservation.id}.pdf`);
}
