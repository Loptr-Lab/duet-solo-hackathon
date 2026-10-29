/* No identity, invitation or receipt data is stored in browser storage. */
(() => {
  const button = document.getElementById('pixieButton'), panel = document.getElementById('pixiePanel');
  const status = document.getElementById('invitation-status'), content = document.getElementById('invitation-content');
  let csrfToken = '', view = null, busy = false, epoch = 0;
  const messages = {
    invitation_not_found: 'No existing invitation is available to this account. We do not accept participation requests.',
    invitation_account_mismatch: 'This account does not match the invitation recipient. It cannot use this invitation.',
    confirmed_identity_mismatch: 'A confirmed mismatch excludes this account from this invitation. No acceptance has been recorded by this action.',
    issued_invitation_required: 'An issued invitation is required. No acceptance has been recorded by this action.',
    invitation_version_changed: 'The invitation changed. Review its current version before deciding.',
    owner_access_forbidden: 'This account is not authorized to view private owner status.',
  };
  function text(tag, value, parent = content) { const e = document.createElement(tag); e.textContent = value; parent.append(e); return e; }
  function action(label, fn, parent = content) { const b = text('button', label, parent); b.type = 'button'; b.addEventListener('click', fn); return b; }
  function link(label, url, parent = content) { const a = text('a', label, parent); a.href = url; a.target = '_blank'; a.rel = 'noopener noreferrer'; return a; }
  async function api(path, body) {
    const r = await fetch(path, { credentials: 'same-origin', cache: 'no-store', headers: body ? { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken } : {}, ...(body ? { method: 'POST', body: JSON.stringify(body) } : {}) });
    if (!r.headers.get('content-type')?.includes('application/json')) throw { error: 'backend_unavailable' };
    const data = await r.json(); if (!r.ok) throw data; return data;
  }
  function support(data) {
    const s = data?.support;
    if (!s || !/^weaver-support-[a-f0-9]{12}$/.test(s.marker)) return;
    const details = document.createElement('details'); content.append(details);
    text('summary', 'Review a technical troubleshooting issue', details);
    text('p', 'Check existing issues first. This draft contains technical state only. Do not add identity evidence, invitation text, correspondence or tokens. Closing an issue is not approval or acceptance.', details);
    text('pre', s.body, details);
    // Only server-generated, allowlisted GitHub destinations are used.
    for (const [label, url, path] of [['Check for an existing issue', s.searchUrl, '/Loptr-Lab/duet-solo-hackathon/issues'], ['Review the issue draft on GitHub', s.draftUrl, '/Loptr-Lab/duet-solo-hackathon/issues/new']]) {
      try { const u = new URL(url); if (u.origin === 'https://github.com' && u.pathname === path) link(label, u.href, details); } catch { /* no unsafe link */ }
    }
  }
  function failure(e) {
    status.textContent = messages[e.error] || (e.error === 'backend_unavailable' ? 'This static preview has no private authentication or acceptance backend. It cannot verify identity or save acceptance. The game and public record remain available.' : 'Verification or storage could not be confirmed. The process remains pending; this is not acceptance or rejection. Retry when the service is available.');
    support(e);
  }
  function signin() {
    status.textContent = 'You are signed out. Use your existing AT Protocol account; no new account or invitation is created.';
    const f = document.createElement('form'); f.method = 'get'; f.action = '/auth/atproto/login'; content.append(f);
    const l = text('label', 'Your AT Protocol handle', f); l.htmlFor = 'weaver-handle';
    const input = document.createElement('input'); input.id = 'weaver-handle'; input.name = 'handle'; input.required = true; input.maxLength = 253; input.autocomplete = 'username'; f.append(input);
    const flow = document.createElement('input'); flow.type = 'hidden'; flow.name = 'flow'; flow.value = 'weaver'; f.append(flow);
    const submit = text('button', 'Continue to account provider', f); submit.type = 'submit';
    text('p', 'Enter your password only at your account provider. Signing in does not accept an invitation.');
  }
  function ownerControls() {
    const d = document.createElement('details'); content.append(d); text('summary', 'Private invitation-owner status', d);
    const label = text('label', 'Recipient DID', d); label.htmlFor = 'owner-recipient';
    const input = document.createElement('input'); input.id = 'owner-recipient'; d.append(input);
    action('View private status', async () => {
      try { const r = await api('/auth/weaver/owner/status', { recipientDid: input.value.trim() }); text('pre', JSON.stringify(r, null, 2), d); }
      catch (e) { text('p', messages[e.error] || 'Private status is unavailable. No invitation decision was changed.', d); }
    }, d);
  }
  function receipt(saved) {
    text('h3', 'Your acceptance receipt');
    text('p', `Acceptance to discuss saved for invitation ${saved.invitationId}, version ${saved.version}, at ${new Date(saved.acceptedAt).toISOString()}. Recipient account: ${saved.recipientDid}.`);
    text('p', 'This records acceptance to discuss only. No message notification has been sent by Weaver.');
  }
  async function show() {
    if (busy) return; busy = true; const generation = ++epoch; content.replaceChildren(); view = null; status.textContent = 'Checking the private invitation service…';
    try {
      let cap;
      try { cap = await api('/auth/weaver/capabilities'); } catch { throw { error: 'backend_unavailable' }; }
      if (cap.backend !== true) throw { error: 'backend_unavailable' };
      let session;
      try { session = await api('/auth/weaver/session'); } catch(e) { if (e.error === 'authentication_required') { signin(); return; } throw e; }
      csrfToken = session.csrfToken;
      text('p', `Account control authenticated for ${session.did}. This is not named-person verification or consent.`);
      text('p', 'Automatic named-person verification, including W Identity, is unavailable. Required human review must be completed privately.');
      action('Sign out and clear this view', async () => { try { const r = await fetch('/auth/logout', {method:'POST',credentials:'same-origin'}); if (!r.ok) throw Error(); epoch++; csrfToken=''; view=null; content.replaceChildren(); signin(); } catch { status.textContent='Sign-out could not be confirmed. Retry.'; } });
      if (session.owner) ownerControls();
      view = await api('/auth/weaver/invitation');
      text('h3', `Invitation ${view.invitationId} · version ${view.version}`);
      text('pre', view.text);
      text('p', view.notice);
      if (view.receipt) {
        receipt(view.receipt); status.textContent = 'Your saved acceptance receipt is available.';
        if (view.germEligible === true) { const handoffBox = text('div', ''); action('Notify the invitation owner through Germ', async event => {
          const b = event.currentTarget; b.disabled = true; handoffBox.replaceChildren();
          try {
            const result = await api('/auth/weaver/germ', {});
            if (generation !== epoch) return;
            const u = new URL(result.url);
            if (u.protocol !== 'https:' || u.hostname !== 'landing.ger.mx' || u.port || u.username || u.password || u.search || !/^\/newUser(?:\/(?:android|iOS|web))?$/.test(u.pathname)) throw Error('invalid destination');
            link('Open Germ to choose whether to send', u.href, handoffBox);
            status.textContent = 'Germ permissions checked. Opening Germ is not proof of sending, delivery or reading. Your acceptance remains saved.';
          } catch { if(generation !== epoch) return; b.textContent = 'Recheck Germ permissions'; status.textContent = 'The Germ handoff is unavailable. Your acceptance remains saved. Check permissions again to retry.'; }
          finally { b.disabled = false; }
        }); }
        else text('p', 'Germ notification handoff is not currently available. Your acceptance remains saved. You can check again later.');
      } else {
        status.textContent = 'Review the exact invitation and the acceptance boundary before choosing.';
        action('Accept invitation to discuss', async event => {
          const b = event.currentTarget; b.disabled = true;
          try {
            const r = await api('/auth/weaver/accept', { action: 'accept_to_discuss', invitationId: view.invitationId, version: view.version, noticeVersion: view.noticeVersion, invitationDigest: view.invitationDigest });
            // Only the server's durable receipt permits a success state.
            if (generation !== epoch) return;
            if (r.receipt?.status !== 'accepted_to_discuss') throw Error('unconfirmed storage');
            content.replaceChildren(); receipt(r.receipt); status.textContent = 'Acceptance to discuss saved. Check current notification options when ready.';
            action('Check saved acceptance and notification options', show);
          } catch(e) { if(generation === epoch) failure(e); }
          finally { b.disabled = false; }
        });
      }
    } catch (e) { failure(e); } finally { busy = false; }
  }
  button.addEventListener('click', () => { const open = panel.classList.toggle('open'); button.setAttribute('aria-expanded', String(open)); if(open) { show(); document.getElementById('check-invitation').focus(); } });
  document.addEventListener('keydown', e => { if(e.key === 'Escape' && panel.classList.contains('open')) { panel.classList.remove('open'); button.setAttribute('aria-expanded','false'); button.focus(); } });
  document.getElementById('check-invitation').addEventListener('click', show);
  if(location.hash === '#invitation') { panel.classList.add('open'); button.setAttribute('aria-expanded','true'); show(); }
})();
