(function () {
  "use strict";

  /* ---------------- Toast helper ---------------- */
  var toastEl = document.getElementById("toast");
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2600);
  }
  window.toast = toast;

  /* ---------------- Wiki search ---------------- */
  var input = document.getElementById("searchInput");
  var searchForm = document.getElementById("searchForm");
  var searchPreview = document.getElementById("searchPreview");
  var searchPages = [];

  if (document.currentScript) {
    var wikiRoot = new URL("../wiki/", document.currentScript.src);

    // nações
    searchPages.push({
      title: "Aurora Bay",
      url: new URL("Aurora_Bay/index.html", wikiRoot).href,
      type: "Nação",
      tags: ["aurora", "bay", "nação", "tempo", "elizabeth", "raven"]
    });
    searchPages.push({
      title: "Vale Bear",
      url: new URL("Vale_Bear/index.html", wikiRoot).href,
      type: "Nação",
      tags: ["bear", "vale", "sabedoria", "biblioteca", "euqmita", "susan", "shivaz", "arthur", "verde"]
    });
    searchPages.push({
      title: "Nação de Lésbos",
      url: new URL("Nação_De_Lésbos/index.html", wikiRoot).href,
      type: "Nação",
      tags: ["lesbos", "nação", "sabedoria", "biblioteca", "pavi"]
    });
    searchPages.push({
      title: "Jardim Silencioso",
      url: new URL("Jardim_Silencioso/index.html", wikiRoot).href,
      type: "Nação",
      tags: ["silencioso", "jardim", "vida", "vamps"]
    });

    // patch notes
    searchPages.push({
      title: "Patch Notes 1.1",
      url: new URL("Patch_Notes_1.1/index.html", wikiRoot).href,
      type: "Atualização",
      tags: ["patch", "notas", "atualização", "versão", "Escadaria da Vida e da Criação"]
    });
    searchPages.push({
      title: "Patch Notes 1.2",
      url: new URL("Patch_Notes_1.2/index.html", wikiRoot).href,
      type: "Atualização",
      tags: ["patch", "notas", "atualização", "versão", "O Olhar da Calamidade"]
    });
    searchPages.push({
      title: "Patch Notes 1.3",
      url: new URL("Patch_Notes_1.3/index.html", wikiRoot).href,
      type: "Atualização",
      tags: ["patch", "notas", "atualização", "versão", "O Cair das Pétalas"]
    });
    searchPages.push({
      title: "Patch Notes 1.4",
      url: new URL("Patch_Notes_1.4/index.html", wikiRoot).href,
      type: "Atualização",
      tags: ["patch", "notas", "atualização", "versão", "Os Caminhos de Aglaope"]
    });
    searchPages.push({
      title: "Patch Notes 1.5",
      url: new URL("Patch_Notes_1.5/index.html", wikiRoot).href,
      type: "Atualização",
      tags: ["patch", "notas", "atualização", "versão", "O Dever De Maron"]
    });
    

    // lore
    searchPages.push({
      title: "Criação",
      url: new URL("Criação/index.html", wikiRoot).href,
      type: "Lore",
      tags: ["criação", "lore"]
    });
    searchPages.push({
      title: "Catástrofe de Pólis",
      url: new URL("Catástrofe_De_Pólis/index.html", wikiRoot).href,
      type: "Lore",
      tags: ["catástrofe", "pólis", "lore"]
    });
  }

  document.querySelectorAll("[data-random-page]").forEach(function (link) {
    link.addEventListener("click", function (event) {
      if (searchPages.length === 0) return;
      event.preventDefault();

      var currentPage = new URL(window.location.href);
      var otherPages = searchPages.filter(function (page) {
        return new URL(page.url).pathname !== currentPage.pathname;
      });
      var choices = otherPages.length > 0 ? otherPages : searchPages;
      var randomPage = choices[Math.floor(Math.random() * choices.length)];
      window.location.href = randomPage.url;
    });
  });

  function normalizeSearchText(value) {
    return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR").trim();
  }

  function getSearchResults(query) {
    var normalizedQuery = normalizeSearchText(query);
    if (!normalizedQuery) return [];

    return searchPages.map(function (page) {
      var title = normalizeSearchText(page.title);
      var tags = page.tags.concat(page.type).map(normalizeSearchText);
      var rank = Infinity;

      if (title === normalizedQuery) rank = 0;
      else if (title.startsWith(normalizedQuery)) rank = 1;
      else if (title.includes(normalizedQuery)) rank = 2;
      else if (tags.some(function (tag) { return tag === normalizedQuery; })) rank = 3;
      else if (tags.some(function (tag) { return tag.startsWith(normalizedQuery); })) rank = 4;
      else if (tags.some(function (tag) { return tag.includes(normalizedQuery); })) rank = 5;

      return { page: page, rank: rank };
    }).filter(function (result) {
      return result.rank !== Infinity;
    }).sort(function (a, b) {
      return a.rank - b.rank || a.page.title.localeCompare(b.page.title, "pt-BR");
    }).map(function (result) {
      return result.page;
    });
  }

  function closeSearchPreview() {
    if (!input || !searchPreview) return;
    searchPreview.hidden = true;
    input.setAttribute("aria-expanded", "false");
  }

  function updateSearchPreview() {
    if (!input || !searchPreview) return;

    var query = input.value;
    var results = getSearchResults(query);
    searchPreview.replaceChildren();

    if (!query.trim()) {
      closeSearchPreview();
      return;
    }

    if (results.length === 0) {
      var empty = document.createElement("li");
      empty.className = "sp-empty";
      empty.textContent = "Nenhuma página encontrada.";
      searchPreview.appendChild(empty);
    } else {
      results.slice(0, 8).forEach(function (page) {
        var item = document.createElement("li");
        var link = document.createElement("a");
        var main = document.createElement("div");
        var title = document.createElement("div");
        var subtitle = document.createElement("div");

        link.href = page.url;
        link.className = "sp-item";
        link.setAttribute("role", "option");
        main.className = "sp-item__main";
        title.className = "sp-item__title";
        title.textContent = page.title;
        subtitle.className = "sp-item__sub";
        subtitle.textContent = page.type;

        main.appendChild(title);
        main.appendChild(subtitle);
        link.appendChild(main);
        item.appendChild(link);
        searchPreview.appendChild(item);
      });
    }

    searchPreview.hidden = false;
    input.setAttribute("aria-expanded", "true");
  }

  if (input && searchPreview) {
    input.addEventListener("input", updateSearchPreview);
    input.addEventListener("focus", updateSearchPreview);
    input.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeSearchPreview();
    });

    document.addEventListener("click", function (event) {
      if (searchForm && !searchForm.contains(event.target)) closeSearchPreview();
    });
  }

  if (searchForm && input) {
    searchForm.addEventListener("submit", function (event) {
      event.preventDefault();
      var firstResult = getSearchResults(input.value)[0];
      if (firstResult) window.location.href = firstResult.url;
      else updateSearchPreview();
    });
  }

  /* ---------------- Wiki table of contents ---------------- */
  document.querySelectorAll(".article--wiki .article__layout").forEach(function (layout) {
    if (layout.hasAttribute("data-no-toc")) return;

    var articleBody = layout.querySelector(".article__body");
    if (!articleBody) return;

    var headings = Array.prototype.slice.call(articleBody.querySelectorAll("h2"));
    var intro = null;
    Array.prototype.some.call(articleBody.children, function (element) {
      if (element.tagName === "H2") return true;
      if (!intro && element.tagName === "P") intro = element;
      return false;
    });
    if (headings.length === 0 && !intro) return;

    var tableOfContents = document.createElement("nav");
    var header = document.createElement("div");
    var title = document.createElement("h2");
    var list = document.createElement("ol");

    tableOfContents.className = "wiki-toc";
    tableOfContents.setAttribute("aria-label", "Conteúdos");
    header.className = "wiki-toc__header";
    title.className = "wiki-toc__title";
    title.textContent = "Conteúdos";
    list.className = "wiki-toc__list";

    function assignSectionId(element, fallback) {
      if (element.id) return;
      var slug = normalizeSearchText(element.textContent)
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") || fallback;
      var id = slug;
      var suffix = 2;
      while (document.getElementById(id)) {
        id = slug + "-" + suffix;
        suffix += 1;
      }
      element.id = id;
    }

    if (intro) {
      if (!intro.id) {
        var introId = "inicio";
        var introSuffix = 2;
        while (document.getElementById(introId)) {
          introId = "inicio-" + introSuffix;
          introSuffix += 1;
        }
        intro.id = introId;
      }
      var introItem = document.createElement("li");
      var introLink = document.createElement("a");
      introLink.href = "#" + intro.id;
      introLink.textContent = "Início";
      introItem.appendChild(introLink);
      list.appendChild(introItem);
    }

    headings.forEach(function (heading) {
      assignSectionId(heading, "secao");

      var item = document.createElement("li");
      var link = document.createElement("a");
      link.href = "#" + heading.id;
      link.textContent = heading.textContent.trim();
      item.appendChild(link);
      list.appendChild(item);
    });

    header.appendChild(title);
    tableOfContents.appendChild(header);
    tableOfContents.appendChild(list);
    layout.insertBefore(tableOfContents, articleBody);
  });

  /* ---------------- Wiki image lightbox ---------------- */
  var articleImages = Array.prototype.slice.call(document.querySelectorAll("main .article img"));
  var lightboxImages = articleImages.filter(function (image, index) {
    return articleImages.findIndex(function (candidate) {
      return candidate.src === image.src;
    }) === index;
  });

  if (articleImages.length > 0) {
    var lightbox = document.createElement("dialog");
    var lightboxClose = document.createElement("button");
    var lightboxPrevious = document.createElement("button");
    var lightboxImage = document.createElement("img");
    var lightboxNext = document.createElement("button");
    var lightboxCaption = document.createElement("p");
    var activeImageIndex = 0;
    var imageTrigger = null;

    lightbox.className = "wiki-lightbox";
    lightbox.setAttribute("aria-label", "Visualizador de imagens");
    lightboxClose.className = "wiki-lightbox__close";
    lightboxClose.type = "button";
    lightboxClose.setAttribute("aria-label", "Fechar imagem");
    lightboxClose.textContent = "×";
    lightboxPrevious.className = "wiki-lightbox__nav wiki-lightbox__previous";
    lightboxPrevious.type = "button";
    lightboxPrevious.setAttribute("aria-label", "Imagem anterior");
    lightboxPrevious.textContent = "‹";
    lightboxImage.className = "wiki-lightbox__image";
    lightboxNext.className = "wiki-lightbox__nav wiki-lightbox__next";
    lightboxNext.type = "button";
    lightboxNext.setAttribute("aria-label", "Próxima imagem");
    lightboxNext.textContent = "›";
    lightboxCaption.className = "wiki-lightbox__caption";

    lightbox.appendChild(lightboxClose);
    lightbox.appendChild(lightboxPrevious);
    lightbox.appendChild(lightboxImage);
    lightbox.appendChild(lightboxNext);
    lightbox.appendChild(lightboxCaption);
    document.body.appendChild(lightbox);

    function getImageCaption(image) {
      var figure = image.closest("figure");
      var caption = figure && figure.querySelector("figcaption");
      return image.getAttribute("data-caption") ||
        (caption && caption.textContent.trim()) ||
        image.getAttribute("alt") ||
        "Imagem da página";
    }

    function showArticleImage(index) {
      activeImageIndex = (index + lightboxImages.length) % lightboxImages.length;
      var image = lightboxImages[activeImageIndex];
      lightboxImage.src = image.currentSrc || image.src;
      lightboxImage.alt = image.alt;
      lightboxImage.classList.toggle("wiki-lightbox__image--pixelated", image.classList.contains("wiki-seal"));
      lightboxCaption.textContent = getImageCaption(image);
      lightboxPrevious.hidden = lightboxImages.length < 2;
      lightboxNext.hidden = lightboxImages.length < 2;
    }

    function openLightbox(image) {
      imageTrigger = image;
      var imageIndex = lightboxImages.findIndex(function (candidate) {
        return candidate.src === image.src;
      });
      showArticleImage(imageIndex);
      lightbox.showModal();
      lightboxClose.focus();
    }

    articleImages.forEach(function (image) {
      var caption = getImageCaption(image);
      image.classList.add("wiki-lightbox-trigger");
      image.tabIndex = 0;
      image.setAttribute("role", "button");
      image.setAttribute("aria-label", "Ampliar imagem: " + caption);
      image.addEventListener("click", function () { openLightbox(image); });
      image.addEventListener("keydown", function (event) {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openLightbox(image);
        }
      });
    });

    lightboxClose.addEventListener("click", function () { lightbox.close(); });
    lightboxPrevious.addEventListener("click", function () {
      showArticleImage(activeImageIndex - 1);
    });
    lightboxNext.addEventListener("click", function () {
      showArticleImage(activeImageIndex + 1);
    });
    lightbox.addEventListener("click", function (event) {
      if (event.target === lightbox) lightbox.close();
    });
    lightbox.addEventListener("close", function () {
      if (imageTrigger) imageTrigger.focus();
    });
    lightbox.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        event.preventDefault();
        lightbox.close();
        return;
      }
      if (lightboxImages.length < 2) return;
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        showArticleImage(activeImageIndex - 1);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        showArticleImage(activeImageIndex + 1);
      }
    });
  }

  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------- Mobile nav drawer ---------------- */
  var navToggle = document.getElementById("navToggle");
  var primaryNav = document.getElementById("primaryNav");
  var navScrim = document.getElementById("navScrim");

  function setNav(open) {
    if (!primaryNav || !navToggle) return;
    primaryNav.classList.toggle("open", open);
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    if (navScrim) navScrim.hidden = !open;
  }
  if (navToggle) {
    navToggle.addEventListener("click", function () {
      setNav(navToggle.getAttribute("aria-expanded") !== "true");
    });
  }
  if (navScrim) navScrim.addEventListener("click", function () { setNav(false); });
  if (primaryNav) {
    primaryNav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { setNav(false); });
    });
  }

  /* ---------------- Animated stat counters ---------------- */
  var statNums = document.querySelectorAll(".stat__num[data-count]");
  function animateCount(el) {
    var target = parseInt(el.getAttribute("data-count"), 10) || 0;
    if (prefersReduced) { el.textContent = target.toLocaleString(); return; }
    var start = performance.now();
    var dur = 1400;
    function step(now) {
      var p = Math.min((now - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased).toLocaleString();
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if ("IntersectionObserver" in window) {
    var statObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { animateCount(en.target); statObs.unobserve(en.target); }
      });
    }, { threshold: 0.4 });
    statNums.forEach(function (n) { statObs.observe(n); });
  } else {
    statNums.forEach(animateCount);
  }



  /* ---------------- Global "/" to focus search ---------------- */
  document.addEventListener("keydown", function (e) {
    if (e.key === "/" && document.activeElement !== input) {
      var tag = (document.activeElement && document.activeElement.tagName) || "";
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      e.preventDefault();
      if (input) { input.focus(); input.select(); }
    }
  });

  /* ---------------- Theme toggle ---------------- */
  var randomBtn = document.getElementById("randomBtn");
  if (randomBtn) {
    var theme = "dark";
    try {
      theme = window.localStorage.getItem("aurastra-theme") === "light" ? "light" : "dark";
    } catch (error) {}

    function applyTheme(nextTheme) {
      theme = nextTheme;
      document.documentElement.dataset.theme = theme;
      randomBtn.textContent = theme === "light" ? "☀️" : "🌙";
      randomBtn.setAttribute("aria-label", theme === "light" ? "Ativar tema escuro" : "Ativar tema claro");
      randomBtn.setAttribute("aria-pressed", String(theme === "light"));
    }

    applyTheme(theme);
    randomBtn.addEventListener("click", function () {
      applyTheme(theme === "dark" ? "light" : "dark");
      try {
        window.localStorage.setItem("aurastra-theme", theme);
      } catch (error) {}
    });
  }


})();