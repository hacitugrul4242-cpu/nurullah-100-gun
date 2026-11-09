/* Academic scheduling audit: detects overloaded days and repeated subject sessions.
   Planning estimates are NOT measured learning times. */
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const source = file => fs.readFileSync(new URL('../'+file,import.meta.url),'utf8');
const env = {window:{}};
for(const f of ['curriculum.js','plan.js'])new vm.Script(source(f),{filename:f}).runInNewContext(env);
const C=env.window.NURULLAH_CATALOG, P=env.window.NURULLAH_PLAN;

const routineEstimates = {
  '30 dk Paragraf':.5,
  '30 dk Kitap Okuma':.5,
  'Problem Rutini':.52,
  'Geometri: 1 test':.34,
  '1 Sayılar Denemesi':.4,
  '1 Dil Bilgisi Denemesi':.35
};
const checkEstimate = label => label.startsWith('Haftalık')?.55:
  label.includes('kazanım taraması')?.45:0;
const records = P.slice(0,75).map(day=>{
 const unknown=day.routines.filter(t=>!(t.label in routineEstimates));
 assert.equal(unknown.length,0,'Unestimated routine: '+JSON.stringify(unknown));
 const hours=day.tasks.reduce((s,t)=>s+t.hours,0)+
   day.routines.reduce((s,t)=>s+routineEstimates[t.label],0)+
   day.checks.reduce((s,t)=>s+checkEstimate(t.label),0);
 return {day:day.day,estimatedHours:Number(hours.toFixed(2)),sessions:day.tasks.length,
    tyt:day.tasks.filter(t=>t.exam==='TYT').length,
    ayt:day.tasks.filter(t=>t.exam==='AYT').length};
});
const overloaded=records.filter(x=>x.estimatedHours>7);
const tooLong=records.filter(x=>x.estimatedHours>7.5);
assert.equal(tooLong.length,0,'Daily estimates exceed the soft 7.5-hour safety ceiling: '+JSON.stringify(tooLong));

const allSessions = P.flatMap(day=>day.tasks.map(t=>({...t,day:day.day})));
const repeatedTopicDays=[];
for(const day of P){
 const topics=new Map();
 for(const t of day.tasks)topics.set(t.topicId,[...(topics.get(t.topicId)||[]),t]);
 for(const [id,sessions] of topics){
  if(sessions.length>1)repeatedTopicDays.push({
   day:day.day,course:sessions[0].course,topic:sessions[0].title,sessions:sessions.length
  });
 }
}
const courseRanges=[];
for(const course of C){
 const scheduled=allSessions.filter(t=>t.courseId===course.id).sort((a,b)=>a.seq-b.seq);
 for(let i=1;i<scheduled.length;i++){
  assert.ok(scheduled[i-1].day<=scheduled[i].day,
   course.name+': following session scheduled before prerequisite '+scheduled[i].label);
 }
 courseRanges.push({course:course.name,exam:course.exam,start:scheduled[0].day,end:scheduled.at(-1).day,
   topics:course.topics.length,sessions:scheduled.length});
}
for(const exam of ['TYT','AYT']){
 const last=Math.max(...courseRanges.filter(x=>x.exam===exam).map(x=>x.end));
 assert.ok(last<=(exam==='TYT'?45:75),exam+' course ends too late: '+last);
}
const avg=rows=>Number((rows.reduce((s,x)=>s+x.estimatedHours,0)/rows.length).toFixed(2));
const phases=[
  {days:'1–25',estimatedAvgHours:avg(records.slice(0,25)),subjectSessions:records.slice(0,25).reduce((n,x)=>n+x.sessions,0)},
  {days:'26–45',estimatedAvgHours:avg(records.slice(25,45)),subjectSessions:records.slice(25,45).reduce((n,x)=>n+x.sessions,0)},
  {days:'46–75',estimatedAvgHours:avg(records.slice(45,75)),subjectSessions:records.slice(45,75).reduce((n,x)=>n+x.sessions,0)}
];
console.log('ACADEMIC AUDIT',JSON.stringify({
 topicCount:C.reduce((s,c)=>s+c.topics.length,0),
 sessionCount:allSessions.length,
 firstAytDay:Math.min(...allSessions.filter(x=>x.exam==='AYT').map(x=>x.day)),
 lastTytDay:Math.max(...allSessions.filter(x=>x.exam==='TYT').map(x=>x.day)),
 lastNewTopicDay:Math.max(...allSessions.map(x=>x.day)),
 estimatedPeakHours:Math.max(...records.map(x=>x.estimatedHours)),
 daysOverSevenHours:overloaded.map(x=>x.day),
 repeatedTopicDays,phases,
 warning:'Hour estimates are heuristic; 2027 syllabus completeness is not independently certified.'
},null,2));
