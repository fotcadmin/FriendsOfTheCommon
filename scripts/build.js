#!/usr/bin/env node

/**
 * Static Build Script for Friends of the Commons
 * Reads structured CMS content from data/pages/ and compiles it into static HTML.
 * Synchronises:
 *  - data/pages/home.json     -> index.html
 *  - data/pages/campaign.json -> campaign.html
 *  - data/pages/about.json    -> about.html
 *  - data/pages/support.json  -> support-us.html
 *  - data/pages/contact.json  -> contact.html
 */

const fs = require('fs');
const path = require('path');
const { minifyAll } = require('./minify');

const rootDir = path.resolve(__dirname, '..');

// -------------------------------------------------------------
// 1. HOMEPAGE COMPILER (index.html)
// -------------------------------------------------------------
function buildHomePage() {
  const dataPath = path.join(rootDir, 'data/pages/home.json');
  const targetPath = path.join(rootDir, 'index.html');

  if (!fs.existsSync(dataPath) || !fs.existsSync(targetPath)) {
    console.warn('[Build] Notice: Skipping home page (missing file).');
    return;
  }

  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  let html = fs.readFileSync(targetPath, 'utf8');

  // 1. Announcement Banner
  if (data.announcement) {
    const ann = data.announcement;
    const annPattern = /<!-- Urgent Top Announcement Bar -->[\s\S]*?<\/aside>/;
    if (annPattern.test(html)) {
      if (ann.show === false) {
        html = html.replace(annPattern, '<!-- Urgent Top Announcement Bar -->\n  <aside class="urgent-notice-bar" role="region" aria-label="Campaign Notice" style="display: none;">\n  </aside>');
      } else {
        const tag = ann.tag || 'COMMONS SALE NOTICE';
        const text = ann.text || '';
        const link = ann.link || 'campaign.html#pledge';
        const linkText = ann.link_text || 'Read bid details &amp; pledge support &rarr;';
        
        const newAnn = `<!-- Urgent Top Announcement Bar -->
  <aside class="urgent-notice-bar" role="region" aria-label="Campaign Notice">
    <div class="urgent-notice-content">
      <span class="urgent-tag">${tag}</span>
      <span class="urgent-text">${text}</span>
      <a href="${link}" class="urgent-link">${linkText}</a>
    </div>
  </aside>`;
        html = html.replace(annPattern, newAnn);
      }
    }
  }

  // 2. Hero Section
  if (data.hero) {
    const hero = data.hero;
    const heroSectionPattern = /<!-- 1\. Place & Charity First -->[\s\S]*?<section class="hero-nt hero-with-bg"[\s\S]*?<\/section>/;
    if (heroSectionPattern.test(html)) {
      const heroImg = hero.image || 'assets/images/explore.webp';
      const kicker = hero.kicker || 'Tunbridge Wells &amp; Rusthall Commons';
      const headline = hero.headline || 'Protecting our historic commons for everyone, forever.';
      const primaryCtaText = hero.primary_cta_text || 'Pledge to Buy the Commons &rarr;';
      const primaryCtaUrl = hero.primary_cta_url || 'campaign.html#pledge';
      const secondaryCtaText = hero.secondary_cta_text || 'Plan Your Visit';
      const secondaryCtaUrl = hero.secondary_cta_url || '#visit';

      const newHero = `<!-- 1. Place & Charity First -->
    <section class="hero-nt hero-with-bg" id="overview" aria-labelledby="hero-title">
      <img class="hero-bg-img" src="${heroImg}"
        alt="Two walkers and a dog crossing open grassland in front of the ancient sandstone outcrops of Tunbridge Wells Common"
        width="1024" height="433" fetchpriority="high" decoding="async">
      <div class="container hero-grid">
        <div class="hero-text-col">
          <span class="hero-kicker">${kicker}</span>
          <h1 class="hero-title" id="hero-title">${headline}</h1>
          <div class="hero-actions">
            <a href="${primaryCtaUrl}" class="btn btn-terracotta btn-lg">${primaryCtaText}</a>
            <a href="${secondaryCtaUrl}" class="btn btn-secondary btn-lg">${secondaryCtaText}</a>
          </div>
        </div>
      </div>
    </section>`;
      html = html.replace(heroSectionPattern, newHero);
    }
  }

  // 3. Mission & Purpose Section
  if (data.mission_purpose) {
    const mp = data.mission_purpose;
    const mpSectionPattern = /<!-- Mission & Purpose -->[\s\S]*?<\/section>/;
    if (mpSectionPattern.test(html)) {
      const missionHeading = mp.mission_heading || 'Our Mission';
      const missionText = mp.mission_text || 'Working with the community for the preservation, enhancement and enjoyment of the Commons.';
      const purposeHeading = mp.purpose_heading || 'Our Purpose';
      const purposeText = mp.purpose_text || 'To protect the Commons, celebrate their place in our community, and safeguard their future.';

      const newMp = `<!-- Mission & Purpose -->
    <section class="band band--parchment" aria-label="Mission and purpose">
      <div class="container">
        <div class="mission-editorial reveal-fade-up">
          <div class="mission-statement">
            <h2 class="band-kicker">${missionHeading}</h2>
            <p class="mission-statement-text">
              ${missionText}
            </p>
          </div>
          <div class="mission-statement">
            <h2 class="band-kicker">${purposeHeading}</h2>
            <p class="mission-statement-text">
              ${purposeText}
            </p>
          </div>
        </div>
      </div>
    </section>`;
      html = html.replace(mpSectionPattern, newMp);
    }
  }

  // 4. Visiting Section
  if (data.visiting && Array.isArray(data.visiting.items)) {
    const v = data.visiting;
    const visitPattern = /<!-- Visit -->[\s\S]*?<section class="band band--sage" id="visit"[\s\S]*?(?=\s*<details class="nt-accordion-item visit-accordion" id="explore-rocks">)/;
    if (visitPattern.test(html)) {
      const itemsMarkup = v.items.map(it => `          <article class="visit-item">
            <h3 class="visit-item-title">${it.title}</h3>
            <p>${it.description}</p>
          </article>`).join('\n');

      const newVisit = `<!-- Visit -->
    <section class="band band--sage" id="visit" aria-labelledby="visit-heading">
      <div class="container">
        <header class="band-header reveal-fade-up">
          <span class="band-kicker">${v.kicker || 'Plan your visit'}</span>
          <h2 class="band-title" id="visit-heading">${v.heading || 'Visiting the Commons'}</h2>
        </header>

        <div class="visit-strip reveal-stagger">
${itemsMarkup}
        </div>

        <div class="action-row">
          <a href="${v.secondary_btn_url || 'explore.html#interactive-map'}" class="btn btn-secondary">${v.secondary_btn_text || 'Open Map Viewer'}</a>
        </div>`;
      html = html.replace(visitPattern, newVisit);
    }
  }

  // 5. Campaign Story Chapter
  if (data.campaign_story) {
    const cs = data.campaign_story;
    const csPattern = /<section class="band band--parchment campaign-story" id="philosophy"[\s\S]*?(?=\s*(?:<section class="container accordion-wrapper" aria-label="Campaign details">|<!-- 4\. Support chapter -->))/;
    if (csPattern.test(html)) {
      const newCs = `<section class="band band--parchment campaign-story" id="philosophy" aria-labelledby="campaign-heading">
      <div class="container">
        <header class="campaign-story-head reveal-fade-up">
          <span class="band-kicker">${cs.kicker || 'The Campaign'}</span>
          <h2 class="campaign-story-title" id="campaign-heading">${cs.title}</h2>
        </header>

        <div class="campaign-story-body reveal-fade-up">
          <div class="campaign-story-text">
            <p class="campaign-story-lede">
              <strong>The freehold of Tunbridge Wells and Rusthall Commons is currently on the open market.</strong>
              For over a century, the 1890 Tunbridge Wells Improvement Act has guaranteed public access, but ownership
              still matters. A private freeholder may have different priorities from those of the local community,
              particularly around access, land use, maintenance and the commercial use of the estate.
            </p>
            <p>
              Our philosophy is simple: this landscape belongs to everyone. We want people from near and far to walk
              beneath the towering Wellington Rocks, spot rare heathland wildlife, and feel the freedom that only
              ancient common land provides.
            </p>
            <p>
              <strong>Why community ownership matters:</strong> Community ownership would give the Friends a long-term
              opportunity to keep the freehold in charitable ownership, with decisions guided by the protection and
              enjoyment of the Commons rather than commercial interests.
            </p>
            <p>
              As a charity, the Friends are accountable to our members, trustees and the Charity Commission, with the
              protection, enhancement and public enjoyment of the Commons at the heart of our work. Over 3,000 residents
              and supporters have already pledged their backing.
            </p>
          </div>
          <blockquote class="pull-quote">
            <p>${cs.quote || 'This landscape belongs to everyone.'}</p>
            <footer class="pull-quote-credit">${cs.quote_credit || 'Over 3,000 residents and supporters have pledged their backing'}</footer>
          </blockquote>
        </div>

        <div class="cta-bar reveal-fade-up">
          <p class="cta-bar-text">${cs.cta_note || 'Reported by The Guardian, BBC News and The Telegraph.'}</p>
          <div class="action-row action-row--tight">
            <a href="${cs.primary_cta_url || 'campaign.html#pledge'}" class="btn btn-terracotta btn-lg">${cs.primary_cta_text || 'Make a Pledge'}</a>
            <a href="${cs.secondary_cta_url || 'campaign.html'}" class="btn btn-ghost-light btn-lg">${cs.secondary_cta_text || 'Read More &rarr;'}</a>
          </div>
        </div>
      </div>
    </section>`;
      html = html.replace(csPattern, newCs);
    }
  }

  // 6. Support Chapter
  if (data.support_chapter) {
    const sc = data.support_chapter;
    const scPattern = /<!-- 4\. Support chapter -->[\s\S]*?<section class="band band--forest support-chapter" id="pledge-section"[\s\S]*?(?=\s*<\/main>)/;
    if (scPattern.test(html)) {
      const newSc = `<!-- 4. Support chapter -->
    <section class="band band--forest support-chapter" id="pledge-section" aria-labelledby="support-heading">
      <div class="container">
        <header class="support-head reveal-fade-up">
          <span class="band-kicker">${sc.kicker || 'Support Our Work'}</span>
          <h2 class="band-title" id="support-heading">${sc.title}</h2>
          <p class="band-lede">
            ${sc.lede}
          </p>
        </header>
        <div class="action-row reveal-fade-up">
          <a href="${sc.primary_cta_url || 'support-us.html'}" class="btn btn-terracotta btn-lg">${sc.primary_cta_text || 'Ways to Support Us &rarr;'}</a>
          <a href="${sc.secondary_cta_url || 'campaign.html#pledge'}" class="btn btn-light btn-lg">${sc.secondary_cta_text || 'Make a Pledge &rarr;'}</a>
        </div>
      </div>
    </section>`;
      html = html.replace(scPattern, newSc);
    }
  }

  fs.writeFileSync(targetPath, html, 'utf8');
  console.log('[Build] Successfully compiled data/pages/home.json into index.html');
}

