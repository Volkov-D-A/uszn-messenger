"use strict";

const path = require("node:path");
const { pathToFileURL } = require("node:url");
const puppeteer = require("puppeteer");

const source = process.argv[2];
const destination = process.argv[3];

if (!source || !destination) {
  console.error("Usage: node render-slide.js <source.html> <destination.png>");
  process.exit(2);
}

(async () => {
  const browser = await puppeteer.launch({
    executablePath: process.env.CHROME_PATH,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
  await page.goto(pathToFileURL(path.resolve(source)).href, { waitUntil: "networkidle0" });
  await page.screenshot({ path: path.resolve(destination), type: "png" });
  await browser.close();
  console.log(`Rendered: ${destination}`);
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

