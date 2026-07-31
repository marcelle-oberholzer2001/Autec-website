// Mobile navigation
const menuToggle=document.querySelector('.menu-toggle');const mainNav=document.querySelector('.main-nav');if(menuToggle&&mainNav){menuToggle.addEventListener('click',()=>{const open=mainNav.classList.toggle('open');menuToggle.setAttribute('aria-expanded',open?'true':'false')});}
// Active navigation fallback
const currentPage=location.pathname.split('/').pop()||'index.html';document.querySelectorAll('.main-nav a').forEach(a=>{if(a.getAttribute('href')===currentPage){a.classList.add('active')}});
// Scroll reveal animations
const revealEls=document.querySelectorAll('.reveal');const revealObserver=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');revealObserver.unobserve(entry.target)}})},{threshold:.12});revealEls.forEach(el=>revealObserver.observe(el));
// Gallery lightbox
const galleryItems=[...document.querySelectorAll('.gallery-item')];const lightbox=document.querySelector('.lightbox');if(galleryItems.length&&lightbox){const img=lightbox.querySelector('img');const close=lightbox.querySelector('.lightbox-close');const prev=lightbox.querySelector('.lightbox-prev');const next=lightbox.querySelector('.lightbox-next');let index=0;const openLightbox=i=>{index=i;img.src=galleryItems[index].src;img.alt=galleryItems[index].alt;lightbox.classList.add('open');lightbox.setAttribute('aria-hidden','false');document.body.style.overflow='hidden'};const closeLightbox=()=>{lightbox.classList.remove('open');lightbox.setAttribute('aria-hidden','true');document.body.style.overflow=''};const move=step=>{index=(index+step+galleryItems.length)%galleryItems.length;img.src=galleryItems[index].src;img.alt=galleryItems[index].alt};galleryItems.forEach((item,i)=>item.addEventListener('click',()=>openLightbox(i)));close.addEventListener('click',closeLightbox);prev.addEventListener('click',()=>move(-1));next.addEventListener('click',()=>move(1));lightbox.addEventListener('click',e=>{if(e.target===lightbox)closeLightbox()});document.addEventListener('keydown',e=>{if(!lightbox.classList.contains('open'))return;if(e.key==='Escape')closeLightbox();if(e.key==='ArrowLeft')move(-1);if(e.key==='ArrowRight')move(1)});}
// Product photo carousel (swipe + arrows + dots + filename caption)
document.querySelectorAll('.product-photos').forEach(track=>{const slides=[...track.querySelectorAll('img')];if(!slides.length)return;const wrap=document.createElement('div');wrap.className='gallery-wrap';track.parentNode.insertBefore(wrap,track);wrap.appendChild(track);const caption=document.createElement('p');caption.className='product-photo-caption';wrap.appendChild(caption);const photoName=img=>{const file=decodeURIComponent(img.src.split('/').pop()||'');const name=file.replace(/\.[^.]+$/,'').replace(/\s*-\s*Copy$/i,'').replace(/\s*\(\d+\)\s*$/,'').trim();return name||img.alt;};const current=()=>Math.max(0,Math.min(slides.length-1,Math.round(track.scrollLeft/track.clientWidth)));let prev=null;let next=null;let dotEls=[];const update=()=>{const c=current();caption.textContent=photoName(slides[c]);dotEls.forEach((d,i)=>d.classList.toggle('active',i===c));if(prev)prev.disabled=c<=0;if(next)next.disabled=c>=slides.length-1;};if(slides.length>1){const makeBtn=(cls,html,label)=>{const b=document.createElement('button');b.type='button';b.className='gallery-nav '+cls;b.setAttribute('aria-label',label);b.innerHTML=html;wrap.appendChild(b);return b;};prev=makeBtn('gallery-prev','&#8249;','Previous photo');next=makeBtn('gallery-next','&#8250;','Next photo');const dots=document.createElement('div');dots.className='gallery-dots';wrap.appendChild(dots);dotEls=slides.map((_,i)=>{const d=document.createElement('button');d.type='button';d.className='gallery-dot';d.setAttribute('aria-label','Go to photo '+(i+1));d.addEventListener('click',()=>track.scrollTo({left:track.clientWidth*i,behavior:'smooth'}));dots.appendChild(d);return d;});prev.addEventListener('click',()=>track.scrollTo({left:track.clientWidth*(current()-1),behavior:'smooth'}));next.addEventListener('click',()=>track.scrollTo({left:track.clientWidth*(current()+1),behavior:'smooth'}));}let raf;track.addEventListener('scroll',()=>{cancelAnimationFrame(raf);raf=requestAnimationFrame(update)});window.addEventListener('resize',update);update();});
// Static form feedback before Web3Forms submission
const form=document.querySelector('.contact-form');if(form){const serviceBoxes=[...form.querySelectorAll('input[name="services[]"]')];const msg=form.querySelector('.form-message');const submitButton=form.querySelector('button[type="submit"]');const successModal=document.createElement('div');successModal.className='success-modal';successModal.setAttribute('aria-hidden','true');successModal.innerHTML='<div class="success-modal-panel" role="dialog" aria-modal="true" aria-labelledby="success-modal-title"><button class="success-modal-close" type="button" aria-label="Close success message">&times;</button><p class="section-kicker">Quote Request Sent</p><h3 id="success-modal-title">Message successfully sent.</h3><p>Thank you for your enquiry. SA Autec Industries will review your request and respond shortly.</p><button class="btn btn-primary success-modal-ok" type="button">Close</button></div>';document.body.appendChild(successModal);const closeSuccess=()=>{successModal.classList.remove('open');successModal.setAttribute('aria-hidden','true');document.body.style.overflow=''};const openSuccess=()=>{successModal.classList.add('open');successModal.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';successModal.querySelector('.success-modal-ok').focus()};successModal.querySelector('.success-modal-close').addEventListener('click',closeSuccess);successModal.querySelector('.success-modal-ok').addEventListener('click',closeSuccess);successModal.addEventListener('click',e=>{if(e.target===successModal)closeSuccess()});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&successModal.classList.contains('open'))closeSuccess()});const requestedService=new URLSearchParams(location.search).get('service');if(requestedService){serviceBoxes.forEach(box=>{if(box.value.toLowerCase()===requestedService.toLowerCase())box.checked=true});}const updateServiceValidity=()=>{if(!serviceBoxes.length)return;const checked=serviceBoxes.some(box=>box.checked);serviceBoxes[0].setCustomValidity(checked?'':'Please select at least one service or product.');};serviceBoxes.forEach(box=>box.addEventListener('change',updateServiceValidity));updateServiceValidity();form.addEventListener('submit',async e=>{e.preventDefault();updateServiceValidity();if(!form.checkValidity()){form.reportValidity();return;}if(msg)msg.textContent='Submitting your quote request...';if(submitButton)submitButton.disabled=true;try{const response=await fetch(form.action,{method:'POST',body:new FormData(form),headers:{Accept:'application/json'}});const result=await response.json();if(response.ok&&result.success){form.reset();updateServiceValidity();if(msg)msg.textContent='';openSuccess();}else{throw new Error(result.message||'Submission failed');}}catch(error){if(msg)msg.textContent='Something went wrong. Please try again or email admin@autec.co.za.';}finally{if(submitButton)submitButton.disabled=false;}});}

/* ═══ AUTEC · motion layer (progress bar, header shrink, parallax, counters, spotlight) ═══ */
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Scroll progress bar
  var bar = document.createElement('div');
  bar.className = 'scroll-progress';
  document.body.appendChild(bar);

  var header = document.querySelector('.site-header');
  var heroSlides = document.querySelector('.hero-cinematic .hero-slides');
  var ticking = false;

  function onScroll() {
    var y = window.scrollY || window.pageYOffset || 0;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(y / max, 1) : 0) + ')';
    if (header) header.classList.toggle('scrolled', y > 40);
    if (heroSlides && !reduce) heroSlides.style.transform = 'translateY(' + (y * 0.18) + 'px)';
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();

  // Stagger revealed children inside a shared parent
  document.querySelectorAll('.card-grid, .project-grid, .gallery-grid, .service-list').forEach(function (group) {
    group.querySelectorAll(':scope > .reveal').forEach(function (el, i) {
      el.style.setProperty('--i', i);
    });
  });

  // Animated count-up for stat numbers
  function animateCount(el) {
    var raw = el.getAttribute('data-count-raw') || el.textContent.trim();
    el.setAttribute('data-count-raw', raw);
    var m = raw.match(/^(\D*)(\d[\d,]*)(.*)$/);
    if (!m) return;                       // non-numeric labels (Multiple, Modular…) left as-is
    var pre = m[1], num = parseInt(m[2].replace(/,/g, ''), 10), suf = m[3];
    if (reduce) { el.textContent = raw; return; }
    var dur = 1400, start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var e = 1 - Math.pow(1 - p, 3);
      el.textContent = pre + Math.round(num * e).toLocaleString() + suf;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var numEls = document.querySelectorAll('.hero-trust-strip strong, .stats-grid strong');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { animateCount(en.target); io.unobserve(en.target); }
      });
    }, { threshold: 0.4 });
    numEls.forEach(function (el) { io.observe(el); });
  } else {
    numEls.forEach(animateCount);
  }

  // Cursor spotlight on cards
  if (!reduce && window.matchMedia('(pointer: fine)').matches) {
    document.querySelectorAll('.feature-card, .project-card').forEach(function (card) {
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        card.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });
  }

  // Safety net: if IntersectionObserver is missing, never leave content hidden
  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('visible'); });
  }
})();

