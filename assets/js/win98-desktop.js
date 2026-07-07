(function () {
  "use strict";

  var ICON_GLYPHS = {
    notepad: "📝",
    doc: "📄",
    folder: "📁",
    computer: "🖥️",
    recyclebin: "🗑️",
    mail: "✉️",
    github: "🐙",
    scholar: "🎓"
  };

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

  function glyphFor(iconKey) {
    return ICON_GLYPHS[iconKey] || "🗔️";
  }

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
    btn.innerHTML = '<span>' + glyphFor(app.icon) + '</span><span>' + app.label + '</span>';
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

  function buildWindowBody(app) {
    var body = document.createElement("div");
    body.className = "win98-window-body";
    if (app.type === "iframe") {
      var iframe = document.createElement("iframe");
      var sep = app.url.indexOf("?") === -1 ? "?" : "&";
      iframe.src = app.url + sep + "embed=1";
      iframe.title = app.label;
      body.appendChild(iframe);
    } else if (app.type === "html") {
      body.classList.add("win98-html-body");
      var tmpl = document.getElementById("win98-tmpl-" + app.template);
      if (tmpl) {
        body.appendChild(tmpl.content.cloneNode(true));
      }
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
      '<span class="win98-titlebar-icon">' + glyphFor(app.icon) + '</span>' +
      '<span class="win98-titlebar-text">' + app.label + '</span>' +
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
