// fragments.js
async function includeFragment(path, selector) {
    try {
      const res = await fetch(path);
      if (!res.ok) throw new Error(res.status + ' ' + res.statusText);
      const html = await res.text();
      document.querySelector(selector).innerHTML = html;
    } catch (err) {
      console.error('Error loading fragment:', path, err);
    }
  }
  
  document.addEventListener('DOMContentLoaded', () => {
    // Add shadow + stronger bg when scrolling
    window.addEventListener('scroll', () => {
        const header = document.querySelector('header');
        if (window.scrollY > 20) {
        header.classList.add('scrolled');
        } else {
        header.classList.remove('scrolled');
        }
        
    });
    includeFragment('header.html', '#site-header');
    includeFragment('footer.html', '#site-footer');
  });
  