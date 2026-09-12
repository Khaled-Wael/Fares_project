// ============================= STATE =============================
let state = {
  nav: "home",
  overlay: null,         // null | "search" | "favorites"
  currentLesson: null,   // index in LESSONS
  tab: "vocab",          // vocab | situations | flash | quiz | sentences
  flashIndex: 0,
  flashFlipped: false,
  completed: new Set(),  // lesson numbers marked done (in-memory only)
  favorites: new Set(),  // keys "lessonIdx::deWord" (in-memory only)
  quiz: { pool: [], idx: 0, score: 0, answered: null, done: false, streak: 0, mode:"meaning" },
  mixedQuiz: { pool: [], idx: 0, score: 0, answered: null, streak: 0, mode:"meaning" },
  bestStreak: 0,
  speakingBtn: null,
};

const LESSON_ICONS = {1:"👋",2:"📚",3:"👕",4:"🎮",5:"🌍",6:"✏️",7:"🎵",8:"🎬",9:"🎂",10:"🍕",11:"🛍️",12:"🩺",13:"🏠",14:"⏰",15:"🚉",16:"✈️",17:"💼",18:"⛅"};

function speak(text, btn){
  try{
    if(!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const clean = text.replace(/\([^)]*\)/g,"").trim();
    const u = new SpeechSynthesisUtterance(clean);
    u.lang = "de-DE";
    u.rate = 0.88;
    if(btn){
      document.querySelectorAll(".speak-btn.speaking").forEach(b=>b.classList.remove("speaking"));
      btn.classList.add("speaking");
      u.onend = ()=> btn.classList.remove("speaking");
      u.onerror = ()=> btn.classList.remove("speaking");
    }
    window.speechSynthesis.speak(u);
  }catch(e){ /* speechSynthesis unavailable — fail silently */ }
}

function speakBtnHTML(){
  return `<button type="button" class="speak-btn" aria-label="استمع للنطق"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 5 6 9H3v6h3l5 4V5Z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18 6a9 9 0 0 1 0 12"/></svg></button>`;
}
function wireSpeak(container, text){
  const btn = container.querySelector(".speak-btn");
  if(btn) btn.addEventListener("click",(e)=>{ e.stopPropagation(); speak(text, btn); });
}

function fireConfetti(){
  if(typeof document === "undefined") return;
  const layer = document.getElementById("confettiLayer");
  if(!layer) return;
  const colors = ["#d6a94a","#c1503f","#63b98a","#6f9ceb","#f2ede2"];
  for(let i=0;i<36;i++){
    const p = document.createElement("div");
    p.className = "confetti-piece";
    const size = 6 + Math.random()*6;
    p.style.width = size+"px";
    p.style.height = (size*0.4)+"px";
    p.style.left = (Math.random()*100)+"vw";
    p.style.background = colors[Math.floor(Math.random()*colors.length)];
    p.style.animationDuration = (1.6 + Math.random()*1.2)+"s";
    p.style.animationDelay = (Math.random()*0.3)+"s";
    layer.appendChild(p);
    setTimeout(()=> p.remove(), 3200);
  }
}

const TOTAL_WORDS = LESSONS.reduce((sum,l)=> sum + l.groups.reduce((s,g)=>s+g.items.length,0), 0);
const LESSON1_SENT = LESSONS[0].sentences ? LESSONS[0].sentences.length : 0;

// ============================= HELPERS =============================
function el(tag, cls, html){ const e=document.createElement(tag); if(cls) e.className=cls; if(html!==undefined) e.innerHTML=html; return e; }
function typeTag(t){ return `<span class="tag ${TYPE_TAGCLASS[t]||'tag-x'}"></span>`; }

// ============================= RENDER: ROOT =============================
function render(){
  const app = document.getElementById("app");
  app.innerHTML = "";
  document.querySelectorAll("#bottomNav button").forEach(b=>{
    b.classList.toggle("active", !state.overlay && b.dataset.nav === state.nav);
  });

  if(state.overlay === "search"){ app.appendChild(renderSearch()); appendCreditFooter(app); window.scrollTo(0,0); return; }
  if(state.overlay === "favorites"){ app.appendChild(renderFavorites()); appendCreditFooter(app); window.scrollTo(0,0); return; }
  if(state.overlay === "mixedquiz"){ app.appendChild(renderMixedQuiz()); appendCreditFooter(app); window.scrollTo(0,0); return; }

  if(state.nav === "home") app.appendChild(renderHome());
  else if(state.nav === "lessons" && state.currentLesson===null) app.appendChild(renderLessonsGrid());
  else if(state.nav === "lessons" && state.currentLesson!==null) app.appendChild(renderLessonDetail());
  else if(state.nav === "grammar") app.appendChild(renderGrammar());
  else if(state.nav === "tips") app.appendChild(renderTips());
  else if(state.nav === "progress") app.appendChild(renderProgress());
  appendCreditFooter(app);
  window.scrollTo(0,0);
}

function appendCreditFooter(app){
  const f = el("div","app-credit-footer","تطبيق <b>رحلتي الألمانية</b> — بإعداد وتصميم <b>فارس</b> 🇩🇪");
  app.appendChild(f);
}

// ============================= HOME =============================
function ringHTML(done, total, size){
  size = size || 76;
  const pct = total ? Math.round((done/total)*100) : 0;
  const r = 30;
  const c = 2*Math.PI*r;
  const offset = c - (pct/100)*c;
  return `<div class="ring-wrap" style="width:${size}px;height:${size}px;">
    <svg viewBox="0 0 76 76">
      <circle class="ring-bg" cx="38" cy="38" r="${r}"></circle>
      <circle class="ring-fg" cx="38" cy="38" r="${r}" stroke-dasharray="${c.toFixed(1)}" stroke-dashoffset="${offset.toFixed(1)}"></circle>
    </svg>
    <div class="ring-label">${pct}%</div>
  </div>`;
}

