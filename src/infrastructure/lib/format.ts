export const titleCase = (s: string) =>
  s
    .replace(/[_-]+/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());

/**
 * Обрабатывает ошибки карты с контекстной информацией.
 * @param error - Ошибка для обработки
 * @param context - Контекст операции (например, 'createMap', 'addWms')
 * @param silent - Если true, не выводит в консоль (по умолчанию false)
 */
export function handleMapError(
  error: unknown,
  context: string,
  silent = false,
): void {
  const message = error instanceof Error ? error.message : String(error);
  if (!silent) {
    console.error(`Leaflet: failed to ${context}`, { error: message, context });
  }
}
