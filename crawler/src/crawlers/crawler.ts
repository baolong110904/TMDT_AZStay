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
    await page.goto(url, { waitUntil: 'networkidle', timeout: 120000 });

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
        const title = card.querySelector('[data-testid="listing-card-title"]')?.textContent?.trim() ?? '';

        let rawPrice = '';
        let currency = '';
        let price = 0;
        const allSpans = Array.from(card.querySelectorAll('span'));
        for (const span of allSpans) {
          const text = span.textContent?.trim() ?? '';
          if (text.startsWith('₫') && !text.includes('for') && !text.toLowerCase().includes('show')) {
            rawPrice = text;
            const match = text.match(/^([^\d]+)([\d,]+)/);
            if (match) {
              currency = match[1];
              price = parseFloat(match[2].replace(/,/g, ''));
            }
            break;
          }
        }

        const ratingElements = Array.from(card.querySelectorAll('span[aria-hidden="true"]'));
        let rating = 0;
        let reviewCount = 0;
        for (const el of ratingElements) {
          const text = el.textContent?.trim() ?? '';
          const match = text.match(/^([\d.]+)\s*\((\d+)\)$/);
          if (match) {
            rating = parseFloat(match[1]);
            reviewCount = parseInt(match[2]);
            break;
          }
        }

        const linkElement = card.querySelector('a');
        const link = linkElement ? 'https://www.airbnb.com' + linkElement.getAttribute('href') : '';
        const imageEl = Array.from(card.querySelectorAll('img.i1ezuexe')).find(img => {
          const uri = img.getAttribute('data-original-uri') || '';
          const style = img.getAttribute('style') || '';
          return !uri.includes('/user/') && !style.includes('border-radius: 50%');
        });
        const imageUrl = (imageEl as HTMLImageElement)?.src ?? '';
        const description = card.querySelector('[data-testid="listing-card-name"]')?.textContent?.trim() ?? '';

        const now = new Date();
        const currentYear = now.getFullYear();

        const monthMap: Record<string, number> = {
          Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
          Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
        };

        let checkInDate: string | null = null;
        let checkOutDate: string | null = null;

        const allSubtitleSpans = Array.from(card.querySelectorAll('[data-testid="listing-card-subtitle"] span'));
        const dateRegex = /^[A-Za-z]{3} \d{1,2}\s*–\s*(?:[A-Za-z]{3} )?\d{1,2}$/;

        let dateText = '';
        for (const span of allSubtitleSpans) {
          const text = span.textContent?.trim() ?? '';
          if (dateRegex.test(text)) {
            dateText = text;
            break;
          }
        }

        if (dateText) {
          const rangeMatch = dateText.match(/^([A-Za-z]{3}) (\d{1,2})\s*–\s*(?:(\w{3}) )?(\d{1,2})$/);
          if (rangeMatch) {
            const startMonthStr = rangeMatch[1];
            const startDay = parseInt(rangeMatch[2]);
            const endMonthStr = rangeMatch[3] || startMonthStr;
            const endDay = parseInt(rangeMatch[4]);

            const startMonth = monthMap[startMonthStr];
            const endMonth = monthMap[endMonthStr];

            let startYear = currentYear;
            let endYear = currentYear;

            const startTemp = new Date(currentYear, startMonth, startDay);
            const endTemp = new Date(currentYear, endMonth, endDay);

            if (startTemp < now) startYear++;
            if (endTemp < now) endYear++;

            checkInDate = new Date(startYear, startMonth, startDay).toISOString();
            checkOutDate = new Date(endYear, endMonth, endDay).toISOString();
          }
        }

        data.push({
          title,
          price,
          currency,
          description,
          rating,
          reviewCount,
          link,
          imageUrl,
          checkInDate,
          checkOutDate,
        });
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