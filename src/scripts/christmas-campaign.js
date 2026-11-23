let cleanupCampaign = () => {};
let activePageRoot = null;
let announcementDismissed = false;

function initializeCampaign() {
  const pageRoot = document.querySelector('main');
  if (!pageRoot || pageRoot === activePageRoot) return;

  cleanupCampaign();
  const controller = new AbortController();
  const announcement = document.querySelector('[data-campaign-announcement]');
  const announcementClose = announcement?.querySelector('[data-campaign-announcement-close]');
  const modal = pageRoot.querySelector('[data-campaign-modal]');
  const previousBodyOverflow = document.body.style.overflow;
  const previousFocus = document.activeElement;
  let modalWasOpened = false;
  let mediaObserver;
  let autoplayAttempted = false;
  let userPaused = false;
  let userPauseIntent = false;
  let userPauseIntentTimer;
  let copyFeedbackTimer;

  activePageRoot = pageRoot;

  function setAnnouncementHidden(hidden) {
    announcementDismissed = hidden;
    if (announcement) announcement.hidden = hidden;
    if (hidden) {
      document.documentElement.style.setProperty('--campaign-announcement-height', '0px');
    } else {
      document.documentElement.style.removeProperty('--campaign-announcement-height');
    }
  }

  setAnnouncementHidden(announcementDismissed);
  announcementClose?.addEventListener('click', () => setAnnouncementHidden(true), {
    signal: controller.signal,
  });

  const campaign = pageRoot.querySelector('#campana-navidad');
  const video = pageRoot.querySelector('[data-campaign-video]');
  const poster = pageRoot.querySelector('[data-campaign-poster]');
  const mediaToggle = pageRoot.querySelector('[data-campaign-media-toggle]');
  const copyCodeButton = pageRoot.querySelector('[data-copy-campaign-code]');
  const copyCodeLabel = copyCodeButton?.querySelector('[data-copy-campaign-label]');
  const copyCodeStatus = pageRoot.querySelector('[data-copy-campaign-status]');

  function attemptAutoplay() {
    if (!video || video.hidden || autoplayAttempted || userPaused) return;
    autoplayAttempted = true;
    if (video.paused) video.play().catch(() => {});
  }

  function noteVideoControlInteraction(event) {
    if (event instanceof KeyboardEvent && ![' ', 'Enter', 'k', 'K'].includes(event.key)) return;
    userPauseIntent = true;
    window.clearTimeout(userPauseIntentTimer);
    userPauseIntentTimer = window.setTimeout(() => {
      userPauseIntent = false;
    }, 1000);
  }

  video?.addEventListener('pointerdown', noteVideoControlInteraction, { signal: controller.signal });
  video?.addEventListener('keydown', noteVideoControlInteraction, { signal: controller.signal });
  video?.addEventListener('pause', () => {
    if (userPauseIntent) userPaused = true;
    userPauseIntent = false;
    window.clearTimeout(userPauseIntentTimer);
  }, { signal: controller.signal });

  async function copyCampaignCode() {
    if (!copyCodeButton || !copyCodeLabel) return;
    window.clearTimeout(copyFeedbackTimer);
    copyCodeButton.classList.remove('is-copied', 'is-error');

    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard API is unavailable.');
      await navigator.clipboard.writeText('MATIAS2026');
      copyCodeButton.classList.add('is-copied');
      copyCodeLabel.textContent = copyCodeButton.dataset.copiedLabel;
      if (copyCodeStatus) copyCodeStatus.textContent = copyCodeButton.dataset.copiedLabel || '';
    } catch (error) {
      console.error('Unable to copy the campaign code.', error);
      copyCodeButton.classList.add('is-error');
      copyCodeLabel.textContent = copyCodeButton.dataset.copyErrorLabel;
      if (copyCodeStatus) copyCodeStatus.textContent = copyCodeButton.dataset.copyErrorLabel || '';
    }

    copyFeedbackTimer = window.setTimeout(() => {
      copyCodeButton.classList.remove('is-copied', 'is-error');
      copyCodeLabel.textContent = copyCodeButton.dataset.copyLabel;
      if (copyCodeStatus) copyCodeStatus.textContent = '';
    }, 2000);
  }

  copyCodeButton?.addEventListener('click', copyCampaignCode, { signal: controller.signal });

  function closeModal({ scrollToCampaign = false } = {}) {
    if (!modal || modal.hidden) return;
    modal.hidden = true;
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = previousBodyOverflow;

    if (scrollToCampaign && campaign) {
      history.replaceState(null, '', `${location.pathname}${location.search}#campana-navidad`);
      campaign.scrollIntoView({
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      });
    } else if (previousFocus instanceof HTMLElement && previousFocus.isConnected) {
      previousFocus.focus();
    }
  }

  function toggleCampaignMedia() {
    if (!video || !poster || !mediaToggle) return;
    const showingVideo = !video.hidden;
    video.hidden = showingVideo;
    poster.hidden = !showingVideo;
    mediaToggle.textContent = showingVideo
      ? mediaToggle.dataset.showVideo
      : mediaToggle.dataset.showPoster;
    if (showingVideo) video.pause();
  }

  if (modal) {
    const closeButton = modal.querySelector('[data-campaign-close]');
    const joinButton = modal.querySelector('[data-campaign-join]');

    modal.hidden = false;
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    closeButton?.focus();
    modalWasOpened = true;

    closeButton?.addEventListener('click', () => closeModal(), { signal: controller.signal });
    modal.addEventListener('click', (event) => {
      if (event.target === modal) closeModal();
    }, { signal: controller.signal });
    joinButton?.addEventListener('click', (event) => {
      event.preventDefault();
      closeModal({ scrollToCampaign: true });
    }, { signal: controller.signal });
    document.addEventListener('keydown', (event) => {
      if (!modal.hidden && event.key === 'Escape') closeModal();
    }, { signal: controller.signal });
  }

  mediaToggle?.addEventListener('click', toggleCampaignMedia, { signal: controller.signal });

  if (campaign && video && 'IntersectionObserver' in window) {
    mediaObserver = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) attemptAutoplay();
    }, { threshold: 0.2 });
    mediaObserver.observe(campaign);
  }

  attemptAutoplay();

  cleanupCampaign = () => {
    controller.abort();
    mediaObserver?.disconnect();
    window.clearTimeout(userPauseIntentTimer);
    window.clearTimeout(copyFeedbackTimer);
    if (modalWasOpened && modal && !modal.hidden) {
      modal.hidden = true;
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = previousBodyOverflow;
    }
    activePageRoot = null;
  };
}

document.addEventListener('astro:before-swap', () => cleanupCampaign());
document.addEventListener('astro:page-load', initializeCampaign);
document.addEventListener('DOMContentLoaded', initializeCampaign, { once: true });

if (document.readyState !== 'loading') initializeCampaign();
