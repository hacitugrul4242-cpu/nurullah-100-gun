import {defineConfig, devices} from '@playwright/test';

export default defineConfig({
  testDir:'./tests',
  testMatch:'**/*.spec.mjs',
  fullyParallel:true,
  forbidOnly:!!process.env.CI,
  retries:process.env.CI?1:0,
  workers:process.env.CI?2:undefined,
  reporter:process.env.CI?'github':'list',
  timeout:30000,
  expect:{timeout:8000},
  use:{
    baseURL:'http://127.0.0.1:4173',
    timezoneId:'Europe/Istanbul',
    locale:'tr-TR',
    trace:'retain-on-failure',
    screenshot:'only-on-failure',
    serviceWorkers:'block'
  },
  projects:[
    {name:'chromium',use:{...devices['Desktop Chrome']}},
    {name:'mobile-chromium',use:{...devices['iPhone 13'],defaultBrowserType:'chromium'}}
  ],
  webServer:{
    command:'python3 -m http.server 4173 --bind 127.0.0.1',
    url:'http://127.0.0.1:4173/',
    timeout:30000,
    reuseExistingServer:!process.env.CI
  }
});
