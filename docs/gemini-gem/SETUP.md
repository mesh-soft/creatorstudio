# Gemini Gem — Setup Guide

## Generate the webhook secret

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Configure environment

### Vercel (production)

Add in **Settings → Environment Variables**:

| Variable | Value |
|----------|-------|
| `GEMINI_WEBHOOK_SECRET` | The hex string from the command above |

### Local dev

Add to `.env.local`:

```
GEMINI_WEBHOOK_SECRET=<the-hex-string>
```

## Create the Gem in Google AI Studio

1. Go to [Google AI Studio](https://aistudio.google.com)
2. Click **Create a Gem**
3. Set **Name**: "Doctor Sites Creator"
4. Paste the contents of `gem-instructions.md` into the **System Instructions** field
5. In **Tools**, click **Add Function Declarations**
6. Paste the contents of `tools.json`
7. Set the **Base URL** for each tool's HTTP config:
   - Local: `http://localhost:3000`
   - Production: `https://your-app.vercel.app`

## Configure the signing secret in the Gem

The Gem must compute HMAC headers for every API call. In the system instructions, replace the placeholder:

```
Replace this —- "Gem-SECRET" —- with the actual GEMINI_WEBHOOK_SECRET hex value
```

The Gem uses this secret to sign requests — it never sends the secret itself, only HMAC signatures.

## Register all 6 tools

Ensure all 6 tools from `tools.json` are registered:
- `list_tenants`
- `read_content`
- `save_content`
- `import_tenant`
- `import_page`
- `search_photos`

## Verify the setup

Generate test HMAC headers and test from curl:

```bash
export GEMINI_WEBHOOK_SECRET=<your-secret>
node -e "
  const c = require('crypto'), secret = process.env.GEMINI_WEBHOOK_SECRET;
  const body = '', ts = Math.floor(Date.now()/1000);
  const bh = c.createHash('sha256').update(body).digest('hex');
  const sig = 'sha256=' + c.createHmac('sha256', secret).update(ts+'.'+bh).digest('hex');
  console.log('TS='+ts+'\\nSIG='+sig);
"

# Test tenants list
curl http://localhost:3000/api/tenants -H "X-Gem-Timestamp: $TS" -H "X-Gem-Signature: $SIG"
# Should return JSON array of tenants
```
