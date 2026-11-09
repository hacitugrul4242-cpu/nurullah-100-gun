import {test, expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';

const dayButton=(page,n)=>page.locator('#dayStrip .day').nth(n-1);

async function shiftLocalDate(page,offset){
  return page.evaluate(days=>{
    const date=new Date();
    date.setDate(date.getDate()+days);
    const z=n=>String(n).padStart(2,'0');
    return date.getFullYear()+'-'+z(date.getMonth()+1)+'-'+z(date.getDate());
  },offset);
}
async function setStart(page,date){
  await page.locator('#startDate').fill(date);
  await page.locator('#startDate').dispatchEvent('change');
}
async function assertDay(page,n){
  await expect(page.locator('#currentTitle')).toHaveText(n+'. Gün');
  await expect(page.locator('#jumpDay')).toHaveValue(String(n));
  await expect(page.locator('#dayStrip .day.active')).toHaveText(String(n));
}
test.beforeEach(async ({page})=>{
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto('/');
  await expect(page.locator('#currentTitle')).toBeVisible();
  await expect(page.locator('#dayStrip .day')).toHaveCount(100);
  // Individual tests also fail if script startup breaks; no state is shared.
});

test('Every numbered day opens its own contents, not the following day',async ({page})=>{
  for(const n of [1,2,3,4,15,25,45,75,76,99,100,1]){
    await dayButton(page,n).click();
    await assertDay(page,n);
  }
  await page.locator('#jumpDay').selectOption('3');
  await assertDay(page,3);
  await page.reload();
  await assertDay(page,3);
});

test('Previous, next and keyboard navigation respect day 1–100 boundaries',async ({page})=>{
  await dayButton(page,1).click();
  await expect(page.locator('#dayPrev')).toBeDisabled();
  await page.locator('#dayNext').click();
  await assertDay(page,2);
  await page.locator('#dayPrev').click();
  await assertDay(page,1);
  await dayButton(page,3).focus();
  await page.keyboard.press('ArrowRight');
  await assertDay(page,4);
  await page.keyboard.press('Home');
  await assertDay(page,1);
  await dayButton(page,1).focus();
  await page.keyboard.press('End');
  await assertDay(page,100);
  await expect(page.locator('#dayNext')).toBeDisabled();
  await page.locator('#dayPrev').click();
  await assertDay(page,99);
});

test('Future dates remain viewable but never allow early completion',async ({page})=>{
  await setStart(page,await shiftLocalDate(page,1));
  await dayButton(page,1).click();
  await assertDay(page,1);
  await expect(page.locator('#lockNotice')).toBeVisible();
  await expect(page.locator('#agenda input[type="checkbox"]').first()).toBeDisabled();
  await dayButton(page,2).click();
  await assertDay(page,2);
  await expect(page.locator('#routines input[type="checkbox"]').first()).toBeDisabled();
  // At the real start date, the previous day becomes available.
  await setStart(page,await shiftLocalDate(page,-1));
  await dayButton(page,1).click();
  await expect(page.locator('#lockNotice')).toBeHidden();
  await expect(page.locator('#agenda input[type="checkbox"]').first()).toBeEnabled();
});

test('Completed tasks and notes persist without shifting days',async ({page})=>{
  await setStart(page,await shiftLocalDate(page,-1));
  await dayButton(page,1).click();
  const first=page.locator('#agenda input[type="checkbox"]').first();
  await first.check();
  await expect(page.locator('#dayBadge')).toContainText('1 /');
  await page.locator('#dayNote').fill('TYT temel kavramlar çalışıldı.');
  await dayButton(page,2).click();
  await assertDay(page,2);
  await dayButton(page,1).click();
  await expect(page.locator('#agenda input[type="checkbox"]').first()).toBeChecked();
  await expect(page.locator('#dayNote')).toHaveValue('TYT temel kavramlar çalışıldı.');
  await page.reload();
  await assertDay(page,1);
  await expect(page.locator('#agenda input[type="checkbox"]').first()).toBeChecked();
  await expect(page.locator('#dayNote')).toHaveValue('TYT temel kavramlar çalışıldı.');
});

test('JSON backup exports and restores progress and selected teacher',async ({page})=>{
  await setStart(page,await shiftLocalDate(page,-1));
  await dayButton(page,1).click();
  await page.locator('#agenda input[type="checkbox"]').first().check();
  await page.locator('#dayNote').fill('Yedekleme doğrulaması.');
  await page.locator('[data-tab="sources"]').click();
  const teacher=page.getByLabel('TYT Matematik eğitmen seçimi');
  await teacher.selectOption('mert');
  await expect(teacher).toHaveValue('mert');
  await page.locator('[data-tab="stats"]').click();
  const downloadPromise=page.waitForEvent('download');
  await page.locator('#exportBtn').click();
  const download=await downloadPromise;
  const exported=JSON.parse(await readFile(await download.path(),'utf8'));
  expect(exported.kind).toBe('nurullah100');
  expect(exported.version).toBe(1);
  expect(exported.instructors['tyt-mat']).toBe('mert');
  expect(exported.notes['1']).toBe('Yedekleme doğrulaması.');
  expect(Object.keys(exported.progress).length).toBeGreaterThan(0);

  page.once('dialog',d=>d.accept());
  await page.locator('#resetBtn').click();
  await page.locator('[data-tab="day"]').click();
  await dayButton(page,1).click();
  await expect(page.locator('#agenda input[type="checkbox"]').first()).not.toBeChecked();

  await page.locator('[data-tab="stats"]').click();
  page.once('dialog',d=>d.accept());
  await page.locator('#importFile').setInputFiles({
    name:'nurullah-backup.json',
    mimeType:'application/json',
    buffer:Buffer.from(JSON.stringify(exported),'utf8')
  });
  await page.locator('[data-tab="day"]').click();
  await dayButton(page,1).click();
  await expect(page.locator('#agenda input[type="checkbox"]').first()).toBeChecked();
  await expect(page.locator('#dayNote')).toHaveValue('Yedekleme doğrulaması.');
  await page.locator('[data-tab="sources"]').click();
  await expect(page.getByLabel('TYT Matematik eğitmen seçimi')).toHaveValue('mert');
});

test('Curriculum and chosen teachers link to matching subject searches',async ({page})=>{
  await page.locator('[data-tab="catalog"]').click();
  await expect(page.locator('.catalog-course')).toHaveCount(15);
  await expect(page.locator('.catalog-topic')).toHaveCount(233);
  await expect(page.locator('.catalog-topic a.lesson-link')).toHaveCount(233);
  await page.locator('#courseFilter').selectOption('ayt-fiz');
  await expect(page.locator('.catalog-course')).toHaveCount(1);
  await expect(page.locator('.catalog-topic')).toHaveCount(23);

  await page.locator('[data-tab="sources"]').click();
  await expect(page.locator('.source-setting-card')).toHaveCount(15);
  await page.getByLabel('TYT Matematik eğitmen seçimi').selectOption('mert');
  await page.locator('[data-tab="day"]').click();
  await dayButton(page,1).click();
  const teacherLabel=page.locator('#agenda .teacher-name').filter({hasText:'Mert Hoca'}).first();
  await expect(teacherLabel).toBeVisible();
  const searchUrl=await page.locator('#agenda .task-resource-actions').filter({hasText:'Mert Hoca'}).locator('a.search').first().getAttribute('href');
  expect(searchUrl).toContain('youtube.com/results?search_query=');
  expect(decodeURIComponent(searchUrl)).toContain('Mert Hoca');
  expect(decodeURIComponent(searchUrl)).toContain('Temel');
});


test('All 1,096 editorial subtopics load and persist independently of daily tasks',async ({page})=>{
  await setStart(page,await shiftLocalDate(page,-1));
  await page.locator('[data-tab="catalog"]').click();
  await expect(page.locator('#subtopicSummary')).toContainText('1096');
  await expect(page.locator('.subtopic-toggle')).toHaveCount(233);
  await page.locator('#courseFilter').selectOption('tyt-mat');
  await page.locator('#topicSearch').fill('Temel Kavramlar');
  await expect(page.locator('.subtopic-toggle')).toHaveCount(1);
  await page.locator('.subtopic-toggle').click();
  await expect(page.locator('.subtopic-line').first()).toBeVisible();
  await page.locator('.subtopic-line input').first().check();
  await expect(page.locator('#subtopicSummary')).toContainText('1 / 1096');
  await page.reload();
  await page.locator('[data-tab="catalog"]').click();
  await page.locator('#courseFilter').selectOption('tyt-mat');
  await page.locator('#topicSearch').fill('Temel Kavramlar');
  await page.locator('.subtopic-toggle').click();
  await expect(page.locator('.subtopic-line input').first()).toBeChecked();
});

test('Future subtopics cannot be marked before the first scheduled day',async ({page})=>{
  await setStart(page,await shiftLocalDate(page,1));
  await page.locator('[data-tab="catalog"]').click();
  await expect(page.locator('#subtopicSummary')).toContainText('1096');
  await page.locator('#courseFilter').selectOption('tyt-mat');
  await page.locator('#topicSearch').fill('Temel Kavramlar');
  await page.locator('.subtopic-toggle').click();
  await expect(page.locator('.subtopic-line input').first()).toBeDisabled();
  await expect(page.locator('.subtopic-locked')).toBeVisible();
});

test('Subtopic checks survive JSON export/import without changing main completion',async ({page})=>{
  await setStart(page,await shiftLocalDate(page,-1));
  await page.locator('[data-tab="catalog"]').click();
  await expect(page.locator('#subtopicSummary')).toContainText('1096');
  await page.locator('#courseFilter').selectOption('tyt-mat');
  await page.locator('#topicSearch').fill('Temel Kavramlar');
  await page.locator('.subtopic-toggle').click();
  await page.locator('.subtopic-line input').first().check();
  await page.locator('[data-tab="stats"]').click();
  const downloadPromise=page.waitForEvent('download');
  await page.locator('#exportBtn').click();
  const download=await downloadPromise;
  const exported=JSON.parse(await readFile(await download.path(),'utf8'));
  expect(exported.subtopicProgress['tyt-mat-01:0']).toBe(true);
  expect(Object.keys(exported.progress).length).toBe(0);
  page.once('dialog',d=>d.accept());
  await page.locator('#resetBtn').click();
  await expect(page.locator('#subtopicStats')).toContainText('0 / 1096');
  page.once('dialog',d=>d.accept());
  await page.locator('#importFile').setInputFiles({
    name:'nurullah-checklist.json',mimeType:'application/json',
    buffer:Buffer.from(JSON.stringify(exported),'utf8')
  });
  await expect(page.locator('#subtopicStats')).toContainText('1 / 1096');
  await page.locator('[data-tab="catalog"]').click();
  await page.locator('#courseFilter').selectOption('tyt-mat');
  await page.locator('#topicSearch').fill('Temel Kavramlar');
  const toggle=page.locator('.subtopic-toggle');
  if(await toggle.getAttribute('aria-expanded')!=='true')await toggle.click();
  await expect(page.locator('.subtopic-line input').first()).toBeChecked();
});


test('Day 3 separately lists all unfinished tasks from days 1 and 2',async ({page})=>{
  await setStart(page,await shiftLocalDate(page,-2));
  await dayButton(page,1).click();
  await expect(page.locator('#dailyBacklog')).toBeHidden();
  await dayButton(page,2).click();
  await expect(page.locator('#dailyBacklogList .backlog-day')).toHaveCount(1);
  await dayButton(page,3).click();
  await assertDay(page,3);
  const count=await page.evaluate(()=>{
    return window.NURULLAH_PLAN.slice(0,2).reduce((sum,d)=>sum+d.tasks.length+d.routines.length+d.checks.length,0);
  });
  await expect(page.locator('#dailyBacklogCount')).toHaveText(count+' eksik görev');
  await expect(page.locator('#dailyBacklogList .backlog-day')).toHaveCount(2);
  await expect(page.locator('#dailyBacklogList .backlog-day').nth(0).locator('summary')).toContainText('1. Gün');
  await expect(page.locator('#dailyBacklogList .backlog-day').nth(1).locator('summary')).toContainText('2. Gün');
  await expect(page.locator('#dailyBacklogList .backlog-task')).toHaveCount(count);
  await expect(page.locator('#dayBadge')).toContainText('0 /');
});

test('Completing a prior-day task from Day 3 removes it and updates its original day',async ({page})=>{
  await setStart(page,await shiftLocalDate(page,-2));
  await dayButton(page,3).click();
  const original=await page.evaluate(()=>window.NURULLAH_PLAN[0].tasks[0].id);
  const currentBadge=await page.locator('#dayBadge').textContent();
  const total=await page.locator('#dailyBacklogList .backlog-task').count();
  // Completion removes the row immediately; .check() would re-query the next unchecked row.
  await page.locator('#dailyBacklogList .backlog-day').first().locator('.backlog-task input').first().click();
  await expect(page.locator('#dailyBacklogList .backlog-task')).toHaveCount(total-1);
  await expect(page.locator('#dayBadge')).toHaveText(currentBadge);
  const stored=await page.evaluate(id=>JSON.parse(localStorage.getItem('nurullah100-app-v1')).progress[id],original);
  expect(stored).toBe(true);
  await dayButton(page,1).click();
  await expect(page.locator('#agenda input[type="checkbox"]').first()).toBeChecked();
  await dayButton(page,3).click();
  await page.reload();
  await assertDay(page,3);
  await expect(page.locator('#dailyBacklogList .backlog-task')).toHaveCount(total-1);
});

test('Backlog never counts future dates as missing',async ({page})=>{
  await setStart(page,await shiftLocalDate(page,1));
  await dayButton(page,3).click();
  await expect(page.locator('#dailyBacklogCount')).toHaveText('0 eksik görev');
  await expect(page.locator('#dailyBacklogList .backlog-task')).toHaveCount(0);
  await expect(page.locator('#dailyBacklogHint')).toContainText('Gelecekteki görevler');
  await setStart(page,await shiftLocalDate(page,-1));
  await dayButton(page,3).click();
  const day1=await page.evaluate(()=>{const d=window.NURULLAH_PLAN[0];return d.tasks.length+d.routines.length+d.checks.length});
  await expect(page.locator('#dailyBacklogCount')).toHaveText(day1+' eksik görev');
  await expect(page.locator('#dailyBacklogList .backlog-day')).toHaveCount(1);
});


test('Sage / Slate focus theme is light, legible, and keeps day selection clear',async ({page})=>{
  const state=await page.evaluate(()=>{
    const css=(sel)=>getComputedStyle(document.querySelector(sel));
    return {
      scheme:getComputedStyle(document.documentElement).colorScheme,
      surface:css('.progress-panel').backgroundColor,
      text:css('body').color,
      primary:getComputedStyle(document.documentElement).getPropertyValue('--primary').trim(),
      selectedDay:css('#dayStrip .day.active').backgroundColor,
      before:getComputedStyle(document.body,'::before').content,
      theme:document.querySelector('meta[name="theme-color"]').content,
      sheet:[...document.styleSheets].map(s=>s.href||'').join(' ')
    };
  });
  expect(state.scheme).toBe('light');
  expect(state.surface).toBe('rgb(255, 255, 255)');
  expect(state.text).toBe('rgb(34, 49, 43)');
  expect(state.primary).toBe('#547e6d');
  expect(state.selectedDay).toBe('rgb(225, 239, 229)');
  expect(state.before).toBe('none');
  expect(state.theme).toBe('#F4F6F5');
  expect(state.sheet).toContain('focus.css?v=2');
  expect(state.sheet).not.toContain('gothic.css');
  await dayButton(page,1).click();
  await assertDay(page,1);
  await page.locator('#dayNext').click();
  await assertDay(page,2);
  await page.locator('#dayPrev').click();
  await assertDay(page,1);
  await setStart(page,await shiftLocalDate(page,1));
  await dayButton(page,1).click();
  await expect(page.locator('#dayStrip .day.active')).toHaveCSS('background-color','rgb(225, 239, 229)');
});

test('Missing tasks use soft amber and no horizontal page overflow on desktop or phone',async ({page})=>{
  await setStart(page,await shiftLocalDate(page,-2));
  await dayButton(page,3).click();
  await expect(page.locator('#dailyBacklog')).toBeVisible();
  const details=await page.evaluate(()=>{
    const box=getComputedStyle(document.querySelector('#dailyBacklog'));
    const count=getComputedStyle(document.querySelector('#dailyBacklogCount'));
    return {
      background:box.backgroundImage,
      border:box.borderColor,
      countColor:count.color,
      width:document.documentElement.scrollWidth,
      viewport:window.innerWidth
    };
  });
  expect(details.background).toContain('linear-gradient');
  expect(details.border).toBe('rgb(230, 216, 189)');
  expect(details.countColor).toBe('rgb(129, 95, 48)');
  expect(details.width).toBeLessThanOrEqual(details.viewport+2);
  await page.locator('[data-tab="sources"]').click();
  await expect(page.locator('.source-setting-card')).toHaveCount(15);
  await page.locator('[data-tab="catalog"]').click();
  await expect(page.locator('.catalog-course')).toHaveCount(15);
});
