(function () {
  "use strict";

  const menu = document.querySelector(".main-nav");
  const menuButton = document.querySelector(".menu-button");

  if (menu && menuButton) {
    menuButton.addEventListener("click", function () {
      const open = menu.classList.toggle("is-open");
      menuButton.setAttribute("aria-expanded", String(open));
    });
  }

  document.querySelectorAll("[data-menu-trigger]").forEach(function (button) {
    button.addEventListener("click", function (event) {
      event.stopPropagation();
      const parent = button.closest(".nav-item, .subnav");
      const isOpen = parent.classList.toggle("is-open");
      button.setAttribute("aria-expanded", String(isOpen));
      parent.parentElement.querySelectorAll(":scope > .nav-item.is-open, :scope > .subnav.is-open").forEach(function (other) {
        if (other !== parent) {
          other.classList.remove("is-open");
          const otherButton = other.querySelector(":scope > [data-menu-trigger]");
          if (otherButton) otherButton.setAttribute("aria-expanded", "false");
        }
      });
    });
  });

  document.querySelectorAll(".main-nav a").forEach(function (link) {
    link.addEventListener("click", function () {
      if (menu) menu.classList.remove("is-open");
      if (menuButton) menuButton.setAttribute("aria-expanded", "false");
      document.querySelectorAll(".nav-item.is-open, .subnav.is-open").forEach(function (item) {
        item.classList.remove("is-open");
        const trigger = item.querySelector(":scope > [data-menu-trigger]");
        if (trigger) trigger.setAttribute("aria-expanded", "false");
      });
    });
  });

  const overlay = document.querySelector(".drawer-overlay");
  const drawer = document.querySelector(".contact-drawer");
  const closeButton = document.querySelector(".drawer-close");
  let lastFocus = null;

  const autoPopupKey = "researchpro-contact-popup-shown";

  function openDrawer() {
    if (!overlay || !drawer) return;
    try { sessionStorage.setItem(autoPopupKey, "yes"); } catch (error) {}
    lastFocus = document.activeElement;
    overlay.classList.add("is-open");
    drawer.classList.add("is-open");
    overlay.setAttribute("aria-hidden", "false");
    drawer.setAttribute("aria-hidden", "false");
    drawer.inert = false;
    document.body.classList.add("drawer-open");
    window.setTimeout(function () {
      const first = drawer.querySelector("input");
      if (first) first.focus();
    }, 80);
  }

  function closeDrawer() {
    if (!overlay || !drawer) return;
    overlay.classList.remove("is-open");
    drawer.classList.remove("is-open");
    overlay.setAttribute("aria-hidden", "true");
    drawer.setAttribute("aria-hidden", "true");
    drawer.inert = true;
    document.body.classList.remove("drawer-open");
    if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus({preventScroll: true});
  }

  document.querySelectorAll("[data-open-contact]").forEach(function (button) {
    button.addEventListener("click", openDrawer);
  });
  if (overlay) overlay.addEventListener("click", closeDrawer);
  if (closeButton) closeButton.addEventListener("click", closeDrawer);
  let shouldAutoOpen = false;
  try { shouldAutoOpen = !sessionStorage.getItem(autoPopupKey); } catch (error) { shouldAutoOpen = true; }
  if (shouldAutoOpen && drawer) {
    window.setTimeout(function () {
      if (!drawer.classList.contains("is-open")) openDrawer();
    }, 800);
  }
  document.querySelectorAll("[data-dismiss-chat]").forEach(function (button) {
    button.addEventListener("click", function () {
      button.hidden = true;
      const chatLink = document.querySelector(".chat-bubble");
      if (chatLink) chatLink.hidden = true;
    });
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Tab" && drawer && drawer.classList.contains("is-open")) {
      const focusable = Array.from(drawer.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled])'));
      if (focusable.length) {
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    }
    if (event.key === "Escape") {
      closeDrawer();
      document.querySelectorAll(".nav-item.is-open, .subnav.is-open").forEach(function (item) {
        item.classList.remove("is-open");
        const trigger = item.querySelector(":scope > [data-menu-trigger]");
        if (trigger) trigger.setAttribute("aria-expanded", "false");
      });
    }
  });

  function formToWhatsApp(form, prefix) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const data = new FormData(form);
      const parts = [prefix || "Hello ResearchPro, I have an enquiry."];
      ["name", "email", "phone", "topic", "message"].forEach(function (key) {
        const value = String(data.get(key) || "").trim();
        if (value) parts.push(key.charAt(0).toUpperCase() + key.slice(1) + ": " + value);
      });
      const country = String(data.get("countryCode") || "+91");
      const phone = String(data.get("phone") || "").trim();
      if (phone) {
        const phoneIndex = parts.findIndex(function (line) { return line.indexOf("Phone: ") === 0; });
        if (phoneIndex >= 0) parts[phoneIndex] = "Phone: " + country + " " + phone;
      }
      const url = "https://wa.me/919133855533?text=" + encodeURIComponent(parts.join("\n"));
      const opened = window.open(url, "_blank");
      if (opened) opened.opener = null;
      const status = form.querySelector(".form-message");
      if (status) status.textContent = opened
        ? "WhatsApp opened with your message. Review it and press Send there."
        : "Your browser blocked the new tab. Use the WhatsApp contact button to continue.";
      if (opened) form.reset();
    });
  }

  document.querySelectorAll("[data-wa-form]").forEach(function (form) {
    formToWhatsApp(form, "Hello ResearchPro, I would like to discuss academic support.");
  });

  const articleForm = document.querySelector("[data-article-form]");
  if (articleForm) {
    const fileInput = articleForm.querySelector('input[type="file"]');
    const fileLabel = articleForm.querySelector("[data-file-name]");
    if (fileInput && fileLabel) {
      fileInput.addEventListener("change", function () {
        const file = fileInput.files && fileInput.files[0];
        if (!file) {
          fileLabel.textContent = "No file selected.";
          return;
        }
        if (file.size > 10 * 1024 * 1024) {
          fileInput.setCustomValidity("Please choose a file smaller than 10 MB.");
          fileLabel.textContent = "That file is larger than 10 MB.";
        } else {
          fileInput.setCustomValidity("");
          fileLabel.textContent = file.name + " selected. Attach it manually in your email app.";
        }
      });
    }
    articleForm.addEventListener("submit", function (event) {
      event.preventDefault();
      if (!articleForm.reportValidity()) return;
      const data = new FormData(articleForm);
      const selected = fileInput && fileInput.files && fileInput.files[0];
      const body = [
        "Hello ResearchPro Academic Services,",
        "",
        "I would like to request publication support.",
        "Name: " + data.get("name"),
        "Email: " + data.get("email"),
        "Phone: " + (data.get("countryCode") || "+91") + " " + (data.get("phone") || ""),
        "Research title: " + (data.get("title") || ""),
        "Research area: " + (data.get("area") || ""),
        "Target journal: " + (data.get("journal") || "Not specified"),
        "Message: " + (data.get("message") || ""),
        "Manuscript file selected: " + (selected ? selected.name : "No file selected"),
        "",
        "I understand that the selected file must be attached manually before sending."
      ].join("\n");
      const subject = encodeURIComponent("Publication support enquiry");
      const mailBody = encodeURIComponent(body);
      const status = articleForm.querySelector(".form-message");
      if (status) status.textContent = "Your email app is opening. Attach the manuscript file there before sending.";
      window.location.href = "mailto:contact@researchproacademicservices.com?subject=" + subject + "&body=" + mailBody;
    });
  }

  const areaSearch = document.querySelector("[data-area-search]");
  if (areaSearch) {
    const areas = Array.from(document.querySelectorAll(".journal-area"));
    const empty = document.querySelector("[data-area-empty]");
    areaSearch.addEventListener("input", function () {
      const query = areaSearch.value.trim().toLowerCase();
      let count = 0;
      areas.forEach(function (area) {
        const show = !query || area.textContent.toLowerCase().includes(query);
        area.hidden = !show;
        if (show) count++;
      });
      if (empty) empty.hidden = count > 0;
    });
  }

  const insightSearch = document.querySelector("[data-insight-search]");
  if (insightSearch) {
    const cards = Array.from(document.querySelectorAll(".insight-card"));
    const empty = document.querySelector("[data-insight-empty]");
    insightSearch.addEventListener("input", function () {
      const query = insightSearch.value.trim().toLowerCase();
      let count = 0;
      cards.forEach(function (card) {
        const show = !query || card.textContent.toLowerCase().includes(query);
        card.hidden = !show;
        if (show) count++;
      });
      if (empty) empty.hidden = count > 0;
    });
  }

  document.querySelectorAll("[data-current-year]").forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });
})();
