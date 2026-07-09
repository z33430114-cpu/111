(() => {
  const LOCAL_ORIGIN = "http://127.0.0.1:4173";

  function currentPage() {
    return location.pathname.split(/[\\/]/).pop() || "index.html";
  }

  function localPageHref() {
    const suffix = `${location.search || ""}${location.hash || ""}`;
    return `${LOCAL_ORIGIN}/${currentPage()}${suffix}`;
  }

  function toLocalUrl(value) {
    if (!value || /^(?:[a-z]+:|#|mailto:|tel:)/i.test(value)) return value;
    return new URL(value, `${LOCAL_ORIGIN}/${currentPage()}`).toString();
  }

  if (location.protocol !== "file:") return;
  location.replace(localPageHref());
  return;

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("a[href]").forEach((link) => {
      const href = link.getAttribute("href");
      const nextHref = toLocalUrl(href);
      if (nextHref && nextHref !== href) link.setAttribute("href", nextHref);
    });
  });
})();
