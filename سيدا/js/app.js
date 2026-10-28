/* ==========================================================
   SEEDA | Core Application Script
   Routing, Bilingual Support, Enhanced Animations & Forms
   ========================================================== */

(function () {
  "use strict";

  // Helpers
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const ic = (p) => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${p}"/></svg>`;
  const ar = `<svg aria-hidden="true"><use href="#ar"/></svg>`;
  const globeIcon = `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`;

  // State
  let currentLang = "en";
  try {
    currentLang = localStorage.getItem("seeda_lang") || "en";
  } catch (e) {
    currentLang = "en";
  }
  const dict = (typeof I18N !== "undefined" ? I18N : (typeof window !== "undefined" ? window.I18N : null));
  if (!dict || !dict[currentLang]) currentLang = "en";

  const getT = () => (typeof I18N !== "undefined" ? I18N[currentLang] : window.I18N[currentLang]);

  // Enhanced IntersectionObserver for Fluid Scroll Animations
  let io = null;
  function initObserver() {
    if (!("IntersectionObserver" in window)) {
      $$(".rv").forEach((e) => e.classList.add("v"));
      return;
    }

    if (io) io.disconnect();

    io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("v");
            io.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.08,
        rootMargin: "0px 0px -40px 0px"
      }
    );

    // Apply staggered delays for grid items automatically
    const staggerContainers = [".g4", ".sol", ".steps", ".why", ".seg"];
    staggerContainers.forEach((selector) => {
      $$(selector).forEach((container) => {
        const items = $$(".rv", container);
        items.forEach((item, index) => {
          const delayClass = Math.min(index + 1, 6);
          item.setAttribute("data-delay", delayClass);
        });
      });
    });

    $$(".rv").forEach((el) => io.observe(el));
  }

  // HTML Generators based on current language
  const solHTML = (t) =>
    `<div class="sol">${t.cfg.solutions
      .map(
        (s) =>
          `<article class="rv">${ic(s[3])}<div><h3>${s[0]}</h3><p><b>${t.ui.problem}</b> ${s[1]}</p><p><b>${t.ui.benefit}</b> ${s[2]}</p><span class="tag">${
            s[4] || t.cfg.status.split(" —")[0]
          }</span></div></article>`
      )
      .join("")}</div>`;

  const faqHTML = (t) =>
    t.cfg.faq
      .map((f) => `<details><summary>${f[0]}</summary><p>${f[1]}</p></details>`)
      .join("");

  const bandHTML = (t) =>
    `<section><div class="wrap"><div class="cta-band rv"><h2>${t.home.bandHeading}</h2><a class="btn" href="#contact">${t.cfg.cta} ${ar}</a></div></div></section>`;

  const pageHead = (e, heading, lead) =>
    `<div class="page-h wrap"><span class="eyebrow">${e}</span><h1>${heading}</h1><p class="lead">${lead}</p></div>`;

  const heroHTML = (t) =>
    `<section class="hero"><div class="wrap"><div class="in"><span class="eyebrow">${t.hero.eyebrow}</span><h1>${t.hero.title}</h1><p class="lead">${t.hero.lead}</p><div class="cta"><a class="btn" href="#contact">${t.cfg.cta} ${ar}</a><a class="btn ghost" href="#solutions">${t.hero.ctaSolutions}</a></div></div><div class="shape"><img src="assets/hero-car.jpg" alt="Close-up of a dark car headlight" width="502" height="568" fetchpriority="high"></div></div></section>`;


  // Exact Original Portal Login HTML (Identical to PortalLoginLayout)
  const loginHTML = (t) => {
    return `
      <main class="portal-login-screen" dir="ltr">
        <!-- Background Cinema Video -->
        <div class="portal-bg-video-wrap">
          <video class="portal-bg-video" autoplay loop muted playsinline poster="assets/photo/loginBG.jpg">
            <source src="assets/login-video.webm" type="video/webm">
          </video>
          <div class="portal-overlay-grad-x"></div>
          <div class="portal-overlay-grad-y"></div>
        </div>

        <!-- Screen Bottom-Left Tagline -->
        <div class="portal-tagline-left" dir="rtl">
          <p>حماية تعكس جودة التفاصيل</p>
        </div>

        <!-- Screen Bottom-Right Corner Wedge (SEEDA Purple) -->
        <div class="portal-corner-wedge">
          <svg viewBox="0 0 440 260" fill="none" preserveAspectRatio="none">
            <defs>
              <linearGradient id="mainCornerSeedaPurple" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#8B5CF6"/>
                <stop offset="100%" stop-color="#5C24EB"/>
              </linearGradient>
              <linearGradient id="mainCornerSeedaDark" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#2E1065"/>
                <stop offset="100%" stop-color="#140827"/>
              </linearGradient>
            </defs>
            <polygon points="260,260 310,260 440,140 440,90" fill="url(#mainCornerSeedaDark)" opacity="0.6"/>
            <polygon points="310,260 440,260 440,140" fill="url(#mainCornerSeedaPurple)"/>
          </svg>
        </div>

        <!-- Main Container: Aligned towards the physical RIGHT on desktop -->
        <div class="portal-login-container">
          <div class="portal-card" dir="rtl">
            <!-- Card Top Header: Reflecto on Left, Seeda on Right (dir="ltr") -->
            <div class="portal-card-logos" dir="ltr">
              <img src="assets/photo/main-logo.png" alt="REFLECTO" class="portal-logo-reflecto" onerror="this.src='assets/photo/logo-dark.png'">
              <div class="portal-logo-divider"></div>
              <img src="assets/photo/seeda.png" alt="SEEDA" class="portal-logo-seeda" onerror="this.src='assets/photo/seeda-dark-text.png'">
            </div>

            <!-- Welcome Heading & Subtitle -->
            <div class="portal-card-header">
              <h1>مرحباً بك</h1>
              <p>سجل دخولك إلى النظام الإداري</p>
            </div>

            <!-- Card Toast Alert -->
            <div id="loginToast" class="portal-toast" role="alert"></div>

            <!-- Form -->
            <form id="seedaLoginForm" class="portal-form" novalidate autocomplete="off">
              <!-- Identifier Field (Phone or Employee Code or Email) -->
              <div class="portal-input-box">
                <input
                  id="loginIdentifier"
                  name="identifier"
                  type="text"
                  dir="rtl"
                  placeholder="رقم الجوال أو الرقم الوظيفي"
                  autocomplete="off"
                  required
                />
                <div class="portal-field-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                </div>
              </div>

              <!-- Password Field -->
              <div class="portal-input-box">
                <button type="button" class="portal-pwd-toggle" id="loginPwdToggle" aria-label="إظهار كلمة المرور">
                  <svg class="portal-eye-closed" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                  </svg>
                  <svg class="portal-eye-open" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" style="display:none">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"/>
                  </svg>
                </button>
                <input
                  id="loginPassword"
                  name="password"
                  type="password"
                  dir="rtl"
                  placeholder="كلمة المرور"
                  autocomplete="new-password"
                  required
                />
                <div class="portal-field-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                  </svg>
                </div>
              </div>

              <!-- Remember Me Checkbox -->
              <div class="portal-remember-row">
                <label class="portal-remember-label">
                  <div class="portal-custom-checkbox checked" id="loginCheckVisual">
                    <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="2.5 6 5 8.5 9.5 3.5"/>
                    </svg>
                  </div>
                  <input type="checkbox" id="loginRememberMe" checked style="display:none">
                  <span>تذكرني</span>
                </label>
              </div>

              <!-- Submit Button -->
              <button type="submit" class="portal-submit-btn" id="loginSubmitBtn">
                <span class="portal-btn-spinner" style="display:none"></span>
                <span class="portal-btn-label">تسجيل الدخول</span>
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
                </svg>
              </button>
            </form>

            <!-- Forgot Password Button -->
            <div class="portal-forgot-box">
              <button type="button" class="portal-forgot-link" id="loginForgotBtn">
                نسيت كلمة المرور؟
              </button>
            </div>

            <!-- Card Bottom: Powered by + Diagonal Stripes -->
            <div class="portal-card-bottom">
              <div class="portal-powered-by" dir="ltr">
                <span>Powered by</span>
                <img src="assets/photo/seeda.png" alt="SEEDA" onerror="this.src='assets/photo/seeda-dark-text.png'">
              </div>
              <div class="portal-card-stripes">
                <svg viewBox="0 0 150 110" fill="none">
                  <defs>
                    <linearGradient id="cardSeedaPurple" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stop-color="#8B5CF6"/>
                      <stop offset="100%" stop-color="#5C24EB"/>
                    </linearGradient>
                    <linearGradient id="cardSeedaDark" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stop-color="#2E1065"/>
                      <stop offset="100%" stop-color="#170836"/>
                    </linearGradient>
                    <linearGradient id="cardSeedaSubtle" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stop-color="#4C1D95"/>
                      <stop offset="100%" stop-color="#1E0B4B"/>
                    </linearGradient>
                  </defs>
                  <polygon points="75,110 88,110 150,50 150,38" fill="url(#cardSeedaSubtle)" opacity="0.75"/>
                  <polygon points="90,110 108,110 150,70 150,52" fill="url(#cardSeedaDark)"/>
                  <polygon points="108,110 112,110 150,74 150,70" fill="#0c0d10"/>
                  <polygon points="112,110 128,110 150,90 150,74" fill="url(#cardSeedaPurple)"/>
                  <polygon points="130,110 150,110 150,92" fill="url(#cardSeedaPurple)"/>
                </svg>
              </div>
            </div>
          </div>
        </div>

        <!-- Forgot Password Modal -->
        <div id="forgotModal" class="portal-modal-backdrop" style="display:none">
          <div class="portal-modal-box" dir="rtl">
            <div class="portal-modal-icon">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
              </svg>
            </div>
            <h3>استعادة كلمة المرور</h3>
            <p>يرجى التواصل مع مسؤول النظام العام أو قسم الدعم الفني لمساعدتك في استعادة وتعيين كلمة مرور الحساب الإداري أو الفني.</p>
            <button type="button" class="portal-modal-close-btn" id="closeForgotModal">إغلاق</button>
          </div>
        </div>
      </main>
    `;
  };

  // Page definitions
  const PAGES = {
    home: (t) =>
      heroHTML(t) +
      `<section class="vals"><div class="wrap"><h2>${t.home.whySeedaHeading}</h2><div class="g4">${t.vals
        .map(
          (v) =>
            `<div class="val rv">${ic(v[2])}<div><b>${v[0]}</b><span>${v[1]}</span></div></div>`
        )
        .join("")}</div></div></section>
      <section><div class="wrap split"><div><span class="eyebrow">${t.home.aboutEyebrow}</span><p class="big" style="margin-top:12px">${t.home.aboutBig}</p></div><div class="rv"><p>${t.home.aboutP1}</p><p>${t.home.aboutP2}</p><p><a class="btn ghost" style="margin-top:8px" href="#about">${t.home.aboutBtn}</a></p></div></div></section>
      <section class="soft"><div class="wrap"><div class="head"><span class="eyebrow">${t.home.solEyebrow}</span><h2>${t.home.solHeading}</h2><p class="lead">${t.home.solLead}</p></div>${solHTML(t)}</div></section>
      <section><div class="wrap"><div class="head"><span class="eyebrow">${t.home.mockEyebrow}</span><h2>${t.home.mockHeading}</h2><p class="lead">${t.home.mockLead}</p></div>
      <div class="mock rv"><div class="ui" role="img" aria-label="${t.home.mockBoardLabel}"><div class="bar"><i></i><i></i><i></i><span>${t.home.mockBoardLabel}</span></div><div class="cols"><div class="col"><small>${t.home.mockColBooked}</small><div class="chip">${t.home.mockChip}</div><div class="chip">${t.home.mockChip}</div></div><div class="col"><small>${t.home.mockColProgress}</small><div class="chip">${t.home.mockChip}</div></div><div class="col"><small>${t.home.mockColDone}</small><div class="chip">${t.home.mockChip}</div><div class="chip">${t.home.mockChip}</div></div></div></div>
      <div class="ui w" role="img" aria-label="${t.home.mockWarrantyLabel}"><div class="bar"><i></i><i></i><i></i><span>${t.home.mockWarrantyLabel}</span></div><div class="row"><div class="badge">${ic("M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6zM9 12l2 2 4-4")}</div><div style="flex:1"><b>${t.home.mockWarrantyBadge}</b><div class="sk" style="width:70%"></div><div class="sk" style="width:45%"></div></div></div><div class="sk" style="height:60px;border-radius:10px"></div><div class="sk" style="width:60%"></div></div></div></div></section>
      <section class="soft"><div class="wrap"><div class="head"><span class="eyebrow">${t.home.stepsEyebrow}</span><h2>${t.home.stepsHeading}</h2></div><div class="steps">${t.home.steps
        .map(
          (step) =>
            `<div class="step rv"><h3>${step[0]}</h3><p>${step[1]}</p></div>`
        )
        .join("")}</div></div></section>
      <section><div class="wrap"><div class="head"><span class="eyebrow">${t.home.whyEyebrow}</span><h2>${t.home.whyHeading}</h2></div><div class="why">${t.whyVals
        .map((w) => `<div class="rv"><h3>${w[0]}</h3><p>${w[1]}</p></div>`)
        .join("")}</div></div></section>
      <section class="soft"><div class="wrap" style="max-width:860px"><div class="head"><span class="eyebrow">${t.home.faqEyebrow}</span><h2>${t.home.faqHeading}</h2></div>${faqHTML(t)}</div></section>` +
      bandHTML(t),

    solutions: (t) =>
      pageHead(t.solutionsPage.eyebrow, t.solutionsPage.heading, t.solutionsPage.lead) +
      `<div class="wrap">${solHTML(t)}</div>` +
      bandHTML(t),

    "car-care": (t) =>
      pageHead(t.carCarePage.eyebrow, t.carCarePage.heading, t.carCarePage.lead) +
      `<div class="wrap"><div class="seg">${t.industries
        .map((x) => `<div class="rv"><h3>${x[0]}</h3><p>${x[1]}</p></div>`)
        .join("")}</div>
      <h2 style="margin:56px 0 8px;font-size:1.6rem">${t.carCarePage.whatHeading}</h2><ul class="list">${t.organizedList
        .map((item) => `<li>${item}</li>`)
        .join("")}</ul><p class="note">${t.carCarePage.note}</p></div>` +
      bandHTML(t),

    about: (t) =>
      pageHead(t.aboutPage.eyebrow, t.aboutPage.heading, t.aboutPage.lead) +
      `<div class="wrap split" style="padding-bottom:40px"><p class="big">${t.aboutPage.big}</p><div><p>${t.aboutPage.p1}</p><p>${t.aboutPage.p2}</p><p class="note">${t.aboutPage.note}</p></div></div>` +
      bandHTML(t),

    contact: (t) =>
      pageHead(t.contactPage.eyebrow, t.contactPage.heading, t.contactPage.lead) +
      `<div class="wrap"><form id="fm" novalidate>
      <div class="f"><label for="n">${t.contactPage.nameLabel}</label><input id="n" name="name" autocomplete="name" required><span class="err"></span></div>
      <div class="f"><label for="c">${t.contactPage.companyLabel}</label><input id="c" name="company" autocomplete="organization" required><span class="err"></span></div>
      <div class="f"><label for="e">${t.contactPage.emailLabel}</label><input id="e" name="email" type="email" autocomplete="email" required><span class="err"></span></div>
      <div class="f"><label for="p">${t.contactPage.phoneLabel}</label><input id="p" name="phone" type="tel" autocomplete="tel" required><span class="err"></span></div>
      <div class="f"><label for="i">${t.contactPage.industryLabel}</label><select id="i" name="industry" required><option value="">${t.contactPage.industrySelect}</option>${t.contactPage.industryOptions
        .map((opt) => `<option>${opt}</option>`)
        .join("")}</select><span class="err"></span></div>
      <div class="f"><label for="b">${t.contactPage.branchesLabel}</label><input id="b" name="branches" type="number" min="1" inputmode="numeric" required><span class="err"></span></div>
      <fieldset><legend>${t.contactPage.interestLegend}</legend>${t.cfg.solutions
        .map(
          (s) =>
            `<label><input type="checkbox" name="interest" value="${s[0]}"> ${s[0]}</label>`
        )
        .join("")}</fieldset>
      <div class="f full"><label for="m">${t.contactPage.messageLabel}</label><textarea id="m" name="message"></textarea></div>
      <div class="f full"><button class="btn" type="submit" style="align-self:flex-start">${t.cfg.cta} ${ar}</button></div>
      <div class="ok" id="ok" role="status" tabindex="-1"></div></form></div>`,

    privacy: (t) =>
      pageHead(t.legal.eyebrow, t.legal.privacyHeading, "") +
      `<div class="wrap prose"><p>${t.legal.privacyPlaceholder}</p><h2>${t.legal.privacySec2}</h2><p>${t.legal.privacyDesc}</p></div>`,

    terms: (t) =>
      pageHead(t.legal.eyebrow, t.legal.termsHeading, "") +
      `<div class="wrap prose"><p>${t.legal.termsPlaceholder}</p></div>`,

    login: (t) => loginHTML(t)
  };

  // Chrome Update (Navbar, Footer, Direction, Titles)
  function updateChrome() {
    const t = getT();
    document.documentElement.lang = currentLang;
    document.documentElement.dir = t.dir;

    // Header nav links & CTA
    const navLinksHTML =
      t.cfg.nav
        .map((n) => `<a class="l" href="#${n[0]}" data-p="${n[0]}">${n[1]}</a>`)
        .join("") +
      `<button class="lang-btn" id="langBtn" aria-label="Switch Language">${globeIcon}<span>${t.langLabel}</span></button>` +
      `<a class="btn" href="#login">${t.cfg.loginBtn || (currentLang === "ar" ? "تسجيل الدخول" : "Sign In")}</a>`;
    $("#lk").innerHTML = navLinksHTML;

    // Language toggle event listener
    const langBtn = $("#langBtn");
    if (langBtn) {
      langBtn.onclick = () => {
        const nextLang = currentLang === "en" ? "ar" : "en";
        setLanguage(nextLang);
      };
    }

    // Skip to content text
    const skipLink = $(".skip");
    if (skipLink) skipLink.textContent = t.ui.skip;

    // Footer
    $("#fd").textContent = t.cfg.desc;
    $("#cp").textContent = `© ${new Date().getFullYear()} ${t.cfg.name}. ${t.footer.rights}`;
    $("#fn").previousElementSibling.textContent = t.footer.company;
    $("#fn").innerHTML = t.cfg.nav.map((n) => `<a href="#${n[0]}">${n[1]}</a>`).join("");
    $("#fs").previousElementSibling.textContent = t.footer.solutions;
    $("#fs").innerHTML = t.cfg.solutions
      .slice(0, 5)
      .map((s) => `<a href="#solutions">${s[0]}</a>`)
      .join("");
    $("#fc").previousElementSibling.textContent = t.footer.contact;
    $("#fc").innerHTML =
      Object.values(t.cfg.contact)
        .map((v) => `<li>${v}</li>`)
        .join("") +
      t.cfg.social
        .map((s) => `<li><a href="${s.url}" rel="noopener">${s.label}</a></li>`)
        .join("");

    // Footer bottom links
    const fbLinks = $(".fb span:last-child");
    if (fbLinks) {
      fbLinks.innerHTML = `<a href="#privacy">${t.footer.privacy}</a> &nbsp;·&nbsp; <a href="#terms">${t.footer.terms}</a>`;
    }
  }

  // Routing
  function route() {
    const t = getT();
    const k = (location.hash || "#home").slice(1).split("?")[0];
    const p = PAGES[k] ? k : "home";

    document.body.classList.toggle("login-active", p === "login");

    $("#main").innerHTML = `<main>${PAGES[p](t)}</main>`;
    document.title = t.titles[p] || `${t.cfg.name} | Smart ERP`;

    $$("#lk a.l").forEach((a) =>
      a.getAttribute("data-p") === p
        ? a.setAttribute("aria-current", "page")
        : a.removeAttribute("aria-current")
    );

    initObserver();
    setTimeout(() => $$(".rv").forEach((e) => e.classList.add("v")), 2800);

    closeMenu();
    window.scrollTo({ top: 0, behavior: "instant" });

    if (p === "contact") initContactForm();
    if (p === "login") initLoginForm();
  }

  function setLanguage(lang) {
    const dict = typeof I18N !== "undefined" ? I18N : window.I18N;
    if (!dict || !dict[lang]) return;
    currentLang = lang;
    try {
      localStorage.setItem("seeda_lang", lang);
    } catch (e) {}
    updateChrome();
    route();
  }

  // Mobile Menu Controls
  const bg = $("#bg");
  const lk = $("#lk");
  function closeMenu() {
    lk.classList.remove("o");
    bg.setAttribute("aria-expanded", "false");
  }

  bg.onclick = () => {
    const isOpen = lk.classList.toggle("o");
    bg.setAttribute("aria-expanded", isOpen);
  };

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });

  // Contact Form Logic
  function initContactForm() {
    const f = $("#fm");
    if (!f) return;
    const t = getT();
    const rules = {
      name: (v) => (v.trim() ? "" : t.contactPage.rules.name),
      company: (v) => (v.trim() ? "" : t.contactPage.rules.company),
      email: (v) =>
        /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v) ? "" : t.contactPage.rules.email,
      phone: (v) =>
        /^[+\d][\d\s()-]{6,}$/.test(v.trim()) ? "" : t.contactPage.rules.phone,
      industry: (v) => (v ? "" : t.contactPage.rules.industry),
      branches: (v) => (+v >= 1 ? "" : t.contactPage.rules.branches)
    };

    const chk = (el) => {
      const m = rules[el.name] ? rules[el.name](el.value) : "";
      el.setAttribute("aria-invalid", !!m);
      if (el.nextElementSibling && el.nextElementSibling.classList.contains("err")) {
        el.nextElementSibling.textContent = m;
      }
      return !m;
    };

    $$("input, select", f).forEach((el) => {
      if (rules[el.name]) el.addEventListener("blur", () => chk(el));
    });

    f.onsubmit = async (ev) => {
      ev.preventDefault();
      const bad = $$("input, select", f).filter(
        (el) => rules[el.name] && !chk(el)
      );
      if (bad.length) {
        bad[0].focus();
        return;
      }

      const d = Object.fromEntries(new FormData(f));
      d.interest = $$("[name=interest]:checked", f).map((x) => x.value);
      const ok = $("#ok");
      ok.style.display = "block";

      if (t.cfg.formEndpoint) {
        try {
          const r = await fetch(t.cfg.formEndpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(d)
          });
          if (!r.ok) throw 0;
          ok.innerHTML = t.contactPage.msgSent;
          f.reset();
        } catch (x) {
          ok.innerHTML = t.contactPage.msgFail;
        }
      } else {
        ok.innerHTML = t.contactPage.msgNoEndpoint;
      }
      ok.focus();
    };
  }


  // Exact Portal Login Logic & Flexible Authentication Handover
  function initLoginForm() {
    const f = $("#seedaLoginForm");
    if (!f) return;

    const identifierInput = $("#loginIdentifier");
    const passwordInput = $("#loginPassword");
    const rememberCheckbox = $("#loginRememberMe");
    const checkVisual = $("#loginCheckVisual");
    const pwdToggle = $("#loginPwdToggle");
    const forgotBtn = $("#loginForgotBtn");
    const forgotModal = $("#forgotModal");
    const closeForgot = $("#closeForgotModal");
    const submitBtn = $("#loginSubmitBtn");
    const toast = $("#loginToast");

    // Load saved identifier
    try {
      const saved = localStorage.getItem("reflecto_remember_admin") || localStorage.getItem("seeda_remember_id");
      if (saved && identifierInput) {
        identifierInput.value = saved;
        if (rememberCheckbox) rememberCheckbox.checked = true;
        if (checkVisual) checkVisual.classList.add("checked");
      }
    } catch (e) {}

    // Checkbox toggle visual
    if (rememberCheckbox && checkVisual) {
      const toggleCheck = () => {
        rememberCheckbox.checked = !rememberCheckbox.checked;
        checkVisual.classList.toggle("checked", rememberCheckbox.checked);
      };
      checkVisual.parentElement.onclick = (e) => {
        e.preventDefault();
        toggleCheck();
      };
    }

    // Toggle Password Visibility
    if (pwdToggle && passwordInput) {
      pwdToggle.onclick = () => {
        const isPassword = passwordInput.getAttribute("type") === "password";
        passwordInput.setAttribute("type", isPassword ? "text" : "password");
        const eyeOpen = $(".portal-eye-open", pwdToggle);
        const eyeClosed = $(".portal-eye-closed", pwdToggle);
        if (eyeOpen && eyeClosed) {
          eyeOpen.style.display = isPassword ? "block" : "none";
          eyeClosed.style.display = isPassword ? "none" : "block";
        }
      };
    }

    // Forgot Password Modal
    if (forgotBtn && forgotModal) {
      forgotBtn.onclick = () => { forgotModal.style.display = "flex"; };
    }
    if (closeForgot && forgotModal) {
      closeForgot.onclick = () => { forgotModal.style.display = "none"; };
    }
    if (forgotModal) {
      forgotModal.onclick = (e) => {
        if (e.target === forgotModal) forgotModal.style.display = "none";
      };
    }

    const showToast = (msg, type = "error") => {
      if (!toast) return;
      toast.className = "portal-toast " + type;
      toast.textContent = msg;
    };

    const hideToast = () => {
      if (toast) toast.className = "portal-toast";
    };

    // Form Submit
    f.onsubmit = async (ev) => {
      ev.preventDefault();
      hideToast();

      const identifier = (identifierInput?.value || "").trim();
      const password = (passwordInput?.value || "").trim();
      const remember = !!(rememberCheckbox && rememberCheckbox.checked);

      if (!identifier) {
        showToast("يرجى إدخال رقم الهاتف أو الرقم الوظيفي", "error");
        if (identifierInput) identifierInput.focus();
        return;
      }
      if (!password) {
        showToast("يرجى إدخال كلمة المرور", "error");
        if (passwordInput) passwordInput.focus();
        return;
      }

      if (remember) {
        try {
          localStorage.setItem("reflecto_remember_admin", identifier);
          localStorage.setItem("seeda_remember_id", identifier);
        } catch (e) {}
      } else {
        try {
          localStorage.removeItem("reflecto_remember_admin");
          localStorage.removeItem("seeda_remember_id");
        } catch (e) {}
      }

      // Enter loading state
      submitBtn.disabled = true;
      const spinner = $(".portal-btn-spinner", submitBtn);
      const label = $(".portal-btn-label", submitBtn);
      if (spinner) spinner.style.display = "inline-block";
      if (label) label.textContent = "جاري تسجيل الدخول...";

      try {
        let apiUrl = "https://back.reflecto.com.sa/api/v1";
        if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
          apiUrl = "http://localhost:8000/api/v1";
        }

        // Helper to perform the login API request
        const doRequest = async (portalType) => {
          const bodyPayload = {
            identifier,
            phone: identifier,
            email: identifier,
            password
          };
          if (portalType) bodyPayload.portal_type = portalType;

          try {
            const r = await fetch(`${apiUrl}/auth/login`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
              },
              body: JSON.stringify(bodyPayload)
            });
            const d = await r.json().catch(() => ({}));
            return { ok: r.ok, status: r.status, data: d };
          } catch (netErr) {
            if (apiUrl.includes("localhost")) {
              apiUrl = "https://back.reflecto.com.sa/api/v1";
              const r = await fetch(`${apiUrl}/auth/login`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Accept": "application/json"
                },
                body: JSON.stringify(bodyPayload)
              });
              const d = await r.json().catch(() => ({}));
              return { ok: r.ok, status: r.status, data: d };
            }
            throw netErr;
          }
        };

        // Attempt 1: No portal_type — works with updated server (no restrictions)
        let result = await doRequest(null);

        // If server returns 403 FORBIDDEN_DOMAIN, try specific portal types
        if (!result.ok) {
          const errCode = result.data?.error?.code || "";
          const errMsg = result.data?.error?.message || "";

          if (errCode === "FORBIDDEN_DOMAIN" || errMsg.includes("معزولة") || errMsg.includes("حصراً")) {
            // Old server with domain restrictions — try admin first
            result = await doRequest("admin");
            if (!result.ok) {
              result = await doRequest("technician");
            }
          } else if (errMsg.includes("فني")) {
            result = await doRequest("technician");
          } else if (errMsg.includes("إداري")) {
            result = await doRequest("admin");
          } else if (errCode === "FORBIDDEN_PORTAL" || errCode === "USE_DEDICATED_PORTAL") {
            // Flip the portal type
            result = await doRequest("technician");
            if (!result.ok) result = await doRequest("admin");
          }
        }

        if (!result.ok || !result.data?.success) {
          const errText = result.data?.error?.message || "بيانات الدخول غير صحيحة، يرجى التأكد من رقم الجوال وكلمة المرور";
          showToast(errText, "error");
          submitBtn.disabled = false;
          if (spinner) spinner.style.display = "none";
          if (label) label.textContent = "تسجيل الدخول";
          return;
        }

        // Login succeeded!
        const user = result.data.user || {};
        const role = (user.role || "").toLowerCase();
        const isTech = role === "technician";
        const name = user.full_name || (isTech ? "الفني" : "المسؤول");

        showToast(`مرحباً بك مجدداً، ${name}!`, "success");

        // Target Portals: Always direct to official portals
        // admin => https://admin.reflecto.com.sa/
        // technician => https://technical.reflecto.com.sa/
        let targetPortal = isTech ? "https://technical.reflecto.com.sa" : "https://admin.reflecto.com.sa";

        // Handover session payload
        const handover = {
          access_token: result.data.access_token,
          refresh_token: result.data.refresh_token,
          user: result.data.user
        };
        const encoded = encodeURIComponent(JSON.stringify(handover));
        const encodedToken = encodeURIComponent(result.data.access_token || "");
        const encodedRefreshToken = encodeURIComponent(result.data.refresh_token || "");
        const encodedUser = encodeURIComponent(JSON.stringify(result.data.user || {}));
        const encodedIdentifier = encodeURIComponent(identifier);
        const encodedPass = encodeURIComponent(password);

        // Redirect directly to official live portal with token and auto-login credentials
        const redirectUrl = `${targetPortal}/?auto_login=1&identifier=${encodedIdentifier}&password=${encodedPass}&access_token=${encodedToken}&refresh_token=${encodedRefreshToken}&user=${encodedUser}&auth_data=${encoded}#auth_data=${encoded}`;

        setTimeout(() => {
          window.location.href = redirectUrl;
        }, 500);

      } catch (err) {
        console.error("Login Error:", err);
        showToast("تعذر الاتصال بالخادم. يرجى التحقق من اتصالك بالإنترنت", "error");
        submitBtn.disabled = false;
        if (spinner) spinner.style.display = "none";
        if (label) label.textContent = "تسجيل الدخول";
      }
    };
  }

  // Event Listeners
  window.addEventListener("hashchange", route);
  window.addEventListener(
    "scroll",
    () => $("#hd").classList.toggle("s", window.scrollY > 10),
    { passive: true }
  );

  // Initialize
  updateChrome();
  route();
})();
