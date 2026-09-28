/** Content uses 'TODO' as a placeholder; those links are not rendered. */
export function isReal(href: string) {
  return Boolean(href) && !href.startsWith('TODO');
}
