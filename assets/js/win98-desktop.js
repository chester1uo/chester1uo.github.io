(function () {
  "use strict";

  var ICON_SVG_BODIES = {
    notepad:
      '<rect x="7" y="3" width="18" height="26" fill="#fffef2" stroke="#000000"/>' +
      '<rect x="7" y="3" width="18" height="5" fill="#0a3d91"/>' +
      '<rect x="9" y="12" width="14" height="2" fill="#8fa9c9"/>' +
      '<rect x="9" y="16" width="14" height="2" fill="#8fa9c9"/>' +
      '<rect x="9" y="20" width="10" height="2" fill="#8fa9c9"/>' +
      '<polygon points="5,27 21,11 25,15 9,29" fill="#ffd24c" stroke="#000000"/>' +
      '<polygon points="21,11 25,15 27,13 23,9" fill="#e8e8e8" stroke="#000000"/>' +
      '<polygon points="5,27 9,29 6,30" fill="#7a5230" stroke="#000000"/>',
    doc:
      '<polygon points="8,3 20,3 25,8 25,29 8,29" fill="#ffffff" stroke="#000000"/>' +
      '<polygon points="20,3 20,8 25,8" fill="#c0c0c0" stroke="#000000"/>' +
      '<rect x="11" y="13" width="11" height="2" fill="#000080"/>' +
      '<rect x="11" y="17" width="11" height="2" fill="#000080"/>' +
      '<rect x="11" y="21" width="8" height="2" fill="#000080"/>',
    folder:
      '<rect x="3" y="9" width="12" height="4" fill="#e8a700" stroke="#000000"/>' +
      '<rect x="3" y="11" width="26" height="17" fill="#ffcc33" stroke="#000000"/>' +
      '<rect x="3" y="15" width="26" height="13" fill="#ffdb70" stroke="#000000"/>',
    computer:
      '<rect x="4" y="4" width="24" height="17" fill="#d8d4c8" stroke="#000000"/>' +
      '<rect x="7" y="7" width="18" height="11" fill="#003a5c" stroke="#000000"/>' +
      '<rect x="7" y="7" width="18" height="4" fill="#1a7aa8"/>' +
      '<rect x="12" y="21" width="8" height="3" fill="#b7b3a6" stroke="#000000"/>' +
      '<rect x="7" y="24" width="18" height="3" fill="#d8d4c8" stroke="#000000"/>',
    recyclebin:
      '<rect x="12" y="4" width="8" height="3" fill="#9a9a9a" stroke="#000000"/>' +
      '<rect x="7" y="7" width="18" height="3" fill="#c0c0c0" stroke="#000000"/>' +
      '<polygon points="9,10 23,10 21,29 11,29" fill="#c0c0c0" stroke="#000000"/>' +
      '<line x1="12" y1="13" x2="13" y2="26" stroke="#000000"/>' +
      '<line x1="16" y1="13" x2="16" y2="26" stroke="#000000"/>' +
      '<line x1="20" y1="13" x2="19" y2="26" stroke="#000000"/>',
    mail:
      '<rect x="3" y="7" width="26" height="18" fill="#ffffff" stroke="#000000"/>' +
      '<polygon points="3,25 12,15 3,9" fill="#dcdcdc" stroke="#000000"/>' +
      '<polygon points="29,25 20,15 29,9" fill="#dcdcdc" stroke="#000000"/>' +
      '<polyline points="3,7 16,18 29,7" fill="none" stroke="#000000"/>',
    github:
      '<rect x="3" y="3" width="26" height="26" fill="#161616" stroke="#000000"/>' +
      '<text x="16" y="22" font-family="&quot;Courier New&quot;, monospace" font-size="15" font-weight="bold" fill="#ffffff" text-anchor="middle">GH</text>',
    scholar:
      '<polygon points="16,6 30,13 16,20 2,13" fill="#1a1a1a" stroke="#000000"/>' +
      '<polygon points="16,20 24,16.4 24,22 16,26 8,22 8,16.4" fill="#3a3a3a" stroke="#000000"/>' +
      '<rect x="15" y="13" width="2" height="9" fill="#1a1a1a"/>' +
      '<circle cx="16" cy="23.5" r="2" fill="#8a1c1c" stroke="#000000"/>'
  };

  function iconSvg(iconKey) {
    var body = ICON_SVG_BODIES[iconKey] || '<rect x="4" y="4" width="24" height="24" fill="#c0c0c0" stroke="#000000"/>';
    return '<svg class="win98-icon-svg" width="32" height="32" viewBox="0 0 32 32" ' +
      'xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges" aria-hidden="true" focusable="false">' +
      body + '</svg>';
  }

  var apps = (window.WIN98_APPS || []).reduce(function (map, app) {
    map[app.id] = app;
    return map;
  }, {});

  var desktopEl = document.querySelector(".win98-desktop");
  var windowsLayer = document.getElementById("win98-windows-layer");
  var taskbarItems = document.getElementById("win98-taskbar-items");
  var startMenu = document.getElementById("win98-start-menu");
  var startBtn = document.getElementById("win98-start-btn");
  var clockEl = document.getElementById("win98-clock");
  var shutdownScreen = document.getElementById("win98-shutdown-screen");

  var openWindows = {};
  var zCounter = 100;
  var cascadeOffset = 0;
  var isSmallScreen = window.innerWidth <= 720;

  function updateClock() {
    if (!clockEl) return;
    var now = new Date();
    var h = now.getHours();
    var m = now.getMinutes();
    var ampm = h >= 12 ? "PM" : "AM";
    h = h % 12;
    if (h === 0) h = 12;
    var mm = m < 10 ? "0" + m : "" + m;
    clockEl.textContent = h + ":" + mm + " " + ampm;
  }

  function setActiveWindow(id) {
    Object.keys(openWindows).forEach(function (key) {
      var w = openWindows[key];
      w.el.classList.toggle("active", key === id);
      if (w.taskbarBtn) w.taskbarBtn.classList.toggle("active", key === id && !w.minimized);
    });
  }

  function focusWindow(id) {
    var w = openWindows[id];
    if (!w) return;
    zCounter += 1;
    w.el.style.zIndex = zCounter;
    setActiveWindow(id);
  }

  function makeTaskbarButton(id, app) {
    var btn = document.createElement("button");
    btn.className = "win98-taskbar-btn win98-raised";
    btn.innerHTML = '<span>' + iconSvg(app.icon) + '</span><span>' + (app.window_title || app.label) + '</span>';
    btn.addEventListener("click", function () {
      var w = openWindows[id];
      if (!w) return;
      if (w.minimized) {
        restoreWindow(id);
      } else if (w.el.classList.contains("active")) {
        minimizeWindow(id);
      } else {
        focusWindow(id);
      }
    });
    taskbarItems.appendChild(btn);
    return btn;
  }

  function minimizeWindow(id) {
    var w = openWindows[id];
    if (!w) return;
    w.minimized = true;
    w.el.classList.add("minimized");
    if (w.taskbarBtn) w.taskbarBtn.classList.remove("active");
  }

  function restoreWindow(id) {
    var w = openWindows[id];
    if (!w) return;
    w.minimized = false;
    w.el.classList.remove("minimized");
    focusWindow(id);
  }

  function toggleMaximize(id) {
    var w = openWindows[id];
    if (!w) return;
    if (w.maximized) {
      w.maximized = false;
      w.el.classList.remove("maximized");
      w.el.style.left = w.prevRect.left;
      w.el.style.top = w.prevRect.top;
      w.el.style.width = w.prevRect.width;
      w.el.style.height = w.prevRect.height;
    } else {
      w.prevRect = {
        left: w.el.style.left,
        top: w.el.style.top,
        width: w.el.style.width,
        height: w.el.style.height
      };
      w.maximized = true;
      w.el.classList.add("maximized");
    }
    focusWindow(id);
  }

  function closeWindow(id) {
    var w = openWindows[id];
    if (!w) return;
    w.el.remove();
    if (w.taskbarBtn) w.taskbarBtn.remove();
    delete openWindows[id];
  }

  function clampToDesktop(x, y, width, height) {
    var bounds = desktopEl.getBoundingClientRect();
    var maxX = Math.max(0, bounds.width - Math.min(width, bounds.width));
    var maxY = Math.max(0, bounds.height - Math.min(height, bounds.height));
    return {
      x: Math.min(Math.max(0, x), maxX),
      y: Math.min(Math.max(0, y), maxY)
    };
  }

  function makeDraggable(win, handle) {
    var dragging = false;
    var startX, startY, originLeft, originTop;

    handle.addEventListener("pointerdown", function (e) {
      if (e.target.closest(".win98-title-btn")) return;
      if (win.classList.contains("maximized")) return;
      dragging = true;
      startX = e.clientX;
      startY = e.clientY;
      originLeft = win.offsetLeft;
      originTop = win.offsetTop;
      handle.setPointerCapture(e.pointerId);
    });

    handle.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      var dx = e.clientX - startX;
      var dy = e.clientY - startY;
      var pos = clampToDesktop(originLeft + dx, originTop + dy, win.offsetWidth, win.offsetHeight);
      win.style.left = pos.x + "px";
      win.style.top = pos.y + "px";
    });

    ["pointerup", "pointercancel"].forEach(function (evt) {
      handle.addEventListener(evt, function () {
        dragging = false;
      });
    });

    handle.addEventListener("dblclick", function (e) {
      if (e.target.closest(".win98-title-btn")) return;
      var id = win.getAttribute("data-id");
      toggleMaximize(id);
    });
  }

  function makeResizable(win, handle) {
    var resizing = false;
    var startX, startY, startWidth, startHeight;

    handle.addEventListener("pointerdown", function (e) {
      resizing = true;
      startX = e.clientX;
      startY = e.clientY;
      startWidth = win.offsetWidth;
      startHeight = win.offsetHeight;
      handle.setPointerCapture(e.pointerId);
      e.stopPropagation();
    });

    handle.addEventListener("pointermove", function (e) {
      if (!resizing) return;
      var newWidth = Math.max(260, startWidth + (e.clientX - startX));
      var newHeight = Math.max(160, startHeight + (e.clientY - startY));
      win.style.width = newWidth + "px";
      win.style.height = newHeight + "px";
    });

    ["pointerup", "pointercancel"].forEach(function (evt) {
      handle.addEventListener(evt, function () {
        resizing = false;
      });
    });
  }

  var IE_TOOLBAR_ICONS =
    '<button class="win98-toolbar-btn" title="Back" disabled>' +
      '<svg viewBox="0 0 20 20"><polygon points="12,4 6,10 12,16" fill="#008000"/><path d="M12 10h4a2 2 0 0 1 2 2v1" fill="none" stroke="#008000" stroke-width="1.4"/></svg>' +
    '</button>' +
    '<button class="win98-toolbar-btn" title="Forward" disabled>' +
      '<svg viewBox="0 0 20 20"><polygon points="8,4 14,10 8,16" fill="#808080"/><path d="M8 10H4a2 2 0 0 0-2 2v1" fill="none" stroke="#808080" stroke-width="1.4"/></svg>' +
    '</button>' +
    '<span class="win98-toolbar-sep"></span>' +
    '<button class="win98-toolbar-btn" title="Stop" disabled>' +
      '<svg viewBox="0 0 20 20"><polygon points="6,2 14,2 18,6 18,14 14,18 6,18 2,14 2,6" fill="#c00000"/><line x1="6" y1="6" x2="14" y2="14" stroke="#fff" stroke-width="1.6"/><line x1="14" y1="6" x2="6" y2="14" stroke="#fff" stroke-width="1.6"/></svg>' +
    '</button>' +
    '<button class="win98-toolbar-btn" title="Refresh" disabled>' +
      '<svg viewBox="0 0 20 20"><path d="M4 10a6 6 0 0 1 10.5-4" fill="none" stroke="#000080" stroke-width="1.6"/><polygon points="14.5,2 15.5,7 10.5,6" fill="#000080"/><path d="M16 10a6 6 0 0 1-10.5 4" fill="none" stroke="#000080" stroke-width="1.6"/><polygon points="5.5,18 4.5,13 9.5,14" fill="#000080"/></svg>' +
    '</button>' +
    '<button class="win98-toolbar-btn" title="Home" disabled>' +
      '<svg viewBox="0 0 20 20"><polygon points="10,3 17,9 15,9 15,17 5,17 5,9 3,9" fill="#000080"/><rect x="8.5" y="12" width="3" height="5" fill="#fff"/></svg>' +
    '</button>';

  function buildWebviewChrome(app) {
    var wrap = document.createElement("div");
    wrap.className = "win98-webview";

    var menubar = document.createElement("div");
    menubar.className = "win98-menubar";
    menubar.innerHTML = "<span>File</span><span>Edit</span><span>View</span><span>Favorites</span><span>Tools</span><span>Help</span>";
    wrap.appendChild(menubar);

    var toolbar = document.createElement("div");
    toolbar.className = "win98-toolbar";
    toolbar.innerHTML = IE_TOOLBAR_ICONS;
    wrap.appendChild(toolbar);

    var addressBar = document.createElement("div");
    addressBar.className = "win98-webview-addressbar";
    addressBar.innerHTML =
      "<span>Address</span>" +
      '<input class="win98-webview-address-input win98-sunken" type="text" readonly>' +
      '<button class="win98-webview-go win98-raised">Go</button>';
    var addressInput = addressBar.querySelector(".win98-webview-address-input");
    addressInput.value = app.url;
    addressBar.querySelector(".win98-webview-go").addEventListener("click", function () {
      window.open(app.url, "_blank", "noopener");
    });
    wrap.appendChild(addressBar);

    var content = document.createElement("div");
    content.className = "win98-webview-content";
    content.innerHTML =
      '<div class="win98-webview-panel">' +
        '<div class="win98-webview-icon">' +
          '<svg width="40" height="40" viewBox="0 0 32 32"><polygon points="16,3 30,27 2,27" fill="#ffdd33" stroke="#000" stroke-width="1"/><rect x="14.5" y="11" width="3" height="9" fill="#000"/><rect x="14.5" y="22" width="3" height="3" fill="#000"/></svg>' +
        '</div>' +
        "<h2>This page cannot be displayed here</h2>" +
        "<p>This site does not allow itself to be shown inside another window. Copy the link below, or open it in a real browser tab.</p>" +
        '<span class="win98-webview-url"></span>' +
        '<div class="win98-webview-actions">' +
          '<button class="win98-btn win98-raised" data-action="copy">Copy Link</button>' +
          '<button class="win98-btn win98-raised" data-action="open">Open in New Tab</button>' +
        "</div>" +
      "</div>";
    content.querySelector(".win98-webview-url").textContent = app.url;
    var copyBtn = content.querySelector('[data-action="copy"]');
    copyBtn.addEventListener("click", function () {
      var restore = function () {
        copyBtn.textContent = "Copy Link";
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(app.url).then(function () {
          copyBtn.textContent = "Copied!";
          setTimeout(restore, 1500);
        }).catch(function () {
          addressInput.select();
        });
      } else {
        addressInput.select();
      }
    });
    content.querySelector('[data-action="open"]').addEventListener("click", function () {
      window.open(app.url, "_blank", "noopener");
    });
    wrap.appendChild(content);

    var statusbar = document.createElement("div");
    statusbar.className = "win98-statusbar";
    statusbar.innerHTML = "<span>Done</span>";
    wrap.appendChild(statusbar);

    return wrap;
  }

  function buildWindowBody(app) {
    var body = document.createElement("div");
    body.className = "win98-window-body";
    if (app.type === "iframe") {
      var iframe = document.createElement("iframe");
      var sep = app.url.indexOf("?") === -1 ? "?" : "&";
      iframe.src = app.url + sep + "embed=1";
      iframe.title = app.window_title || app.label;
      body.appendChild(iframe);
    } else if (app.type === "html") {
      body.classList.add("win98-html-body");
      var tmpl = document.getElementById("win98-tmpl-" + app.template);
      if (tmpl) {
        body.appendChild(tmpl.content.cloneNode(true));
      }
    } else if (app.type === "webview") {
      body.classList.add("win98-webview-wrapper");
      body.appendChild(buildWebviewChrome(app));
    }
    return body;
  }

  function openApp(id) {
    var app = apps[id];
    if (!app) return;

    if (app.type === "link") {
      window.open(app.url, "_blank", "noopener");
      return;
    }

    if (openWindows[id]) {
      restoreWindow(id);
      return;
    }

    var width = isSmallScreen ? desktopEl.clientWidth : (app.width || 640);
    var height = isSmallScreen ? desktopEl.clientHeight : (app.height || 480);
    var startX = isSmallScreen ? 0 : 40 + cascadeOffset;
    var startY = isSmallScreen ? 0 : 30 + cascadeOffset;
    cascadeOffset = (cascadeOffset + 24) % 160;

    var win = document.createElement("div");
    win.className = "win98-window";
    win.setAttribute("data-id", id);
    win.style.left = startX + "px";
    win.style.top = startY + "px";
    win.style.width = width + "px";
    win.style.height = height + "px";

    var titlebar = document.createElement("div");
    titlebar.className = "win98-titlebar";
    titlebar.innerHTML =
      '<span class="win98-titlebar-icon">' + iconSvg(app.icon) + '</span>' +
      '<span class="win98-titlebar-text">' + (app.window_title || app.label) + '</span>' +
      '<div class="win98-titlebar-buttons">' +
        '<button class="win98-title-btn win98-raised" data-action="minimize" title="Minimize">_</button>' +
        '<button class="win98-title-btn win98-raised" data-action="maximize" title="Maximize">□</button>' +
        '<button class="win98-title-btn win98-raised" data-action="close" title="Close">✕</button>' +
      '</div>';
    win.appendChild(titlebar);

    var body = buildWindowBody(app);
    win.appendChild(body);

    var resizeHandle = document.createElement("div");
    resizeHandle.className = "win98-resize-handle";
    win.appendChild(resizeHandle);

    windowsLayer.appendChild(win);

    titlebar.querySelector('[data-action="minimize"]').addEventListener("click", function () {
      minimizeWindow(id);
    });
    titlebar.querySelector('[data-action="maximize"]').addEventListener("click", function () {
      toggleMaximize(id);
    });
    titlebar.querySelector('[data-action="close"]').addEventListener("click", function () {
      closeWindow(id);
    });

    win.addEventListener("pointerdown", function () {
      focusWindow(id);
    });

    makeDraggable(win, titlebar);
    makeResizable(win, resizeHandle);

    openWindows[id] = {
      el: win,
      minimized: false,
      maximized: false,
      taskbarBtn: makeTaskbarButton(id, app)
    };

    if (isSmallScreen) {
      toggleMaximize(id);
    }

    focusWindow(id);
  }

  function closeStartMenu() {
    startMenu.classList.remove("open");
    startBtn.classList.remove("pressed");
  }

  function toggleStartMenu() {
    var willOpen = !startMenu.classList.contains("open");
    startMenu.classList.toggle("open", willOpen);
    startBtn.classList.toggle("pressed", willOpen);
  }

  startBtn.addEventListener("click", function (e) {
    e.stopPropagation();
    toggleStartMenu();
  });

  document.addEventListener("click", function (e) {
    if (!startMenu.contains(e.target) && e.target !== startBtn) {
      closeStartMenu();
    }
  });

  document.querySelectorAll("[data-open-app]").forEach(function (el) {
    el.addEventListener("click", function () {
      openApp(el.getAttribute("data-open-app"));
      closeStartMenu();
    });
    el.addEventListener("dblclick", function () {
      openApp(el.getAttribute("data-open-app"));
    });
  });

  document.querySelectorAll(".win98-icon").forEach(function (icon) {
    icon.addEventListener("click", function () {
      document.querySelectorAll(".win98-icon").forEach(function (i) {
        i.classList.remove("selected");
      });
      icon.classList.add("selected");
    });
  });

  var shutdownTrigger = document.getElementById("win98-shutdown-trigger");
  if (shutdownTrigger) {
    shutdownTrigger.addEventListener("click", function () {
      closeStartMenu();
      shutdownScreen.classList.add("open");
    });
  }
  if (shutdownScreen) {
    shutdownScreen.addEventListener("click", function () {
      window.location.reload();
    });
  }

  updateClock();
  setInterval(updateClock, 15000);

  var autostart = (window.WIN98_APPS || []).filter(function (app) {
    return app.autostart;
  });
  autostart.forEach(function (app) {
    openApp(app.id);
  });
})();