function renderHome(){
  const wrap = el("div");
  const hero = el("div","hero");
  hero.innerHTML = `
    <span class="hero-eyebrow">منهج الألماني — Thanaweya Amma</span>
    <h1>رحلتك في <em>الألماني</em><br>18 محطة حتى الإتقان</h1>
    <p>كل درس فيه المفردات كاملة بشرح بسيط بالعربي، وجمل تدريبية سهلة الحفظ، عشان توصل بامتياز.</p>
    <div class="hero-stats">
      <div class="stat"><b>18</b><span>Lektion</span></div>
      <div class="stat"><b>${TOTAL_WORDS}+</b><span>كلمة مشروحة</span></div>
      <div class="stat"><b id="homeCompleted">${state.completed.size}</b><span>دروس مكتملة</span></div>
    </div>
    <div class="made-by">⚡ صُنع بواسطة <b>فارس</b> خصيصاً لمنهج الثانوية العامة</div>`;
  wrap.appendChild(hero);

  const screen = el("div","screen active");

  const quick = el("div"); quick.style.cssText="display:flex;gap:10px;margin-bottom:14px;";
  const searchBtn = el("button","",`🔍 دور على كلمة`);
  const favBtn = el("button","",`⭐ كلماتي المفضلة (${state.favorites.size})`);
  [searchBtn,favBtn].forEach(b=> b.style.cssText="flex:1;padding:12px 8px;background:var(--card);border:1px solid var(--line);color:var(--cream);border-radius:12px;font-family:Cairo;font-size:12.5px;cursor:pointer;");
  searchBtn.onclick = ()=>{ state.overlay="search"; render(); };
  favBtn.onclick = ()=>{ state.overlay="favorites"; render(); };
  quick.appendChild(searchBtn); quick.appendChild(favBtn);
  screen.appendChild(quick);

  const mixedBtn = el("button","","🎯 مراجعة شاملة — اختبار من كل الدروس اللي خلّصتها");
  mixedBtn.style.cssText="width:100%;margin-bottom:22px;padding:13px;background:linear-gradient(135deg, rgba(214,169,74,.18), rgba(193,80,63,.12));border:1px solid var(--gold-dim);color:var(--gold);border-radius:12px;font-family:Cairo;font-size:13px;font-weight:600;cursor:pointer;";
  mixedBtn.onclick = ()=>{ startMixedQuiz(); state.overlay="mixedquiz"; render(); };
  screen.appendChild(mixedBtn);

  const progCard = el("div","prog-ring-row");
  progCard.style.marginBottom = "20px";
  progCard.innerHTML = `${ringHTML(state.completed.size, LESSONS.length)}
    <div style="flex:1">
      <div style="font-size:14px;color:var(--cream);font-weight:600;margin-bottom:4px;">${state.completed.size} من ${LESSONS.length} درس مكتمل</div>
      <div style="font-size:12px;color:var(--muted);">${state.bestStreak>0 ? `أفضل سلسلة إجابات صح: ${state.bestStreak} 🔥` : "ابدأ اختبار سريع عشان تكوّن أول سلسلة صح!"}</div>
    </div>`;
  screen.appendChild(progCard);

  const st = el("div","section-title"); st.innerHTML = `<h2>ابدأ رحلتك</h2><span>Lektion 1 – 18</span>`;
  screen.appendChild(st);

  const grid = el("div","lesson-grid");
  LESSONS.slice(0,6).forEach((l,i)=> grid.appendChild(lessonCard(l,i)) );
  screen.appendChild(grid);

  const more = el("button");
  more.textContent = "عرض كل الدروس ←";
  more.style.cssText = "width:100%;margin-top:14px;padding:12px;background:none;border:1px dashed var(--line);color:var(--gold);border-radius:12px;font-family:Cairo;font-size:13.5px;cursor:pointer;";
  more.onclick = ()=>{ state.nav="lessons"; state.currentLesson=null; render(); };
  screen.appendChild(more);

  const tip = el("div","tip-card");
  tip.style.marginTop = "24px";
  tip.innerHTML = `<h3>💡 نصيحة سريعة</h3><ul>
    <li>لوّن الكلمات في دماغك: <b style="color:var(--der)">أزرق = der</b>، <b style="color:var(--die)">أحمر = die</b>، <b style="color:var(--das)">أخضر = das</b> — بيساعدك تحفظ الجنس مع الكلمة من أول مرة.</li>
    <li>راجع كل درس بنظام البطاقات التعليمية (Flashcards) بدل القراءة العادية بس.</li>
  </ul>`;
  screen.appendChild(tip);

  wrap.appendChild(screen);
  return wrap;
}

function lessonCard(l, idx){
  const done = state.completed.has(l.n);
  const c = el("div","lesson-card"+(done?" done":""));
  if(done) c.appendChild(el("div","badge","✓ خلصت"));
  c.innerHTML += `<div class="top-row"><div class="num">${l.n}</div><div class="lesson-icon">${LESSON_ICONS[l.n]||"📖"}</div></div><div class="lname">${l.title}</div><div class="lmeta">${l.groups.reduce((s,g)=>s+g.items.length,0)} كلمة</div>`;
  c.onclick = ()=>{ state.nav="lessons"; state.currentLesson=idx; state.tab="vocab"; state.flashIndex=0; state.flashFlipped=false; render(); };
  return c;
}

// ============================= LESSONS GRID =============================
function renderLessonsGrid(){
  const screen = el("div","screen active");
  screen.style.paddingTop = "20px";
  const st = el("div","section-title"); st.innerHTML = `<h2>كل الدروس</h2><span>${LESSONS.length} Lektion</span>`;
  screen.appendChild(st);
  const grid = el("div","lesson-grid");
  LESSONS.forEach((l,i)=> grid.appendChild(lessonCard(l,i)) );
  screen.appendChild(grid);
  return screen;
}

// ============================= LESSON DETAIL =============================
function renderLessonDetail(){
  const l = LESSONS[state.currentLesson];
  const screen = el("div","screen active");

  const head = el("div","lesson-header");
  const back = el("div","back-btn","→");
  back.onclick = ()=>{ state.currentLesson=null; render(); };
  head.appendChild(back);
  const htxt = el("div");
  htxt.innerHTML = `<h2>${LESSON_ICONS[l.n]||"📖"} Lektion ${l.n} — ${l.title}</h2><div class="sub">${l.desc}</div>`;
  head.appendChild(htxt);
  screen.appendChild(head);

  const tabbar = el("div","tabbar");
  const tabs = [["vocab","المفردات"],["situations","المواقف"],["flash","بطاقات تعليمية"],["quiz","اختبار سريع"],["sentences","الجمل التدريبية"]];
  tabs.forEach(([key,label])=>{
    const b = el("button", key===state.tab?"active":"", label);
    b.onclick = ()=>{ state.tab=key; state.flashIndex=0; state.flashFlipped=false; render(); };
    tabbar.appendChild(b);
  });
  screen.appendChild(tabbar);

  if(state.tab === "vocab") screen.appendChild(renderVocab(l));
  else if(state.tab === "situations") screen.appendChild(renderSituations(l));
  else if(state.tab === "flash") screen.appendChild(renderFlash(l));
  else if(state.tab === "quiz") screen.appendChild(renderQuiz(l));
  else screen.appendChild(renderSentences(l));

  const doneBtn = el("button");
  const done = state.completed.has(l.n);
  doneBtn.textContent = done ? "✓ تم وضع علامة مكتمل — إلغاء" : "وضع علامة: خلّصت الدرس ده";
  doneBtn.style.cssText = `width:100%;margin-top:6px;padding:13px;border-radius:12px;font-family:Cairo;font-size:13.5px;cursor:pointer;border:1px solid ${done?'var(--das)':'var(--line)'};background:${done?'rgba(99,185,138,.12)':'var(--card)'};color:${done?'var(--das)':'var(--cream)'};`;
  doneBtn.onclick = ()=>{
    if(!done){ state.completed.add(l.n); render(); fireConfetti(); }
    else { state.completed.delete(l.n); render(); }
  };
  screen.appendChild(doneBtn);

  return screen;
}

