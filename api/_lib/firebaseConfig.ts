/** Read configuration without initializing an SDK or exposing credential contents. */
export function firebaseConfiguration(env:NodeJS.ProcessEnv=process.env):{configured:boolean;projectId?:string} {
 let account:{project_id?:string;client_email?:string;private_key?:string}={};
 if(env.FIREBASE_SERVICE_ACCOUNT_KEY){try{account=JSON.parse(env.FIREBASE_SERVICE_ACCOUNT_KEY);}catch{return {configured:false};}}
 const projectId=env.FIREBASE_PROJECT_ID||account.project_id||env.GOOGLE_CLOUD_PROJECT||env.GCLOUD_PROJECT;
 const credentials=!!(account.project_id&&account.client_email&&account.private_key)||!!env.GOOGLE_APPLICATION_CREDENTIALS;
 return {configured:!!projectId&&credentials,projectId};
}
