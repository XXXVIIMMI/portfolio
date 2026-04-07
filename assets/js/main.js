// ── SHAKIL AHMED PORTFOLIO — MAIN JAVASCRIPT ──

// ── NEURAL NETWORK LIVE WALLPAPER ──────────────────────────────
(function(){
  const canvas = document.getElementById('nn-canvas');
  const ctx = canvas.getContext('2d');
  let W, H, t = 0, animId;
  const isLiteDevice = window.matchMedia('(max-width: 700px), (hover: none) and (pointer: coarse), (prefers-reduced-motion: reduce)').matches;

  // Multi-color palette for nodes/edges
  const PALETTE = [
    {r:96, g:165,b:250},  // blue
    {r:167,g:139,b:250},  // violet
    {r:52, g:211,b:153},  // emerald
    {r:251,g:146,b:60 },  // orange
    {r:248,g:113,b:113},  // red
    {r:250,g:204,b:21 },  // yellow
    {r:34, g:211,b:238},  // cyan
  ];

  function rgba(c, a){ return `rgba(${c.r},${c.g},${c.b},${a})`; }
  function lerpColor(a,b,t){ return {r:a.r+(b.r-a.r)*t, g:a.g+(b.g-a.g)*t, b:a.b+(b.b-a.b)*t}; }
  function drawPolygon(cx, cy, radius, sides, rot){
    ctx.beginPath();
    for(let i=0;i<=sides;i++){
      const ang = rot + (Math.PI * 2 * i) / sides;
      const px = cx + Math.cos(ang) * radius;
      const py = cy + Math.sin(ang) * radius;
      if(i===0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
  }

  // Network layers
  const LAYERS = isLiteDevice ? [2, 4, 6, 7, 6, 4, 2] : [3, 6, 9, 11, 9, 6, 3];
  let nodes = [];
  let pulses = [];

  function hubPoint(){
    const isNarrow = W <= 700;
    const edgePad = isNarrow ? 96 : Math.max(46, W * 0.07);
    const driftX = isNarrow ? 1.2 : 3;
    const driftY = isNarrow ? 2.2 : 4;
    const baseY = isNarrow ? H * 0.24 : H * 0.5;
    const safeTopY = isNarrow ? 92 : 0;
    const safeBottomY = isNarrow ? Math.max(160, H * 0.36) : H;
    const hubY = baseY + Math.cos(t * 0.42) * driftY;
    return {
      x: W - edgePad + Math.sin(t * 0.5) * driftX,
      y: Math.min(safeBottomY, Math.max(safeTopY, hubY))
    };
  }

  function networkCenter(){
    const isNarrow = W <= 700;
    const centerX = isNarrow ? W * 0.46 : W * 0.61;
    const driftX = isNarrow ? 2.2 : 5;
    const driftY = isNarrow ? 2.4 : 4;
    const centerY = isNarrow ? H * 0.26 : H * 0.5;
    return {
      x: centerX + Math.sin(t * 0.25) * driftX,
      y: centerY + Math.cos(t * 0.21) * driftY
    };
  }

  function resize(){
    W = canvas.offsetWidth; H = canvas.offsetHeight;
    canvas.width = W; canvas.height = H;
    buildNodes();
  }

  function buildNodes(){
    nodes = [];
    const center = networkCenter();
    const isNarrow = W <= 700;
    const maxRadius = Math.min(W, H) * (isNarrow ? 0.15 : 0.23);
    const nodePad = isNarrow ? 20 : 12;
    const nodeTopPad = isNarrow ? 86 : nodePad;
    const nodeBottomPad = isNarrow ? Math.max(156, H * 0.4) : H - nodePad;
    for(let l=0;l<LAYERS.length;l++){
      nodes.push([]);
      const count = LAYERS[l];
      const ringT = l / (LAYERS.length - 1);
      const radius = maxRadius * (1 - ringT * 0.78) + 12;
      for(let n=0;n<count;n++){
        const angle = (Math.PI * 2 * n) / count + l * 0.22;
        const rawX = center.x + Math.cos(angle) * radius;
        const rawY = center.y + Math.sin(angle) * radius;
        const x = Math.min(W - nodePad, Math.max(nodePad, rawX));
        const y = Math.min(nodeBottomPad, Math.max(nodeTopPad, rawY));
        const col = PALETTE[(l*3+n*2) % PALETTE.length];
        nodes[l].push({x, y, col, phase: l*1.7+n*0.9, act:0, angle, radius});
      }
    }
  }

  function spawnPulse(){
    const l = Math.floor(Math.random()*(LAYERS.length-1));
    const fi = Math.floor(Math.random()*LAYERS[l]);
    const ti = Math.floor(Math.random()*LAYERS[l+1]);
    const colA = nodes[l][fi].col;
    const colB = nodes[l+1][ti].col;
    pulses.push({mode:'edge', l, fi, ti, prog:0, speed:0.007+Math.random()*0.013, colA, colB});
  }

  function spawnHubPulse(){
    const l = Math.floor(Math.random()*LAYERS.length);
    const ni = Math.floor(Math.random()*LAYERS[l]);
    const nd = nodes[l][ni];
    pulses.push({
      mode:'hub',
      l,
      ni,
      prog:0,
      speed:0.01+Math.random()*0.012,
      colA: nd.col,
      colB: {r:56,g:189,b:248}
    });
  }

  function draw(){
    ctx.clearRect(0,0,W,H);
    t += 0.007;

    // Animate activations
    for(let l=0;l<LAYERS.length;l++)
      for(let n=0;n<LAYERS[l];n++){
        const nd = nodes[l][n];
        nd.act = 0.4 + 0.6*Math.abs(Math.sin(t*0.9 + nd.phase));
      }

    // Draw edges
    for(let l=0;l<LAYERS.length-1;l++){
      for(let a=0;a<LAYERS[l];a++){
        for(let b=0;b<LAYERS[l+1];b++){
          const n1=nodes[l][a], n2=nodes[l+1][b];
          const alpha = 0.025 + 0.04*n1.act*n2.act;
          const mid = lerpColor(n1.col, n2.col, 0.5);
          const grad = ctx.createLinearGradient(n1.x,n1.y,n2.x,n2.y);
          grad.addColorStop(0, rgba(n1.col, alpha));
          grad.addColorStop(0.5, rgba(mid, alpha*1.5));
          grad.addColorStop(1, rgba(n2.col, alpha));
          ctx.beginPath(); ctx.moveTo(n1.x,n1.y); ctx.lineTo(n2.x,n2.y);
          ctx.strokeStyle = grad; ctx.lineWidth = 0.6; ctx.stroke();
        }
      }
    }

    // Circular geometry links (ring connections)
    for(let l=0;l<LAYERS.length;l++){
      const ring = nodes[l];
      for(let n=0;n<ring.length;n++){
        const n1 = ring[n];
        const n2 = ring[(n + 1) % ring.length];
        const alpha = 0.05 + 0.05 * n1.act;
        const grad = ctx.createLinearGradient(n1.x,n1.y,n2.x,n2.y);
        grad.addColorStop(0, rgba(n1.col, alpha));
        grad.addColorStop(1, rgba(n2.col, alpha));
        ctx.beginPath();
        ctx.moveTo(n1.x, n1.y);
        ctx.lineTo(n2.x, n2.y);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 0.7;
        ctx.stroke();
      }
    }

    // Hub convergence lines
    const hub = hubPoint();
    for(let l=0;l<LAYERS.length;l++){
      for(let n=0;n<LAYERS[l];n++){
        const nd = nodes[l][n];
        const alpha = 0.018 + 0.04 * nd.act;
        const grad = ctx.createLinearGradient(nd.x,nd.y,hub.x,hub.y);
        grad.addColorStop(0, rgba(nd.col, alpha));
        grad.addColorStop(1, 'rgba(56,189,248,0.22)');
        ctx.beginPath();
        ctx.moveTo(nd.x, nd.y);
        ctx.lineTo(hub.x, hub.y);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 0.45;
        ctx.stroke();
      }
    }

    // Draw pulses
    pulses.forEach(p=>{
      const n1 = p.mode === 'hub' ? nodes[p.l][p.ni] : nodes[p.l][p.fi];
      const hubPos = hubPoint();
      const n2 = p.mode === 'hub' ? hubPos : nodes[p.l+1][p.ti];
      const px=n1.x+(n2.x-n1.x)*p.prog;
      const py=n1.y+(n2.y-n1.y)*p.prog;
      const col = lerpColor(p.colA, p.colB, p.prog);
      const pulseR = p.mode === 'hub' ? 7 : 9;
      const g = ctx.createRadialGradient(px,py,0,px,py,pulseR);
      g.addColorStop(0, rgba(col, 1));
      g.addColorStop(0.35, rgba(col, 0.5));
      g.addColorStop(1, rgba(col, 0));
      ctx.beginPath(); ctx.arc(px,py,pulseR,0,Math.PI*2);
      ctx.fillStyle=g; ctx.fill();
      // trail
      const tx=n1.x+(n2.x-n1.x)*Math.max(0,p.prog-0.12);
      const ty=n1.y+(n2.y-n1.y)*Math.max(0,p.prog-0.12);
      const tg = ctx.createLinearGradient(tx,ty,px,py);
      tg.addColorStop(0, rgba(col,0));
      tg.addColorStop(1, rgba(col,0.4));
      ctx.beginPath(); ctx.moveTo(tx,ty); ctx.lineTo(px,py);
      ctx.strokeStyle=tg; ctx.lineWidth=2; ctx.stroke();
      p.prog += p.speed;
    });
    pulses = pulses.filter(p=>{
      if(p.prog>=1){
        if(p.mode === 'edge') nodes[p.l+1][p.ti].act=1;
        return false;
      }
      return true;
    });
    if(pulses.length < (isLiteDevice ? 10 : 18) && Math.random() < (isLiteDevice ? 0.14 : 0.22)) spawnPulse();
    if(pulses.length < (isLiteDevice ? 14 : 26) && Math.random() < (isLiteDevice ? 0.1 : 0.18)) spawnHubPulse();

    // Hub geometry
    const hubScale = W <= 700 ? 0.72 : 1;
    const hubOuter = (14 + Math.sin(t * 3.2) * 2.4) * hubScale;
    const hubCore = (5.3 + Math.sin(t * 4.3) * 1.1) * hubScale;
    const halo = ctx.createRadialGradient(hub.x,hub.y,0,hub.x,hub.y,hubOuter * (W <= 700 ? 4.6 : 5.8));
    halo.addColorStop(0, 'rgba(196,150,90,0.42)');
    halo.addColorStop(1, 'rgba(196,150,90,0)');
    ctx.beginPath();
    ctx.arc(hub.x,hub.y,hubOuter * (W <= 700 ? 4.6 : 5.8),0,Math.PI*2);
    ctx.fillStyle = halo;
    ctx.fill();

    drawPolygon(hub.x, hub.y, hubOuter, 8, t * 0.32);
    ctx.strokeStyle = 'rgba(217,174,120,0.9)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    const hubCoreGrad = ctx.createRadialGradient(hub.x,hub.y,0,hub.x,hub.y,hubCore * 2.8);
    hubCoreGrad.addColorStop(0, 'rgba(255,255,255,1)');
    hubCoreGrad.addColorStop(0.45, 'rgba(196,150,90,0.98)');
    hubCoreGrad.addColorStop(1, 'rgba(196,150,90,0.06)');
    ctx.beginPath();
    ctx.arc(hub.x,hub.y,hubCore * 2.8,0,Math.PI*2);
    ctx.fillStyle = hubCoreGrad;
    ctx.fill();

    // Rotating orbit rings
    const orbitRx = hubOuter * 2.4;
    const orbitRy = hubOuter * 1.15;
    const orbitSpin = t * 0.9;

    ctx.save();
    ctx.translate(hub.x, hub.y);

    ctx.beginPath();
    ctx.ellipse(0, 0, orbitRx, orbitRy, orbitSpin, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(196,150,90,0.68)';
    ctx.lineWidth = 1.1;
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(0, 0, orbitRx, orbitRy, orbitSpin + Math.PI / 2.2, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(217,174,120,0.66)';
    ctx.lineWidth = 1.05;
    ctx.stroke();
    ctx.lineWidth = 0.85;
    ctx.stroke();

    ctx.restore();

    // Draw nodes
    for(let l=0;l<LAYERS.length;l++){
      for(let n=0;n<LAYERS[l];n++){
        const nd=nodes[l][n], act=nd.act;
        let neighborInfluence = 0;
        if(l > 0 && n < LAYERS[l-1]) neighborInfluence += Math.sin(t*0.6 + nodes[l-1][n].phase);
        if(l < LAYERS.length-1 && n < LAYERS[l+1]) neighborInfluence += Math.sin(t*0.6 + nodes[l+1][n].phase);
        if(n > 0) neighborInfluence += Math.sin(t*0.6 + nodes[l][n-1].phase) * 0.6;
        if(n < LAYERS[l]-1) neighborInfluence += Math.sin(t*0.6 + nodes[l][n+1].phase) * 0.6;
        neighborInfluence *= 0.8;
        const sx = nd.x + Math.sin(t*0.7+nd.phase)*2.2 + neighborInfluence*1.8;
        const sy = nd.y + Math.cos(t*0.58+nd.phase*1.2)*2.2 + neighborInfluence*1.5;
        const r = 2 + act*2.4;
        const glow=ctx.createRadialGradient(sx,sy,0,sx,sy,r*4);
        glow.addColorStop(0, rgba(nd.col, 0.2*act));
        glow.addColorStop(1, rgba(nd.col, 0));
        ctx.beginPath(); ctx.arc(sx,sy,r*4,0,Math.PI*2);
        ctx.fillStyle=glow; ctx.fill();

        ctx.beginPath();
        ctx.arc(sx,sy,r+1.2,0,Math.PI*2);
        ctx.strokeStyle = rgba(nd.col, 0.72);
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(sx,sy,r*0.72,0,Math.PI*2);
        ctx.fillStyle = rgba({r:255,g:255,b:255}, 0.82*act);
        ctx.fill();
      }
    }

    // Floating data particles
    const particleCount = isLiteDevice ? 10 : 24;
    for(let i=0;i<particleCount;i++){
      const angle=(i/particleCount)*Math.PI*2 + t*0.12 + Math.sin(t*0.3+i)*0.4;
      const radius = W*0.32 + Math.sin(t*0.5+i*0.7)*W*0.08;
      const px = W*0.5 + Math.cos(angle)*radius;
      const py = H*0.5 + Math.sin(angle*0.8)*H*0.35;
      const col = PALETTE[i % PALETTE.length];
      const a = 0.04 + 0.07*Math.abs(Math.sin(t+i*0.6));
      ctx.beginPath(); ctx.arc(px,py,1.5,0,Math.PI*2);
      ctx.fillStyle=rgba(col,a); ctx.fill();
    }

    animId = requestAnimationFrame(draw);
  }

  resize();
  window.addEventListener('resize', resize);
  draw();
})();

// ── SCROLL REVEAL ──
const revealEls = document.querySelectorAll('.sr');
if('IntersectionObserver' in window){
  const io = new IntersectionObserver(es=>{
    es.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); }});
  },{threshold:0.1});
  revealEls.forEach(el=>io.observe(el));
} else {
  revealEls.forEach(el=>el.classList.add('in'));
}

