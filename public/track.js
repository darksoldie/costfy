/**
 * Costfy Universal Tracking Pixel
 * Lightweight, privacy-respecting client-side tracking script for digital businesses.
 * Captures UTM parameters, visitor sessions, and key conversion events.
 */
(function (window, document) {
  "use strict";

  if (window.__costfy_initialized) return;
  window.__costfy_initialized = true;

  // 1. Identificar workspace e endpoint
  var scriptTag =
    document.currentScript ||
    document.querySelector("script[data-workspace-id]") ||
    document.querySelector('script[src*="track.js"]');

  var workspaceId =
    (scriptTag && scriptTag.getAttribute("data-workspace-id")) ||
    window.costfyWorkspaceId ||
    window.CostfyTrackingObject ||
    null;

  var scriptSrc = scriptTag ? scriptTag.src : "";
  var apiOrigin = "";
  try {
    if (scriptSrc) {
      var parsedUrl = new URL(scriptSrc);
      apiOrigin = parsedUrl.origin;
    }
  } catch (e) {
    apiOrigin = "";
  }
  var trackEndpoint = (apiOrigin || "") + "/api/track";

  // 2. Utilitários de ID e armazenamento
  function generateId() {
    return "cst_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 9);
  }

  function getStorage(storageType, key) {
    try {
      return window[storageType].getItem(key);
    } catch (e) {
      return null;
    }
  }

  function setStorage(storageType, key, value) {
    try {
      window[storageType].setItem(key, value);
    } catch (e) {}
  }

  // 3. Gerenciamento de Visitante e Sessão
  var VISITOR_KEY = "costfy_vid";
  var SESSION_KEY = "costfy_sid";
  var FIRST_TOUCH_KEY = "costfy_first_touch";
  var LAST_TOUCH_KEY = "costfy_last_touch";

  var visitorId = getStorage("localStorage", VISITOR_KEY);
  if (!visitorId) {
    visitorId = generateId();
    setStorage("localStorage", VISITOR_KEY, visitorId);
  }

  var sessionToken = getStorage("sessionStorage", SESSION_KEY);
  var isNewSession = false;
  if (!sessionToken) {
    sessionToken = generateId();
    setStorage("sessionStorage", SESSION_KEY, sessionToken);
    isNewSession = true;
  }

  // 4. Captura de parâmetros UTM
  function getQueryParams() {
    var params = {};
    try {
      var search = window.location.search.substring(1);
      if (search) {
        var pairs = search.split("&");
        for (var i = 0; i < pairs.length; i++) {
          var pair = pairs[i].split("=");
          var key = decodeURIComponent(pair[0] || "").toLowerCase();
          var value = decodeURIComponent(pair[1] || "");
          if (key) params[key] = value;
        }
      }
    } catch (e) {}
    return params;
  }

  var currentQuery = getQueryParams();
  var utms = {
    utm_source: currentQuery.utm_source || null,
    utm_medium: currentQuery.utm_medium || null,
    utm_campaign: currentQuery.utm_campaign || null,
    utm_content: currentQuery.utm_content || null,
    utm_term: currentQuery.utm_term || null,
  };

  var hasUtm = Boolean(
    utms.utm_source || utms.utm_medium || utms.utm_campaign || utms.utm_content || utms.utm_term,
  );

  if (hasUtm) {
    setStorage("localStorage", LAST_TOUCH_KEY, JSON.stringify(utms));
    if (!getStorage("localStorage", FIRST_TOUCH_KEY)) {
      setStorage("localStorage", FIRST_TOUCH_KEY, JSON.stringify(utms));
    }
  }

  // 5. Detecção de dispositivo e ambiente
  function detectDevice() {
    var ua = navigator.userAgent || "";
    var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
    var isTablet =
      /(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|WP))))/i.test(
        ua,
      );

    var device = "desktop";
    if (isTablet) device = "tablet";
    else if (isMobile) device = "mobile";

    var os = "Unknown";
    if (/Windows/i.test(ua)) os = "Windows";
    else if (/Macintosh|Mac OS/i.test(ua)) os = "macOS";
    else if (/iPhone|iPad|iPod/i.test(ua)) os = "iOS";
    else if (/Android/i.test(ua)) os = "Android";
    else if (/Linux/i.test(ua)) os = "Linux";

    var browser = "Unknown";
    if (/Chrome/i.test(ua) && !/Edge|OPR/i.test(ua)) browser = "Chrome";
    else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) browser = "Safari";
    else if (/Firefox/i.test(ua)) browser = "Firefox";
    else if (/Edge|Edg/i.test(ua)) browser = "Edge";
    else if (/OPR|Opera/i.test(ua)) browser = "Opera";

    return { device: device, os: os, browser: browser };
  }

  var deviceInfo = detectDevice();

  // 6. Transmissão de eventos
  function sendPayload(payload) {
    if (!workspaceId) {
      if (window.console && console.warn) {
        console.warn("[Costfy] Tracking abortado: nenhum workspaceId configurado.");
      }
      return;
    }

    payload.workspace_id = workspaceId;
    payload.visitor_id = visitorId;
    payload.session_token = sessionToken;
    payload.timestamp = new Date().toISOString();

    var jsonStr = JSON.stringify(payload);

    if (navigator.sendBeacon) {
      try {
        var blob = new Blob([jsonStr], { type: "application/json" });
        navigator.sendBeacon(trackEndpoint, blob);
        return;
      } catch (e) {}
    }

    if (window.fetch) {
      try {
        fetch(trackEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: jsonStr,
          keepalive: true,
        }).catch(function () {});
      } catch (e) {}
    }
  }

  // 7. API pública
  var costfy = {
    init: function (wsId) {
      workspaceId = wsId;
    },

    pageView: function (customProps) {
      sendPayload({
        type: "page_view",
        page_url: window.location.href,
        page_title: document.title || "",
        referrer: document.referrer || "",
        device_type: deviceInfo.device,
        os: deviceInfo.os,
        browser: deviceInfo.browser,
        utm_source: utms.utm_source,
        utm_medium: utms.utm_medium,
        utm_campaign: utms.utm_campaign,
        utm_content: utms.utm_content,
        utm_term: utms.utm_term,
        properties: customProps || {},
      });
    },

    track: function (eventName, properties) {
      sendPayload({
        type: "event",
        event_name: eventName,
        page_url: window.location.href,
        page_title: document.title || "",
        properties: properties || {},
      });
    },

    identify: function (userData) {
      sendPayload({
        type: "identify",
        properties: userData || {},
      });
    },
  };

  window.costfy = costfy;

  // 8. Disparo automático de PageView inicial
  if (document.readyState === "complete" || document.readyState === "interactive") {
    costfy.pageView();
  } else {
    document.addEventListener("DOMContentLoaded", function () {
      costfy.pageView();
    });
  }

  // Suporte a Single Page Applications (SPA)
  var lastUrl = window.location.href;
  function handleUrlChange() {
    if (window.location.href !== lastUrl) {
      lastUrl = window.location.href;
      costfy.pageView();
    }
  }

  window.addEventListener("popstate", handleUrlChange);

  var originalPushState = history.pushState;
  if (originalPushState) {
    history.pushState = function () {
      originalPushState.apply(this, arguments);
      handleUrlChange();
    };
  }
})(window, document);
