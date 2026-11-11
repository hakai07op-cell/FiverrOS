import { NextRequest, NextResponse } from 'next/server';

const clean = (v: unknown) => String(v ?? '').trim().replace(/\s+/g, ' ');
const json = (data: unknown, status = 200) => NextResponse.json(data, { status, headers: { 'Cache-Control': 'no-store' } });

function analyzeProfile(a: any) {
  const issues: string[] = [];
  if (clean(a.headline).length < 12) issues.push('Make the headline specific: service + specialization + target outcome.');
  if (clean(a.bio).length < 120) issues.push('Expand the bio with target clients, actual capabilities, process and deliverables.');
  if (String(a.skills ?? '').split(',').filter((x: string) => x.trim()).length < 5) issues.push('Add relevant, demonstrable skills; avoid keyword stuffing.');
  if (!clean(a.bio)) issues.push('Add a short introduction and a clear invitation to discuss project requirements.');
  const score = Math.max(0, 100 - issues.length * 18);
  return { text: `PROFILE REVIEW — heuristic completeness: ${score}/100 (not Fiverr's score)\n\n${issues.length ? issues.map((x, i) => `${i + 1}. ${x}`).join('\n') : 'Core profile fields are present. Improve specificity and add genuine portfolio proof.'}\n\nOnly publish claims that accurately represent your experience.`, metrics: { 'Heuristic score': `${score}/100` } };
}
function buildProfile(a: any) {
  const skills = String(a.skills ?? '').split(',').map(clean).filter(Boolean);
  return { text: `HEADLINE\n${clean(a.headline) || 'Web Designer & Frontend Developer'}\n\nPROFILE DESCRIPTION\nI help businesses create clear, modern and responsive web experiences.\n\nSERVICES AND SKILLS\n${(skills.length ? skills : ['Add your genuine services and skills']).map(x => '- ' + x).join('\n')}\n\nMY PROCESS\n1. Understand your goals and requirements.\n2. Confirm scope, deliverables, price and timeline.\n3. Build responsively and share progress.\n4. Complete the agreed work and hand over.\n\nBEFORE WE START\nPlease share your goals, pages, features, references and preferred timeline. I will review the details before confirming a quote.\n\nEdit this draft to reflect your real skills and experience.` };
}
function buildGig(a: any) {
  if (!clean(a.service)) throw new Error('Service is required.');
  return { text: `GIG TITLE\nI will ${clean(a.service).toLowerCase().slice(0, 75)}\n\nOVERVIEW\nI can help ${clean(a.audience) || 'your business'} with ${clean(a.service)}.\n\nSCOPE\n${clean(a.scope)}\n\nPROCESS\n1. Share goals, content and references.\n2. Confirm deliverables, price and schedule.\n3. Build and share progress.\n4. Complete agreed work.\n\nPOSITIONING\n${clean(a.style) || 'Professional'}\n\nFAQ\nQ: What do you need to start?\nA: A project brief, content, references and required assets.\n\nQ: Can you add extra features?\nA: Please ask first; additional work may require a revised quote.\n\nPACKAGES\nBasic: Small defined scope.\nStandard: Expanded scope or additional pages.\nPremium: Larger project with advanced functionality.\n\nSet package prices only after estimating scope and effort. Check current Fiverr listing rules and character limits.` };
}
function estimate(a: any) {
  const hours = Number(a.hours), rate = Number(a.hourly_floor), complexity = Number(a.complexity ?? 1), buffer = Number(a.revision_buffer ?? 15);
  if (!(hours > 0) || !(rate > 0) || !(complexity >= .5 && complexity <= 4) || !(buffer >= 0 && buffer <= 100)) throw new Error('Enter valid hours, hourly floor, complexity (0.5–4) and buffer (0–100).');
  const min = a.competitor_min === '' || a.competitor_min == null ? null : Number(a.competitor_min);
  const max = a.competitor_max === '' || a.competitor_max == null ? null : Number(a.competitor_max);
  if (min != null && max != null && max < min) throw new Error('Competitor maximum must be at least competitor minimum.');
  const floor = hours * rate * complexity * (1 + buffer / 100), low = Math.max(floor, min ?? floor), high = Math.max(low * 1.25, max ?? floor * 1.6), cur = clean(a.currency) || 'USD';
  const l = low.toFixed(2), h = high.toFixed(2), f = floor.toFixed(2);
  return { text: `PROJECT\n${clean(a.project)}\n\nRECOMMENDED PLANNING RANGE\n${cur} ${l} – ${cur} ${h}\n\nCOST FLOOR MODEL\nHours: ${hours}\nHourly floor: ${cur} ${rate}\nComplexity: ${complexity}x\nBuffer: ${buffer}%\nCalculated floor: ${cur} ${f}\n\nLower end: narrow, well-defined scope. Upper end: greater complexity, integrations, uncertainty or support.\n\nCompetitor inputs are context, not proof of market average. Confirm fees, taxes, scope, revisions, timeline and exclusions before quoting. This is not a guarantee of winning work.`, metrics: { 'Suggested minimum': `${cur} ${l}`, 'Suggested maximum': `${cur} ${h}`, 'Cost floor': `${cur} ${f}` } };
}
function analyzeMarket(a: any) {
  const rows = String(a.competitors ?? '').split('\n').map((x: string) => x.trim()).filter(Boolean), evidence = rows.length + (clean(a.notes) ? 1 : 0), coverage = evidence < 3 ? 'Low' : evidence < 7 ? 'Moderate' : 'Better evidence coverage';
  return { text: `MARKET BRIEF: ${clean(a.service)}\nEvidence coverage: ${coverage}\nCompetitor observations: ${rows.length}\nKeywords: ${clean(a.keywords)}\n\nOBSERVATIONS\n${rows.length ? rows.map((x: string) => '- ' + x).join('\n') : 'No competitor observations supplied.'}\n\nOPPORTUNITY HYPOTHESES TO VALIDATE\n1. Narrow the service to a specific buyer and outcome.\n2. Review negative feedback for repeated unmet needs.\n3. Compare equivalent scope, delivery, revisions and proof.\n4. Test long-tail keywords and adjacent service bundles.\n5. Record the same competitor sample weekly to detect change.\n\nMISSING EVIDENCE\n- Reliable demand/search trend data.\n- Count of active comparable offers.\n- Recent activity rather than lifetime review totals.\n- Your actual cost and delivery time.\n\nDo not infer monthly sales from review counts or call a niche viral based on a small sample.`, metrics: { Observations: rows.length, 'Evidence coverage': coverage } };
}
function organizePortfolio(a: any) { return { text: `PORTFOLIO ENTRY\nProject: ${clean(a.project)}\nRole: ${clean(a.role)}\nSummary: ${clean(a.details)}\nLink: ${clean(a.url) || 'Add public link if available.'}\n\nCASE STUDY\n1. Client goal (with permission).\n2. Challenge and constraints.\n3. Your personal contribution.\n4. Tools and technologies actually used.\n5. Final outcome and evidence.\n6. Screenshots/demo you own or have permission to share.\n\nDo not invent clients, metrics, testimonials or outcomes.` }; }
function draftClient(a: any) { return { text: `CLIENT REPLY DRAFT\n\nHi,\n\nThank you for reaching out. I'd be happy to understand your project and see how I can help.\n\nCould you share:\n1. The main goal of the website or project?\n2. Number of pages and key features?\n3. Any design references?\n4. Do you have content, branding and hosting?\n5. Your preferred timeline?\n\n${clean(a.availability)}\n\nOnce I review the details, I can confirm a suitable scope, quotation and realistic schedule.\n\nBest regards\n\nTone: ${clean(a.tone) || 'Professional and friendly'}. Review before sending; no price or deadline is promised.` }; }

