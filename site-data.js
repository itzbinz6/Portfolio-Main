(function () {

  // ---- DOM refs ----
  const projectsGrid = document.getElementById('projectsGrid');
  const skillsGrid   = document.getElementById('skillsGrid');
  const certsGrid    = document.getElementById('certsGrid');
  const moreBtn      = document.getElementById('workMoreBtn');
  const carousel     = document.getElementById('workCarousel');
  const track        = document.getElementById('workTrack');
  const nav          = document.getElementById('workNav');
  const dotsWrap     = document.getElementById('workDots');
  const prevBtn      = document.getElementById('workPrev');
  const nextBtn      = document.getElementById('workNext');

  let current = 0, pageCount = 0;

  // ---- Helpers ----
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
  function clearLoader(id) {
    const l = document.getElementById(id);
    if (l) l.remove();
  }

  // ---- Card builders ----
  function projectCard(p) {
    const tag  = p.demoTag ? '<span class="demo-tag">Demo</span>' : '';
    const img  = p.imageUrl ? `<img src="${esc(p.imageUrl)}" alt="${esc(p.name)} screenshot" loading="lazy">` : '';
    const link = p.link ? `<a href="${esc(p.link)}" target="_blank" class="project-link">View Live <i class="fas fa-arrow-right"></i></a>` : '';
    return el(`
      <div class="project-card">
        <div class="project-preview">${img}</div>
        <div class="project-body">
          <div class="project-type">${esc(p.type)}</div>
          <div class="project-name">${esc(p.name)} ${tag}</div>
          <p class="project-desc">${esc(p.description)}</p>
          ${link}
        </div>
      </div>`);
  }

  function skillCard(s) {
    return el(`
      <div class="skill-card">
        <div class="skill-icon ${esc(s.color)}"><i class="${esc(s.icon)}"></i></div>
        <div class="skill-name">${esc(s.name)}</div>
        <div class="skill-desc">${esc(s.description)}</div>
      </div>`);
  }

  function certCard(c) {
    const verify = c.link
      ? `<a href="${esc(c.link)}" target="_blank" class="project-link" style="margin-bottom:14px;display:inline-flex"><i class="fas fa-external-link-alt"></i> Verify Certificate</a>`
      : '';
    const img = c.imageUrl
      ? `<div class="cert-img-wrap"><img src="${esc(c.imageUrl)}" alt="${esc(c.title)} Certificate" loading="lazy"></div>`
      : '';
    return el(`
      <div class="cert-card">
        <div class="cert-check"><i class="fas fa-check"></i></div>
        <div class="cert-issuer">${esc(c.issuer)}</div>
        <div class="cert-title">${esc(c.title)}</div>
        <div class="cert-desc">${esc(c.description)}</div>
        ${verify}
        ${img}
      </div>`);
  }

  function blogCard(b) {
    const link = b.link
      ? `<a href="${esc(b.link)}" target="_blank" class="project-link" style="font-size:.875rem">Read more <i class="fas fa-arrow-right"></i></a>`
      : '';
    return el(`
      <div class="post-card">
        <span class="post-tag">${esc(b.tag)}</span>
        <div class="post-title">${esc(b.title)}</div>
        <p class="post-preview">${esc(b.preview)}</p>
        ${link}
      </div>`);
  }

  // ---- Carousel ----
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
    moreBtn.style.display  = 'none';
    carousel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });

  // ---- Wait for Firebase, then fetch ----
  function waitForFirebase(retries, callback) {
    if (typeof firebase !== 'undefined' && firebase.apps && firebase.apps.length) {
      callback();
    } else if (retries > 0) {
      setTimeout(() => waitForFirebase(retries - 1, callback), 200);
    } else {
      // Firebase never loaded — clear spinners silently
      ['projectsLoading','skillsLoading','certsLoading','blogLoading'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = '';
      });
    }
  }

  waitForFirebase(25, function () {
    const db = firebase.firestore();

    // ---- PROJECTS ----
    db.collection('projects').orderBy('order').get().then(snap => {
      clearLoader('projectsLoading');
      if (snap.empty) return;

      const all   = [];
      snap.forEach(doc => all.push(doc.data()));

      const main  = all.slice(0, 6);
      const extra = all.slice(6);

      // Render main grid
      main.forEach(p => projectsGrid.appendChild(projectCard(p)));

      // Render extra into carousel pages
      if (extra.length > 0) {
        const pages = [];
        for (let i = 0; i < extra.length; i += 6) pages.push(extra.slice(i, i + 6));

        pages.forEach((cardsInPage, idx) => {
          const page = el('<div class="work-page"></div>');
          cardsInPage.forEach(p => page.appendChild(projectCard(p)));
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
        moreBtn.style.display = 'flex';
      } else {
        moreBtn.style.display = 'none';
      }
    }).catch(() => clearLoader('projectsLoading'));

    // ---- SKILLS ----
    db.collection('tools').orderBy('order').get().then(snap => {
      clearLoader('skillsLoading');
      snap.forEach(doc => skillsGrid.appendChild(skillCard(doc.data())));
    }).catch(() => clearLoader('skillsLoading'));

    // ---- CERTIFICATIONS ----
    db.collection('certifications').orderBy('order').get().then(snap => {
      clearLoader('certsLoading');
      snap.forEach(doc => certsGrid.appendChild(certCard(doc.data())));
    }).catch(() => clearLoader('certsLoading'));

    // ---- BLOG ----
    db.collection('blog').orderBy('order').get().then(snap => {
      clearLoader('blogLoading');
      if (snap.empty) return;
      const blogWrap = document.getElementById('blogPostsWrap');
      if (!blogWrap) return;
      snap.forEach(doc => blogWrap.appendChild(blogCard(doc.data())));
    }).catch(() => clearLoader('blogLoading'));

  });

})();
