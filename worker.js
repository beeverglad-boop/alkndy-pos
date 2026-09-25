const SUPABASE_URL='https://ofcgzclslklpfwyxjusi.supabase.co';

async function sha256(value){
  const bytes=new TextEncoder().encode(value);
  const digest=await crypto.subtle.digest('SHA-256',bytes);
  return [...new Uint8Array(digest)].map(b=>b.toString(16).padStart(2,'0')).join('');
}

export default {
  async fetch(request, env) {
    const url=new URL(request.url);
    if(url.pathname==='/api/pos-auth'){
      if(request.method!=='POST')return new Response('Method not allowed',{status:405});
      const body=await request.json().catch(()=>({}));
      const expected=String(env.POS_MANAGER_AUTH||'');
      const managerOK=expected.length>0&&String(body.password||body.managerPassword||'')===expected;

      if(body.action==='verify-manager')return Response.json({ok:managerOK,error:managerOK?undefined:(expected.length?'manager':'server_config')});

      if(body.action==='login'){
        const username=String(body.username||'').trim().normalize('NFC');
        const password=String(body.password||'');
        if(!username||!password)return Response.json({ok:false,error:'invalid'},{status:400});
        const serviceKey=String(env.SUPABASE_SERVICE_ROLE_KEY||'');
        if(!serviceKey)return Response.json({ok:false,error:'server_config'},{status:500});
        const loginTokenHash=await sha256(username+'|'+password);
        const res=await fetch(SUPABASE_URL+'/rest/v1/pos_users?select=username,role,active,permissions&username=eq.'+encodeURIComponent(username)+'&login_token_hash=eq.'+loginTokenHash+'&active=eq.true&limit=1',{
          headers:{apikey:serviceKey,Authorization:'Bearer '+serviceKey}
        });
        if(!res.ok)return Response.json({ok:false,error:'database'},{status:500});
        const rows=await res.json();
        if(!rows.length)return Response.json({ok:false,error:'credentials'},{status:401});
        return Response.json({ok:true,user:rows[0]});
      }

      if(body.action==='create-user'){
        if(!managerOK)return Response.json({ok:false,error:'manager'},{status:403});
        const username=String(body.username||'').trim().normalize('NFC');
        const password=String(body.userPassword||'');
        const role=String(body.role||'cashier');
        const permissions=body.permissions&&typeof body.permissions==='object'?body.permissions:{};
        if(!username||password.length<4||!['admin','supervisor','cashier'].includes(role)){
          return Response.json({ok:false,error:'invalid'},{status:400});
        }
        const serviceKey=String(env.SUPABASE_SERVICE_ROLE_KEY||'');
        if(!serviceKey)return Response.json({ok:false,error:'server_config'},{status:500});
        const loginTokenHash=await sha256(username+'|'+password);
        const pinHash=await sha256(password);
        const res=await fetch(SUPABASE_URL+'/rest/v1/pos_users?on_conflict=username',{
          method:'POST',
          headers:{
            apikey:serviceKey,
            Authorization:'Bearer '+serviceKey,
            'Content-Type':'application/json',
            Prefer:'resolution=merge-duplicates,return=minimal'
          },
          body:JSON.stringify({username,pin_hash:pinHash,login_token_hash:loginTokenHash,role,active:true,permissions})
        });
        if(!res.ok)return Response.json({ok:false,error:'database'},{status:500});
        return Response.json({ok:true});
      }
      return Response.json({error:'Unsupported action'},{status:400});
    }
    return env.ASSETS.fetch(request);
  }
};
