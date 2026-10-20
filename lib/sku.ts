/**
 * Stock.app SKU format: a 3-letter category/type code, a dash, and a
 * 4-digit sequence. Example: ELE-0001.
 *
 * Keep this file free of server-only imports so the add-product form and the
 * CSV template can use the same constants.
 */
export const SKU_EXAMPLE = "ELE-0001";
export const SKU_FORMAT_HINT = "3 letters, a dash, then 4 digits";
export const SKU_VALIDATION_MESSAGE = `SKU must look like ${SKU_EXAMPLE} (${SKU_FORMAT_HINT}).`;
export const SKU_PATTERN = /^[A-Z]{3}-\d{4}$/;
export const SKU_PATTERN_HTML = "[A-Za-z]{3}-[0-9]{4}";

/** Uppercases and trims input before it is stored or validated. */
export function normalizeSku(value: string) {
  return value.trim().toUpperCase();
}

export function isValidSku(value: string) {
  return SKU_PATTERN.test(normalizeSku(value));
}
