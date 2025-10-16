/**
 * Converts a string into a URL-friendly slug.
 *
 * Examples:
 *  - "Hello World!" → "hello-world"
 *  - "Café com Leite" → "cafe-com-leite"
 *  - "  multiple   spaces  " → "multiple-spaces"
 */
export function slugify(text: string): string {
  return text
    .normalize("NFD") // Split accented characters into base + diacritics
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
    .toLowerCase() // Lowercase everything
    .trim() // Remove leading/trailing spaces
    .replace(/[^a-z0-9\s-]/g, "") // Remove non-alphanumeric characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-"); // Collapse multiple hyphens
}