function renderVocab(l){
  const wrap = el("div");
  const printBtn = el("button","","🖨️ اطبع مفردات الدرس ده");
  printBtn.style.cssText="width:100%;margin-bottom:12px;padding:10px;background:var(--card);border:1px dashed var(--line);color:var(--muted);border-radius:10px;font-family:Cairo;font-size:12px;cursor:pointer;";
  printBtn.onclick = ()=> window.print();
  wrap.appendChild(printBtn);
  const legend = el("div","legend");
  legend.innerHTML = `
    <span><i style="background:var(--der)"></i> مذكر (der)</span>
    <span><i style="background:var(--die)"></i> مؤنث (die)</span>
    <span><i style="background:var(--das)"></i> محايد (das)</span>
    <span><i style="background:var(--verb)"></i> فعل</span>
    <span><i style="background:#e0a568"></i> صفة</span>
    <span><i style="background:#7fc9c9"></i> ظرف</span>`;
  wrap.appendChild(legend);

  l.groups.forEach(g=>{
    const block = el("div","group-block");
    block.appendChild(el("h3",null,g.title));
    const list = el("div","word-list");
    g.items.forEach(it=>{
      const key = state.currentLesson+"::"+it.de;
      const isFav = state.favorites.has(key);
      const row = el("div","word-row");
      row.innerHTML = `<div class="tag ${TYPE_TAGCLASS[it.t]||'tag-x'}"></div>
        <div class="content">
          <div class="de">${it.de}</div>
          <div class="ar">${it.ar}</div>
          ${it.ex? `<div class="ex">${it.ex}</div>`:""}
        </div>
        ${speakBtnHTML()}
        <div class="star" style="font-size:18px;cursor:pointer;color:${isFav?'var(--gold)':'var(--line)'};">${isFav?"★":"☆"}</div>`;
      wireSpeak(row, it.de);
      row.querySelector(".star").addEventListener("click",(e)=>{
        e.stopPropagation();
        isFav ? state.favorites.delete(key) : state.favorites.add(key);
        render();
      });
      list.appendChild(row);
    });
    block.appendChild(list);
    wrap.appendChild(block);
  });
  return wrap;
}

function renderSentences(l){
  const wrap = el("div");
  if(!l.sentences){
    const box = el("div","soon-box");
    box.innerHTML = `<b>الجمل التدريبية جاية قريب 🚧</b>
      عشان كل جملة تبقى صح 100% ومفيدة فعلاً، بجهّزلك الـ 70 جملة بتاعت الدرس ده على دفعات بعد كده.<br>
      لحد ما تجهز، ذاكر المفردات والبطاقات التعليمية للدرس ده.`;
    wrap.appendChild(box);
    return wrap;
  }
  const note = el("div"); note.style.cssText="font-size:12px;color:var(--muted);margin-bottom:12px;";
  note.textContent = `${l.sentences.length} جملة — اقرأها بصوت عالي كل يوم لحفظ أسرع`;
  wrap.appendChild(note);
  l.sentences.forEach((s,i)=>{
    const row = el("div","sent-row");
    row.style.display="flex"; row.style.alignItems="center"; row.style.gap="10px";
    row.innerHTML = `<div style="flex:1;"><div class="de"><span class="n">${i+1}.</span>${s[0]}</div><div class="ar">${s[1]}</div></div>${speakBtnHTML()}`;
    wireSpeak(row, s[0]);
    wrap.appendChild(row);
  });
  return wrap;
}

function renderFlash(l){
  const items = [];
  l.groups.forEach(g=> g.items.forEach(it=> items.push(it)) );
  const wrap = el("div","flash-wrap");
  wrap.appendChild(el("div","flash-count", `بطاقة ${state.flashIndex+1} من ${items.length}`));

  const it = items[state.flashIndex];
  const card = el("div","flashcard"+(state.flashFlipped?" flipped":""));
  card.innerHTML = `<div class="flashcard-inner">
      <div class="flashcard-face flashcard-front"><div class="de">${it.de}</div><div class="hint">اضغط لرؤية المعنى</div></div>
      <div class="flashcard-face flashcard-back"><div class="ar">${it.ar}</div>${it.ex?`<div class="ex">${it.ex}</div>`:""}</div>
    </div>`;
  card.onclick = ()=>{ state.flashFlipped = !state.flashFlipped; render(); };
  wrap.appendChild(card);

  const speakRow = el("div"); speakRow.style.cssText="display:flex;justify-content:center;";
  speakRow.innerHTML = speakBtnHTML();
  speakRow.querySelector(".speak-btn").addEventListener("click",(e)=>{ e.stopPropagation(); speak(it.de, speakRow.querySelector(".speak-btn")); });
  wrap.appendChild(speakRow);

  const nav = el("div","flash-nav");
  const prev = el("button",null,"← السابق");
  prev.onclick = ()=>{ state.flashIndex = (state.flashIndex-1+items.length)%items.length; state.flashFlipped=false; render(); };
  const next = el("button",null,"التالي →");
  next.onclick = ()=>{ state.flashIndex = (state.flashIndex+1)%items.length; state.flashFlipped=false; render(); };
  nav.appendChild(next); nav.appendChild(prev);
  wrap.appendChild(nav);
  return wrap;
}

// ============================= GRAMMAR =============================
function conjTable(forms){
  const pronouns = ["ich","du","er/sie/es","wir","ihr","sie/Sie"];
  let rows = pronouns.map((p,i)=>`<tr><td>${p}</td><td>${forms[i]}</td></tr>`).join("");
  return `<table class="conj-table">${rows}</table>`;
}

