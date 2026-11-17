import {decodedText} from './scanner';

export interface CameraChoice {deviceId:string;label:string}
export async function listCameras():Promise<CameraChoice[]> {
 if(!navigator.mediaDevices?.enumerateDevices) return [];
 const devices=await navigator.mediaDevices.enumerateDevices();
 return devices.filter(device=>device.kind==='videoinput').map((device,index)=>({deviceId:device.deviceId,label:device.label||'Camera '+(index+1)}));
}
export async function openCamera(deviceId?:string):Promise<MediaStream> {
 if(!navigator.mediaDevices?.getUserMedia) throw new Error('Camera access requires HTTPS and a supported browser.');
 return navigator.mediaDevices.getUserMedia({audio:false,video:deviceId?{deviceId:{exact:deviceId}}:{facingMode:{ideal:'environment'}}});
}
export function stopCamera(stream:MediaStream|null):void {stream?.getTracks().forEach(track=>track.stop());}
export function decodeVideoFrame(video:HTMLVideoElement,canvas:HTMLCanvasElement):string|null {
 if(video.readyState<HTMLMediaElement.HAVE_CURRENT_DATA||!video.videoWidth||!video.videoHeight)return null;
 const scale=Math.min(1,1024/Math.max(video.videoWidth,video.videoHeight));
 canvas.width=Math.max(1,Math.round(video.videoWidth*scale));
 canvas.height=Math.max(1,Math.round(video.videoHeight*scale));
 const ctx=canvas.getContext('2d',{willReadFrequently:true});
 if(!ctx)throw new Error('Canvas is unavailable.');
 ctx.drawImage(video,0,0,canvas.width,canvas.height);
 return decodedText(ctx.getImageData(0,0,canvas.width,canvas.height));
}
