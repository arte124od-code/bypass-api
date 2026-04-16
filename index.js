const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const DISCORD_INVITE = "https://discord.gg/VR5sYtQdWH";
const DISCORD_USER_ID = "1054588756826542080";

app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const SUPPORTED_SHORTENERS = [
  { name: "Linkvertise", domains: ["linkvertise.com", "linkvertise.net", "linkvertise.me"], icon: "🔗" },
  { name: "LootLabs", domains: ["loot-link.com", "lootlink.com", "lootdest.com"], icon: "💎" },
  { name: "Work.ink", domains: ["work.ink"], icon: "⚡" },
  { name: "AdFly", domains: ["adf.ly", "adfoc.us"], icon: "🚀" },
  { name: "ouo.io", domains: ["ouo.io", "ouo.press"], icon: "🌐" },
  { name: "Shorte.st", domains: ["shorte.st", "sh.st"], icon: "📎" },
  { name: "BCVC", domains: ["bcvc.live", "bc.vc"], icon: "📊" },
  { name: "AdMaven", domains: ["free-content.pro", "best-links.org"], icon: "🛡️" }
];

function detectShortener(url) {
  const urlLower = url.toLowerCase();
  for (const s of SUPPORTED_SHORTENERS) {
    for (const d of s.domains) {
      if (urlLower.includes(d)) return { type: s.name, icon: s.icon };
    }
  }
  return { type: "generic", icon: "🔗" };
}

function convertLinkvertise(url) {
  return url.replace(/linkvertise\.(com|net|me)/gi, 'linkvertise.lol');
}

async function bypassByType(url, type) {
  try {
    const res = await axios.get(`https://api.bypass.city/api/v1/bypass?url=${encodeURIComponent(url)}`, { timeout: 15000 });
    if (res.data?.destination) return { success: true, method: 'bypass.city', url: res.data.destination };
  } catch (e) {}
  
  try {
    const res = await axios.get(`https://dlr.kys.gay/api/free/bypass?url=${encodeURIComponent(url)}`, { timeout: 15000 });
    if (res.data?.result) return { success: true, method: 'dlr.kys.gay', url: res.data.result };
  } catch (e) {}
  
  if (type === 'Linkvertise') {
    try {
      const converted = convertLinkvertise(url);
      const res = await axios.head(converted, { maxRedirects: 0, validateStatus: (s) => s >= 300 && s < 400, timeout: 10000 });
      if (res.headers.location) return { success: true, method: 'linkvertise.lol-redirect', url: res.headers.location, converted };
    } catch (e) {}
  }
  
  return { success: false, error: 'Todos os métodos falharam' };
}

app.get('/', (req, res) => {
  res.render('index', { supported: SUPPORTED_SHORTENERS, discord: DISCORD_INVITE, userId: DISCORD_USER_ID });
});

app.get('/api/bypass', async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) return res.json({ success: false, error: 'URL não fornecida' });
    
    const { type, icon } = detectShortener(url);
    const result = await bypassByType(url, type);
    
    if (result.success) {
      res.json({ success: true, original: url, type, icon, method: result.method, converted: result.converted, result: result.url });
    } else {
      res.json({ success: false, original: url, type, error: result.error });
    }
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
