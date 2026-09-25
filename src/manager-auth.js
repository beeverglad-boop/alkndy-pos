async function call(body){try{const r=await fetch('/api/pos-auth',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)});const d=await r.json().catch(()=>({}));return{...d,status:r.status}}catch(e){return{ok:false,error:'network'}}}
export async function verifyManager(password){return call({action:'verify-manager',password})}
export async function createPOSUser(managerPassword,username,userPassword,role,permissions){return call({action:'create-user',managerPassword,username,userPassword,role,permissions})}

export async function loginPOSUser(username,password){return call({action:'login',username,password})}
