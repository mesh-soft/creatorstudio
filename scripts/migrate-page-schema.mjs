import fs from 'fs';
import glob from 'glob';

const files = glob.sync('content/**/pages/*.json');

for (const f of files) {
  const data = JSON.parse(fs.readFileSync(f, 'utf8'));
  
  const settings = {
    slug: data.slug || "home",
    title: data.title || "Home",
    path: data.path || "/",
    isHome: data.isHome,
  };
  if (data.presentation) settings.presentation = data.presentation;
  if (data.seo) settings.seo = data.seo;
  
  const blocks = [];
  const oldContent = data.content || {};
  const oldBlocks = oldContent.blocks || [];
  
  for (const b of oldBlocks) {
    const newBlock = { ...b };
    if (b._template === 'hero') {
      newBlock.headline = oldContent.headline || '';
      newBlock.subheadline = oldContent.subheadline || '';
    } else if (b._template === 'services') {
      newBlock.kicker = b.kicker || oldContent.copy?.servicesKicker || '';
      newBlock.title = b.title || oldContent.copy?.servicesTitle || '';
      newBlock.items = oldContent.services || [];
    } else if (b._template === 'timings') {
      newBlock.kicker = b.kicker || oldContent.copy?.timingsKicker || '';
      newBlock.title = b.title || oldContent.copy?.timingsTitle || '';
      newBlock.items = oldContent.timings || [];
    } else if (b._template === 'gallery') {
      newBlock.kicker = b.kicker || oldContent.copy?.galleryKicker || '';
      newBlock.title = b.title || oldContent.copy?.galleryTitle || '';
      newBlock.items = oldContent.gallery || [];
    } else if (b._template === 'faq') {
      newBlock.kicker = b.kicker || oldContent.copy?.faqKicker || '';
      newBlock.title = b.title || oldContent.copy?.faqTitle || '';
      newBlock.items = oldContent.faqs || [];
    } else if (b._template === 'testimonials') {
      newBlock.kicker = b.kicker || '';
      newBlock.title = b.title || '';
      newBlock.items = oldContent.testimonials || [];
    } else if (b._template === 'stats') {
      newBlock.items = oldContent.stats || [];
    } else if (b._template === 'cta') {
      newBlock.title = b.title || oldContent.copy?.ctaTitle || '';
      newBlock.body = b.body || oldContent.copy?.ctaBody || '';
    }
    blocks.push(newBlock);
  }
  
  const newData = {
    settings,
    blocks
  };
  
  fs.writeFileSync(f, JSON.stringify(newData, null, 2));
  console.log('Migrated', f);
}
