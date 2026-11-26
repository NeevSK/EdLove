/**
 * Modular Screen Miner
 * Grounded in: docs/architecture/interaction-tree-and-e2e-testing-standard.md
 *
 * Autonomously inspects any rendered DOM scene without hardcoded selectors.
 * Mines identity, accessibility/contrast metrics, forward affordances (spokes),
 * and reverse reconstitution controls.
 */

const DESTRUCTIVE_TERMS = ['delete', 'purge', 'sign out', 'log out', 'clear all', 'reset all', 'remove account'];
const REVERSE_TERMS = ['back', 'cancel', 'close', 'dismiss', 'return', '←', '✕', 'x'];

/**
 * Mines the active screen scene running in Playwright.
 * @param {import('@playwright/test').Page} page
 * @returns {Promise<ScreenInspection>}
 */
export async function mineScreen(page) {
  const inspection = await page.evaluate(
    ({ destructiveTerms, reverseTerms }) => {
      // -------------------------------------------------------------
      // 1. Mine Screen Identity
      // -------------------------------------------------------------
      const url = window.location.href;
      const parsed = new URL(url);
      const pathname = parsed.pathname;
      const search = parsed.search;
      const title = document.title;
      const themeMode =
        document.documentElement.getAttribute('data-mode') ||
        document.documentElement.getAttribute('data-appearance') ||
        'light';

      const activeCapacity =
        document.documentElement.getAttribute('data-capacity') ||
        document.body.getAttribute('data-capacity') ||
        null;

      const hasMain = document.querySelector('main') !== null;
      const hasNav = document.querySelector('nav') !== null;
      const hasHeader = document.querySelector('header') !== null;
      const dialogOpen = document.querySelector('dialog[open], [role="dialog"]') !== null;

      // -------------------------------------------------------------
      // 2. Mine Visual Quality via APCA (WCAG 3.0) & WCAG 2.2 Dual Standard
      // Reference: W3C Silver / AGWG APCA 0.0.98G-4g & WCAG 2.2 Rel-Luminance
      // -------------------------------------------------------------
      const scrollW = document.documentElement.scrollWidth;
      const clientW = window.innerWidth;
      const hasHorizontalOverflow = scrollW > clientW + 2;

      // --- WCAG 2.2 Relative Luminance Standard (Statutory Legal Compliance) ---
      function sRGBChannelToLinear(c255) {
        const c = Math.max(0, Math.min(255, c255)) / 255.0;
        return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      }

      function calcWcag2Luminance(rgb) {
        return (
          0.2126 * sRGBChannelToLinear(rgb.r) +
          0.7152 * sRGBChannelToLinear(rgb.g) +
          0.0722 * sRGBChannelToLinear(rgb.b)
        );
      }

      function calcWcag2Ratio(fg, bg) {
        const l1 = calcWcag2Luminance(fg);
        const l2 = calcWcag2Luminance(bg);
        const lighter = Math.max(l1, l2);
        const darker = Math.min(l1, l2);
        return Math.round(((lighter + 0.05) / (darker + 0.05)) * 100) / 100;
      }

      // --- APCA G-4g Constants (Perceptual Contrast Standard) ---
      const mainTRC = 2.4;
      const sRco = 0.2126729;
      const sGco = 0.7151522;
      const sBco = 0.0721750;
      const normBG = 0.56;
      const normTXT = 0.57;
      const revTXT = 0.62;
      const revBG = 0.65;
      const blkThrs = 0.022;
      const blkClmp = 1.414;
      const scaleBoW = 1.14;
      const scaleWoB = 1.14;
      const loBoWoffset = 0.027;
      const loWoBoffset = 0.027;
      const loClip = 0.001;
      const deltaYmin = 0.0005;

      function parseRgba(colorStr) {
        if (!colorStr) return null;
        const match = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
        if (!match) return null;
        return {
          r: parseInt(match[1], 10),
          g: parseInt(match[2], 10),
          b: parseInt(match[3], 10),
          a: match[4] !== undefined ? parseFloat(match[4]) : 1,
        };
      }

      function alphaBlend(fg, bg) {
        const a = fg.a !== undefined ? fg.a : 1;
        return {
          r: Math.round(fg.r * a + bg.r * (1 - a)),
          g: Math.round(fg.g * a + bg.g * (1 - a)),
          b: Math.round(fg.b * a + bg.b * (1 - a)),
          a: 1,
        };
      }

      function sRGBtoY(rgb) {
        const r = Math.pow(Math.max(0, Math.min(255, rgb.r)) / 255.0, mainTRC);
        const g = Math.pow(Math.max(0, Math.min(255, rgb.g)) / 255.0, mainTRC);
        const b = Math.pow(Math.max(0, Math.min(255, rgb.b)) / 255.0, mainTRC);
        return sRco * r + sGco * g + sBco * b;
      }

      function calcAPCA(txtRgb, bgRgb) {
        let txtY = sRGBtoY(txtRgb);
        let bgY = sRGBtoY(bgRgb);

        if (isNaN(txtY) || isNaN(bgY) || Math.abs(bgY - txtY) < deltaYmin) {
          return 0.0;
        }

        // Soft clamp near absolute black
        if (txtY < blkThrs) txtY += Math.pow(blkThrs - txtY, blkClmp);
        if (bgY < blkThrs) bgY += Math.pow(blkThrs - bgY, blkClmp);

        let SAPC = 0.0;
        if (bgY > txtY) {
          // Dark text on light background (BoW)
          SAPC = (Math.pow(bgY, normBG) - Math.pow(txtY, normTXT)) * scaleBoW;
          SAPC = SAPC < loClip ? 0.0 : SAPC - loBoWoffset;
        } else {
          // Light text on dark background (WoB)
          SAPC = (Math.pow(bgY, revBG) - Math.pow(txtY, revTXT)) * scaleWoB;
          SAPC = SAPC > -loClip ? 0.0 : SAPC + loWoBoffset;
        }

        return Math.round(SAPC * 1000.0) / 10.0;
      }

      // Multi-tier APCA Lightness Contrast thresholds (WCAG 3.0 Bronze, Silver, Gold)
      function getRequiredLcByTier(fontSizePx, fontWeight, isInteractive = false) {
        const isBold = fontWeight >= 600;
        const isLarge = fontSizePx >= 24 || (isBold && fontSizePx >= 18);
        const isMedium = fontSizePx >= 18 || (isBold && fontSizePx >= 14);

        return {
          bronze: isLarge ? 35 : isMedium ? 45 : isInteractive ? 30 : 60,
          silver: isLarge ? 45 : isMedium ? 60 : isInteractive ? 45 : 75,
          gold: isLarge ? 60 : isMedium ? 75 : isInteractive ? 60 : 90,
        };
      }

      const textNodes = Array.from(
        document.querySelectorAll('h1, h2, h3, h4, h5, p, span, button, a, label, li, dt, dd')
      ).filter((el) => {
        const style = window.getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        return (
          rect.width > 0 &&
          rect.height > 0 &&
          style.display !== 'none' &&
          style.visibility !== 'hidden' &&
          style.opacity !== '0' &&
          el.textContent.trim().length > 0 &&
          !el.classList.contains('sr-only')
        );
      });

      let apcaBronzePass = 0;
      let apcaBronzeFail = 0;
      let apcaSilverPass = 0;
      let apcaSilverFail = 0;
      let apcaGoldPass = 0;
      let apcaGoldFail = 0;
      const apcaSamples = [];

      let wcag2Pass = 0;
      let wcag2Fail = 0;
      const wcag2Samples = [];

      for (const el of textNodes.slice(0, 60)) {
        const style = window.getComputedStyle(el);
        const rawFg = parseRgba(style.color);
        if (!rawFg) continue;

        let cur = el;
        let bg = null;
        while (cur && cur !== document.documentElement) {
          const bgStyle = window.getComputedStyle(cur);
          const parsedBg = parseRgba(bgStyle.backgroundColor);
          if (parsedBg && parsedBg.a > 0.1) {
            bg = parsedBg;
            break;
          }
          cur = cur.parentElement;
        }

        const defaultBg =
          themeMode === 'dark'
            ? { r: 18, g: 26, b: 20, a: 1 }
            : { r: 255, g: 255, b: 255, a: 1 };

        const compositeBg = bg ? (bg.a < 1 ? alphaBlend(bg, defaultBg) : bg) : defaultBg;
        const compositeFg = rawFg.a < 1 ? alphaBlend(rawFg, compositeBg) : rawFg;

        // 1. APCA Lightness Contrast (WCAG 3.0 Standard)
        const lc = calcAPCA(compositeFg, compositeBg);
        const absLc = Math.abs(lc);

        const fontSizePx = parseFloat(style.fontSize) || 16;
        const fontWeight =
          parseInt(style.fontWeight, 10) || (style.fontWeight === 'bold' ? 700 : 400);
        const isInteractive = el.tagName === 'BUTTON' || el.tagName === 'A' || el.hasAttribute('role');

        const req = getRequiredLcByTier(fontSizePx, fontWeight, isInteractive);
        const passBronze = absLc >= req.bronze;
        const passSilver = absLc >= req.silver;
        const passGold = absLc >= req.gold;

        if (passBronze) apcaBronzePass++; else apcaBronzeFail++;
        if (passSilver) apcaSilverPass++; else apcaSilverFail++;
        if (passGold) apcaGoldPass++; else apcaGoldFail++;

        // 2. WCAG 2.2 Relative Luminance (Statutory Legal Compliance Standard)
        const wcag2Ratio = calcWcag2Ratio(compositeFg, compositeBg);
        const isLargeWcag2 = fontSizePx >= 24 || (fontWeight >= 700 && fontSizePx >= 18.66);
        const requiredWcag2Ratio = isLargeWcag2 || isInteractive ? 3.0 : 4.5;
        const passWcag2 = wcag2Ratio >= requiredWcag2Ratio;

        if (passWcag2) wcag2Pass++; else wcag2Fail++;

        if (wcag2Samples.length < 6 || !passWcag2) {
          if (wcag2Samples.length < 10) {
            wcag2Samples.push({
              tag: el.tagName.toLowerCase(),
              text: el.textContent.trim().slice(0, 30),
              ratio: `${wcag2Ratio}:1`,
              requiredRatio: `${requiredWcag2Ratio}:1`,
              passWcag2,
              fontSize: `${Math.round(fontSizePx)}px`,
              fontWeight,
            });
          }
        }

        if (apcaSamples.length < 6 || !passSilver) {
          if (apcaSamples.length < 10) {
            apcaSamples.push({
              tag: el.tagName.toLowerCase(),
              text: el.textContent.trim().slice(0, 30),
              lc,
              absLc,
              reqBronze: req.bronze,
              reqSilver: req.silver,
              reqGold: req.gold,
              passBronze,
              passSilver,
              passGold,
              fontSize: `${Math.round(fontSizePx)}px`,
              fontWeight,
              polarity: lc >= 0 ? 'BoW' : 'WoB',
              fg: `rgb(${compositeFg.r},${compositeFg.g},${compositeFg.b})`,
              bg: `rgb(${compositeBg.r},${compositeBg.g},${compositeBg.b})`,
            });
          }
        }
      }

      // -------------------------------------------------------------
      // 3. Accessible Name, Label, Hint & ARIA Integrity Audit
      // -------------------------------------------------------------
      const interactiveNodes = Array.from(
        document.querySelectorAll(
          'button, a[href], input, select, textarea, [role="button"], [role="tab"], [role="radio"], [role="checkbox"]'
        )
      ).filter((el) => {
        const style = window.getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden';
      });

      let missingAccessibleNames = [];
      let placeholderOnlyInputs = [];
      let brokenAriaReferences = [];
      let controlsWithHints = [];
      let hiddenFocusableElements = [];
      let positiveTabIndexElements = [];
      let targetsSubBronze = [];
      let targetsBronzeCount = 0;
      let targetsSilverCount = 0;
      let targetsGoldCount = 0;

      // Duplicate DOM IDs audit (catches runtime portal and component collisions)
      const allIdElements = Array.from(document.querySelectorAll('[id]'));
      const idCounts = new Map();
      const duplicateIds = [];
      for (const el of allIdElements) {
        const id = el.id.trim();
        if (!id || id === 'undefined' || id === 'null') continue;
        const count = (idCounts.get(id) || 0) + 1;
        idCounts.set(id, count);
        if (count === 2) duplicateIds.push(id);
      }

      // Dynamic Live Regions audit
      const liveRegions = Array.from(document.querySelectorAll('[aria-live], [role="status"], [role="alert"]'))
        .map((el) => ({
          tag: el.tagName.toLowerCase(),
          live: el.getAttribute('aria-live') || el.getAttribute('role') || 'polite',
        }));

      for (const el of interactiveNodes) {
        const tag = el.tagName.toLowerCase();
        const role = el.getAttribute('role') || tag;
        const rect = el.getBoundingClientRect();
        const w = Math.round(rect.width);
        const h = Math.round(rect.height);

        if (w >= 48 && h >= 48) targetsGoldCount++;
        else if (w >= 44 && h >= 44) targetsSilverCount++;
        else if (w >= 24 && h >= 24) targetsBronzeCount++;
        else {
          targetsSubBronze.push({
            tag,
            role,
            size: `${w}x${h}px`,
            text: (el.innerText || el.textContent || '').trim().slice(0, 25),
          });
        }

        // Check for aria-hidden on focusable elements (severe accessibility barrier)
        const isAriaHidden = el.getAttribute('aria-hidden') === 'true' || Boolean(el.closest('[aria-hidden="true"]'));
        if (isAriaHidden && el.tabIndex >= 0) {
          hiddenFocusableElements.push({
            tag,
            role,
            selector: el.id ? `#${el.id}` : tag,
            text: (el.innerText || el.textContent || '').trim().slice(0, 25),
          });
        }

        // Check for unnatural positive tabindex (disrupts natural tab navigation sequence)
        const tabIndexAttr = el.getAttribute('tabindex');
        const parsedTabIndex = tabIndexAttr !== null ? parseInt(tabIndexAttr, 10) : 0;
        if (parsedTabIndex > 0) {
          positiveTabIndexElements.push({
            tag,
            tabindex: parsedTabIndex,
            selector: el.id ? `#${el.id}` : tag,
          });
        }

        const ariaLabel = (el.getAttribute('aria-label') || '').trim();
        const ariaLabelledBy = el.getAttribute('aria-labelledby');
        const ariaDescribedBy = el.getAttribute('aria-describedby');
        const title = (el.getAttribute('title') || '').trim();
        const placeholder = (el.getAttribute('placeholder') || '').trim();
        const innerText = (el.innerText || el.textContent || '').trim().replace(/\s+/g, ' ');

        // Check aria-labelledby integrity
        let labelledByText = '';
        if (ariaLabelledBy) {
          const ids = ariaLabelledBy.split(/\s+/);
          for (const id of ids) {
            const refEl = document.getElementById(id);
            if (!refEl) {
              brokenAriaReferences.push({
                element: tag,
                attribute: 'aria-labelledby',
                missingId: id,
              });
            } else {
              labelledByText += ' ' + (refEl.innerText || refEl.textContent || '').trim();
            }
          }
        }

        // Check aria-describedby integrity (hints & descriptions)
        let describedByText = '';
        if (ariaDescribedBy) {
          const ids = ariaDescribedBy.split(/\s+/);
          for (const id of ids) {
            const refEl = document.getElementById(id);
            if (!refEl) {
              brokenAriaReferences.push({
                element: tag,
                attribute: 'aria-describedby',
                missingId: id,
              });
            } else {
              describedByText += ' ' + (refEl.innerText || refEl.textContent || '').trim();
            }
          }
          if (describedByText.trim().length > 0) {
            controlsWithHints.push({
              tag,
              hint: describedByText.trim().slice(0, 40),
              type: 'aria-describedby',
            });
          }
        } else if (title) {
          controlsWithHints.push({
            tag,
            hint: title.slice(0, 40),
            type: 'title',
          });
        }

        let associatedLabel = '';
        if (el.id) {
          const l = document.querySelector(`label[for="${el.id}"]`);
          if (l) associatedLabel = (l.innerText || l.textContent || '').trim();
        }
        if (!associatedLabel) {
          const pl = el.closest('label');
          if (pl) associatedLabel = (pl.innerText || pl.textContent || '').trim();
        }

        const accessibleName = ariaLabel || labelledByText.trim() || associatedLabel || innerText || title;
        if (!accessibleName && role !== 'separator') {
          missingAccessibleNames.push({
            tag,
            role,
            selector: el.id ? `#${el.id}` : el.className ? `.${el.className.split(' ')[0]}` : tag,
          });
        }

        if ((tag === 'input' || tag === 'textarea') && placeholder && !ariaLabel && !labelledByText && !associatedLabel) {
          placeholderOnlyInputs.push({
            tag,
            name: el.getAttribute('name') || el.id || 'unnamed',
            placeholder,
          });
        }
      }

      // -------------------------------------------------------------
      // 4. Mine Interactive Affordance Spokes
      // -------------------------------------------------------------
      const candidateElements = Array.from(
        document.querySelectorAll(
          'button:not([disabled]), a[href], [role="button"]:not([aria-disabled="true"]), [role="switch"]:not([aria-disabled="true"]), [role="radio"]:not([aria-disabled="true"]), [role="tab"]:not([aria-disabled="true"]), input[type="radio"]:not([disabled]), input[type="checkbox"]:not([disabled])'
        )
      );

      const spokes = candidateElements
        .filter((el) => {
          const style = window.getComputedStyle(el);
          const rect = el.getBoundingClientRect();
          if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return false;
          if (rect.width === 0 || rect.height === 0 || el.classList.contains('sr-only')) return false;
          // Ignore anchor skip-links targeting in-page IDs
          if (el.tagName === 'A' && (el.getAttribute('href') || '').startsWith('#')) return false;
          return true;
        })
        .map((el, index) => {
          const text = (el.innerText || el.textContent || '').trim().replace(/\s+/g, ' ');
          const ariaLabel = el.getAttribute('aria-label') || '';
          const href = el.getAttribute('href') || '';
          const role = el.getAttribute('role') || el.tagName.toLowerCase();
          const combined = `${text} ${ariaLabel}`.toLowerCase();
          const rect = el.getBoundingClientRect();

          const inModal = Boolean(el.closest('dialog, [role="dialog"], [data-modal]'));
          const isShell = Boolean(
            el.closest('header, nav[aria-label*="navigation" i], [data-sanctuary-header], .sanctuaryHeader')
          );
          const inMain = Boolean(
            el.closest('main, [role="main"], [data-sanctuary-canvas], [class*="container"]')
          );
          const isMenuToggle = ariaLabel.toLowerCase().includes('menu') || el.hasAttribute('aria-expanded');

          const isDestructive = destructiveTerms.some((t) => combined.includes(t));
          const isReverse =
            !isMenuToggle &&
            (combined.startsWith('back') ||
             combined.startsWith('←') ||
             combined.includes('back to') ||
             ariaLabel.toLowerCase().includes('go back') ||
             ariaLabel.toLowerCase() === 'back' ||
             (inModal &&
               (ariaLabel.toLowerCase().includes('close') ||
                combined === 'close' ||
                combined === 'cancel' ||
                combined === '✕' ||
                combined === 'x')));

          const isInternalLink = href.startsWith('/') && !href.startsWith('//');
          const isFloorNav =
            href === '/self' ||
            href === '/workspace' ||
            href === '/library' ||
            href === '/community' ||
            href === '/settings' ||
            href.startsWith('/workspace') ||
            href.startsWith('/library');

          const isPrimary =
            (el.getAttribute('type') === 'submit' ||
             el.classList.contains('primaryBtn') ||
             el.className.includes('primary') ||
             combined.includes('→') ||
             combined.includes('enter guest house') ||
             combined.includes('choose your perspective') ||
             combined.includes('one more thing')) &&
            !isShell;

          const isModalTrigger =
            el.getAttribute('aria-haspopup') === 'dialog' ||
            el.hasAttribute('data-modal') ||
            combined.includes('open modal') ||
            combined.includes('filter') ||
            combined.includes('floor studio') ||
            combined.includes('preview');

          const isInPageControl =
            role === 'radio' ||
            role === 'tab' ||
            role === 'switch' ||
            el.tagName === 'INPUT' ||
            el.hasAttribute('aria-pressed') ||
            el.hasAttribute('aria-checked') ||
            el.hasAttribute('data-selected') ||
            el.hasAttribute('data-active') ||
            el.classList.contains('tab') ||
            el.className.includes('tab') ||
            el.className.includes('optionCard') ||
            el.className.includes('toggleButton');

          const isFooterLegal =
            href.includes('/privacy') ||
            href.includes('/terms') ||
            href.includes('/guidelines') ||
            href.includes('/delete-account') ||
            href.includes('/status');

          const isLink = Boolean(href || el.tagName === 'A' || el.hasAttribute('to'));

          let spokeType = 'ACTION';
          if (isDestructive) {
            spokeType = 'DESTRUCTIVE_GATE';
          } else if (isReverse) {
            spokeType = 'REVERSE_SPOKE';
          } else if (isFooterLegal) {
            spokeType = 'FOOTER_LINK';
          } else if (isLink) {
            spokeType = isShell ? 'SHELL_NAV' : 'NAVIGATION_SPOKE';
          } else if (isPrimary) {
            spokeType = 'PRIMARY_ACTION';
          } else if (isModalTrigger) {
            spokeType = 'MODAL_TRIGGER';
          } else if (isInPageControl) {
            spokeType = 'IN_PAGE_CONTROL';
          }

          const spokeId = `spoke_${index}_${el.tagName.toLowerCase()}`;
          el.setAttribute('data-spoke-id', spokeId);

          // Extract primary clean text (e.g. before any subtitle or newline)
          const primaryText = text
            .split(/[\n·•]/)[0]
            .replace(/[→←✕↗]/g, '')
            .trim();

          // Build robust locator hint
          let selector = `[data-spoke-id="${spokeId}"]`;
          if (el.id) {
            selector = `#${CSS.escape(el.id)}`;
          } else if (href) {
            selector = `a[href="${href}"]`;
          } else if (ariaLabel) {
            selector = `[aria-label="${CSS.escape(ariaLabel)}"]`;
          } else if (primaryText) {
            selector = `${el.tagName.toLowerCase()}:has-text("${primaryText.slice(0, 30)}")`;
          }

          return {
            id: spokeId,
            tag: el.tagName.toLowerCase(),
            role,
            text: text.slice(0, 50),
            primaryText: primaryText.slice(0, 40),
            ariaLabel: ariaLabel.slice(0, 50),
            href,
            spokeType,
            isShell,
            inMain,
            selector,
            spokeSelector: `[data-spoke-id="${spokeId}"]`,
            rect: {
              x: Math.round(rect.x),
              y: Math.round(rect.y),
              width: Math.round(rect.width),
              height: Math.round(rect.height),
            },
          };
        });

      // Split spokes into forward and reverse sets
      const forwardSpokes = spokes.filter(
        (s) => s.spokeType !== 'DESTRUCTIVE_GATE' && s.spokeType !== 'REVERSE_SPOKE'
      );
      const reverseSpokes = spokes.filter((s) => s.spokeType === 'REVERSE_SPOKE');

      // Rank forward spokes: In-screen controls and primary CTA first, then local navigation, then shell nav
      const spokeRank = (s) => {
        if (s.spokeType === 'PRIMARY_ACTION') return 1;
        if (s.spokeType === 'IN_PAGE_CONTROL') return 2;
        if (s.spokeType === 'MODAL_TRIGGER') return 3;
        if (s.spokeType === 'ACTION' && !s.isShell) return 4;
        if (s.spokeType === 'NAVIGATION_SPOKE' && !s.isShell) return 5;
        if (s.spokeType === 'SHELL_NAV') return 6;
        if (s.spokeType === 'ACTION' && s.isShell) return 7;
        return 8; // FOOTER_LINK
      };

      forwardSpokes.sort((a, b) => spokeRank(a) - spokeRank(b));

      return {
        identity: {
          url,
          pathname,
          search,
          title,
          themeMode,
          activeCapacity,
          landmarks: { hasMain, hasNav, hasHeader, dialogOpen },
        },
        quality: {
          standard: 'WCAG_3_APCA_AND_WCAG_2_DUAL',
          hasHorizontalOverflow,
          wcag2: {
            passed: wcag2Pass,
            failed: wcag2Fail,
            complianceRate: `${Math.round((wcag2Pass / (wcag2Pass + wcag2Fail || 1)) * 100)}%`,
            samples: wcag2Samples,
          },
          apca: {
            bronze: { passed: apcaBronzePass, failed: apcaBronzeFail },
            silver: { passed: apcaSilverPass, failed: apcaSilverFail },
            gold: { passed: apcaGoldPass, failed: apcaGoldFail },
            samples: apcaSamples,
          },
          touchTargets: {
            gold: targetsGoldCount,
            silver: targetsSilverCount,
            bronze: targetsBronzeCount,
            subBronze: targetsSubBronze.length,
            subBronzeSamples: targetsSubBronze.slice(0, 3),
          },
          semantics: {
            missingAccessibleNames: missingAccessibleNames.length,
            missingAccessibleNamesSamples: missingAccessibleNames.slice(0, 3),
            brokenAriaReferences: brokenAriaReferences.length,
            brokenAriaReferencesSamples: brokenAriaReferences.slice(0, 3),
            placeholderOnlyInputs: placeholderOnlyInputs.length,
            placeholderOnlyInputsSamples: placeholderOnlyInputs.slice(0, 3),
            controlsWithHints: controlsWithHints.length,
            hintsSamples: controlsWithHints.slice(0, 3),
            hiddenFocusableElements: hiddenFocusableElements.length,
            hiddenFocusableSamples: hiddenFocusableElements.slice(0, 3),
            positiveTabIndexElements: positiveTabIndexElements.length,
            positiveTabIndexSamples: positiveTabIndexElements.slice(0, 3),
            duplicateIds: duplicateIds.length,
            duplicateIdSamples: duplicateIds.slice(0, 5).map((id) => ({ id, count: idCounts.get(id) })),
            liveRegionsCount: liveRegions.length,
          },
          scorecard: {
            wcag2AA:
              !hasHorizontalOverflow &&
              wcag2Fail === 0 &&
              missingAccessibleNames.length === 0 &&
              hiddenFocusableElements.length === 0 &&
              positiveTabIndexElements.length === 0,
            bronzeTier:
              !hasHorizontalOverflow &&
              apcaBronzeFail === 0 &&
              targetsSubBronze.length === 0 &&
              missingAccessibleNames.length === 0 &&
              brokenAriaReferences.length === 0 &&
              hiddenFocusableElements.length === 0 &&
              positiveTabIndexElements.length === 0,
            silverTier:
              !hasHorizontalOverflow &&
              apcaSilverFail === 0 &&
              targetsSubBronze.length === 0 &&
              placeholderOnlyInputs.length === 0 &&
              duplicateIds.length === 0,
            goldTier:
              !hasHorizontalOverflow &&
              apcaGoldFail === 0 &&
              targetsSubBronze.length === 0 &&
              controlsWithHints.length > 0,
          },
        },
        spokes: {
          all: spokes,
          forward: forwardSpokes,
          reverse: reverseSpokes,
        },
      };
    },
    { destructiveTerms: DESTRUCTIVE_TERMS, reverseTerms: REVERSE_TERMS }
  );

  // -------------------------------------------------------------
  // 5. Run Live W3C Axe-Core Automated Accessibility Audit
  // -------------------------------------------------------------
  let axeSummary = {
    violationsCount: 0,
    violations: [],
    passesCount: 0,
    incompleteCount: 0,
  };

  try {
    const axeMod = await import('@axe-core/playwright');
    const AxeBuilder = axeMod.AxeBuilder || axeMod.default;
    const axeResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();

    axeSummary = {
      violationsCount: axeResults.violations.length,
      violations: axeResults.violations.map((v) => ({
        id: v.id,
        impact: v.impact,
        description: v.description,
        help: v.help,
        nodesCount: v.nodes.length,
        sampleTarget: v.nodes[0]?.target?.[0] || '',
      })),
      passesCount: axeResults.passes.length,
      incompleteCount: axeResults.incomplete.length,
    };
  } catch (err) {
    console.warn('[ScreenMiner] AxeBuilder warning:', err.message);
  }

  inspection.quality.axe = axeSummary;
  return inspection;
}

