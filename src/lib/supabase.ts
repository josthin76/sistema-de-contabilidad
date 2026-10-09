import { createClient } from '@supabase/supabase-js';

const fallbackUrl = 'https://jrpkahwnrwdjavncbvji.supabase.co';
const fallbackKey = 'sb_publishable_Ib6m3yZ2HLHASthOM8ITRw_54y0cUwj';

let rawUrl = ((import.meta.env.VITE_SUPABASE_URL as string) || '').trim().replace(/^["']|["']$/g, '');
let rawKey = ((import.meta.env.VITE_SUPABASE_ANON_KEY as string) || '').trim().replace(/^["']|["']$/g, '');

if (rawUrl && !rawUrl.startsWith('http://') && !rawUrl.startsWith('https://')) {
  rawUrl = 'https://' + rawUrl;
}

let validUrl = fallbackUrl;
if (rawUrl) {
  try {
    const parsed = new URL(rawUrl);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      validUrl = rawUrl;
    }
  } catch {
    validUrl = fallbackUrl;
  }
}

const validKey = rawKey || fallbackKey;

export const supabase = createClient(validUrl, validKey);
