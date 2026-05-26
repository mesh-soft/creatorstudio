# Local Tina Workflow

## Run Locally

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

Tina admin:

```text
http://localhost:3000/admin/index.html
```

## Edit Tenant Content

Tina collections:

- `Doctors` edits `content/doctors/*.json`
- `Hospitals` edits `content/hospitals/*.json`

Editable areas:

- subscription validity and plan
- domains
- profile
- business/contact details
- theme layout id
- variant preset id
- style tokens/colors/radius/typography
- SEO metadata
- headline, labels, services, timings, gallery, FAQs, testimonials, stats

## Preview Public Sites

```text
http://localhost:3000/site/dr-amit-sharma
http://localhost:3000/site/city-care-hospital
```

## Publish

After Tina saves JSON locally:

```bash
git status
git add content/
git commit -m "Update tenant content"
git push
```

Cloudflare Pages can then build from GitHub.

## Architecture Rule

Do not create custom code per tenant.

Tenant differences should be expressed through:

- JSON content
- theme layout id
- variant preset id
- style tokens
- registered platform components
