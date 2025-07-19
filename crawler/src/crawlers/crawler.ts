import { chromium, Page } from 'playwright';

export async function fetchAirbnbListings(location: string = 'New York') {
  let browser;
  
  try {
    browser = await chromium.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu'
      ]
    });

    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });

    const page = await context.newPage();
    
    const url = `https://www.airbnb.com/s/${location.replace(/ /g, '-')}/homes`;
    await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });

    // Scroll để load thêm kết quả
    await autoScrollPlaywright(page);

    // Đợi các listing render
    await page.waitForSelector('[data-testid="card-container"]', { timeout: 20000 });

    const listings = await page.evaluate(() => {
      // Same evaluation code as before
      const cards = document.querySelectorAll('[data-testid="card-container"]');
      const data: {
        title: string;
        price: number;
        currency: string;
        description: string;
        rating: number;
        reviewCount: number;
        link: string;
        imageUrl: string;
        checkInDate: string | null;
        checkOutDate: string | null;
      }[] = [];

      cards.forEach(card => {
        // ... (same logic as puppeteer version)
      });

      return data;
    });

    return listings;
  } catch (error) {
    console.error('Error fetching Airbnb listings:', error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

async function autoScrollPlaywright(page: Page) {
  await page.evaluate(async () => {
    await new Promise<void>((resolve) => {
      let totalHeight = 0;
      const distance = 100;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight - window.innerHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 300);
    });
  });
}