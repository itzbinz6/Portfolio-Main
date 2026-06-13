// ============================================================
// SITE DATA — pulls extra Projects, Certifications & Tools
// from Firebase Firestore and renders them alongside the
// hardcoded ones already in index.html.
//
// If Firebase isn't configured yet (see firebase-config.js),
// or a collection is empty, this just does nothing — the page
// looks exactly the same as before.
// ============================================================

(function () {
  const moreBtn  = document.getElementById('workMoreBtn');
  const carousel = document.getElementById('workCarousel');
  const track    = document.getElementById('workTrack');
  const nav      = document.getElementById('workNav');
  const dotsWrap = document.getElementById('workDots');
  const prevBtn  = document.getElementById('workPrev');
  const nextBtn  = document.getElementById('workNext');

  let current = 0;
  let pageCount = 0;

  function el(html) {
    const t = document.createElement('template');
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  }

  function esc(str) {
    const d = document.createElement('div');
    d.textContent = str || '';
    return d.innerHTML;
  }

  function projectCard(p) {
    const tag = p.demoTag ? '<span class="demo-tag">Demo</span>' : '';
    const img = p.imageUrl ? `<img src="${esc(p.imageUrl)}" alt="${esc(p.name)} screenshot" loading="lazy">` : '';
    const link = p.link ? `<a href="${esc(p.link)}" target="_blank" class="project-link">View Live <i class="fas fa-arrow-right"></i></a>` : '';
    return el(`
      <div class="project-card fade-in visible">
        <div class="project-preview">${img}</div>
        <div class="project-body">
          <div class="project-type">${esc(p.type)}</div>
          <div class="project-name">${esc(p.name)} ${tag}</div>
          <p class="project-desc">${esc(p.description)}</p>
          ${link}
        </div>
      </div>`);
  }

  function certCard(c) {
    const verify = c.link ? `<a href="${esc(c.link)}" target="_blank" class="project-link" style="margin-bottom:14px;display:inline-flex"><i class="fas fa-external-link-alt"></i> Verify Certificate</a>` : '';
    const img = c.imageUrl ? `<div class="cert-img-wrap"><img src="${esc(c.imageUrl)}" alt="${esc(c.title)} Certificate" loading="lazy"></div>` : '';
    return el(`
      <div class="cert-card fade-in visible">
        <div class="cert-check"><i class="fas fa-check"></i></div>
        <div class="cert-issuer">${esc(c.issuer)}</div>
        <div class="cert-title">${esc(c.title)}</div>
        <div class="cert-desc">${esc(c.description)}</div>
        ${verify}
        ${img}
      </div>`);
  }

  function toolCard(s) {
    return el(`
      <div class="skill-card fade-in visible">
        <div class="skill-icon ${esc(s.color) || ''}"><i class="${esc(s.icon) || 'fas fa-star'}"></i></div>
        <div class="skill-name">${esc(s.name)}</div>
        <div class="skill-desc">${esc(s.description)}</div>
      </div>`);
  }

  function updateCarousel() {
    track.style.transform = `translateX(-${current * 100}%)`;
    prevBtn.disabled = current === 0;
    nextBtn.disabled = current === pageCount - 1;
    dotsWrap.querySelectorAll('.work-dot').forEach((d, i) => d.classList.toggle('active', i === current));
  }

  prevBtn.addEventListener('click', () => { if (current > 0) { current--; updateCarousel(); } });
  nextBtn.addEventListener('click', () => { if (current < pageCount - 1) { current++; updateCarousel(); } });

  moreBtn.addEventListener('click', () => {
    carousel.style.display = 'block';
    moreBtn.style.display = 'none';
    if (pageCount === 0) {
      track.innerHTML = '<div class="work-empty">More projects coming soon — check back later.</div>';
    }
    carousel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });

  // Bail out quietly if Firebase isn't configured yet
  if (typeof firebase === 'undefined' || !firebase.apps || !firebase.apps.length) return;
  const db = firebase.firestore();

  // ---- Certifications: append after the existing 2 ----
  db.collection('certifications').orderBy('order').get().then(snap => {
    const grid = document.getElementById('certsGrid');
    snap.forEach(doc => grid.appendChild(certCard(doc.data())));
  }).catch(() => {});

  // ---- Tools: append after the existing 6 ----
  db.collection('tools').orderBy('order').get().then(snap => {
    const grid = document.getElementById('skillsGrid');
    snap.forEach(doc => grid.appendChild(toolCard(doc.data())));
  }).catch(() => {});

  // ---- Projects: extra pages in the "View More" carousel, 6 per page ----
  db.collection('projects').orderBy('order').get().then(snap => {
    if (snap.empty) return;
    if (track.querySelector('.work-empty')) track.innerHTML = '';

    const cards = [];
    snap.forEach(doc => cards.push(projectCard(doc.data())));

    const pages = [];
    for (let i = 0; i < cards.length; i += 6) pages.push(cards.slice(i, i + 6));

    pages.forEach((cardsInPage, idx) => {
      const page = el('<div class="work-page"></div>');
      cardsInPage.forEach(c => page.appendChild(c));
      track.appendChild(page);
      if (pages.length > 1) {
        const dot = el('<div class="work-dot"></div>');
        if (idx === 0) dot.classList.add('active');
        dotsWrap.appendChild(dot);
      }
    });

    pageCount = pages.length;
    if (pageCount > 1) nav.style.display = 'flex';
    updateCarousel();
  }).catch(() => {});
})();
