#!/usr/bin/env node

/**
 * Automated Storage Clearer - Puppeteer Script
 * 
 * Removes all ShopFlow demo data from localStorage, sessionStorage, IndexedDB, caches, and service workers.
 * 
 * Usage:
 *   npm install puppeteer
 *   node clear-storage.js [url]
 * 
 * Example:
 *   node clear-storage.js http://localhost:5173
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const CLEAR_DATA_PATH = path.resolve(__dirname, 'clear-data.html');
const DEFAULT_URL = process.env.APP_URL || 'http://localhost:5173';
const CLEAR_HTML_URL = `file://${CLEAR_DATA_PATH}`;

async function clearStorage(appUrl = DEFAULT_URL) {
  let browser;
  try {
    console.log('🚀 Launching Puppeteer...');
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();

    // Navigate to the app first to populate storage
    console.log(`📍 Opening app at ${appUrl}...`);
    await page.goto(appUrl, { waitUntil: 'domcontentLoaded', timeout: 10000 }).catch(() => {
      console.warn('⚠️ App page not accessible (may not be running), but continuing...');
    });

    // Now navigate to clear-data.html
    console.log(`🧹 Loading clear-data.html...`);
    await page.goto(CLEAR_HTML_URL, { waitUntil: 'domcontentLoaded' });

    // Wait for the page to load and analyze data
    await page.waitForSelector('#dataList', { timeout: 5000 });
    console.log('✅ Clear UI loaded');

    // Click "Clear Everything" button
    console.log('🔄 Clicking "Clear Everything"...');
    await page.evaluate(() => {
      // Confirm the alert
      window.confirm = () => true;
    });

    // Click the Clear Everything button
    const clearEverythingBtn = await page.$('button:contains("Clear Everything")');
    if (clearEverythingBtn) {
      await page.click('button');
      // Get all buttons and find the one with text containing "Clear Everything"
      const buttons = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('button')).map(b => ({ text: b.textContent, index: Array.from(document.querySelectorAll('button')).indexOf(b) }));
      });
      const clearEverythingIndex = buttons.find(b => b.text.includes('Clear Everything'))?.index || 3;
      const allButtons = await page.$$('button');
      if (allButtons[clearEverythingIndex]) {
        await allButtons[clearEverythingIndex].click();
      }
    }

    // Wait for clearing to complete
    console.log('⏳ Waiting for clearing to complete...');
    await page.waitForTimeout(2000);

    // Verify results
    const result = await page.evaluate(() => {
      const resultEl = document.getElementById('result');
      return resultEl ? resultEl.textContent : 'No result';
    });
    console.log(`📊 Result: ${result.substring(0, 100)}...`);

    // Also manually clear via page evaluation for additional safety
    console.log('🔧 Performing additional clearing via page context...');
    await page.evaluate(() => {
      // Clear localStorage
      localStorage.clear();
      // Clear sessionStorage
      sessionStorage.clear();
      // Clear cookies
      document.cookie.split(";").forEach(c => {
        const eqPos = c.indexOf("=");
        const name = eqPos > -1 ? c.substr(0, eqPos).trim() : c.trim();
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
      });
    });

    // Clear IndexedDB
    console.log('💾 Clearing IndexedDB...');
    await page.evaluate(async () => {
      if ('indexedDB' in window) {
        if (indexedDB.databases) {
          const dbs = await indexedDB.databases();
          for (const db of dbs) {
            if (db.name) {
              await new Promise((resolve) => {
                const req = indexedDB.deleteDatabase(db.name);
                req.onsuccess = () => resolve(null);
                req.onerror = () => resolve(null);
                req.onblocked = () => resolve(null);
              });
            }
          }
        }
      }
    });

    // Unregister service workers
    console.log('⚙️ Unregistering service workers...');
    await page.evaluate(async () => {
      if ('serviceWorker' in navigator) {
        try {
          const regs = await navigator.serviceWorker.getRegistrations();
          for (const r of regs) {
            await r.unregister();
          }
        } catch (e) {
          console.error('SW unregister error:', e);
        }
      }
    });

    // Clear caches
    console.log('📦 Clearing caches...');
    await page.evaluate(async () => {
      if ('caches' in window) {
        try {
          const keys = await caches.keys();
          for (const k of keys) {
            await caches.delete(k);
          }
        } catch (e) {
          console.error('Cache clear error:', e);
        }
      }
    });

    console.log('✨ Storage clearing complete!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Parse command line arguments
const appUrl = process.argv[2] || DEFAULT_URL;
console.log(`📋 Clear Storage Script
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
App URL: ${appUrl}
Clear HTML: ${CLEAR_DATA_PATH}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

clearStorage(appUrl).then(() => {
  console.log('✅ All done! Your storage is clean.');
  process.exit(0);
});
