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
      } else if (eventName === 'click_instagram') {
        key = 'instagram_clicks';
      }

      if (key) {
        fetch(`https://api.counterapi.dev/v1/hdi_saojoao_caruaru_2026/${key}/up`)
          .then(res => res.json())
          .then(data => {
            console.log(`📈 CounterAPI updated: ${key} = ${data.count}`);
            window.dispatchEvent(new CustomEvent('hdi_counter_updated', { detail: { key, count: data.count } }));
          })
          .catch(err => console.error('Error updating CounterAPI:', err));
      }

      // Rastreamento geográfico (estado + cidade) apenas no scan inicial
      if (key === 'scans') {
        const CAPI = 'https://api.counterapi.dev/v1/hdi_saojoao_caruaru_2026';

        const KNOWN_CITIES = [
          'caruaru','recife','olinda','jaboatao_dos_guararapes','camaragibe','paulista',
          'petrolina','garanhuns','caetes','bezerros','surubim','santa_cruz_do_capibaribe',
          'toritama','vitoria_de_santo_antao','limoeiro','carpina','bonito',
          'joao_pessoa','campina_grande','patos','bayeux','santa_rita',
          'fortaleza','juazeiro_do_norte','sobral','crato','caucaia','maracanau',
          'maceio','arapiraca','natal','mossoro','parnamirim','caico',
          'aracaju','nossa_senhora_do_socorro',
          'salvador','feira_de_santana','vitoria_da_conquista','ilheus','camacari',
          'teresina','parnaiba','sao_luis','imperatriz',
          'sao_paulo','campinas','guarulhos','sao_bernardo_do_campo','osasco',
          'rio_de_janeiro','niteroi','duque_de_caxias','nova_iguacu','sao_goncalo',
          'belo_horizonte','contagem','betim','uberlandia','juiz_de_fora',
          'brasilia','goiania','aparecida_de_goiania','anapolis',
          'manaus','belem','santarem','porto_velho','rio_branco','boa_vista','macapa',
          'porto_alegre','caxias_do_sul','canoas','curitiba','londrina','maringa',
          'florianopolis','joinville','blumenau','campo_grande','cuiaba','palmas',
          'vitoria','vila_velha','serra'
        ];

        fetch('https://ipapi.co/json/')
          .then(r => r.json())
          .then(geo => {
            if (!geo || geo.error) return;

            // Estado
            const state    = (geo.region_code || '').toLowerCase().replace(/[^a-z]/g, '');
            const isBR     = geo.country_code === 'BR';
            const stateKey = isBR && state ? `geo_${state}` : 'geo_internacional';
            fetch(`${CAPI}/${stateKey}/up`).catch(() => {});

            // Cidade
            const slug = (geo.city || '')
              .toLowerCase()
              .normalize('NFD').replace(/[̀-ͯ]/g, '')
              .replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
            const cityKey = `geo_city_${KNOWN_CITIES.includes(slug) ? slug : 'outros'}`;
            fetch(`${CAPI}/${cityKey}/up`).catch(() => {});

            console.log(`🗺️ ${stateKey} · 🏙️ ${cityKey}`);
          })
          .catch(() => {});
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