// ── MOBILE NAV TOGGLE ──
const nav = document.getElementById('nav');
const navToggle = document.querySelector('.nav-toggle');
const navLinksPanel = document.getElementById('nav-links');
if(nav && navToggle && navLinksPanel){
  navToggle.addEventListener('click', ()=>{
    const open = nav.classList.toggle('menu-open');
    navToggle.setAttribute('aria-expanded', String(open));
  });

  navLinksPanel.querySelectorAll('a').forEach(link=>{
    link.addEventListener('click', ()=>{
      nav.classList.remove('menu-open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });

  window.addEventListener('resize', ()=>{
    if(window.innerWidth > 920 && nav.classList.contains('menu-open')){
      nav.classList.remove('menu-open');
      navToggle.setAttribute('aria-expanded', 'false');
    }
  });
}

// ── NAV ACTIVE LINK ──
const secs = document.querySelectorAll('section[id]');
const navAs = document.querySelectorAll('.nav-links a:not(.nav-hire)');
const nio = new IntersectionObserver(es=>{
  es.forEach(e=>{ if(e.isIntersecting){
    navAs.forEach(a=>a.classList.remove('active'));
    const lnk=document.querySelector(`.nav-links a[href="#${e.target.id}"]`);
    if(lnk) lnk.classList.add('active');
  }});
},{threshold:0.4});
secs.forEach(s=>nio.observe(s));

// ── SCROLL PROGRESS & NAV MORPH ──
window.addEventListener('scroll',()=>{
  const curr=window.scrollY;
  const total=document.documentElement.scrollHeight - window.innerHeight;
  const pct = curr/total*100;
  document.documentElement.style.setProperty('--scroll-progress', pct+'%');
  document.getElementById('nav').classList.toggle('scrolled', curr>20);
  if(curr > 40 && nav?.classList.contains('menu-open')){
    nav.classList.remove('menu-open');
    navToggle?.setAttribute('aria-expanded', 'false');
  }
},{ passive:true });

// ── HERO PARALLAX ON MOUSE ──
const hero=document.querySelector('.hero-content');
if(hero){
  document.addEventListener('mousemove',e=>{
    const mx=e.clientX/window.innerWidth-0.5;
    const my=e.clientY/window.innerHeight-0.5;
    hero.style.setProperty('--mx', mx);
    hero.style.setProperty('--my', my);
  },{ passive:true });
}

// ── CINEMATIC HERO CAMERA ROLL ──
const heroSection = document.querySelector('.hero');
if(heroSection && hero){
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(!reduceMotion){
    heroSection.addEventListener('mousemove', e=>{
      const r = heroSection.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      hero.style.setProperty('--hero-ry', `${px * 6}deg`);
      hero.style.setProperty('--hero-rx', `${-py * 5}deg`);
    });
    heroSection.addEventListener('mouseleave', ()=>{
      hero.style.setProperty('--hero-ry', '0deg');
      hero.style.setProperty('--hero-rx', '0deg');
    });
  }
}

// ── 6D TILT ON PROFILE IMAGE ──
const aboutPhoto = document.querySelector('.about-photo-frame');
const aboutPhotoImg = aboutPhoto?.querySelector('img');
if(aboutPhoto && aboutPhotoImg){
  aboutPhoto.addEventListener('mousemove', e=>{
    const r = aboutPhoto.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    aboutPhotoImg.style.setProperty('--img-ry', `${px * 8}deg`);
    aboutPhotoImg.style.setProperty('--img-rx', `${-py * 8}deg`);
  });
  aboutPhoto.addEventListener('mouseleave', ()=>{
    aboutPhotoImg.style.setProperty('--img-ry', '0deg');
    aboutPhotoImg.style.setProperty('--img-rx', '0deg');
  });
}

// ── 6D TILT ON PROJECT CARDS ──
document.querySelectorAll('.proj').forEach(card=>{
  const panel = card.querySelector('.proj-main');
  if(!panel) return;
  card.addEventListener('mousemove', e=>{
    const r = card.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    panel.style.setProperty('--card-ry', `${px * 6}deg`);
    panel.style.setProperty('--card-rx', `${-py * 5}deg`);
  });
  card.addEventListener('mouseleave', ()=>{
    panel.style.setProperty('--card-ry', '0deg');
    panel.style.setProperty('--card-rx', '0deg');
  });
});

// ── CONTACT FORM HANDLER ──
// Opens email client with pre-filled content
const contactForm = document.getElementById('contact-form');
if(contactForm){
  contactForm.addEventListener('submit', e=>{
    e.preventDefault();
    const name    = document.getElementById('contact-name').value.trim();
    const email   = document.getElementById('contact-email').value.trim();
    const message = document.getElementById('contact-message').value.trim();

    if(!name || !email || !message) return;

    const subject = encodeURIComponent(`Portfolio Contact from ${name}`);
    const body    = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);
    // ── CHANGE THIS TO YOUR REAL EMAIL ──
    window.location.href = `mailto:shakilahmedxunayeed@gmail.com?subject=${subject}&body=${body}`;
  });
}
