import fs from 'fs';
import * as cheerio from 'cheerio';

const html = fs.readFileSync('santos.html', 'utf8');
const $ = cheerio.load(html);

// 1. Infobox Colors
const infobox = $('.infobox');
console.log("Infobox exists:", infobox.length > 0);
if (infobox.length > 0) {
    const style = infobox.find('tr').eq(0).attr('style') || infobox.find('th').eq(0).attr('style') || infobox.find('td').eq(0).attr('style');
    console.log("Infobox first tr/th/td style:", style);
}

// 2. Squad Table
const heading = $('#Elenco_atual, #Elenco');
console.log("Found heading:", heading.length > 0);
if (heading.length > 0) {
    const table = heading.parent().nextAll('table').first();
    console.log("Found table after heading:", table.length > 0);
    if (table.length > 0) {
        table.find('tr').each((j, row) => {
            const cols = $(row).find('td');
            if (cols.length > 0) {
                console.log(`Row ${j}: ` + cols.map((i, c) => $(c).text().trim()).get().join(' | '));
            }
        });
    }
}