/* Make each homepage capability card fully clickable. */
(function () {
  document.querySelectorAll('.feature-card').forEach(function (card) {
    var link = card.querySelector('a[href]');
    if (!link) return;
    card.addEventListener('click', function (e) {
      if (e.target.closest('a, button, input, textarea, select, label')) return;
      if (window.getSelection && String(window.getSelection()).length) return;
      window.location.href = link.href;
    });
  });
})();

/* Make each service block fully clickable (whole row → its CTA). */
(function () {
  document.querySelectorAll('.service-row').forEach(function (row) {
    var link = row.querySelector('a.btn') || row.querySelector('a[href]');
    if (!link) return;
    row.addEventListener('click', function (e) {
      // let real interactive elements behave normally
      if (e.target.closest('a, button, input, textarea, select, label')) return;
      // don't hijack a text selection
      if (window.getSelection && String(window.getSelection()).length) return;
      link.click();
    });
  });
})();

/* ═══ AUTEC · gallery captions from filenames (hover + lightbox) ═══ */
(function () {
  function clean(alt) {
    if (!alt) return '';
    var t = alt.replace(/^\s*SA Autec Industries gallery image:\s*/i, '').trim();
    t = t.replace(/\s*\(\d+\)\s*$/, '').trim();     // drop Windows duplicate suffix like " (2)", " (3)"
    if (/^gallery[\s-]*\d+$/i.test(t)) return '';   // still a placeholder filename → no caption
    return t;
  }
  document.querySelectorAll('.gallery-grid .gallery-item').forEach(function (img) {
    var text = clean(img.getAttribute('alt'));
    if (!text) return;
    if (img.parentElement && img.parentElement.classList.contains('gallery-figure')) return;
    var fig = document.createElement('figure');
    fig.className = 'gallery-figure';
    img.parentNode.insertBefore(fig, img);
    fig.appendChild(img);
    var cap = document.createElement('figcaption');
    cap.textContent = text;
    fig.appendChild(cap);
  });
  var lb = document.querySelector('.lightbox');
  if (lb) {
    var lbImg = lb.querySelector('img');
    var cap = document.createElement('p');
    cap.className = 'lightbox-caption';
    lb.appendChild(cap);
    var sync = function () {
      var t = clean(lbImg.getAttribute('alt'));
      cap.textContent = t;
      cap.style.display = t ? '' : 'none';
    };
    sync();
    new MutationObserver(sync).observe(lbImg, { attributes: true, attributeFilter: ['alt', 'src'] });
  }
})();

/* ═══ AUTEC · wear-part quote: prefill the contact message from ?item= ═══ */
(function () {
  var item = new URLSearchParams(location.search).get('item');
  if (!item) return;
  var ta = document.querySelector('.contact-form textarea[name="project_description"]');
  if (ta && !ta.value.trim()) ta.value = 'Wear parts / spares enquiry: ' + item;
})();
