async function call(body){try{const r=await fetch('/api/pos-auth',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)});return await r.json()}catch{return{ok:false}}}
export async function verifyManager(password){const d=await call({action:'verify-manager',password});return d.ok===true}
export async function createPOSUser(managerPassword,username,userPassword,role,permissions){const d=await call({action:'create-user',managerPassword,username,userPassword,role,permissions});return d.ok===true}
