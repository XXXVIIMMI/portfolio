// ── SHAKIL AHMED PORTFOLIO — MAIN JAVASCRIPT ──

// ── NEURAL NETWORK LIVE WALLPAPER ──────────────────────────────
(function(){
  const canvas = document.getElementById('nn-canvas');
  const ctx = canvas.getContext('2d');
  let W, H, t = 0, animId;
  const isLiteDevice = window.matchMedia('(max-width: 700px), (hover: none) and (pointer: coarse), (prefers-reduced-motion: reduce)').matches;

  // Multi-color palette for nodes/edges
  const PALETTE = [
    {r:217,g:174,b:120},  // warm gold
    {r:196,g:150,b:90 },   // amber
    {r:123,g:198,b:255},   // ice blue
    {r:80, g:188,b:168},   // teal
    {r:245,g:236,b:223},   // parchment
    {r:101,g:111,b:124},   // slate
    {r:233,g:196,b:106},   // muted brass
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
  const LAYERS = isLiteDevice ? [4, 5, 6, 5, 3] : [4, 6, 8, 6, 3];
  let nodes = [];
  let pulses = [];

  function layerPalette(layerIndex){
    const last = LAYERS.length - 1;
    if(layerIndex === 0) return [
      {r:170,g:241,b:168},
      {r:143,g:232,b:140},
      {r:198,g:245,b:170}
    ];
    if(layerIndex === last) return [
      {r:244,g:223,b:82},
      {r:247,g:206,b:60},
      {r:255,g:233,b:131}
    ];
    return [
      {r:123,g:198,b:255},
      {r:96,g:165,b:250},
      {r:80,g:188,b:168},
      {r:217,g:174,b:120}
    ];
  }

  function resize(){
    W = canvas.offsetWidth; H = canvas.offsetHeight;
    canvas.width = W; canvas.height = H;
    buildNodes();
  }

  function buildNodes(){
    nodes = [];
    const isNarrow = W <= 700;
    const layerPositions = isNarrow
      ? [0.06, 0.27, 0.5, 0.73, 0.94]
      : [0.08, 0.28, 0.5, 0.72, 0.92];
    const sizeX = isNarrow ? 0.84 : 0.9;
    const sizeY = isNarrow ? 0.76 : 0.84;
    const topPad = isNarrow ? H * 0.08 : H * 0.08;
    const bottomPad = isNarrow ? H * 0.08 : H * 0.08;
    const usableHeight = Math.max(120, H - topPad - bottomPad);
    for(let l=0;l<LAYERS.length;l++){
      nodes.push([]);
      const count = LAYERS[l];
      const x = W * (0.5 + (layerPositions[l] - 0.5) * sizeX);
      const palette = layerPalette(l);
      const jitterX = isNarrow ? 0.35 : 0.5;
      const jitterY = isNarrow ? 0.9 : 1.1;
      const spread = count > 1 ? usableHeight * 0.86 * sizeY : 0;
      const top = H * 0.5 - spread * 0.5;
      for(let n=0;n<count;n++){
        const posT = count === 1 ? 0.5 : n / (count - 1);
        const baseY = count === 1 ? H * 0.5 : top + spread * posT;
        const rawX = x + Math.sin((l + n) * 1.3 + t * 0.2) * jitterX;
        const rawY = baseY + Math.cos((l * 0.8 + n) * 1.1 + t * 0.24) * jitterY;
        const col = palette[(n + l) % palette.length];
        nodes[l].push({x: rawX, y: rawY, col, phase: l*1.3+n*0.75, act:0, layer:l, index:n});
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

  function draw(){
    ctx.clearRect(0,0,W,H);
    t += 0.007;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const bgGlow = ctx.createRadialGradient(W * 0.25, H * 0.34, 0, W * 0.25, H * 0.34, Math.max(W, H) * 0.9);
    bgGlow.addColorStop(0, 'rgba(123,198,255,0.04)');
    bgGlow.addColorStop(0.42, 'rgba(196,150,90,0.06)');
    bgGlow.addColorStop(0.8, 'rgba(80,188,168,0.02)');
    bgGlow.addColorStop(1, 'rgba(9,9,11,0)');
    ctx.fillStyle = bgGlow;
    ctx.fillRect(0, 0, W, H);

    // Animate activations
    for(let l=0;l<LAYERS.length;l++)
      for(let n=0;n<LAYERS[l];n++){
        const nd = nodes[l][n];
        nd.act = 0.44 + 0.56*Math.abs(Math.sin(t*0.9 + nd.phase));
      }

    // Draw edges
    for(let l=0;l<LAYERS.length-1;l++){
      for(let a=0;a<LAYERS[l];a++){
        for(let b=0;b<LAYERS[l+1];b++){
          const n1=nodes[l][a], n2=nodes[l+1][b];
          const alpha = 0.05 + 0.055*n1.act*n2.act;
          const mid = lerpColor(n1.col, n2.col, 0.5);
          const grad = ctx.createLinearGradient(n1.x,n1.y,n2.x,n2.y);
          grad.addColorStop(0, rgba(n1.col, alpha));
          grad.addColorStop(0.4, rgba(mid, alpha*1.12));
          grad.addColorStop(0.68, 'rgba(245,236,223,0.08)');
          grad.addColorStop(1, rgba(n2.col, alpha));
          ctx.save();
          ctx.beginPath(); ctx.moveTo(n1.x,n1.y); ctx.lineTo(n2.x,n2.y);
          ctx.strokeStyle = grad; ctx.lineWidth = 1.08; ctx.globalAlpha = 0.22; ctx.stroke();
          ctx.beginPath(); ctx.moveTo(n1.x,n1.y); ctx.lineTo(n2.x,n2.y);
          ctx.strokeStyle = grad; ctx.lineWidth = 0.72; ctx.globalAlpha = 1; ctx.stroke();
          ctx.restore();
        }
      }
    }

    // Draw pulses
    pulses.forEach(p=>{
      const n1 = nodes[p.l][p.fi];
      const n2 = nodes[p.l+1][p.ti];
      const px=n1.x+(n2.x-n1.x)*p.prog;
      const py=n1.y+(n2.y-n1.y)*p.prog;
      const col = lerpColor(p.colA, p.colB, p.prog);
      const pulseR = 8.2;
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
    if(pulses.length < (isLiteDevice ? 12 : 20) && Math.random() < (isLiteDevice ? 0.18 : 0.24)) spawnPulse();

    // Draw nodes
    for(let l=0;l<LAYERS.length;l++){
      for(let n=0;n<LAYERS[l];n++){
        const nd=nodes[l][n], act=nd.act;
        const sx = nd.x + Math.sin(t*0.55+nd.phase)*0.85;
        const sy = nd.y + Math.cos(t*0.48+nd.phase*1.1)*0.85;
        const r = l === 0 || l === LAYERS.length - 1 ? 4.2 + act*1.1 : 3.2 + act*1.0;
        const glow=ctx.createRadialGradient(sx,sy,0,sx,sy,r*4);
        glow.addColorStop(0, rgba(nd.col, 0.34*act));
        glow.addColorStop(0.42, 'rgba(245,236,223,0.08)');
        glow.addColorStop(1, rgba(nd.col, 0));
        ctx.beginPath(); ctx.arc(sx,sy,r*4,0,Math.PI*2);
        ctx.fillStyle=glow; ctx.fill();

        ctx.beginPath();
        ctx.arc(sx,sy,r+1.2,0,Math.PI*2);
        ctx.strokeStyle = rgba(nd.col, 0.92);
        ctx.lineWidth = 1.05;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(sx,sy,r*0.72,0,Math.PI*2);
        ctx.fillStyle = l === LAYERS.length - 1
          ? rgba({r:255,g:241,b:163}, 0.95*act)
          : (l === 0 ? rgba({r:208,g:255,b:196}, 0.9*act) : rgba({r:255,g:255,b:255}, 0.86*act));
        ctx.fill();
      }
    }

    // Floating data particles
    const particleCount = isLiteDevice ? 8 : 14;
    for(let i=0;i<particleCount;i++){
      const angle=(i/particleCount)*Math.PI*2 + t*0.12 + Math.sin(t*0.3+i)*0.4;
      const radius = W*0.28 + Math.sin(t*0.5+i*0.7)*W*0.05;
      const px = W*0.5 + Math.cos(angle)*radius;
      const py = H*0.5 + Math.sin(angle*0.8)*H*0.28;
      const col = PALETTE[i % PALETTE.length];
      const a = 0.02 + 0.03*Math.abs(Math.sin(t+i*0.6));
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
