/* =========================================================
   LOADER
========================================================= */
(function(){
  const loader = document.getElementById('loader');
  const fill = document.querySelector('.loader-bar-fill');
  const pct = document.querySelector('.loader-percent');
  let progress = 0;
  const interval = setInterval(()=>{
    progress += Math.random()*18;
    if(progress >= 100){
      progress = 100;
      clearInterval(interval);
      setTimeout(()=>{
        loader.classList.add('hidden');
        document.body.style.overflow = '';
        startPageAnimations();
      }, 350);
    }
    fill.style.width = progress + '%';
    pct.textContent = Math.floor(progress) + '%';
  }, 140);
  document.body.style.overflow = 'hidden';
})();

/* =========================================================
   CUSTOM CURSOR
========================================================= */
(function(){
  const dot = document.querySelector('.cursor-dot');
  const ring = document.querySelector('.cursor-ring');
  if(!dot || window.matchMedia('(pointer:coarse)').matches) return;

  let mx=0,my=0,rx=0,ry=0;
  window.addEventListener('mousemove', e=>{
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx+'px'; dot.style.top = my+'px';
  });
  function loop(){
    rx += (mx-rx)*0.18;
    ry += (my-ry)*0.18;
    ring.style.left = rx+'px'; ring.style.top = ry+'px';
    requestAnimationFrame(loop);
  }
  loop();

  const hoverables = 'a, button, .project-card, .skill-bar, input, textarea, .cert-card, .achieve-card';
  document.addEventListener('mouseover', e=>{
    if(e.target.closest(hoverables)) ring.classList.add('active');
  });
  document.addEventListener('mouseout', e=>{
    if(e.target.closest(hoverables)) ring.classList.remove('active');
  });
})();

