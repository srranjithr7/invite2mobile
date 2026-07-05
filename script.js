(function () {
  "use strict";

  const weddingDate = new Date("2026-09-13T10:00:00+05:30").getTime();
  let canvas, box, ctx, drawing = false, revealed = false, scratchCount = 0;

  function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = String(value);
  }

  function updateCountdown() {
    const diff = weddingDate - Date.now();
    if (diff <= 0) {
      setText("days", 0); setText("hours", 0); setText("minutes", 0); setText("seconds", 0);
      return;
    }
    setText("days", Math.floor(diff / 86400000));
    setText("hours", Math.floor((diff % 86400000) / 3600000));
    setText("minutes", Math.floor((diff % 3600000) / 60000));
    setText("seconds", Math.floor((diff % 60000) / 1000));
  }

  function transitionSparks() {
    for (let i = 0; i < 38; i++) {
      const s = document.createElement("div");
      s.className = "transitionSpark";
      s.style.left = "50vw";
      s.style.top = "50vh";
      const angle = Math.random() * Math.PI * 2;
      const dist = 90 + Math.random() * 260;
      s.style.setProperty("--tx", Math.cos(angle) * dist + "px");
      s.style.setProperty("--ty", Math.sin(angle) * dist + "px");
      document.body.appendChild(s);
      setTimeout(() => s.remove(), 1300);
    }
  }

  function openInvite() {
    const cover = document.getElementById("cover");
    if (!cover || cover.classList.contains("hide")) return;
    transitionSparks();
    cover.classList.add("hide");
    setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 100);
  }

  function revealOnScroll() {
    document.querySelectorAll(".reveal").forEach((item) => {
      if (item.getBoundingClientRect().top < window.innerHeight - 80) item.classList.add("show");
    });
  }

  function setupScratch() {
    if (!canvas || !box || !ctx || revealed) return;
    const rect = box.getBoundingClientRect();
    const inset = 18;
    const width = Math.max(1, rect.width - inset * 2);
    const height = Math.max(1, rect.height - inset * 2);
    const scale = window.devicePixelRatio || 1;

    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    ctx.setTransform(scale, 0, 0, scale, 0, 0);

    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, "#8b6427");
    gradient.addColorStop(0.28, "#f1d28a");
    gradient.addColorStop(0.55, "#b9832e");
    gradient.addColorStop(0.78, "#f8e0a0");
    gradient.addColorStop(1, "#8b6427");
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = "rgba(255,255,255,0.36)";
    ctx.font = "700 13px Inter, Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("SCRATCH TO REVEAL", width / 2, height / 2);
  }

  function getPoint(e) {
    const rect = canvas.getBoundingClientRect();
    const p = e.touches ? e.touches[0] : e;
    return { x: p.clientX - rect.left, y: p.clientY - rect.top };
  }

  function addSpark(x, y) {
    const s = document.createElement("div");
    s.className = "spark";
    s.style.left = x + 18 + "px";
    s.style.top = y + 18 + "px";
    box.appendChild(s);
    setTimeout(() => s.remove(), 850);
  }

  function scratch(e) {
    if (!drawing || revealed || !ctx) return;
    e.preventDefault();
    const p = getPoint(e);
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(p.x, p.y, 26, 0, Math.PI * 2);
    ctx.fill();
    if (scratchCount % 3 === 0) addSpark(p.x, p.y);
    scratchCount++;
    if (scratchCount > 55) finishReveal();
  }

  function launchSparkles() {
    const types = ["flake", "circle", "petal", "star"];
    for (let i = 0; i < 120; i++) {
      setTimeout(() => {
        const p = document.createElement("div");
        const type = types[Math.floor(Math.random() * types.length)];
        p.className = "luxPiece " + type;
        if (type === "star") p.textContent = Math.random() > 0.5 ? "✦" : "✧";
        p.style.left = Math.random() * 100 + "vw";
        p.style.animationDuration = 4.8 + Math.random() * 4 + "s";
        p.style.setProperty("--drift", -100 + Math.random() * 200 + "px");
        p.style.setProperty("--rot", 360 + Math.random() * 540 + "deg");
        document.body.appendChild(p);
        setTimeout(() => p.remove(), 10000);
      }, i * 16);
    }
  }

  function finishReveal() {
    if (revealed) return;
    revealed = true;
    if (box) box.classList.add("revealed");
    if (canvas) canvas.style.transition = "opacity .8s ease";
    launchSparkles();
  }

  function initScratch() {
    canvas = document.getElementById("scratchCanvas");
    box = document.getElementById("designerDate");
    if (!canvas || !box) return;
    ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.addEventListener("mousedown", (e) => { drawing = true; scratch(e); });
    canvas.addEventListener("mousemove", scratch);
    window.addEventListener("mouseup", () => { drawing = false; });
    canvas.addEventListener("touchstart", (e) => { drawing = true; scratch(e); }, { passive: false });
    canvas.addEventListener("touchmove", scratch, { passive: false });
    window.addEventListener("touchend", () => { drawing = false; });
    window.addEventListener("resize", setupScratch);
    setupScratch();
  }

  document.addEventListener("DOMContentLoaded", () => {
    const cover = document.getElementById("cover");
    const openBtn = document.getElementById("openInviteBtn");
    const revealBtn = document.getElementById("revealBtn");
    if (cover) cover.addEventListener("click", openInvite);
    if (openBtn) openBtn.addEventListener("click", (e) => { e.stopPropagation(); openInvite(); });
    if (revealBtn) revealBtn.addEventListener("click", finishReveal);
    updateCountdown();
    setInterval(updateCountdown, 1000);
    window.addEventListener("scroll", revealOnScroll, { passive: true });
    revealOnScroll();
    initScratch();
  });

  window.openInvite = openInvite;
  window.finishReveal = finishReveal;
})();

