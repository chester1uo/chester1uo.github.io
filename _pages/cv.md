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

{% include win98-acrobat.html download_url="/files/cv_aca.pdf" download_name="Haochen_Luo_CV.pdf" loading_label="cv_aca.pdf" %}

<script type="module">
  import { initPdfViewer } from "/assets/js/win98-pdf-viewer.js";
  initPdfViewer("/files/cv_aca.pdf");
</script>
