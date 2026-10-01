/**
 * THE FRIENDS OF TUNBRIDGE WELLS & RUSTHALL COMMONS
 * Main Client-side Interactive Script
 */

document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initMobileNav();
  initFaqAccordion();
  initDetailsHashAnchor();
  initDonationCalculator();
  initPledgeCalculator();
  initFormSimulators();
  initSocialSharing();
  initCampaignProgress();
  initEditorialReview();
  initDirectDebitPopups();
});

/* Auto-open <details> accordions when targeted by hash link */
function initDetailsHashAnchor() {
  function checkHash() {
    const hash = window.location.hash;
    if (!hash || hash.length <= 1) return;
    try {
      const target = document.querySelector(hash);
      if (target) {
        const details = target.closest('details') || (target.tagName === 'DETAILS' ? target : null);
        if (details) {
          details.open = true;
          setTimeout(() => {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 120);
        }
      }
    } catch (e) {}
  }

  window.addEventListener('hashchange', checkHash);
  if (window.location.hash) {
    setTimeout(checkHash, 150);
  }

  // Intercept anchor clicks on the page targeting details
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', () => {
      const hash = anchor.getAttribute('href');
      if (hash && hash.length > 1) {
        try {
          const target = document.querySelector(hash);
          if (target) {
            const details = target.closest('details') || (target.tagName === 'DETAILS' ? target : null);
            if (details) {
              details.open = true;
            }
          }
        } catch (err) {}
      }
    });
  });
}

/* Sticky Header Scroll Effect */
function initHeader() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }, { passive: true });
}

/* Accessible Mobile Navigation Drawer */
function initMobileNav() {
  const toggleBtn = document.querySelector('.mobile-menu-btn');
  const drawer = document.querySelector('.mobile-nav-drawer');
  if (!toggleBtn || !drawer) return;

  toggleBtn.addEventListener('click', () => {
    const isOpen = drawer.classList.contains('open');
    if (isOpen) {
      drawer.classList.remove('open');
      toggleBtn.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    } else {
      drawer.classList.add('open');
      toggleBtn.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('open')) {
      drawer.classList.remove('open');
      toggleBtn.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  });
}

/* Accordion FAQs */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const questionBtn = item.querySelector('.faq-question');
    if (!questionBtn) return;

    questionBtn.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      faqItems.forEach(other => {
        if (other !== item) other.classList.remove('active');
      });
      item.classList.toggle('active', !isActive);
    });
  });
}

/* Interactive Donation & Gift Aid Calculator */
function initDonationCalculator() {
  const amountBtns = document.querySelectorAll('.donate-amount-btn');
  const customInput = document.querySelector('#custom-donate-amount');
  const giftAidCheckbox = document.querySelector('#donate-gift-aid');
  const totalDisplay = document.querySelector('#donation-total-display');
  const giftAidBonusDisplay = document.querySelector('#gift-aid-bonus-display');

  if (!amountBtns.length && !customInput) return;

  let currentAmount = 25; // default donation

  function updateDisplays() {
    const isGiftAid = giftAidCheckbox ? giftAidCheckbox.checked : false;
    const bonus = isGiftAid ? (currentAmount * 0.25) : 0;
    const charityReceives = currentAmount + bonus;

    if (totalDisplay) {
      totalDisplay.textContent = `£${currentAmount.toFixed(0)}`;
    }
    if (giftAidBonusDisplay) {
      if (isGiftAid) {
        giftAidBonusDisplay.textContent = `Charity receives £${charityReceives.toFixed(2)} at no extra cost to you! (+£${bonus.toFixed(2)} Gift Aid)`;
      } else {
        giftAidBonusDisplay.textContent = `Tick the box above to add 25% free Gift Aid (£${(currentAmount * 0.25).toFixed(2)}) from the UK Government!`;
      }
    }
  }

  amountBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      amountBtns.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      const val = parseFloat(btn.dataset.amount);
      if (!isNaN(val)) {
        currentAmount = val;
        if (customInput) customInput.value = '';
        updateDisplays();
      }
    });
  });

  if (customInput) {
    customInput.addEventListener('input', () => {
      amountBtns.forEach(b => b.classList.remove('selected'));
      const val = parseFloat(customInput.value);
      currentAmount = isNaN(val) || val <= 0 ? 0 : val;
      updateDisplays();
    });
  }

  if (giftAidCheckbox) {
    giftAidCheckbox.addEventListener('change', updateDisplays);
  }

  updateDisplays();
}

/* Pledge Calculator for Campaign - Accessible £20 starter tier */
function initPledgeCalculator() {
  const pledgeBtns = document.querySelectorAll('.pledge-amount-btn');
  const pledgeInput = document.querySelector('#pledge-amount-input');
  const pledgeSummary = document.querySelector('#pledge-summary-display');

  if (!pledgeBtns.length && !pledgeInput) return;

  let pledgeVal = 20; // Reconsidered accessible starter amount!

  function updatePledgeDisplay() {
    if (pledgeSummary) {
      pledgeSummary.textContent = `Pledging £${pledgeVal.toLocaleString('en-GB')}`;
    }
  }

  pledgeBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      pledgeBtns.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      const val = parseFloat(btn.dataset.amount);
      if (!isNaN(val)) {
        pledgeVal = val;
        if (pledgeInput) pledgeInput.value = val;
        updatePledgeDisplay();
      }
    });
  });

  if (pledgeInput) {
    pledgeInput.addEventListener('input', () => {
      pledgeBtns.forEach(b => b.classList.remove('selected'));
      const val = parseFloat(pledgeInput.value);
      pledgeVal = isNaN(val) || val <= 0 ? 0 : val;
      updatePledgeDisplay();
    });
  }

  updatePledgeDisplay();
}

