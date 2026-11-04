'use strict';

const rules = `<details class="panel"><summary>How to play Classic Duet</summary>
<p>White moves first. Take turns selecting a piece and destination, or type a move such as <strong>e2e4</strong> and press Enter or Execute.</p>
<p>Pawns, rooks, bishops and knights use their familiar chess movement. The star is Rebirth, which moves like a queen. Death moves one square and cannot be captured. This variant is not won by checkmate; castling and en passant are not implemented.</p>
<p>An enemy Rebirth veils adjacent pieces unless their own Death is adjacent to protect them. A veiled piece may only move one square forward into an empty square and cannot capture.</p>
<p>You win when the opposing Rebirth becomes veiled and loses control. Keep your Rebirth protected by Death while trying to expose your opponent's.</p>
<p>On reaching the far rank, a pawn becomes Rebirth if you have none; otherwise it becomes a knight if you have fewer than two, then a bishop if you have fewer than two. If those slots are full, it remains a pawn.</p>
</details>`;

function replaceSection(html, id, replacement) {
    const pattern = new RegExp(`<section\\b[^>]*\\bid="${id}"[^>]*>[\\s\\S]*?<\\/section>`);
    if (!pattern.test(html)) throw new Error(`Missing demo page section: ${id}`);
    return html.replace(pattern, replacement);
}

function renderDemoPage(html) {
    html = html.replace('class="duet-game"', 'class="duet-game duet-demo"');
    // Same compact navigation as recovery; participation stays in project context.
    html = html.replace(/<header class="site-header">[\s\S]*?<\/header>/, `<header class="site-header"><nav class="site-nav" aria-label="Duet navigation"><a class="site-brand" href="#home">Duet</a><details class="nav-more"><summary>Project details</summary><div><a href="#current-state">Build status</a><a href="#community-power">Participation and training</a><a href="https://break.loptrlab.com/duet/">Project home</a></div></details></nav></header>`);
    html = replaceSection(html, 'realm-intro', `<section class="realm-splash" id="realm-intro" aria-labelledby="demo-title">
<p class="hero-eyebrow">Remote multiplayer demo</p><h1 id="demo-title">Duet</h1>
<p class="body">Play Classic Duet from separate devices. Create a room and share its code, or join a friend’s room. White moves first.</p>
<button type="button" class="btn-primary" onclick="RemoteMode.enterLobby()">Set up a room</button>
<details class="panel"><summary>Match limits and recovery</summary><p>Temporary demo: rooms expire after inactivity. Server restarts clear all matches. Refresh to reconnect while your room still exists. This demo does not save games or collect playtest feedback.</p><p>Use separate devices or browser profiles for the players. Tabs in the same profile share reconnect information.</p></details>
${rules}
<nav class="action-links" aria-label="Duet project links"><a href="https://break.loptrlab.com/duet/">Project home</a><a href="https://github.com/Loptr-Lab/duet-solo-hackathon/pull/112">Build and verification status</a></nav>
</section>`);
    html = replaceSection(html, 'current-state', `<section class="release-section" id="current-state">
<h2>Temporary multiplayer demo</h2><p>This deployment offers Classic room play. Local automated tests cover two rooms, reconnect and a completed match; independent device and screen-reader acceptance remain pending.</p>
<p><a href="https://github.com/Loptr-Lab/duet-solo-hackathon/issues/70">Acceptance checks</a> · <a href="https://break.loptrlab.com/duet/review.html">Project status</a></p></section>`);
    html = html.replace('<a href="/signin.html">AT Proto sign-in</a>', '');
    html = html.replace('<aside class="sidebar remote-sidebar">', '<aside class="sidebar remote-sidebar">' + rules);
    return html;
}

module.exports = { renderDemoPage };
