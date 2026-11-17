(function() {
  document.addEventListener("DOMContentLoaded", function() {
    const header = document.querySelector("header");
    const menuToggle = document.getElementById("menuToggle");
    const menu = document.getElementById("jumpMenu");
    const minimizeBtn = document.getElementById("minimizeBtn");
    const links = document.querySelectorAll(".jump-menu a[data-target]");
    const sections = document.querySelectorAll("section");
    const themeToggle = document.getElementById('themeToggleFloat');
    const quickToggles = document.getElementById("quickToggles");

    let introPlayed = false;
    let headerVisible = true;
    let lastScroll = window.scrollY;
    let hideTimer;
 
    // Header observer
    const headerObserver = new IntersectionObserver(([entry]) => {
      headerVisible = entry.isIntersecting;
      if (entry.isIntersecting) {
        menuToggle.classList.remove("show");
      } else {
        menuToggle.classList.add("show");
        if (!introPlayed) {
          menuToggle.classList.add("intro");
          setTimeout(() => {
            menuToggle.classList.remove("intro");
            menuToggle.classList.add("compact");
          }, 4000);
          introPlayed = true;
        }
      }
    }, { threshold: 0 });
    if (header) headerObserver.observe(header);

    // Menu open/close
    menuToggle.onclick = (e) => {
      e.stopPropagation();
      menu.style.display = "block";
      menuToggle.setAttribute("aria-expanded", "true");
      menuToggle.style.display = "none";
      setTimeout(() => menu.classList.add("show"), 10);
    };
    function closeMenu() {
      menu.classList.remove("show");
      menuToggle.setAttribute("aria-expanded", "false");
      setTimeout(() => {
        menu.style.display = "none";
        menuToggle.style.display = "flex";
      }, 300);
    }
    minimizeBtn.onclick = closeMenu;

    // Smooth scroll + immediate highlight
links.forEach(link => {
  link.addEventListener("click", e => {
    e.preventDefault();
    
    // Remove active from all links and set it on the clicked one
    links.forEach(l => l.classList.remove("active"));
    link.classList.add("active");
    
    const id = link.dataset.target;
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      history.replaceState(null, "", "#" + id);
      closeMenu();
      quickToggles.classList.remove("show");
    }
  });
  link.addEventListener("keydown", e => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      link.click();
    }
  });
});

  // ---------- Active section highlight ----------
const sectionRatios = new Map(); // store latest intersection ratio per section

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    sectionRatios.set(entry.target, entry.intersectionRatio);
  });

  // Find the section with the highest intersection ratio (>0)
  let bestSection = null;
  let bestRatio = 0;
  sectionRatios.forEach((ratio, section) => {
    if (ratio > bestRatio) {
      bestRatio = ratio;
      bestSection = section;
    }
  });

  // Remove active from all, then add to the best one's link (if any)
  links.forEach(l => l.classList.remove("active"));
  if (bestSection) {
    const activeLink = document.querySelector(`.jump-menu a[data-target="${bestSection.id}"]`);
    if (activeLink) activeLink.classList.add("active");
  }
}, { threshold: [0, 0.1, 0.25, 0.5, 0.75, 1] });   // multiple thresholds for accuracy

sections.forEach(section => observer.observe(section));

    // Click outside to close menu
    function clickOutside(e) {
      if (menu.classList.contains("show") && !menu.contains(e.target) && !menuToggle.contains(e.target)) {
        closeMenu();
      }
    }
    document.addEventListener("click", clickOutside);
    document.addEventListener("touchstart", clickOutside);

  
    // Dark mode toggle auto-show/hide
    window.addEventListener("scroll", () => {
      themeToggle.classList.add("show");
      clearTimeout(darkHideTimer);
      darkHideTimer = setTimeout(() => {
        themeToggle.classList.remove("show");
      }, 4000);
    });
    themeToggle.classList.add("show");
    setTimeout(() => themeToggle.classList.remove("show"), 4000);

    // Quick toggles – show only on scroll-up
    window.addEventListener("scroll", () => {
      const cur = window.scrollY;
      if (!headerVisible && cur < lastScroll - 6) {
        quickToggles.classList.add("show");
        clearTimeout(hideTimer);
        hideTimer = setTimeout(() => {
          quickToggles.classList.remove("show");
        }, 5000);
      } else if (headerVisible) {
        quickToggles.classList.remove("show");
      }
      lastScroll = cur;
    });
