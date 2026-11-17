/** Keeps asynchronous QR validation results from enabling stale exports. */
export interface VerifiedQR { svg:string; payload:string }
export type ValidationResult = {status:'verified';value:VerifiedQR}|{status:'rejected';message:string}|{status:'stale'};
export class QRValidationState {
 private epoch=0;
 private verified:VerifiedQR|null=null;
 get current():VerifiedQR|null{return this.verified;}
 invalidate():void{this.epoch++;this.verified=null;}
 async run(render:()=>Promise<VerifiedQR>,verify:(value:VerifiedQR)=>Promise<{valid:boolean;message:string}>):Promise<ValidationResult>{
  this.invalidate();
  const token=this.epoch;
  try{
   const candidate=await render();
   if(token!==this.epoch)return {status:'stale'};
   const check=await verify(candidate);
   if(token!==this.epoch)return {status:'stale'};
   if(!check.valid)return {status:'rejected',message:check.message};
   this.verified=candidate;
   return {status:'verified',value:candidate};
  }catch(error){
   if(token!==this.epoch)return {status:'stale'};
   return {status:'rejected',message:error instanceof Error?error.message:'QR validation failed.'};
  }
 }
}
