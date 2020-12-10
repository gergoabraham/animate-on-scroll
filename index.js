// Constants from CSS, DOM
const maxUpdateFrequency = parseInt(
  getComputedStyle(document.documentElement).getPropertyValue(
    '--max-update-frequency-ms'
  )
);
const elementsToAnimate = document.querySelectorAll('.float-from-below');

// Startup - event listeners, displaying cards
window.addEventListener(
  'scroll',
  invokeWithMaxFrequency(animateCards, maxUpdateFrequency)
);
window.addEventListener(
  'resize',
  invokeWithMaxFrequency(animateCards, maxUpdateFrequency)
);

animateCards();

/**
 * @param {function} callback
 * @param {number} maxFrequencyMs
 *
 * @returns a function, that can be called any often, but will delegate the call
 *          to the callback only with the defined max frequency.
 */
function invokeWithMaxFrequency(callback, maxFrequencyMs) {
  let lastRun = Date.now();
  let timeoutHandler = null;

  return () => {
    const now = Date.now();
    if (now > lastRun + maxFrequencyMs) {
      lastRun = now;
      callback();
    } else {
      if (!timeoutHandler) {
        timeoutHandler = setTimeout(() => {
          callback();
          timeoutHandler = null;
        }, lastRun + maxFrequencyMs - now);
      }
    }
  };
}

/**
 * Iterates the elements to animate, and shows/hides them, with an increasing
 * delay.
 */
function animateCards() {
  const showAtPercent =
    parseInt(
      getComputedStyle(document.documentElement).getPropertyValue(
        '--show-elems-at-percent'
      )
    ) / 100;

  let delay = 0;
  for (const elem of elementsToAnimate) {
    delay = displayIfOnScreenFromBottom(elem, showAtPercent, delay);
    delay = displayIfOnScreenFromAbove(elem, delay);
    hideIfBelowScreen(elem);
    hideIfAboveScreen(elem);
  }
}

function displayIfOnScreenFromBottom(elem, showAtPercent, delay) {
  const isItemAtGivenPercent =
    elem.offsetTop + elem.offsetHeight <
    window.innerHeight * showAtPercent + window.scrollY;
  const isBottomReached = window.scrollY === window.scrollMaxY;
  const shouldFloatInFromBelow = elem.classList.contains('float-from-below');

  if ((isItemAtGivenPercent || isBottomReached) && shouldFloatInFromBelow) {
    elem.classList.add('float-visible');
    elem.classList.remove('float-from-below');

    elem.style.transitionDelay = `${delay}s`;
    delay = increaseDelayToAMax(delay);

    cleanUpAfterAnimation(elem, delay);
  }

  return delay;
}

function displayIfOnScreenFromAbove(elem, delay) {
  const isItemVisible = elem.offsetTop + elem.offsetHeight > window.scrollY;
  const shouldFloatInFromAbove = elem.classList.contains('float-from-above');

  if (isItemVisible && shouldFloatInFromAbove) {
    elem.classList.add('float-visible');
    elem.classList.remove('float-from-above');

    elem.style.transitionDelay = `${delay}s`;
    delay = increaseDelayToAMax(delay);

    cleanUpAfterAnimation(elem, delay);
  }

  return delay;
}

function increaseDelayToAMax(delay) {
  return delay >= 0.6 ? 0.6 : delay + 0.1;
}

function hideIfAboveScreen(elem) {
  if (elem.offsetTop + elem.offsetHeight < window.scrollY) {
    elem.classList.add('float-from-above');
    elem.classList.remove('float-visible');
    elem.classList.remove('hover-enabled');
  }
}

function hideIfBelowScreen(elem) {
  if (elem.offsetTop > window.innerHeight + window.scrollY) {
    elem.classList.add('float-from-below');
    elem.classList.remove('float-visible');
    elem.classList.remove('hover-enabled');
  }
}

function cleanUpAfterAnimation(elem, delay) {
  setTimeout(() => {
    elem.style = '';

    if (elem.classList.contains('hoverable')) {
      elem.classList.add('hover-enabled');
    }
  }, delay * 1000);
}
