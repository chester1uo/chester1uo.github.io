import * as pdfjsLib from "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.min.mjs";

pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.worker.min.mjs";

export function initPdfViewer(pdfUrl) {
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
  pdfjsLib.getDocument({ url: pdfUrl }).promise.then(function (pdf) {
    pdfDoc = pdf;
    renderPage(1);
  }).catch(function (err) {
    console.error("win98 pdf load failed:", err);
    loadingEl.textContent = "Couldn't load the PDF preview. Use the download link below instead.";
  });
}
