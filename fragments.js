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
    const hero = document.querySelector('.hero');
  
    if (!header || !hero) return;
  
    const logo = header.querySelector('.logo');
    const mainNavItems = header.querySelectorAll('.main-nav ul li');
    const secondaryNavItems = header.querySelectorAll('.secondary-nav ul li');
  
    function updateHeaderHeightVar() {
      const h = header.offsetHeight || 90;
      document.documentElement.style.setProperty('--header-height', `${h}px`);
      return h;
    }
  
    updateHeaderHeightVar();
  
    function interpolateColor(start, end, factor) {
      const result = start.slice();
      for (let i = 0; i < 3; i++) {
        result[i] = Math.round(start[i] + factor * (end[i] - start[i]));
      }
      return `rgb(${result[0]}, ${result[1]}, ${result[2]})`;
    }
  
    function checkScroll() {
      const y = window.scrollY || window.pageYOffset;
      const heroTop = hero.offsetTop;
      const heroHeight = hero.offsetHeight;
  
      const pointA = heroTop + heroHeight * 0.25; // start slide
      const pointC = heroTop + heroHeight;        // fully hidden
  
      if (y < pointA) {
        // Transparent with white text
        header.style.transform = `translateY(0)`;
        header.classList.remove('scrolled');
        [logo, ...mainNavItems, ...secondaryNavItems].forEach(el => el.style.color = '#fff');
      } else if (y >= pointA && y <= pointC) {
        // Sliding + interpolating text color
        const progress = (y - pointA) / (pointC - pointA); // 0 → 1
        const translateY = -progress * 100;
        header.style.transform = `translateY(${translateY}%)`;
        header.classList.remove('scrolled');
  
        // Blend text color from white → black
        const color = interpolateColor([255, 255, 255], [17, 17, 17], progress);
        [logo, ...mainNavItems, ...secondaryNavItems].forEach(el => el.style.color = color);
      } else {
        // After hero: reset position, solid white bg, black text
        header.style.transform = `translateY(0)`;
        header.classList.add('scrolled');
        [logo, ...mainNavItems, ...secondaryNavItems].forEach(el => el.style.color = '#111');
      }
    }
  
    checkScroll();
    window.addEventListener('scroll', checkScroll);
    window.addEventListener('resize', checkScroll);
  });
  // =========================
  // Carousel Scroll Logic
  // =========================
  const carousels = document.querySelectorAll('.carousel-section');
  carousels.forEach(section => {
    const container = section.querySelector('.carousel-container');
    const track = section.querySelector('.carousel-track');
    const leftArrow = section.querySelector('.carousel-arrow.left');
    const rightArrow = section.querySelector('.carousel-arrow.right');

    function updateArrows() {
      const maxScroll = track.scrollWidth - container.clientWidth;
      leftArrow.classList.toggle('hidden', container.scrollLeft <= 0);
      rightArrow.classList.toggle('hidden', container.scrollLeft >= maxScroll - 5);
    }

    leftArrow.addEventListener('click', () => {
      container.scrollBy({ left: -320, behavior: 'smooth' });
    });
    rightArrow.addEventListener('click', () => {
      container.scrollBy({ left: 320, behavior: 'smooth' });
    });

    container.addEventListener('scroll', updateArrows);
    window.addEventListener('resize', updateArrows);

    updateArrows(); // initial
  });
