(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  // Scroll-reveal for sections and cards.
  var revealTargets = document.querySelectorAll(".reveal");
  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    revealTargets.forEach(function (el) {
      el.classList.add("is-visible");
    });
  } else {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" },
    );
    revealTargets.forEach(function (el) {
      revealObserver.observe(el);
    });
  }

  // Premium nav: transparent over the hero, blurred once the page has
  // scrolled even slightly.
  var siteHeader = document.querySelector("header");
  if (siteHeader) {
    var HEADER_SCROLL_THRESHOLD = 24;
    var updateHeaderScrollState = function () {
      siteHeader.classList.toggle(
        "scrolled",
        window.scrollY > HEADER_SCROLL_THRESHOLD,
      );
    };
    updateHeaderScrollState();
    window.addEventListener("scroll", updateHeaderScrollState, {
      passive: true,
    });
  }

  // Premium nav: active-section indicator. A sliding underline tracks
  // whichever nav link corresponds to the section currently crossing a
  // fixed trigger line, recomputed on scroll/resize. Sections are walked
  // in document order (matching nav order) and the last one whose top has
  // passed the trigger line wins — the standard scrollspy algorithm,
  // robust to both incremental scrolling and instant jumps (anchor
  // clicks, scrollIntoView), unlike IntersectionObserver entry ordering.
  var navEl = document.querySelector("nav.primary-nav");
  var navIndicator = document.querySelector(".nav-indicator");
  var navLinks = navEl
    ? Array.prototype.slice.call(navEl.querySelectorAll("a[href^='#']"))
    : [];

  if (navEl && navLinks.length) {
    var sectionLinkMap = {};
    var observedSections = [];
    navLinks.forEach(function (link) {
      var id = link.getAttribute("href").slice(1);
      var section = document.getElementById(id);
      if (section) {
        sectionLinkMap[id] = link;
        observedSections.push(section);
      }
    });

    var activeNavLink = null;
    function moveNavIndicator() {
      if (!navIndicator || !activeNavLink) return;
      navIndicator.style.width = activeNavLink.offsetWidth + "px";
      navIndicator.style.transform =
        "translateX(" + (activeNavLink.offsetLeft - navEl.scrollLeft) + "px)";
      navIndicator.style.opacity = "1";
    }
    function setActiveNavLink(link) {
      if (!link || link === activeNavLink) return;
      if (activeNavLink) activeNavLink.classList.remove("active");
      link.classList.add("active");
      activeNavLink = link;
      moveNavIndicator();
    }

    var NAV_TRIGGER_FRACTION = 0.35;
    function refreshActiveSection() {
      var triggerY = window.innerHeight * NAV_TRIGGER_FRACTION;
      var current = observedSections[0];
      for (var i = 0; i < observedSections.length; i++) {
        if (observedSections[i].getBoundingClientRect().top <= triggerY) {
          current = observedSections[i];
        } else {
          break;
        }
      }
      setActiveNavLink(sectionLinkMap[current.id]);
    }

    var navRefreshTicking = false;
    function scheduleNavRefresh() {
      if (navRefreshTicking) return;
      navRefreshTicking = true;
      window.requestAnimationFrame(function () {
        refreshActiveSection();
        navRefreshTicking = false;
      });
    }

    if (observedSections.length) {
      scheduleNavRefresh();
      window.addEventListener("scroll", scheduleNavRefresh, {
        passive: true,
      });
      window.addEventListener("resize", scheduleNavRefresh);
    }
    navEl.addEventListener("scroll", moveNavIndicator, { passive: true });
  }

  // KPI count-up animation.
  var kpiNumbers = document.querySelectorAll(".kpi-number[data-target]");
  function animateCount(el) {
    var target = parseInt(el.getAttribute("data-target"), 10) || 0;
    if (prefersReducedMotion) {
      el.textContent = target;
      return;
    }
    var start = 0;
    var duration = 900;
    var startTime = null;
    function step(timestamp) {
      if (startTime === null) startTime = timestamp;
      var progress = Math.min((timestamp - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(start + (target - start) * eased);
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        el.textContent = target;
      }
    }
    window.requestAnimationFrame(step);
  }
  if (kpiNumbers.length && "IntersectionObserver" in window) {
    var kpiObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            kpiObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 },
    );
    kpiNumbers.forEach(function (el) {
      kpiObserver.observe(el);
    });
  } else {
    kpiNumbers.forEach(animateCount);
  }

  // Selected Work domain filters.
  var chips = document.querySelectorAll(".filter-chips .chip");
  var projectCards = document.querySelectorAll(".project-card[data-domains]");
  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      chips.forEach(function (c) {
        c.setAttribute("aria-pressed", "false");
      });
      chip.setAttribute("aria-pressed", "true");
      var domain = chip.getAttribute("data-domain");
      projectCards.forEach(function (card) {
        if (
          domain === "all" ||
          card.getAttribute("data-domains").indexOf(domain) !== -1
        ) {
          card.hidden = false;
        } else {
          card.hidden = true;
        }
      });
    });
  });

  // Three Pillars gallery lightbox.
  var lightbox = document.getElementById("pillarLightbox");
  var thumbs = Array.prototype.slice.call(
    document.querySelectorAll(".gallery-thumb"),
  );
  if (lightbox && thumbs.length) {
    var lightboxImg = document.getElementById("lightboxImg");
    var lightboxCaption = document.getElementById("lightboxCaption");
    var currentIndex = 0;

    function showThumb(index) {
      currentIndex = (index + thumbs.length) % thumbs.length;
      var thumb = thumbs[currentIndex];
      lightboxImg.src = thumb.getAttribute("data-full");
      lightboxImg.alt = thumb.getAttribute("data-alt") || "";
      var w = thumb.getAttribute("data-width");
      var h = thumb.getAttribute("data-height");
      if (w) lightboxImg.setAttribute("width", w);
      if (h) lightboxImg.setAttribute("height", h);
      lightboxCaption.textContent = thumb.getAttribute("data-caption") || "";
    }

    thumbs.forEach(function (thumb, index) {
      thumb.addEventListener("click", function () {
        showThumb(index);
        if (typeof lightbox.showModal === "function") {
          lightbox.showModal();
        }
      });
    });

    var closeBtn = document.getElementById("lightboxClose");
    if (closeBtn) {
      closeBtn.addEventListener("click", function () {
        lightbox.close();
      });
    }
    var prevBtn = document.getElementById("lightboxPrev");
    if (prevBtn) {
      prevBtn.addEventListener("click", function () {
        showThumb(currentIndex - 1);
      });
    }
    var nextBtn = document.getElementById("lightboxNext");
    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        showThumb(currentIndex + 1);
      });
    }

    // Close when clicking the backdrop (outside the dialog's own box).
    lightbox.addEventListener("click", function (event) {
      var rect = lightbox.getBoundingClientRect();
      var inside =
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom;
      if (!inside) {
        lightbox.close();
      }
    });

    document.addEventListener("keydown", function (event) {
      if (!lightbox.open) return;
      if (event.key === "ArrowRight") showThumb(currentIndex + 1);
      if (event.key === "ArrowLeft") showThumb(currentIndex - 1);
    });
  }

  // Cyber Threat Intelligence ticker: try to upgrade the static fallback
  // items to live CISA KEV entries. If the fetch fails, times out, or
  // returns nothing usable, the fallback markup already in the page is
  // left exactly as-is — the ticker never depends on this succeeding.
  var tickerSetA = document.getElementById("tickerSetA");
  var tickerSetB = document.getElementById("tickerSetB");
  var tickerStatus = document.getElementById("tickerStatus");
  var CVE_PATTERN = /^CVE-\d{4}-\d{4,7}$/;

  function sanitizeLabel(value, maxLen) {
    if (typeof value !== "string") return "";
    var cleaned = value.replace(/[\r\n\t]+/g, " ").trim();
    if (cleaned.length > maxLen) cleaned = cleaned.slice(0, maxLen - 1) + "…";
    return cleaned;
  }

  function buildLiveItem(entry) {
    var cve = typeof entry.cveID === "string" ? entry.cveID.trim() : "";
    if (!CVE_PATTERN.test(cve)) return null;
    var vendor = sanitizeLabel(entry.vendorProject, 40);
    var product = sanitizeLabel(entry.product, 40);
    var vendorProduct = [vendor, product].filter(Boolean).join(" ");

    var li = document.createElement("li");
    var link = document.createElement("a");
    link.className = "ticker-live";
    link.href = "https://nvd.nist.gov/vuln/detail/" + encodeURIComponent(cve);
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.setAttribute(
      "aria-label",
      cve +
        (vendorProduct ? ", " + vendorProduct : "") +
        ", Known Exploited Vulnerability, opens NVD detail page in a new tab",
    );

    var cveSpan = document.createElement("span");
    cveSpan.className = "ticker-cve";
    cveSpan.textContent = cve;
    link.appendChild(cveSpan);

    if (vendorProduct) {
      var sep1 = document.createElement("span");
      sep1.className = "ticker-sep";
      sep1.setAttribute("aria-hidden", "true");
      sep1.textContent = "•";
      link.appendChild(sep1);

      var vendorSpan = document.createElement("span");
      vendorSpan.textContent = vendorProduct;
      link.appendChild(vendorSpan);
    }

    var sep2 = document.createElement("span");
    sep2.className = "ticker-sep";
    sep2.setAttribute("aria-hidden", "true");
    sep2.textContent = "•";
    link.appendChild(sep2);

    var tag = document.createElement("span");
    tag.className = "ticker-tag";
    tag.textContent = "Known Exploited Vulnerability";
    link.appendChild(tag);

    li.appendChild(link);
    return li;
  }

  function renderLiveTicker(payload) {
    if (!payload || payload.ok !== true || !Array.isArray(payload.items)) {
      return false;
    }
    var items = payload.items.map(buildLiveItem).filter(Boolean);
    if (!items.length || !tickerSetA || !tickerSetB) return false;

    tickerSetA.innerHTML = "";
    tickerSetB.innerHTML = "";
    items.forEach(function (li) {
      tickerSetA.appendChild(li);
      tickerSetB.appendChild(li.cloneNode(true));
    });

    if (tickerStatus && typeof payload.totalCount === "number") {
      var count = payload.totalCount.toLocaleString("en-US");
      var statusText = "KEV Catalog: " + count + " vulnerabilities";
      if (typeof payload.latestAdditions === "number") {
        statusText +=
          " · Latest additions: " +
          payload.latestAdditions.toLocaleString("en-US");
      }
      tickerStatus.textContent = statusText;
    }
    return true;
  }

  if (tickerSetA && tickerSetB && "fetch" in window) {
    var controller = "AbortController" in window ? new AbortController() : null;
    var timeoutId = controller
      ? setTimeout(function () {
          controller.abort();
        }, 6000)
      : null;

    fetch("/api/kev", {
      signal: controller ? controller.signal : undefined,
      headers: { Accept: "application/json" },
    })
      .then(function (res) {
        if (!res.ok) throw new Error("kev fetch failed");
        return res.json();
      })
      .then(function (payload) {
        renderLiveTicker(payload);
      })
      .catch(function () {
        /* fallback markup already in the DOM; nothing to do */
      })
      .finally(function () {
        if (timeoutId) clearTimeout(timeoutId);
      });
  }
})();