/**
 * Audits whether an active modal dialog strictly enforces the W3C keyboard focus trap.
 * @param {import('@playwright/test').Page} page
 */
export async function auditModalFocusTrap(page) {
  const dialog = page.locator('dialog[open], [role="dialog"], [aria-modal="true"]').first();
  if ((await dialog.count()) === 0 || !(await dialog.isVisible())) {
    return { hasModal: false, passed: true };
  }

  const result = await page.evaluate(() => {
    const d = document.querySelector('dialog[open], [role="dialog"], [aria-modal="true"]');
    if (!d) return { hasModal: false, passed: true };
    const active = document.activeElement;
    const initialInside = d.contains(active);
    const focusables = Array.from(
      d.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    );
    return {
      hasModal: true,
      initialFocusInside: initialInside,
      focusableCount: focusables.length,
      title: d.getAttribute('aria-label') || d.querySelector('h1, h2, h3')?.textContent || 'Dialog',
    };
  });

  if (!result.hasModal || result.focusableCount <= 1) {
    return { ...result, tabTrapped: true, shiftTabTrapped: true, passed: true };
  }

  // Test Forward Tab Loop
  let tabTrapped = true;
  for (let i = 0; i < result.focusableCount + 2; i++) {
    await page.keyboard.press('Tab');
    const isInside = await page.evaluate(() => {
      const d = document.querySelector('dialog[open], [role="dialog"], [aria-modal="true"]');
      return Boolean(d && d.contains(document.activeElement));
    });
    if (!isInside) {
      tabTrapped = false;
      break;
    }
  }

  // Test Backward Shift+Tab Loop
  let shiftTabTrapped = true;
  for (let i = 0; i < 2; i++) {
    await page.keyboard.press('Shift+Tab');
    const isInside = await page.evaluate(() => {
      const d = document.querySelector('dialog[open], [role="dialog"], [aria-modal="true"]');
      return Boolean(d && d.contains(document.activeElement));
    });
    if (!isInside) {
      shiftTabTrapped = false;
      break;
    }
  }

  return {
    ...result,
    tabTrapped,
    shiftTabTrapped,
    passed: result.initialFocusInside && tabTrapped && shiftTabTrapped,
  };
}

