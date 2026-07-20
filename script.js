(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- nav scrolled state ---------- */
  var nav = document.getElementById("nav");
  function onScrollNav() {
    if (window.scrollY > 40) nav.classList.add("scrolled");
    else nav.classList.remove("scrolled");
  }
  document.addEventListener("scroll", onScrollNav, { passive: true });
  onScrollNav();

  /* ---------- mobile menu ---------- */
  var burger = document.getElementById("navBurger");
  var mobileMenu = document.getElementById("mobileMenu");
  burger.addEventListener("click", function () {
    mobileMenu.classList.toggle("open");
  });
  mobileMenu.querySelectorAll("a").forEach(function (a) {
    a.addEventListener("click", function () { mobileMenu.classList.remove("open"); });
  });

  /* ---------- parallax layers ---------- */
  var layers = Array.prototype.slice.call(document.querySelectorAll(".parallax-layer"));

  function updateParallax() {
    var vh = window.innerHeight;
    layers.forEach(function (el) {
      var rect = el.parentElement.getBoundingClientRect();
      // only animate while section is near viewport
      if (rect.bottom < -200 || rect.top > vh + 200) return;
      var speed = parseFloat(el.getAttribute("data-speed")) || 0.2;
      var offset = (rect.top) * speed;
      el.style.transform = "translate3d(0," + offset.toFixed(1) + "px,0)";
    });
  }

  if (!reduceMotion) {
    var ticking = false;
    document.addEventListener("scroll", function () {
      if (!ticking) {
        window.requestAnimationFrame(function () {
          updateParallax();
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
    window.addEventListener("resize", updateParallax);
    updateParallax();
  }

  /* ---------- reveal-on-scroll ---------- */
  var revealTargets = document.querySelectorAll(
    ".menu-card, .gallery-item, .board-row, .stat, .visit-card"
  );
  if ("IntersectionObserver" in window && !reduceMotion) {
    revealTargets.forEach(function (el) {
      el.style.opacity = "0";
      el.style.transform = "translateY(24px)";
      el.style.transition = "opacity 0.7s ease, transform 0.7s ease";
    });
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.style.opacity = "1";
            entry.target.style.transform = "translateY(0)";
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealTargets.forEach(function (el) { io.observe(el); });
  }
})();
