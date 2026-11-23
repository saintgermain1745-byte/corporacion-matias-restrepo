import anime from 'animejs/lib/anime.es.js';

const storyDuration = 4500;
let cleanupGallery = () => {};

function initializeGallery() {
  cleanupGallery();
  cleanupGallery = () => {};

  const root = document.querySelector('[data-gallery-page]');
  if (!root) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const modal = root.querySelector('[data-stories-modal]');
  const viewer = root.querySelector('.story-viewer');
  const image = root.querySelector('[data-story-image]');
  const caption = root.querySelector('[data-story-caption]');
  const title = root.querySelector('[data-story-title]');
  const counter = root.querySelector('[data-story-counter]');
  const progress = root.querySelector('[data-story-progress]');
  const pauseButton = root.querySelector('[data-story-pause]');
  const pauseIcon = root.querySelector('[data-pause-icon]');
  const pauseText = root.querySelector('[data-pause-text]');
  const closeButton = root.querySelector('[data-story-close]');
  const photoItems = [...root.querySelectorAll('[data-gallery-item]')];
  const storyButtons = [...root.querySelectorAll('[data-story-category]')];
  const labels = {
    pause: modal.dataset.pauseLabel,
    resume: modal.dataset.resumeLabel,
  };
  const photos = photoItems.map((item) => ({
    category: item.dataset.category,
    categoryLabel: item.dataset.categoryLabel,
    caption: item.dataset.caption,
    src: item.querySelector('img').getAttribute('src'),
    alt: item.querySelector('img').alt,
  }));
  const categoryOrder = storyButtons
    .map((button) => button.dataset.storyCategory)
    .filter((category) => category !== 'all');
  const controller = new AbortController();
  const originalBodyOverflow = document.body.style.overflow;
  let currentPhotos = [];
  let currentIndex = 0;
  let previousFocus = null;
  let remainingTime = storyDuration;
  let startedAt = 0;
  let hoverEnabledAt = 0;
  let animationFrame = 0;
  let displayedCategory = '';
  let isPaused = false;
  let isPlaying = false;
  const pauseReasons = new Set();

  function updateProgress(percent = 0) {
    [...progress.children].forEach((segment, index) => {
      const fill = segment.firstElementChild;
      fill.style.width = index < currentIndex ? '100%' : index === currentIndex ? `${percent}%` : '0%';
    });
  }

  function updatePauseControl() {
    isPaused = pauseReasons.size > 0;
    isPlaying = !modal.hidden && !isPaused;
    pauseButton.setAttribute('aria-label', isPaused ? labels.resume : labels.pause);
    pauseIcon.textContent = isPaused ? '▶' : 'Ⅱ';
    pauseText.textContent = isPaused ? labels.resume : labels.pause;
  }

  function cancelProgress() {
    cancelAnimationFrame(animationFrame);
    animationFrame = 0;
  }

  function startProgress() {
    cancelProgress();
    updatePauseControl();
    if (modal.hidden || isPaused || !isPlaying) return;

    startedAt = performance.now();
    const tick = (now) => {
      const elapsed = now - startedAt;
      const percent = ((storyDuration - remainingTime + elapsed) / storyDuration) * 100;
      updateProgress(Math.min(percent, 100));

      if (elapsed >= remainingTime) {
        showPhoto((currentIndex + 1) % currentPhotos.length);
        return;
      }

      animationFrame = requestAnimationFrame(tick);
    };

    animationFrame = requestAnimationFrame(tick);
  }

  function pauseProgress(reason) {
    if (pauseReasons.has(reason)) return;
    if (pauseReasons.size === 0 && animationFrame) {
      remainingTime = Math.max(0, remainingTime - (performance.now() - startedAt));
      cancelProgress();
      updateProgress(((storyDuration - remainingTime) / storyDuration) * 100);
    }
    pauseReasons.add(reason);
    updatePauseControl();
  }

  function resumeProgress(reason) {
    if (!pauseReasons.delete(reason)) return;
    updatePauseControl();
    if (pauseReasons.size === 0) startProgress();
  }

  function getStoryPhotos(category) {
    if (category === 'all') return photos;
    const firstCategoryIndex = categoryOrder.indexOf(category);
    if (firstCategoryIndex < 0) return photos;
    const orderedCategories = [
      ...categoryOrder.slice(firstCategoryIndex),
      ...categoryOrder.slice(0, firstCategoryIndex),
    ];
    return orderedCategories.flatMap((storyCategory) =>
      photos.filter((photo) => photo.category === storyCategory),
    );
  }

  function showPhoto(index) {
    cancelProgress();
    currentIndex = index;
    remainingTime = storyDuration;
    const photo = currentPhotos[currentIndex];
    image.src = photo.src;
    image.alt = photo.alt;
    caption.textContent = photo.caption;
    if (photo.category !== displayedCategory) {
      displayedCategory = photo.category;
      title.textContent = photo.categoryLabel;
    }
    counter.textContent = `${currentIndex + 1} / ${currentPhotos.length}`;
    updateProgress();
    startProgress();
  }

  function showNext() {
    if (!currentPhotos.length) return;
    showPhoto((currentIndex + 1) % currentPhotos.length);
  }

  function showPrevious() {
    if (!currentPhotos.length) return;
    showPhoto((currentIndex - 1 + currentPhotos.length) % currentPhotos.length);
  }

  function openStory(category, index = 0) {
    currentPhotos = getStoryPhotos(category);
    if (!currentPhotos.length) return;

    previousFocus = document.activeElement;
    hoverEnabledAt = performance.now() + 400;
    const selectedButton = storyButtons.find((button) => button.dataset.storyCategory === category);
    const firstPhotoIndex = currentPhotos.findIndex((photo) => photo.category === category);
    displayedCategory = category === 'all' ? currentPhotos[0].category : category;
    title.textContent = selectedButton?.dataset.storyLabel ?? '';
    progress.setAttribute('aria-label', modal.dataset.progressLabel);
    progress.replaceChildren(...currentPhotos.map(() => {
      const segment = document.createElement('span');
      const fill = document.createElement('span');
      segment.className = 'story-progress-segment';
      fill.className = 'story-progress-fill';
      segment.append(fill);
      return segment;
    }));

    pauseReasons.clear();
    isPaused = false;
    isPlaying = true;
    modal.hidden = false;
    modal.setAttribute('aria-hidden', 'false');
    updatePauseControl();
    document.body.style.overflow = 'hidden';
    showPhoto(category === 'all' ? index : firstPhotoIndex + index);
    closeButton.focus();
  }

  function closeStory() {
    if (modal.hidden) return;
    cancelProgress();
    modal.hidden = true;
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = originalBodyOverflow;
    pauseReasons.clear();
    updatePauseControl();
    previousFocus?.isConnected && previousFocus.focus?.();
  }

  function applyCategory(category) {
    const visibleItems = photoItems.filter((item) => category === 'all' || item.dataset.category === category);
    const visibleSet = new Set(visibleItems);

    storyButtons.forEach((button) => {
      const selected = button.dataset.storyCategory === category;
      button.classList.toggle('is-selected', selected);
      button.setAttribute('aria-pressed', String(selected));
    });

    photoItems.forEach((item, index) => {
      const shouldShow = visibleSet.has(item);
      const wasHidden = item.hidden;
      anime.remove(item);

      if (shouldShow) {
        item.hidden = false;
        item.setAttribute('aria-hidden', 'false');
        if (wasHidden && !reduceMotion) {
          anime.set(item, { opacity: 0, translateY: 10 });
          anime({
            targets: item,
            opacity: [0, 1],
            translateY: [10, 0],
            delay: index * 25,
            duration: 280,
            easing: 'easeOutCubic',
          });
        } else {
          anime.set(item, { opacity: 1, translateY: 0 });
        }
      } else {
        item.hidden = true;
        item.setAttribute('aria-hidden', 'true');
        anime.set(item, { opacity: 1, translateY: 0 });
      }
    });

  }

  root.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    const storyButton = target.closest('[data-story-category]');
    if (storyButton) {
      const category = storyButton.dataset.storyCategory;
      applyCategory(category);
      openStory(category);
      return;
    }

    const photoButton = target.closest('[data-open-story]');
    if (photoButton) {
      const category = photoButton.dataset.openStory;
      applyCategory(category);
      openStory(category, Number(photoButton.dataset.photoIndex));
      return;
    }

    const stepButton = target.closest('[data-story-step]');
    if (stepButton) {
      if (Number(stepButton.dataset.storyStep) > 0) showNext();
      else showPrevious();
      return;
    }

    if (target.closest('[data-story-pause]')) {
      if (pauseReasons.has('manual')) resumeProgress('manual');
      else pauseProgress('manual');
      return;
    }

    if (target.closest('[data-story-close]') || target === modal) closeStory();
  }, { signal: controller.signal });

  viewer.addEventListener('pointerenter', () => {
    if (window.matchMedia('(hover: hover)').matches && performance.now() >= hoverEnabledAt) pauseProgress('hover');
  }, { signal: controller.signal });
  viewer.addEventListener('pointermove', () => {
    if (window.matchMedia('(hover: hover)').matches && performance.now() >= hoverEnabledAt) pauseProgress('hover');
  }, { signal: controller.signal });
  viewer.addEventListener('pointerleave', () => resumeProgress('hover'), { signal: controller.signal });
  viewer.addEventListener('pointerdown', () => pauseProgress('hold'), { signal: controller.signal });
  viewer.addEventListener('pointerup', () => resumeProgress('hold'), { signal: controller.signal });
  viewer.addEventListener('pointercancel', () => resumeProgress('hold'), { signal: controller.signal });

  document.addEventListener('keydown', (event) => {
    if (modal.hidden) return;
    if (event.key === 'Escape') closeStory();
    if (event.key === 'ArrowRight') showNext();
    if (event.key === 'ArrowLeft') showPrevious();
    if (event.code === 'Space' && !(event.target instanceof HTMLButtonElement)) {
      event.preventDefault();
      if (pauseReasons.has('manual')) resumeProgress('manual');
      else pauseProgress('manual');
    }
  }, { signal: controller.signal });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden && !modal.hidden) pauseProgress('visibility');
    else if (!document.hidden) resumeProgress('visibility');
  }, { signal: controller.signal });

  cleanupGallery = () => {
    controller.abort();
    cancelProgress();
    anime.remove(photoItems);
    if (!modal.hidden) {
      modal.hidden = true;
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = originalBodyOverflow;
    }
    pauseReasons.clear();
    updatePauseControl();
  };
}

document.addEventListener('astro:before-swap', () => cleanupGallery());
document.addEventListener('astro:page-load', initializeGallery);

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeGallery, { once: true });
} else {
  initializeGallery();
}
