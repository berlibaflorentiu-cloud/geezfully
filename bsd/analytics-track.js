/* Lightweight first-party pageview tracker for bestsundan.com.
   No cookies, no third party — just an anonymous localStorage/sessionStorage
   id used to distinguish visits and visitors, written to our own Supabase table.

   Only runs once the visitor has accepted the cookie banner (localStorage
   'bsd-cookie-consent' === 'accepted'). If they haven't decided yet, it waits
   for the 'bsd-consent-accepted' event the banner fires on Accept. If they
   decline, it never runs and never writes anything to storage. */
(function () {
  try {
    // Skip logging for automated/headless browsers so dev/QA checks never pollute
    // real visitor stats. navigator.webdriver catches Selenium/Puppeteer/Playwright;
    // the UA check catches Electron-based automation tools that don't set it.
    if (navigator.webdriver) return;
    if (/Claude\/|Electron\//.test(navigator.userAgent)) return;

    var SUPA_URL = 'https://goxqofdcydxbsrlfobrz.supabase.co';
    var SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdveHFvZmRjeWR4YnNybGZvYnJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM2NzQxNTksImV4cCI6MjA5OTI1MDE1OX0.8aUdU4CL5MQqFfFu9fYOxpotvIgZDdq-I4oMNYK2pxA';

    function randId() {
      return 'x' + Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
    }
    function getId(store, key) {
      try {
        var v = store.getItem(key);
        if (!v) { v = randId(); store.setItem(key, v); }
        return v;
      } catch (e) { return randId(); }
    }

    function track() {
      // ids are only created at the moment we actually track, so nothing is
      // written to storage before consent is given
      var visitorId = getId(window.localStorage, 'bsd_visitor_id');
      var sessionId = getId(window.sessionStorage, 'bsd_session_id');

      function send() {
        fetch(SUPA_URL + '/rest/v1/bsd_pageviews', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPA_KEY,
            'Authorization': 'Bearer ' + SUPA_KEY
          },
          body: JSON.stringify({
            path: window.location.pathname,
            referrer: document.referrer ? document.referrer.slice(0, 300) : null,
            visitor_id: visitorId,
            session_id: sessionId,
            user_agent: navigator.userAgent
          }),
          keepalive: true
        }).catch(function () {});
      }

      if (document.readyState === 'complete') send();
      else window.addEventListener('load', send);
    }

    var consent = localStorage.getItem('bsd-cookie-consent');
    if (consent === 'accepted') {
      track();
    } else if (consent !== 'declined') {
      // no decision yet — track the moment they accept, if they do this visit
      window.addEventListener('bsd-consent-accepted', track, { once: true });
    }
    // consent === 'declined' → do nothing, ever, for this pageview
  } catch (e) { /* tracking must never break the page */ }
})();
