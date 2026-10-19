import { createWorker } from 'tesseract.js';

/**
 * Preprocesses an image to improve OCR accuracy for receipts.
 * Increases contrast, converts to grayscale, and thresholds light paper.
 */
export const preprocessImageForOCR = (imageSource) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Scale to a good OCR resolution (width ~ 1200px max)
        const maxDim = 1400;
        let width = img.width;
        let height = img.height;
        if (width > maxDim || height > maxDim) {
          const ratio = Math.min(maxDim / width, maxDim / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(img, 0, 0, width, height);
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;

        // Grayscale + High-Contrast enhancement
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          // Grayscale luminance
          const gray = 0.299 * r + 0.587 * g + 0.114 * b;
          
          // Contrast boost (factor 1.4)
          const factor = 1.4;
          const adjusted = factor * (gray - 128) + 128;
          const clamped = Math.max(0, Math.min(255, adjusted));

          data[i] = clamped;
          data[i + 1] = clamped;
          data[i + 2] = clamped;
        }

        ctx.putImageData(imageData, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      } catch (err) {
        // Fallback to original image if canvas manipulation fails
        resolve(typeof imageSource === 'string' ? imageSource : img.src);
      }
    };
    img.onerror = (err) => reject(err);
    img.src = typeof imageSource === 'string' ? imageSource : URL.createObjectURL(imageSource);
  });
};

/**
 * Heuristics to parse OCR raw text into structured receipt data:
 * - Total Amount
 * - Store/Vendor Title
 * - Category
 * - Date
 * - Line Items
 */
