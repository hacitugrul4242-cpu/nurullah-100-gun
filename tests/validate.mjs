/* GitHub Actions: TYT/AYT konu kapsamı ve video kaynakları için regresyon denetimi. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {inflateSync} from 'node:zlib';

const read = path => fs.readFileSync(new URL('../'+path, import.meta.url), 'utf8');
const context = {window:{}};
for (const file of ['curriculum.js','plan.js','resources.js','subtopics-data.js']) {
  new vm.Script(read(file), {filename:file}).runInNewContext(context);
}
new vm.Script(read('app.js'), {filename:'app.js'});
const catalog=context.window.NURULLAH_CATALOG;
const plan=context.window.NURULLAH_PLAN;
const audit=context.window.NURULLAH_AUDIT;
const resources=context.window.NURULLAH_LESSON_SOURCES;

const packed=context.window.NURULLAH_SUBTOPICS_DEFLATE_B64;
assert.equal(typeof packed,'string','The subtopic archive must be bundled');
const subtopics=JSON.parse(inflateSync(Buffer.from(packed,'base64')).toString('utf8'));
assert.equal(Object.keys(subtopics).length,233,'All 233 topics must have editorial subtopics');
assert.equal(Object.values(subtopics).reduce((n,a)=>n+a.length,0),1096,'Editorial checklist must contain exactly 1,096 points');
const catalogIds=catalog.flatMap(c=>c.topics.map(t=>t.id));
assert.equal(Object.keys(subtopics).sort().join('|'),Array.from(catalogIds).sort().join('|'),'Subtopic keys must match curriculum IDs');
assert.ok(Object.values(subtopics).every(a=>Array.isArray(a)&&a.every(s=>typeof s==='string'&&s.trim())));
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
for(const x of ['curriculum.js?v=1','plan.js?v=2','resources.js?v=1','subtopics-data.js?v=1','app.js?v=8']){
  assert.ok(html.includes(x),'Missing HTML script '+x);
  assert.ok(sw.includes('./'+x),'Missing offline asset '+x);
}


/* Critical regression: the plan is 0-indexed, but day numbers are 1-indexed.
   Previously renderDay read PLAN[db.selectedDay], displaying the following day. */
assert.ok(app.includes('var p=PLAN[db.selectedDay-1],day=p.day'),'A clicked day must render its own program entry');
assert.ok(!app.includes('PLAN[db.selectedDay]'),'Off-by-one day rendering bug reintroduced');
for(const day of [1,2,3,4,25,45,75,99,100]){
  const chosen=plan[day-1];
  assert.equal(chosen.day,day,'Day '+day+' must resolve to itself');
}
assert.equal(plan[0].day,1,'Day 1 must resolve to first plan item, not the second');
assert.equal(plan[99].day,100,'Day 100 must resolve to last plan item');

/* Regression: day 1 must stay reachable after selecting day 2.
   The old scrollIntoView({inline:'center'}) moved it off the left edge. */
assert.ok(html.includes('id="dayPrev"')&&html.includes('id="dayNext"'),'Missing sequential day controls');
assert.ok(html.includes('id="dayStrip"'),'Missing day strip');
assert.ok(app.includes("strip.scrollLeft=day<=3?0:"),'Day 1/2/3 are no longer anchored left');
assert.ok(!app.includes("selected.scrollIntoView("),'Old day navigation scroll regression reintroduced');
assert.ok(app.includes("stepDay(-1)")&&app.includes("stepDay(1)"),'Previous/next button handlers missing');
assert.ok(app.includes("e.key==='ArrowLeft'")&&app.includes("e.key==='ArrowRight'"),'Keyboard navigation missing');
assert.ok(app.includes("db.selectedDay=Math.min(100,Math.max(1,next))"),'Day bounds not enforced');
assert.ok(app.includes("setAttribute('aria-current','date')"),'Selected day should have accessible current state');
assert.ok(html.includes('focus.css?v=1'),'Sage / Slate theme missing from page');
assert.ok(sw.includes("'./focus.css?v=1'"),'Offline cache missing Sage / Slate theme');
assert.ok(sw.includes("'./app.js?v=8'"),'Offline cache app version not updated');
assert.ok(app.includes('loadSubtopics()')&&app.includes('subtopicProgress:'),'Subtopic progress must remain persistent');
assert.ok(html.includes('id="subtopicSummary"')&&html.includes('id="subtopicStats"'),'Subtopic controls missing');
assert.ok(sw.includes("'./subtopics-data.js?v=1'"),'Subtopic archive missing from offline cache');
assert.ok(html.includes('id="dailyBacklog"')&&html.includes('id="dailyBacklogList"')&&html.includes('id="dailyBacklogCount"'),'Daily missing-task display absent');
assert.ok(app.includes('function overdueForSelectedDay(day)'),'Overdue day lookup absent');
assert.ok(app.includes('Math.min(day,todayIndex())'),'Overdue tasks must respect both selected and actual day');
assert.ok(app.includes('toggle(t.id,group.day,input.checked)'),'Backlog must use original task ID and original day');
assert.ok(app.includes('renderDailyBacklog(day)'),'Daily missing tasks not rendered');
const focus=read('focus.css');
assert.ok(focus.includes('.day-arrow')&&focus.includes('pointer-events:none'),'Sage / Slate navigation style regression');
assert.ok(focus.includes('--primary:#547e6d')&&focus.includes('--warning-soft:#fff7e9'),'Sage and amber design tokens are missing');

assert.ok(focus.includes('color-scheme:light'),'Theme must be light-first');
assert.ok(!html.includes('gothic.css')&&!sw.includes('gothic-scene.svg'),'Old Gothic visual assets still loaded');
assert.ok(html.includes('content="#F4F6F5"'),'Browser theme color must match new light UI');
const manifest=JSON.parse(read('manifest.webmanifest'));
assert.equal(manifest.theme_color,'#F4F6F5');
assert.equal(manifest.background_color,'#F4F6F5');
const workflow=read('.github/workflows/pages.yml');
assert.ok(workflow.includes('styles.css focus.css'),'Published bundle must contain focus.css');
assert.ok(!workflow.includes('gothic-scene.svg'),'Do not publish retired Gothic artwork');
for(const x of ['view-sources','teacherSettings','view-day','view-catalog','view-stats'])assert.ok(html.includes('id="'+x+'"'));
for(const x of ['selectedSource','topicQuery','matchedVideo','renderSources','instructors:'])assert.ok(app.includes(x));

console.log('PASS: 100 days, 233 topics, 358 sessions, '+searchable+' teacher-topic searches, '+playable+' verified playlists, '+
 Object.keys(resources.verifiedFirstVideos).length+' verified first videos; and 1,096 subtopics; all core routines intact.');
