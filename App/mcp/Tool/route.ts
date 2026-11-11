import { NextResponse } from 'next/server';
export async function GET() { return NextResponse.json({ tools: [ 'analyze_profile','build_profile','build_gig','estimate_project_price','analyze_market_observations','organize_portfolio_entry','draft_client_reply' ] }); }
