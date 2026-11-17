/** Tracks the latest asynchronous QR generation request and its verified export. */
export interface VerifiedQR {svg:string;payload:string}
export class QRValidationState {
 private epoch=0;
 private verified:VerifiedQR|null=null;
 get current():VerifiedQR|null{return this.verified;}
 invalidate():number{this.verified=null;return ++this.epoch;}
 isCurrent(token:number):boolean{return token===this.epoch;}
 accept(token:number,svg:string,payload:string):boolean{
  if(!this.isCurrent(token))return false;
  this.verified={svg,payload};return true;
 }
}
