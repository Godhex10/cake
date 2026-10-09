/* =========================================================
   Rosé Cakery — interactions & animations
   ========================================================= */
(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isTouch = window.matchMedia("(hover: none)").matches;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const rand = (min, max) => Math.random() * (max - min) + min;

  document.body.classList.add("loading");

  /* ---------- Preloader ---------- */
  const finishLoading = () => {
    const pre = $("#preloader");
    if (!pre || pre.classList.contains("done")) return;
    pre.classList.add("done");
    document.body.classList.remove("loading");
    document.body.classList.add("ready");
    buildDrip();
  };
  window.addEventListener("load", () => setTimeout(finishLoading, 700));
  setTimeout(finishLoading, 3500); // safety net if an image is slow

  /* ---------- Header ---------- */
  const header = $("#header");
  const toTop = $("#toTop");
  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle("scrolled", y > 30);
    toTop.classList.toggle("show", y > 700);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  const burger = $("#burger");
  const navLinks = $("#navLinks");
  const closeMenu = () => {
    burger.classList.remove("open");
    navLinks.classList.remove("open");
    burger.setAttribute("aria-expanded", "false");
  };
  burger.addEventListener("click", () => {
    const open = !navLinks.classList.contains("open");
    burger.classList.toggle("open", open);
    navLinks.classList.toggle("open", open);
    burger.setAttribute("aria-expanded", String(open));
  });
  $$("a", navLinks).forEach((a) => a.addEventListener("click", closeMenu));

  /* ---------- Active nav link on scroll ---------- */
  const sections = $$("main section[id]");
  const navObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        $$("a", navLinks).forEach((a) => a.classList.toggle("active", a.getAttribute("href") === "#" + e.target.id));
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );
  sections.forEach((s) => navObserver.observe(s));

  /* =========================================================
     ICING DRIP — builds drips sized to the screen width
     ========================================================= */
  const goo = $("#dripGoo");
  const shine = $("#dripShine");
  const drops = $("#dripDrops");
  let dripData = [];
  let dropTimer;

  function buildDrip() {
    $$(".d", goo).forEach((n) => n.remove());
    $$(".s", shine).forEach((n) => n.remove());
    dripData = [];

    const width = window.innerWidth;
    const small = width < 600;
    const maxLen = small ? 105 : 175;
    const minLen = small ? 20 : 30;
    const count = Math.max(8, Math.round(width / (small ? 42 : 58)));
    const step = 100 / count;

    for (let i = 0; i < count; i++) {
      const w = Math.round(rand(small ? 14 : 18, small ? 28 : 42));
      // mix of long and short drips, like real icing
      const long = Math.random() < 0.45;
      const len = Math.round(long ? rand(maxLen * 0.6, maxLen) : rand(minLen, maxLen * 0.45));
      const left = i * step + rand(step * 0.1, step * 0.7);
      const dur = rand(1.6, 3.2).toFixed(2) + "s";
      const delay = (reduceMotion ? 0 : rand(0, 1.2)).toFixed(2) + "s";
      const ooze = rand(3, 6).toFixed(2) + "s";
      const stretch = (1 + rand(0.04, 0.14)).toFixed(3);

      const d = document.createElement("div");
      d.className = "d";
      d.style.cssText = `left:calc(${left}% - ${w / 2}px);--w:${w}px;--len:${len}px;--dur:${dur};--delay:${delay};--ooze:${ooze};--stretch:${stretch}`;
      goo.appendChild(d);

      // glossy highlight on the longer drips
      if (len > 45) {
        const sw = Math.max(3, Math.round(w * 0.18));
        const s = document.createElement("div");
        s.className = "s";
        s.style.cssText = `left:calc(${left}% - ${w / 2}px + ${Math.round(w * 0.22)}px);--sw:${sw}px;--slen:${Math.round(len * 0.62)}px;--dur:${dur};--delay:${delay};--ooze:${ooze};--stretch:${stretch}`;
        shine.appendChild(s);
      }

      dripData.push({ left, w, len, long, ready: (parseFloat(dur) + parseFloat(delay)) * 1000 });
    }

    clearInterval(dropTimer);
    if (!reduceMotion) dropTimer = setInterval(spawnDrop, 900);
  }

  // little drops that fall from the tips of long drips
  function spawnDrop() {
    if (document.hidden) return;
    const candidates = dripData.filter((d) => d.long);
    if (!candidates.length) return;
    const d = candidates[Math.floor(Math.random() * candidates.length)];
    const drop = document.createElement("span");
    drop.className = "drop";
    drop.style.left = d.left + "%";
    drop.style.top = 40 + d.len + d.w * 0.6 + "px";
    drops.appendChild(drop);
    drop.addEventListener("animationend", () => drop.remove());
  }

  let resizeTimer;
  let lastWidth = window.innerWidth;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      // only rebuild on real width changes (mobile URL bar changes height only)
      if (Math.abs(window.innerWidth - lastWidth) > 40 && document.body.classList.contains("ready")) {
        lastWidth = window.innerWidth;
        buildDrip();
      }
    }, 250);
  });

  /* ---------- Falling sprinkles in the hero ---------- */
  const sprinkleColors = ["#ff7eb0", "#ffd166", "#7bdff2", "#b5e48c", "#ffffff", "#e23a78", "#cdb4db"];
  const sprinkleBox = $("#heroSprinkles");
  if (!reduceMotion) {
    const n = window.innerWidth < 600 ? 14 : 28;
    for (let i = 0; i < n; i++) {
      const s = document.createElement("span");
      s.className = "sprinkle";
      s.style.left = rand(0, 100) + "%";
      s.style.background = sprinkleColors[i % sprinkleColors.length];
      s.style.setProperty("--r", rand(0, 180) + "deg");
      s.style.animationDuration = rand(9, 18) + "s";
      s.style.animationDelay = -rand(0, 18) + "s";
      sprinkleBox.appendChild(s);
    }
  }

  /* ---------- Mouse parallax on hero floaters ---------- */
  const floaters = $$(".floater");
  const hero = $(".hero");
  if (!isTouch && !reduceMotion) {
    hero.addEventListener("mousemove", (e) => {
      const x = e.clientX / window.innerWidth - 0.5;
      const y = e.clientY / window.innerHeight - 0.5;
      floaters.forEach((f) => {
        const depth = parseFloat(f.dataset.depth);
        f.style.transform = `translate(${x * depth * -60}px, ${y * depth * -60}px)`;
      });
    });
  }

  /* ---------- Scroll reveal ---------- */
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          revealObserver.unobserve(e.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
  );
  $$(".reveal").forEach((el) => revealObserver.observe(el));

  /* ---------- Menu filter tabs ---------- */
  const tabs = $$(".tab");
  const pill = $("#tabPill");
  const cards = $$(".card");
  const movePill = (tab) => {
    pill.style.left = tab.offsetLeft + "px";
    pill.style.width = tab.offsetWidth + "px";
  };
  tabs.forEach((tab) =>
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.toggle("active", t === tab));
      movePill(tab);
      const f = tab.dataset.filter;
      cards.forEach((card, i) => {
        const show = f === "all" || card.dataset.cat === f;
        card.classList.toggle("hide", !show);
        card.classList.remove("pop");
        if (show) {
          void card.offsetWidth; // restart animation
          card.style.animationDelay = (i % 6) * 0.05 + "s";
          card.classList.add("pop", "in");
        }
      });
    })
  );
  const initPill = () => movePill($(".tab.active"));
  window.addEventListener("load", initPill);
  window.addEventListener("resize", initPill);
  document.fonts && document.fonts.ready.then(initPill);
  initPill();

  /* ---------- 3D tilt on cards (desktop) ---------- */
  if (!isTouch && !reduceMotion) {
    cards.forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(900px) rotateY(${x * 10}deg) rotateX(${y * -10}deg) translateY(-8px)`;
      });
      card.addEventListener("mouseleave", () => (card.style.transform = ""));
    });
  }

  /* ---------- Add to box (with flying cake) ---------- */
  const cartBtn = $("#cartBtn");
  const cartCount = $("#cartCount");
  const toast = $("#toast");
  let count = 0;
  let toastTimer;
  const showToast = (msg, icon = "ph-heart") => {
    toast.innerHTML = `<i class="ph-fill ${icon}"></i> `;
    toast.append(msg);
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
  };

  $$(".add-btn").forEach((btn) =>
    btn.addEventListener("click", () => {
      const from = btn.getBoundingClientRect();
      const to = cartBtn.getBoundingClientRect();
      const fly = document.createElement("span");
      fly.className = "flyer";
      fly.innerHTML = '<i class="ph-fill ph-cake"></i>';
      fly.style.left = from.left + from.width / 2 - 14 + "px";
      fly.style.top = from.top - 10 + "px";
      document.body.appendChild(fly);
      requestAnimationFrame(() => {
        fly.style.transform = `translate(${to.left - from.left - from.width / 2 + 24}px, ${to.top - from.top + 14}px) scale(.4) rotate(360deg)`;
        fly.style.opacity = ".4";
      });
      setTimeout(() => {
        fly.remove();
        count++;
        cartCount.textContent = count;
        cartBtn.classList.remove("bump");
        void cartBtn.offsetWidth;
        cartBtn.classList.add("bump");
      }, reduceMotion ? 0 : 800);

      btn.classList.add("added");
      btn.textContent = "Added ✓";
      setTimeout(() => {
        btn.classList.remove("added");
        btn.textContent = "Add to box";
      }, 1600);
      showToast(`${btn.dataset.name} added to your box!`, "ph-check-circle");
    })
  );
  cartBtn.addEventListener("click", () =>
    showToast(count ? `You have ${count} sweet item${count > 1 ? "s" : ""} in your box` : "Your cake box is empty — add something sweet!", "ph-shopping-bag")
  );

  /* ---------- Animated counters ---------- */
  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const el = e.target;
        const target = +el.dataset.target;
        const dur = 1800;
        const start = performance.now();
        const tick = (now) => {
          const p = Math.min((now - start) / dur, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(target * eased).toLocaleString();
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        counterObserver.unobserve(el);
      });
    },
    { threshold: 0.6 }
  );
  $$(".counter").forEach((c) => counterObserver.observe(c));

  /* ---------- Reviews slider ---------- */
  const slides = $("#slides");
  const dotsBox = $("#dots");
  const slideCount = slides.children.length;
  let current = 0;
  let autoTimer;
  for (let i = 0; i < slideCount; i++) {
    const b = document.createElement("button");
    b.setAttribute("aria-label", `Show review ${i + 1}`);
    b.addEventListener("click", () => {
      goTo(i);
      restartAuto();
    });
    dotsBox.appendChild(b);
  }
  const goTo = (i) => {
    current = (i + slideCount) % slideCount;
    slides.style.transform = `translateX(-${current * 100}%)`;
    $$("button", dotsBox).forEach((d, k) => d.classList.toggle("active", k === current));
  };
  const restartAuto = () => {
    clearInterval(autoTimer);
    autoTimer = setInterval(() => goTo(current + 1), 5000);
  };
  goTo(0);
  restartAuto();

  // swipe support
  let startX = null;
  slides.addEventListener("touchstart", (e) => (startX = e.touches[0].clientX), { passive: true });
  slides.addEventListener("touchend", (e) => {
    if (startX === null) return;
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 40) {
      goTo(current + (dx < 0 ? 1 : -1));
      restartAuto();
    }
    startX = null;
  });

  /* ---------- Gallery lightbox ---------- */
  $$(".g-item").forEach((item) =>
    item.addEventListener("click", () => {
      const img = $("img", item);
      const lb = document.createElement("div");
      lb.className = "lightbox";
      const big = document.createElement("img");
      big.src = img.src.replace(/w=\d+/, "w=1400");
      big.alt = img.alt;
      lb.appendChild(big);
      document.body.appendChild(lb);
      requestAnimationFrame(() => lb.classList.add("show"));
      const close = () => {
        lb.classList.remove("show");
        setTimeout(() => lb.remove(), 350);
        document.removeEventListener("keydown", onKey);
      };
      const onKey = (e) => e.key === "Escape" && close();
      lb.addEventListener("click", close);
      document.addEventListener("keydown", onKey);
    })
  );

  /* ---------- Order form ---------- */
  const form = $("#orderForm");
  const note = $("#formNote");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    let ok = true;
    $$("[required]", form).forEach((f) => {
      const bad = !f.value.trim();
      f.classList.toggle("invalid", bad);
      if (bad) ok = false;
    });
    if (!ok) {
      note.textContent = "Please fill in your name and phone number 🍓";
      return;
    }
    // TODO: connect this to email / WhatsApp / a form service
    note.textContent = `Thank you, ${$("#name").value.trim()}! We'll be in touch very soon.`;
    form.reset();
    confettiBurst(form);
  });

  /* ---------- Sprinkle confetti ---------- */
  function confettiBurst(el) {
    if (reduceMotion) return;
    const r = el.getBoundingClientRect();
    for (let i = 0; i < 40; i++) {
      const t = document.createElement("span");
      t.className = "trail";
      t.style.left = r.left + r.width / 2 + "px";
      t.style.top = r.top + r.height - 60 + "px";
      t.style.background = sprinkleColors[i % sprinkleColors.length];
      t.style.setProperty("--tx", rand(-220, 220) + "px");
      t.style.setProperty("--ty", rand(-260, 40) + "px");
      t.style.setProperty("--tr", rand(-360, 360) + "deg");
      t.style.animationDuration = rand(0.8, 1.4) + "s";
      document.body.appendChild(t);
      t.addEventListener("animationend", () => t.remove());
    }
  }

  /* ---------- Sprinkle cursor trail (desktop only) ---------- */
  if (!isTouch && !reduceMotion) {
    let last = 0;
    window.addEventListener("mousemove", (e) => {
      const now = performance.now();
      if (now - last < 45) return;
      last = now;
      const t = document.createElement("span");
      t.className = "trail";
      t.style.left = e.clientX + "px";
      t.style.top = e.clientY + "px";
      t.style.background = sprinkleColors[Math.floor(Math.random() * sprinkleColors.length)];
      t.style.setProperty("--tx", rand(-20, 20) + "px");
      t.style.setProperty("--ty", rand(20, 50) + "px");
      t.style.setProperty("--tr", rand(-200, 200) + "deg");
      document.body.appendChild(t);
      t.addEventListener("animationend", () => t.remove());
    });
  }

  /* ---------- Footer year ---------- */
  $("#year").textContent = new Date().getFullYear();
})();
