import anime from 'animejs/lib/anime.es.js';

let cleanupAnimation = () => {};

function initializeAlliesAnimation() {
  cleanupAnimation();
  cleanupAnimation = () => {};

  const grid = document.querySelector('.allies-grid');
  if (!grid) return;

  const logos = [...grid.querySelectorAll('.ally-logo')];
  if (!logos.length || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const svgNamespace = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNamespace, 'svg');
  const defs = document.createElementNS(svgNamespace, 'defs');
  const gradient = document.createElementNS(svgNamespace, 'linearGradient');
  const start = document.createElementNS(svgNamespace, 'stop');
  const end = document.createElementNS(svgNamespace, 'stop');
  const path = document.createElementNS(svgNamespace, 'path');
  const pulse = document.createElementNS(svgNamespace, 'circle');
  let timeline;
  let animationFrame = 0;
  let activeIndex = -1;

  svg.classList.add('allies-flow');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  gradient.id = 'allies-flow-gradient';
  gradient.setAttribute('x1', '0%');
  gradient.setAttribute('x2', '100%');
  start.setAttribute('offset', '0%');
  start.setAttribute('stop-color', '#dc2626');
  end.setAttribute('offset', '100%');
  end.setAttribute('stop-color', '#16a34a');
  gradient.append(start, end);
  defs.append(gradient);
  path.classList.add('allies-flow-path');
  pulse.classList.add('allies-flow-pulse');
  pulse.setAttribute('r', '4');
  svg.append(defs, path, pulse);
  grid.append(svg);

  function setActiveLogo(index) {
    if (index === activeIndex) return;
    activeIndex = index;
    logos.forEach((logo, logoIndex) => {
      logo.classList.toggle('is-active', logoIndex === index);
    });
    anime.remove(logos);
    anime({
      targets: logos[index],
      scale: [1, 1.04, 1],
      duration: 720,
      easing: 'easeOutCubic',
    });
  }

  function updateLayout() {
    timeline?.pause();
    cancelAnimationFrame(animationFrame);

    const gridRect = grid.getBoundingClientRect();
    if (!gridRect.width || !gridRect.height) return;

    const width = grid.clientWidth;
    const height = grid.clientHeight;
    const inset = 2;
    const radius = Math.min(20, (height - inset * 2) / 2, (width - inset * 2) / 2);
    const left = inset;
    const top = inset;
    const right = width - inset;
    const bottom = height - inset;
    const corner = radius * 0.5522848;
    const d = [
      `M ${left + radius} ${top}`,
      `H ${right - radius}`,
      `C ${right - radius + corner} ${top} ${right} ${top + radius - corner} ${right} ${top + radius}`,
      `V ${bottom - radius}`,
      `C ${right} ${bottom - radius + corner} ${right - radius + corner} ${bottom} ${right - radius} ${bottom}`,
      `H ${left + radius}`,
      `C ${left + radius - corner} ${bottom} ${left} ${bottom - radius + corner} ${left} ${bottom - radius}`,
      `V ${top + radius}`,
      `C ${left} ${top + radius - corner} ${left + radius - corner} ${top} ${left + radius} ${top}`,
      'Z',
    ].join(' ');

    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    path.setAttribute('d', d);

    const length = path.getTotalLength();
    path.style.strokeDasharray = `${length}`;
    path.style.strokeDashoffset = `${length}`;

    const positions = logos.map((logo) => {
      const rect = logo.getBoundingClientRect();
      return {
        x: rect.left - gridRect.left + rect.width / 2,
        y: rect.top - gridRect.top + rect.height / 2,
      };
    });
    const stations = positions.map(({ x }) => {
      let closestDistance = Infinity;
      let closestLength = 0;
      const samples = 240;

      for (let sample = 0; sample <= samples; sample += 1) {
        const pathLength = (length * sample) / samples;
        const point = path.getPointAtLength(pathLength);
        const distance = Math.abs(point.x - x) + Math.abs(point.y - top);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestLength = pathLength;
        }
      }

      return closestLength;
    });
    const motionPath = anime.path(path);

    timeline = anime.timeline({ loop: true, endDelay: 700 });
    timeline.add({
      targets: path,
      strokeDashoffset: [
        { value: 0, duration: 4200, easing: 'easeInOutSine' },
        { value: length, duration: 4200, easing: 'easeInOutSine' },
      ],
    }, 0);
    timeline.add({
      targets: pulse,
      translateX: motionPath('x'),
      translateY: motionPath('y'),
      duration: 8400,
      easing: 'linear',
      update: (animation) => {
        const travelled = (animation.progress / 100) * length;
        let nextActive = 0;
        for (let index = 0; index < stations.length; index += 1) {
          if (travelled >= stations[index]) nextActive = index;
        }
        setActiveLogo(nextActive);
      },
    }, 0);

    const firstPoint = path.getPointAtLength(0);
    anime.set(pulse, { translateX: firstPoint.x, translateY: firstPoint.y });
    setActiveLogo(0);
    timeline.play();
  }

  const resizeObserver = new ResizeObserver(() => {
    cancelAnimationFrame(animationFrame);
    animationFrame = requestAnimationFrame(updateLayout);
  });
  resizeObserver.observe(grid);

  cleanupAnimation = () => {
    resizeObserver.disconnect();
    cancelAnimationFrame(animationFrame);
    timeline?.pause();
    anime.remove([path, pulse, ...logos]);
    svg.remove();
    logos.forEach((logo) => logo.classList.remove('is-active'));
  };

  updateLayout();
}

document.addEventListener('astro:before-swap', () => cleanupAnimation());
document.addEventListener('astro:page-load', initializeAlliesAnimation);

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeAlliesAnimation, { once: true });
} else {
  initializeAlliesAnimation();
}
