---
layout: window
title: "CV"
permalink: /cv/
win98_icon: doc
win98_titlebar: "Acrobat Reader - [cv_aca.pdf]"
win98_fullbleed: true
redirect_from:
  - /resume
---

<div class="win98-acrobat">
  <div class="win98-menubar">
    <span>File</span><span>Edit</span><span>View</span><span>Tools</span><span>Window</span><span>Help</span>
  </div>

  <div class="win98-toolbar">
    <button class="win98-toolbar-btn" title="Hand tool" disabled>
      <svg viewBox="0 0 20 20"><path d="M6 18v-6l-2-4a1.2 1.2 0 0 1 2-1l1 2v-6a1 1 0 0 1 2 0v5h1V5a1 1 0 0 1 2 0v6h1V6a1 1 0 0 1 2 0v8a4 4 0 0 1-4 4H8a2 2 0 0 1-2-2z" fill="#c0c0c0" stroke="#000" stroke-width="0.7"/></svg>
    </button>
    <button class="win98-toolbar-btn" id="win98-pdf-zoom-out" title="Zoom Out">
      <svg viewBox="0 0 20 20"><circle cx="8" cy="8" r="5.5" fill="#fff" stroke="#000" stroke-width="1.2"/><line x1="12.3" y1="12.3" x2="17.5" y2="17.5" stroke="#000" stroke-width="1.6"/><line x1="5" y1="8" x2="11" y2="8" stroke="#000" stroke-width="1"/></svg>
    </button>
    <button class="win98-toolbar-btn" id="win98-pdf-zoom-in" title="Zoom In">
      <svg viewBox="0 0 20 20"><circle cx="8" cy="8" r="5.5" fill="#fff" stroke="#000" stroke-width="1.2"/><line x1="12.3" y1="12.3" x2="17.5" y2="17.5" stroke="#000" stroke-width="1.6"/><line x1="8" y1="5" x2="8" y2="11" stroke="#000" stroke-width="1"/><line x1="5" y1="8" x2="11" y2="8" stroke="#000" stroke-width="1"/></svg>
    </button>
    <span class="win98-toolbar-sep"></span>
    <button class="win98-toolbar-btn" id="win98-pdf-first" title="First page">
      <svg viewBox="0 0 20 20"><rect x="4" y="4" width="2" height="12" fill="#000"/><polygon points="16,4 8,10 16,16" fill="#000"/></svg>
    </button>
    <button class="win98-toolbar-btn" id="win98-pdf-prev" title="Previous page">
      <svg viewBox="0 0 20 20"><polygon points="14,4 6,10 14,16" fill="#000"/></svg>
    </button>
    <button class="win98-toolbar-btn" id="win98-pdf-next" title="Next page">
      <svg viewBox="0 0 20 20"><polygon points="6,4 14,10 6,16" fill="#000"/></svg>
    </button>
    <button class="win98-toolbar-btn" id="win98-pdf-last" title="Last page">
      <svg viewBox="0 0 20 20"><rect x="14" y="4" width="2" height="12" fill="#000"/><polygon points="4,4 12,10 4,16" fill="#000"/></svg>
    </button>
    <span class="win98-toolbar-sep"></span>
    <button class="win98-toolbar-btn" title="Go back" disabled>
      <svg viewBox="0 0 20 20"><polygon points="13,4 6,10 13,16" fill="#000"/><polygon points="17,4 10,10 17,16" fill="#000"/></svg>
    </button>
    <button class="win98-toolbar-btn" title="Go forward" disabled>
      <svg viewBox="0 0 20 20"><polygon points="7,4 14,10 7,16" fill="#000"/><polygon points="3,4 10,10 3,16" fill="#000"/></svg>
    </button>
    <span class="win98-toolbar-sep"></span>
    <button class="win98-toolbar-btn" title="Find" disabled>
      <svg viewBox="0 0 20 20"><circle cx="8" cy="8" r="5" fill="none" stroke="#000" stroke-width="1.4"/><line x1="12" y1="12" x2="17" y2="17" stroke="#000" stroke-width="2"/></svg>
    </button>
    <span class="win98-toolbar-sep"></span>
    <a class="win98-toolbar-btn win98-toolbar-btn--action" href="/files/cv_aca.pdf" download="Haochen_Luo_CV.pdf" title="Save a Copy... (Download)">
      <svg viewBox="0 0 20 20"><rect x="3" y="3" width="14" height="14" fill="#000080" stroke="#000" stroke-width="1"/><rect x="5" y="4" width="7" height="5" fill="#fff"/><rect x="6" y="11" width="8" height="5" fill="#fff" stroke="#000" stroke-width="0.6"/></svg>
    </a>
  </div>

  <div class="win98-acrobat-viewport" id="win98-pdf-viewport">
    <canvas id="win98-pdf-canvas"></canvas>
    <p id="win98-pdf-loading">Loading cv_aca.pdf&hellip;</p>
  </div>

  <div class="win98-statusbar">
    <span id="win98-pdf-page-status">Page 1 of 1</span>
    <span id="win98-pdf-zoom-status">100%</span>
    <span id="win98-pdf-size-status"></span>
  </div>
