// ────────────────────────────────────────────────
// NAV: sticky on scroll + mobile menu
// ────────────────────────────────────────────────
(function () {
  const nav = document.getElementById("nav");
  const toggle = document.getElementById("nav-toggle");
  const mobileMenu = document.getElementById("nav-mobile");
  const navLinks = mobileMenu.querySelectorAll("a");

  // Sticky scroll
  const handleScroll = () => {
    if (window.scrollY > 16) {
      nav.classList.add("nav--scrolled");
    } else {
      nav.classList.remove("nav--scrolled");
    }
  };
  window.addEventListener("scroll", handleScroll, { passive: true });
  handleScroll();

  // Mobile toggle
  const closeMenu = () => {
    toggle.setAttribute("aria-expanded", "false");
    mobileMenu.classList.remove("is-open");
    mobileMenu.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  };

  toggle.addEventListener("click", () => {
    const isOpen = toggle.getAttribute("aria-expanded") === "true";
    if (isOpen) {
      closeMenu();
    } else {
      toggle.setAttribute("aria-expanded", "true");
      mobileMenu.classList.add("is-open");
      mobileMenu.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    }
  });

  // Close on link click
  navLinks.forEach((link) => link.addEventListener("click", closeMenu));

  // Close on outside click
  document.addEventListener("click", (e) => {
    if (!nav.contains(e.target)) closeMenu();
  });

  // Close on Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });
})();

// ────────────────────────────────────────────────
// SCROLL REVEAL
// ────────────────────────────────────────────────
(function () {
  const elements = document.querySelectorAll(".reveal");

  if (!elements.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: "0px 0px -40px 0px",
    },
  );

  elements.forEach((el) => observer.observe(el));
})();

// ────────────────────────────────────────────────
// SMOOTH SCROLL for anchor links
// ────────────────────────────────────────────────
(function () {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
      const target = document.querySelector(anchor.getAttribute("href"));
      if (!target) return;
      e.preventDefault();
      const navHeight = parseInt(
        getComputedStyle(document.documentElement).getPropertyValue(
          "--nav-height",
        ),
      );
      const top =
        target.getBoundingClientRect().top + window.scrollY - navHeight;
      window.scrollTo({ top, behavior: "smooth" });
    });
  });
})();

// ────────────────────────────────────────────────
// ACTIVE NAV LINK on scroll
// ────────────────────────────────────────────────
(function () {
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".nav__menu .nav__link");

  const setActive = () => {
    let current = "";
    sections.forEach((section) => {
      const sectionTop =
        section.offsetTop -
        parseInt(
          getComputedStyle(document.documentElement).getPropertyValue(
            "--nav-height",
          ),
        ) -
        40;
      if (window.scrollY >= sectionTop) current = section.id;
    });
    navLinks.forEach((link) => {
      link.classList.toggle(
        "nav__link--active",
        link.getAttribute("href") === `#${current}`,
      );
    });
  };
  window.addEventListener("scroll", setActive, { passive: true });
})();

// ────────────────────────────────────────────────
// CONTACT FORM — validation + submit simulation
// ────────────────────────────────────────────────
(function () {
  const form = document.getElementById("contact-form");
  const wrap = document.getElementById("contact-form-wrap");
  const submitBtn = form ? form.querySelector(".form__submit") : null;
  const resetBtn = document.getElementById("contact-reset");

  if (!form) return;

  // ── Real-time field validation feedback ──
  const getFieldError = (field) => {
    if (field.validity.valueMissing) return "Este campo es obligatorio.";
    if (field.validity.typeMismatch && field.type === "email")
      return "Ingresa un email válido.";
    if (field.validity.tooShort) return `Mínimo ${field.minLength} caracteres.`;
    return "";
  };

  const showError = (field, msg) => {
    // Para el checkbox buscamos el error en el padre del wrapper, no del input
    const container =
      field.type === "checkbox"
        ? (field.closest(".form__field") ?? field.parentElement)
        : field.parentElement;

    let err = container.querySelector(".form__error");
    if (!err) {
      err = document.createElement("span");
      err.className = "form__error";
      err.setAttribute("role", "alert");
      container.appendChild(err);
    }

    err.textContent = msg;
    err.style.display = msg ? "block" : "none";
    field.setAttribute("aria-invalid", msg ? "true" : "false");

    // No aplicar estilos de borde al checkbox
    if (field.type !== "checkbox") {
      field.style.borderColor = msg ? "#E05C5C" : "";
      field.style.boxShadow = msg ? "0 0 0 3px rgba(224,92,92,0.12)" : "";
    }
  };

  const clearError = (field) => showError(field, "");

  // ── Validación en tiempo real ──
  form.querySelectorAll("input, select, textarea").forEach((field) => {
    field.addEventListener("blur", () => {
      if (field.name === "privacy") return; // el checkbox se valida sólo al submit
      showError(field, getFieldError(field));
    });
    field.addEventListener("input", () => clearError(field));
    field.addEventListener("change", () => clearError(field));
  });

  // ── Submit ──
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    let firstError = null;
    let valid = true;

    // Validar todos los campos required excepto el checkbox (se trata aparte)
    form
      .querySelectorAll('[required]:not([type="checkbox"])')
      .forEach((field) => {
        const msg = getFieldError(field);
        if (msg) {
          showError(field, msg);
          if (!firstError) firstError = field;
          valid = false;
        }
      });

    // Validar checkbox de privacidad
    const privacy = form.querySelector("#contact-privacy");
    if (privacy && !privacy.checked) {
      showError(privacy, "Debes aceptar la política de privacidad.");
      if (!firstError) firstError = privacy;
      valid = false;
    }

    if (!valid) {
      firstError.focus();
      return;
    }

    // Simular envío async
    submitBtn.classList.add("is-loading");

    setTimeout(() => {
      submitBtn.classList.remove("is-loading");
      wrap.classList.add("is-success");
      wrap.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 1800);
  });

  // ── Reset ──
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      form.reset();
      wrap.classList.remove("is-success");

      // Limpiar estilos inline y atributos aria de todos los campos
      form.querySelectorAll("input, select, textarea").forEach((f) => {
        f.removeAttribute("aria-invalid");
        f.style.borderColor = "";
        f.style.boxShadow = "";
      });

      // Eliminar todos los spans de error del DOM
      form.querySelectorAll(".form__error").forEach((el) => el.remove());
    });
  }
})();
