import { completedVenueAnchor, sessionAt } from "@/lib/session";
import { NextRequest } from "next/server";
const ASSETS: Record<string,string> = { RNVDAUSDT:"rNVDA",RTSLAUSDT:"rTSLA",RQQQUSDT:"rQQQ" };
type Candle=[string,string,string,string,string,string,string];
async function marketFetch(url:string,options:RequestInit){
  const endpoint=new URL(url).pathname.split('/').pop();
  const response=await fetch(url,options);
  if(!response.ok){
    const body=(await response.text()).slice(0,400);
    console.error('bitget_market_http_error',JSON.stringify({endpoint,status:response.status,body}));
    throw new Error(`Bitget ${endpoint} returned HTTP ${response.status}.`);
  }
  return response;
}
export async function GET(request:NextRequest){const symbol=request.nextUrl.searchParams.get("symbol")?.toUpperCase()??"RNVDAUSDT";if(!ASSETS[symbol])return Response.json({error:"Unsupported rToken symbol."},{status:400});const base="https://api.bitget.com/api/v3/market",options={cache:"no-store" as const,signal:AbortSignal.timeout(15000)};try{const[t,b,c]=await Promise.all([marketFetch(`${base}/tickers?category=SPOT&symbol=${symbol}`,options),marketFetch(`${base}/orderbook?category=SPOT&symbol=${symbol}&limit=50`,options),marketFetch(`${base}/candles?category=SPOT&symbol=${symbol}&interval=1H&limit=168`,options)]);if(![t,b,c].every(r=>r.ok))throw new Error("Bitget market endpoint returned an error.");const[tj,bj,cj]=await Promise.all([t.json(),b.json(),c.json()]);if(tj.code!=="00000"||bj.code!=="00000"||cj.code!=="00000")throw new Error(tj.msg||bj.msg||cj.msg||"Bitget market data unavailable.");const ticker=tj.data?.[0],book=bj.data;if(!ticker||!book)throw new Error("Bitget returned an empty market snapshot.");const anchor=completedVenueAnchor(cj.data as Candle[], Date.now()),timestamp=Number(ticker.ts||book.ts||Date.now());const levels=(rows:Array<[string|number,string|number]>)=>rows.map(([p,q])=>[Number(p),Number(q)]);return Response.json({symbol,asset:ASSETS[symbol],bid:Number(ticker.bid1Price),ask:Number(ticker.ask1Price),last:Number(ticker.lastPrice),bidSize:Number(ticker.bid1Size),askSize:Number(ticker.ask1Size),change24h:Number(ticker.price24hPcnt)*100,turnover24h:Number(ticker.turnover24h),platformTurnover24h:Number(ticker.platformTurnover24h||ticker.turnover24h),timestamp,anchor:anchor.price,anchorTimestamp:anchor.timestamp,bids:levels(book.b),asks:levels(book.a),session:sessionAt(Date.now()).session,sessionBasis:sessionAt(Date.now()).basis,source:"live"});}catch(error){return Response.json({error:error instanceof Error?error.message:"Unable to reach Bitget market data."},{status:502})}}
