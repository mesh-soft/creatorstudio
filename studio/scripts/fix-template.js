const fs = require('fs');
const path = require('path');

function findFiles(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const res = path.resolve(dir, file);
    if (fs.statSync(res).isDirectory()) {
      findFiles(res, files);
    } else if (res.endsWith('.json') && res.includes('/pages/')) {
      files.push(res);
    }
  }
  return files;
}

const files = [...findFiles('content/doctors'), ...findFiles('content/hospitals')];

for (const f of files) {
  const data = JSON.parse(fs.readFileSync(f, 'utf8'));
  
  if (data._template === 'page') continue; // Already fixed
  
  data._template = 'page';
  
  fs.writeFileSync(f, JSON.stringify(data, null, 2));
  console.log('Fixed', f);
}
