(function () {
  'use strict';
  var CATALOG=window.NURULLAH_CATALOG||[];
  var PLAN=window.NURULLAH_PLAN||[];
  var AUDIT=window.NURULLAH_AUDIT||{};
  var SOURCES=window.NURULLAH_LESSON_SOURCES||{courses:{},verifiedFirstVideos:{},searchLabels:{}};
  if(PLAN.length!==100){document.body.textContent='Program verileri yüklenemedi.';return;}
  var STORAGE_KEY='nurullah100-app-v1';
  var $=function(id){return document.getElementById(id)};
  var esc=function(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
  })};
  var pad=function(n){return String(n).padStart(2,'0')};
  function localISO(date){var d=date||new Date();return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());}
  function validDate(s){if(!/^\d{4}-\d{2}-\d{2}$/.test(s||''))return false;
    var t=new Date(s+'T12:00:00');return Number.isFinite(t.getTime())&&localISO(t)===s;}
  function dayDifference(a,b){var u=function(s){var x=s.split('-').map(Number);return Date.UTC(x[0],x[1]-1,x[2]);};
    return Math.round((u(a)-u(b))/86400000);}
  function todayIndex(){return Math.min(100,Math.max(0,dayDifference(localISO(),db.startDate)+1));}
  function dateOfDay(day){var x=db.startDate.split('-').map(Number),d=new Date(x[0],x[1]-1,x[2],12);
    d.setDate(d.getDate()+day-1);return d;}
  function dateLabel(day){return dateOfDay(day).toLocaleDateString('tr-TR',{weekday:'long',day:'numeric',month:'long',year:'numeric'});}
  function newDb(){return {kind:'nurullah100',version:1,startDate:localISO(),selectedDay:1,progress:{},notes:{},ratings:{},instructors:{}};}
  function load(){try{var old=JSON.parse(localStorage.getItem(STORAGE_KEY)||'null');
    if(!old||old.kind!=='nurullah100'||old.version!==1)return newDb();
    return Object.assign(newDb(),old,
      {progress:old.progress&&typeof old.progress==='object'?old.progress:{},
       notes:old.notes&&typeof old.notes==='object'?old.notes:{},
       ratings:old.ratings&&typeof old.ratings==='object'?old.ratings:{},
       instructors:old.instructors&&typeof old.instructors==='object'?old.instructors:{}});
  }catch(e){return newDb()}}
  var db=load();
  if(!validDate(db.startDate))db.startDate=localISO();
  if(!Number.isInteger(db.selectedDay)||db.selectedDay<1||db.selectedDay>100)db.selectedDay=Math.max(1,todayIndex());
  var tab='day', installEvent=null, toastTimer=null;
  function save(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(db))}catch(e){toast('Kaydedilemedi. Tarayıcı depolamasını kontrol et.');}}
  function toast(s){var el=$('toast');el.textContent=s;el.classList.add('show');
    clearTimeout(toastTimer);toastTimer=setTimeout(function(){el.classList.remove('show')},3400);}
  function tasksOf(day){var p=PLAN[day-1];return p.tasks.concat(p.routines,p.checks);}
  function done(id){return db.progress[id]===true;}
  function dayStat(day){var t=tasksOf(day);var n=t.filter(function(x){return done(x.id)}).length;
    return {done:n,total:t.length,full:t.length>0&&n===t.length};}
  var topicTaskIds={};
  PLAN.forEach(function(p){p.tasks.forEach(function(t){(topicTaskIds[t.topicId]||(topicTaskIds[t.topicId]=[])).push(t.id)})});
  function topicComplete(id){var ids=topicTaskIds[id]||[];return ids.length>0&&ids.every(done)}
  function globalStat(){
    var total=0,completed=0,days=0,overdue=0,limit=todayIndex();
    PLAN.forEach(function(d){
      var s=dayStat(d.day);total+=s.total;completed+=s.done;if(s.full)days++;
      if(d.day<limit)overdue+=s.total-s.done;
    });
    return {total:total,done:completed,days:days,overdue:overdue,pct:total?Math.round(100*completed/total):0};
  }
  function countTopics(){var n=0;CATALOG.forEach(function(c){c.topics.forEach(function(t){if(topicComplete(t.id))n++})});return n;}
  function toggle(id,day,checked){
    if(day>todayIndex()){toast('Gelecek günlerin görevleri işaretlenemez.');return;}
    if(checked)db.progress[id]=true;else delete db.progress[id];
    save();render();
  }
  function selectDay(day){
    var next=Number(day);
    if(!Number.isInteger(next))return;
    db.selectedDay=Math.min(100,Math.max(1,next));
    save();render();
  }
  function stepDay(delta){
    selectDay(db.selectedDay+delta);
  }
  function renderHeader(){
    var g=globalStat();
    $('progressPct').textContent=g.pct+'%';
    $('progressRing').style.setProperty('--progress',g.pct+'%');
    $('progressText').textContent=g.done+' / '+g.total+' görev tamamlandı';
    $('statDays').innerHTML=g.days+' <span>/ 100</span>';
    $('statTopics').textContent=AUDIT.topics||233;
    $('statLearned').textContent=countTopics();
    $('statOverdue').textContent=g.overdue;
    var phases=[
      {start:1,end:25,name:'TYT Temel İnşası'},
      {start:26,end:45,name:'TYT Kapanış + AYT Geçiş'},
      {start:46,end:75,name:'AYT Derinleşme'},
      {start:76,end:100,name:'Soru + Deneme + Onarım'}
    ];
    $('phases').innerHTML='';
    phases.forEach(function(p,i){
      var taskArr=[];
      for(var j=p.start;j<=p.end;j++)taskArr=taskArr.concat(tasksOf(j));
      var n=taskArr.filter(function(t){return done(t.id)}).length;
      var pct=Math.round(100*n/taskArr.length);
      var btn=document.createElement('button');btn.type='button';
      btn.className='phase'+(db.selectedDay>=p.start&&db.selectedDay<=p.end?' active':'');
      btn.innerHTML='<small>FAZ '+(i+1)+'</small><strong>'+esc(p.name)+'</strong><span>'+p.start+'–'+p.end+'. günler</span>'+
        '<div class="tiny-track"><i style="width:'+pct+'%"></i></div>';
      btn.addEventListener('click',function(){selectDay(p.start)});$('phases').appendChild(btn);
    });
    $('startDate').value=db.startDate;
    $('jumpDay').value=String(db.selectedDay);
  }
  /* Eğitmen tercihleri: öğretmen araması ile doğrulanmış video/playlist farklı kaynak tipleridir. */
  function sourceConfig(courseId){return SOURCES.courses[courseId]||null;}
  function selectedSource(courseId){
    var conf=sourceConfig(courseId);
    if(!conf)return null;
    var preferred=db.instructors[courseId]||conf.defaults;
    return conf.options.find(function(x){return x.id===preferred})||
           conf.options.find(function(x){return x.id===conf.defaults})||conf.options[0];
  }
  function topicQuery(topic,courseId){
    var conf=sourceConfig(courseId),teacher=selectedSource(courseId);
    if(!teacher||!conf)return null;
    var raw=(SOURCES.searchLabels||{})[topic.topicId]||topic.title||topic.label;
    raw=String(raw||'').replace(/\s*\(\d+\/\d+\)\s*$/,'').replace(/\s*\(İleri\)/i,'').trim();
    var exam=courseId.startsWith('ayt')?'AYT':'TYT';
    return 'https://www.youtube.com/results?search_query='+encodeURIComponent(teacher.query+' '+exam+' '+raw+' konu anlatımı');
  }
  function matchedVideo(topic,courseId){
    var entry=(SOURCES.verifiedFirstVideos||{})[topic.topicId];
    var selected=selectedSource(courseId);
    return entry&&selected&&entry.instructor===selected.id&&Number(topic.part||1)===1?entry:null;
  }
  function externalAnchor(title,url,kind){
    var a=document.createElement('a');
    a.href=url;a.target='_blank';a.rel='noopener noreferrer';
    a.className='lesson-link'+(kind?' '+kind:'');
    a.textContent=title;
    return a;
  }
  function createTask(t,day){
    var card=document.createElement('div'),line=document.createElement('label');
    var input=document.createElement('input'),body=document.createElement('div');
    card.className='task-item'+(done(t.id)?' done':'');
    line.className='task-line';
    input.type='checkbox';input.checked=done(t.id);
    input.disabled=day>todayIndex();
    input.addEventListener('change',function(){toggle(t.id,day,input.checked)});
    var isCourse=!!t.course;
    body.innerHTML='<span class="task-title">'+esc(t.label)+'</span>'+
      (isCourse?'<span class="task-subtitle">'+esc(t.course)+'</span><span class="tag '+esc(t.color)+'">'+esc(t.exam)+'</span>':'');
    line.appendChild(input);line.appendChild(body);card.appendChild(line);
    if(isCourse&&t.courseId){
      var teacher=selectedSource(t.courseId),url=topicQuery(t,t.courseId),video=matchedVideo(t,t.courseId);
      if(teacher&&url){
        var actions=document.createElement('div');actions.className='task-resource-actions';
        var name=document.createElement('span');name.className='teacher-name';
        name.textContent='Eğitmen: '+teacher.name;actions.appendChild(name);
        if(video){
          var direct=externalAnchor('▶ İlk videoyu aç',video.url,'verified');
          direct.title='Doğrulanmış video: '+video.title;
          actions.appendChild(direct);
        }
        actions.appendChild(externalAnchor('⌕ Hocada konuyu ara',url,'search'));
        if(teacher.playlist){
          var playlist=externalAnchor('☷ Kamp listesi',teacher.playlist,'playlist');
          playlist.title='Doğrulanmış eğitmen oynatma listesi; konu içindeki ilgili dersi seç';
          actions.appendChild(playlist);
        }
        card.appendChild(actions);
      }
    }
    return card;
  }
  function makeSection(title,desc,items,day){
    var card=document.createElement('section');card.className='surface agenda-card';
    card.innerHTML='<div class="card-top"><h3>'+esc(title)+'</h3><span>'+esc(desc)+'</span></div>';
    var list=document.createElement('div');list.className='task-list';
    if(!items.length){list.innerHTML='<div class="empty">Bu gün bu kategoride yeni konu yok. Tekrar ve pekiştirmeye odaklan.</div>'}
    items.forEach(function(t){list.appendChild(createTask(t,day))});card.appendChild(list);return card;
  }
  function fillTaskList(target,items,day){
    target.innerHTML='';
    if(!items.length){target.innerHTML='<div class="empty">Bugün ek kontrol görevi yok.</div>';return;}
    items.forEach(function(t){target.appendChild(createTask(t,day))});
  }
  function renderDay(){
    var p=PLAN[db.selectedDay-1],day=p.day,allowed=day<=todayIndex(),stats=dayStat(day);
    $('currentTitle').textContent=day+'. Gün';
    $('currentDate').textContent=dateLabel(day);
    $('currentPhase').textContent=p.phase;
    $('dayBadge').textContent=stats.done+' / '+stats.total+' tamamlandı';
    $('lockNotice').hidden=allowed;
    if(!allowed)$('lockNotice').textContent='Bu gün henüz gelmedi. Programı inceleyebilirsin fakat görevleri ancak o gün veya sonrasında işaretleyebilirsin.';
    var strip=$('dayStrip');strip.innerHTML='';
    PLAN.forEach(function(d){
      var btn=document.createElement('button'),s=dayStat(d.day);
      btn.type='button';btn.textContent=d.day;btn.title=dateLabel(d.day);
      btn.className='day'+(d.day===day?' active':'')+(s.full?' done':s.done?' partial':'')+(d.day>todayIndex()?' future':'');
      btn.setAttribute('aria-label',d.day+'. gün · '+dateLabel(d.day));
      btn.setAttribute('aria-pressed',String(d.day===day));
      if(d.day===day)btn.setAttribute('aria-current','date');
      btn.addEventListener('click',function(){selectDay(d.day)});
      btn.addEventListener('keydown',function(e){
        if(e.key==='ArrowLeft'||e.key==='ArrowRight'){
          e.preventDefault();
          var next=Math.max(1,Math.min(100,d.day+(e.key==='ArrowRight'?1:-1)));
          selectDay(next);
          var focused=strip.children[next-1];
          if(focused)focused.focus({preventScroll:true});
        }
        if(e.key==='Home'||e.key==='End'){
          e.preventDefault();
          var edge=e.key==='Home'?1:100;selectDay(edge);
          var target=strip.children[edge-1];
          if(target)target.focus({preventScroll:true});
        }
      });
      strip.appendChild(btn);
    });
    /* scrollIntoView({inline:'center'}) 1. günü sola taşır ve tıklanmasını zorlaştırır.
       Gün 1–3 için kesinlikle sol kenara sabitle; diğerlerini yatay şerit içinde ortala.
       Dış sayfanın dikey kaydırma konumuna dokunma. */
    var selected=strip.children[day-1];
    if(selected){
      var center=selected.offsetLeft-strip.offsetLeft-(strip.clientWidth-selected.offsetWidth)/2;
      strip.scrollLeft=day<=3?0:Math.max(0,center);
    }
    $('dayPrev').disabled=day===1;
    $('dayNext').disabled=day===100;
    $('dayPrev').setAttribute('aria-label',Math.max(1,day-1)+'. güne dön');
    $('dayNext').setAttribute('aria-label',Math.min(100,day+1)+'. güne ilerle');
    var a=$('agenda');a.innerHTML='';
    if(day<=75){
      var tyt=p.tasks.filter(function(t){return t.exam==='TYT'});
      var ayt=p.tasks.filter(function(t){return t.exam==='AYT'});
      if(tyt.length)a.appendChild(makeSection('TYT Konuları','Standart konu anlatımı ve pekiştirme',tyt,day));
      if(ayt.length)a.appendChild(makeSection('AYT Konuları','Kademeli derinleşme ve uygulama',ayt,day));
      if(!tyt.length&&!ayt.length)a.appendChild(makeSection('Konu Onarımı','Yeni konu yok; önceki yanlışları çalış',[],day));
      fillTaskList($('checks'),p.checks,day);
    }else{
      a.appendChild(makeSection('Soru, Deneme ve Yanlış Analizi','75. günden sonraki uygulama dönemi',p.checks,day));
      $('checks').innerHTML='<div class="empty">Bugünün soru ve deneme görevleri sol tarafta listelenmiştir.</div>';
    }
    fillTaskList($('routines'),p.routines,day);
    $('routineCount').textContent=p.routines.filter(function(t){return done(t.id)}).length+'/'+p.routines.length;
    $('checkCount').textContent=p.checks.filter(function(t){return done(t.id)}).length+'/'+p.checks.length;
    var ratings=$('rating');ratings.innerHTML='';
    for(var i=1;i<=5;i++){(function(n){
      var b=document.createElement('button');b.type='button';b.className='rate'+(db.ratings[day]===n?' selected':'');
      b.textContent=n;b.setAttribute('aria-label',n+' üzerinden 5');b.disabled=!allowed;
      b.addEventListener('click',function(){db.ratings[day]=n;save();renderDay()});ratings.appendChild(b);
    })(i);}
    $('dayNote').value=db.notes[day]||'';$('dayNote').disabled=!allowed;
  }
  function renderCatalog(){
    var filter=$('courseFilter').value,query=$('topicSearch').value.toLocaleLowerCase('tr-TR').trim();
    var target=$('catalogBody');target.innerHTML='';
    CATALOG.forEach(function(c){
      if(filter!=='all'&&c.id!==filter)return;
      var topics=c.topics.filter(function(t){
        return !query||(t.title+' '+c.name).toLocaleLowerCase('tr-TR').includes(query);
      });
      if(!topics.length)return;
      var n=c.topics.filter(function(t){return topicComplete(t.id)}).length;
      var box=document.createElement('section');box.className='surface catalog-course';
      box.innerHTML='<h3>'+esc(c.name)+'</h3><p>'+n+'/'+c.topics.length+' ana konu tamamlandı • '+esc(c.exam)+'</p>';
      topics.forEach(function(t){
        var complete=topicComplete(t.id),ids=topicTaskIds[t.id]||[];
        var doneCount=ids.filter(done).length;
        var row=document.createElement('div');row.className='catalog-topic';
        var info=document.createElement('div');info.className='catalog-topic-info';
        info.innerHTML='<span>'+esc(t.title)+'</span><span class="topic-pill'+(complete?' completed':'')+'">'+
          (complete?'✓ Tamamlandı':doneCount+'/'+ids.length+' oturum')+'</span>';
        row.appendChild(info);
        var topicRef={topicId:t.id,title:t.title,part:1};
        var direct=matchedVideo(topicRef,c.id);
        var linkUrl=direct?direct.url:topicQuery(topicRef,c.id);
        if(linkUrl){
          var resourceLink=externalAnchor(direct?'▶ İlk videoyu aç':'⌕ Hocada konuyu ara',linkUrl,direct?'verified':'search');
          if(direct)resourceLink.title='Doğrulanmış video: '+direct.title;
          row.appendChild(resourceLink);
        }
        box.appendChild(row);
      });target.appendChild(box);
    });
    if(!target.children.length)target.innerHTML='<div class="empty">Aramaya uyan konu bulunamadı.</div>';
  }
  function renderSources(){
    var host=$('teacherSettings');if(!host)return;
    host.innerHTML='';
    CATALOG.forEach(function(c){
      var conf=sourceConfig(c.id);
      if(!conf)return;
      var current=selectedSource(c.id);
      var card=document.createElement('section');card.className='source-setting-card';
      var head=document.createElement('div');head.className='source-setting-head';
      var title=document.createElement('strong');title.textContent=c.name;
      var label=document.createElement('label');
      label.textContent='Eğitmen tercihi';
      var select=document.createElement('select');
      select.className='source-teacher-select';
      select.setAttribute('aria-label',c.name+' eğitmen seçimi');
      conf.options.forEach(function(o){
        var option=document.createElement('option');option.value=o.id;option.textContent=o.name;select.appendChild(option);
      });
      select.value=current.id;
      select.addEventListener('change',function(){
        db.instructors[c.id]=select.value;save();renderSources();toast(c.name+' eğitmeni güncellendi');
      });
      label.appendChild(select);
      head.appendChild(title);head.appendChild(label);card.appendChild(head);
      var links=document.createElement('div');links.className='source-setting-links';
      var courseUrl='https://www.youtube.com/results?search_query='+encodeURIComponent(current.query+' '+c.exam+' konu anlatımı');
      links.appendChild(externalAnchor('⌕ Ders videolarında ara',courseUrl,'search'));
      if(current.playlist)links.appendChild(externalAnchor('☷ Doğrulanmış kamp listesi',current.playlist,'playlist'));
      if(current.channel)links.appendChild(externalAnchor('Eğitmen kanalı',current.channel,'search'));
      card.appendChild(links);host.appendChild(card);
    });
  }
  function renderStats(){
    var overdue=$('overdueList');
    if(overdue){
      overdue.innerHTML='';
      var current=todayIndex(),items=[];
      PLAN.forEach(function(p){
        if(p.day>=current)return;
        tasksOf(p.day).forEach(function(t){if(!done(t.id))items.push({day:p.day,task:t})});
      });
      $('overdueTotal').textContent=items.length+' açık görev';
      if(!items.length)overdue.innerHTML='<div class="empty">Geciken görev yok.</div>';
      items.slice(0,60).forEach(function(entry){
        var b=document.createElement('button');
        b.type='button';b.className='overdue-item';
        b.textContent='Gün '+entry.day+' · '+entry.task.label;
        b.addEventListener('click',function(){tab='day';selectDay(entry.day);window.scrollTo?.({top:0,behavior:'smooth'})});
        overdue.appendChild(b);
      });
      if(items.length>60){
        var note=document.createElement('p');note.className='aside-hint';
        note.textContent='İlk 60 gecikmiş görev gösteriliyor. Daha eskileri ilgili günlerin içinde bulabilirsin.';
        overdue.appendChild(note);
      }
    }
    var target=$('subjectStats');target.innerHTML='';
    CATALOG.forEach(function(c){
      var n=c.topics.filter(function(t){return topicComplete(t.id)}).length;
      var pct=Math.round(100*n/c.topics.length);
      var row=document.createElement('div');row.className='subject-stat';
      row.innerHTML='<div class="subject-stat-top"><strong>'+esc(c.name)+'</strong><span>'+n+'/'+c.topics.length+' · %'+pct+'</span></div>'+
        '<div class="bar"><i style="width:'+pct+'%"></i></div>';
      target.appendChild(row);
    });
  }
  function renderTabs(){
    document.querySelectorAll('[data-tab]').forEach(function(btn){
      var active=btn.dataset.tab===tab;btn.classList.toggle('active',active);
      btn.setAttribute('aria-current',active?'page':'false');
    });
    ['day','catalog','sources','stats'].forEach(function(s){$('view-'+s).hidden=s!==tab;});
  }
  function render(){renderHeader();renderTabs();if(tab==='day')renderDay();else if(tab==='catalog')renderCatalog();else if(tab==='sources')renderSources();else renderStats();}
  function today(){var n=todayIndex();selectDay(Math.max(1,n));}
  function setup(){
    var sel=$('jumpDay');PLAN.forEach(function(p){var o=document.createElement('option');o.value=p.day;o.textContent=p.day+'. gün';sel.appendChild(o)});
    var courseFilter=$('courseFilter');CATALOG.forEach(function(c){var o=document.createElement('option');o.value=c.id;o.textContent=c.name;courseFilter.appendChild(o)});
    sel.addEventListener('change',function(){selectDay(this.value)});
    $('todayBtn').addEventListener('click',today);
    $('dayPrev').addEventListener('click',function(){stepDay(-1)});
    $('dayNext').addEventListener('click',function(){stepDay(1)});
    $('startDate').addEventListener('change',function(){
      if(!validDate(this.value)){toast('Geçerli bir tarih seç.');this.value=db.startDate;return;}
      if(Object.keys(db.progress).length&&
         !confirm('Başlangıç tarihi değişince bütün günlerin takvim tarihi değişir. Devam edilsin mi?')){
        this.value=db.startDate;return;
      }
      db.startDate=this.value;db.selectedDay=Math.max(1,todayIndex());save();render();
    });
    document.querySelectorAll('[data-tab]').forEach(function(b){b.addEventListener('click',function(){tab=b.dataset.tab;render()})});
    $('courseFilter').addEventListener('change',renderCatalog);
    $('topicSearch').addEventListener('input',renderCatalog);
    $('dayNote').addEventListener('input',function(){
      if(db.selectedDay>todayIndex())return;
      db.notes[db.selectedDay]=this.value.slice(0,4000);save();
    });
    $('exportBtn').addEventListener('click',function(){
      var blob=new Blob([JSON.stringify(Object.assign({exportedAt:new Date().toISOString()},db),null,2)],{type:'application/json'});
      var url=URL.createObjectURL(blob),a=document.createElement('a');
      a.href=url;a.download='nurullah-100-gun-yedek-'+localISO()+'.json';document.body.appendChild(a);a.click();a.remove();
      setTimeout(function(){URL.revokeObjectURL(url)},1000);toast('Yedek dosyası indirildi.');
    });
    $('importFile').addEventListener('change',async function(){
      var file=this.files&&this.files[0];if(!file)return;
      try{
        var obj=JSON.parse(await file.text());
        if(!obj||obj.kind!=='nurullah100'||obj.version!==1||!validDate(obj.startDate)||!obj.progress||typeof obj.progress!=='object'){
          throw Error('Bu dosya Nurullah programına ait geçerli bir yedek değil.');
        }
        if(!confirm('Mevcut kayıtlar bu yedekle değiştirilsin mi?'))return;
        var allowed=new Set(PLAN.flatMap(function(d){return tasksOf(d.day).map(function(t){return t.id})}));
        db=newDb();db.startDate=obj.startDate;db.selectedDay=Math.max(1,Math.min(100,Number(obj.selectedDay)||1));
        Object.entries(obj.progress).forEach(function(e){if(allowed.has(e[0])&&e[1]===true)db.progress[e[0]]=true});
        Object.entries(obj.notes||{}).forEach(function(e){if(/^(100|[1-9]\d?)$/.test(e[0])&&typeof e[1]==='string')db.notes[e[0]]=e[1].slice(0,4000)});
        Object.entries(obj.ratings||{}).forEach(function(e){if(/^(100|[1-9]\d?)$/.test(e[0])&&Number.isInteger(e[1])&&e[1]>=1&&e[1]<=5)db.ratings[e[0]]=e[1]});
        Object.entries(obj.instructors||{}).forEach(function(e){
          var conf=sourceConfig(e[0]);
          if(conf&&conf.options.some(function(o){return o.id===e[1]}))db.instructors[e[0]]=e[1];
        });
        save();render();toast('Yedek geri yüklendi.');
      }catch(e){toast(e.message||'Yedek okunamadı.');}finally{this.value='';}
    });
    $('resetBtn').addEventListener('click',function(){
      if(!confirm('Nurullah programındaki bütün ilerleme, not ve puanlar silinsin mi? Bu işlem geri alınamaz.'))return;
      var start=db.startDate;db=newDb();db.startDate=start;save();render();toast('Cihazdaki kayıtlar sıfırlandı.');
    });
    $('installBtn').addEventListener('click',async function(){
      if(installEvent){installEvent.prompt();try{await installEvent.userChoice}catch(e){}installEvent=null;}
      else toast('Tarayıcı menüsünden “Uygulamayı yükle” veya “Ana ekrana ekle” seçeneğini kullan.');
    });
    window.addEventListener('beforeinstallprompt',function(e){e.preventDefault();installEvent=e;});
    if('serviceWorker' in navigator)window.addEventListener('load',function(){
      navigator.serviceWorker.register('./sw.js?v=5',{updateViaCache:'none'}).catch(function(){});
    });
  }
  setup();save();render();
})();