function renderGrammar(){
  const screen = el("div","screen active");
  screen.style.paddingTop = "20px";
  screen.appendChild(el("h2",null,"قواعد الألماني — مستوى A1"));
  const introP = el("p"); introP.style.cssText="font-size:12.5px;color:var(--muted);margin:8px 0 18px;line-height:1.9;";
  introP.textContent = "كل القواعد اللي بتحتاجها في منهجك: تصريف الأفعال بكل أنواعها، حروف الجر، أدوات التعريف، النفي، والأسئلة — عشان تقدر تكوّن جملة صح من غير ما تحفظ بس.";
  screen.appendChild(introP);

  // الضمائر
  let c = el("div","gram-card");
  c.innerHTML = `<h3>👤 الضمائر الشخصية</h3>`;
  let rows = GRAMMAR.pronouns.map(([de,ar])=>`<tr><td>${ar}</td><td>${de}</td></tr>`).join("");
  c.innerHTML += `<table class="conj-table">${rows}</table>`;
  screen.appendChild(c);

  // تصريف الفعل المنتظم
  c = el("div","gram-card");
  c.innerHTML = `<h3>🔤 تصريف الفعل المنتظم (Regelmäßige Verben)</h3><div class="gram-sub">كل الأفعال العادية بتاخد نفس النهايات دي في المضارع.</div>`;
  rows = GRAMMAR.regularEndings.map(([p,end,ex])=>`<tr><td>${p}</td><td>${end} → ${ex}</td></tr>`).join("");
  c.innerHTML += `<table class="conj-table">${rows}</table>`;
  GRAMMAR.regularExamples.forEach(v=>{
    const sub = el("div"); sub.style.cssText="margin-top:14px;";
    sub.innerHTML = `<div style="font-size:13px;color:var(--gold);margin-bottom:6px;direction:ltr;text-align:right;">${v.inf} <span style="color:var(--muted);direction:rtl;">(${v.ar})</span></div>`;
    sub.innerHTML += conjTable(v.forms);
    c.appendChild(sub);
  });
  screen.appendChild(c);

  // الأفعال الشاذة
  c = el("div","gram-card");
  c.innerHTML = `<h3>⚡ الأفعال الشاذة (تغيير حرف العلة)</h3><div class="gram-sub">التغيير بيحصل بس مع du وer/sie/es — الباقي زي الفعل العادي.</div>`;
  const grid = el("div","word-list");
  GRAMMAR.strongVerbs.forEach(v=>{
    const row = el("div","word-row");
    row.innerHTML = `<div class="tag tag-x" style="background:var(--brick)"></div>
      <div class="content">
        <div class="de">${v.inf} <span style="color:var(--gold);font-size:11px;">(${v.change})</span></div>
        <div class="ar">${v.ar} — du ${v.du} / er ${v.er}</div>
        ${v.note? `<div class="ex">${v.note}</div>`:""}
      </div>`;
    grid.appendChild(row);
  });
  c.appendChild(grid);
  const svEx = el("div"); svEx.style.cssText="margin-top:12px;";
  svEx.innerHTML = `<div style="font-size:12.5px;color:var(--cream);margin-bottom:6px;">أمثلة</div>` +
    GRAMMAR.strongVerbsExamples.map(([de,ar])=>`<div class="sent-row" style="margin-bottom:6px;"><div class="de">${de}</div><div class="ar">${ar}</div></div>`).join("");
  c.appendChild(svEx);
  screen.appendChild(c);

  // الأفعال الشكلية
  c = el("div","gram-card");
  c.innerHTML = `<h3>🧩 الأفعال الشكلية (Modalverben)</h3><div class="gram-sub">لاحظ: ich وer/sie/es بياخدوا نفس الشكل من غير نهاية، وبيدفعوا الفعل التاني لآخر الجملة في المصدر.</div>`;
  GRAMMAR.modalVerbs.forEach(v=>{
    const sub = el("div"); sub.style.cssText="margin-top:10px;";
    sub.innerHTML = `<div style="font-size:13px;color:var(--gold);margin-bottom:6px;direction:ltr;text-align:right;">${v.inf} <span style="color:var(--muted);direction:rtl;">(${v.ar})</span></div>`;
    sub.innerHTML += conjTable(v.forms);
    c.appendChild(sub);
  });
  const modEx = el("div"); modEx.style.cssText="margin-top:8px;";
  modEx.innerHTML = `<div style="font-size:12.5px;color:var(--cream);margin-bottom:6px;">أمثلة</div>` +
    GRAMMAR.modalExamples.map(([de,ar])=>`<div class="sent-row" style="margin-bottom:6px;"><div class="de">${de}</div><div class="ar">${ar}</div></div>`).join("");
  c.appendChild(modEx);
  screen.appendChild(c);

  // sein haben werden wissen
  c = el("div","gram-card");
  c.innerHTML = `<h3>🌟 الأفعال المساعدة الأساسية</h3><div class="gram-sub">sein و haben و werden أهم 3 أفعال في اللغة كلها — لازم تحفظهم غيباً.</div>`;
  GRAMMAR.irregular.forEach(v=>{
    const sub = el("div"); sub.style.cssText="margin-top:10px;";
    sub.innerHTML = `<div style="font-size:13px;color:var(--gold);margin-bottom:6px;direction:ltr;text-align:right;">${v.inf} <span style="color:var(--muted);direction:rtl;">(${v.ar})</span></div>`;
    sub.innerHTML += conjTable(v.forms);
    if(v.note) sub.innerHTML += `<div class="gram-note">${v.note}</div>`;
    c.appendChild(sub);
  });
  screen.appendChild(c);

  // الأفعال المنفصلة
  c = el("div","gram-card");
  c.innerHTML = `<h3>✂️ الأفعال المنفصلة (Trennbare Verben)</h3><div class="gram-sub">البادئة (زي auf, an, ein, ab) بتتفصل عن الفعل وتروح آخر الجملة في المضارع. مثال: aufstehen ← Ich stehe um 7 Uhr auf.</div>`;
  const wl = el("div","word-list");
  GRAMMAR.separableVerbs.forEach(([inf,ar,ex])=>{
    const row = el("div","word-row");
    row.innerHTML = `<div class="tag tag-m"></div><div class="content"><div class="de">${inf}</div><div class="ar">${ar}</div><div class="ex">${ex}</div></div>`;
    wl.appendChild(row);
  });
  c.appendChild(wl);
  screen.appendChild(c);

  // أداة التعريف والتنكير
  c = el("div","gram-card");
  c.innerHTML = `<h3>📐 أداة التعريف وحالات الإعراب</h3><div class="gram-sub">Nominativ = الفاعل، Akkusativ = المفعول به المباشر، Dativ = بعد حروف جر معينة أو المفعول به غير المباشر.</div>`;
  function caseTable(data){
    let h = data.headers.map(x=>`<th>${x}</th>`).join("");
    let r = data.rows.map(row=>`<tr>${row.map(x=>`<td>${x}</td>`).join("")}</tr>`).join("");
    return `<table class="case-table"><tr>${h}</tr>${r}</table>`;
  }
  c.innerHTML += `<div style="font-size:12.5px;color:var(--cream);margin-top:10px;">أداة التعريف (der/die/das)</div>` + caseTable(GRAMMAR.articleCases);
  c.innerHTML += `<div style="font-size:12.5px;color:var(--cream);margin-top:16px;">أداة التنكير (ein/eine)</div>` + caseTable(GRAMMAR.articleIndefCases);
  c.innerHTML += `<div class="gram-note">ضمائر الملكية (mein, dein, sein, ihr...) بتاخد بالظبط نفس نهايات ein في كل الحالات.</div>`;
  screen.appendChild(c);

  // ضمائر النصب والجر
  c = el("div","gram-card");
  c.innerHTML = `<h3>🔁 الضمائر في حالتي Akkusativ و Dativ</h3>`;
  c.innerHTML += caseTable(GRAMMAR.pronounCases);
  screen.appendChild(c);

  // حروف الجر
  c = el("div","gram-card");
  c.innerHTML = `<h3>🧭 حروف الجر (Präpositionen)</h3>`;
  c.innerHTML += `<div style="font-size:12.5px;color:var(--cream);margin-top:8px;">+ Akkusativ دايماً</div>`;
  c.innerHTML += `<div class="prep-grid">${GRAMMAR.prepAkk.map(p=>`<div class="prep-item"><div class="w">${p}</div></div>`).join("")}</div>`;
  c.innerHTML += `<div style="font-size:12.5px;color:var(--cream);margin-top:14px;">+ Dativ دايماً</div>`;
  c.innerHTML += `<div class="prep-grid">${GRAMMAR.prepDat.map(p=>`<div class="prep-item"><div class="w">${p}</div></div>`).join("")}</div>`;
  c.innerHTML += `<div style="font-size:12.5px;color:var(--cream);margin-top:14px;">حروف جر متغيرة (Wechselpräpositionen) — Akkusativ مع الحركة، Dativ مع السكون</div>`;
  c.innerHTML += `<div class="prep-grid">${GRAMMAR.prepWechsel.map(p=>`<div class="prep-item"><div class="w">${p}</div></div>`).join("")}</div>`;
  c.innerHTML += `<div style="font-size:12.5px;color:var(--cream);margin-top:14px;">اختصارات شائعة</div><div class="word-list" style="margin-top:8px;">`;
  GRAMMAR.contractions.forEach(([full,short,ex])=>{
    c.innerHTML += `<div class="word-row"><div class="tag tag-n"></div><div class="content"><div class="de">${full} = ${short}</div><div class="ex">${ex}</div></div></div>`;
  });
  c.innerHTML += `</div>`;
  screen.appendChild(c);

  // النفي
  c = el("div","gram-card");
  c.innerHTML = `<h3>🚫 النفي: nicht و kein</h3><div class="word-list" style="margin-top:10px;">`;
  GRAMMAR.negation.forEach(([w,rule,ex])=>{
    c.innerHTML += `<div class="word-row"><div class="tag tag-a"></div><div class="content"><div class="de">${w}</div><div class="ar">${rule}</div><div class="ex">${ex}</div></div></div>`;
  });
  c.innerHTML += `</div>`;
  screen.appendChild(c);

  // أدوات الاستفهام
  c = el("div","gram-card");
  c.innerHTML = `<h3>❓ أدوات الاستفهام (W-Fragen)</h3>`;
  rows = GRAMMAR.questionWords.map(([de,ar])=>`<tr><td>${ar}</td><td>${de}</td></tr>`).join("");
  c.innerHTML += `<table class="conj-table">${rows}</table>`;
  c.innerHTML += `<div class="gram-note">في سؤال بأداة استفهام: أداة الاستفهام + الفعل + الفاعل (Wann kommst du?). في سؤال بنعم/لا: الفعل يجي الأول (Kommst du?).</div>`;
  screen.appendChild(c);

  // ترتيب الجملة
  c = el("div","gram-card");
  c.innerHTML = `<h3>📏 ترتيب الجملة</h3>
    <div class="gram-sub">القاعدة الذهبية: <b style="color:var(--gold)">الفعل المصرّف دايماً في المكان التاني</b> من الجملة الخبرية.</div>
    <div class="word-list">
      <div class="word-row"><div class="tag tag-v"></div><div class="content"><div class="de">Ich spiele heute Fußball.</div><div class="ar">أنا هلعب كورة النهاردة. (فاعل - فعل - باقي الجملة)</div></div></div>
      <div class="word-row"><div class="tag tag-v"></div><div class="content"><div class="de">Heute spiele ich Fußball.</div><div class="ar">النهاردة هلعب كورة. (الفعل لسه في المكان التاني حتى لو بدأنا بظرف)</div></div></div>
      <div class="word-row"><div class="tag tag-v"></div><div class="content"><div class="de">Spielst du heute Fußball?</div><div class="ar">هل هتلعب كورة النهاردة؟ (سؤال نعم/لا: الفعل أول الجملة)</div></div></div>
    </div>`;
  screen.appendChild(c);

  // صيغ الجمع
  c = el("div","gram-card");
  c.innerHTML = `<h3>🔢 كيف تقرأ صيغة الجمع في القاموس</h3><div class="gram-sub">كل كلمة في كتابك مكتوب جنبها رمز الجمع بتاعها — دي مفاتيح الرموز.</div>`;
  rows = GRAMMAR.pluralCodes.map(([code,ex])=>`<tr><td style="direction:ltr;text-align:right;">${code}</td><td style="direction:ltr;">${ex}</td></tr>`).join("");
  c.innerHTML += `<table class="conj-table">${rows}</table>`;
  screen.appendChild(c);

  // الأمر Imperativ
  c = el("div","gram-card");
  c.innerHTML = `<h3>📢 صيغة الأمر (Imperativ)</h3>`;
  c.innerHTML += `<div class="word-list">` + GRAMMAR.imperativRules.map(([w,rule,ex])=>
    `<div class="word-row"><div class="tag tag-a"></div><div class="content"><div class="de">${w}</div><div class="ar">${rule}</div><div class="ex">${ex}</div></div></div>`).join("") + `</div>`;
  c.appendChild(el("div",null,`<div style="font-size:12.5px;color:var(--cream);margin:14px 0 4px;">أمثلة كاملة</div>`));
  GRAMMAR.imperativExamples.forEach(([inf,du,ihr,sie,ar])=>{
    const sub = el("div","sent-row"); sub.style.marginBottom="8px";
    sub.innerHTML = `<div style="font-size:12px;color:var(--gold);margin-bottom:6px;direction:ltr;text-align:right;">${inf}</div>
      <div class="de">du: ${du}</div><div class="de" style="margin-top:4px;">ihr: ${ihr}</div><div class="de" style="margin-top:4px;">Sie: ${sie}</div>
      <div class="ar" style="margin-top:6px;">${ar}</div>`;
    c.appendChild(sub);
  });
  screen.appendChild(c);

  // الماضي Perfekt
  c = el("div","gram-card");
  c.innerHTML = `<h3>⏳ الماضي: Perfekt</h3>`;
  c.innerHTML += `<ul style="margin:0 0 12px;padding-inline-start:20px;font-size:12.5px;color:var(--muted);line-height:2;">${GRAMMAR.perfektRule.map(r=>`<li>${r}</li>`).join("")}</ul>`;
  GRAMMAR.perfektExamples.forEach(([de,ar])=>{
    const sub = el("div","sent-row"); sub.style.marginBottom="8px";
    sub.innerHTML = `<div class="de">${de}</div><div class="ar">${ar}</div>`;
    c.appendChild(sub);
  });
  const p2title = el("div"); p2title.style.cssText="font-size:12.5px;color:var(--cream);margin:14px 0 6px;";
  p2title.textContent = "أشهر أفعال المنهج في Partizip II";
  c.appendChild(p2title);
  const wl2 = el("div","word-list");
  GRAMMAR.partizipList.forEach(([inf,part,aux])=>{
    const row = el("div","word-row");
    row.innerHTML = `<div class="tag ${aux==='sein'?'tag-n':'tag-m'}"></div><div class="content"><div class="de">${inf} → ${part}</div><div class="ar">مع ${aux}</div></div>`;
    wl2.appendChild(row);
  });
  c.appendChild(wl2);
  screen.appendChild(c);

  // الماضي Präteritum
  c = el("div","gram-card");
  c.innerHTML = `<h3>⏳ الماضي: Präteritum (لـ sein وhaben والأفعال الشكلية)</h3><div class="gram-sub">${GRAMMAR.praeteritumNote}</div>`;
  GRAMMAR.praeteritum.forEach(v=>{
    const sub = el("div"); sub.style.cssText="margin-top:10px;";
    sub.innerHTML = `<div style="font-size:13px;color:var(--gold);margin-bottom:6px;direction:ltr;text-align:right;">${v.inf} <span style="color:var(--muted);direction:rtl;">(${v.ar})</span></div>`;
    sub.innerHTML += conjTable(v.forms);
    c.appendChild(sub);
  });
  const p3title = el("div"); p3title.style.cssText="font-size:12.5px;color:var(--cream);margin:14px 0 6px;";
  p3title.textContent = "أمثلة";
  c.appendChild(p3title);
  GRAMMAR.praeteritumExamples.forEach(([de,ar])=>{
    const sub = el("div","sent-row"); sub.style.marginBottom="8px";
    sub.innerHTML = `<div class="de">${de}</div><div class="ar">${ar}</div>`;
    c.appendChild(sub);
  });
  screen.appendChild(c);

  return screen;
}

