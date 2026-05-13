const fs = require('fs');
let code = fs.readFileSync('src/platform/SiteRenderer.tsx', 'utf8');

// 1. Change tenant.content.blocks to tenant.blocks
code = code.replace(/tenant\.content\.blocks/g, 'tenant.blocks');

// 2. Change tinaDocument?.content to tinaDocument
code = code.replace(/tinaDocument\?\.content/g, 'tinaDocument');

// 3. We need to pass block, blockIndex to each component in renderBlocks
// Let's just do it manually with multi_replace_file_content or a script...
