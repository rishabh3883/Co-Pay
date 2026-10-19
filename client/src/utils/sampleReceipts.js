/**
 * Utility to generate canvas-drawn realistic receipt images for instant testing.
 * Perfect for one-click testing or when a user doesn't have a paper receipt on hand.
 */

export const generateSampleReceipt = (type = 'grocery') => {
  const canvas = document.createElement('canvas');
  canvas.width = 480;
  canvas.height = 700;
  const ctx = canvas.getContext('2d');

  // Background - Off-white textured thermal receipt paper
  ctx.fillStyle = '#fdfdfb';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Subtle jagged top and bottom receipt tear
  ctx.fillStyle = '#e8e8e2';
  for (let x = 0; x < canvas.width; x += 16) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + 8, 8);
    ctx.lineTo(x + 16, 0);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(x, canvas.height);
    ctx.lineTo(x + 8, canvas.height - 8);
    ctx.lineTo(x + 16, canvas.height);
    ctx.fill();
  }

  // Thermal paper text styling
  ctx.fillStyle = '#1a1a1a';
  ctx.textAlign = 'center';

  let config = {
    title: 'D-MART SUPERMARKET',
    subtitle: 'AVENUE SUPERMARTS LTD.',
    gst: 'GSTIN: 27AABCA1234F1Z8',
    category: 'Grocery',
    date: new Date().toLocaleDateString('en-GB'),
    items: [
      { name: 'Aashirvaad Atta 5kg', price: '₹ 245.00' },
      { name: 'Fortune Sunflower Oil 2L', price: '₹ 290.00' },
      { name: 'Tata Salt 1kg & Sugar 2kg', price: '₹ 140.00' },
      { name: 'Amul Butter 500g + Milk', price: '₹ 280.00' },
      { name: 'Surf Excel Quickwash 2kg', price: '₹ 365.00' },
      { name: 'Vim Dishwash Gel 750ml', price: '₹ 180.00' }
    ],
    subtotal: '1500.00',
    tax: '0.00',
    total: '1500.00'
  };

  if (type === 'electricity') {
    config = {
      title: 'BESCOM ELECTRICITY BILL',
      subtitle: 'BANGALORE ELECTRICITY SUPPLY CO.',
      gst: 'Consumer ID: 8944120934',
      category: 'Electricity',
      date: new Date().toLocaleDateString('en-GB'),
      items: [
        { name: 'Base Energy Units (280 kWh)', price: '₹ 1680.00' },
        { name: 'Fixed Capacity Demand', price: '₹ 250.00' },
        { name: 'Electricity Duty (9%)', price: '₹ 170.00' }
      ],
      subtotal: '1930.00',
      tax: '170.00',
      total: '2100.00'
    };
  } else if (type === 'dinner') {
    config = {
      title: "DOMINO'S PIZZA OUTLET",
      subtitle: 'JUBILANT FOODWORKS LTD.',
      gst: 'GSTIN: 07AAACJ2218M1Z4',
      category: 'Food',
      date: new Date().toLocaleDateString('en-GB'),
      items: [
        { name: 'Farmhouse Cheese Burst Large', price: '₹ 620.00' },
        { name: 'Peppy Paneer Medium', price: '₹ 380.00' },
        { name: 'Garlic Breadsticks + Dip', price: '₹ 160.00' },
        { name: 'Pepsi Pet Bottle 750ml x 2', price: '₹ 100.00' }
      ],
      subtotal: '1260.00',
      tax: '0.00',
      total: '1260.00'
    };
  } else if (type === 'pharmacy') {
    config = {
      title: 'APOLLO PHARMACY 24/7',
      subtitle: 'APOLLO HOSPITALS ENTERPRISE',
      gst: 'GSTIN: 36AAACA4338A1Z2',
      category: 'Medicine',
      date: new Date().toLocaleDateString('en-GB'),
      items: [
        { name: 'Dolo 650 Strip (15 Tabs)', price: '₹ 35.00' },
        { name: 'Multi-Vitamin Capsules', price: '₹ 220.00' },
        { name: 'Volini Pain Relief Spray', price: '₹ 195.00' }
      ],
      subtotal: '450.00',
      tax: '0.00',
      total: '450.00'
    };
  }

  // Header Title
  ctx.font = 'bold 22px "Courier New", monospace';
  ctx.fillText(config.title, canvas.width / 2, 60);

  ctx.font = '13px "Courier New", monospace';
  ctx.fillText(config.subtitle, canvas.width / 2, 85);
  ctx.fillText(config.gst, canvas.width / 2, 105);

  // Divider
  ctx.fillText('--------------------------------------------', canvas.width / 2, 125);

  // Date and Receipt ID
  ctx.textAlign = 'left';
  ctx.font = '12px "Courier New", monospace';
  ctx.fillText(`DATE: ${config.date}`, 35, 150);
  ctx.fillText(`RECEIPT #: RCP-${Math.floor(100000 + Math.random() * 900000)}`, 35, 170);
  ctx.fillText(`MODE: Cash / UPI Confirmed`, 35, 190);

  ctx.textAlign = 'center';
  ctx.fillText('============================================', canvas.width / 2, 215);

  // Column Headers
  ctx.textAlign = 'left';
  ctx.font = 'bold 13px "Courier New", monospace';
  ctx.fillText('ITEM DESCRIPTION', 35, 235);
  ctx.textAlign = 'right';
  ctx.fillText('AMOUNT', canvas.width - 35, 235);

  ctx.textAlign = 'center';
  ctx.fillText('--------------------------------------------', canvas.width / 2, 250);

  // Line Items
  let y = 275;
  ctx.font = '13px "Courier New", monospace';
  for (const item of config.items) {
    ctx.textAlign = 'left';
    ctx.fillText(item.name, 35, y);
    ctx.textAlign = 'right';
    ctx.fillText(item.price, canvas.width - 35, y);
    y += 30;
  }

  // Divider before Total
  ctx.textAlign = 'center';
  ctx.fillText('============================================', canvas.width / 2, y + 10);
  y += 35;

  // Subtotal
  ctx.textAlign = 'left';
  ctx.fillText('SUBTOTAL', 35, y);
  ctx.textAlign = 'right';
  ctx.fillText(`₹ ${config.subtotal}`, canvas.width - 35, y);
  y += 28;

  // Total in bold big font
  ctx.font = 'bold 20px "Courier New", monospace';
  ctx.textAlign = 'left';
  ctx.fillText('GRAND TOTAL', 35, y);
  ctx.textAlign = 'right';
  ctx.fillText(`₹ ${config.total}`, canvas.width - 35, y);
  y += 25;

  ctx.textAlign = 'center';
  ctx.font = '12px "Courier New", monospace';
  ctx.fillText('--------------------------------------------', canvas.width / 2, y + 10);
  y += 35;

  // Footer Message
  ctx.font = 'italic 12px "Courier New", monospace';
  ctx.fillText('*** THANK YOU FOR VISITING ***', canvas.width / 2, y);
  ctx.fillText('SPLIT EQUALLY WITH ROOMMATES ON CO-PAY', canvas.width / 2, y + 20);

  // Barcode illustration at bottom
  y += 50;
  ctx.fillStyle = '#000000';
  for (let b = 45; b < canvas.width - 45; b += 5 + (b % 4)) {
    ctx.fillRect(b, y, (b % 3) + 1, 35);
  }

  return {
    dataUrl: canvas.toDataURL('image/png'),
    expectedAmount: parseFloat(config.total),
    expectedTitle: config.title,
    expectedCategory: config.category
  };
};
