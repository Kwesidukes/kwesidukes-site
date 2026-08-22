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
})();