// ============================= TIPS =============================
function renderTips(){
  const screen = el("div","screen active");
  screen.style.paddingTop = "20px";
  screen.appendChild(el("h2",null,"طرق فعّالة تذاكر بيها"));
  screen.style.setProperty("--gap","10px");

  const tips = [
    ["🎨 لوّن الجنس النحوي","استخدم نظام الألوان في التطبيق (أزرق der، أحمر die، أخضر das) وأنت بتذاكر من الكتاب كمان — دماغك بيربط اللون بالجنس أسرع من النص العادي."],
    ["🔁 التكرار المتباعد (Spaced Repetition)","راجع كلمات الدرس بعد يوم، وبعدين بعد 3 أيام، وبعدين بعد أسبوع. مش لازم تحفظ كل حاجة أول مرة — المهم الرجوع بانتظام."],
    ["🗣️ اقرأ الجمل بصوت عالي","الجمل التدريبية مصممة تتقال بصوت عالي، مش تتقرا في السكوت بس. النطق بيثبّت الكلمة في الذاكرة العضلية."],
    ["🃏 استخدم البطاقات التعليمية يومياً","10 دقايق فلاش كاردز كل يوم أفضل من ساعة مرة في الأسبوع. جرب تقفل عينيك وتفتكر المعنى قبل ما تقلب الكارت."],
    ["✍️ اكتب الكلمة مش بس تقراها","لما تشوف كلمة جديدة، اكتبها 2-3 مرات بخط إيدك مع أداة التعريف بتاعتها (der/die/das)."],
    ["🎯 درس صغير كل يوم أفضل من مراجعة كبيرة قبل الامتحان","خصص 15-20 دقيقة يومياً لدرس واحد أو نص درس، وده هيوصلك لآخر الـ 18 درس من غير إرهاق."],
    ["🔗 اربط الكلمة بجملة مش بمعناها لوحدها","بدل ما تحفظ 'der Apfel = تفاحة' بس، احفظها جوه جملة زي 'Ich esse einen Apfel' — بيثبت أسرع وبيوريك طريقة الاستخدام."],
  ];
  tips.forEach(([t,d])=>{
    const c = el("div","tip-card"); c.style.marginBottom="12px";
    c.innerHTML = `<h3>${t}</h3><div style="font-size:13px;color:var(--muted);line-height:1.9;">${d}</div>`;
    screen.appendChild(c);
  });
  return screen;
}