export const parseReceiptText = (rawText) => {
  if (!rawText || typeof rawText !== 'string') {
    return {
      title: 'Scanned Receipt',
      amount: 0,
      category: 'Grocery',
      date: new Date().toISOString().split('T')[0],
      items: [],
      rawText: ''
    };
  }

  const lines = rawText
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0);

  const cleanText = rawText.toLowerCase();

  // 1. EXTRACT TOTAL AMOUNT
  let detectedAmount = 0;
  const amountCandidates = [];

  // Regex patterns for total lines
  const totalKeywordsRegex = /(?:total|grand\s*total|net\s*amount|net\s*payable|balance\s*due|final\s*amount|sub\s*total|amount\s*paid|bill\s*amount|amt|tot|rs\.?|₹|inr)\s*[:=\-]?\s*([₹rRsS\s]*\d{1,6}(?:[.,]\d{1,2})?)/i;

  for (const line of lines) {
    const match = line.match(totalKeywordsRegex);
    if (match) {
      const numStr = match[1].replace(/[₹rRsS\s,]/g, '').trim();
      const val = parseFloat(numStr);
      if (!isNaN(val) && val > 0 && val < 500000) {
        // Weight lines with "grand total" or "total" highest
        const isGrand = /grand\s*total|net\s*payable|amount\s*paid/i.test(line);
        amountCandidates.push({ val, weight: isGrand ? 100 : 50, line });
      }
    }
  }

  // Also check individual numbers on lines that contain currency symbols
  const currencyRegex = /(?:₹|rs\.?|inr)\s*(\d{1,6}(?:[.,]\d{1,2})?)/gi;
  let currMatch;
  while ((currMatch = currencyRegex.exec(rawText)) !== null) {
    const val = parseFloat(currMatch[1].replace(/,/g, ''));
    if (!isNaN(val) && val > 0 && val < 500000) {
      amountCandidates.push({ val, weight: 20, line: currMatch[0] });
    }
  }

  // Find standalone prices at the end of lines
  for (const line of lines) {
    const endNumberMatch = line.match(/\b(\d{2,6}\.\d{2})\b/);
    if (endNumberMatch) {
      const val = parseFloat(endNumberMatch[1]);
      if (!isNaN(val) && val > 0 && val < 500000) {
        amountCandidates.push({ val, weight: 10, line });
      }
    }
  }

  if (amountCandidates.length > 0) {
    // Sort primarily by weight, then by value (grand totals usually appear near bottom)
    amountCandidates.sort((a, b) => {
      if (b.weight !== a.weight) return b.weight - a.weight;
      return b.val - a.val;
    });
    detectedAmount = amountCandidates[0].val;
  }

  // 2. EXTRACT VENDOR / TITLE
  let title = 'Scanned Receipt';
  // Check the first 4 non-empty lines for store names
  for (let i = 0; i < Math.min(lines.length, 5); i++) {
    const candidate = lines[i];
    // Filter out common receipt header metadata like "tax invoice", "phone", "welcome", "gstin", "date"
    if (
      !/tax\s*invoice|receipt|cash\s*memo|gstin|phone|tel|welcome|bill\s*no|date|order\s*#/i.test(candidate) &&
      candidate.length >= 3 &&
      candidate.length <= 40 &&
      /[a-zA-Z]/.test(candidate)
    ) {
      // Clean up symbols
      title = candidate.replace(/[^\w\s&'-]/g, '').trim();
      break;
    }
  }

  // Match known popular Indian / retail brands if found anywhere in text
  if (/d-?mart|avenue\s*supermarts/i.test(rawText)) title = 'D-Mart Supermarket';
  else if (/reliance\s*fresh|reliance\s*smart|reliance\s*retail/i.test(rawText)) title = 'Reliance Smart Bazaar';
  else if (/blinkit|grofers/i.test(rawText)) title = 'Blinkit Delivery';
  else if (/swiggy|instamart/i.test(rawText)) title = 'Swiggy Instamart';
  else if (/zomato/i.test(rawText)) title = 'Zomato Food Order';
  else if (/bigbasket|bb\s*daily/i.test(rawText)) title = 'BigBasket Grocery';
  else if (/apollo\s*pharmacy/i.test(rawText)) title = 'Apollo Pharmacy';
  else if (/starbucks/i.test(rawText)) title = 'Starbucks Coffee';
  else if (/mcdonald|mc\s*donald/i.test(rawText)) title = "McDonald's";
  else if (/domino/i.test(rawText)) title = "Domino's Pizza";
  else if (/electricity|power|bescom|bses|torrent|uppcl|tneb/i.test(rawText)) title = 'Electricity Bill';
  else if (/airtel|jio|act\s*fibernet|broadband/i.test(rawText)) title = 'Internet Bill';

  // 3. CATEGORY DETECTION
  let category = 'Shared';
  if (/grocer|supermarket|kirana|d-?mart|vegetable|milk|dairy|fruit|bazaar|provisions|atta|rice|oil/i.test(cleanText)) {
    category = 'Grocery';
  } else if (/food|restaurant|cafe|dinner|lunch|pizza|burger|biryani|kitchen|swiggy|zomato|bake|sweet/i.test(cleanText)) {
    category = 'Food';
  } else if (/electr|power|energy|bescom|bses|tneb|voltage|kwh|meter/i.test(cleanText)) {
    category = 'Electricity';
  } else if (/internet|wifi|broadband|airtel|jio|act\s*fiber|router/i.test(cleanText)) {
    category = 'Internet';
  } else if (/pharmacy|medical|chemist|medicine|tablet|hospital|clinic|doctor|apollo/i.test(cleanText)) {
    category = 'Medicine';
  } else if (/rent|flat|society|maintenance|landlord/i.test(cleanText)) {
    category = 'Rent';
  } else if (/petrol|fuel|diesel|cab|uber|ola|auto|travel/i.test(cleanText)) {
    category = 'Travel';
  } else if (/cloth|shopping|apparel|zara|h&m|pantaloons|trends/i.test(cleanText)) {
    category = 'Shopping';
  }

  // 4. DATE DETECTION
  let detectedDate = new Date().toISOString().split('T')[0];
  const dateRegex = /\b(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})\b/;
  const dateMatch = rawText.match(dateRegex);
  if (dateMatch) {
    let day = parseInt(dateMatch[1], 10);
    let month = parseInt(dateMatch[2], 10);
    let year = parseInt(dateMatch[3], 10);

    // Normalize year
    if (year < 100) year += 2000;

    // Swap if month/day seem inverted
    if (day > 12 && month <= 12) {
      // standard DD/MM/YYYY
    } else if (month > 12 && day <= 12) {
      // MM/DD/YYYY
      const tmp = day;
      day = month;
      month = tmp;
    }

    if (month >= 1 && month <= 12 && day >= 1 && day <= 31 && year >= 2020 && year <= 2035) {
      detectedDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }
  }

  // 5. EXTRACT POSSIBLE LINE ITEMS
  const items = [];
  for (const line of lines) {
    const itemMatch = line.match(/^([a-zA-Z\s]{3,30})\s+.*?(\d{1,5}(?:\.\d{1,2})?)$/);
    if (itemMatch && !/total|tax|discount|change|subtotal/i.test(itemMatch[1])) {
      items.push({
        name: itemMatch[1].trim(),
        price: parseFloat(itemMatch[2])
      });
    }
  }

  return {
    title,
    amount: Math.round(detectedAmount * 100) / 100,
    category,
    date: detectedDate,
    items,
    rawText
  };
};

/**
 * Full Receipt OCR Engine
 * Uses Tesseract.js Worker with preprocessing and progress callbacks.
 */
export const scanReceiptImage = async (imageInput, onProgress = () => {}) => {
  let worker = null;
  try {
    onProgress({ status: 'preprocessing', progress: 0.1, message: 'Optimizing receipt image clarity...' });
    const processedImageData = await preprocessImageForOCR(imageInput);

    onProgress({ status: 'initializing', progress: 0.25, message: 'Initializing AI OCR Neural Engine...' });
    worker = await createWorker('eng');

    onProgress({ status: 'recognizing', progress: 0.5, message: 'Scanning optical receipt text...' });
    const { data: { text } } = await worker.recognize(processedImageData);

    onProgress({ status: 'parsing', progress: 0.85, message: 'Extracting totals, vendors, and line items...' });
    const parsedData = parseReceiptText(text);

    onProgress({ status: 'done', progress: 1.0, message: 'Scan complete!' });
    await worker.terminate();

    return {
      success: true,
      data: parsedData,
      previewUrl: processedImageData
    };
  } catch (err) {
    if (worker) {
      try { await worker.terminate(); } catch (_) {}
    }
    console.error('Receipt OCR scan failed:', err);
    throw err;
  }
};
