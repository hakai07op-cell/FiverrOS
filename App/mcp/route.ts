import { NextRequest, NextResponse } from 'next/server';
import { POST as apiPost } from '../api/[...path]/route';

const tools = [
 { name:'analyze_profile', description:'Analyze profile text supplied by the user. Stateless; no Fiverr account access.', inputSchema:{ type:'object', properties:{ headline:{type:'string'}, bio:{type:'string'}, skills:{type:'string'} } } },
 { name:'build_profile', description:'Draft a profile description from genuine user-provided skills. Does not publish.', inputSchema:{ type:'object', properties:{ headline:{type:'string'}, bio:{type:'string'}, skills:{type:'string'} } } },
 { name:'build_gig', description:'Draft a Fiverr gig from a service brief. Does not publish.', inputSchema:{ type:'object', properties:{ service:{type:'string'}, audience:{type:'string'}, scope:{type:'string'}, style:{type:'string'} }, required:['service'] } },
 { name:'estimate_project_price', description:'Estimate a planning range from user-supplied costs and effort.', inputSchema:{ type:'object', properties:{ project:{type:'string'}, hours:{type:'number'}, hourly_floor:{type:'number'}, complexity:{type:'number'}, revision_buffer:{type:'number'}, competitor_min:{type:'number'}, competitor_max:{type:'number'}, currency:{type:'string'} }, required:['project','hours','hourly_floor'] } },
 { name:'analyze_market_observations', description:'Analyze user-provided competitor observations. Does not scrape or invent market data.', inputSchema:{ type:'object', properties:{ service:{type:'string'}, keywords:{type:'string'}, competitors:{type:'string'}, notes:{type:'string'} }, required:['service'] } },
 { name:'organize_portfolio_entry', description:'Organize a portfolio case study using only facts supplied by the user.', inputSchema:{ type:'object', properties:{ project:{type:'string'}, role:{type:'string'}, details:{type:'string'}, url:{type:'string'} }, required:['project','role','details'] } },
 { name:'draft_client_reply', description:'Draft a client response. Does not send messages.', inputSchema:{ type:'object', properties:{ message:{type:'string'}, tone:{type:'string'}, availability:{type:'string'} }, required:['message'] } },
];
const reply = (id: unknown, result: unknown, status=200) => NextResponse.json({ jsonrpc:'2.0', id:id ?? null, result }, { status, headers:{'Cache-Control':'no-store','MCP-Protocol-Version':'2025-03-26'} });
const error = (id: unknown, code: number, message: string) => NextResponse.json({ jsonrpc:'2.0', id:id ?? null, error:{code,message} }, { status:200, headers:{'Cache-Control':'no-store','MCP-Protocol-Version':'2025-03-26'} });

export async function GET() { return new NextResponse(null, { status:405, headers:{ Allow:'POST' } }); }
export async function POST(req: NextRequest) {
 let body: any;
 try { body = await req.json(); } catch { return error(null,-32700,'Parse error'); }
 const id = body?.id;
 if (body?.jsonrpc !== '2.0' || typeof body?.method !== 'string') return error(id,-32600,'Invalid Request');
 if (body.method === 'initialize') return reply(id,{ protocolVersion:'2025-03-26', capabilities:{ tools:{listChanged:false} }, serverInfo:{name:'FiverrOS',version:'1.0.0'} });
 if (body.method === 'notifications/initialized' || body.method === 'ping') return id === undefined ? new NextResponse(null,{status:202}) : reply(id,{});
 if (body.method === 'tools/list') return reply(id,{tools});
 if (body.method === 'tools/call') {
   const name = body.params?.name, args = body.params?.arguments ?? {};
   const route: Record<string,string> = { analyze_profile:'profile/analyze', build_profile:'profile/build', build_gig:'gigs/build', estimate_project_price:'pricing/estimate', analyze_market_observations:'market/analyze', organize_portfolio_entry:'portfolio/organize', draft_client_reply:'clients/draft' };
   if (!route[name]) return error(id,-32602,'Unknown tool');
   const apiReq = new Request(`https://fiverros.invalid/api/${route[name]}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(args)});
   const result = await apiPost(apiReq as unknown as NextRequest,{params:{path:route[name].split('/')}});
   const data: any = await result.json();
   if (!result.ok) return reply(id,{isError:true,content:[{type:'text',text:data.error || 'Tool failed'}]});
   return reply(id,{content:[{type:'text',text:data.text || JSON.stringify(data)}],structuredContent:data});
 }
 return error(id,-32601,'Method not found');
}
