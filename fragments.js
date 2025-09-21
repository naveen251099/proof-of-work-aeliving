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
      initCarouselRobust(section);
  
// === Replace the old "initCarousel" block with this robust version ===

function waitForImages(node) {
    const imgs = Array.from(node.querySelectorAll('img'));
    if (imgs.length === 0) return Promise.resolve();
    return Promise.all(imgs.map(img => {
      if (img.complete && img.naturalWidth !== 0) return Promise.resolve();
      return new Promise(resolve => {
        img.addEventListener('load', resolve);
        img.addEventListener('error', resolve); // resolve even on error so we won't hang
      });
    }));
  }
  
  function debounce(fn, wait = 120) {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), wait);
    };
  }
  
  function initCarouselRobust(section) {
    const inner = section.querySelector('.carousel-inner');
    const container = section.querySelector('.carousel-container');
    const track = section.querySelector('.carousel-track');
    const leftArrow = section.querySelector('.carousel-arrow.left');
    const rightArrow = section.querySelector('.carousel-arrow.right');
    const fade = section.querySelector('.carousel-fade');
  
    if (!container || !track) return;
  
    // Wait for all images in the original track to fully load first
    waitForImages(track).then(() => {
      // capture original nodes (only the originals currently in the DOM)
      const originalCards = Array.from(track.querySelectorAll('.carousel-card'));
      if (originalCards.length === 0) return;
  
      // computed gap and side padding
      const computedTrack = window.getComputedStyle(track);
      const gap = parseFloat(computedTrack.gap || computedTrack.columnGap || 0) || 0;
      const sidePadding = parseInt(getComputedStyle(inner).paddingLeft || 0, 10) || 0;
  
      // clone originals to both ends (append + prepend)
      const originals = originalCards.map(card => card.cloneNode(true));
      originals.forEach(node => track.appendChild(node));
      originals.slice().reverse().forEach(node => track.insertBefore(node.cloneNode(true), track.firstChild));
  
      // After clones inserted, force layout and measure
      // Temporarily disable snap so programmatic scroll won't fight browser snapping
      const prevSnap = container.style.scrollSnapType;
      container.style.scrollSnapType = 'none';
  
      // Force reflow to ensure measurements are accurate
      void track.offsetWidth;
  
      // Now measure one card (all are same width)
      const cardEl = track.querySelector('.carousel-card');
      const cardRect = cardEl.getBoundingClientRect();
      const cardWidth = Math.round(cardRect.width);
      const step = cardWidth + gap;
      const origCount = originalCards.length;
  
      // initial scroll position -> place viewport at the first original card (after prepended clones)
      const initialScroll = origCount * step;
      container.scrollLeft = initialScroll;
  
      // Re-enable snap after small delay so snap points are consistent
      // Use requestAnimationFrame twice to wait for layout to settle
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          container.style.scrollSnapType = prevSnap || 'x mandatory';
        });
      });
  
      // Arrow click moves exactly one card (step)
      rightArrow.addEventListener('click', () => {
        container.scrollBy({ left: step, behavior: 'smooth' });
      });
      leftArrow.addEventListener('click', () => {
        container.scrollBy({ left: -step, behavior: 'smooth' });
      });
  
      // Infinite wrap-around handling (jump when entering clones)
      let isTicking = false;
      container.addEventListener('scroll', () => {
        if (isTicking) return;
        window.requestAnimationFrame(() => {
          const scrollLeft = container.scrollLeft;
  
          // If we've scrolled too far left into prepended clones, jump forward
          if (scrollLeft <= step * 0.5) {
            container.scrollLeft = scrollLeft + origCount * step;
          }
          // If we've scrolled too far right into appended clones, jump back
          else if (scrollLeft >= (origCount * step * 2) - step * 0.5) {
            container.scrollLeft = scrollLeft - origCount * step;
          }
  
          isTicking = false;
        });
        isTicking = true;
      });
  
      // Recompute on resize (debounced)
      const recompute = debounce(() => {
        // disable snap, recompute sizes, re-position to keep visuals steady
        container.style.scrollSnapType = 'none';
        // re-measure card width (in case layout changed)
        const newCardRect = track.querySelector('.carousel-card').getBoundingClientRect();
        const newCardWidth = Math.round(newCardRect.width);
        const newStep = newCardWidth + gap;
  
        // compute nearest logical index (which original is currently visible)
        // Use nearest integer of scrollLeft / step
        const currentLogicalIndex = Math.round(container.scrollLeft / newStep);
        // reposition keeping same logical index (clones exist)
        container.scrollLeft = currentLogicalIndex * newStep;
  
        // re-enable snap on next frame
        requestAnimationFrame(() => {
          container.style.scrollSnapType = prevSnap || 'x mandatory';
        });
      }, 150);
  
      window.addEventListener('resize', recompute);
  
      // position fade element correctly relative to padding
      if (fade) fade.style.right = `${sidePadding}px`;
    }).catch(err => {
      console.error('Carousel init images failed or timed out', err);
    });
  }
  
  // Usage: when creating carousels, call initCarouselRobust(section)  
    });
  });
  