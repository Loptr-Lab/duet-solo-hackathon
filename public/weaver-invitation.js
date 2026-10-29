// Public guide only. The existing PIXIE Railway app owns private sign-in/storage.
(() => {
  const button = document.getElementById('pixieButton');
  const panel = document.getElementById('pixiePanel');
  const status = document.getElementById('invitation-status');
  const content = document.getElementById('invitation-content');
  const entry = 'https://pixie-project-companion-production.up.railway.app/?weaver=1#weaver';
  function handoff() {
    content.replaceChildren();
    status.textContent = 'The private PIXIE invitation connection is under review. This public page cannot authenticate your account or save acceptance. Availability is checked in PIXIE; sign-in is not acceptance.';
    const link = document.createElement('a');
    link.href = entry; link.target = '_blank'; link.rel = 'noopener noreferrer';
    link.textContent = 'Open PIXIE · private Weaver response';
    content.append(link);
    const boundary = document.createElement('p');
    boundary.textContent = 'Opening PIXIE transfers no login cookies, invitation text, private records or consent from this page. No unsolicited invitation is created.';
    content.append(boundary);
  }
  button.addEventListener('click', () => {
    const open = panel.classList.toggle('open'); button.setAttribute('aria-expanded', String(open));
    if (open) { handoff(); document.getElementById('check-invitation').focus(); }
  });
  document.getElementById('check-invitation').textContent = 'Show private PIXIE response link';
  document.getElementById('check-invitation').addEventListener('click', handoff);
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && panel.classList.contains('open')) { panel.classList.remove('open'); button.setAttribute('aria-expanded', 'false'); button.focus(); }
  });
  if (location.hash === '#invitation') { panel.classList.add('open'); button.setAttribute('aria-expanded', 'true'); handoff(); }
})();
