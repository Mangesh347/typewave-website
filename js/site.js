// Typewave site: install links, live demo, time calculator, role tabs, and local prices.
(function () {
  "use strict";

  // After the first Chrome Web Store upload, paste the item URL here (one place for the whole site).
  var STORE_URL = "https://chromewebstore.google.com/search/Typewave%20text%20expander";

  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (id) {
    return document.getElementById(id);
  };

  document.querySelectorAll("[data-install]").forEach(function (a) {
    a.href = STORE_URL;
    a.rel = "noopener";
  });
  if ($("year")) $("year").textContent = new Date().getFullYear();

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  // ---------------- Hero demo ----------------
  var DEMOS = [
    {
      to: "jordan@northwind.com",
      subject: "Quick idea for Northwind",
      before: "Hi Jordan,\n\n",
      trigger: "/intro",
      parts: [
        "I noticed ",
        { f: "Northwind" },
        " is hiring across the sales team. We help teams like yours ",
        { f: "cut reporting time in half" },
        " without adding headcount.\n\nWorth a 15-minute look next Tuesday?\n\nBest,\nSam"
      ]
    },
    {
      to: "maria.lopez@gmail.com",
      subject: "Re: Refund for order #4821",
      before: "Hi Maria,\n\n",
      trigger: "/refund",
      parts: ["I've issued a full refund of ", { f: "$49.00" }, " to your original payment method. It usually shows up within 5–10 business days, depending on your bank.\n\nThanks for your patience!"]
    },
    {
      to: "alex.chen@outlook.com",
      subject: "Next steps with Acme",
      before: "Hi Alex,\n\n",
      trigger: "/sched",
      parts: [
        "Great news, the team would love to meet you! Could you share 2–3 times that work between Thursday and Monday? The ",
        { f: "video call" },
        " will take about ",
        { f: "45 minutes" },
        "."
      ]
    }
  ];

  function wait(ms) {
    return new Promise(function (r) {
      setTimeout(r, ms);
    });
  }

  async function runDemo() {
    var box = $("demo-text");
    if (!box) return;
    var toast = $("demo-toast");
    var caret = '<span class="demo-caret"></span>';
    var i = 0;
    if (reduce) {
      var d0 = DEMOS[0];
      box.innerHTML = esc(d0.before) + d0.parts.map(function (p) { return typeof p === "string" ? esc(p) : '<span class="fill">' + esc(p.f) + "</span>"; }).join("");
      return;
    }
    for (;;) {
      var d = DEMOS[i % DEMOS.length];
      $("demo-to").textContent = d.to;
      $("demo-subject").textContent = d.subject;
      toast.classList.remove("on");
      var typed = "";
      for (var c = 0; c < d.before.length; c++) {
        typed += d.before[c];
        box.innerHTML = esc(typed) + caret;
        await wait(40);
      }
      var trig = "";
      for (var t = 0; t < d.trigger.length; t++) {
        trig += d.trigger[t];
        box.innerHTML = esc(typed) + '<span class="trig">' + esc(trig) + "</span>" + caret;
        await wait(130);
      }
      await wait(350);
      var html = d.parts
        .map(function (p) {
          return typeof p === "string" ? esc(p) : '<span class="fill">' + esc(p.f) + "</span>";
        })
        .join("");
      box.innerHTML = esc(typed) + '<span class="new">' + html + "</span>" + caret;
      var chars = d.parts.map(function (p) { return typeof p === "string" ? p : p.f; }).join("").length - d.trigger.length;
      $("demo-saved").textContent = "Saved " + chars + " keystrokes";
      toast.classList.add("on");
      await wait(4200);
      i++;
    }
  }
  if ("IntersectionObserver" in window && $("demo-text")) {
    var started = false;
    new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting && !started) {
        started = true;
        runDemo();
      }
    }).observe($("demo-text"));
  }

  // ---------------- Calculator ----------------
  var PRO_YEAR = 39;
  function calc() {
    var msgs = +$("c-msgs").value;
    var len = +$("c-len").value;
    var rate = +$("c-rate").value;
    $("o-msgs").textContent = msgs;
    $("o-len").textContent = len;
    $("o-rate").textContent = "$" + rate;
    var minutesPerDay = (msgs * len) / 200; // 40 wpm ≈ 200 characters per minute
    var hours = (minutesPerDay * 230) / 60;
    var worth = hours * rate;
    $("r-hours").textContent = (hours >= 10 ? Math.round(hours) : hours.toFixed(1)) + " h";
    $("r-sub").textContent = "a year, worth about $" + Math.round(worth).toLocaleString("en-US") + " of your time.";
    var roi = Math.round(worth / PRO_YEAR);
    $("r-roi").textContent = roi >= 2 ? "Pro costs $" + PRO_YEAR + " a year. That's a " + roi.toLocaleString("en-US") + "× return." : "Even the free plan covers this. Try it first.";
  }
  if ($("calc")) {
    $("calc").addEventListener("submit", function (e) {
      e.preventDefault();
    });
    ["c-msgs", "c-len", "c-rate"].forEach(function (id) {
      $(id).addEventListener("input", calc);
    });
    calc();
  }

  // ---------------- Role tabs ----------------
  var ROLES = [
    { id: "sales", name: "Sales", trig: "/fu1", title: "Follow-up #1", blurb: "Cold intros, follow-ups, break-up emails, and call recaps.", text: "Hi {First name}, circling back on my note from Monday. Happy to send a 2-minute video instead of a call if that's easier." },
    { id: "support", name: "Support", trig: "/bug", title: "Bug acknowledged", blurb: "Refunds, bugs, escalations, and closings for tickets and chat.", text: "Thanks for the detailed report. I've reproduced it and passed it to our engineers as ticket {Ticket ID}. I'll update you by Friday at the latest." },
    { id: "recruiting", name: "Recruiting", trig: "/src", title: "Sourcing message", blurb: "Sourcing, scheduling, and kind, clear candidate updates.", text: "Hi {First name},\n\nYour work on {Something they did} stood out. We're hiring a {Role} at {Company} and I think you'd find the problems genuinely interesting.\n\nOpen to a quick chat?" },
    { id: "eng", name: "Engineering", trig: "/pr", title: "Pull request", blurb: "PR templates, bug reports, reviews, and standups.", text: "## What\n\n## Why\n\n## How to test\n1. \n\n## Screenshots" },
    { id: "freelance", name: "Freelance", trig: "/inv", title: "Invoice sent", blurb: "Proposals, invoices, reminders, and scope changes.", text: "Hi {Client name}, invoice #{Invoice number} for {Amount} is attached, due Oct 15. Thanks for a great project!" }
  ];
  function drawRole(id) {
    var r = ROLES.filter(function (x) { return x.id === id; })[0];
    document.querySelectorAll("#uc-tabs .chip").forEach(function (b) {
      var on = b.dataset.role === id;
      b.setAttribute("aria-selected", String(on));
      b.classList.toggle("is-selected", on);
      b.tabIndex = on ? 0 : -1;
    });
    $("uc-panel").setAttribute("aria-labelledby", "tab-" + id);
    $("uc-panel").innerHTML =
      '<div class="usecase"><div><span class="tag">' + esc(r.trig) + "</span><h3 style=\"margin-top:12px\">" + esc(r.title) + "</h3><p>" + esc(r.blurb) + "</p></div><pre>" +
      esc(r.text).replace(/\{([^}]+)\}/g, '<span class="ph">$1</span>') + "</pre></div>";
  }
  if ($("uc-tabs")) {
    $("uc-tabs").innerHTML = ROLES.map(function (r) {
      return '<button type="button" class="chip" role="tab" id="tab-' + r.id + '" data-role="' + r.id + '" aria-controls="uc-panel">' + esc(r.name) + "</button>";
    }).join("");
    $("uc-tabs").addEventListener("click", function (e) {
      var b = e.target.closest("[data-role]");
      if (b) drawRole(b.dataset.role);
    });
    $("uc-tabs").addEventListener("keydown", function (e) {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      var ids = ROLES.map(function (r) { return r.id; });
      var cur = document.querySelector('#uc-tabs [aria-selected="true"]').dataset.role;
      var next = ids[(ids.indexOf(cur) + (e.key === "ArrowRight" ? 1 : ids.length - 1)) % ids.length];
      drawRole(next);
      document.querySelector('#uc-tabs [data-role="' + next + '"]').focus();
    });
    drawRole("sales");
  }

  // ---------------- Local prices ----------------
  if (document.querySelector("[data-price]")) {
    fetch("/api/checkout/quote")
      .then(function (r) { return r.json(); })
      .then(function (q) {
        if (!q || !q.ok) return;
        document.querySelectorAll("[data-price]").forEach(function (el) {
          var t = q.quotes[el.dataset.price];
          if (!t) return;
          var v = t.subtotalMinor / 100;
          try {
            el.textContent = new Intl.NumberFormat(t.currency === "INR" ? "en-IN" : undefined, { style: "currency", currency: t.currency, minimumFractionDigits: Number.isInteger(v) ? 0 : 2 }).format(v);
          } catch (_) {}
        });
        var save = Math.round((1 - q.quotes.yearly.subtotalMinor / (q.quotes.monthly.subtotalMinor * 12)) * 100);
        if ($("save-flag") && save > 0) $("save-flag").textContent = "Save " + save + "%";
      })
      .catch(function () {});
  }
})();
