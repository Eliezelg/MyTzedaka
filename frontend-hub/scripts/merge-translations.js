const fs = require('fs');
const path = require('path');

const locales = ['fr', 'he'];

locales.forEach(locale => {
  const messagesDir = path.join(__dirname, '..', 'messages', locale);
  console.log(`Processing ${locale} in directory: ${messagesDir}`);
  
  const files = fs.readdirSync(messagesDir).filter(f => f.endsWith('.json') && f !== 'index.json');
  console.log(`Found files for ${locale}:`, files);
  
  const merged = {};
  
  files.forEach(file => {
    try {
      const content = JSON.parse(fs.readFileSync(path.join(messagesDir, file), 'utf8'));
      const namespace = file.replace('.json', '');
      merged[namespace] = content;
      console.log(`Merged ${namespace} for ${locale}`);
    } catch (error) {
      console.error(`Error processing ${file} for ${locale}:`, error.message);
    }
  });
  
  try {
    fs.writeFileSync(
      path.join(messagesDir, 'index.json'),
      JSON.stringify(merged, null, 2)
    );
    console.log(`✅ Generated index.json for ${locale} with ${Object.keys(merged).length} namespaces`);
  } catch (error) {
    console.error(`Error writing index.json for ${locale}:`, error.message);
  }
});