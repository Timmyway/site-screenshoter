const path = require('path');
const fs = require('fs');
const puppeteer = require('puppeteer');

function getFileNameFromUrl(url, onlyBasename = false) {
    if (onlyBasename) {
        const urlPath = new URL(url).pathname;
        var newName = path.basename(urlPath);
    } else {        
        var newName = url;
    }
    const sanitizedBasename = newName.replace(/[^a-zA-Z0-9-_\.]/g, '_');
    return sanitizedBasename;
  }

async function captureScreenshots(urls, subfolder = '', viewport={ width: 1200, height: 600 }, fullPage = false) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    for (const { url } of urls) {
        try {
            await page.goto(url);      
                
            const basename = getFileNameFromUrl(url);
        
            const folderPath = path.join(__dirname, 'screenshots', subfolder);
            if (!fs.existsSync(folderPath)) {
                fs.mkdirSync(folderPath, { recursive: true });
            }
        
            if (viewport && !fullPage) {
                await page.setViewport(viewport);
            }
            
            const filePath = path.join(folderPath, `${basename}.png`);
            await page.screenshot({ path: filePath, type: 'png', fullPage });
            console.log(`Screenshot saved to ${filePath}`);
        } catch (error) {
            if (error instanceof puppeteer.errors.TimeoutError) {
                console.error(`Timeout error for URL: ${url}`);
                continue;
            }
        }
    }
    console.log('All screenshots saved');
  
    await browser.close();
}

// Create a function bellow that read URLs from file located at datas/landingpages.json
function readUrlsFromFile(filename) {
const filePath = path.join(__dirname, 'datas', filename);
const data = fs.readFileSync(filePath, 'utf8');
const urls = JSON.parse(data);
return urls;
}

// const urls = readUrlsFromFile('landingpages.json');
const urls = readUrlsFromFile('kits.json');

captureScreenshots(urls,
    'kits',
    viewport={ width: 700, height: 600 },
    fullPage = false
);