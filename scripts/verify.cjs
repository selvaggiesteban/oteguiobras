const obras = JSON.parse(require('fs').readFileSync('scripts/obras-enriched.json', 'utf-8'));

console.log('=== SIN CLIENTE ===');
obras.filter(o => !o.cliente).forEach(o => console.log(' -', o.nombre));

console.log('\nTODAS:');
obras.forEach((o, i) => console.log((i + 1) + '.', o.nombre, '|', o.categoria, '|', o.cliente || '–', '|', o.año || '–'));
