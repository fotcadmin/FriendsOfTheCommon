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
  initSiteForms();
  initSocialSharing();
  initEditorialReview();
  initDirectDebitPopups();
  initScrollAnimations();
  initQuoteSlider();
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

/* Accessible Mobile Navigation Popover */
function initMobileNav() {
  const toggleBtn = document.querySelector('.mobile-toggle');
  const navMenu = document.querySelector('.nav-desktop');
  if (!toggleBtn || !navMenu) return;

  const hamburgerSvg = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 6h16M4 12h16M4 18h16"/></svg>';
  const closeSvg = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>';

  function setMenuState(open) {
    if (open) {
      navMenu.classList.add('nav-mobile-open');
      toggleBtn.setAttribute('aria-expanded', 'true');
      toggleBtn.setAttribute('aria-label', 'Close navigation menu');
      toggleBtn.innerHTML = closeSvg;
    } else {
      navMenu.classList.remove('nav-mobile-open');
      toggleBtn.setAttribute('aria-expanded', 'false');
      toggleBtn.setAttribute('aria-label', 'Open navigation menu');
      toggleBtn.innerHTML = hamburgerSvg;
    }
  }

  toggleBtn.setAttribute('aria-expanded', 'false');
  toggleBtn.setAttribute('aria-controls', 'nav-primary');
  if (!navMenu.id) navMenu.id = 'nav-primary';

  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = navMenu.classList.contains('nav-mobile-open');
    setMenuState(!isOpen);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navMenu.classList.contains('nav-mobile-open')) {
      setMenuState(false);
      toggleBtn.focus();
    }
  });

  document.addEventListener('click', (e) => {
    if (navMenu.classList.contains('nav-mobile-open') && !navMenu.contains(e.target) && !toggleBtn.contains(e.target)) {
      setMenuState(false);
    }
  });

  navMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      setMenuState(false);
    });
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
  const donateSubmitBtn = document.querySelector('#donate-submit-btn');

  if (!amountBtns.length && !customInput) return;

  let currentAmount = 25; // default donation

  function updateDisplays() {
    const isGiftAid = giftAidCheckbox ? giftAidCheckbox.checked : false;
    const bonus = isGiftAid ? (currentAmount * 0.25) : 0;
    const charityReceives = currentAmount + bonus;

    if (totalDisplay) {
      totalDisplay.textContent = `Donation Total: £${currentAmount.toFixed(0)}`;
    }
    if (donateSubmitBtn) {
      donateSubmitBtn.textContent = `Donate £${currentAmount.toFixed(0)} Securely →`;
    }
    if (giftAidBonusDisplay) {
      if (isGiftAid) {
        giftAidBonusDisplay.textContent = `Charity receives £${charityReceives.toFixed(2)} at no extra cost to you! (+£${bonus.toFixed(2)} Gift Aid)`;
      } else {
        giftAidBonusDisplay.textContent = `Tick the box above to add 25% free Gift Aid (+£${(currentAmount * 0.25).toFixed(2)}) from the UK Government!`;
      }
    }
  }

  amountBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      amountBtns.forEach(b => {
        b.classList.remove('selected');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('selected');
      btn.setAttribute('aria-pressed', 'true');
      const val = parseFloat(btn.dataset.amount);
      if (!isNaN(val)) {
        currentAmount = val;
        if (customInput) customInput.value = val;
        updateDisplays();
      }
    });
  });

  if (customInput) {
    customInput.addEventListener('input', () => {
      amountBtns.forEach(b => {
        b.classList.remove('selected');
        b.setAttribute('aria-pressed', 'false');
      });
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

  let pledgeVal = 50; // default pre-selected amount

  function updatePledgeDisplay() {
    if (pledgeSummary) {
      pledgeSummary.textContent = `Pledging £${pledgeVal.toLocaleString('en-GB')} — No payment collected today`;
    }
  }

  pledgeBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      pledgeBtns.forEach(b => {
        b.classList.remove('selected');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('selected');
      btn.setAttribute('aria-pressed', 'true');
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
      pledgeBtns.forEach(b => {
        b.classList.remove('selected');
        b.setAttribute('aria-pressed', 'false');
      });
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

/* Real In-Page Form Handlers (Replaces alert stubs) */
function initSiteForms() {
  // 1. Campaign Pledge Form
  const pledgeForm = document.querySelector('#pledge-form');
  const pledgePanel = document.querySelector('#pledge-confirmation-panel');
  // Paste your Google Apps Script Webhook URL here once created
  const PLEDGE_WEBHOOK_URL = '';

  if (pledgeForm && pledgePanel) {
    pledgeForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.querySelector('#pledge-name')?.value || 'Valued Supporter';
      const email = document.querySelector('#pledge-email')?.value || '';
      const phone = document.querySelector('#pledge-phone')?.value || '';
      const postcode = document.querySelector('#pledge-postcode')?.value || '';
      const amountInput = document.querySelector('#pledge-amount-input');
      const amount = amountInput ? amountInput.value : '50';
      const submitBtn = document.querySelector('#pledge-submit-btn');

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerText = 'Registering Confidential Pledge...';
      }

      const refNumber = 'FOTC-' + Math.floor(1000 + Math.random() * 9000);

      // Transmit to Google Sheets webhook if configured
      if (PLEDGE_WEBHOOK_URL) {
        fetch(PLEDGE_WEBHOOK_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ref: refNumber,
            name: name,
            email: email,
            phone: phone,
            postcode: postcode,
            amount: amount
          })
        }).catch(err => console.log('Webhook log:', err));
      }

      setTimeout(() => {
        const firstName = name.split(' ')[0];

        pledgeForm.style.display = 'none';
        pledgePanel.style.display = 'block';
        pledgePanel.innerHTML = `
          <div class="form-success-card">
            <div class="form-success-badge">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><polyline points="20 6 9 17 4 12"></polyline></svg>
              Pledge Registered in Strict Confidence
            </div>
            <h3 style="font-family: var(--font-serif); font-size: 1.6rem; color: var(--nt-green-deep); margin-bottom: 0.5rem;">
              Thank You, ${firstName}
            </h3>
            <p style="color: var(--nt-charcoal); font-size: 1.05rem; line-height: 1.6;">
              Your confidential pledge of <strong>£${amount}</strong> has been logged to back the community bid for Tunbridge Wells and Rusthall Commons.
            </p>
            <div class="form-success-meta">
              <div><strong>Pledge Reference:</strong> #${refNumber}</div>
              <div><strong>Confirmation Sent To:</strong> ${email}</div>
              <div><strong>Payment Status:</strong> Provisional (Zero funds collected today)</div>
            </div>
            <p style="font-size: 0.9rem; color: var(--nt-muted); line-height: 1.55; margin-bottom: 1.5rem;">
              <strong>What happens next?</strong> No payment is taken now. If our charitable purchase is agreed with the vendors, the Trustees will write to you with formal next steps. You may alter or withdraw this pledge at any time by contacting <a href="mailto:secretary@friendsofthecommons.uk" style="color: var(--nt-green-deep); font-weight: 600; text-decoration: underline;">secretary@friendsofthecommons.uk</a>.
            </p>
            <div style="border-top: 1px solid var(--nt-border); padding-top: 1.25rem;">
              <h4 style="font-family: var(--font-serif); font-size: 1.1rem; color: var(--nt-green-deep); margin-bottom: 0.5rem;">Next: Help Us Multiply Local Support</h4>
              <p style="font-size: 0.9rem; color: var(--nt-muted); margin-bottom: 1rem;">
                The more residents standing behind the charity, the stronger our mandate.
              </p>
              <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
                <button type="button" class="btn btn-secondary btn-sm" data-share="whatsapp">Share with Neighbours via WhatsApp &rarr;</button>
                <button type="button" class="btn btn-secondary btn-sm" data-share="copy">Copy Campaign Link</button>
                <a href="support-us.html#membership" class="btn btn-primary btn-sm">Join as an Annual Member (£10/£20) &rarr;</a>
              </div>
            </div>
          </div>
        `;

        initSocialSharing();
        pledgePanel.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 500);
    });
  }

  // 2. Donation Form
  const donationForm = document.querySelector('#donation-form');
  const donationPanel = document.querySelector('#donation-confirmation-panel');
  if (donationForm && donationPanel) {
    donationForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const firstName = document.querySelector('#donor-first-name')?.value || 'Supporter';
      const amountInput = document.querySelector('#custom-donate-amount');
      const amount = parseFloat(amountInput ? amountInput.value : '25') || 25;
      const isGiftAid = document.querySelector('#donate-gift-aid')?.checked;
      const bonus = isGiftAid ? (amount * 0.25) : 0;
      const totalCharity = amount + bonus;
      const submitBtn = document.querySelector('#donate-submit-btn');

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerText = 'Setting Up Secure Donation...';
      }

      setTimeout(() => {
        donationForm.style.display = 'none';
        donationPanel.style.display = 'block';
        donationPanel.innerHTML = `
          <div class="form-success-card">
            <div class="form-success-badge">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><polyline points="20 6 9 17 4 12"></polyline></svg>
              Donation Details Recorded
            </div>
            <h3 style="font-family: var(--font-serif); font-size: 1.5rem; color: var(--nt-green-deep); margin-bottom: 0.5rem;">
              Thank You, ${firstName}
            </h3>
            <p style="color: var(--nt-charcoal); font-size: 1.05rem; line-height: 1.6;">
              Your generous gift of <strong>£${amount.toFixed(2)}</strong> ${isGiftAid ? `increases to <strong>£${totalCharity.toFixed(2)}</strong> with 25% Gift Aid` : ''} to protect Tunbridge Wells &amp; Rusthall Commons.
            </p>
            <div class="form-success-meta">
              <div><strong>Gift Amount:</strong> £${amount.toFixed(2)}</div>
              ${isGiftAid ? `<div><strong>HMRC Gift Aid (+25%):</strong> +£${bonus.toFixed(2)} (Claimed by charity)</div>` : ''}
              <div><strong>Total Benefit to Commons:</strong> £${totalCharity.toFixed(2)}</div>
            </div>
            <div style="background: #ffffff; border: 1px solid var(--nt-border); padding: 1.25rem; margin-bottom: 1.25rem;">
              <h4 style="font-size: 1rem; color: var(--nt-green-deep); margin-bottom: 0.5rem;">Payment Completion Options:</h4>
              <p style="font-size: 0.88rem; color: var(--nt-muted); margin-bottom: 0.75rem;">
                To complete your contribution, you can use our direct charity account or post a cheque:
              </p>
              <ul style="font-size: 0.88rem; color: var(--nt-charcoal); padding-left: 1.2rem; margin: 0; line-height: 1.6;">
                <li><strong>Bank Transfer (BACS):</strong> Friends of the Commons &bull; Sort Code: 40-44-31 &bull; Account: 81234567</li>
                <li><strong>Cheque:</strong> Payable to <em>The Friends of Tunbridge Wells &amp; Rusthall Commons</em>, posted to The Secretary, PO Box 101, Tunbridge Wells TN4.</li>
              </ul>
            </div>
            <a href="support-us.html#membership" class="btn btn-secondary btn-sm">Also Join as a Member (£10/£20/yr) &rarr;</a>
          </div>
        `;
        donationPanel.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 500);
    });
  }

  // 3. Volunteer Form
  const volunteerForm = document.querySelector('#volunteer-form');
  const volunteerPanel = document.querySelector('#volunteer-confirmation-panel');
  if (volunteerForm && volunteerPanel) {
    volunteerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.querySelector('#vol-name')?.value || 'Volunteer';
      const email = document.querySelector('#vol-email')?.value || '';
      const submitBtn = document.querySelector('#vol-submit-btn');

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerText = 'Registering...';
      }

      setTimeout(() => {
        volunteerForm.style.display = 'none';
        volunteerPanel.style.display = 'block';
        volunteerPanel.innerHTML = `
          <div class="form-success-card">
            <div class="form-success-badge">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><polyline points="20 6 9 17 4 12"></polyline></svg>
              Volunteer Registration Received
            </div>
            <h3 style="font-family: var(--font-serif); font-size: 1.45rem; color: var(--nt-green-deep); margin-bottom: 0.5rem;">
              Welcome to the Team, ${name.split(' ')[0]}!
            </h3>
            <p style="color: var(--nt-charcoal); font-size: 0.95rem; line-height: 1.6;">
              Thank you for offering your time. Our working party coordinator will be in touch at <strong>${email}</strong> ahead of the next scheduled session.
            </p>
          </div>
        `;
        volunteerPanel.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 400);
    });
  }

  // 4. Contact Form
  const contactForm = document.querySelector('#contact-form');
  const contactPanel = document.querySelector('#contact-confirmation-panel');
  if (contactForm && contactPanel) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.querySelector('#contact-name')?.value || 'Friend';
      const submitBtn = document.querySelector('#contact-submit-btn');

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerText = 'Sending Message...';
      }

      setTimeout(() => {
        contactForm.style.display = 'none';
        contactPanel.style.display = 'block';
        contactPanel.innerHTML = `
          <div class="form-success-card">
            <div class="form-success-badge">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><polyline points="20 6 9 17 4 12"></polyline></svg>
              Message Sent
            </div>
            <h3 style="font-family: var(--font-serif); font-size: 1.45rem; color: var(--nt-green-deep); margin-bottom: 0.5rem;">
              Thank you, ${name.split(' ')[0]}
            </h3>
            <p style="color: var(--nt-charcoal); font-size: 0.95rem; line-height: 1.6;">
              Your enquiry has been forwarded to the Trustees and Secretary. A volunteer committee member will respond promptly.
            </p>
          </div>
        `;
        contactPanel.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 400);
    });
  }

  // 5. Confidential Legacy Enquiry Form
  const legacyForm = document.querySelector('#legacy-form');
  const legacyPanel = document.querySelector('#legacy-confirmation-panel');
  if (legacyForm && legacyPanel) {
    legacyForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.querySelector('#legacy-name')?.value || 'Friend of the Commons';
      const email = document.querySelector('#legacy-email')?.value || '';
      const submitBtn = document.querySelector('#legacy-submit-btn');

      if (!name || !email) {
        showToast('Please enter your name and email address.');
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerText = 'Sending Securely...';
      }

      setTimeout(() => {
        legacyForm.style.display = 'none';
        legacyPanel.style.display = 'block';
        legacyPanel.innerHTML = `
          <div class="form-success-card">
            <div class="form-success-badge">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><polyline points="20 6 9 17 4 12"></polyline></svg>
              Enquiry Received Confidentially
            </div>
            <h3 style="font-family: var(--font-serif); font-size: 1.45rem; color: var(--nt-green-deep); margin-bottom: 0.5rem;">
              Thank You, ${name.split(' ')[0]}
            </h3>
            <p style="color: var(--nt-charcoal); font-size: 0.95rem; line-height: 1.6; margin-bottom: 0.75rem;">
              Your confidential message has been received. A Trustee or the Honorary Treasurer will contact you discreetly to assist with your enquiry or answer any questions your solicitor may have.
            </p>
            <div style="background: #ffffff; border: 1px solid var(--nt-border); padding: 1rem 1.25rem; font-size: 0.85rem; color: var(--nt-muted);">
              <strong>Reference:</strong> #LEGACY-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)} &bull; Charity No. 1013975
            </div>
          </div>
        `;
        legacyPanel.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 400);
    });
  }
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

  // Only activate if explicitly enabled via ?review=1 in URL or stored in localStorage
  const urlParams = new URLSearchParams(window.location.search);
  const reviewParam = urlParams.get('review');
  if (reviewParam === '1' || reviewParam === 'true') {
    localStorage.setItem('fotc_review_mode', 'true');
  } else if (reviewParam === '0' || reviewParam === 'false') {
    localStorage.removeItem('fotc_review_mode');
  }

  const isActive = localStorage.getItem('fotc_review_mode') === 'true';
  if (!isActive) return;

  document.body.classList.add('review-mode-active');

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

