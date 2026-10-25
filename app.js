(() => {
  'use strict';
  const config = window.SITE_CONFIG || {};
  const menu = document.querySelector('.menu-toggle');
  const nav = document.getElementById('nav');
  menu?.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('open', open);
  });
  nav?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    menu.setAttribute('aria-expanded', 'false'); nav.classList.remove('open');
  }));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && nav?.classList.contains('open')) {
      menu.setAttribute('aria-expanded', 'false'); nav.classList.remove('open'); menu.focus();
    }
  });
  const consentKey = 'yl ar.analytics.preference'.replaceAll(' ', '');
  let consent = null;
  try { consent = localStorage.getItem(consentKey); } catch { /* Storage may be disabled. */ }
  let loaded = false;
  const banner = document.getElementById('cookie-banner');
  const configured = /^G-[A-Z0-9]+$/.test(config.gaMeasurementId || '') || /^GTM-[A-Z0-9]+$/.test(config.gtmContainerId || '');
  window.dataLayer = window.dataLayer || [];
  // Analytics receives only predefined event fields, never input values, queries, or fragments.
  const cleanUrl = location.origin + location.pathname;
  function track(event, fields = {}) {
    if (!configured || consent !== 'accepted') return;
    const allowed = {};
    for (const key of ['placement', 'appliance_type', 'page_path']) {
      if (typeof fields[key] === 'string') allowed[key] = fields[key].slice(0, 100);
    }
    if (config.gtmContainerId) window.dataLayer.push({event, ...allowed});
    else window.gtag?.('event', event, {...allowed, page_location: cleanUrl, page_referrer: ''});
  }
  function loadAnalytics() {
    if (loaded || !configured || consent !== 'accepted') return;
    loaded = true;
    window.gtag = function() { window.dataLayer.push(arguments); };
    window.gtag('consent', 'default', {analytics_storage: 'granted', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied'});
    // Choose ONE container to prevent duplicate Analytics loads.
    if (/^GTM-[A-Z0-9]+$/.test(config.gtmContainerId || '')) {
      window.dataLayer.push({'gtm.start': Date.now(), event: 'gtm.js'});
      const script = document.createElement('script'); script.async = true;
      script.src = 'https://www.googletagmanager.com/gtm.js?id=' + encodeURIComponent(config.gtmContainerId); document.head.appendChild(script);
    } else {
      window.gtag('js', new Date());
      window.gtag('config', config.gaMeasurementId, {send_page_view: false, page_location: cleanUrl, page_referrer: ''});
      const script = document.createElement('script'); script.async = true;
      script.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(config.gaMeasurementId); document.head.appendChild(script);
      track('page_view', {page_path: location.pathname});
    }
  }
  if (configured && !consent) banner.hidden = false;
  loadAnalytics();
  document.querySelector('.cookie-settings')?.addEventListener('click', () => { banner.hidden = false; });
  function setConsent(next) {
    const previous = consent; consent = next;
    try { localStorage.setItem(consentKey, next); } catch { /* In-memory preference still works. */ }
    banner.hidden = true;
    if (next === 'accepted') loadAnalytics();
    // Reload to unload any previously accepted optional tracking scripts.
    else if (previous === 'accepted' && loaded) location.reload();
  }
  document.getElementById('accept-cookies')?.addEventListener('click', () => setConsent('accepted'));
  document.getElementById('decline-cookies')?.addEventListener('click', () => setConsent('declined'));
  document.querySelectorAll('a[href^="tel:"]').forEach(a => a.addEventListener('click', () => track('phone_click', {placement: a.dataset.placement || 'page'})));
  const popup = document.getElementById('service-popup');
  const popupKey = 'ylar.servicePopupShown';
  let shown = false;
  let returnFocus = null;
  let autoTimer = null;
  try { shown = sessionStorage.getItem(popupKey) === '1'; } catch { /* Per-page fallback. */ }
  const requested = new URLSearchParams(location.search).get('service') || location.pathname.split('/').pop().replace(/^services-/, '').replace(/\.html$/, '');
  function selectService(form, service) {
    const appliance = form.elements.namedItem('appliance');
    if (service && [...appliance.options].some(o => o.value === service)) appliance.value = service;
  }
  function openPopup(service, source = 'button') {
    if (!popup || popup.open || typeof popup.showModal !== 'function') return false;
    if (autoTimer) clearTimeout(autoTimer);
    returnFocus = document.activeElement;
    if (service) selectService(document.getElementById('popup-form'), service);
    popup.showModal();
    document.body.classList.add('popup-open');
    shown = true;
    try { sessionStorage.setItem(popupKey, '1'); } catch { /* In-memory fallback. */ }
    track('service_popup_open', {placement: source});
    return true;
  }
  function closePopup() { popup?.close(); }
  popup?.querySelector('.popup-close').addEventListener('click', closePopup);
  popup?.addEventListener('click', e => {
    // Only a click outside the panel closes it; clicks in form spacing stay inside.
    if (e.target === popup) {
      const box = popup.getBoundingClientRect();
      if (e.clientX < box.left || e.clientX > box.right || e.clientY < box.top || e.clientY > box.bottom) closePopup();
    }
  });
  popup?.addEventListener('close', () => {
    document.body.classList.remove('popup-open');
    if (returnFocus && returnFocus.isConnected) returnFocus.focus({preventScroll: true});
  });
  // Native dialog provides focus containment and Escape-to-close behavior.
  document.querySelectorAll('a[href*="#request"]').forEach(a => a.addEventListener('click', e => {
    const target = new URL(a.href, location.href);
    if (target.origin !== location.origin) return;
    if (openPopup(target.searchParams.get('service') || requested)) e.preventDefault();
  }));
  if (popup && !shown && location.pathname.split('/').pop() !== 'privacy.html') {
    autoTimer = setTimeout(() => {
      const editing = document.activeElement?.closest('form');
      if (!document.hidden && !editing && location.hash !== '#request') openPopup(requested, 'automatic');
    }, 2000);
  }
  document.querySelectorAll('[data-inquiry-form]').forEach(form => {
    const appliance = form.elements.namedItem('appliance');
    selectService(form, requested);
    let started = false;
    form.addEventListener('focusin', e => {
      if (!started && e.target.matches('input,select,textarea')) {
        started = true; track('inquiry_form_start', {page_path: location.pathname, placement: form.dataset.placement});
      }
    });
    if (config.formDeliveryVerified) form.querySelector('.delivery-setup')?.remove();
    let submitting = false;
    let submitted = false;
    form.addEventListener('submit', async e => {
      e.preventDefault();
      if (submitting || submitted || !form.reportValidity()) return;
      const values = new FormData(form);
      if (values.get('_honey')) return;
      const result = form.querySelector('.form-result');
      const button = form.querySelector('[type="submit"]');
      const show = message => { result.textContent = message; result.hidden = false; result.focus({preventScroll: true}); };
      const selected = appliance.options[appliance.selectedIndex].text;
      const payload = {
        'Your Name': String(values.get('name') || '').trim(),
        'Your Email': String(values.get('email') || '').trim(),
        'Your Phone': String(values.get('phone') || '').trim(),
        'Choose Service': selected,
        _replyto: String(values.get('email') || '').trim(),
        _subject: 'New submission from Contact Form — Your Local Appliance Repair',
        _template: 'table',
        _honey: '',
        _url: cleanUrl
      };
      for (const [key, label] of [['location', 'City / Postal Code'], ['brand', 'Brand'], ['issue', 'Issue']]) {
        const value = String(values.get(key) || '').trim();
        if (value) payload[label] = value;
      }
      submitting = true;
      button.disabled = true;
      button.textContent = 'Sending…';
      form.setAttribute('aria-busy', 'true');
      show('Sending your request…');
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 20000);
      try {
        const response = await fetch('https://formsubmit.co/ajax/' + encodeURIComponent(config.inquiryEmail), {
          method: 'POST', headers: {'Content-Type': 'application/json', Accept: 'application/json'},
          body: JSON.stringify(payload), signal: controller.signal
        });
        const data = await response.json();
        if (!response.ok || !(data.success === true || data.success === 'true')) throw new Error('Submission was not accepted');
        // Provider acceptance does not prove inbox delivery. Activation is verified separately.
        if (!config.formDeliveryVerified || /activat|confirm.*email/i.test(data.message || '')) {
          show('Setup request submitted. The business owner must check urlocalappliancerepair@gmail.com for the FormSubmit activation email, activate the form, then send a new test. Email delivery is not yet verified. For service, call 437-875-2558.');
          button.textContent = 'Send another test';
        } else {
          submitted = true;
          show('Thank you! Your request has been submitted. We’ll contact you to confirm pricing and availability. Your appointment is not yet booked.');
          button.textContent = 'Request submitted';
          track('generate_lead', {appliance_type: String(values.get('appliance')), page_path: location.pathname, placement: form.dataset.placement});
        }
      } catch {
        show('We couldn’t confirm your submission. Your details are still here. Please call 437-875-2558, or try again. If you already received a response, do not resubmit.');
        button.textContent = 'Try again';
      } finally {
        clearTimeout(timeout);
        submitting = false;
        button.disabled = submitted;
        form.removeAttribute('aria-busy');
      }
    });
  });
})();