// ============================= PROGRESS =============================
function renderProgress(){
  const screen = el("div","screen active");
  screen.style.paddingTop="20px";
  screen.appendChild(el("h2",null,"تقدّمك في المنهج"));

  const row = el("div","prog-ring-row"); row.style.marginTop="16px";
  row.innerHTML = `${ringHTML(state.completed.size, LESSONS.length)}
    <div style="flex:1"><div style="font-size:13.5px;color:var(--cream);margin-bottom:4px;">درس مكتمل</div>
    <div style="font-size:12px;color:var(--muted);margin-bottom:8px;">اضغط على أي درس وحدد "خلّصت الدرس ده" عشان تتابع تقدمك</div>
    <span class="streak-badge">🔥 أفضل سلسلة اختبار: ${state.bestStreak}</span>
    </div>`;
  screen.appendChild(row);

  const list = el("div","prog-list");
  LESSONS.forEach((l,i)=>{
    const done = state.completed.has(l.n);
    const row = el("div","lesson-mini"+(done?" on":""));
    row.innerHTML = `<span>Lektion ${l.n} — ${l.title}</span><span class="chk">${done?"✓":""}</span>`;
    row.onclick = ()=>{ state.nav="lessons"; state.currentLesson=i; state.tab="vocab"; render(); };
    row.style.cursor="pointer";
    list.appendChild(row);
  });
  screen.appendChild(list);
  return screen;
}

