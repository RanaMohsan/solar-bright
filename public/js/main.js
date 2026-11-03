(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const header = document.querySelector(".site-header");
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".site-nav");
  const transitionEl = document.querySelector(".page-transition");
  const mediaStage = document.getElementById("mediaStage");

  const onScroll = () => {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 20);
  };

  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  if (header && mediaStage) {
    header.classList.add("is-over-media");
  } else if (header) {
    header.classList.add("is-solid");
  }

  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      toggle.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      document.body.style.overflow = open ? "hidden" : "";
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        nav.classList.remove("is-open");
        toggle.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
      });
    });
  }

  document.querySelectorAll('a[href^="/"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      if (
        reduceMotion ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        link.target === "_blank"
      ) {
        return;
      }

      const url = new URL(link.href, window.location.origin);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname && !url.hash) {
        event.preventDefault();
        return;
      }
      if (!transitionEl || typeof gsap === "undefined") return;

      event.preventDefault();
      gsap
        .timeline()
        .set(transitionEl, { transformOrigin: "top", scaleY: 0 })
        .to(transitionEl, { scaleY: 1, duration: 0.42, ease: "power3.inOut" })
        .add(() => {
          window.location.href = link.href;
        });
    });
  });

  window.addEventListener("pageshow", () => {
    if (!transitionEl || typeof gsap === "undefined" || reduceMotion) return;
    gsap.fromTo(
      transitionEl,
      { scaleY: 1, transformOrigin: "bottom" },
      { scaleY: 0, duration: 0.48, ease: "power3.inOut" }
    );
  });

  /* ===== Cinematic media reel ===== */
  function initMediaReel() {
    const deck = document.getElementById("mediaDeck");
    if (!deck || typeof gsap === "undefined") return;

    const slides = Array.from(deck.querySelectorAll(".media-slide"));
    const progressBtns = Array.from(document.querySelectorAll("#mediaProgress button"));
    const labelEl = document.getElementById("mediaLabel");
    const prevBtn = document.getElementById("mediaPrev");
    const nextBtn = document.getElementById("mediaNext");
    const IMAGE_DURATION = 4500;
    let index = 0;
    let busy = false;
    let imageTimer = null;
    let rafId = null;
    let stackDepth = 0;

    const pauseAll = () => {
      slides.forEach((slide) => {
        const video = slide.querySelector("video");
        if (video) {
          video.pause();
          video.onended = null;
          video.ontimeupdate = null;
        }
      });
      if (imageTimer) {
        clearTimeout(imageTimer);
        imageTimer = null;
      }
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    };

    const setProgress = (activeIndex, ratio) => {
      progressBtns.forEach((btn, i) => {
        btn.classList.toggle("is-active", i === activeIndex);
        const bar = btn.querySelector("span");
        if (!bar) return;
        if (i < activeIndex) {
          bar.style.setProperty("--progress", "1");
          bar.style.transform = "scaleX(1)";
        } else if (i === activeIndex) {
          bar.style.setProperty("--progress", String(ratio));
          bar.style.transform = `scaleX(${ratio})`;
        } else {
          bar.style.setProperty("--progress", "0");
          bar.style.transform = "scaleX(0)";
        }
      });
    };

    const stackTransform = (depth) => {
      const x = 18 + depth * 10;
      const scale = 0.34 - depth * 0.03;
      const rotate = 4 + depth * 1.5;
      return {
        xPercent: x,
        scale: Math.max(scale, 0.24),
        rotateY: -18,
        rotateZ: rotate,
        opacity: Math.max(0.55 - depth * 0.12, 0.2),
        filter: "brightness(0.75)",
        borderRadius: "12px",
        zIndex: 2 - depth,
      };
    };

    const playActive = () => {
      const slide = slides[index];
      const type = slide.dataset.type;
      if (labelEl) labelEl.textContent = slide.dataset.label || "";
      setProgress(index, 0);

      if (type === "video") {
        const video = slide.querySelector("video");
        if (!video) return;
        video.currentTime = 0;
        const update = () => {
          if (!video.duration || Number.isNaN(video.duration)) return;
          setProgress(index, video.currentTime / video.duration);
        };
        video.ontimeupdate = update;
        video.onended = () => goTo(index + 1);
        const attempt = video.play();
        if (attempt && typeof attempt.catch === "function") {
          attempt.catch(() => {
            imageTimer = setTimeout(() => goTo(index + 1), IMAGE_DURATION);
          });
        }
      } else {
        const started = performance.now();
        const tick = (now) => {
          const ratio = Math.min((now - started) / IMAGE_DURATION, 1);
          setProgress(index, ratio);
          if (ratio < 1) {
            rafId = requestAnimationFrame(tick);
          }
        };
        rafId = requestAnimationFrame(tick);
        imageTimer = setTimeout(() => goTo(index + 1), IMAGE_DURATION);
      }
    };

    const layoutStacks = () => {
      slides.forEach((slide, i) => {
        if (i === index) return;
        if (slide.classList.contains("is-stack")) {
          const depth = Number(slide.dataset.stackDepth || 0);
          gsap.set(slide, stackTransform(depth));
        } else if (!slide.classList.contains("is-active") && !slide.classList.contains("is-incoming")) {
          gsap.set(slide, {
            xPercent: -8,
            scale: 1.04,
            opacity: 0,
            rotateY: 8,
            rotateZ: 0,
            filter: "brightness(1)",
            borderRadius: "0px",
            zIndex: 1,
          });
        }
      });
    };

    const goTo = (nextRaw, force = false) => {
      if (busy && !force) return;
      const next = ((nextRaw % slides.length) + slides.length) % slides.length;
      if (next === index && !force) return;

      busy = true;
      pauseAll();

      const current = slides[index];
      const incoming = slides[next];
      const depth = stackDepth % 3;

      current.classList.remove("is-active");
      current.classList.add("is-stack");
      current.dataset.stackDepth = String(depth);
      incoming.classList.add("is-incoming");

      gsap.set(incoming, {
        xPercent: -12,
        scale: 1.08,
        opacity: 0,
        rotateY: 10,
        rotateZ: 0,
        filter: "brightness(1.05)",
        borderRadius: "0px",
        zIndex: 6,
      });

      const tl = gsap.timeline({
        defaults: { ease: "power3.inOut" },
        onComplete: () => {
          slides.forEach((slide) => {
            if (slide !== incoming && slide !== current && !slide.classList.contains("is-stack")) {
              slide.classList.remove("is-active", "is-incoming");
            }
          });

          // Keep only a few stacked previews on the right
          const stacked = slides
            .filter((s) => s.classList.contains("is-stack") && s !== incoming)
            .sort((a, b) => Number(b.dataset.stackDepth || 0) - Number(a.dataset.stackDepth || 0));

          stacked.forEach((slide, i) => {
            if (i > 2) {
              slide.classList.remove("is-stack");
              delete slide.dataset.stackDepth;
              gsap.set(slide, { opacity: 0, xPercent: -10, scale: 1 });
            } else {
              slide.dataset.stackDepth = String(i);
              gsap.set(slide, stackTransform(i));
            }
          });

          incoming.classList.remove("is-incoming", "is-stack");
          incoming.classList.add("is-active");
          delete incoming.dataset.stackDepth;
          gsap.set(incoming, {
            xPercent: 0,
            scale: 1,
            opacity: 1,
            rotateY: 0,
            rotateZ: 0,
            filter: "brightness(1)",
            borderRadius: "0px",
            zIndex: 5,
          });

          index = next;
          stackDepth += 1;
          busy = false;
          playActive();
        },
      });

      tl.to(
        current,
        {
          duration: 0.95,
          ...stackTransform(depth),
          zIndex: 3,
        },
        0
      ).to(
        incoming,
        {
          duration: 0.95,
          xPercent: 0,
          scale: 1,
          opacity: 1,
          rotateY: 0,
          rotateZ: 0,
          filter: "brightness(1)",
          borderRadius: "0px",
        },
        0.08
      );
    };

    // Initial state
    slides.forEach((slide, i) => {
      if (i === 0) {
        gsap.set(slide, {
          xPercent: 0,
          scale: 1,
          opacity: 1,
          rotateY: 0,
          zIndex: 5,
        });
        slide.classList.add("is-active");
      } else {
        gsap.set(slide, {
          xPercent: -10,
          scale: 1.05,
          opacity: 0,
          zIndex: 1,
        });
      }
    });

    progressBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const target = Number(btn.dataset.go);
        if (!Number.isNaN(target)) goTo(target);
      });
    });

    if (prevBtn) prevBtn.addEventListener("click", () => goTo(index - 1));
    if (nextBtn) nextBtn.addEventListener("click", () => goTo(index + 1));

    if (reduceMotion) {
      playActive();
      return;
    }

    // Soft intro: first clip already active, then auto-advance continues
    playActive();
    layoutStacks();
  }

  if (typeof gsap !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);

    if (!reduceMotion) {
      gsap.from("[data-animate='nav']", {
        y: -16,
        opacity: 0,
        duration: 0.7,
        stagger: 0.08,
        ease: "power3.out",
        delay: 0.1,
      });

      const heroItems = gsap.utils.toArray("[data-animate='hero']");
      if (heroItems.length) {
        gsap.from(heroItems, {
          y: 36,
          opacity: 0,
          duration: 0.85,
          stagger: 0.1,
          ease: "power3.out",
          delay: 0.2,
        });
      }

      gsap.utils.toArray(".reveal").forEach((el) => {
        gsap.to(el, {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 88%" },
        });
      });

      gsap.utils.toArray(".stagger").forEach((group) => {
        gsap.to(group.children, {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: { trigger: group, start: "top 85%" },
        });
      });

      document.querySelectorAll("[data-count]").forEach((el) => {
        const target = Number(el.getAttribute("data-count")) || 0;
        const obj = { val: 0 };
        ScrollTrigger.create({
          trigger: el,
          start: "top 90%",
          once: true,
          onEnter: () => {
            gsap.to(obj, {
              val: target,
              duration: 1.35,
              ease: "power2.out",
              onUpdate: () => {
                el.textContent = Math.round(obj.val);
              },
            });
          },
        });
      });
    } else {
      gsap.set([".reveal", ".stagger > *", "[data-animate='hero']", "[data-animate='nav']"], {
        clearProps: "all",
        opacity: 1,
        y: 0,
      });
    }

    initMediaReel();
  } else {
    initMediaReel();
  }
})();