/* =========================================================
   PARTICLE / CIRCUIT BACKGROUND
========================================================= */
(function(){
  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas.getContext('2d');
  let w,h,particles=[];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function resize(){
    w = canvas.width = window.innerWidth;
    h = canvas.height = document.documentElement.scrollHeight;
  }
  function initParticles(){
    const count = Math.min(70, Math.floor(w/22));
    particles = Array.from({length:count}, ()=>({
      x: Math.random()*w,
      y: Math.random()*h,
      vx: (Math.random()-0.5)*0.25,
      vy: (Math.random()-0.5)*0.25,
      r: Math.random()*1.6+0.6
    }));
  }
  function draw(){
    ctx.clearRect(0,0,w,h);
    ctx.fillStyle = 'rgba(201,154,30,0.55)';
    for(const p of particles){
      p.x += p.vx; p.y += p.vy;
      if(p.x<0||p.x>w) p.vx*=-1;
      if(p.y<0||p.y>h) p.vy*=-1;
      ctx.beginPath();
      ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fill();
    }
    for(let i=0;i<particles.length;i++){
      for(let j=i+1;j<particles.length;j++){
        const a=particles[i], b=particles[j];
        const dx=a.x-b.x, dy=a.y-b.y;
        const dist = Math.sqrt(dx*dx+dy*dy);
        if(dist < 130){
          ctx.strokeStyle = `rgba(201,154,30,${0.12*(1-dist/130)})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x,a.y);
          ctx.lineTo(b.x,b.y);
          ctx.stroke();
        }
      }
    }
    if(!reduceMotion) requestAnimationFrame(draw);
  }
  window.addEventListener('resize', ()=>{ resize(); initParticles(); });
  resize(); initParticles();
  if(!reduceMotion){ draw(); } else { draw(); }
})();

/* =========================================================
   NAV: scroll state + mobile menu
========================================================= */
(function(){
  const nav = document.getElementById('nav');
  window.addEventListener('scroll', ()=>{
    nav.classList.toggle('scrolled', window.scrollY > 30);
  });

  const toggle = document.getElementById('navToggle');
  const menu = document.getElementById('mobileMenu');
  toggle.addEventListener('click', ()=>{
    menu.classList.toggle('open');
  });
  menu.querySelectorAll('a').forEach(a=>{
    a.addEventListener('click', ()=> menu.classList.remove('open'));
  });
})();

/* =========================================================
   MAIN PAGE ANIMATIONS (post-loader)
========================================================= */
function startPageAnimations(){

  AOS.init({
    duration: 800,
    easing: 'ease-out-cubic',
    once: true,
    offset: 60
  });

  // Typed.js rotating role strings
  if(window.Typed){
    new Typed('#typed', {
      strings: [
        'securing systems, one layer at a time',
        'building with AI, IoT & the web',
        'turning problems into working code',
        'ready for the next hackathon'
      ],
      typeSpeed: 42,
      backSpeed: 22,
      backDelay: 1600,
      loop: true,
      showCursor: false
    });
  }

  // Hero entrance (GSAP)
  if(window.gsap){
    gsap.registerPlugin(ScrollTrigger);

    gsap.from('.hero-photo-frame', {
      opacity:0, scale:0.9, y:30, duration:1.1, ease:'power3.out', delay:0.1
    });

    // Skill bars fill on scroll
    document.querySelectorAll('.skill-bar').forEach(bar=>{
      const level = bar.getAttribute('data-level');
      const fill = bar.querySelector('.skill-fill');
      ScrollTrigger.create({
        trigger: bar,
        start: 'top 85%',
        once: true,
        onEnter: ()=>{ fill.style.width = level + '%'; }
      });
    });

    // Section headers subtle parallax
    gsap.utils.toArray('.section-head h2').forEach(el=>{
      gsap.from(el, {
        y: 26, opacity: 0, duration: 0.9, ease:'power3.out',
        scrollTrigger:{ trigger: el, start:'top 88%' }
      });
    });
  } else {
    // fallback if GSAP fails to load
    document.querySelectorAll('.skill-bar').forEach(bar=>{
      bar.querySelector('.skill-fill').style.width = bar.getAttribute('data-level') + '%';
    });
  }

  animateCounters();
  initProjectGlow();
}

/* =========================================================
   ABOUT STATS COUNTER
========================================================= */
function animateCounters(){
  const nums = document.querySelectorAll('.stat-num');
  if(!nums.length) return;
  const observer = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        const el = entry.target;
        const target = parseInt(el.getAttribute('data-count'), 10);
        const suffix = el.getAttribute('data-suffix') || '';
        let cur = 0;
        const step = Math.max(1, Math.round(target/40));
        const tick = ()=>{
          cur += step;
          if(cur >= target){ cur = target; el.textContent = cur + suffix; return; }
          el.textContent = cur + suffix;
          requestAnimationFrame(tick);
        };
        tick();
        observer.unobserve(el);
      }
    });
  }, {threshold:0.5});
  nums.forEach(n=>observer.observe(n));
}

/* =========================================================
   PROJECT CARD MOUSE GLOW
========================================================= */
function initProjectGlow(){
  document.querySelectorAll('.project-card').forEach(card=>{
    card.addEventListener('mousemove', e=>{
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX-rect.left)+'px');
      card.style.setProperty('--my', (e.clientY-rect.top)+'px');
    });
  });
}

/* =========================================================
   CONTACT FORM (front-end only demo submit)
========================================================= */
(function(){
  const form = document.getElementById('contactForm');
  const note = document.getElementById('formNote');
  if(!form) return;
  form.addEventListener('submit', e=>{
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"] span');
    const original = btn.textContent;
    btn.textContent = 'Sending...';
    setTimeout(()=>{
      btn.textContent = original;
      note.textContent = "Thanks — that's saved locally in this demo. Connect a backend or mailto link to make it live.";
      form.reset();
    }, 900);
  });
})();

/* =========================================================
   FOOTER YEAR
========================================================= */
document.getElementById('year').textContent = new Date().getFullYear();