/* One-Click Social Sharing & Copy Link */
function initSocialSharing() {
  const shareButtons = document.querySelectorAll('[data-share]');
  shareButtons.forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      const type = btn.dataset.share;
      const title = document.title;
      const url = window.location.href;
      const text = "Support community ownership of Tunbridge Wells & Rusthall Commons with The Friends charity:";

      if (type === 'native' && navigator.share) {
        try {
          await navigator.share({ title, text, url });
          return;
        } catch (err) {
          // Fallback to copy link
        }
      }

      if (type === 'whatsapp') {
        const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text + ' ' + url)}`;
        window.open(waUrl, '_blank', 'noopener,noreferrer');
      } else if (type === 'facebook') {
        const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        window.open(fbUrl, '_blank', 'noopener,noreferrer');
      } else if (type === 'twitter') {
        const twUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        window.open(twUrl, '_blank', 'noopener,noreferrer');
      } else if (type === 'copy') {
        navigator.clipboard.writeText(url).then(() => {
          showToast('🔗 Link copied to clipboard! Share it with friends and neighbours.');
        }).catch(() => {
          showToast('🔗 ' + url);
        });
      }
    });
  });
}

/* Campaign Progress Animation (Optional / Retained for future campaign milestones) */
function initCampaignProgress() {
  const progressFill = document.querySelector('#campaign-progress-fill');
  if (progressFill) {
    setTimeout(() => {
      progressFill.style.width = '100%';
    }, 300);
  }
}

/* Form Submission Simulator with Toast */
function initFormSimulators() {
  const forms = document.querySelectorAll('form[data-simulate="true"]');
  forms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn ? submitBtn.innerText : 'Submit';
      
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerText = 'Submitting...';
      }

      setTimeout(() => {
        if (submitBtn) {
          submitBtn.innerText = 'Submitted Successfully!';
          submitBtn.style.backgroundColor = 'var(--color-leaf)';
        }

        showToast('Thank you! Your submission has been received.');

        setTimeout(() => {
          form.reset();
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerText = originalText;
            submitBtn.style.backgroundColor = '';
          }
        }, 3000);
      }, 700);
    });
  });
}

function showToast(message) {
  let toast = document.querySelector('#site-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'site-toast';
    toast.style.position = 'fixed';
    toast.style.bottom = '24px';
    toast.style.right = '24px';
    toast.style.backgroundColor = '#16382b';
    toast.style.color = '#ffffff';
    toast.style.padding = '14px 22px';
    toast.style.borderRadius = '8px';
    toast.style.boxShadow = '0 10px 25px rgba(0,0,0,0.25)';
    toast.style.zIndex = '9999';
    toast.style.fontSize = '0.95rem';
    toast.style.fontWeight = '600';
    toast.style.transition = 'all 0.3s ease';
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.style.opacity = '1';
  toast.style.transform = 'translateY(0)';

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
  }, 4000);
}

/* Editorial Review Mode: Highlights all placeholder/draft text needing committee input */
function initEditorialReview() {
  const reviewItems = document.querySelectorAll('.needs-review');
  if (!reviewItems.length) return;

  // Retrieve saved preference or default to active
  const savedState = localStorage.getItem('fotc_review_mode');
  const isActive = savedState === null ? true : savedState === 'true';

  if (isActive) {
    document.body.classList.add('review-mode-active');
  }

  // Create floating indicator bar
  const bar = document.createElement('div');
  bar.className = 'review-toggle-bar';
  bar.setAttribute('role', 'region');
  bar.setAttribute('aria-label', 'Editorial Review Controls');
  bar.innerHTML = `
    <span style="display: flex; align-items: center; gap: 0.4rem;">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
      <strong>Draft Review</strong>
    </span>
    <span class="review-toggle-count">${reviewItems.length} items to verify</span>
    <button type="button" class="review-toggle-btn" id="toggle-review-mode">
      ${document.body.classList.contains('review-mode-active') ? 'Hide Highlights' : 'Show Highlights'}
    </button>
  `;

  document.body.appendChild(bar);

  const toggleBtn = bar.querySelector('#toggle-review-mode');
  toggleBtn.addEventListener('click', () => {
    const willBeActive = !document.body.classList.contains('review-mode-active');
    document.body.classList.toggle('review-mode-active', willBeActive);
    localStorage.setItem('fotc_review_mode', willBeActive);
    toggleBtn.textContent = willBeActive ? 'Hide Highlights' : 'Show Highlights';
    showToast(willBeActive ? 'Editorial Highlights Visible' : 'Editorial Highlights Hidden (Clean View)');
  });
}

/* Direct Debit Popup Window Handler for GoCardless */
function initDirectDebitPopups() {
  const directDebitLinks = document.querySelectorAll('a[href*="pay.gocardless.com"], .js-gocardless-popup');
  
  directDebitLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (!href || href.startsWith('#')) return;

      const width = Math.min(600, window.innerWidth - 40);
      const height = Math.min(780, window.innerHeight - 40);
      const left = Math.round(window.screenX + (window.outerWidth - width) / 2);
      const top = Math.round(window.screenY + (window.outerHeight - height) / 2);

      const windowFeatures = `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes,status=no,toolbar=no,menubar=no,location=yes`;

      const popup = window.open(href, 'GoCardlessDirectDebit', windowFeatures);

      if (popup && !popup.closed) {
        e.preventDefault();
        popup.focus();
      }
    });
  });
}