/* ===== DARK MODE & CHAPTER PIE MENU (Centered 2s Long Press) ===== */
const chapterPieMenu = document.getElementById('chapterPieMenu');
const pieOverlay = document.getElementById('pieOverlay');
const pieSlicesContainer = document.getElementById('pieSlices');
const pieCloseBtn = document.getElementById('pieCloseBtn');
let pressTimer = null;
let longPressTriggered = false;
const LONG_PRESS_MS = 500;

// Build pie slices dynamically
function buildPieMenu() {
  pieSlicesContainer.innerHTML = '';

  const isMobile = window.innerWidth <= 768;
  const radius = isMobile ? 110 : 150;
  const total = chapters.length;

  chapters.forEach((ch, i) => {
    const angle = (i / total) * 360 - 90; // Start from top
    const rad = (angle * Math.PI) / 180;
    const x = Math.cos(rad) * radius;
    const y = Math.sin(rad) * radius;

    const slice = document.createElement('div');
    slice.className = 'pie-slice' + (ch.current ? ' current' : '');

    // Staggered delays for cool wave effect
    // Opening: ripple outward from center
    const openDelay = (i * 0.04).toFixed(3);
    // Closing: reverse ripple inward
    const closeDelay = ((total - 1 - i) * 0.03).toFixed(3);

    slice.style.setProperty('--open-delay', `${openDelay}s`);
    slice.style.setProperty('--close-delay', `${closeDelay}s`);

    const link = document.createElement('a');
    link.href = ch.url;
    link.textContent = ch.num;
    link.setAttribute('title', ch.title);
    link.style.borderColor = ch.color;
    // Apply staggered animation delay
    link.style.animationDelay = `${openDelay}s`;

    // Hover color effect
    link.addEventListener('mouseenter', () => {
      link.style.background = ch.color;
      link.style.boxShadow = `0 0 30px ${ch.color}, 0 0 0 4px white`;
    });
    link.addEventListener('mouseleave', () => {
      if (!ch.current) {
        link.style.background = '';
        link.style.boxShadow = '';
      }
    });

    slice.appendChild(link);

    // Position
    slice.style.transform = `translate(${x}px, ${y}px)`;

    pieSlicesContainer.appendChild(slice);
  });
}

buildPieMenu();

function openPieMenu() {
  // Scale up the button slightly (stays at fixed position)
  themeToggle.classList.add('centered');
  themeToggle.classList.remove('pressing');

  // Show menu overlay
  chapterPieMenu.classList.add('active');

  // Haptic feedback
  if (navigator.vibrate) navigator.vibrate(50);

  // Hide quick toggles if visible
  quickToggles.classList.remove('show');
}

function closePieMenu() {
  // Add closing class for vortex animation
  chapterPieMenu.classList.add('closing');

  // Wait for animation to finish before hiding
  setTimeout(() => {
    chapterPieMenu.classList.remove('active');
    chapterPieMenu.classList.remove('closing');
  }, 550);

  // Return button to normal scale
  themeToggle.classList.remove('centered');
  themeToggle.classList.remove('pressing');
}

function clearPressTimer() {
  if (pressTimer) {
    clearTimeout(pressTimer);
    pressTimer = null;
  }
}

// Long press detection on theme toggle
themeToggle.addEventListener('pointerdown', (e) => {
  // If menu is already open, close it (toggle behavior)
  if (chapterPieMenu.classList.contains('active')) {
    closePieMenu();
    return;
  }

  longPressTriggered = false;
  clearPressTimer();

  // Add pressing animation
  themeToggle.classList.add('pressing');

  pressTimer = setTimeout(() => {
    longPressTriggered = true;
    openPieMenu();
  }, LONG_PRESS_MS);
});

