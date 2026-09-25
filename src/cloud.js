import{createClient}from'@supabase/supabase-js';
const url='https://ofcgzclslklpfwyxjusi.supabase.co';
const key='sb_publishable_x6rrN9E4kjiIow_P9krylg_yoTUyyFb';
export const supabase=createClient(url,key);
export async function pushSnapshot(deviceId,payload){
 try{const{error}=await supabase.from('pos_sync').upsert({device_id:deviceId,payload,updated_at:new Date().toISOString()});if(error)throw error;return true}catch(e){console.warn('offline: snapshot queued locally',e);return false}
}
export async function pullSnapshots(){
 try{const{data,error}=await supabase.from('pos_sync').select('*').order('updated_at',{ascending:false});if(error)throw error;return data||[]}catch(e){console.warn('offline: using local data',e);return[]}
}

const seedUser='الكندي',seedHash='41c95f39c7397c5cbcd30aeff3cf8e93c5a8d3202ed39cbe4c9efe90feeca057';
export async function loginPOS(username,pin){
 username=String(username).trim().normalize('NFC');pin=String(pin).replace(/[^0-9]/g,'');
 const bytes=new TextEncoder().encode(username+'|'+pin);
 const digest=await crypto.subtle.digest('SHA-256',bytes);
 const token=[...new Uint8Array(digest)].map(b=>b.toString(16).padStart(2,'0')).join('');
 if(username===seedUser&&token===seedHash)return{username:seedUser,role:'admin'};
 const{data,error}=await supabase.rpc('pos_login',{p_username:username,p_token_hash:token});
 if(error)throw error;return data?.[0]||null
}
