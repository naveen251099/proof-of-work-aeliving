// fragments.js
async function includeFragment(path, selector) {
    try {
      const res = await fetch(path);
      if (!res.ok) throw new Error(res.status + ' ' + res.statusText);
      const html = await res.text();
      document.querySelector(selector).innerHTML = html;
      return true;
    } catch (err) {
      console.error('Error loading fragment:', path, err);
      return false;
    }
  }
  
  document.addEventListener('DOMContentLoaded', async () => {
    await includeFragment('header.html', '#site-header');
    await includeFragment('footer.html', '#site-footer');
  
    const header = document.querySelector('#site-header header') || document.querySelector('header');
    const filters = document.querySelector('.filters');
    const hero = document.querySelector('.hero');
  
    if (header && hero && filters) {
      function updateHeaderHeightVar() {
        const h = header.offsetHeight || 90;
        document.documentElement.style.setProperty('--header-height', `${h}px`);
        return h;
      }
      updateHeaderHeightVar();
  
      const heroHeight = hero.offsetHeight;
  
      function checkScroll() {
        const y = window.scrollY || window.pageYOffset;
  
        // Header
        if (y < heroHeight) {
          header.classList.add('transparent-header-text');
          header.classList.remove('scrolled');
        } else {
          header.classList.remove('transparent-header-text');
          header.classList.add('scrolled');
        }
  
        // Filters
        if (y >= heroHeight) {
          filters.classList.add('active');
        } else {
          filters.classList.remove('active');
        }
      }
  
      checkScroll();
      window.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', () => {
        updateHeaderHeightVar();
        checkScroll();
      });
    }


    // =========================
    // Carousel: snap + infinite
    // =========================
    const carousels = document.querySelectorAll('.carousel-section');
    carousels.forEach(section => {
      const inner = section.querySelector('.carousel-inner');
      const container = section.querySelector('.carousel-container');
      const track = section.querySelector('.carousel-track');
      const leftArrow = section.querySelector('.carousel-arrow.left');
      const rightArrow = section.querySelector('.carousel-arrow.right');
      const fade = section.querySelector('.carousel-fade');
  
      if (!container || !track) return;
  
      // Compute values after a small delay (images may affect sizes)
      setTimeout(initCarousel, 80);
  
      function initCarousel() {
        const originalCards = Array.from(track.querySelectorAll('.carousel-card'));
        if (originalCards.length === 0) return;
  
        // Read gap and side padding from computed styles
        const computedTrack = window.getComputedStyle(track);
        const gap = parseInt(computedTrack.gap || 20, 10) || 20;
        const sidePadding = parseInt(getComputedStyle(inner).paddingLeft || 20, 10) || 20;
  
        // Clone originals to both ends to allow continuous scroll
        const originals = originalCards.map(card => card.cloneNode(true));
        originals.forEach(node => track.appendChild(node));
        // prepend clones in reversed order so visual order remains
        originals.slice().reverse().forEach(node => track.insertBefore(node.cloneNode(true), track.firstChild));
  
        // Recompute sizes now clones are in DOM
        const cardEl = track.querySelector('.carousel-card');
        const cardRect = cardEl.getBoundingClientRect();
        const cardWidth = Math.round(cardRect.width); // pixel width of a card (without gap)
        const step = cardWidth + gap; // distance to move to land exactly at next card start
        const origCount = originalCards.length;
  
        // initial scroll position -> move to first original (after prepended clones)
        const initialScroll = origCount * step;
        container.scrollLeft = initialScroll;
  
        // Ensure container uses scroll-padding-left so snap aligns with inner padding
        container.style.scrollPaddingLeft = `${sidePadding}px`;
  
        // Arrow click moves exactly one card (step)
        rightArrow.addEventListener('click', () => {
          container.scrollBy({ left: step, behavior: 'smooth' });
        });
        leftArrow.addEventListener('click', () => {
          container.scrollBy({ left: -step, behavior: 'smooth' });
        });
  
        // Handle infinite wrap-around using scroll event
        let isTicking = false;
        container.addEventListener('scroll', () => {
          if (isTicking) return;
          window.requestAnimationFrame(() => {
            const maxScroll = track.scrollWidth - container.clientWidth;
            const scrollLeft = container.scrollLeft;
  
            // wrap to the right when near the left clones
            if (scrollLeft <= step * 0.5) {
              // jump forward by origCount * step
              container.scrollLeft = scrollLeft + origCount * step;
            }
  
            // wrap to the left when near the right clones
            else if (scrollLeft >= (origCount * step * 2) - step * 0.5) {
              container.scrollLeft = scrollLeft - origCount * step;
            }
  
            // hide/show arrows based on optional UX (here we keep arrows visible for infinite experience)
            // leftArrow.classList.toggle('hidden', false);
            // rightArrow.classList.toggle('hidden', false);
  
            isTicking = false;
          });
          isTicking = true;
        });
  
        // Optional: keyboard left/right navigation for accessibility
        section.addEventListener('keydown', (e) => {
          if (e.key === 'ArrowRight') rightArrow.click();
          if (e.key === 'ArrowLeft') leftArrow.click();
        });
  
        // Ensure fade sits at correct position relative to side padding
        if (fade) {
          fade.style.right = `${sidePadding}px`;
        }
      }
    });
  });
  