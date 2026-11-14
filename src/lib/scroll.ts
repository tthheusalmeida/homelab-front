/** Rola suavemente até o elemento com esse id (se existir na página). */
export function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView?.({
    behavior: "smooth",
    block: "start",
  });
}