/* RSVP popup - Google Sheet submission, counts, duplicate prevention, submission time */
document.addEventListener("DOMContentLoaded", () => {
  const RSVP_ENDPOINT = "https://script.google.com/macros/s/AKfycbzY9aNDRp4SMArkPDgAVMgvN9BLGt2CVyB4XAfKBTqcSSwZtqrLqlMiuTBSHGwzUNEz9w/exec";

  const modal = document.getElementById("rsvpModal");
  const openBtn = document.getElementById("openRsvpModal");
  const form = document.getElementById("rsvpForm");
  const formView = document.getElementById("rsvpFormView");
  const thanksView = document.getElementById("rsvpThanksView");
  const duplicateNote = document.getElementById("rsvpDuplicateNote");
  const submittedTime = document.getElementById("rsvpSubmittedTime");

  const yesCount = document.getElementById("rsvpYesCount");
  const noCount = document.getElementById("rsvpNoCount");
  const maybeCount = document.getElementById("rsvpMaybeCount");

  function getResponses() {
    try {
      return JSON.parse(localStorage.getItem("weddingRsvps") || "[]");
    } catch {
      return [];
    }
  }

  function hasSubmittedFromThisDevice() {
    return localStorage.getItem("weddingRsvpSubmitted") === "true";
  }

  function updateRsvpCounts() {
    const responses = getResponses();
    const counts = { yes: 0, no: 0, maybe: 0 };

    responses.forEach((item) => {
      const value = (item.attendance || "").toLowerCase();
      if (value.includes("yes")) counts.yes += 1;
      else if (value.includes("not sure")) counts.maybe += 1;
      else if (value.includes("no")) counts.no += 1;
    });

    if (yesCount) yesCount.textContent = counts.yes;
    if (noCount) noCount.textContent = counts.no;
    if (maybeCount) maybeCount.textContent = counts.maybe;
  }

  function setDuplicateState() {
    const submitted = hasSubmittedFromThisDevice();
    const submitBtn = form?.querySelector(".rsvpSubmit");

    if (duplicateNote) duplicateNote.hidden = !submitted;
    if (submitBtn) {
      submitBtn.disabled = submitted;
      submitBtn.textContent = submitted ? "Already Submitted" : "Send Response";
    }
  }

  function openRsvp() {
    if (!modal) return;
    updateRsvpCounts();
    setDuplicateState();
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("rsvpLocked");
    if (formView) formView.hidden = false;
    if (thanksView) thanksView.hidden = true;
    setTimeout(() => {
      if (!hasSubmittedFromThisDevice()) document.getElementById("guestName")?.focus();
    }, 120);
  }

  function closeRsvp() {
    if (!modal) return;
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("rsvpLocked");
  }

  async function sendToGoogleSheet(response) {
    await fetch(RSVP_ENDPOINT, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify(response)
    });
  }

  if (openBtn) openBtn.addEventListener("click", openRsvp);
  document.querySelectorAll("[data-close-rsvp]").forEach((item) => item.addEventListener("click", closeRsvp));

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal?.classList.contains("open")) closeRsvp();
  });

  if (form) {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      if (hasSubmittedFromThisDevice()) {
        setDuplicateState();
        return;
      }

      const submitBtn = form.querySelector(".rsvpSubmit");
      const name = document.getElementById("guestName")?.value.trim();
      const attendance = form.querySelector('input[name="attendance"]:checked')?.value;

      if (!name || !attendance) return;

      const now = new Date();
      const response = {
        name,
        attendance,
        submittedAt: now.toISOString(),
        submittedAtDisplay: now.toLocaleString(),
        device: navigator.userAgent
      };

      if (submitBtn) {
        submitBtn.classList.add("loading");
        submitBtn.disabled = true;
        submitBtn.textContent = "Sending...";
      }

      try {
        await sendToGoogleSheet(response);

        const existing = getResponses();
        existing.push(response);
        localStorage.setItem("weddingRsvps", JSON.stringify(existing));
        localStorage.setItem("weddingRsvpSubmitted", "true");

        updateRsvpCounts();

        if (submittedTime) submittedTime.textContent = "Submitted: " + response.submittedAtDisplay;
        if (formView) formView.hidden = true;
        if (thanksView) thanksView.hidden = false;
        form.reset();

        if (submitBtn) {
          submitBtn.classList.remove("loading");
          submitBtn.disabled = true;
          submitBtn.textContent = "Already Submitted";
        }
      } catch (error) {
        if (submitBtn) {
          submitBtn.classList.remove("loading");
          submitBtn.disabled = false;
          submitBtn.textContent = "Send Response";
        }
        alert("Submission failed. Please try again.");
      }
    });
  }

  updateRsvpCounts();
});
