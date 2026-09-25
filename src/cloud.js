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
