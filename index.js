const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const CREATOR = {
  discordId: "1054588756826542080",
  discordInvite: "https://discord.gg/VR5sYtQdWH",
  instagram: "_arthur_osorio_",
  instagramUrl: "https://instagram.com/_arthur_osorio_",
  freefireId: "2042281428",
  robloxUser: "dragon_firefantastic",
  robloxUrl: "https://www.roblox.com/users/1589132582/profile"
};

app.use(cors());
app.use(express.json());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('/', (req, res) => res.render('index', { creator: CREATOR }));

app.get('/api/bypass', async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) return res.json({ error: 'No URL' });
    
    const apis = [
      `https://api.bypass.city/api/v1/bypass?url=${encodeURIComponent(url)}`,
      `https://dlr.kys.gay/api/free/bypass?url=${encodeURIComponent(url)}`
    ];
    
    for (const api of apis) {
      try {
        const response = await axios.get(api, { timeout: 15000 });
        if (response.data?.destination || response.data?.result) {
          return res.json({ success: true, result: response.data.destination || response.data.result });
        }
      } catch (e) {}
    }
    
    res.json({ error: 'Failed to bypass' });
  } catch (error) {
    res.json({ error: error.message });
  }
});

app.listen(PORT, () => console.log(`Running on port ${PORT}`));
