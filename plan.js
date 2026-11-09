/* Nurullah 100 Gün — 75 günde ana konu hedefi, 25 gün uygulama.
   Yusuf'un ders takviminden bağımsızdır. Plan verisi her cihazda deterministiktir.
   MEB 2026 ve çalışma envanterine dayanan 2027 hazırlık taslağıdır. */
(function(){
"use strict";
const C=window.NURULLAH_CATALOG||[];
const COURSE={
 "tyt-mat":{start:1,end:35,h:.85},
 "tyt-geo":{start:4,end:43,h:.85},
 "tyt-tur":{start:1,end:32,h:.54},
 "tyt-fiz":{start:1,end:27,h:.78},
 "tyt-kim":{start:1,end:26,h:.77},
 "tyt-biy":{start:1,end:26,h:.72},
 "tyt-tar":{start:1,end:35,h:.48},
 "tyt-cog":{start:1,end:35,h:.48},
 "tyt-fel":{start:7,end:38,h:.48},
 "tyt-din":{start:2,end:38,h:.43},
 "ayt-mat":{start:35,end:75,h:1.35},
 "ayt-geo":{start:53,end:75,h:1.07},
 "ayt-fiz":{start:27,end:75,h:1.2},
 "ayt-kim":{start:26,end:75,h:1.07},
 "ayt-biy":{start:27,end:75,h:1.02}
};
const P=Array.from({length:100},(_,i)=>({day:i+1,phase:"",tasks:[],routines:[],checks:[]}));
const byCourse={};
for(const c of C){
 const conf=COURSE[c.id];
 if(!conf)throw Error("Tanımsız ders: "+c.id);
 const arr=[];
 for(const t of c.topics){
   for(let n=1;n<=t.sessions;n++){
     arr.push({
       id:"topic:"+t.id+":"+n,topicId:t.id,courseId:c.id,
       course:c.name,color:c.color,exam:c.exam,
       label:t.title+(t.sessions>1?" ("+n+"/"+t.sessions+")":""),
       title:t.title,part:n,totalParts:t.sessions,
       seq:arr.length,hours:conf.h,day:0,ideal:0
     });
   }
 }
 for(let i=0;i<arr.length;i++){
   const t=arr[i];
   const ideal=conf.start+(i+.5)*(conf.end-conf.start+1)/arr.length;
   t.ideal=ideal;
   t.day=Math.min(conf.end,Math.max(conf.start,Math.floor(ideal)));
   P[t.day-1].tasks.push(t);
 }
 byCourse[c.id]=arr;
}
function routineLoad(day){
 return 1.52
  +(day>=5?.34:0)
  +(day>=18&&day<=70&&day%6===0?.4:0)
  +(day>=30&&day<=75&&day%7===0?.35:0)
  +(day%7===0?.55:0)
  +(day>=28&&day<75&&day%14===0?.45:0);
}
function dayCost(day){
 const arr=P[day-1].tasks;
 const h=routineLoad(day)+arr.reduce((s,t)=>s+t.hours,0);
 const over=Math.max(0,h-7.05);
 const sub={},topics={},fen={};
 for(const t of arr){
   sub[t.courseId]=(sub[t.courseId]||0)+1;
   topics[t.topicId]=(topics[t.topicId]||0)+1;
   if(["fiz","kim","biy"].includes(t.color))fen[t.color]=(fen[t.color]||0)+1;
 }
 const repeat=Object.values(sub).reduce((s,n)=>s+Math.max(0,n-1)*.7,0);
 const sameDayTopic=Object.values(topics).reduce((s,n)=>s+Math.max(0,n-1)*3,0);
 const fen3=Math.max(0,Object.values(fen).reduce((a,b)=>a+b,0)-2);
 return (h-6.25)**2*.35 + over*over*80 +
   Math.max(0,arr.length-6)**2*11 + repeat+sameDayTopic+fen3*fen3*1.3;
}
const courseOrder=Object.values(byCourse).flat();
function preference(t,d){return .055*(d-t.ideal)**2}
for(let pass=0;pass<25;pass++){
 let changed=0;
 const jobs=courseOrder.slice().sort((a,b)=>
  pass%2?(b.seq-a.seq)||a.courseId.localeCompare(b.courseId):(a.seq-b.seq)||a.courseId.localeCompare(b.courseId));
 for(const t of jobs){
   const arr=byCourse[t.courseId],conf=COURSE[t.courseId],old=t.day;
   const prev=arr[t.seq-1]?.day??conf.start;
   const next=arr[t.seq+1]?.day??conf.end;
   const lo=Math.max(conf.start,prev,old-12);
   const hi=Math.min(conf.end,next,old+12);
   let best=old,bestGain=0;
   for(let d=lo;d<=hi;d++){
     if(d===old)continue;
     const a=P[d-1].tasks;
     if(a.length>=7||a.filter(x=>x.courseId===t.courseId).length>=2)continue;
     if(a.some(x=>x.topicId===t.topicId))continue;
     const before=dayCost(old)+dayCost(d)+preference(t,old);
     const source=P[old-1].tasks,idx=source.indexOf(t);
     source.splice(idx,1);a.push(t);
     const after=dayCost(old)+dayCost(d)+preference(t,d);
     a.pop();source.push(t);
     const gain=before-after;
     if(gain>bestGain+1e-8){bestGain=gain;best=d}
   }
   if(best!==old){
      P[old-1].tasks.splice(P[old-1].tasks.indexOf(t),1);
      P[best-1].tasks.push(t);t.day=best;changed++;
   }
 }
 if(!changed)break;
}
const priority={mat:0,geo:1,fiz:2,kim:3,biy:4,tur:5,sos:6};
P.forEach(d=>{
 const day=d.day;
 d.phase=day<=25?"TYT Temel İnşası":day<=45?"TYT Kapanış + AYT Geçiş":
         day<=75?"AYT Derinleşme":"Soru, Deneme ve Eksik Onarımı";
 d.tasks.sort((a,b)=>priority[a.color]-priority[b.color]||a.course.localeCompare(b.course)||a.seq-b.seq);
 d.routines=[
  {id:"routine:"+day+":paragraf",label:"30 dk Paragraf"},
  {id:"routine:"+day+":problem",label:"Problem Rutini"},
  {id:"routine:"+day+":reading",label:"30 dk Kitap Okuma"}
 ];
 if(day>=5)d.routines.push({id:"routine:"+day+":geometry",label:"Geometri: 1 test"});
 if(day>=18&&day<=70&&day%6===0){
   d.routines.push({id:"routine:"+day+":numbers",label:"1 Sayılar Denemesi"});
 }
 if(day>=30&&day<=75&&day%7===0){
   d.routines.push({id:"routine:"+day+":grammar",label:"1 Dil Bilgisi Denemesi"});
 }
 if(day<=75){
   if(day%7===0)d.checks.push({id:"check:"+day+":weekly",label:"Haftalık konu tekrarı ve yanlışların analizi"});
   if(day>=28&&day<75&&day%14===0){
     d.checks.push({id:"check:"+day+":branch",label:day<50?
       "TYT fen ve matematikten öğrenilen konuların soru taraması":
       "TYT–AYT karma kazanım taraması ve hata analizi"});
   }
 }else{
   const group=(day-76)%5,code="practice:"+day+":";
   if(group===0){
     d.checks.push({id:code+"tyt",label:"TYT genel deneme"});
     d.checks.push({id:code+"analysis",label:"TYT denemesi yanlış ve süre analizi"});
   }else if(group===2){
     d.checks.push({id:code+"ayt",label:"AYT genel deneme"});
     d.checks.push({id:code+"analysis",label:"AYT denemesi yanlış ve konu analizi"});
   }else if(group===1){
     d.checks.push({id:code+"math",label:"TYT matematik ve geometri yeni nesil soru uygulaması"});
     d.checks.push({id:code+"science",label:"TYT fen ve sosyal kazanım taraması"});
     d.checks.push({id:code+"repair",label:"Yanlış yapılan soruların çözümünü yeniden kurma"});
   }else if(group===3){
     d.checks.push({id:code+"mat",label:"AYT matematik soru kampı"});
     d.checks.push({id:code+"fen",label:"AYT fizik, kimya ve biyoloji karma soru çalışması"});
     d.checks.push({id:code+"repair",label:"Çözülemeyen soru tipleri için konu onarımı"});
   }else{
     d.checks.push({id:code+"error",label:"Yanlış defteri ve aralıklı konu tekrarı"});
     d.checks.push({id:code+"weak",label:"En zayıf dersin sorularıyla eksik kapatma"});
     d.checks.push({id:code+"rest",label:"Kalan zamanda dinlenme ve gelecek haftayı düzenleme"});
   }
 }
});
const seen=new Map();
const allIds=new Set();
let late=0,topicSessions=0;
for(const p of P){
 for(const t of p.tasks){
   if(p.day>75)late++;
   if(allIds.has(t.id))throw Error("Mükerrer çalışma oturumu: "+t.id);
   allIds.add(t.id);seen.set(t.topicId,(seen.get(t.topicId)||0)+1);topicSessions++;
 }
}
const topicCount=C.reduce((n,c)=>n+c.topics.length,0);
const expected=C.reduce((n,c)=>n+c.topics.reduce((m,t)=>m+t.sessions,0),0);
const missing=C.flatMap(c=>c.topics.filter(t=>seen.get(t.id)!==t.sessions).map(t=>t.id));
for(const c of C){
 const a=byCourse[c.id];
 for(let i=1;i<a.length;i++)if(a[i].day<a[i-1].day)throw Error("Ön koşul sırası bozuldu: "+c.id);
}
if(P.length!==100||topicCount!==233||expected!==358||late||topicSessions!==expected||missing.length){
 throw Error("Kapsam denetimi başarısız: "+JSON.stringify({topicCount,expected,late,topicSessions,missing}));
}
const estimates=P.slice(0,75).map(d=>+((d.tasks.reduce((n,t)=>n+t.hours,0)+routineLoad(d.day)).toFixed(2)));
window.NURULLAH_PLAN=P;
window.NURULLAH_AUDIT={
 days:100,courseGroups:C.length,topics:topicCount,sessions:topicSessions,
 lastNewTopicDay:75,practiceDays:25,missingTopics:0,
 maxDailyTopics:Math.max(...P.map(d=>d.tasks.length)),
 maxEstimatedDailyHours:Math.max(...estimates),
 overSevenHalfDays:estimates.filter(n=>n>7.5).length,
 totalTytSessions:P.reduce((n,d)=>n+d.tasks.filter(t=>t.exam==="TYT").length,0),
 totalAytSessions:P.reduce((n,d)=>n+d.tasks.filter(t=>t.exam==="AYT").length,0),
 sourceNote:"2026 MEB kazanımları ve standart YKS konu tasnifi. Süreler yaklaşık planlama tahminidir."
};
})();