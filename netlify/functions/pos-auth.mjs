export default async (req) => {
  if(req.method!=='POST') return new Response('Method not allowed',{status:405});
  const b=await req.json().catch(()=>({}));
  if(b.action==='verify-manager'){
    const ok=String(b.password||'')===String(Netlify.env.get('POS_MANAGER_AUTH')||'');
    return Response.json({ok});
  }
  return Response.json({error:'Unsupported action'},{status:400});
};
export const config={path:'/api/pos-auth'};