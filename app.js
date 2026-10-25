'use strict';
const COLORS={black:{name:'Чорний',hex:'#20211f'},white:{name:'Білий',hex:'#f4f0e6'},red:{name:'Червоний',hex:'#9b2b3c'},pink:{name:'Рожевий',hex:'#d9a0b6'},gold:{name:'Золотий',hex:'#b59b64'}};
const VIEWS={front:'Спереду',side:'Збоку',back:'Зі спини',detail:'Крупний план'};
const SIZES=['XS','S','M','L','XL','За мірками'];
const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let category='all',colorFilter='all',current=null,currentColor='gold',currentView='front',currentSize='За мірками',toastTimer;
const cardColors=new Map(PRODUCTS.map(p=>[p.id,p.colors.includes('black')?'black':p.colors[0]]));
let selection=[];
try{const stored=JSON.parse(localStorage.getItem('hansy-santa-selection-v1')||'[]');if(Array.isArray(stored))selection=stored.filter(x=>x&&PRODUCTS.some(p=>p.id===x.id&&p.colors.includes(x.color))&&SIZES.includes(x.size)).slice(0,35).map(({id,color,size})=>({id,color,size}));}catch{}
function toast(message){$('#toast').textContent=message;$('#toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),3200);}
function showDialog(id){const d=document.getElementById(id);if(!d.open)d.showModal();document.body.classList.add('locked');}
function closeDialog(id){document.getElementById(id).close();syncLock();}
function syncLock(){document.body.classList.toggle('locked',!!document.querySelector('dialog[open]'));$('.menu-trigger').setAttribute('aria-expanded',$('#mobile-menu').open?'true':'false');}
function swatch(color,active,extra=''){return `<button class="swatch ${active?'active':''}" style="--swatch:${COLORS[color].hex}" aria-label="${COLORS[color].name}" aria-pressed="${active}" title="${COLORS[color].name}" data-color="${color}" ${extra}></button>`;}
function renderGrid(){
 const list=PRODUCTS.filter(p=>(category==='all'||p.category===category)&&(colorFilter==='all'||p.colors.includes(colorFilter)));
 $('#results-count').textContent=String(list.length).padStart(2,'0')+' '+(list.length===1?'СИЛУЕТ':'СИЛУЕТІВ');
 $('#product-grid').innerHTML=list.map(p=>{
  const c=colorFilter==='all'?cardColors.get(p.id):colorFilter;
  return `<article class="product-card" data-product="${p.id}"><button class="card-image-button" data-open="${p.id}" aria-label="Переглянути ${p.name}"><img src="${p.images[c].front}" alt="${p.name} — ${COLORS[c].name}, спереду" loading="lazy" width="1024" height="1536"><span class="card-number">SANTA / 0${p.id}</span><span class="card-view" aria-hidden="true">↗</span></button><div class="card-heading"><button data-open="${p.id}"><h3>${p.name}</h3></button><span class="card-type">${p.category==='maxi'?'MAXI':'MINI'}</span></div><p class="card-subtitle">${p.subtitle}</p><div class="card-bottom"><div class="swatches" role="group" aria-label="Кольори ${p.name}">${p.colors.map(col=>swatch(col,col===c,`data-card="${p.id}"`)).join('')}</div><span class="card-price">Ціна за запитом</span></div></article>`;
 }).join('');
}
$('#product-grid').addEventListener('click',e=>{
 const sw=e.target.closest('[data-card]');
 if(sw){const id=Number(sw.dataset.card),c=sw.dataset.color;cardColors.set(id,c);const card=sw.closest('.product-card'),p=PRODUCTS.find(x=>x.id===id);const img=card.querySelector('img');img.src=p.images[c].front;img.alt=`${p.name} — ${COLORS[c].name}, спереду`;card.querySelectorAll('.swatch').forEach(b=>{b.classList.toggle('active',b===sw);b.setAttribute('aria-pressed',b===sw?'true':'false');});return;}
 const open=e.target.closest('[data-open]');if(open)openProduct(Number(open.dataset.open));
});
document.querySelectorAll('[data-category]').forEach(b=>b.addEventListener('click',()=>{category=b.dataset.category;document.querySelectorAll('[data-category]').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',x===b?'true':'false');});renderGrid();}));
$('#color-filter').addEventListener('change',e=>{colorFilter=e.target.value;renderGrid();});
function openProduct(id){current=PRODUCTS.find(p=>p.id===id);if(!current)return;currentColor=colorFilter!=='all'&&current.colors.includes(colorFilter)?colorFilter:cardColors.get(id);currentView='front';currentSize='За мірками';$('#product-number').textContent=`SANTA COLLECTION / 0${current.id}`;$('#product-title').textContent=current.name;$('#product-subtitle').textContent=current.subtitle;$('#product-description').textContent=current.description;renderProduct();showDialog('product-dialog');}
function renderProduct(){
 $('#current-color').textContent=COLORS[currentColor].name;$('#color-position').textContent=`${current.colors.indexOf(currentColor)+1} / ${current.colors.length}`;
 $('#product-colors').innerHTML=current.colors.map(c=>swatch(c,c===currentColor)).join('');
 $('#product-sizes').innerHTML=SIZES.map(s=>`<button class="size-button ${s===currentSize?'active':''}" aria-pressed="${s===currentSize}" data-size="${s}">${s}</button>`).join('');
 renderPhoto();
}
function renderPhoto(){
 const images=current.images[currentColor];if(!images[currentView])currentView='front';
 $('#product-image').src=images[currentView];$('#product-image').alt=`${current.name} — ${COLORS[currentColor].name}, ${VIEWS[currentView].toLowerCase()}`;
 $('#view-caption').textContent=VIEWS[currentView];
 $('#thumbnails').innerHTML=Object.entries(VIEWS).filter(([v])=>images[v]).map(([v,n])=>`<button class="thumbnail ${v===currentView?'active':''}" aria-label="${n}" aria-pressed="${v===currentView}" data-view="${v}"><img src="${images[v]}" alt="${n}" width="1024" height="1536"></button>`).join('');
}
$('#product-colors').addEventListener('click',e=>{const b=e.target.closest('[data-color]');if(!b)return;currentColor=b.dataset.color;renderProduct();});
$('#product-sizes').addEventListener('click',e=>{const b=e.target.closest('[data-size]');if(!b)return;currentSize=b.dataset.size;$('#product-sizes').querySelectorAll('button').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',x===b?'true':'false');});});
$('#thumbnails').addEventListener('click',e=>{const b=e.target.closest('[data-view]');if(b){currentView=b.dataset.view;renderPhoto();}});
function advanceView(delta){const views=Object.keys(VIEWS).filter(v=>current.images[currentColor][v]);currentView=views[(views.indexOf(currentView)+delta+views.length)%views.length];renderPhoto();}
$('#prev-view').addEventListener('click',()=>advanceView(-1));$('#next-view').addEventListener('click',()=>advanceView(1));
$('#product-dialog').addEventListener('keydown',e=>{if(e.target.closest('select,textarea,input'))return;if(e.key==='ArrowLeft'){e.preventDefault();advanceView(-1);}if(e.key==='ArrowRight'){e.preventDefault();advanceView(1);}});
$('#zoom-image').addEventListener('click',()=>{$('#lightbox-image').src=$('#product-image').src;$('#lightbox-image').alt=$('#product-image').alt;showDialog('lightbox');});
function saveSelection(){try{localStorage.setItem('hansy-santa-selection-v1',JSON.stringify(selection));}catch{toast('Браузер не дозволяє зберегти обране між відвідуваннями.');}renderBag();}
$('#add-selection').addEventListener('click',()=>{if(selection.some(x=>x.id===current.id&&x.color===currentColor&&x.size===currentSize)){toast('Цю модель вже збережено в обраному.');return;}selection.push({id:current.id,color:currentColor,size:currentSize});saveSelection();toast(`${current.name} · ${COLORS[currentColor].name} — збережено`);});
function renderBag(){
 $('#bag-count').textContent=selection.length;$('#bag-next').hidden=!selection.length;$('#inquiry').hidden=true;
 $('#bag-items').innerHTML=selection.length?selection.map((item,i)=>{const p=PRODUCTS.find(x=>x.id===item.id);return `<article class="bag-item"><img src="${p.images[item.color].front}" alt="${p.name} — ${COLORS[item.color].name}" width="1024" height="1536"><div><h3>${p.name}</h3><p>${COLORS[item.color].name} · ${esc(item.size)}</p><p>Ціна за запитом</p></div><button class="remove-item" data-remove="${i}" aria-label="Видалити ${p.name}">×</button></article>`;}).join(''):'<div class="bag-empty">Тут буде ваша Santa.<button class="text-link" id="browse-from-bag">Перейти до колекції ↗</button></div>';
}
$('.selection-trigger').addEventListener('click',()=>{renderBag();showDialog('bag-dialog');});
$('#bag-items').addEventListener('click',e=>{const b=e.target.closest('[data-remove]');if(b){selection.splice(Number(b.dataset.remove),1);saveSelection();}if(e.target.closest('#browse-from-bag')){closeDialog('bag-dialog');$('#catalog').scrollIntoView({behavior:'smooth'});}});
$('#prepare-inquiry').addEventListener('click',()=>{const lines=selection.map(x=>{const p=PRODUCTS.find(p=>p.id===x.id);return `${p.name} (модель ${p.id}) — ${COLORS[x.color].name}, розмір: ${x.size}.`;});$('#inquiry-text').value='Вітаю, HANSY! Мене цікавлять моделі з колекції Santa:\n\n'+lines.join('\n')+'\n\nПідкажіть, будь ласка, вартість, терміни пошиву та умови доставки.';$('#inquiry').hidden=false;$('#inquiry').scrollIntoView({behavior:'smooth',block:'nearest'});});
$('#copy-inquiry').addEventListener('click',async()=>{try{if(navigator.clipboard&&window.isSecureContext){await navigator.clipboard.writeText($('#inquiry-text').value);}else{$('#inquiry-text').focus();$('#inquiry-text').select();if(!document.execCommand('copy'))throw new Error('copy');}toast('Текст скопійовано. Надішліть його в Instagram Direct.');}catch{$('#inquiry-text').focus();$('#inquiry-text').select();toast('Виділіть і скопіюйте текст запиту вручну.');}});
const INFO={delivery:{title:'Доставка та оплата',body:'<p>HANSY працює з клієнтками в Україні та здійснює міжнародну доставку.</p><p>Перед оформленням замовлення ательє підтвердить вартість сукні, терміни виготовлення, спосіб і вартість доставки та умови оплати.</p><p>Для індивідуального пошиву всі деталі узгоджуються особисто. Напишіть нам у Direct, щоб отримати актуальну інформацію для вашої країни.</p>'},size:{title:'Розміри та мірки',body:'<p>У колекції можна обрати XS–XL або варіант «За мірками». Остаточний розмір і посадку підтверджує ательє під час консультації.</p><p>Для початку підготуйте:</p><ul><li>Обхват грудей по найбільш виступаючих точках.</li><li>Обхват талії по найвужчій частині.</li><li>Обхват стегон по найбільш виступаючих точках.</li><li>Ваш зріст і бажану довжину сукні з урахуванням взуття.</li></ul><p>Якщо не впевнені у вимірюванні — оберіть «За мірками». Ми допоможемо уточнити деталі.</p>'},care:{title:'Догляд за сукнею',body:'<p>Кристальне оздоблення потребує делікатного поводження. Уникайте тертя об грубі поверхні й зачепів прикрасами.</p><p>Точний спосіб очищення залежить від матеріалу та оздоблення конкретної сукні. Дотримуйтеся інструкції ательє й рекомендацій на виробі; перед очищенням уточніть їх у HANSY.</p><p>Для зберігання використовуйте захисний чохол і бережіть сукню від вологи та прямого сонячного світла.</p>'}};
document.addEventListener('click',e=>{const close=e.target.closest('[data-close]');if(close)closeDialog(close.dataset.close);const info=e.target.closest('[data-info]');if(info){const data=INFO[info.dataset.info];$('#info-title').textContent=data.title;$('#info-content').innerHTML=data.body;showDialog('info-dialog');}});
document.querySelectorAll('dialog').forEach(d=>{d.addEventListener('close',syncLock);d.addEventListener('click',e=>{if(e.target!==d)return;const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeDialog(d.id);});});
$('.menu-trigger').addEventListener('click',()=>{showDialog('mobile-menu');syncLock();});
$('#mobile-menu').querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>closeDialog('mobile-menu')));
renderGrid();renderBag();
