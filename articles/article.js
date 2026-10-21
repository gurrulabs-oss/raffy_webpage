// Article pages: highlight the current section in the table of contents, close the mobile contents list
// after picking a section. Library: client-side topic filter (all cards stay in the HTML; filtering only
// toggles the `hidden` attribute). No tracking events.
(function () {
  "use strict";

  var tocLinks = Array.prototype.slice.call(document.querySelectorAll(".toc a[href^='#']"));
  if (tocLinks.length && "IntersectionObserver" in window) {
    var byId = {};
    tocLinks.forEach(function (a) { byId[a.getAttribute("href").slice(1)] = a; });
    var headings = Object.keys(byId).map(function (id) { return document.getElementById(id); }).filter(Boolean);
    var setActive = function (id) {
      tocLinks.forEach(function (a) {
        var on = a === byId[id];
        a.classList.toggle("active", on);
        if (on) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current");
      });
    };
    var visible = {};
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { visible[e.target.id] = e.isIntersecting; });
      var current = headings.filter(function (h) { return visible[h.id]; })[0];
      if (current) setActive(current.id);
    }, { rootMargin: "-80px 0px -65% 0px", threshold: 0 });
    headings.forEach(function (h) { observer.observe(h); });
    if (headings.length) setActive(headings[0].id);
  }

  var mobileToc = document.querySelector(".toc-mobile");
  if (mobileToc) {
    mobileToc.addEventListener("click", function (e) {
      if (e.target.closest("a")) mobileToc.removeAttribute("open");
    });
  }

  var filter = document.querySelector("[data-filter]");
  if (filter) {
    var chips = Array.prototype.slice.call(filter.querySelectorAll("[data-filter-value]"));
    var cards = Array.prototype.slice.call(document.querySelectorAll(".a-card[data-topic]"));
    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        var value = chip.getAttribute("data-filter-value");
        chips.forEach(function (c) { c.setAttribute("aria-pressed", c === chip ? "true" : "false"); });
        cards.forEach(function (card) {
          card.hidden = value !== "all" && card.getAttribute("data-topic") !== value;
        });
      });
    });
  }
})();
