/* ==========================================================
   JJ ESSENCE — main.js
   Core site behavior: preloader, nav, parallax, scroll reveals,
   product data + rendering, category tabs, horizontal scroll.
   Load this BEFORE admin.js.
   ========================================================== */

document.getElementById('year').textContent = new Date().getFullYear();

/* ---------- Preloader ---------- */
window.addEventListener('load', ()=>{
  setTimeout(()=>document.getElementById('preloader').classList.add('hide'), 500);
});

/* ---------- Nav scroll state + mobile toggle ---------- */
const navEl = document.getElementById('nav');
window.addEventListener('scroll', ()=>{
  navEl.classList.toggle('scrolled', window.scrollY > 40);
});
const burger = document.getElementById('burger');
const navLinks = document.getElementById('navLinks');
burger.addEventListener('click', ()=> navLinks.classList.toggle('open'));
navLinks.querySelectorAll('a').forEach(a=>a.addEventListener('click', ()=>navLinks.classList.remove('open')));

/* ---------- Parallax floating elements + mouse tilt on hero ---------- */
const floaties = document.querySelectorAll('.floaty');
window.addEventListener('scroll', ()=>{
  const y = window.scrollY;
  floaties.forEach(el=>{
    const speed = parseFloat(el.dataset.speed || 0.2);
    el.style.transform = `translateY(${y*speed*0.4}px)`;
  });
});
document.querySelector('.hero').addEventListener('mousemove', (e)=>{
  const {innerWidth:w, innerHeight:h} = window;
  const dx = (e.clientX - w/2)/w;
  const dy = (e.clientY - h/2)/h;
  floaties.forEach((el,i)=>{
    const factor = (i+1)*10;
    el.style.marginLeft = `${dx*factor}px`;
    el.style.marginTop = `${dy*factor}px`;
  });
});

/* ---------- Reveal on scroll ---------- */
const io = new IntersectionObserver((entries)=>{
  entries.forEach(en=>{ if(en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target);} });
},{threshold:0.15});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));

/* =========================================================
   PRODUCT DATA + RENDER + ADMIN IMAGE/TEXT EDITING
   ========================================================= */
const PRODUCTS = [
  {id:'tote-white-peach', cat:'totes', name:'Blossom Quilted Tote', price:'$42', desc:'White quilted tote with pink trim & peachy charm.', img:'images/tote-white-peach.jpg'},
  {id:'tote-leopard-brown', cat:'totes', name:'Wild Leopard Tote', price:'$38', desc:'Rich brown leopard print with a plush bear charm.', img:'images/tote-leopard-brown.jpg'},
  {id:'tote-graffiti-set', cat:'totes', name:'Graffiti Bear Tote', price:'$45', desc:'Playful hand-drawn print tote — 4 colorways available.', img:'images/tote-graffiti-set.jpg'},
  {id:'tote-bow-set', cat:'totes', name:'Ribbon Embroidered Tote', price:'$40', desc:'Dainty bow-embroidered tote — 5 dreamy shades.', img:'images/tote-bow-set.jpg'},
  {id:'tote-cream-cloud', cat:'totes', name:'Cloud Nine Tote', price:'$44', desc:'Cream scribble-embossed tote with a fluffy cloud charm.', img:'images/tote-cream-cloud.jpg'},
  {id:'tote-denim-bear', cat:'totes', name:'Denim Wash Tote', price:'$36', desc:'Stonewash denim-effect tote with a cuddly bear charm.', img:'images/tote-denim-bear.jpg'},
  {id:'tote-pink-cloud', cat:'totes', name:'Pink Sky Tote', price:'$44', desc:'Soft pink scribble tote finished with a cloud charm.', img:'images/tote-pink-cloud.jpg'},
  {id:'tote-cream-pompom', cat:'totes', name:'Ivory Charm Tote', price:'$46', desc:'Embossed ivory tote with pink trim & pompom charm.', img:'images/tote-cream-pompom.jpg'},
  {id:'lashes-individual', cat:'lashes', name:'Individual Cluster Lashes', price:'$14', desc:'Pro-grade individual lash clusters, full tray.', img:'images/lashes-individual.jpg'},
  {id:'lashes-fluffy-cluster', cat:'lashes', name:'Fluffy Lash Clusters', price:'$16', desc:'Feather-light fluffy clusters, 14mm–24mm mix.', img:'images/lashes-fluffy-cluster.jpg'},
  {id:'lashes-diy', cat:'lashes', name:'DIY Lash Extension Set', price:'$18', desc:'Salon-quality DIY lash strips for a full, wispy look.', img:'images/lashes-diy.jpg'},
  {id:'cup-pink-bow', cat:'sip', name:'Pink Bow Sip Cup', price:'$12', desc:'Glass sipper with handle, straw & a sweet pink bow.', img:'images/cup-pink-bow.jpg'},
  {id:'cups-bow-duo', cat:'sip', name:'Bow Sip Cup Duo', price:'$22', desc:'Set of two glass sippers with pink & green bow charms.', img:'images/cups-bow-duo.jpg'},
  {id:'perfume-set', cat:'fragrance', name:'Signature Perfume Gift Set', price:'$28', desc:'4-piece mini fragrance gift box — perfect to layer or gift.', img:'images/perfume-set.jpg'},
  {id:'warmer-pink', cat:'selfcare', name:'Smart Rose Hand Warmer', price:'$24', desc:'Rechargeable smart warm compress — cozy self-care essential.', img:'images/warmer-pink.jpg'},
];

