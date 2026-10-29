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
      <main class="seeda-login-screen" dir="ltr">
        <!-- Left 50% Full-Bleed Vehicle Image & Branding -->
        <div class="seeda-split-visual">
          <div class="seeda-visual-bg"></div>
        </div>

        <!-- Right 50% Pure White Form Pane -->
        <div class="seeda-split-form">
          <div class="seeda-form-box">
            <!-- Header -->
            <div class="seeda-header-block">
              <h1 class="seeda-main-title">Welcome Back</h1>
              <p class="seeda-sub-title">Sign in to your SEEDA account to manage your business operations.</p>
            </div>

            <!-- Toast alert -->
            <div id="loginToast" class="seeda-toast-alert" role="alert"></div>

            <!-- Form -->
            <form id="seedaLoginForm" class="seeda-login-form" novalidate autocomplete="off">
              <!-- Email / Identifier -->
              <div class="seeda-field-container">
                <span class="seeda-input-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                    <rect x="3" y="5" width="18" height="14" rx="2.5"/>
                    <polyline points="3 7 12 13 21 7"/>
                  </svg>
                </span>
                <input
                  id="loginIdentifier"
                  name="identifier"
                  type="text"
                  placeholder="Email address"
                  autocomplete="username"
                  required
                />
              </div>

              <!-- Password -->
              <div class="seeda-field-container">
                <span class="seeda-input-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                    <rect x="5" y="11" width="14" height="10" rx="2.5"/>
                    <circle cx="12" cy="16" r="1.2"/>
                    <path d="M8 11V7a4 4 0 018 0v4"/>
                  </svg>
                </span>
                <input
                  id="loginPassword"
                  name="password"
                  type="password"
                  placeholder="Password"
                  autocomplete="current-password"
                  required
                />
                <button type="button" class="seeda-eye-btn" id="loginPwdToggle" aria-label="Toggle password visibility">
                  <svg class="pwd-eye-open" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                  <svg class="pwd-eye-closed" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" style="display:none">
                    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                </button>
              </div>

              <!-- Remember Me & Forgot Password Row -->
              <div class="seeda-action-row">
                <label class="seeda-checkbox-wrapper" for="loginRememberMe">
                  <input type="checkbox" id="loginRememberMe" checked />
                  <span class="seeda-checkbox-text">Remember me</span>
                </label>

                <button type="button" class="seeda-forgot-password-link" id="loginForgotBtn">
                  Forgot password?
                </button>
              </div>

              <!-- Sign In Button -->
              <button type="submit" class="seeda-signin-btn" id="loginSubmitBtn">
                <span class="seeda-btn-spinner" style="display:none"></span>
                <span class="seeda-btn-label">Sign In &nbsp;&rarr;</span>
              </button>
            </form>

            <!-- Divider -->
            <div class="seeda-divider-line">
              <span>or</span>
            </div>

            <!-- SSO Button -->
            <button type="button" class="seeda-sso-action-btn" id="loginSsoBtn">
              <span class="seeda-sso-badge">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="4" y="4" width="16" height="16" rx="4"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              </span>
              <span>Continue with SSO</span>
            </button>

            <!-- Bottom Contact Link -->
            <p class="seeda-footer-prompt">
              Don't have an account? <a href="#contact" class="seeda-support-link">Contact us</a>
            </p>
          </div>
        </div>

        <!-- Forgot Modal -->
        <div id="forgotModal" class="portal-modal-backdrop" style="display:none">
          <div class="portal-modal-box">
            <div class="portal-modal-icon">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
              </svg>
            </div>
            <h3>Password Recovery</h3>
            <p>Please contact your system administrator or IT support team to assist in retrieving or resetting your portal credentials.</p>
            <button type="button" class="portal-modal-close-btn" id="closeForgotModal">Close</button>
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

    // Language toggle event listeners (Desktop & Mobile)
    const mobileLangBtn = $("#mobileLangBtn");
    if (mobileLangBtn) {
      mobileLangBtn.innerHTML = `${globeIcon}<span>${t.langLabel}</span>`;
      mobileLangBtn.onclick = () => {
        const nextLang = currentLang === "en" ? "ar" : "en";
        setLanguage(nextLang);
      };
    }

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
    const pwdToggle = $("#loginPwdToggle");
    const forgotBtn = $("#loginForgotBtn");
    const ssoBtn = $("#loginSsoBtn");
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
      }
    } catch (e) {}

    // Toggle Password Visibility
    if (pwdToggle && passwordInput) {
      pwdToggle.onclick = () => {
        const isPassword = passwordInput.getAttribute("type") === "password";
        passwordInput.setAttribute("type", isPassword ? "text" : "password");
        const eyeOpen = $(".pwd-eye-open", pwdToggle);
        const eyeClosed = $(".pwd-eye-closed", pwdToggle);
        if (eyeOpen && eyeClosed) {
          eyeOpen.style.display = isPassword ? "none" : "block";
          eyeClosed.style.display = isPassword ? "block" : "none";
        }
      };
    }

    // Forgot Password Modal
    if (forgotBtn && forgotModal) {
      forgotBtn.onclick = (e) => { e.preventDefault(); forgotModal.style.display = "flex"; };
    }
    if (closeForgot && forgotModal) {
      closeForgot.onclick = () => { forgotModal.style.display = "none"; };
    }
    if (forgotModal) {
      forgotModal.onclick = (e) => {
        if (e.target === forgotModal) forgotModal.style.display = "none";
      };
    }

    // SSO Button
    if (ssoBtn) {
      ssoBtn.onclick = () => {
        showToast(
          currentLang === "ar"
            ? "تسجيل الدخول الموحد (SSO) متاح لحسابات الشركات المعتمدة. يرجى تسجيل الدخول ببياناتك أعلاه."
            : "SSO is enabled for enterprise accounts. Please sign in with your credentials above or contact support.",
          "info"
        );
      };
    }

    const showToast = (msg, type = "error") => {
      if (!toast) return;
      toast.className = "seeda-toast " + type;
      toast.textContent = msg;
    };

    const hideToast = () => {
      if (toast) toast.className = "seeda-toast";
    };

    // Form Submit
    f.onsubmit = async (ev) => {
      ev.preventDefault();
      hideToast();

      const identifier = (identifierInput?.value || "").trim();
      const password = (passwordInput?.value || "").trim();
      const remember = !!(rememberCheckbox && rememberCheckbox.checked);

      if (!identifier) {
        showToast(currentLang === "ar" ? "يرجى إدخال البريد الإلكتروني أو رقم الهاتف" : "Please enter your email or phone number", "error");
        if (identifierInput) identifierInput.focus();
        return;
      }
      if (!password) {
        showToast(currentLang === "ar" ? "يرجى إدخال كلمة المرور" : "Please enter your password", "error");
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
      const spinner = $(".seeda-btn-spinner", submitBtn);
      const label = $(".seeda-btn-label", submitBtn);
      if (spinner) spinner.style.display = "inline-block";
      if (label) label.textContent = currentLang === "ar" ? "جاري تسجيل الدخول..." : "Signing in...";

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
            result = await doRequest("admin");
            if (!result.ok) {
              result = await doRequest("technician");
            }
          } else if (errMsg.includes("فني") || errMsg.includes("technician")) {
            result = await doRequest("technician");
          } else if (errMsg.includes("إداري") || errMsg.includes("admin")) {
            result = await doRequest("admin");
          } else if (errCode === "FORBIDDEN_PORTAL" || errCode === "USE_DEDICATED_PORTAL") {
            result = await doRequest("technician");
            if (!result.ok) result = await doRequest("admin");
          }
        }

        if (!result.ok || !result.data?.success) {
          const errText = result.data?.error?.message || (currentLang === "ar" ? "بيانات الدخول غير صحيحة، يرجى التأكد من البريد/الجوال وكلمة المرور" : "Invalid email or password. Please check your credentials.");
          showToast(errText, "error");
          submitBtn.disabled = false;
          if (spinner) spinner.style.display = "none";
          if (label) label.textContent = (currentLang === "ar" ? "تسجيل الدخول ←" : "Sign In →");
          return;
        }

        // Login succeeded!
        const user = result.data.user || {};
        const role = (user.role || "").toLowerCase();
        const isTech = role === "technician";
        const name = user.full_name || (isTech ? (currentLang === "ar" ? "الفني" : "Technician") : (currentLang === "ar" ? "المسؤول" : "Administrator"));

        showToast(currentLang === "ar" ? `مرحباً بك مجدداً، ${name}!` : `Welcome back, ${name}!`, "success");

        // Target Portals:
        // admin => https://admin.reflecto.com.sa/
        // technician => https://technical.reflecto.com.sa/
        let targetPortal = isTech ? "https://technical.reflecto.com.sa" : "https://admin.reflecto.com.sa";
        if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
          targetPortal = isTech ? "http://localhost:5173/?portal=technical" : "http://localhost:5173/?portal=admin";
        }

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
        const sep = targetPortal.includes("?") ? "&" : "?";
        const redirectUrl = `${targetPortal}${sep}auto_login=1&identifier=${encodedIdentifier}&password=${encodedPass}&access_token=${encodedToken}&refresh_token=${encodedRefreshToken}&user=${encodedUser}&auth_data=${encoded}#auth_data=${encoded}`;

        setTimeout(() => {
          window.location.href = redirectUrl;
        }, 500);

      } catch (err) {
        console.error("Login Error:", err);
        showToast(currentLang === "ar" ? "تعذر الاتصال بالخادم. يرجى التحقق من اتصالك بالإنترنت" : "Failed to connect to the server. Please check your internet connection.", "error");
        submitBtn.disabled = false;
        if (spinner) spinner.style.display = "none";
        if (label) label.textContent = (currentLang === "ar" ? "تسجيل الدخول ←" : "Sign In →");
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
