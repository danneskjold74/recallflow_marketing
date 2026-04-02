/**
 * RevisitIQ — Script
 * CTA click tracking and UTM capture
 */

(function () {
  'use strict';

  // --- Analytics helper ---
  function trackEvent(eventName, params) {
    if (typeof gtag === 'function') {
      gtag('event', eventName, params);
    }
  }

  // --- CTA click tracking ---
  document.addEventListener('click', function (e) {
    var link = e.target.closest('a, button');
    if (!link) return;

    var cta = link.getAttribute('data-cta');
    var location = link.getAttribute('data-location');

    if (cta === 'cta_click') {
      trackEvent('cta_click', {
        location: location || 'unknown',
        cta_text: link.textContent.trim()
      });
    }

    if (cta === 'login') {
      trackEvent('click_login', {
        location: location || 'unknown'
      });
    }

    // Track email/contact clicks
    var href = link.getAttribute('href') || '';
    if (href.indexOf('mailto:') === 0) {
      trackEvent('contact_click', {
        cta_text: link.textContent.trim()
      });
    }
  });

  // --- Nav dropdown toggle ---
  document.querySelectorAll('.nav-dropdown-toggle').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var dropdown = btn.closest('.nav-dropdown');
      var isOpen = dropdown.classList.contains('is-open');

      // Close all dropdowns first
      document.querySelectorAll('.nav-dropdown.is-open').forEach(function (d) {
        d.classList.remove('is-open');
        d.querySelector('.nav-dropdown-toggle').setAttribute('aria-expanded', 'false');
      });

      if (!isOpen) {
        dropdown.classList.add('is-open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // Close dropdown on outside click
  document.addEventListener('click', function () {
    document.querySelectorAll('.nav-dropdown.is-open').forEach(function (d) {
      d.classList.remove('is-open');
      d.querySelector('.nav-dropdown-toggle').setAttribute('aria-expanded', 'false');
    });
  });

  // --- UTM passthrough to app links ---
  function getUtmParams() {
    try {
      var params = new URLSearchParams(window.location.search);
      var utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
      var utmParams = new URLSearchParams();
      utmKeys.forEach(function (key) {
        var val = params.get(key);
        if (val) utmParams.set(key, val);
      });
      return utmParams.toString();
    } catch (e) {
      return '';
    }
  }

  // Append UTM params to all app.revisitiq.com links
  var utmString = getUtmParams();
  if (utmString) {
    document.querySelectorAll('a[href*="app.revisitiq.com"]').forEach(function (link) {
      var href = link.getAttribute('href');
      var separator = href.indexOf('?') === -1 ? '?' : '&';
      link.setAttribute('href', href + separator + utmString);
    });
  }

  // --- Screenshot lightbox ---
  var lightbox = document.getElementById('lightbox');
  var lightboxImg = document.getElementById('lightbox-img');

  if (lightbox && lightboxImg) {
    function openLightbox(src, alt) {
      lightboxImg.src = src;
      lightboxImg.alt = alt;
      lightbox.classList.add('is-open');
      lightbox.setAttribute('aria-hidden', 'false');
      lightbox.querySelector('.lightbox-close').focus();
    }

    function closeLightbox() {
      lightbox.classList.remove('is-open');
      lightbox.setAttribute('aria-hidden', 'true');
      lightboxImg.src = '';
    }

    document.querySelectorAll('.step-screenshot').forEach(function (img) {
      img.addEventListener('click', function () {
        openLightbox(img.src, img.alt);
      });
      img.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openLightbox(img.src, img.alt);
        }
      });
    });

    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox || e.target.classList.contains('lightbox-close')) {
        closeLightbox();
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && lightbox.classList.contains('is-open')) {
        closeLightbox();
      }
    });
  }
})();
