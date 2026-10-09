/* Jape — Programmer Profile interactions */
(() => {
  "use strict";

  const nav = document.querySelector(".nav-wrap");
  const navLinks = Array.from(document.querySelectorAll(".nav-link"));
  const navIndicator = document.querySelector(".nav-indicator");
  const menuToggle = document.querySelector(".menu-toggle");
  const sections = Array.from(document.querySelectorAll("main section[id]"));
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Position the moving active-tab indicator based on the selected link.
  function moveIndicator(link) {
    if (!navIndicator || !link || window.innerWidth <= 700) return;
    const navBox = link.parentElement.getBoundingClientRect();
    const linkBox = link.getBoundingClientRect();
    navIndicator.style.width = `${linkBox.width}px`;
    navIndicator.style.transform = `translateX(${linkBox.left - navBox.left}px)`;
  }

  function setActiveLink(id) {
    const matching = navLinks.find(link => link.getAttribute("href") === `#${id}`);
    if (!matching) return;
    navLinks.forEach(link => {
      const active = link === matching;
      link.classList.toggle("active", active);
      if (active) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
    moveIndicator(matching);
  }

  navLinks.forEach(link => {
    link.addEventListener("click", event => {
      const targetId = link.getAttribute("href").slice(1);
      const target = document.getElementById(targetId);
      if (target) {
        event.preventDefault();
        target.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
        history.replaceState(null, "", `#${targetId}`);
      }
      setActiveLink(targetId);
      closeMobileMenu();
    });
  });

  function closeMobileMenu() {
    if (!nav || !menuToggle) return;
    nav.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation");
  }

  if (menuToggle && nav) {
    menuToggle.addEventListener("click", () => {
      const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
      menuToggle.setAttribute("aria-expanded", String(!isOpen));
      menuToggle.setAttribute("aria-label", isOpen ? "Open navigation" : "Close navigation");
      nav.classList.toggle("is-open", !isOpen);
    });
    document.addEventListener("click", event => {
      if (window.innerWidth <= 700 && nav.classList.contains("is-open") &&
          !nav.contains(event.target) && !menuToggle.contains(event.target)) {
        closeMobileMenu();
      }
    });
  }

  // Highlight the section currently visible in the viewport.
  if ("IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver(entries => {
      const visible = entries
        .filter(entry => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) setActiveLink(visible.target.id);
    }, { rootMargin: "-25% 0px -55% 0px", threshold: [0, 0.1, 0.25, 0.5] });
    sections.forEach(section => sectionObserver.observe(section));

    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -35px 0px" });
    document.querySelectorAll(".reveal").forEach(element => revealObserver.observe(element));
  } else {
    document.querySelectorAll(".reveal").forEach(element => element.classList.add("is-visible"));
  }

  // The project detail toggle is functional and accessible.
  const detailsButton = document.querySelector(".project-details-button");
  const detailsPanel = document.querySelector("#project-details");
  if (detailsButton && detailsPanel) {
    detailsButton.addEventListener("click", () => {
      const isExpanded = detailsButton.getAttribute("aria-expanded") === "true";
      detailsButton.setAttribute("aria-expanded", String(!isExpanded));
      detailsPanel.hidden = isExpanded;
      detailsButton.innerHTML = isExpanded
        ? 'View project details <span aria-hidden="true">↘</span>'
        : 'Hide project details <span aria-hidden="true">↗</span>';
    });
  }

  // Set the footer year automatically.
  const year = document.querySelector("#current-year");
  if (year) year.textContent = new Date().getFullYear();

  // Keep the indicator correctly aligned after a resize.
  window.addEventListener("resize", () => {
    const activeLink = document.querySelector(".nav-link.active");
    if (activeLink) moveIndicator(activeLink);
    if (window.innerWidth > 700) closeMobileMenu();
  });

  // Prevent placeholder contact links from pretending to be personal profiles.
  document.querySelectorAll("[data-placeholder-link]").forEach(link => {
    link.addEventListener("click", event => {
      const destination = link.getAttribute("href") || "";
      const isPlaceholder = destination.includes("your-email@example.com") ||
        link.textContent.includes("Add your ");
      if (isPlaceholder) {
        event.preventDefault();
        const help = document.querySelector(".contact-help");
        if (help) {
          help.textContent = "This is a sample contact link. Edit index.html and add your real contact details first.";
          help.setAttribute("role", "status");
        }
      }
    });
  });

  // Initialize the current section and indicator.
  const initialId = window.location.hash.slice(1) || "home";
  setActiveLink(document.getElementById(initialId) ? initialId : "home");
  window.addEventListener("load", () => {
    const activeLink = document.querySelector(".nav-link.active");
    if (activeLink) moveIndicator(activeLink);
  });
})();