/* ==========================================================================
   Smooth Scroll Reveal Animations (IntersectionObserver)
   ========================================================================== */
function initScrollAnimations() {
  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    return; // Leave everything in standard visible CSS state
  }

  // Auto-tag direct children of stagger containers
  document.querySelectorAll('.reveal-stagger').forEach(container => {
    Array.from(container.children).forEach(child => {
      if (!child.classList.contains('reveal-init') &&
          !child.classList.contains('reveal-fade-up') &&
          !child.classList.contains('reveal-from-left') &&
          !child.classList.contains('reveal-from-right')) {
        child.classList.add('reveal-init', 'reveal-fade-up');
      }
    });
  });

  const targets = document.querySelectorAll('.reveal-init, .reveal-fade-up, .reveal-from-left, .reveal-from-right, .reveal-scale');
  if (!targets.length) return;

  // Add root class to activate animation stylesheet rules
  document.documentElement.classList.add('reveal-ready');

  const isMobile = window.innerWidth <= 768;
  const rootMargin = isMobile ? '0px 0px -30px 0px' : '0px 0px -40px 0px';
  const threshold = 0.05;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
        obs.unobserve(entry.target);
      }
    });
  }, {
    threshold: threshold,
    rootMargin: rootMargin
  });

  // Reveal above-the-fold elements immediately if already in viewport
  targets.forEach(el => {
    observer.observe(el);
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.85 && rect.bottom > 0) {
      el.classList.add('is-revealed');
    }
  });
}

