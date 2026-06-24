import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const trophies = [
  { id: 'brazil_a', url: 'https://upload.wikimedia.org/wikipedia/pt/4/42/Trof%C3%A9u_do_Campeonato_Brasileiro.png' },
  { id: 'brazil_b', url: 'https://upload.wikimedia.org/wikipedia/pt/4/42/Trof%C3%A9u_do_Campeonato_Brasileiro.png' }, // same trophy style
  { id: 'copa_nacional', url: 'https://upload.wikimedia.org/wikipedia/pt/7/73/Trof%C3%A9u_Copa_do_Brasil.png' },
  { id: 'libertadores', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Copa_Libertadores_trophy.svg/336px-Copa_Libertadores_trophy.svg.png' },
  { id: 'champions_league', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/European_Champion_Clubs%27_Cup.svg/454px-European_Champion_Clubs%27_Cup.svg.png' },
  { id: 'england_a', url: 'https://upload.wikimedia.org/wikipedia/pt/e/ee/Trof%C3%A9u_da_Premier_League.png' },
  { id: 'estadual', url: 'https://upload.wikimedia.org/wikipedia/commons/1/1c/Golden_Trophy.png' },
  { id: 'generic', url: 'https://upload.wikimedia.org/wikipedia/commons/1/1c/Golden_Trophy.png' }
];

const trophiesDir = path.join(__dirname, '..', 'public', 'trophies');
if (!fs.existsSync(trophiesDir)) {
  fs.mkdirSync(trophiesDir, { recursive: true });
}

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close(resolve);
        });
      } else if (response.statusCode === 301 || response.statusCode === 302) {
          // follow redirect
          download(response.headers.location, dest).then(resolve).catch(reject);
      } else {
        reject(`Server responded with ${response.statusCode}: ${response.statusMessage}`);
      }
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err.message);
    });
  });
}

async function main() {
  console.log("Downloading trophies...");
  for (const t of trophies) {
    try {
      const dest = path.join(trophiesDir, `${t.id}.png`);
      await download(t.url, dest);
      console.log(`Downloaded ${t.id}.png`);
    } catch(err) {
      console.error(`Failed to download ${t.id}:`, err);
    }
  }
  console.log("Done!");
}

main();