themeToggle.addEventListener('pointerup', (e) => {
  clearPressTimer();
  themeToggle.classList.remove('pressing');

  // If it was a short click and menu wasn't opened, toggle dark mode
  if (!longPressTriggered && !chapterPieMenu.classList.contains('active')) {
    document.body.classList.toggle('dark');
    localStorage.setItem('dark', document.body.classList.contains('dark'));
  }
});

themeToggle.addEventListener('pointerleave', () => {
  clearPressTimer();
  if (!longPressTriggered && !chapterPieMenu.classList.contains('active')) {
    themeToggle.classList.remove('pressing');
  }
});

themeToggle.addEventListener('pointercancel', () => {
  clearPressTimer();
  if (!longPressTriggered && !chapterPieMenu.classList.contains('active')) {
    themeToggle.classList.remove('pressing');
  }
});

// Prevent context menu on long press
themeToggle.addEventListener('contextmenu', (e) => {
  e.preventDefault();
});

// Close on overlay click
pieOverlay.addEventListener('click', () => {
  closePieMenu();
});

// Close on center button (X) click
pieCloseBtn.addEventListener('click', () => {
  closePieMenu();
});

// Close on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && chapterPieMenu.classList.contains('active')) {
    closePieMenu();
  }
});

// Rebuild on resize
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    if (!chapterPieMenu.classList.contains('active')) {
      buildPieMenu();
    }
  }, 250);
});

// Keep scroll show/hide behavior
let darkHideTimer;
window.addEventListener('scroll', () => {
  if (!chapterPieMenu.classList.contains('active')) {
    themeToggle.classList.add('show');
    clearTimeout(darkHideTimer);
    darkHideTimer = setTimeout(() => {
      themeToggle.classList.remove('show');
    }, 4000);
  }
});

// Initial state
if (localStorage.getItem('dark') === 'true') document.body.classList.add('dark');

// Initial dark mode state
if (localStorage.getItem("dark") === "true") document.body.classList.add("dark");
    // Load from hash
    const hash = location.hash.replace("#", "");
    if (hash) document.getElementById(hash)?.scrollIntoView();

    // Add print watermark
    const watermarkDiv = document.createElement('div');
    watermarkDiv.className = 'print-watermark';
    watermarkDiv.innerText = 'curiosity.academy';
    document.body.appendChild(watermarkDiv);
  });

  // Print functionality
  const printBtn = document.getElementById('printCV');
  if (printBtn) {
    printBtn.addEventListener('click', () => {
      window.print();
    });
  }
  
})();

// ===== IMPROVED PRELOADER WITH KATEX CHECK =====
window.addEventListener('load', function() {
  const preloader = document.getElementById('preloader');
  
  // Wait for KaTeX to finish rendering
  function checkKaTeXReady() {
    // Check if KaTeX has rendered
    const katexElements = document.querySelectorAll('.katex');
    const totalMathElements = document.querySelectorAll('[class*="katex"], .math');
    
    if (typeof renderMathInElement !== 'undefined' && katexElements.length === 0) {
      // KaTeX still rendering, wait more
      setTimeout(checkKaTeXReady, 300);
      return;
    }
    
    // Everything is ready, show content after 2 seconds
    setTimeout(function() {
      preloader.classList.add('hidden');
      setTimeout(function() {
        preloader.style.display = 'none';
      }, 600);
    }, 2500);
  }
  
  // Start checking
  setTimeout(checkKaTeXReady, 100);
});

// Ultimate fallback (3 seconds max)
setTimeout(function() {
  const preloader = document.getElementById('preloader');
  if (preloader && !preloader.classList.contains('hidden')) {
    preloader.classList.add('hidden');
    setTimeout(function() {
      if (preloader) preloader.style.display = 'none';
    }, 600);
  }
}, 10000);

// ===== SHARE FUNCTIONALITY - SINGLE CLEAN VERSION =====