const CAT_LABEL = {totes:'Totes & Bags', lashes:'Lash Extensions', sip:'Sip Collection', fragrance:'Fragrance', selfcare:'Self-Care'};

const hscroll = document.getElementById('hscroll');

function renderProducts(filter='all'){
  hscroll.innerHTML = '';
  PRODUCTS.filter(p => filter==='all' || p.cat===filter).forEach(p=>{
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <div class="card-img">
        <img id="img-${p.id}" src="${p.img}" alt="${p.name}">
        <span class="card-tag">${CAT_LABEL[p.cat]}</span>
        <div class="admin-edit-btn" data-target="${p.id}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 7h3l2-2h6l2 2h3v13H4z"/><circle cx="12" cy="13" r="4"/></svg>
          Change Photo
        </div>
      </div>
      <div class="card-body">
        <h4 contenteditable="false" data-key="name-${p.id}">${p.name}</h4>
        <p>${p.desc}</p>
        <div class="card-foot">
          <span class="price" contenteditable="false" data-key="price-${p.id}">${p.price}</span>
          <button class="buy-btn" onclick="window.open('https://wa.me/231000000000?text=Hi%20Jackie!%20I%27m%20interested%20in%20the%20${encodeURIComponent(p.name)}','_blank')">Enquire</button>
        </div>
      </div>`;
    hscroll.appendChild(card);
  });
  applyStoredOverrides();
  bindAdminEditables();
}

/* tab filtering */
document.getElementById('tabs').addEventListener('click', (e)=>{
  const btn = e.target.closest('.tab-btn');
  if(!btn) return;
  document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  renderProducts(btn.dataset.cat);
});

/* horizontal scroll controls + drag to scroll */
document.getElementById('scrollLeft').addEventListener('click', ()=> hscroll.scrollBy({left:-320, behavior:'smooth'}));
document.getElementById('scrollRight').addEventListener('click', ()=> hscroll.scrollBy({left:320, behavior:'smooth'}));

let isDown=false, startX, scrollLeftStart;
hscroll.addEventListener('mousedown', e=>{ isDown=true; startX=e.pageX; scrollLeftStart=hscroll.scrollLeft; });
window.addEventListener('mouseup', ()=> isDown=false);
hscroll.addEventListener('mouseleave', ()=> isDown=false);
hscroll.addEventListener('mousemove', e=>{
  if(!isDown) return;
  e.preventDefault();
  hscroll.scrollLeft = scrollLeftStart - (e.pageX - startX);
});
hscroll.addEventListener('wheel', (e)=>{
  if(Math.abs(e.deltaY) > Math.abs(e.deltaX)){
    e.preventDefault();
    hscroll.scrollLeft += e.deltaY;
  }
}, {passive:false});