</div>

<p class="win98-pdf-fallback">If the CV doesn't display above, <a href="/files/cv_aca.pdf" download="Haochen_Luo_CV.pdf">download the PDF</a> instead.</p>

<script type="module">
  import * as pdfjsLib from "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.min.mjs";
  pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.worker.min.mjs";

  var PDF_URL = "/files/cv_aca.pdf";
  var viewport = document.getElementById("win98-pdf-viewport");
  var canvas = document.getElementById("win98-pdf-canvas");
  var loadingEl = document.getElementById("win98-pdf-loading");
  var ctx = canvas.getContext("2d");
  var pageStatus = document.getElementById("win98-pdf-page-status");
  var zoomStatus = document.getElementById("win98-pdf-zoom-status");
  var sizeStatus = document.getElementById("win98-pdf-size-status");

  var firstBtn = document.getElementById("win98-pdf-first");
  var prevBtn = document.getElementById("win98-pdf-prev");
  var nextBtn = document.getElementById("win98-pdf-next");
  var lastBtn = document.getElementById("win98-pdf-last");
  var zoomInBtn = document.getElementById("win98-pdf-zoom-in");
  var zoomOutBtn = document.getElementById("win98-pdf-zoom-out");

  var pdfDoc = null;
  var currentPage = 1;
  var scale = 1;
  var userZoomed = false;
  var rendering = false;
  var pendingPage = null;

  function fitScale(page) {
    var unscaled = page.getViewport({ scale: 1 });
    var available = Math.max(200, viewport.clientWidth - 24);
    return Math.min(2.5, available / unscaled.width);
  }

  function updateButtons() {
    firstBtn.disabled = currentPage <= 1;
    prevBtn.disabled = currentPage <= 1;
    nextBtn.disabled = currentPage >= pdfDoc.numPages;
    lastBtn.disabled = currentPage >= pdfDoc.numPages;
    zoomOutBtn.disabled = scale <= 0.3;
    zoomInBtn.disabled = scale >= 2.5;
  }

  function renderPage(num) {
    if (rendering) {
      pendingPage = num;
      return;
    }
    rendering = true;
    pdfDoc.getPage(num).then(function (page) {
      if (!userZoomed) scale = fitScale(page);
      var pageViewport = page.getViewport({ scale: scale });
      canvas.width = pageViewport.width;
      canvas.height = pageViewport.height;
      var renderContext = { canvasContext: ctx, viewport: pageViewport };
      return page.render(renderContext).promise.then(function () {
        currentPage = num;
        loadingEl.hidden = true;
        canvas.hidden = false;
        pageStatus.textContent = "Page " + currentPage + " of " + pdfDoc.numPages;
        zoomStatus.textContent = Math.round(scale * 100) + "%";
        var unscaled = page.getViewport({ scale: 1 });
        sizeStatus.textContent = (unscaled.width / 72).toFixed(1) + " x " + (unscaled.height / 72).toFixed(1) + " in";
        updateButtons();
        rendering = false;
        if (pendingPage !== null) {
          var next = pendingPage;
          pendingPage = null;
          renderPage(next);
        }
      });
    }).catch(function (err) {
      console.error("win98 pdf render failed:", err);
      rendering = false;
      loadingEl.textContent = "Couldn't render the PDF preview. Use the download link below instead.";
      loadingEl.hidden = false;
      canvas.hidden = true;
    });
  }

  function goTo(num) {
    if (!pdfDoc) return;
    num = Math.max(1, Math.min(pdfDoc.numPages, num));
    renderPage(num);
  }

  firstBtn.addEventListener("click", function () { goTo(1); });
  prevBtn.addEventListener("click", function () { goTo(currentPage - 1); });
  nextBtn.addEventListener("click", function () { goTo(currentPage + 1); });
  lastBtn.addEventListener("click", function () { goTo(pdfDoc.numPages); });

  zoomInBtn.addEventListener("click", function () {
    userZoomed = true;
    scale = Math.min(2.5, scale + 0.25);
    renderPage(currentPage);
  });
  zoomOutBtn.addEventListener("click", function () {
    userZoomed = true;
    scale = Math.max(0.3, scale - 0.25);
    renderPage(currentPage);
  });

  var resizeTimer = null;
  window.addEventListener("resize", function () {
    if (userZoomed || !pdfDoc) return;
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () { renderPage(currentPage); }, 200);
  });

  canvas.hidden = true;
  pdfjsLib.getDocument({ url: PDF_URL }).promise.then(function (pdf) {
    pdfDoc = pdf;
    renderPage(1);
  }).catch(function (err) {
    console.error("win98 pdf load failed:", err);
    loadingEl.textContent = "Couldn't load the PDF preview. Use the download link below instead.";
  });
</script>
