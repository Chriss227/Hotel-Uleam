import { todayISO } from "./formatters";

function textValue(value) {
  return value === null || value === undefined ? "" : String(value);
}

export function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(textValue(value));
}

export function isPersonName(value) {
  return /^[A-Za-z\u00C0-\u017F]+(?:[ '-][A-Za-z\u00C0-\u017F]+)*$/.test(textValue(value).trim());
}

export function isRoomName(value) {
  return /^[A-Za-z\u00C0-\u017F]+(?:[ '-][A-Za-z\u00C0-\u017F]+)*$/.test(textValue(value).trim());
}

export function nameCharactersOnly(value) {
  return textValue(value).replace(/[^A-Za-z\u00C0-\u017F '-]/g, "");
}

export function digitsOnlyValue(value) {
  return textValue(value).replace(/\D/g, "");
}

export function cardNumberCharactersOnly(value) {
  return textValue(value).replace(/[^\d -]/g, "");
}

export function isDigitsOnly(value) {
  return /^\d+$/.test(textValue(value).trim());
}

export function isDecimalNumber(value) {
  return /^\d+(\.\d{1,2})?$/.test(textValue(value).trim());
}

export function isImageSource(value) {
  const source = textValue(value).trim();
  return !source || /^(https?:\/\/[^\s]+|\/[A-Za-z0-9._~:/?#\[\]@!$&'()*+,;=%-]+|data:image\/[A-Za-z0-9.+-]+;base64,[A-Za-z0-9+/=]+)$/.test(source);
}

export function onlyDigits(value, min, max) {
  const clean = digitsOnlyValue(value);
  return isDigitsOnly(value) && clean.length >= min && clean.length <= max;
}

export function required(value) {
  return textValue(value).trim().length > 0;
}

function validateName(errors, field, value, requiredMessage, invalidMessage) {
  if (!required(value)) {
    errors[field] = requiredMessage;
    return;
  }
  if (!isPersonName(value)) errors[field] = invalidMessage;
}

function validatePositiveInteger(errors, field, value, label, min = 0) {
  if (!isDigitsOnly(value)) {
    errors[field] = `${label} debe contener solo numeros enteros.`;
    return;
  }
  if (Number(value) < min) errors[field] = `${label} debe ser mayor o igual a ${min}.`;
}

function validatePositiveDecimal(errors, field, value, label, min = 0) {
  if (!isDecimalNumber(value)) {
    errors[field] = `${label} debe contener solo numeros y maximo 2 decimales.`;
    return;
  }
  if (Number(value) < min) errors[field] = `${label} debe ser mayor o igual a ${min}.`;
}

export function validateSearch(data) {
  const errors = {};
  const adults = Number(data.adults || 0);
  const children = Number(data.children || 0);
  const babies = Number(data.babies || 0);
  const today = todayISO();

  if (!required(data.checkIn)) errors.checkIn = "Selecciona la fecha de entrada.";
  if (!required(data.checkOut)) errors.checkOut = "Selecciona la fecha de salida.";
  if (data.checkIn && data.checkIn < today) {
    errors.checkIn = "La fecha de entrada no puede ser anterior a la fecha actual.";
  }
  if (data.checkOut && data.checkOut < today) {
    errors.checkOut = "La fecha de salida no puede ser anterior a la fecha actual.";
  }
  if (data.checkIn && data.checkOut && data.checkIn >= data.checkOut) {
    errors.checkOut = "La salida debe ser posterior a la entrada.";
  }
  validatePositiveInteger(errors, "adults", data.adults, "Adultos", 0);
  validatePositiveInteger(errors, "children", data.children, "Niños", 0);
  validatePositiveInteger(errors, "babies", data.babies, "Bebes", 0);
  if (adults + children + babies < 1) errors.adults = "Debe existir al menos un huesped.";

  return { valid: Object.keys(errors).length === 0, errors, data: { ...data, adults, children, babies } };
}

export function validateGuest(data) {
  const errors = {};
  validateName(errors, "clientName", data.clientName, "Ingresa nombres y apellidos.", "El nombre solo debe contener letras y espacios.");
  if (!onlyDigits(data.identification, 10, 13)) errors.identification = "Ingresa cedula o RUC valido.";
  if (!isEmail(data.email)) errors.email = "Ingresa un correo valido.";
  if (!onlyDigits(data.phone, 7, 10)) errors.phone = "Ingresa un telefono valido.";
  return { valid: Object.keys(errors).length === 0, errors };
}

export function validatePayment(data) {
  const errors = {};
  const method = String(data.method || "").trim();
  const validMethods = ["card", "debit", "transfer", "cash"];
  const normalized = { method };
  if (!required(method)) errors.method = "Selecciona un metodo de pago.";
  else if (!validMethods.includes(method)) errors.method = "Selecciona un metodo de pago valido.";

  if (["card", "debit"].includes(method)) {
    const cardNumber = digitsOnlyValue(data.cardNumber);
    const expiry = String(data.expiry || "").trim();
    const expiryMatch = expiry.match(/^(0[1-9]|1[0-2])\/(\d{2})$/);

    if (!/^[\d -]+$/.test(String(data.cardNumber || "").trim()) || cardNumber.length < 13 || cardNumber.length > 19) {
      errors.cardNumber = "Ingresa un numero de tarjeta valido.";
    }
    validateName(errors, "cardName", data.cardName, "Ingresa el nombre del titular.", "El nombre del titular solo debe contener letras y espacios.");
    if (!expiryMatch) {
      errors.expiry = "Usa el formato MM/AA.";
    } else {
      const month = Number(expiryMatch[1]);
      const year = 2000 + Number(expiryMatch[2]);
      const today = new Date();
      const currentYear = today.getFullYear();
      const currentMonth = today.getMonth() + 1;
      if (year < currentYear || (year === currentYear && month < currentMonth)) {
        errors.expiry = "La tarjeta esta vencida.";
      }
    }
    if (!onlyDigits(data.cvv, 3, 4)) errors.cvv = "CVV invalido.";

    normalized.cardName = String(data.cardName || "").trim();
    normalized.cardLast4 = cardNumber.slice(-4);
    normalized.expiry = expiry;
  }

  if (method === "transfer") {
    if (!required(data.transferBank)) errors.transferBank = "Selecciona el banco emisor.";
    if (!onlyDigits(data.transferReference, 6, 12)) errors.transferReference = "Ingresa una referencia valida de 6 a 12 digitos.";

    normalized.transferBank = String(data.transferBank || "").trim();
    normalized.transferReference = digitsOnlyValue(data.transferReference);
  }

  if (method === "cash") {
    normalized.payAtReception = true;
  }

  return { valid: Object.keys(errors).length === 0, errors, data: normalized };
}

export function validateRegister(data) {
  const errors = {};
  validateName(errors, "name", data.name, "Ingresa tus nombres y apellidos.", "El nombre solo debe contener letras y espacios.");
  if (!isEmail(data.email)) errors.email = "Ingresa un correo valido.";
  if (!required(data.password) || data.password.length < 6) errors.password = "La contraseña debe tener al menos 6 caracteres.";
  if (data.confirmPassword !== data.password) errors.confirmPassword = "Las contraseñas no coinciden.";
  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateRoom(data) {
  const errors = {};
  if (!required(data.id)) errors.id = "Campo obligatorio.";
  else if (!/^\d{1,4}$/.test(String(data.id).trim())) errors.id = "El numero de habitacion debe contener solo digitos.";

  if (required(data.name) && !isRoomName(data.name)) errors.name = "El nombre de la habitacion solo debe contener letras y espacios.";
  if (!required(data.type)) errors.type = "Campo obligatorio.";
  validatePositiveInteger(errors, "floor", data.floor, "Piso", 1);
  if (required(data.capacity)) validatePositiveInteger(errors, "capacity", data.capacity, "Capacidad", 1);
  validatePositiveDecimal(errors, "price", data.price, "Precio", 1);
  if (!required(data.status)) errors.status = "Campo obligatorio.";
  if (!isImageSource(data.imageUrl)) errors.imageUrl = "Ingresa una ruta o URL de imagen valida.";
  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateCheckIn(data) {
  const errors = {};
  if (!required(data.reservationId)) errors.reservationId = "Campo obligatorio.";
  if (!required(data.roomId)) errors.roomId = "Campo obligatorio.";
  else if (!/^\d{1,4}$/.test(String(data.roomId).trim())) errors.roomId = "El numero de habitacion debe contener solo digitos.";
  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateCheckOut(data) {
  const errors = {};
  if (!required(data.roomId)) errors.roomId = "Campo obligatorio.";
  validatePositiveDecimal(errors, "minibar", data.minibar, "Minibar", 0);
  validatePositiveDecimal(errors, "restaurant", data.restaurant, "Restaurante", 0);
  validatePositiveDecimal(errors, "laundry", data.laundry, "Lavanderia", 0);
  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateRequired(data, fields) {
  const errors = {};
  fields.forEach((field) => {
    if (!required(data[field])) errors[field] = "Campo obligatorio.";
  });
  return { valid: Object.keys(errors).length === 0, errors };
}
