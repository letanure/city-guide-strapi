export const getText = (element: HTMLElement) =>
  element && element.innerText.trim();

export const getHref = (element: HTMLAnchorElement) =>
  element && element.href.trim();