// ============================= SITUATIONS =============================
function renderSituations(l){
  const wrap = el("div");
  if(!l.situations || l.situations.length === 0){
    wrap.appendChild(el("div","soon-box","مفيش مواقف مسجلة للدرس ده لسه."));
    return wrap;
  }
  const note = el("div"); note.style.cssText="font-size:12px;color:var(--muted);margin-bottom:14px;";
  note.textContent = "مواقف حقيقية لازم تعرفها في المستوى ده — احفظ الحوار وجرب تقوله بصوت عالي مع صاحبك.";
  wrap.appendChild(note);

  l.situations.forEach(sit=>{
    const card = el("div","situation-card");
    card.innerHTML = `<h3>${sit.title}</h3><div class="subtitle">${sit.subtitle||""}</div>`;
    sit.dialogue.forEach(([spk,de,ar])=>{
      const row = el("div","chat-row speaker-"+spk);
      row.style.alignItems="flex-end"; row.style.gap="6px";
      const bubbleWrap = el("div");
      bubbleWrap.style.cssText = spk==="B" ? "display:flex;flex-direction:row-reverse;align-items:flex-end;gap:6px;" : "display:flex;align-items:flex-end;gap:6px;";
      bubbleWrap.innerHTML = `<div class="chat-bubble"><div class="chat-label">${spk}</div><div class="de">${de}</div><div class="ar">${ar}</div></div>${speakBtnHTML()}`;
      wireSpeak(bubbleWrap, de);
      row.appendChild(bubbleWrap);
      card.appendChild(row);
    });
    if(sit.phrases && sit.phrases.length){
      card.appendChild(el("div","phrase-title","عبارات مفيدة تفتكرها"));
      const chipsWrap = el("div");
      sit.phrases.forEach(([de,ar])=>{
        chipsWrap.appendChild(el("span","phrase-chip", `<span class="de">${de}</span><span class="ar">${ar}</span>`));
      });
      card.appendChild(chipsWrap);
    }
    wrap.appendChild(card);
  });
  return wrap;
}

// ============================= SEARCH =============================
function renderSearch(){
  const screen = el("div","screen active");
  screen.style.paddingTop = "18px";
  const head = el("div","lesson-header");
  const back = el("div","back-btn","→");
  back.onclick = ()=>{ state.overlay=null; render(); };
  head.appendChild(back);
  head.appendChild(el("div",null,`<h2>دور على كلمة</h2><div class="sub">من كل الـ 18 درس مرة واحدة</div>`));
  screen.appendChild(head);

  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = "اكتب كلمة بالألماني أو بالعربي...";
  input.style.cssText = "width:100%;margin:16px 0;padding:13px 16px;background:var(--card);border:1px solid var(--line);border-radius:12px;color:var(--cream);font-family:Cairo;font-size:14px;outline:none;";
  screen.appendChild(input);

  const results = el("div");
  screen.appendChild(results);

  function doSearch(q){
    q = q.trim().toLowerCase();
    results.innerHTML = "";
    if(!q){
      results.appendChild(el("div","soon-box","اكتب أي كلمة عشان تلاقيها في أي درس"));
      return;
    }
    const list = el("div","word-list");
    let count = 0;
    LESSONS.forEach((l, li)=>{
      l.groups.forEach(g=>{
        g.items.forEach(it=>{
          if(count>=60) return;
          if(it.de.toLowerCase().includes(q) || it.ar.includes(q)){
            count++;
            const row = el("div","word-row");
            row.style.cursor="pointer";
            row.innerHTML = `<div class="tag ${TYPE_TAGCLASS[it.t]||'tag-x'}"></div>
              <div class="content">
                <div class="de">${it.de} <span style="color:var(--gold);font-size:11px;">— Lektion ${l.n}</span></div>
                <div class="ar">${it.ar}</div></div>`;
            row.onclick = ()=>{ state.overlay=null; state.nav="lessons"; state.currentLesson=li; state.tab="vocab"; render(); };
            list.appendChild(row);
          }
        });
      });
    });
    if(count===0) results.appendChild(el("div","soon-box","مفيش نتائج... جرب كلمة تانية"));
    else results.appendChild(list);
  }
  input.addEventListener("input", ()=> doSearch(input.value));
  doSearch("");
  setTimeout(()=> input.focus(), 50);
  return screen;
}

// ============================= FAVORITES =============================
function renderFavorites(){
  const screen = el("div","screen active");
  screen.style.paddingTop = "18px";
  const head = el("div","lesson-header");
  const back = el("div","back-btn","→");
  back.onclick = ()=>{ state.overlay=null; render(); };
  head.appendChild(back);
  head.appendChild(el("div",null,`<h2>كلماتي المفضلة</h2><div class="sub">${state.favorites.size} كلمة محفوظة للمراجعة</div>`));
  screen.appendChild(head);

  if(state.favorites.size === 0){
    const box = el("div","soon-box");
    box.style.marginTop="16px";
    box.innerHTML = `<b>لسه مفيش كلمات ⭐</b>اضغط على النجمة جنب أي كلمة في صفحة المفردات عشان تضيفها هنا للمراجعة السريعة.`;
    screen.appendChild(box);
    return screen;
  }

  const list = el("div","word-list"); list.style.marginTop="16px";
  state.favorites.forEach(key=>{
    const [liStr, de] = key.split("::");
    const li = parseInt(liStr,10);
    const l = LESSONS[li];
    if(!l) return;
    let found = null;
    l.groups.forEach(g=> g.items.forEach(it=>{ if(it.de===de) found = it; }));
    if(!found) return;
    const row = el("div","word-row");
    row.innerHTML = `<div class="tag ${TYPE_TAGCLASS[found.t]||'tag-x'}"></div>
      <div class="content"><div class="de">${found.de} <span style="color:var(--gold);font-size:11px;">— Lektion ${l.n}</span></div><div class="ar">${found.ar}</div></div>
      <div class="star" style="font-size:18px;cursor:pointer;color:var(--gold);">★</div>`;
    row.querySelector(".star").addEventListener("click",()=>{ state.favorites.delete(key); render(); });
    list.appendChild(row);
  });
  screen.appendChild(list);
  return screen;
}

// ============================= QUIZ (generic engine) =============================
function startQuizState(qs, items){
  const shuffled = items.slice().sort(()=>Math.random()-0.5).slice(0, Math.min(10, items.length));
  qs.pool = shuffled; qs.all = items; qs.idx = 0; qs.score = 0; qs.answered = null;
  qs.streak = 0; qs._celebrated = false; qs.revealed = false;
}

