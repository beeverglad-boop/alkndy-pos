export async function onRequestPost(context){
  const b=await context.request.json().catch(()=>({}));
  if(b.action!=='verify-manager') return Response.json({error:'Unsupported action'},{status:400});
  const expected=String(context.env.POS_MANAGER_AUTH||'');
  const ok=expected.length>0&&String(b.password||'')===expected;
  return Response.json({ok});
}

export async function onRequest(){
  return new Response('Method not allowed',{status:405});
}
