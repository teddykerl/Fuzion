/* ==========================================================
   JJ ESSENCE — admin.js
   Owner/admin editing: passcode-gated edit mode, click-to-swap
   product/logo/bio images, click-to-edit text, safe storage
   (falls back to in-memory if localStorage is blocked, e.g. on
   file:// pages), and the initial product render.
   Load this AFTER main.js.
   ========================================================== */

/* =========================================================
   ADMIN MODE: toggle, image swap, editable text, persistence
   ========================================================= */
const STORAGE_PREFIX = 'jjessence_';
const adminToggle = document.getElementById('adminToggle');
const fileInput = document.getElementById('fileInput');
let currentEditTarget = null;

/* Safe storage wrapper: some browsers (esp. opening the file directly via
   file:// instead of hosting it) block localStorage entirely. Fall back to
   an in-memory store so admin editing still works during the session even
   if it can't persist across a reload. */
const memoryStore = {};
let storageWarned = false;
const safeStorage = {
  get(key){
    try{ return localStorage.getItem(key); }
    catch(e){ return Object.prototype.hasOwnProperty.call(memoryStore,key) ? memoryStore[key] : null; }
  },
  set(key, val){
    try{ localStorage.setItem(key, val); }
    catch(e){
      memoryStore[key] = val;
      if(!storageWarned){
        storageWarned = true;
        console.warn('JJ Essence: localStorage unavailable (likely because the file was opened directly instead of hosted). Edits will work for this session but will not be saved after closing the page.');
      }
    }
  },
  remove(key){
    try{ localStorage.removeItem(key); }catch(e){ delete memoryStore[key]; }
  },
  allKeys(){
    let keys = [];
    try{ keys = Object.keys(localStorage); }catch(e){ /* ignore */ }
    return keys.concat(Object.keys(memoryStore));
  }
};

function isAdmin(){ return document.body.classList.contains('admin-mode'); }

adminToggle.addEventListener('click', ()=>{
  console.log('JJ Essence: admin button clicked, currently admin =', isAdmin());
  if(!isAdmin()){
    const pass = prompt("Enter admin passcode to edit this site:\n(hint: jackie)");
    if(pass === null) return;
    if(pass.trim().toLowerCase() !== 'jackie'){ alert("Incorrect passcode. Try again — hint: it's Jackie's name, lowercase."); return; }
  }
  document.body.classList.toggle('admin-mode');
  adminToggle.classList.toggle('active');
  adminToggle.textContent = isAdmin() ? '✓ Editing On' : '🔒 Admin';
  bindAdminEditables();
  if(isAdmin()){
    alert('Editing is on! Click any product photo, the logo, or the bio photos to swap them. Click any name, price, or bio text to type over it.');
  }
});

/* clicking a product image overlay opens file picker */
hscroll.addEventListener('click', (e)=>{
  const btn = e.target.closest('.admin-edit-btn');
  if(!btn || !isAdmin()) return;
  currentEditTarget = btn.dataset.target;
  fileInput.click();
});

/* about-section images: allow swap in admin mode too */
document.querySelectorAll('.ag-item img').forEach(img=>{
  img.style.cursor='pointer';
  img.addEventListener('click', ()=>{
    if(!isAdmin()) return;
    currentEditTarget = 'about-' + (img.closest('.ag-main') ? 'main' : 'sub');
    fileInput.click();
  });
});
document.querySelector('.nav-brand img').addEventListener('click', ()=>{
  if(!isAdmin()) return;
  currentEditTarget = 'logo';
  fileInput.click();
});

fileInput.addEventListener('change', (e)=>{
  const file = e.target.files[0];
  if(!file || !currentEditTarget) return;
  const reader = new FileReader();
  reader.onload = (ev)=>{
    const dataUrl = ev.target.result;
    applyImage(currentEditTarget, dataUrl);
    safeStorage.set(STORAGE_PREFIX + 'img_' + currentEditTarget, dataUrl);
  };
  reader.readAsDataURL(file);
  fileInput.value = '';
});

function applyImage(target, url){
  if(target === 'logo'){
    document.querySelectorAll('.nav-brand img, .foot-brand img').forEach(img=>img.src=url);
  } else if(target === 'about-main'){
    document.querySelector('.ag-main video')?.remove();
    let img = document.querySelector('.ag-main img');
    if(!img){ img = document.createElement('img'); document.querySelector('.ag-main').appendChild(img); }
    img.src = url;
  } else if(target === 'about-sub'){
    document.querySelector('.ag-sub img').src = url;
  } else {
    const img = document.getElementById('img-' + target);
    if(img) img.src = url;
  }
}

function applyStoredOverrides(){
  PRODUCTS.forEach(p=>{
    const saved = safeStorage.get(STORAGE_PREFIX + 'img_' + p.id);
    if(saved) applyImage(p.id, saved);
  });
  const logoSaved = safeStorage.get(STORAGE_PREFIX + 'img_logo');
  if(logoSaved) applyImage('logo', logoSaved);
  const mainSaved = safeStorage.get(STORAGE_PREFIX + 'img_about-main');
  if(mainSaved) applyImage('about-main', mainSaved);
  const subSaved = safeStorage.get(STORAGE_PREFIX + 'img_about-sub');
  if(subSaved) applyImage('about-sub', subSaved);

  /* text overrides */
  document.querySelectorAll('[data-key]').forEach(el=>{
    const saved = safeStorage.get(STORAGE_PREFIX + 'txt_' + el.dataset.key);
    if(saved) el.textContent = saved;
  });
  const bioSaved = safeStorage.get(STORAGE_PREFIX + 'txt_bio');
  if(bioSaved) document.getElementById('bioText').textContent = bioSaved;
  ['statCustomers','statProducts','statCity'].forEach(id=>{
    const saved = safeStorage.get(STORAGE_PREFIX + 'txt_' + id);
    if(saved) document.getElementById(id).textContent = saved;
  });
}

function bindAdminEditables(){
  const editableEls = [
    ...document.querySelectorAll('[data-key]'),
    document.getElementById('bioText'),
    document.getElementById('statCustomers'),
    document.getElementById('statProducts'),
    document.getElementById('statCity'),
  ].filter(Boolean);

  editableEls.forEach(el=>{
    el.setAttribute('contenteditable', isAdmin() ? 'true' : 'false');
    el.oninput = null;
    if(isAdmin()){
      el.addEventListener('blur', function saveHandler(){
        const key = this.dataset.key || this.id;
        safeStorage.set(STORAGE_PREFIX + 'txt_' + key, this.textContent.trim());
      });
    }
  });
}

document.getElementById('admin-reset').addEventListener('click', ()=>{
  if(!confirm('Reset ALL image and text edits back to default? This cannot be undone.')) return;
  safeStorage.allKeys().filter(k=>k.startsWith(STORAGE_PREFIX)).forEach(k=>safeStorage.remove(k));
  location.reload();
});

/* Now that PRODUCTS/renderProducts (main.js) and the admin helpers above both
   exist, do the initial product render — this also applies any saved edits
   and wires up the contenteditable bindings. */
renderProducts();
