(function () {
  "use strict";

  function closeAllTooltips(except) {
    document.querySelectorAll('.info-btn[aria-expanded="true"]').forEach(function (btn) {
      if (btn === except) return;
      btn.setAttribute("aria-expanded", "false");
      var tip = document.getElementById(btn.getAttribute("aria-controls"));
      if (tip) tip.hidden = true;
    });
  }

  function flipTooltipX(tip) {
    tip.style.transform = "";
    var rect = tip.getBoundingClientRect();
    var vw = document.documentElement.clientWidth;
    var shift = 0;
    if (rect.right > vw - 8) shift = vw - 8 - rect.right;
    if (rect.left + shift < 8) shift = 8 - rect.left;
    if (shift !== 0) {
      var px = Math.round(shift);
      var sign = px < 0 ? "- " + Math.abs(px) : "+ " + px;
      tip.style.transform = "translateX(calc(-50% " + sign + "px))";
    }
  }

  function toggleTooltip(btn) {
    var isOpen = btn.getAttribute("aria-expanded") === "true";
    closeAllTooltips(isOpen ? null : btn);
    btn.setAttribute("aria-expanded", isOpen ? "false" : "true");
    var tip = document.getElementById(btn.getAttribute("aria-controls"));
    if (!tip) return;
    tip.hidden = isOpen;
    if (isOpen) {
      tip.style.transform = "";
      return;
    }
    tip.classList.remove("tooltip--below");
    if (tip.getBoundingClientRect().top < 8) {
      tip.classList.add("tooltip--below");
    }
    flipTooltipX(tip);
  }

  function initTooltips() {
    document.querySelectorAll(".info-btn").forEach(function (btn) {
      btn.addEventListener("click", function (event) {
        event.stopPropagation();
        toggleTooltip(btn);
      });
    });
    document.addEventListener("click", function (event) {
      if (!event.target.closest(".tip-wrap")) closeAllTooltips(null);
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeAllTooltips(null);
    });
  }

  function initFaq() {
    document.querySelectorAll(".faq-item").forEach(function (item) {
      var summary = item.querySelector("summary");
      summary.addEventListener("click", function (event) {
        event.preventDefault();
        var willOpen = !item.open;
        document.querySelectorAll(".faq-item").forEach(function (other) {
          other.open = false;
        });
        item.open = willOpen;
      });
    });
  }

  function pageUrl() {
    var link = document.querySelector('link[rel="canonical"]');
    return (link && link.href) || window.location.href;
  }

  function shareText() {
    var text = document.body.getAttribute("data-share-text");
    return text || document.title;
  }

  function buildShareUrl(platform, url, text) {
    if (platform === "whatsapp") {
      return "https://wa.me/?text=" + encodeURIComponent(text + " " + url);
    }
    if (platform === "x") {
      return "https://twitter.com/intent/tweet?text=" + encodeURIComponent(text) +
        "&url=" + encodeURIComponent(url);
    }
    if (platform === "facebook") {
      return "https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(url);
    }
    return null;
  }
  window.buildShareUrl = buildShareUrl;

  function showFeedback(message) {
    var el = document.getElementById("copy-feedback");
    if (!el) return;
    el.textContent = message;
    el.hidden = false;
    window.clearTimeout(showFeedback._timer);
    showFeedback._timer = window.setTimeout(function () {
      el.hidden = true;
    }, 2500);
  }

  function legacyCopy(text) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try {
      return document.execCommand("copy");
    } catch (err) {
      return false;
    } finally {
      ta.remove();
    }
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).then(function () {
        return true;
      }, function () {
        return legacyCopy(text);
      });
    }
    return Promise.resolve(legacyCopy(text));
  }

  function initShare() {
    var url = pageUrl();
    var text = shareText();
    document.querySelectorAll("[data-platform]").forEach(function (el) {
      var platform = el.getAttribute("data-platform");
      if (platform === "signal") {
        el.addEventListener("click", function () {
          var payload = { title: document.title, text: text, url: url };
          if (navigator.share) {
            navigator.share(payload).catch(function () {});
          } else {
            copyText(text + " " + url).then(function () {
              showFeedback("Lien copié — collez-le dans Signal");
            });
          }
        });
        return;
      }
      var href = buildShareUrl(platform, url, text);
      if (href && el.tagName === "A") el.href = href;
    });
  }

  function initCopy() {
    var btn = document.getElementById("copy-link");
    if (!btn) return;
    btn.addEventListener("click", function () {
      showFeedback("✓ Lien copié");
      copyText(pageUrl()).then(function (ok) {
        if (!ok) showFeedback("Copie impossible : " + pageUrl());
      });
    });
  }

  function initActionCopy() {
    document.querySelectorAll("[data-copy-target]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var template = document.getElementById(btn.getAttribute("data-copy-target"));
        if (!template) return;
        var card = btn.closest(".action-card");
        var feedback = card && card.querySelector(".action-feedback");
        copyText(template.textContent.trim()).then(function (ok) {
          if (!feedback) return;
          feedback.textContent = ok ? "✓ Message copié" : "Copie impossible — sélectionnez le texte";
          feedback.hidden = false;
          window.clearTimeout(feedback._timer);
          feedback._timer = window.setTimeout(function () {
            feedback.hidden = true;
          }, 2500);
        });
      });
    });
  }

  initTooltips();
  initFaq();
  initShare();
  initCopy();
  initActionCopy();
})();
