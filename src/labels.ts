export type PaperSize='a4'|'letter'|'a5'|'legal';
export type LabelCount=1|2|4|6|8|10;
export const paperSizes:Record<PaperSize,{width:number;height:number;label:string}>={
 a4:{width:210,height:297,label:'A4 (210 × 297 mm)'},
 letter:{width:215.9,height:279.4,label:'US Letter (8.5 × 11 in)'},
 a5:{width:148,height:210,label:'A5 (148 × 210 mm)'},
 legal:{width:215.9,height:355.6,label:'US Legal (8.5 × 14 in)'}
};
export function defaultPaper(locale:string):PaperSize {
 return /^en-(US|CA)(-|$)/i.test(locale)?'letter':'a4';
}
export function labelGrid(count:LabelCount):{columns:number;rows:number}{
 const columns=count===1?1:2;
 return {columns,rows:Math.ceil(count/columns)};
}
export function labelLayout(paper:PaperSize,count:LabelCount,margin=12,gap=4){
 if(!Number.isFinite(margin)||margin<5||margin>25||!Number.isFinite(gap)||gap<0||gap>15)throw new Error('Margins must be 5–25 mm and gaps 0–15 mm.');
 const page=paperSizes[paper];const {columns,rows}=labelGrid(count);
 const cellWidth=(page.width-2*margin-gap*(columns-1))/columns;
 const cellHeight=(page.height-2*margin-gap*(rows-1))/rows;
 if(cellWidth<=0||cellHeight<=0)throw new Error('Invalid label layout.');
 return {cellWidth,cellHeight,columns,rows,page};
}
