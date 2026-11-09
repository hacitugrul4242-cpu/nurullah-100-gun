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