/**
 * Computes a deterministic State Hash for an inspected screen scene.
 * @param {string} pathname
 * @param {string} search
 * @param {number} spokeCount
 * @param {string} mode
 */
export function computeSceneHash(pathname, search, spokeCount, mode) {
  const clean = `${pathname}${search}::spokes=${spokeCount}::mode=${mode || 'default'}`;
  let hash = 0;
  for (let i = 0; i < clean.length; i++) {
    hash = (hash << 5) - hash + clean.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}

// Standalone APCA algorithms for Node testing and external tooling
const nodeMainTRC = 2.4;
const nodeSRco = 0.2126729;
const nodeSGco = 0.7151522;
const nodeSBco = 0.0721750;
const nodeNormBG = 0.56;
const nodeNormTXT = 0.57;
const nodeRevTXT = 0.62;
const nodeRevBG = 0.65;
const nodeBlkThrs = 0.022;
const nodeBlkClmp = 1.414;
const nodeScaleBoW = 1.14;
const nodeScaleWoB = 1.14;
const nodeLoBoWoffset = 0.027;
const nodeLoWoBoffset = 0.027;
const nodeLoClip = 0.001;
const nodeDeltaYmin = 0.0005;

export function sRGBtoY(rgb) {
  const r = Math.pow(Math.max(0, Math.min(255, rgb.r)) / 255.0, nodeMainTRC);
  const g = Math.pow(Math.max(0, Math.min(255, rgb.g)) / 255.0, nodeMainTRC);
  const b = Math.pow(Math.max(0, Math.min(255, rgb.b)) / 255.0, nodeMainTRC);
  return nodeSRco * r + nodeSGco * g + nodeSBco * b;
}

export function calcAPCA(txtRgb, bgRgb) {
  let txtY = sRGBtoY(txtRgb);
  let bgY = sRGBtoY(bgRgb);
  if (isNaN(txtY) || isNaN(bgY) || Math.abs(bgY - txtY) < nodeDeltaYmin) return 0.0;
  if (txtY < nodeBlkThrs) txtY += Math.pow(nodeBlkThrs - txtY, nodeBlkClmp);
  if (bgY < nodeBlkThrs) bgY += Math.pow(nodeBlkThrs - bgY, nodeBlkClmp);
  let SAPC = 0.0;
  if (bgY > txtY) {
    SAPC = (Math.pow(bgY, nodeNormBG) - Math.pow(txtY, nodeNormTXT)) * nodeScaleBoW;
    SAPC = SAPC < nodeLoClip ? 0.0 : SAPC - nodeLoBoWoffset;
  } else {
    SAPC = (Math.pow(bgY, nodeRevBG) - Math.pow(txtY, nodeRevTXT)) * nodeScaleWoB;
    SAPC = SAPC > -nodeLoClip ? 0.0 : SAPC + nodeLoWoBoffset;
  }
  return Math.round(SAPC * 1000.0) / 10.0;
}

export function getRequiredLc(fontSizePx, fontWeight, isInteractive = false) {
  const isBold = fontWeight >= 600;
  if (fontSizePx >= 24 || (isBold && fontSizePx >= 18)) return 45;
  if (fontSizePx >= 18 || (isBold && fontSizePx >= 14)) return 60;
  if (isInteractive && fontSizePx < 14) return 60;
  return 75;
}