function renderQuizEngine(qs, onRestart, title){
  const wrap = el("div");

  // mode toggle: meaning (see word) vs listening (hear only)
  const modeRow = el("div","tabbar"); modeRow.style.marginBottom="16px";
  [["meaning","👁️ شوف واختار"],["listening","🔊 اسمع واختار"]].forEach(([key,label])=>{
    const b = el("button", (qs.mode||"meaning")===key?"active":"", label);
    b.onclick = ()=>{ qs.mode = key; qs.answered=null; qs.revealed=false; render(); };
    modeRow.appendChild(b);
  });
  wrap.appendChild(modeRow);

  if(qs.all.length < 4){
    wrap.appendChild(el("div","soon-box","مفيش كلمات كفاية هنا لعمل اختبار (محتاج 4 على الأقل)."));
    return wrap;
  }
  if(qs.idx >= qs.pool.length){
    const pct = Math.round((qs.score/qs.pool.length)*100);
    const box = el("div","celebrate-box");
    const emoji = pct===100 ? "🏆" : pct>=70 ? "🎉" : pct>=40 ? "💪" : "📚";
    box.innerHTML = `<div class="emoji">${emoji}</div><b style="display:block;font-family:'Fraunces',serif;font-size:19px;color:var(--gold);margin-bottom:6px;">خلصت الاختبار!</b>
      <div style="color:var(--muted);font-size:14px;">نتيجتك: ${qs.score} من ${qs.pool.length} (${pct}%)</div>
      ${state.bestStreak>1 ? `<div style="margin-top:10px;"><span class="streak-badge">🔥 أفضل سلسلة صح: ${state.bestStreak}</span></div>`:""}`;
    wrap.appendChild(box);
    const again = el("button","","حاول تاني");
    again.style.cssText="width:100%;margin-top:12px;padding:13px;border-radius:12px;font-family:Cairo;font-size:13.5px;cursor:pointer;border:1px solid var(--gold-dim);background:rgba(214,169,74,.1);color:var(--gold);";
    again.onclick = onRestart;
    wrap.appendChild(again);
    if(pct>=70 && !qs._celebrated){ qs._celebrated = true; fireConfetti(); }
    return wrap;
  }

  const current = qs.pool[qs.idx];
  wrap.appendChild(el("div","flash-count",`${title||""} سؤال ${qs.idx+1} من ${qs.pool.length} — نتيجتك: ${qs.score}${qs.streak>=2?` · سلسلة 🔥${qs.streak}`:""}`));

  const qCard = el("div","gram-card"); qCard.style.textAlign="center";
  const listening = (qs.mode==="listening");
  const showWord = !listening || qs.answered!==null;
  qCard.innerHTML = `<div style="font-size:12px;color:var(--muted);margin-bottom:8px;">${listening && qs.answered===null ? "اسمع الكلمة واختار معناها" : "إيه معنى الكلمة دي؟"}</div>
    <div style="display:flex;align-items:center;justify-content:center;gap:10px;min-height:34px;">
      ${showWord ? `<div style="font-family:'Fraunces',serif;font-size:24px;color:var(--gold);direction:ltr;">${current.de}</div>` : `<div style="font-size:13px;color:var(--muted);">اضغط ع السماعة 👇</div>`}
      ${speakBtnHTML()}
    </div>`;
  wireSpeak(qCard, current.de);
  if(listening && qs.answered===null){
    // auto-play once per question for convenience
    setTimeout(()=>{ const b = qCard.querySelector(".speak-btn"); if(b) speak(current.de, b); }, 150);
  }
  wrap.appendChild(qCard);

  let options = [current.ar];
  const others = qs.all.filter(x=>x.de!==current.de).sort(()=>Math.random()-0.5);
  for(const o of others){ if(options.length>=4) break; if(!options.includes(o.ar)) options.push(o.ar); }
  options = options.sort(()=>Math.random()-0.5);

  const optWrap = el("div","word-list");
  options.forEach(opt=>{
    const row = el("div","word-row");
    row.style.cursor="pointer";
    row.style.justifyContent="center";
    let bg = "";
    if(qs.answered !== null){
      if(opt === current.ar) bg = "border-color:var(--das);";
      else if(opt === qs.answered) bg = "border-color:var(--brick);";
    }
    row.setAttribute("style", row.getAttribute("style")+bg);
    row.innerHTML = `<div class="content" style="text-align:center;"><div class="ar" style="font-size:14px;color:var(--cream);">${opt}</div></div>`;
    if(qs.answered === null){
      row.onclick = ()=>{
        qs.answered = opt;
        if(opt === current.ar){
          qs.score++;
          qs.streak = (qs.streak||0)+1;
          if(qs.streak > state.bestStreak) state.bestStreak = qs.streak;
        } else {
          qs.streak = 0;
        }
        render();
      };
    }
    optWrap.appendChild(row);
  });
  wrap.appendChild(optWrap);

  if(qs.answered !== null){
    const next = el("button","", qs.idx+1 < qs.pool.length ? "السؤال التالي →" : "شوف نتيجتي");
    next.style.cssText="width:100%;margin-top:14px;padding:13px;border-radius:12px;font-family:Cairo;font-size:13.5px;cursor:pointer;border:1px solid var(--line);background:var(--card);color:var(--cream);";
    next.onclick = ()=>{ qs.idx++; qs.answered=null; render(); };
    wrap.appendChild(next);
  }
  return wrap;
}

function startQuiz(l){
  const items = [];
  l.groups.forEach(g=> g.items.forEach(it=>{ if(it.ar && it.de) items.push(it); }));
  startQuizState(state.quiz, items);
  state.quiz._lesson = l.n;
}

function renderQuiz(l){
  if(state.quiz.pool.length === 0 || state.quiz._lesson !== l.n) startQuiz(l);
  return renderQuizEngine(state.quiz, ()=>{ startQuiz(l); render(); });
}

// ============================= MIXED REVIEW (all lessons) =============================
function startMixedQuiz(){
  const doneLessons = LESSONS.filter(l=> state.completed.has(l.n));
  const source = doneLessons.length >= 1 ? doneLessons : LESSONS;
  const items = [];
  source.forEach(l=> l.groups.forEach(g=> g.items.forEach(it=>{ if(it.ar && it.de) items.push(it); })));
  startQuizState(state.mixedQuiz, items);
  state.mixedQuiz._scopeNote = doneLessons.length>=1 ? `من ${doneLessons.length} درس مكتمل` : "من كل الـ 18 درس (لسه معندكش دروس مكتملة)";
}

function renderMixedQuiz(){
  const screen = el("div","screen active");
  screen.style.paddingTop = "18px";
  const head = el("div","lesson-header");
  const back = el("div","back-btn","→");
  back.onclick = ()=>{ state.overlay=null; render(); };
  head.appendChild(back);
  head.appendChild(el("div",null,`<h2>🎯 مراجعة شاملة</h2><div class="sub">${state.mixedQuiz._scopeNote||""}</div>`));
  screen.appendChild(head);

  if(state.mixedQuiz.pool.length === 0) startMixedQuiz();
  screen.appendChild(renderQuizEngine(state.mixedQuiz, ()=>{ startMixedQuiz(); render(); }));
  return screen;
}

// ============================= NAV WIRING =============================
document.querySelectorAll("#bottomNav button").forEach(b=>{
  b.addEventListener("click", ()=>{
    state.overlay = null;
    state.nav = b.dataset.nav;
    if(state.nav === "lessons") state.currentLesson = null;
    render();
  });
});

render();
