// ================================================================
// HDI Seguros - Web Analytics Tracking Script
// ================================================================
// Handles dynamic loading of GA4 gtag.js based on configurations
// and tracks user events (hotspots, clicks, telephone calls)
// ================================================================

(function () {
  // Load config dynamic check
  const config = typeof ANALYTICS_CONFIG !== 'undefined' ? ANALYTICS_CONFIG : {
    GA4_MEASUREMENT_ID: 'G-XXXXXXXXXX',
    SITE_URL: window.location.origin + window.location.pathname
  };

  const isGA4Configured = config.GA4_MEASUREMENT_ID && config.GA4_MEASUREMENT_ID !== 'G-XXXXXXXXXX';

  // 1. Initialize GA4 if Measurement ID is provided
  if (isGA4Configured) {
    const gaScript = document.createElement('script');
    gaScript.async = true;
    gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${config.GA4_MEASUREMENT_ID}`;
    document.head.appendChild(gaScript);

    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag('js', new Date());

    // Config with custom tracking settings if needed
    gtag('config', config.GA4_MEASUREMENT_ID, {
      send_page_view: true,
      page_location: window.location.href,
      page_path: window.location.pathname,
      page_title: document.title
    });
    
    console.log('📊 GA4 Analytics initialized with ID:', config.GA4_MEASUREMENT_ID);
  } else {
    console.warn('⚠️ GA4 Measurement ID not configured in analytics-config.js. Events will only be tracked locally.');
  }

  // 2. Local Tracking (for developer validation & local dashboard debugging)
  // This simulates data inside localStorage so the user can immediately test locally!
  function trackEventLocal(eventName, eventParams = {}) {
    try {
      const sessionEvents = JSON.parse(localStorage.getItem('hdi_event_log') || '[]');
      const newEvent = {
        timestamp: new Date().toISOString(),
        event: eventName,
        params: eventParams,
        // Approximate city based on local settings/timezone or hardcoded simulation
        city: eventParams.city || 'Local Test',
        region: eventParams.region || 'Local'
      };
      sessionEvents.push(newEvent);
      // Keep last 100 events
      if (sessionEvents.length > 100) sessionEvents.shift();
      localStorage.setItem('hdi_event_log', JSON.stringify(sessionEvents));
      
      // Also update overall local counter statistics
      const stats = JSON.parse(localStorage.getItem('hdi_local_stats') || '{"scans":0,"stand_opens":0,"cat_opens":0,"maps_clicks":0,"phone_clicks":0,"phone_breakdown":{}}');
      
      if (eventName === 'page_view' || eventName === 'qr_scan') {
        stats.scans = (stats.scans || 0) + 1;
      } else if (eventName === 'open_hotspot' && eventParams.hotspot === 'stand') {
        stats.stand_opens = (stats.stand_opens || 0) + 1;
      } else if (eventName === 'open_hotspot' && eventParams.hotspot === 'cat') {
        stats.cat_opens = (stats.cat_opens || 0) + 1;
      } else if (eventName === 'click_direction') {
        stats.maps_clicks = (stats.maps_clicks || 0) + 1;
      } else if (eventName === 'click_phone') {
        stats.phone_clicks = (stats.phone_clicks || 0) + 1;
        const phone = eventParams.phone_name || 'outros';
        stats.phone_breakdown[phone] = (stats.phone_breakdown[phone] || 0) + 1;
      }
      
      localStorage.setItem('hdi_local_stats', JSON.stringify(stats));
      console.log('🔌 Local Event Tracked:', eventName, eventParams);
    } catch (e) {
      console.error('Error saving local tracking data:', e);
    }
  }

  // 3. Expose global tracking function
  window.HDI_TrackEvent = function (eventName, eventParams = {}) {
    // Inject current page context
    eventParams.page_location = window.location.href;
    eventParams.page_title = document.title;
    
    // Log locally
    trackEventLocal(eventName, eventParams);

    // Push to Google Analytics if active
    if (window.gtag && isGA4Configured) {
      window.gtag('event', eventName, eventParams);
    }

    // Push to CounterAPI for real-time collective dashboard analytics (zero configuration database)
    try {
      let key = '';
      if (eventName === 'qr_scan' || eventName === 'page_view') {
        key = 'scans';
      } else if (eventName === 'open_hotspot') {
        if (eventParams.hotspot === 'stand') key = 'stand_opens';
        else if (eventParams.hotspot === 'cat') key = 'cat_opens';
      } else if (eventName === 'click_direction') {
        key = 'maps_clicks';
      } else if (eventName === 'click_phone') {
        const num = eventParams.phone_number;
        if (num === '192') key = 'phone_samu';
        else if (num === '199') key = 'phone_defesa';
        else if (num === '193') key = 'phone_bombeiros';
        else if (num === '197') key = 'phone_civil';
        else if (num === '190') key = 'phone_militar';
      }

      if (key) {
        fetch(`https://api.counterapi.dev/v1/hdi_saojoao_caruaru_2026/${key}/up`)
          .then(res => res.json())
          .then(data => {
            console.log(`📈 CounterAPI updated: ${key} = ${data.count}`);
            // Fire custom event to notify current page if dashboard is open in same window
            window.dispatchEvent(new CustomEvent('hdi_counter_updated', { detail: { key, count: data.count } }));
          })
          .catch(err => console.error('Error updating CounterAPI:', err));
      }
    } catch (err) {
      console.error('CounterAPI reporting failed:', err);
    }
  };

  // Track initial QR Scan / Page View
  // We can check if referred from a specific campaign or qr parameter, e.g., index.html?src=qrcode
  const urlParams = new URLSearchParams(window.location.search);
  const source = urlParams.get('src') || urlParams.get('utm_source') || 'direct';
  window.HDI_TrackEvent('qr_scan', {
    source: source,
    medium: urlParams.get('utm_medium') || 'web',
    campaign: urlParams.get('utm_campaign') || 'sao_joao_caruaru'
  });
})();
