import type {SavedQR} from './library';
export type LibrarySort='newest'|'oldest'|'name-asc'|'name-desc'|'type';
export function filterAndSortLibrary(items:SavedQR[],query:string,favoritesOnly:boolean,sort:LibrarySort):SavedQR[]{
 const term=query.trim().toLocaleLowerCase();
 const matches=items.filter(item=>(!favoritesOnly||item.favorite)&&
  (!term||item.title.toLocaleLowerCase().includes(term)||item.kind.toLocaleLowerCase().includes(term)));
 const byName=(a:SavedQR,b:SavedQR)=>a.title.localeCompare(b.title,undefined,{sensitivity:'base'});
 return matches.sort((a,b)=>{
  switch(sort){
   case 'newest':return Date.parse(b.createdAt)-Date.parse(a.createdAt)||byName(a,b);
   case 'oldest':return Date.parse(a.createdAt)-Date.parse(b.createdAt)||byName(a,b);
   case 'name-asc':return byName(a,b);
   case 'name-desc':return byName(b,a);
   case 'type':return a.kind.localeCompare(b.kind)||byName(a,b);
  }
 });
}
