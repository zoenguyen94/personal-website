/* Light/dark toggle, Iowa State palette picker, mobile menu, and CV download.
   Storage calls are wrapped: they can fail in private windows or with blocked site data. */
(function () {
  var root = document.documentElement;
  var THEME_KEY = "portfolio-theme";
  var PALETTE_KEY = "portfolio-palette";
  var PALETTES = ["cardinal", "gold", "olive", "stone"];

  function readStored(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }
  function writeStored(key, value) {
    try { localStorage.setItem(key, value); } catch (e) { /* ignore */ }
  }

  /* ---------- Light / dark ---------- */
  function systemPrefersDark() {
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  }
  function currentTheme() {
    var explicit = root.getAttribute("data-theme");
    if (explicit === "light" || explicit === "dark") return explicit;
    return systemPrefersDark() ? "dark" : "light";
  }
  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    var btn = document.querySelector("[data-theme-toggle]");
    if (btn) {
      var isDark = theme === "dark";
      btn.setAttribute("aria-pressed", String(isDark));
      btn.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
    }
  }
  var savedTheme = readStored(THEME_KEY);
  if (savedTheme === "light" || savedTheme === "dark") applyTheme(savedTheme);
  else applyTheme(currentTheme());

  var themeBtn = document.querySelector("[data-theme-toggle]");
  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      var next = currentTheme() === "dark" ? "light" : "dark";
      applyTheme(next);
      writeStored(THEME_KEY, next);
    });
  }

  /* ---------- Palette ---------- */
  var paletteBtn = document.querySelector("[data-palette-toggle]");
  var paletteMenu = document.getElementById("palette-menu");
  var paletteOptions = document.querySelectorAll("[data-palette-option]");

  function applyPalette(name) {
    if (PALETTES.indexOf(name) === -1) name = "cardinal";
    if (name === "cardinal") root.removeAttribute("data-palette");
    else root.setAttribute("data-palette", name);
    for (var i = 0; i < paletteOptions.length; i++) {
      var opt = paletteOptions[i];
      opt.setAttribute("aria-pressed", String(opt.getAttribute("data-palette-option") === name));
    }
  }
  function setMenuOpen(open) {
    if (!paletteBtn || !paletteMenu) return;
    paletteMenu.hidden = !open;
    paletteBtn.setAttribute("aria-expanded", String(open));
  }
  applyPalette(readStored(PALETTE_KEY) || "cardinal");

  if (paletteBtn && paletteMenu) {
    paletteBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      setMenuOpen(paletteMenu.hidden);
    });
    paletteMenu.addEventListener("click", function (e) {
      var opt = e.target.closest("[data-palette-option]");
      if (!opt) return;
      var name = opt.getAttribute("data-palette-option");
      applyPalette(name);
      writeStored(PALETTE_KEY, name);
      setMenuOpen(false);
      paletteBtn.focus();
    });
    document.addEventListener("click", function (e) {
      if (!paletteMenu.hidden && !e.target.closest(".palette")) setMenuOpen(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !paletteMenu.hidden) { setMenuOpen(false); paletteBtn.focus(); }
    });
  }

  /* ---------- Mobile menu ---------- */
  var menuBtn = document.querySelector("[data-menu-toggle]");
  var nav = document.getElementById("site-nav");
  if (menuBtn && nav) {
    menuBtn.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      menuBtn.setAttribute("aria-expanded", String(open));
      menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        nav.classList.remove("is-open");
        menuBtn.setAttribute("aria-expanded", "false");
        menuBtn.setAttribute("aria-label", "Open menu");
      }
    });
  }

  /* ---------- CV download ----------
     On a normal web host the plain download link works on its own.
     Inside a Claude artifact viewer, plain download links are blocked, so the
     file is fetched and handed to the viewer's "downloads" capability instead. */
  var toast = document.querySelector("[data-toast]");
  var toastTimer;
  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.hidden = true; }, 4000);
  }

  var downloadsPromise = null;
  function getDownloads() {
    if (downloadsPromise) return downloadsPromise;
    if (window.claude && typeof window.claude.use === "function") {
      downloadsPromise = window.claude.use("downloads");
    }
    return downloadsPromise;
  }
  getDownloads(); // start resolving early inside the artifact viewer

  var cvLinks = document.querySelectorAll("[data-download-cv]");
  for (var j = 0; j < cvLinks.length; j++) {
    cvLinks[j].addEventListener("click", function (e) {
      var p = getDownloads();
      if (!p) return; // regular website: let the browser download the file
      e.preventDefault();
      var href = this.getAttribute("href");
      var filename = this.getAttribute("download") || "Duong-Nguyen-CV.pdf";
      p.then(function (downloads) {
        if (!downloads) {
          showToast("Downloads aren't available in this view.");
          return null;
        }
        return fetch(href)
          .then(function (res) {
            if (!res.ok) throw { code: "fetch_failed" };
            return res.blob();
          })
          .then(function (blob) { return downloads.save({ filename: filename, data: blob }); })
          .then(function (result) {
            if (result && result.status === "saved") showToast("CV saved.");
          });
      }).catch(function (err) {
        var code = err && err.code;
        if (code === "declined") return;
        if (code === "rate_limited") { showToast("A save prompt is already open."); return; }
        showToast("The CV couldn't be downloaded. Please try again.");
      });
    });
  }
})();
