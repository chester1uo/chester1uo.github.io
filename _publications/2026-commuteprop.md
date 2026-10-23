---
title: "CommuteProp: Decoupled Training for Communication Bound Split LLM Fine-Tuning"
collection: publications
category: preprints
permalink: /publication/2026-commuteprop
date: 2026-10-04
venue: 'arXiv preprint arXiv:2610.05105'
paperurl: 'https://arxiv.org/abs/2610.05105'
authors: "Ding Chen, Haochen Luo, Chen Liu"
---

CommuteProp accelerates split learning for large language model fine-tuning by running cross-block gradient propagation and local weight updates concurrently. This asynchronous schedule overlaps network transfers with computation, reducing the idle time imposed by synchronous client-server training. The work analyzes convergence and asynchronous errors, and introduces an NS preconditioner to address noise from stale information. Experiments demonstrate higher training throughput with comparable accuracy and compatibility with existing privacy-enhancing techniques.