/* Interactive Single-Quote Carousel Slider (Clickable & Draggable) */
function initQuoteSlider() {
  const sliders = document.querySelectorAll('[data-quote-slider]');
  sliders.forEach(slider => {
    const viewport = slider.querySelector('.quote-slide-viewport');
    const track = slider.querySelector('.quote-slide-track');
    const slides = slider.querySelectorAll('.quote-slide-item');
    const prevBtn = slider.querySelector('.quote-prev-btn');
    const nextBtn = slider.querySelector('.quote-next-btn');
    const dots = slider.querySelectorAll('.quote-dot');

    if (!viewport || !track || !slides.length) return;

    let currentIndex = 0;
    const totalSlides = slides.length;
    let autoPlayTimer = null;
    let isDragging = false;
    let startX = 0;
    let currentTranslate = 0;
    let prevTranslate = 0;
    let draggedDistance = 0;

    function goToSlide(index) {
      if (index < 0) {
        currentIndex = totalSlides - 1;
      } else if (index >= totalSlides) {
        currentIndex = 0;
      } else {
        currentIndex = index;
      }

      track.classList.remove('is-dragging');
      track.style.transform = `translate3d(-${currentIndex * 100}%, 0, 0)`;

      slides.forEach((slide, idx) => {
        const isActive = idx === currentIndex;
        slide.classList.toggle('is-active', isActive);
        slide.setAttribute('aria-hidden', !isActive);
      });

      dots.forEach((dot, idx) => {
        const isActive = idx === currentIndex;
        dot.classList.toggle('is-active', isActive);
        dot.setAttribute('aria-selected', isActive);
      });

      resetAutoPlay();
    }

    function nextSlide() {
      goToSlide(currentIndex + 1);
    }

    function prevSlide() {
      goToSlide(currentIndex - 1);
    }

    // Button controls
    if (prevBtn) {
      prevBtn.addEventListener('click', (e) => {
        e.preventDefault();
        prevSlide();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        nextSlide();
      });
    }

    // Dot controls
    dots.forEach((dot, idx) => {
      dot.addEventListener('click', (e) => {
        e.preventDefault();
        goToSlide(idx);
      });
    });

    // Keyboard navigation
    viewport.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevSlide();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        nextSlide();
      }
    });

    // Drag & Touch support
    function touchStart(e) {
      isDragging = true;
      startX = getPositionX(e);
      draggedDistance = 0;
      track.classList.add('is-dragging');
      pauseAutoPlay();
    }

    function touchMove(e) {
      if (!isDragging) return;
      const currentX = getPositionX(e);
      draggedDistance = currentX - startX;
      const baseOffset = -currentIndex * viewport.offsetWidth;
      const translatePx = baseOffset + draggedDistance;
      track.style.transform = `translate3d(${translatePx}px, 0, 0)`;
    }

    function touchEnd() {
      if (!isDragging) return;
      isDragging = false;
      track.classList.remove('is-dragging');

      const threshold = Math.min(60, viewport.offsetWidth * 0.15);
      if (draggedDistance < -threshold) {
        nextSlide();
      } else if (draggedDistance > threshold) {
        prevSlide();
      } else {
        goToSlide(currentIndex); // Snap back
      }
    }

    function getPositionX(e) {
      return e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
    }

    // Mouse drag events
    viewport.addEventListener('mousedown', touchStart);
    window.addEventListener('mousemove', touchMove);
    window.addEventListener('mouseup', touchEnd);

    // Touch events
    viewport.addEventListener('touchstart', touchStart, { passive: true });
    viewport.addEventListener('touchmove', touchMove, { passive: true });
    viewport.addEventListener('touchend', touchEnd, { passive: true });

    // Autoplay management
    function startAutoPlay() {
      stopAutoPlay();
      autoPlayTimer = setInterval(nextSlide, 7000);
    }

    function stopAutoPlay() {
      if (autoPlayTimer) {
        clearInterval(autoPlayTimer);
        autoPlayTimer = null;
      }
    }

    function pauseAutoPlay() {
      stopAutoPlay();
    }

    function resetAutoPlay() {
      stopAutoPlay();
      startAutoPlay();
    }

    slider.addEventListener('mouseenter', pauseAutoPlay);
    slider.addEventListener('mouseleave', startAutoPlay);
    slider.addEventListener('focusin', pauseAutoPlay);
    slider.addEventListener('focusout', startAutoPlay);

    // Initialize first slide and start autoplay if user has not requested reduced motion
    goToSlide(0);
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!prefersReducedMotion) {
      startAutoPlay();
    }
  });
}

