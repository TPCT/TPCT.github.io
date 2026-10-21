(function () {
  "use strict";
  const button = document.querySelector('.copy-btn');
  const email = document.querySelector('.contact__email');
  const status = document.getElementById('copy-status');
  if (!button || !email || !status || !navigator.clipboard?.writeText || !window.isSecureContext) return;
  const label = button.querySelector('span');
  let timer;
  button.hidden = false;
  button.addEventListener('click', async function () {
    try {
      await navigator.clipboard.writeText(email.textContent);
      clearTimeout(timer);
      button.classList.add('is-copied');
      label.textContent = button.dataset.labelCopied;
      status.textContent = button.dataset.labelCopied;
      timer = setTimeout(function () {
        button.classList.remove('is-copied');
        label.textContent = button.dataset.labelCopy;
        status.textContent = '';
      }, 2000);
    } catch {
      clearTimeout(timer);
      button.classList.remove('is-copied');
      label.textContent = button.dataset.labelCopy;
      status.textContent = '';
      try {
        const range = document.createRange();
        range.selectNodeContents(email);
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
      } catch { /* Selection may also be unavailable. */ }
    }
  });
})();
