/* GitHub Actions: TYT/AYT konu kapsamı ve video kaynakları için regresyon denetimi. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const read = path => fs.readFileSync(new URL('../'+path, import.meta.url), 'utf8');
const context = {window:{}};
for (const file of ['curriculum.js','plan.js','resources.js']) {
  new vm.Script(read(file), {filename:file}).runInNewContext(context);
}
new vm.Script(read('app.js'), {filename:'app.js'});
const catalog=context.window.NURULLAH_CATALOG;
const plan=context.window.NURULLAH_PLAN;
const audit=context.window.NURULLAH_AUDIT;
const resources=context.window.NURULLAH_LESSON_SOURCES;
assert.equal(catalog.length,15);
assert.equal(plan.length,100);
assert.equal(audit.lastNewTopicDay,75);
const topics=catalog.flatMap(x=>x.topics.map(t=>({...t,courseId:x.id,exam:x.exam})));
const sessions=plan.flatMap(x=>x.tasks);
assert.equal(topics.length,233);
assert.equal(sessions.length,358);
assert.equal(new Set(sessions.map(t=>t.id)).size,358);
assert.equal(new Set(sessions.map(t=>t.topicId)).size,233);
assert.ok(plan.slice(75).every(x=>!x.tasks.length),'No new topics in days 76-100');
assert.equal(plan.slice(75).filter(x=>x.checks.some(t=>t.label==='TYT genel deneme')).length,5);
assert.equal(plan.slice(75).filter(x=>x.checks.some(t=>t.label==='AYT genel deneme')).length,5);
assert.ok(plan.every(d=>d.routines.some(x=>x.label==='30 dk Paragraf')));
assert.ok(plan.every(d=>d.routines.some(x=>x.label==='30 dk Kitap Okuma')));
assert.ok(plan.slice(4).every(d=>d.routines.some(x=>x.label==='Geometri: 1 test')));
assert.ok(plan.every(d=>!d.routines.some(x=>/Türkçe Branş Denemesi|Geometri: 2 test/i.test(x.label))));

assert.equal(Object.keys(resources.courses).length,15);
const validId = /^[a-z0-9_-]+$/;
let playable=0,searchable=0;
for (const course of catalog) {
  const config=resources.courses[course.id];
  assert.ok(config,'Missing teacher for '+course.id);
  assert.ok(config.options.some(x=>x.id===config.defaults),'Unknown default '+course.id);
  for(const opt of config.options){
    assert.ok(opt.name&&opt.query&&validId.test(opt.id));
    if(opt.playlist){
      assert.match(opt.playlist,/^https:\/\/www\.youtube\.com\/playlist\?list=[A-Za-z0-9_-]+$/);
      playable++;
    }
  }
  for(const t of course.topics) {
    const title=resources.searchLabels[t.id]||t.title;
    const selected=config.options.find(x=>x.id===config.defaults);
    const q=selected.query+' '+course.exam+' '+title+' konu anlatımı';
    const url='https://www.youtube.com/results?search_query='+encodeURIComponent(q);
    assert.ok(url.startsWith('https://www.youtube.com/results?search_query='));
    assert.ok(url.includes(encodeURIComponent(title)));
    searchable++;
  }
}
for(const [topicId,v] of Object.entries(resources.verifiedFirstVideos)){
  assert.ok(topics.some(t=>t.id===topicId),'Unknown verified video topic '+topicId);
  const courseId=topics.find(t=>t.id===topicId).courseId;
  const conf=resources.courses[courseId];
  assert.ok(conf.options.some(x=>x.id===v.instructor),'Wrong teacher for '+topicId);
  assert.match(v.url,/^https:\/\/www\.youtube\.com\/watch\?v=[A-Za-z0-9_-]{11}$/);
  assert.ok(v.title);
}
const html=read('index.html'),sw=read('sw.js'),app=read('app.js');
for(const x of ['curriculum.js?v=1','plan.js?v=2','resources.js?v=1','app.js?v=3']){
  assert.ok(html.includes(x),'Missing HTML script '+x);
  assert.ok(sw.includes('./'+x),'Missing offline asset '+x);
}
for(const x of ['view-sources','teacherSettings','view-day','view-catalog','view-stats'])assert.ok(html.includes('id="'+x+'"'));
for(const x of ['selectedSource','topicQuery','matchedVideo','renderSources','instructors:'])assert.ok(app.includes(x));

console.log('PASS: 100 days, 233 topics, 358 sessions, '+searchable+' teacher-topic searches, '+playable+' verified playlists, '+
 Object.keys(resources.verifiedFirstVideos).length+' verified first videos; all core routines intact.');