export async function GET(_req: NextRequest, ctx: { params: { path: string[] } }) {
  const path = (ctx.params.path || []).join('/');
  if (path === 'health') return json({ status: 'ok', fiverr_seller_account: 'not_connected', data_mode: 'stateless_drafts_only', persistence: 'disabled' });
  if (path === 'performance') return json({ latest: null, records: [], note: 'Performance snapshots are not stored in this public demo.' });
  if (path === 'away-mode') return json({ enabled: false, mode: 'draft_only', note: 'Settings are not stored by the public demo.' });
  if (path === 'approvals') return json({ items: [], note: 'Approval items are not stored by the public demo.' });
  return json({ error: 'Not found' }, 404);
}
export async function POST(req: NextRequest, ctx: { params: { path: string[] } }) {
  const path = (ctx.params.path || []).join('/');
  try {
    const a = await req.json();
    switch (path) {
      case 'profile/analyze': return json(analyzeProfile(a));
      case 'profile/build': return json(buildProfile(a));
      case 'gigs/build': return json(buildGig(a));
      case 'pricing/estimate': return json(estimate(a));
      case 'market/analyze': return json(analyzeMarket(a));
      case 'portfolio/organize': return json(organizePortfolio(a));
      case 'clients/draft': return json(draftClient(a));
      case 'performance': return json({ saved: false, text: `Snapshot preview for ${clean(a.period) || 'selected period'}. CTR: ${Number(a.impressions) ? (Number(a.clicks) / Number(a.impressions) * 100).toFixed(2) + '%' : 'unavailable because impressions are zero'}. This public demo does not store snapshots.` });
      case 'away-mode': return json({ saved: false, ...a, note: 'This public demo does not store settings. Draft-only mode is the only supported behavior.' });
      case 'approvals': return json({ saved: false, status: 'not_persisted', note: 'Persistent approval queues require authenticated accounts and a database.' });
      default: return json({ error: 'Not found' }, 404);
    }
  } catch (e: any) { return json({ error: e?.message || 'Invalid request' }, 400); }
}