// Make shareVia globally available for onclick attributes
window.shareVia = function(platform) {
  console.log('Share clicked:', platform);
  
  const url = encodeURIComponent(window.location.href);
  const title = encodeURIComponent(document.title);
  const description = encodeURIComponent(
    document.querySelector('meta[name="description"]')?.content || 
    'Check out this amazing resource!'
  );
  
  let shareUrl = '';
  
  switch(platform) {
    case 'whatsapp':
      shareUrl = `https://wa.me/?text=${title}%20-%20${url}`;
      break;
    case 'facebook':
      shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${title}`;
      break;
    case 'twitter':
      shareUrl = `https://twitter.com/intent/tweet?text=${title}&url=${url}`;
      break;
    case 'telegram':
      shareUrl = `https://t.me/share/url?url=${url}&text=${title}`;
      break;
    case 'email':
      shareUrl = `mailto:?subject=${title}&body=${description}%0A%0A${url}`;
      break;
    case 'copy':
      copyToClipboard(window.location.href);
      document.getElementById('shareMenu')?.classList.remove('active');
      return;
    case 'native':
      if (navigator.share) {
        navigator.share({
          title: document.title,
          text: description,
          url: window.location.href,
        }).catch(() => {});
      } else {
        copyToClipboard(window.location.href);
      }
      document.getElementById('shareMenu')?.classList.remove('active');
      return;
  }
  
  if (shareUrl) {
    window.open(shareUrl, '_blank', 'width=600,height=400');
    document.getElementById('shareMenu')?.classList.remove('active');
  }
};

// Copy to clipboard function
function copyToClipboard(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      showToast('Link copied! 📋');
    }).catch(() => {
      fallbackCopy(text);
    });
  } else {
    fallbackCopy(text);
  }
}

function fallbackCopy(text) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  try {
    document.execCommand('copy');
    showToast('Link copied! 📋');
  } catch (err) {
    showToast('Failed to copy link');
  }
  document.body.removeChild(textarea);
}

function showToast(message) {
  const existingToast = document.querySelector('.copy-toast');
  if (existingToast) existingToast.remove();
  
  const toast = document.createElement('div');
  toast.className = 'copy-toast';
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

// Initialize share menu when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  const shareMainBtn = document.getElementById('shareMainBtn');
  const shareMenu = document.getElementById('shareMenu');
  const shareContainer = document.getElementById('shareContainer');
  const themeToggle = document.getElementById('themeToggleFloat');
  
  // Safety check
  if (!shareMainBtn || !shareMenu || !shareContainer) {
    console.warn('Share buttons not found in HTML');
    return;
  }
  
  // Toggle menu on click
  shareMainBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    shareMenu.classList.toggle('active');
  });
  
  // Close menu when clicking outside
  document.addEventListener('click', function(e) {
    if (shareMenu.classList.contains('active') && 
        !shareMenu.contains(e.target) && 
        e.target !== shareMainBtn) {
      shareMenu.classList.remove('active');
    }
  });
  
  // Auto-close menu after 5 seconds
  shareMainBtn.addEventListener('click', function() {
    if (shareMenu.classList.contains('active')) {
      setTimeout(() => {
        shareMenu.classList.remove('active');
      }, 6000);
    }
  });

  // ===== SHOW/HIDE ON SCROLL =====
  let lastScroll = window.scrollY;
  let shareHideTimer;
  
  window.addEventListener('scroll', function() {
    const currentScroll = window.scrollY;
    
    // Show both buttons when scrolling up
    if (currentScroll < lastScroll - 10) {
      shareContainer.classList.add('show');
      themeToggle.classList.add('show');
      
      // Reset auto-hide timer
      clearTimeout(shareHideTimer);
      shareHideTimer = setTimeout(function() {
        shareContainer.classList.remove('show');
        themeToggle.classList.remove('show');
      }, 5000);
    }
    
    lastScroll = currentScroll;
  });
  
  // Show share button initially for a moment
  setTimeout(function() {
    shareContainer.classList.add('show');
    themeToggle.classList.add('show');
    setTimeout(function() {
      shareContainer.classList.remove('show');
      themeToggle.classList.remove('show');
    }, 5000);
  }, 1000);
});