// -------------------------------------------------------------
// 2. CAMPAIGN PAGE COMPILER (campaign.html)
// -------------------------------------------------------------
function buildCampaignPage() {
  const dataPath = path.join(rootDir, 'data/pages/campaign.json');
  const targetPath = path.join(rootDir, 'campaign.html');

  if (!fs.existsSync(dataPath) || !fs.existsSync(targetPath)) {
    console.warn('[Build] Notice: Skipping campaign page (missing file).');
    return;
  }

  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  let html = fs.readFileSync(targetPath, 'utf8');

  // 1. Masthead
  const kicker = data.masthead_kicker || (data.masthead && data.masthead.kicker) || 'Community Land Purchase';
  const title = data.masthead_title || (data.masthead && data.masthead.title) || 'Securing the Freehold for Everyone, Forever';
  const lead = data.masthead_lead || (data.masthead && data.masthead.lead) || '';

  const mastheadPattern = /<section class="subpage-masthead">[\s\S]*?<\/section>/;
  if (mastheadPattern.test(html)) {
    const newMasthead = `<section class="subpage-masthead">
      <div class="subpage-masthead-inner">
        <span class="masthead-kicker">${kicker}</span>
        <h1 class="masthead-title">${title}</h1>
        <p class="masthead-lead">${lead}</p>
      </div>
    </section>`;
    html = html.replace(mastheadPattern, newMasthead);
  }

  // 2. Video Spotlight
  if (data.video_spotlight) {
    const v = data.video_spotlight;
    const headline = v.headline || v.title || 'Watch the Community Movement in Action';
    const description = v.description || v.text || '';
    const videoUrl = v.video_url || 'https://www.facebook.com/plugins/video.php?height=314&href=https%3A%2F%2Fwww.facebook.com%2Freel%2F1489325402778662%2F&show_text=false&width=560&t=0';
    const fbUrl = v.fb_url || 'https://www.facebook.com/reel/1489325402778662/';

    const videoPattern = /<!-- Featured Campaign Video Spotlight -->[\s\S]*?<div class="campaign-video-spotlight reveal-fade-up"[\s\S]*?(?=\s*<div class="editorial-callout reveal-fade-up" style="margin-bottom: 3rem;">)/;
    if (videoPattern.test(html)) {
      const newVideo = `<!-- Featured Campaign Video Spotlight -->
        <div class="campaign-video-spotlight reveal-fade-up" style="margin-bottom: 2.5rem;">
          <div class="sharp-card"
            style="background: #ffffff; border: 1px solid var(--nt-border); overflow: hidden; box-shadow: var(--shadow-sm);">
            <div class="campaign-video-grid">
              <div class="video-responsive-wrap">
                <iframe
                  src="${videoUrl}"
                  width="560" height="314" style="border:none;overflow:hidden" scrolling="no" frameborder="0"
                  allowfullscreen="true"
                  allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                  allowFullScreen="true" title="Friends of the Commons Community Video" loading="lazy">
                </iframe>
              </div>
              <div class="campaign-video-text">
                <h2
                  style="font-family: var(--font-serif); font-size: 1.6rem; color: var(--nt-green-deep); line-height: 1.25; margin-bottom: 0.75rem;">
                  ${headline}
                </h2>
                <p style="font-size: 0.95rem; line-height: 1.6; color: var(--nt-charcoal); margin-bottom: 1.5rem;">
                  ${description}
                </p>
                <div style="display: flex; gap: 0.75rem; flex-wrap: wrap; align-items: center;">
                  <a href="#pledge" class="btn btn-terracotta btn-sm">Make a Pledge &rarr;</a>
                  <a href="${fbUrl}" target="_blank" rel="noopener"
                    class="btn btn-secondary btn-sm" style="font-size: 0.85rem;">
                    Watch on Facebook ↗
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
`;
      html = html.replace(videoPattern, newVideo);
    }
  }

  // 3. Safeguards Editorial Callout
  if (data.safeguards) {
    const s = data.safeguards;
    const tag = s.tag || 'Community Safeguards';
    const heading = s.heading || 'Why community ownership matters';
    const lead = s.lead || s.left_col || '';
    const risksHeading = s.risks_heading || 'The Risks of Private Equity Acquisition';
    const risks = s.risks || [];
    const risksHtml = risks.map(r => `                <li><strong>${r.title}:</strong> ${r.description}</li>`).join('\n');
    const solution = (s.solution || s.right_col || '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    const v = s.video || {};
    const videoSrc = v.src || 'https://drive.google.com/file/d/1AMjsrXkYSvRvTKI4PPOgF5C6gdJfkOxn/preview';
    const videoKicker = v.kicker || '';
    const videoTitle = v.title || 'Video Message from Mike Martin MP';
    const videoNote = v.note || 'Tunbridge Wells Borough Council (TWBC) and our local MP support the community purchase bid.';

    const safeguardsPattern = /<div class="editorial-callout reveal-fade-up" style="margin-bottom: 3rem;">[\s\S]*?(?=\s*<!-- Community March Photo Showcase -->)/;
    if (safeguardsPattern.test(html)) {
      const kickerMarkup = videoKicker ? `<span class="portrait-video-kicker">${videoKicker}</span>\n                  ` : '';
      const newSafeguards = `<div class="editorial-callout reveal-fade-up" style="margin-bottom: 3rem;">
          <div class="community-ownership-grid">
            <div class="community-ownership-narrative">
              <span class="editorial-tag">${tag}</span>
              <h2 class="editorial-heading">${heading}</h2>

              <p class="ownership-lead">
                ${lead}
              </p>

              <h3 class="ownership-subheading">${risksHeading}</h3>
              <ul class="ownership-risks-list">
${risksHtml}
              </ul>

              <div class="community-solution-box">
                <p>
                  <strong>The Community Solution:</strong> ${solution}
                </p>
              </div>
            </div>

            <div class="community-ownership-media">
              <aside class="portrait-video-card video-card" aria-label="Video message from Mike Martin MP">
                <div class="portrait-video-frame video-wrapper" id="mike-martin-video-frame" style="position: relative; background: #1b382b; display: flex; align-items: center; justify-content: center; cursor: pointer;">
                  <button type="button" class="video-facade-btn" aria-label="Play video message from Mike Martin MP" style="background: none; border: none; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 0.75rem; color: #ffffff; padding: 1rem; text-align: center;">
                    <span style="width: 64px; height: 64px; border-radius: 50%; background: var(--nt-terracotta, #a8422b); display: inline-flex; align-items: center; justify-content: center; box-shadow: 0 4px 14px rgba(0,0,0,0.4);">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                    </span>
                    <span style="font-size: 0.95rem; font-weight: 600; text-shadow: 0 1px 3px rgba(0,0,0,0.8);">Play Video Message</span>
                  </button>
                  <template id="mike-martin-iframe-tmpl">
                    <iframe src="${videoSrc}" allow="autoplay; fullscreen"
                      allowfullscreen loading="lazy" sandbox="allow-scripts allow-same-origin allow-presentation"
                      title="${videoTitle}" style="position: absolute; top:0; left:0; width:100%; height:100%; border:0;"></iframe>
                  </template>
                </div>
                <div class="portrait-video-caption">
                  ${kickerMarkup}<h3 class="portrait-video-title">${videoTitle}</h3>
                  <p class="portrait-video-note">${videoNote}</p>
                </div>
              </aside>
            </div>
          </div>
        </div>
`;
      html = html.replace(safeguardsPattern, newSafeguards);
    }
  }

  // 4. Showcase Intro Header
  if (data.march_showcase) {
    const sc = data.march_showcase;
    const showcasePattern = /<!-- Community March Photo Showcase -->[\s\S]*?<div class="section-intro-header reveal-fade-up" id="community-voices">[\s\S]*?(?=\s*<div class="march-gallery-grid reveal-stagger">)/;
    if (showcasePattern.test(html)) {
      const newShowcase = `<!-- Community March Photo Showcase -->
        <div class="section-intro-header reveal-fade-up" id="community-voices">
          <span class="section-kicker">${sc.kicker || 'Town-Wide Solidarity'}</span>
          <h2 class="section-title">${sc.title || 'March for the Commons: 21 March 2026'}</h2>
          <p style="color: var(--nt-muted); margin-top: 0.5rem; font-size: 1rem;">
            ${sc.lead || ''}
          </p>
        </div>
`;
      html = html.replace(showcasePattern, newShowcase);
    }
  }

  // 5. Pledge Counts Box
  if (data.pledge_counts) {
    const pc = data.pledge_counts;
    const pledgePattern = /<div class="pledge-counts-card"[\s\S]*?(?=\s*<\/div>\s*<!-- Live Tally Form Embed)/;
    if (pledgePattern.test(html)) {
      const points = pc.bullet_points || pc.points || [];
      const pointsList = points.map(pt => `<li>${pt}</li>`).join('\n                ');
      const email = pc.email_address || pc.contact_email || 'johnspbarber@gmail.com';
      const emailLead = pc.email_lead || pc.contact_note || 'Prefer to pledge by email? Contact';

      const newPledge = `<div class="pledge-counts-card"
              style="margin-top: 1.25rem; padding: 1.25rem 1.5rem; background: var(--nt-sand-bg); border: 1px solid var(--nt-border); border-left: 4px solid var(--nt-green-deep); border-radius: 6px;">
              <h3
                style="font-family: var(--font-serif); font-size: 1.25rem; color: var(--nt-green-deep); margin-bottom: 0.4rem;">
                ${pc.box_title || 'Why Every Pledge Counts'}</h3>
              <p style="color: var(--nt-charcoal); font-size: 0.95rem; line-height: 1.55; margin-bottom: 0.85rem;">
                ${pc.box_lead || pc.box_description || ''}
              </p>
              <ul class="clean-list"
                style="font-size: 0.92rem; color: var(--nt-charcoal); margin: 0 0 0.85rem 0; padding-left: 1.2rem; display: flex; flex-direction: column; gap: 0.35rem;">
                ${pointsList}
              </ul>
              <div
                style="font-size: 0.88rem; color: var(--nt-muted); border-top: 1px solid var(--nt-border-subtle); padding-top: 0.65rem;">
                ${emailLead} <a href="mailto:${email}"
                  style="color: var(--nt-green-deep); font-weight: 600; text-decoration: underline;">${email}</a>
              </div>
            </div>`;
      html = html.replace(pledgePattern, newPledge);
    }
  }

  fs.writeFileSync(targetPath, html, 'utf8');
  console.log('[Build] Successfully compiled data/pages/campaign.json into campaign.html');
}

// -------------------------------------------------------------
// 3. ABOUT PAGE COMPILER (about.html)
// -------------------------------------------------------------
function buildAboutPage() {
  const dataPath = path.join(rootDir, 'data/pages/about.json');
  const targetPath = path.join(rootDir, 'about.html');

  if (!fs.existsSync(dataPath) || !fs.existsSync(targetPath)) {
    console.warn('[Build] Notice: Skipping about page (missing file).');
    return;
  }

  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  let html = fs.readFileSync(targetPath, 'utf8');

  // 1. Masthead
  const kicker = data.masthead_kicker || 'Our Heritage &amp; Mission';
  const title = data.masthead_title || 'Caring for the Commons Since 1991';
  const lead = data.masthead_lead || '';

  const mastheadPattern = /<section class="subpage-masthead">[\s\S]*?<\/section>/;
  if (mastheadPattern.test(html)) {
    const newMasthead = `<section class="subpage-masthead">
      <div class="subpage-masthead-inner">
        <span class="masthead-kicker">${kicker}</span>
        <h1 class="masthead-title">${title}</h1>
        <p class="masthead-lead">${lead}</p>
      </div>
    </section>`;
    html = html.replace(mastheadPattern, newMasthead);
  }

  // 2. Founding Purpose
  if (data.founding_purpose) {
    const fp = data.founding_purpose;
    const heading = fp.heading || fp.quote || '';
    const text = fp.text || fp.description || '';

    const fpPattern = /<!-- Mission Statement & Founding Purpose -->[\s\S]*?<\/section>/;
    if (fpPattern.test(html)) {
      const newFp = `<!-- Mission Statement & Founding Purpose -->
    <section style="padding: 3.5rem 0 2rem 0;">
      <div class="container">
        <div class="editorial-callout" style="margin-bottom: 2rem;">
          <span class="editorial-tag">${fp.tag || 'Our Founding Purpose'}</span>
          <h2 class="editorial-heading">
            ${heading}
          </h2>
          <p style="color: var(--nt-muted); font-size: 1.05rem; line-height: 1.7; margin-top: 1rem;">
            ${text}
          </p>
        </div>
      </div>
    </section>`;
      html = html.replace(fpPattern, newFp);
    }
  }

  // 3. Objectives Section Intro
  if (data.objectives) {
    const os = data.objectives;
    const osPattern = /<!-- The Charitable Objectives of the (?:Association|Charity) \(Constitutional Purposes\) -->[\s\S]*?<div class="section-intro-header reveal-fade-up">[\s\S]*?(?=\s*<div class="objects-grid reveal-stagger">)/;
    if (osPattern.test(html)) {
      const newOs = `<!-- The Charitable Objectives of the Charity (Constitutional Purposes) -->
    <section class="objects-section" id="objects">
      <div class="container">
        <div class="section-intro-header reveal-fade-up">
          <span class="section-kicker">${os.kicker || 'Charity Constitution &bull; Governance'}</span>
          <h2 class="section-title">${os.title || 'The Charitable Objectives of the Charity'}</h2>
          <p style="color: var(--nt-muted); margin-top: 0.5rem; font-size: 1.05rem; max-width: 820px;">
            ${os.intro || os.description || ''}
          </p>
        </div>
`;
      html = html.replace(osPattern, newOs);
    }
  }

  fs.writeFileSync(targetPath, html, 'utf8');
  console.log('[Build] Successfully compiled data/pages/about.json into about.html');
}

// -------------------------------------------------------------
// 4. SUPPORT PAGE COMPILER (support-us.html)
// -------------------------------------------------------------
function buildSupportPage() {
  const dataPath = path.join(rootDir, 'data/pages/support.json');
  const targetPath = path.join(rootDir, 'support-us.html');

  if (!fs.existsSync(dataPath) || !fs.existsSync(targetPath)) {
    console.warn('[Build] Notice: Skipping support page (missing file).');
    return;
  }

  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  let html = fs.readFileSync(targetPath, 'utf8');

  // 1. Masthead & Hero Feature Visual Banner
  const kicker = data.masthead_kicker || 'Get Involved';
  const title = data.masthead_title || 'Support Our Work';
  const lead = data.masthead_lead || '';
  const heroImg = (data.hero_image && data.hero_image.src) ? data.hero_image.src : 'assets/images/commons-high-weald-view.webp';
  const heroMobileImg = (data.hero_image && data.hero_image.mobile_src) ? data.hero_image.mobile_src : 'assets/images/commons-high-weald-view-mobile.webp';
  const heroAlt = (data.hero_image && data.hero_image.alt) ? data.hero_image.alt : 'Tunbridge Wells and Rusthall Commons scenic view';

  const mastheadPattern = /<section class="subpage-masthead">[\s\S]*?\s*(?=(?:<!-- Pillar 1: Membership -->|<section id="membership"))/i;
  if (mastheadPattern.test(html)) {
    const newMasthead = `<section class="subpage-masthead">
      <div class="subpage-masthead-inner">
        <span class="masthead-kicker">${kicker}</span>
        <h1 class="masthead-title">${title}</h1>
        <p class="masthead-lead">${lead}</p>
      </div>
    </section>

    <!-- Editorial photo anchor -->
    <div class="photo-break-fullwidth support-hero-photo">
      <picture>
        <source media="(max-width: 640px)" srcset="${heroMobileImg}" type="image/webp">
        <img src="${heroImg}" alt="${heroAlt}" width="1100" height="380" fetchpriority="high" decoding="async">
      </picture>
    </div>

    `;
    html = html.replace(mastheadPattern, newMasthead);
  }

  // 2. Offline Banking Card (BACS / Cheque)
  if (data.membership && data.membership.bacs_notice) {
    const bn = data.membership.bacs_notice;
    const bcPattern = /<div class="offline-banking-card">[\s\S]*?(?=\s*<\/div>\s*<!-- What Your Membership Supports -->)/;
    if (bcPattern.test(html)) {
      const newBc = `<div class="offline-banking-card">
            <h3>${bn.heading || 'Prefer to Join by Bank Transfer or Cheque?'}</h3>
            <p>
              ${bn.intro || 'We also welcome annual memberships paid directly via online banking, standing order, or posted cheque.'}
            </p>
            <div class="offline-banking-grid">
              <div>
                <strong>Bank Transfer (BACS / Standing Order):</strong><br>
                Bank: ${bn.bank_name || 'NatWest'}<br>
                Account Name: ${bn.account_name || 'Friends of Tunbridge Wells and Rusthall Commons'}<br>
                Sort Code: <strong>${bn.sort_code || '55-70-13'}</strong><br>
                Account Number: <strong>${bn.account_number || '01028774'}</strong><br>
                Reference: <em>${bn.reference || 'Your Surname + “MEM”'}</em>
              </div>
              <div>
                <strong>By Cheque:</strong><br>
                Payable to: <em>${bn.cheque_payable || 'Friends of Tunbridge Wells and Rusthall Commons'}</em><br>
                Please send to:<br>
                ${(bn.cheque_address || 'Chris Gurr\n45 Erskine Park Road, Rusthall\nTunbridge Wells, TN4 8UT').replace(/\n/g, '<br>\n                ')}
              </div>
            </div>

            <div
              style="margin-top: 1.5rem; padding: 1.15rem 1.25rem; background: var(--nt-sand-bg); border-left: 3px solid var(--nt-green-deep); border-radius: 4px; display: flex; flex-direction: column; gap: 0.65rem;">
              <p style="margin: 0; font-size: 0.95rem; color: var(--nt-charcoal); line-height: 1.55;">
                <strong>Paying by direct bank transfer?</strong><br>
                ${bn.callout_text || 'Please let us know your details so we can allocate your membership and register your Gift Aid.'}
              </p>
              <div>
                <a href="${bn.callout_btn_url || 'membership-details.html'}" class="btn btn-primary btn-sm">${bn.callout_btn_label || 'Submit Membership Details &rarr;'}</a>
              </div>
            </div>
          </div>`;
      html = html.replace(bcPattern, newBc);
    }
  }

  // 3. Pillar 2: Donations & Gift Aid (2-Column Grid + Standalone Legacy Banner)
  if (data.donations) {
    const d = data.donations;
    const dKicker = d.kicker || 'Charitable Giving';
    const dTitle = d.title || 'Make a Donation';
    const dIntro = d.intro || 'One-off and regular donations fund urgent storm repairs, pond restoration, and wildlife surveys. If you are a UK taxpayer, Gift Aid increases the value of your donation by 25% at no extra cost to you.';

    const og = d.online_giving || {};
    const ogKicker = og.kicker || 'Online Donation';
    const ogTitle = og.title || 'Donate Online (Card & Direct Debit)';
    const ogText = og.text || 'We are currently setting up our secure GoCardless online donation facility for seamless one-off gifts and regular monthly contributions. This option will be live shortly.';
    const ogStatus = og.status_label || 'Online Giving Launching Shortly';

    const dg = d.direct_giving || {};
    const dgKicker = dg.kicker || 'Direct Giving';
    const dgTitle = dg.title || 'Bank Transfer or Cheque';
    const dgIntro = dg.intro || 'If you prefer not to donate online, you can transfer funds directly to our charity account or post a cheque.';
    const dgBank = dg.bank_name || 'NatWest';
    const dgAccName = dg.account_name || 'Friends of Tunbridge Wells and Rusthall Commons';
    const dgSort = dg.sort_code || '55-70-13';
    const dgAccNo = dg.account_number || '01028774';
    const dgRef = dg.reference || 'Your Surname + “DONATION”';
    const dgPayable = dg.cheque_payable || 'Friends of Tunbridge Wells and Rusthall Commons';
    const dgAddress = (dg.cheque_address || 'Chris Gurr\n45 Erskine Park Road, Rusthall\nTunbridge Wells, TN4 8UT').replace(/\n/g, '<br>\n                  ');
    const dgGiftAid = dg.gift_aid_note || 'Gift Aid on Bank Transfers: If you are a UK taxpayer and would like us to claim 25% Gift Aid, please submit your details via our <a href="membership-details.html" style="color: var(--nt-green-deep); font-weight: 600; text-decoration: underline;">membership details form</a> or <a href="contact.html" style="color: var(--nt-green-deep); font-weight: 600; text-decoration: underline;">contact page</a>.';

    const leg = d.legacy_banner || {};
    const legKicker = leg.kicker || 'Lasting Conservation';
    const legTitle = leg.title || 'Legacy Giving in Your Will';
    const legImg = leg.image || 'assets/images/happy-valley.webp';
    const legAlt = leg.alt || 'Ancient sandstone gorge, mossy crags and woodland canopy in Happy Valley on Tunbridge Wells Common';
    const legText = leg.text || 'A gift in your will ensures future generations will experience the wild beauty and quiet solace of the Commons. Even a modest legacy creates a lasting conservation endowment for ancient trees, sandstone rocks, and footpaths.';
    const legBtnText = (leg.btn_text || 'Read Legacy Guide & Solicitor Wording →').replace(/→|&rarr;/, '').trim();
    const legBtnUrl = leg.btn_url || 'legacy.html';

    const donatePattern = /<!-- Pillar 2: Donations & Gift Aid -->[\s\S]*?(?=\s*<!-- Pillar 3: Volunteering -->)/;
    if (donatePattern.test(html)) {
      const newDonate = `<!-- Pillar 2: Donations & Gift Aid -->
    <section id="donate" style="padding: 3.5rem 0; background: #ffffff; border-bottom: 1px solid var(--nt-border);">
      <div class="container">
        <div class="section-intro-header reveal-fade-up">
          <span class="section-kicker">${dKicker}</span>
          <h2 class="section-title">${dTitle}</h2>
          <p style="color: var(--nt-muted); margin-top: 0.5rem; font-size: 1.05rem; max-width: 800px;">
            ${dIntro}
          </p>
        </div>

        <!-- 2-Column Donation Grid -->
        <div class="grid-2 reveal-stagger" style="align-items: stretch; gap: 2rem;">
          <!-- Column 1: Online Giving / GoCardless Placeholder -->
          <div class="sharp-card reveal-fade-up"
            style="background: var(--nt-sand-bg); border: 2px dashed var(--nt-border); padding: 2rem; display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              <span class="sharp-card-tag"
                style="color: var(--nt-ochre); margin-bottom: 0.35rem; display: inline-block;">${ogKicker}</span>
              <h3 style="font-family: var(--font-serif); font-size: 1.4rem; color: var(--nt-charcoal); margin: 0 0 0.75rem 0;">
                ${ogTitle}
              </h3>
              <p style="color: var(--nt-charcoal); font-size: 0.95rem; line-height: 1.6; margin-bottom: 1.5rem;">
                ${ogText}
              </p>
            </div>
            <div>
              <div
                style="padding: 0.85rem 1.25rem; background: rgba(0,0,0,0.04); border-radius: 4px; display: inline-flex; align-items: center; gap: 0.6rem; color: var(--nt-muted); font-size: 0.9rem; font-weight: 600;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="opacity: 0.7;">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                ${ogStatus}
              </div>
            </div>
          </div>

          <!-- Column 2: Direct Giving via Bank Transfer or Cheque -->
          <div class="offline-banking-card reveal-fade-up"
            style="margin-top: 0; display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              <span class="sharp-card-tag"
                style="color: var(--nt-green-deep); margin-bottom: 0.35rem; display: inline-block;">${dgKicker}</span>
              <h3 style="font-family: var(--font-serif); font-size: 1.4rem; color: var(--nt-charcoal); margin: 0 0 0.75rem 0;">
                ${dgTitle}
              </h3>
              <p style="color: var(--nt-muted); font-size: 0.95rem; line-height: 1.6; margin-bottom: 1rem;">
                ${dgIntro}
              </p>
              <div class="offline-banking-grid">
                <div>
                  <strong>Bank Transfer (BACS / Standing Order):</strong><br>
                  Bank: ${dgBank}<br>
                  Account Name: ${dgAccName}<br>
                  Sort Code: <strong>${dgSort}</strong><br>
                  Account Number: <strong>${dgAccNo}</strong><br>
                  Reference: <em>${dgRef}</em>
                </div>
                <div>
                  <strong>By Cheque:</strong><br>
                  Payable to: <em>${dgPayable}</em><br>
                  Please send to:<br>
                  ${dgAddress}
                </div>
              </div>
            </div>

            <div
              style="font-size: 0.85rem; color: var(--nt-muted); line-height: 1.5; border-top: 1px solid var(--nt-border); padding-top: 0.75rem; margin-top: 1rem;">
              ${dgGiftAid}
            </div>
          </div>
        </div>

        <!-- Standalone Horizontal Legacy Highlight Banner -->
        <div class="sharp-card reveal-fade-up"
          style="background: var(--nt-surface-alt); overflow: hidden; border: 1px solid var(--nt-border); box-shadow: var(--shadow-sm); margin-top: 2.5rem;">
          <div class="legacy-highlight-grid">
            <div style="position: relative; min-height: 220px; overflow: hidden;">
              <img src="${legImg}"
                alt="${legAlt}"
                width="500" height="300"
                style="width: 100%; height: 100%; object-fit: cover; display: block;" loading="lazy">
            </div>
            <div style="padding: 2rem 2.25rem; display: flex; flex-direction: column; justify-content: center; gap: 0.75rem;">
              <span class="sharp-card-tag" style="color: var(--nt-green-deep); margin-bottom: 0;">${legKicker}</span>
              <h3 style="font-family: var(--font-serif); font-size: 1.45rem; color: var(--nt-charcoal); margin: 0;">
                ${legTitle}
              </h3>
              <p style="color: var(--nt-muted); font-size: 0.95rem; line-height: 1.6; margin: 0; max-width: 65ch;">
                ${legText}
              </p>
              <div style="margin-top: 0.5rem;">
                <a href="${legBtnUrl}" class="btn btn-secondary btn-sm">${legBtnText} &rarr;</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
`;
      html = html.replace(donatePattern, newDonate);
    }
  }

  // 4. Campaign Pledge Panel
  if (data.pledge_panel) {
    const pp = data.pledge_panel;
    const cpPattern = /<!-- Pillar 4: Pledging to The Commons Campaign -->[\s\S]*?<div class="pledge-panel reveal-fade-up">[\s\S]*?(?=\s*<\/div>\s*<\/section>\s*<\/main>)/;
    if (cpPattern.test(html)) {
      const countsCard = pp.counts_card || {};
      const cardTitle = countsCard.title || 'Why Every Pledge Counts';
      const cardLead = countsCard.lead || 'Every pledge—large or small—shows that our local community stands together to protect the Commons for future generations.';
      const bulletPoints = countsCard.bullet_points || [
        'Completely confidential • No upfront payment',
        'Pledges of any amount make a genuine difference',
        'Direct email option with Trustee John Barber'
      ];
      const bulletItems = bulletPoints.map(b => `<li style="color: #ffffff;">${b}</li>`).join('\n                ');
      const emailLead = countsCard.email_lead || 'Prefer to pledge by email? Contact';
      const email = countsCard.email_address || 'johnspbarber@gmail.com';
      const tagHtml = pp.tag ? `<span class="urgent-tag" style="background: rgba(0,0,0,0.3); margin-bottom: 0.75rem;">${pp.tag}</span>\n              ` : '';

      const newCp = `<!-- Pillar 4: Pledging to The Commons Campaign -->
    <section id="pledge-info" style="padding: 3.5rem 0; background: var(--nt-surface-alt);">
      <div class="container">
        <div class="pledge-panel reveal-fade-up">
          <div class="pledge-panel-grid">
            <div class="reveal-from-left">
              ${tagHtml}<h2>${pp.title || 'Pledge to the Community Purchase Bid'}</h2>
              <p>
                ${pp.lead || 'A pledge is a confidential promise of financial support to help our registered charity acquire the freehold of Tunbridge Wells and Rusthall Commons. Funds will only be requested when the community sale is legally agreed.'}
              </p>
              <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
                <a href="${pp.btn_pledge_url || 'campaign.html#pledge'}" class="btn btn-terracotta btn-lg">${pp.btn_pledge_text || 'Make a Campaign Pledge Now &rarr;'}</a>
                <a href="${pp.btn_faq_url || 'campaign.html'}" class="btn btn-secondary btn-lg"
                  style="background: rgba(255,255,255,0.15); border-color: rgba(255,255,255,0.4); color: #ffffff;">${pp.btn_faq_text || 'Read Full Sale FAQs'}</a>
              </div>
            </div>
            <div class="pledge-panel-card reveal-from-right">
              <h3 style="font-family: var(--font-serif); font-size: 1.35rem; color: #ffffff; margin-bottom: 0.75rem;">
                ${cardTitle}</h3>
              <p style="color: #dbeae0; font-size: 0.95rem; line-height: 1.55; margin-bottom: 1.25rem;">
                ${cardLead}
              </p>
              <ul class="clean-list" style="font-size: 0.95rem; color: #ffffff; margin-bottom: 0.75rem;">
                ${bulletItems}
              </ul>
              <div
                style="font-size: 0.82rem; color: #dbeae0; border-top: 1px solid rgba(255,255,255,0.2); padding-top: 0.65rem;">
                ${emailLead} <a href="mailto:${email}"
                  style="color: #ffffff; font-weight: 600; text-decoration: underline;">${email}</a>
              </div>
            </div>
          </div>
        </div>`;
      html = html.replace(cpPattern, newCp);
    }
  }

  fs.writeFileSync(targetPath, html, 'utf8');
  console.log('[Build] Successfully compiled data/pages/support.json into support-us.html');
}

// -------------------------------------------------------------
// 5. CONTACT PAGE COMPILER (contact.html)
// -------------------------------------------------------------
function buildContactPage() {
  const dataPath = path.join(rootDir, 'data/pages/contact.json');
  const targetPath = path.join(rootDir, 'contact.html');

  if (!fs.existsSync(dataPath) || !fs.existsSync(targetPath)) {
    console.warn('[Build] Notice: Skipping contact page (missing file).');
    return;
  }

  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  let html = fs.readFileSync(targetPath, 'utf8');

  // 1. Masthead
  const kicker = data.masthead_kicker || 'Get in Touch';
  const title = data.masthead_title || 'Contact the Friends';
  const lead = data.masthead_lead || '';

  const mastheadPattern = /<section class="subpage-masthead">[\s\S]*?<\/section>/;
  if (mastheadPattern.test(html)) {
    const newMasthead = `<section class="subpage-masthead">
      <div class="subpage-masthead-inner">
        <span class="masthead-kicker">${kicker}</span>
        <h1 class="masthead-title">${title}</h1>
        <p class="masthead-lead">${lead}</p>
      </div>
    </section>`;
    html = html.replace(mastheadPattern, newMasthead);
  }

  // 2. Committee Contacts List
  if (data.committee_card && data.committee_card.contacts) {
    const contacts = data.committee_card.contacts;
    const contactsHtml = contacts.map(c => {
      let info = '';
      if (c.email) {
        info = `Email: <a href="mailto:${c.email}" style="color: var(--nt-green-deep); text-decoration: underline;">${c.email}</a>`;
      } else if (c.details) {
        info = c.details;
      }
      return `                <li>
                  <div>
                    <strong>${c.role}:</strong>${c.name ? ' ' + c.name : ''}<br>
                    <span style="font-size: 0.88rem; color: var(--nt-muted);">${info}</span>
                  </div>
                </li>`;
    }).join('\n');

    const committeePattern = /<ul class="clean-list" style="margin-bottom: 1.5rem; display: flex; flex-direction: column; gap: 1rem;">[\s\S]*?<\/ul>/;
    if (committeePattern.test(html)) {
      html = html.replace(committeePattern, `<ul class="clean-list" style="margin-bottom: 1.5rem; display: flex; flex-direction: column; gap: 1rem;">\n${contactsHtml}\n              </ul>`);
    }
  }

  // 3. Privacy Notice
  if (data.privacy_notice) {
    const p = data.privacy_notice;
    const privacyPattern = /<!-- Privacy & UK GDPR Notice -->[\s\S]*?<div id="privacy" class="sharp-card"[\s\S]*?(?=\s*<\/div>\s*<!-- Right Column: Interactive Tally Contact Form -->)/;
    if (privacyPattern.test(html)) {
      const newPrivacy = `<!-- Privacy & UK GDPR Notice -->
            <div id="privacy" class="sharp-card"
              style="padding: 1.5rem 1.75rem; background: var(--nt-sand-bg); border-left: 4px solid var(--nt-green-deep);">
              <h3
                style="font-family: var(--font-serif); font-size: 1.1rem; color: var(--nt-green-deep); margin: 0 0 0.5rem 0;">
                ${p.heading || 'Privacy &amp; Data Protection (UK GDPR)'}
              </h3>
              <p style="font-size: 0.88rem; color: var(--nt-charcoal); line-height: 1.6; margin: 0;">
                ${p.text}
              </p>
            </div>
          `;
      html = html.replace(privacyPattern, newPrivacy);
    }
  }

  fs.writeFileSync(targetPath, html, 'utf8');
  console.log('[Build] Successfully compiled data/pages/contact.json into contact.html');
}

// -------------------------------------------------------------
// EXECUTE ALL PAGE COMPILERS
// -------------------------------------------------------------
function buildAll() {
  console.log('--- Building Friends of the Commons Static Pages ---');
  buildHomePage();
  buildCampaignPage();
  buildAboutPage();
  buildSupportPage();
  buildContactPage();
  minifyAll();
  console.log('--- Build Finished Successfully ---');
}

buildAll();
