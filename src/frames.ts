export type FrameTemplate = 'simple' | 'wifi' | 'menu' | 'event' | 'contact';
export const frameTemplates: Record<FrameTemplate, {title:string;subtitle:string}> = {
 simple:{title:'Scan me',subtitle:'Point your camera at the QR code'},
 wifi:{title:'Connect to Wi-Fi',subtitle:'Scan to join the network'},
 menu:{title:'View our menu',subtitle:'Scan to explore'},
 event:{title:'Event details',subtitle:'Scan for more information'},
 contact:{title:'Save my contact',subtitle:'Scan to add contact details'}
};
export function frameCopy(template:FrameTemplate, title:string,subtitle:string){
 const clean=(v:string,max:number)=>v.trim().slice(0,max);
 return {title:clean(title,70)||frameTemplates[template].title,subtitle:clean(subtitle,120)||frameTemplates[template].subtitle};
}
