/**
 * Valentine site — vanilla JS, GitHub Pages compatible.
 * Images loaded from photos.json (manifest). No localStorage; state resets on refresh.
 */

(function () {
  "use strict";

  var COUPLES_BASE = "assets/images/couples/";
  var KIDS_BASE = "assets/images/kids/";

  /** Timer counts up from March 24, 2025 00:00 local (months 0-indexed) */
  var LOVE_START_DATE = new Date(2025, 2, 24, 0, 0, 0);
  var LOVE_START = LOVE_START_DATE;

  var NO_CLICKS_MAX = 8;
  var NO_MESSAGES = [
    "Choose wisely 😼",
    "Are you sure?",
    "Really?",
    "Pleeease?",
    "Think again 💜",
    "Last chance…",
    "Pretty please?",
    "Just click Yes already!",
    "Yes is this way 👉",
  ];

  var noClickCount = 0;
  var photosManifest = null;

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = a[i];
      a[i] = a[j];
      a[j] = tmp;
    }
    return a;
  }

  function fetchManifest() {
    return fetch("photos.json")
      .then(function (r) {
        if (!r.ok) throw new Error("photos.json failed");
        return r.json();
      })
      .then(function (data) {
        photosManifest = data;
        return data;
      })
      .catch(function () {
        photosManifest = { couples: [], kids: [] };
        return photosManifest;
      });
  }

  function buildCollageTrack(filenames, trackId, reverse) {
    var track = document.getElementById(trackId);
    if (!track || !filenames || filenames.length === 0) return;
    var list = shuffle(filenames);
    var duplicated = list.concat(list);
    var frag = document.createDocumentFragment();
    duplicated.forEach(function (filename) {
      var src = COUPLES_BASE + filename;
      var item = document.createElement("div");
      item.className = "collage-item";
      var img = document.createElement("img");
      img.src = src;
      img.alt = "Us";
      img.onerror = function () {
        img.classList.add("broken");
      };
      item.appendChild(img);
      frag.appendChild(item);
    });
    track.appendChild(frag);
  }

  function buildSliders() {
    var list = (photosManifest && photosManifest.couples) || [];
    buildCollageTrack(list, "collage-track-top", false);
    buildCollageTrack(list, "collage-track-bottom", true);
  }

  function buildKidsGrid() {
    var grid = document.getElementById("kids-grid");
    var list = (photosManifest && photosManifest.kids) || [];
    if (!grid || list.length === 0) return;
    grid.textContent = "";
    var frag = document.createDocumentFragment();
    list.forEach(function (filename) {
      var src = KIDS_BASE + filename;
      var card = document.createElement("div");
      card.className = "photo-card";
      card.setAttribute("data-src", src);
      var img = document.createElement("img");
      img.src = src;
      img.alt = "Childhood photo";
      img.loading = "lazy";
      img.onerror = function () {
        img.classList.add("broken");
      };
      card.appendChild(img);
      frag.appendChild(card);
    });
    grid.appendChild(frag);
    initKidsLightbox();
  }

  function initKidsLightbox() {
    var lightbox = document.getElementById("lightbox");
    var lightboxImg = document.getElementById("lightbox-img");
    var lightboxClose = document.getElementById("lightbox-close");
    if (!lightbox || !lightboxImg) return;

    function openLightbox(src) {
      lightboxImg.src = src;
      lightbox.hidden = false;
      document.body.style.overflow = "hidden";
    }

    function closeLightbox() {
      lightbox.hidden = true;
      document.body.style.overflow = "";
    }

    document.querySelectorAll("#kids-grid .photo-card").forEach(function (card) {
      card.addEventListener("click", function () {
        var src = card.getAttribute("data-src") || (card.querySelector("img") && card.querySelector("img").src);
        if (src) openLightbox(src);
      });
    });

    if (lightboxClose) lightboxClose.addEventListener("click", closeLightbox);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && lightbox && !lightbox.hidden) closeLightbox();
    });
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) closeLightbox();
    });
  }

  function isKidsPage() {
    return document.body.classList.contains("page-kids");
  }

  function init() {
    injectFloatingHearts();
    if (isKidsPage()) {
      fetchManifest().then(buildKidsGrid);
      return;
    }
    initStickerFallback();
    initButtons();
    initVerifyModal();
    fetchManifest().then(function () {
      buildSliders();
    });
  }

  function injectFloatingHearts() {
    var bg = document.querySelector(".hearts-bg");
    if (!bg) return;
    var count = 12;
    for (var i = 0; i < count; i++) {
      var el = document.createElement("span");
      el.className = "heart-float";
      el.textContent = "♥";
      el.style.left = Math.random() * 100 + "%";
      el.style.top = Math.random() * 100 + "%";
      el.style.animationDelay = -(Math.random() * 6) + "s";
      el.style.fontSize = (0.7 + Math.random() * 0.8) + "rem";
      bg.appendChild(el);
    }
  }

  function initStickerFallback() {
    var img = document.querySelector(".card-sticker .sticker-img");
    var fallback = document.querySelector(".sticker-fallback");
    if (!img || !fallback) return;
    if (img.complete && img.naturalWidth > 0) {
      fallback.hidden = true;
    } else {
      img.onload = function () {
        fallback.hidden = true;
      };
      img.onerror = function () {
        img.style.display = "none";
        fallback.hidden = false;
      };
    }
  }

  /** Heart shape positions (x, y as 0–100% of overlay-heart-images box) — approximate heart outline */
  var HEART_POSITIONS = [
    { x: 50, y: 4 }, { x: 32, y: 12 }, { x: 68, y: 12 },
    { x: 22, y: 26 }, { x: 50, y: 22 }, { x: 78, y: 26 },
    { x: 14, y: 42 }, { x: 36, y: 38 }, { x: 64, y: 38 }, { x: 86, y: 42 },
    { x: 26, y: 56 }, { x: 50, y: 54 }, { x: 74, y: 56 },
    { x: 50, y: 76 },
  ];

  function buildOverlayHeart() {
    var container = document.getElementById("overlay-heart-images");
    var list = (photosManifest && photosManifest.kids) || [];
    if (!container || list.length === 0) return;
    container.textContent = "";
    var shuffled = shuffle(list);
    var positions = shuffle(HEART_POSITIONS.slice());
    var frag = document.createDocumentFragment();
    for (var i = 0; i < positions.length; i++) {
      var pos = positions[i];
      var filename = shuffled[i % shuffled.length];
      var src = KIDS_BASE + filename;
      var wrap = document.createElement("div");
      wrap.className = "overlay-heart-item";
      wrap.style.left = pos.x + "%";
      wrap.style.top = pos.y + "%";
      wrap.style.transform = "translate(-50%, -50%)";
      var img = document.createElement("img");
      img.src = src;
      img.alt = "";
      img.onerror = function () {
        wrap.style.visibility = "hidden";
      };
      wrap.appendChild(img);
      frag.appendChild(wrap);
    }
    container.appendChild(frag);
  }

  function initButtons() {
    var btnYes = document.getElementById("btn-yes");
    var btnNo = document.getElementById("btn-no");
    var subtext = document.getElementById("card-subtext");

    if (!btnYes || !btnNo) return;

    btnYes.addEventListener("click", function () {
      setAcceptedState(true);
      playPop();
      showConfetti();
      var overlay = document.getElementById("celebration-overlay");
      if (overlay) overlay.hidden = false;
    });

    btnNo.addEventListener("click", function () {
      noClickCount++;
      var n = Math.min(noClickCount, NO_MESSAGES.length - 1);
      if (subtext) subtext.textContent = NO_MESSAGES[n];

      var maxClicks = NO_CLICKS_MAX;
      var t = Math.min(noClickCount / maxClicks, 1);

      var yesScale = 1 + 0.45 * t;
      btnYes.style.transform = "scale(" + yesScale + ")";
      btnYes.style.zIndex = "2";

      var noScale = 1 - 0.65 * t;
      btnNo.style.transform = "scale(" + noScale + ")";
      btnNo.style.zIndex = "1";

      var maxMove = 40;
      var angle = (noClickCount * 73) % 360;
      var rad = (angle * Math.PI) / 180;
      var dx = Math.cos(rad) * maxMove * t;
      var dy = Math.sin(rad) * maxMove * t;
      btnNo.style.position = "relative";
      btnNo.style.left = dx + "px";
      btnNo.style.top = dy + "px";

      if (noClickCount >= maxClicks) {
        btnNo.style.display = "none";
        if (subtext) subtext.textContent = "You left me no choice";
      }
    });

  }

  var VERIFY_TARGET = { year: 2025, month: 2, day: 24 };
  var MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var selectedYear = new Date().getFullYear();
  var selectedMonth = new Date().getMonth();
  var selectedDay = null;

  function initVerifyModal() {
    var btnContinue = document.getElementById("btn-continue");
    var overlay = document.getElementById("celebration-overlay");
    var verifyModal = document.getElementById("verify-modal");
    if (btnContinue) {
      btnContinue.addEventListener("click", function () {
        if (overlay) overlay.hidden = true;
        if (verifyModal) {
          verifyModal.hidden = false;
          var now = new Date();
          selectedYear = now.getFullYear();
          selectedMonth = now.getMonth();
          selectedDay = null;
          renderCalendar();
          var err = document.getElementById("verify-error");
          if (err) err.textContent = "";
        }
      });
    }
    var prevBtn = document.getElementById("calendar-prev");
    var nextBtn = document.getElementById("calendar-next");
    var yearSelect = document.getElementById("calendar-year");
    var daysEl = document.getElementById("calendar-days");
    if (prevBtn) prevBtn.addEventListener("click", function () { changeMonth(-1); });
    if (nextBtn) nextBtn.addEventListener("click", function () { changeMonth(1); });
    if (yearSelect) yearSelect.addEventListener("change", function () { selectedYear = parseInt(yearSelect.value, 10); selectedDay = null; renderCalendar(); });
    var submitBtn = document.getElementById("verify-submit");
    if (submitBtn) submitBtn.addEventListener("click", submitVerify);
  }

  function changeMonth(delta) {
    selectedMonth += delta;
    if (selectedMonth > 11) { selectedMonth = 0; selectedYear++; }
    if (selectedMonth < 0) { selectedMonth = 11; selectedYear--; }
    selectedDay = null;
    renderCalendar();
    var ys = document.getElementById("calendar-year");
    if (ys) ys.value = selectedYear;
  }

  function renderCalendar() {
    var monthYearEl = document.getElementById("calendar-month-year");
    var yearSelect = document.getElementById("calendar-year");
    var daysEl = document.getElementById("calendar-days");
    if (!monthYearEl || !daysEl) return;
    monthYearEl.textContent = MONTH_NAMES[selectedMonth] + " " + selectedYear;
    if (yearSelect && yearSelect.options.length === 0) {
      var start = 2020;
      var end = 2030;
      for (var y = start; y <= end; y++) {
        var opt = document.createElement("option");
        opt.value = y;
        opt.textContent = y;
        if (y === selectedYear) opt.selected = true;
        yearSelect.appendChild(opt);
      }
    }
    if (yearSelect) {
      yearSelect.value = selectedYear;
    }
    var first = new Date(selectedYear, selectedMonth, 1);
    var startDay = first.getDay();
    var daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    var prevMonthDays = new Date(selectedYear, selectedMonth, 0).getDate();
    daysEl.textContent = "";
    var dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    dayLabels.forEach(function (l) {
      var h = document.createElement("div");
      h.className = "calendar-day calendar-day--empty";
      h.textContent = l;
      daysEl.appendChild(h);
    });
    for (var i = 0; i < startDay; i++) {
      var d = prevMonthDays - startDay + 1 + i;
      var cell = document.createElement("div");
      cell.className = "calendar-day calendar-day--disabled";
      cell.textContent = d;
      daysEl.appendChild(cell);
    }
    for (var d = 1; d <= daysInMonth; d++) {
      var cell = document.createElement("div");
      cell.className = "calendar-day";
      cell.textContent = d;
      cell.dataset.day = d;
      if (selectedDay === d) cell.classList.add("calendar-day--selected");
      cell.addEventListener("click", function () {
        var day = parseInt(this.dataset.day, 10);
        if (isNaN(day)) return;
        selectedDay = day;
        renderCalendar();
      });
      daysEl.appendChild(cell);
    }
    var total = startDay + daysInMonth;
    var next = 7 - (total % 7);
    if (next < 7) {
      for (var n = 1; n <= next; n++) {
        var cell = document.createElement("div");
        cell.className = "calendar-day calendar-day--disabled";
        cell.textContent = n;
        daysEl.appendChild(cell);
      }
    }
  }

  function submitVerify() {
    var card = document.getElementById("verify-card");
    var errEl = document.getElementById("verify-error");
    if (selectedDay === null) {
      if (errEl) errEl.textContent = "Pick a day";
      if (card) card.classList.add("shake");
      setTimeout(function () { if (card) card.classList.remove("shake"); }, 500);
      return;
    }
    if (selectedYear === VERIFY_TARGET.year && selectedMonth === VERIFY_TARGET.month && selectedDay === VERIFY_TARGET.day) {
      revealLoveExperience();
    } else {
      if (errEl) errEl.textContent = "Wrong date — try again";
      if (card) card.classList.add("shake");
      setTimeout(function () { if (card) card.classList.remove("shake"); }, 500);
    }
  }

  function revealLoveExperience() {
    var verifyModal = document.getElementById("verify-modal");
    var rewardSection = document.getElementById("reward-section");
    if (verifyModal) verifyModal.hidden = true;
    if (rewardSection) {
      rewardSection.hidden = false;
      buildHeartCanopy();
      startLoveTimer();
      startDriftPetals();
      startLoveTranslations();
      initPhotoStrips();
    }
    revealKidsLink();
  }

  function revealKidsLink() {
    var sep = document.getElementById("nav-kids-sep");
    var link = document.getElementById("nav-kids-link");
    if (sep) sep.hidden = false;
    if (link) link.hidden = false;
  }

  var LOVE_PHRASES = [
    "I love you",
    "Kocham cię",
    "Te iubesc",
    "Volim te",
  ];

  function startLoveTranslations() {
    var el = document.getElementById("love-translation-headline");
    if (!el || !LOVE_PHRASES.length) return;
    var index = 0;
    el.textContent = LOVE_PHRASES[0];
    el.style.opacity = "1";
    setInterval(function () {
      index = (index + 1) % LOVE_PHRASES.length;
      el.style.opacity = "0";
      setTimeout(function () {
        el.textContent = LOVE_PHRASES[index];
        el.style.opacity = "1";
      }, 400);
    }, 2000);
  }

  function initPhotoStrips() {
    var list = (photosManifest && photosManifest.kids) || [];
    if (list.length === 0) return;
    var left = document.getElementById("photo-strip-left");
    var right = document.getElementById("photo-strip-right");
    if (!left || !right) return;
    var slotsPerStrip = 4;
    var leftShown = [];
    var rightShown = [];
    function pickDistinctExcluding(pool, exclude, count) {
      var available = pool.filter(function (f) {
        return exclude.indexOf(f) === -1;
      });
      if (available.length === 0) available = pool.slice();
      var sh = shuffle(available);
      var out = [];
      for (var i = 0; i < count && i < sh.length; i++) out.push(sh[i]);
      return out;
    }
    function fillStrip(container, shownArr, excludeFrom) {
      container.textContent = "";
      var filenames = pickDistinctExcluding(list, excludeFrom, slotsPerStrip);
      shownArr.length = 0;
      filenames.forEach(function (filename) {
        shownArr.push(filename);
        var wrap = document.createElement("div");
        wrap.className = "photo-strip-slot";
        var img = document.createElement("img");
        img.alt = "";
        img.src = KIDS_BASE + filename;
        wrap.appendChild(img);
        container.appendChild(wrap);
      });
    }
    var leftInitial = pickDistinctExcluding(list, [], slotsPerStrip);
    leftShown = leftInitial.slice();
    (function buildLeft() {
      left.textContent = "";
      leftInitial.forEach(function (filename) {
        var wrap = document.createElement("div");
        wrap.className = "photo-strip-slot";
        var img = document.createElement("img");
        img.alt = "";
        img.src = KIDS_BASE + filename;
        wrap.appendChild(img);
        left.appendChild(wrap);
      });
    })();
    var rightInitial = pickDistinctExcluding(list, leftInitial, slotsPerStrip);
    if (rightInitial.length < slotsPerStrip) {
      rightInitial = pickDistinctExcluding(list, [], slotsPerStrip);
    }
    rightShown = rightInitial.slice();
    (function buildRight() {
      right.textContent = "";
      rightInitial.forEach(function (filename) {
        var wrap = document.createElement("div");
        wrap.className = "photo-strip-slot";
        var img = document.createElement("img");
        img.alt = "";
        img.src = KIDS_BASE + filename;
        wrap.appendChild(img);
        right.appendChild(wrap);
      });
    })();
    function cycleOne(strip, shownArr) {
      var slots = strip.querySelectorAll(".photo-strip-slot img");
      if (slots.length === 0 || list.length <= 1) return;
      var pickFrom = list.filter(function (f) {
        return shownArr.indexOf(f) === -1;
      });
      if (pickFrom.length === 0) pickFrom = list.slice();
      var filename = pickFrom[Math.floor(Math.random() * pickFrom.length)];
      var idx = Math.floor(Math.random() * slots.length);
      var oldFilename = shownArr[idx];
      shownArr[idx] = filename;
      slots[idx].src = KIDS_BASE + filename;
    }
    setInterval(function () {
      cycleOne(left, leftShown);
    }, 2800);
    setInterval(function () {
      cycleOne(right, rightShown);
    }, 3100);
  }

  function setAcceptedState(accepted) {
    var card = document.getElementById("valentine-card");
    if (accepted && card) card.hidden = true;
  }

  function playPop() {
    try {
      var audio = new Audio("assets/audio/pop.mp3");
      audio.volume = 0.4;
      audio.play().catch(function () {});
    } catch (e) {}
  }

  function showOverlay() {
    var overlay = document.getElementById("celebration-overlay");
    if (overlay) overlay.hidden = false;
  }

  function showConfetti() {
    var container = document.getElementById("confetti-container");
    if (!container) return;

    var colors = [
      "#7D2AE8", "#e88", "#f9c", "#ffd3df", "#c9f", "#faa", "#ffe9ee", "#b8a", "#fff",
    ];
    var count = 160;
    var frag = document.createDocumentFragment();

    for (var i = 0; i < count; i++) {
      var el = document.createElement("div");
      el.style.position = "absolute";
      el.style.width = (6 + Math.random() * 10) + "px";
      el.style.height = (6 + Math.random() * 8) + "px";
      el.style.left = Math.random() * 100 + "%";
      el.style.top = "-20px";
      el.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      el.style.borderRadius = Math.random() > 0.5 ? "50%" : "2px";
      el.style.pointerEvents = "none";
      el.style.willChange = "transform";

      var duration = 3 + Math.random() * 2;
      var delay = Math.random() * 0.5;
      var xDrift = (Math.random() - 0.5) * 120;
      var rotation = Math.random() * 720 - 360;

      el.animate(
        [
          { transform: "translateY(0) translateX(0) rotate(0deg)", opacity: 1 },
          {
            transform: "translateY(100vh) translateX(" + xDrift + "px) rotate(" + rotation + "deg)",
            opacity: 0.6,
          },
        ],
        {
          duration: duration * 1000,
          delay: delay * 1000,
          easing: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
          fill: "forwards",
        }
      );

      frag.appendChild(el);
    }

    container.appendChild(frag);
    setTimeout(function () {
      while (container.firstChild) container.removeChild(container.firstChild);
    }, 6000);
  }

  /** Heart parametric: x = 16*sin³(t), y = 13*cos(t)-5*cos(2t)-2*cos(3t)-cos(4t); sample with r in [0.2,1] for fill */
  function heartPoints(count) {
    var points = [];
    var n = 0;
    while (points.length < count && n < count * 3) {
      n++;
      var t = Math.random() * Math.PI * 2;
      var r = 0.2 + Math.random() * 0.8;
      var x = r * 16 * Math.pow(Math.sin(t), 3);
      var y = r * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
      points.push({
        left: 50 + (x / 16) * 48,
        top: 50 - (y / 13) * 48,
      });
    }
    return points;
  }

  var PETAL_COLORS = ["#c93a5c", "#d85a7a", "#e87892", "#b82a4a", "#f090a8", "#a02040"];

  function buildHeartCanopy() {
    var canopy = document.getElementById("treeCanopy");
    if (!canopy) return;
    canopy.textContent = "";
    var count = 90 + Math.floor(Math.random() * 51);
    var points = heartPoints(count);
    points.forEach(function (p, i) {
      var el = document.createElement("div");
      el.className = "tree-petal";
      el.textContent = "♥";
      el.style.left = p.left + "%";
      el.style.top = p.top + "%";
      el.style.color = PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)];
      el.style.transform = "translate(-50%, -50%) scale(0.7)";
      el.style.opacity = "0";
      canopy.appendChild(el);
      var delay = Math.random() * 1600;
      setTimeout(function () {
        el.animate(
          [
            { opacity: 0, transform: "translate(-50%, -50%) scale(0.7)" },
            { opacity: 1, transform: "translate(-50%, -50%) scale(1.05)" },
          ],
          { duration: 450, fill: "forwards" }
        );
      }, delay);
    });
  }

  function startLoveTimer() {
    var el = document.getElementById("loveTimer");
    if (!el) return;
    function format(n) {
      return n < 10 ? "0" + n : String(n);
    }
    function update() {
      var now = new Date();
      var start = LOVE_START;
      if (now < start) {
        el.textContent = "—";
        return;
      }
      var diff = Math.floor((now - start) / 1000);
      var sec = diff % 60;
      var min = Math.floor(diff / 60) % 60;
      var hr = Math.floor(diff / 3600) % 24;
      var day = Math.floor(diff / 86400);
      el.textContent =
        day + " days " + format(hr) + " hours " + format(min) + " minutes " + format(sec) + " seconds ago";
    }
    update();
    setInterval(update, 1000);
  }

  function startDriftPetals() {
    var stage = document.querySelector(".stage");
    if (!stage) return;
    var driftContainer = document.createElement("div");
    driftContainer.className = "tree-drift-container";
    stage.appendChild(driftContainer);

    function spawnDrift() {
      var el = document.createElement("div");
      el.className = "tree-petal-drift";
      el.textContent = "♥";
      var startLeft = 65 + Math.random() * 30;
      var startTop = 15 + Math.random() * 55;
      el.style.left = startLeft + "%";
      el.style.top = startTop + "%";
      el.style.color = PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)];
      driftContainer.appendChild(el);
      var endLeft = 8 + Math.random() * 18;
      var endTop = 30 + Math.random() * 35;
      var duration = 4000 + Math.random() * 2500;
      el.animate(
        [
          {
            transform: "translate(-50%, -50%) rotate(0deg)",
            opacity: 0.9,
          },
          {
            transform: "translate(-50%, -50%) rotate(120deg)",
            opacity: 0,
          },
        ],
        { duration: duration, fill: "forwards", easing: "ease-in-out" }
      );
      el.animate(
        [
          { left: startLeft + "%", top: startTop + "%" },
          { left: endLeft + "%", top: endTop + "%" },
        ],
        { duration: duration, fill: "forwards", easing: "ease-in-out" }
      );
      setTimeout(function () {
        if (el.parentNode) el.parentNode.removeChild(el);
      }, duration + 100);
    }

    setTimeout(function () {
      var iv = setInterval(spawnDrift, 350);
      setTimeout(function () {
        clearInterval(iv);
      }, 80000);
    }, 2200);
  }

  var REWARD_LOVE_PHRASES = [
    { lang: "Romanian", text: "Te iubesc" },
    { lang: "Serbian", text: "Volim te" },
    { lang: "English", text: "I love you" },
    { lang: "Polish", text: "Kocham cię" },
  ];

  function getSixDistinctKids() {
    var list = (photosManifest && photosManifest.kids) || [];
    if (list.length === 0) return [];
    var shuffled = shuffle(list.slice());
    if (list.length >= 6) {
      return shuffled.slice(0, 6);
    }
    var out = [];
    for (var i = 0; i < 6; i++) {
      out.push(shuffled[i % shuffled.length]);
    }
    return shuffle(out);
  }

  function buildRewardPhotoBoxes() {
    var container = document.getElementById("reward-photo-boxes");
    var list = (photosManifest && photosManifest.kids) || [];
    if (!container || list.length === 0) return;
    container.textContent = "";
    var six = getSixDistinctKids();
    for (var i = 0; i < 6; i++) {
      var box = document.createElement("div");
      box.className = "reward-photo-box";
      var img = document.createElement("img");
      img.alt = "";
      img.src = KIDS_BASE + (six[i] || list[i % list.length]);
      img.onerror = function () {
        this.style.visibility = "hidden";
      };
      box.appendChild(img);
      container.appendChild(box);
    }
  }

  function startRewardLoveTextCycle() {
    var el = document.getElementById("reward-love-text");
    if (!el || !REWARD_LOVE_PHRASES.length) return;
    var index = 0;
    el.textContent = REWARD_LOVE_PHRASES[0].text;
    setInterval(function () {
      index = (index + 1) % REWARD_LOVE_PHRASES.length;
      el.textContent = REWARD_LOVE_PHRASES[index].text;
    }, 2500);
  }

  function startRewardPhotoRotation() {
    var container = document.getElementById("reward-photo-boxes");
    var list = (photosManifest && photosManifest.kids) || [];
    if (!container || list.length === 0) return;
    var boxes = container.querySelectorAll(".reward-photo-box img");
    setInterval(function () {
      var six = getSixDistinctKids();
      boxes.forEach(function (img, i) {
        if (six[i]) img.src = KIDS_BASE + six[i];
      });
    }, 2800);
  }

  function startCountdown() {
    var el = document.getElementById("love-countdown-timer");
    if (!el) return;

    function format(n) {
      return n < 10 ? "0" + n : String(n);
    }

    function update() {
      var now = new Date();
      var start = LOVE_START_DATE;
      if (now < start) {
        el.textContent = "—";
        return;
      }
      var diff = Math.floor((now - start) / 1000);
      var sec = diff % 60;
      var min = Math.floor(diff / 60) % 60;
      var hr = Math.floor(diff / 3600) % 24;
      var day = Math.floor(diff / 86400);
      el.textContent =
        day + " days " +
        format(hr) + " hours " +
        format(min) + " minutes " +
        format(sec) + " seconds";
    }

    update();
    setInterval(update, 1000);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
