(function(root){'use strict';const M=root.FrogVillageWorld,TAU=Math.PI*2,SPRITES={"npc":[{"x":87,"y":73,"w":214,"h":277},{"x":456,"y":72,"w":206,"h":280},{"x":813,"y":72,"w":206,"h":280},{"x":1158,"y":72,"w":207,"h":285},{"x":84,"y":438,"w":211,"h":250},{"x":399,"y":487,"w":289,"h":183},{"x":783,"y":423,"w":251,"h":269},{"x":1141,"y":433,"w":232,"h":257},{"x":68,"y":732,"w":239,"h":305},{"x":402,"y":748,"w":270,"h":287},{"x":799,"y":791,"w":212,"h":237},{"x":1132,"y":789,"w":280,"h":246}],"props":[{"x":23,"y":92,"w":336,"h":262},{"x":383,"y":38,"w":391,"h":321},{"x":804,"y":191,"w":261,"h":162},{"x":1144,"y":167,"w":263,"h":186},{"x":32,"y":448,"w":322,"h":256},{"x":397,"y":490,"w":354,"h":212},{"x":804,"y":471,"w":255,"h":259},{"x":1177,"y":495,"w":236,"h":224},{"x":88,"y":837,"w":190,"h":173},{"x":486,"y":849,"w":152,"h":139},{"x":838,"y":873,"w":202,"h":116},{"x":1102,"y":750,"w":325,"h":280}]};
function ellipse(c,x,y,rx,ry,color){c.fillStyle=color;c.beginPath();c.ellipse(x,y,rx,ry,0,0,TAU);c.fill();}function stroke(c,points,color,width=1){c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.lineJoin='round';c.beginPath();points.forEach((p,i)=>i?c.lineTo(...p):c.moveTo(...p));c.stroke();}function round(c,x,y,w,h,r,color){c.fillStyle=color;c.beginPath();c.roundRect(x,y,w,h,r);c.fill();}
const occluders=[
 {z:331,p:[[70,195],[98,170],[147,179],[161,271],[147,319],[112,338],[75,324]]},
 {z:353,p:[[104,318],[204,326],[294,336],[293,361],[196,351],[102,342]]},
 {z:439,p:[[378,215],[609,210],[715,297],[712,428],[609,446],[517,421],[409,418],[382,357]]},
 {z:504,p:[[8,456],[59,478],[195,490],[248,470],[354,460],[408,479],[407,513],[349,494],[250,505],[203,524],[53,511],[8,489]]},
 {z:267,p:[[306,237],[356,244],[414,248],[444,243],[447,262],[411,270],[359,264],[307,256]]},
 {z:676,p:[[392,646],[430,661],[477,657],[490,664],[488,680],[475,669],[430,674],[392,657]]},
 {z:663,p:[[601,619],[633,642],[704,650],[753,633],[771,610],[781,626],[768,650],[709,671],[633,664],[594,640]]},
 {z:724,p:[[814,689],[877,702],[938,705],[1008,694],[1048,683],[1048,700],[1007,719],[936,731],[875,723],[826,711]]},
 {z:896,p:[[4,707],[201,714],[250,778],[255,865],[215,900],[171,878],[13,873]]},
 {z:947,p:[[927,727],[1016,704],[1085,784],[1086,888],[1018,931],[929,914]]},
 {z:983,p:[[669,945],[713,932],[738,926],[760,944],[758,989],[738,1003],[713,1006],[684,984]]},
 {z:1050,p:[[8,1000],[51,1020],[107,1008],[163,979],[180,994],[167,1028],[115,1055],[53,1054],[8,1025]]},
 {z:1160,p:[[691,1107],[714,1089],[743,1098],[762,1081],[799,1075],[785,1132],[746,1161],[692,1143]]},
 {z:1200,p:[[877,979],[998,988],[1085,1030],[1086,1200],[985,1165],[888,1120]]},
 {z:1327,p:[[818,1209],[860,1225],[925,1261],[1000,1280],[1044,1277],[1086,1293],[1086,1332],[1027,1304],[958,1310],[892,1277],[819,1241]]}
];
const sea=[[20,1080],[144,1069],[232,1050],[303,1085],[367,1101],[420,1125],[473,1170],[554,1184],[612,1225],[704,1253],[795,1265],[831,1320],[971,1372],[1018,1448],[0,1448]];
function poly(c,p){c.beginPath();p.forEach((v,i)=>i?c.lineTo(...v):c.moveTo(...v));c.closePath();}
async function load(){const images={};await Promise.all(['map','npc','props'].map(k=>new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>{images[k]=i;resolve()};i.onerror=()=>reject(Error('素材加载失败：'+k));i.src='village-'+k+'.webp';})));await new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>{images.frog=i;resolve()};i.onerror=reject;i.src=document.getElementById('actor-sprite').getAttribute('href');});return images;}
function create(images){const staticMap=document.createElement('canvas');staticMap.width=M.W;staticMap.height=M.H;staticMap.getContext('2d').drawImage(images.map,0,0,M.W,M.H);
 const layers=occluders.map(o=>{const x=Math.floor(Math.min(...o.p.map(p=>p[0]))),y=Math.floor(Math.min(...o.p.map(p=>p[1]))),w=Math.ceil(Math.max(...o.p.map(p=>p[0]))-x),h=Math.ceil(Math.max(...o.p.map(p=>p[1]))-y),canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;const c=canvas.getContext('2d');c.translate(-x,-y);poly(c,o.p);c.clip();c.drawImage(staticMap,0,0);return{...o,x,y,w,h,canvas};});
 const cached={};function sprite(c,sheet,index,x,y,h,dir=1,angle=0){const b=SPRITES[sheet][index],w=h*b.w/b.h;const key=sheet+index+':'+Math.round(h*2);let img=cached[key];if(!img){img=document.createElement('canvas');img.width=Math.ceil(w*2);img.height=Math.ceil(h*2);img.getContext('2d').drawImage(images[sheet],b.x,b.y,b.w,b.h,0,0,img.width,img.height);cached[key]=img;}c.save();c.translate(x,y);c.scale(dir,1);if(angle)c.rotate(angle);c.drawImage(img,-w/2,-h,w,h);c.restore();}
 function shadow(c,x,y,r=13,lift=0){c.save();c.translate(x,y);c.scale(1,.26);const size=r+lift*.18,g=c.createRadialGradient(0,0,0,0,0,size);g.addColorStop(0,'rgba(76,63,38,'+(Math.max(.12,.30-lift*.012))+')');g.addColorStop(.55,'rgba(76,63,38,.12)');g.addColorStop(1,'rgba(76,63,38,0)');ellipse(c,0,0,size,size,g);c.restore();}
 function resident(c,n,t){if(n.hidden)return;let pose=n.pose||0,angle=0;const special=['bear','maple','baby','angel'].includes(n.role);if(n.moving&&!special&&n.role!=='scooter'&&n.state!=='slide')pose=n.dy<-.9&&Math.abs(n.dy)>Math.abs(n.dx)*1.5?3:(Math.floor(t*6+n.phase)%2)+1;
 if(n.role==='bear')pose=8;if(n.role==='maple'){pose=9;angle=n.state==='hug-leaf'?Math.sin(t*.9)*.03:0;}if(n.role==='baby'){pose=10;angle=n.state==='lie-baby'?.45:n.state==='rock'?Math.sin(t*1.1)*.05:0;}if(n.role==='angel')pose=11;
 if(n.state==='lie'||n.state==='sleep'&&n.role!=='baby')pose=5;if(n.state==='sit')pose=4;if(n.state==='craft')pose=7;if(n.state==='celebrate'||n.state==='exam'||n.state==='wave')pose=6;
 let h=pose===5?30:pose===4||pose===7?36:pose===10?33:45,x=n.x,y=n.y-(n.lift||0);const swim=n.role==='swimmer'||n.slideStage==='swim'||n.seaWater;if(!swim&&n.role!=='angel'&&n.state!=='slide'&&n.role!=='bed')shadow(c,x,n.y,13,n.lift||0);
 if(n.role==='scooter'){
 // Seated body is fixed to the saddle. Vehicle artwork faces left by default.
 const facing=n.dir,seatX=x-8*facing,seatY=n.y-20,bob=n.moving?Math.sin(t*8+n.phase)*.35:0;
 sprite(c,'npc',4,seatX,seatY+bob,34,facing);
 sprite(c,'props',7,x,n.y,40,-facing);
 stroke(c,[[seatX+5*facing,seatY-10+bob],[x+9*facing,n.y-33]],'#b6a187',5);
 stroke(c,[[seatX+5*facing,seatY-10+bob],[x+9*facing,n.y-33]],'#f3e2c5',3);
 ellipse(c,x+9*facing,n.y-33,2.2,2.2,'#f3e2c5');
 if(n.moving){for(const wheel of [-13,15]){const wx=x+wheel*facing,wy=n.y-4,a=t*9;stroke(c,[[wx-Math.cos(a)*3,wy-Math.sin(a)*3],[wx+Math.cos(a)*3,wy+Math.sin(a)*3]],'#d5c8a4',1);}}
 return;
 }
 if(n.state==='slide'){if(n.slideStage==='slide'){pose=4;h=36;angle=-.24;n.dir=-1;y-=2;}else if(n.slideStage==='swim'){pose=4;h=36;}else if(n.slideStage==='climb'){pose=3;h=42;angle=-.1;}else{pose=0;h=45;}}

 c.save();if(n.role==='craft'&&n.x<235&&['craft','craft-enter','craft-leave'].includes(n.state)){if(n.state==='craft'){h=47;y=835;}c.beginPath();c.rect(x-40,y-80,80,823-(y-80));c.clip();}if(swim){c.beginPath();c.rect(x-40,y-80,80,78);c.clip();y+=8;}
 if(n.role==='bed'&&n.state==='sleep')angle=-.09;
 sprite(c,'npc',pose,x,y,h,n.dir,angle);c.restore();
 if(n.slideStage==='slide'){stroke(c,[[x+8,n.y-2],[x+12,n.y-10]],'#f2ffffb0',1.5);}
 if(swim){ellipse(c,x,n.y+1,16,3,'#e9ffff99');if(n.state==='splash')for(let i=0;i<3;i++){const a=(t*1.8+i*.8)%2;ellipse(c,x+(i-1)*19,n.y-3-Math.sin(a/2*Math.PI)*13,1.4,2.1,'#f1ffffb8');}}
 if(n.state==='exam'){c.save();c.translate(x+9,y-47);c.rotate(-.1);round(c,-13,-28,28,41,2,'#fff8e3');c.strokeStyle='#b79873';c.lineWidth=.8;c.strokeRect(-13,-28,28,41);c.fillStyle='#c85242';c.font='bold 18px Georgia';c.textAlign='center';c.fillText('90',1,-9);stroke(c,[[-9,-5],[10,-5]],'#d68570',1);for(let i=0;i<3;i++)stroke(c,[[-8,i*4+1],[8,i*4+1]],'#d4c6a9',.7);c.restore();}
 if(n.state==='craft'){const x=n.x+19,y=n.y-18;stroke(c,[[x-8,y+Math.sin(t*3)*2],[x+6,y-9+Math.sin(t*3)*2]],'#9b6644',1.5);}
 if(n.state==='pick'){ellipse(c,x+17*n.dir,y-12,5,5,'#d47352');stroke(c,[[x+17*n.dir,y-17],[x+18*n.dir,y-20]],'#6e7740',1);}
 if(n.state==='sleep'&&Math.sin(t*.7+n.id)>.3){c.font='11px Georgia';c.fillStyle='#8b896e';c.fillText('z',x+19,y-h-2);}
 if(n.reactUntil>t&&n.state==='look'){c.fillStyle='#837951';c.font='11px Georgia';c.textAlign='center';c.fillText('♡',x,y-h-6);}
 if(n.state==='hug'){ellipse(c,x+n.dir*12,y-14,5,3,'#f0e0c5');}
 }
 function frog(c,p,t){const h=45,w=h*506/555,a=p.action,swim=p.water||p.slideStage==='swim';if(!swim&&a?.kind!=='elephant')shadow(c,p.x,p.y,15,p.lift||0);c.save();const y=p.y-(p.lift||0);if(swim){c.beginPath();c.rect(p.x-36,p.y-70,72,71);c.clip();}c.translate(p.x,y+(swim?17:0));c.scale(p.slideStage==='slide'?-1:p.dir,1);if(p.slideStage==='slide')c.rotate(-.3);else if(p.slideStage==='climb')c.rotate(.1);c.drawImage(images.frog,[45,550,1060][p.face]||45,235,506,555,-w/2,-h,w,h);c.restore();if(swim)ellipse(c,p.x,p.y+1,17,2.6,'#ecffffaa');if(a?.kind==='orchard'){ellipse(c,p.x+20,p.y-10,5,5,'#d67f55');}if(a?.kind==='craft'){round(c,p.x+19,p.y-7,24,17,1,'#fff2d6');const q=M.clamp((t-a.start)/a.duration,0,1);for(let i=0;i<5*q;i++)ellipse(c,p.x+31+Math.sin(i/5*TAU)*4,p.y+1+Math.cos(i/5*TAU)*4,3,2.5,'#e7a78b');}}
 function bus(c,w){const b=w.events.bus;if(b.phase==='away')return;sprite(c,'props',0,b.x,b.y,145);for(let i=0;i<3;i++){const x=b.x-73+i*30,y=b.y-77+i*5;c.save();c.beginPath();c.rect(x-11,y-19,23,20);c.clip();sprite(c,'npc',i%2?0:4,x,y+9,31);c.restore();}
 if(b.door>.02){const x=b.x+3,y=b.y-95;c.save();c.translate(x,y);c.transform(1,.28,0,1,0,0);round(c,0,0,13*b.door,76,2,'#594e40');stroke(c,[[18*b.door,0],[13*b.door,76]],'#e8b957',1.5);c.restore();}}
 function animals(c,w,visible,add){for(const a of w.animals){if(!visible(a.x,a.y,90))continue;add(a.y,()=>{shadow(c,a.x,a.y,34);let idx=a.kind==='cow'?(a.state==='rest'||a.state==='sniff'?5:4):(a.state==='walk'||a.state==='sniff'?3:2);sprite(c,'props',idx,a.x,a.y,a.kind==='cow'?68:56,a.dir,a.state==='walk'?Math.sin(w.t*4+a.id)*.015:0);if(a.kind==='cow')stroke(c,[[a.x+36,a.y-36],[a.x+44+Math.sin(w.t*1.8+a.id)*3,a.y-23]],'#8a8070',2);});}
 const pig=w.animals[2],q=w.t%37,bird={x:pig.x+26+Math.sin(w.t*.15)*22,y:pig.y-45-(q>25?Math.sin((q-25)/12*Math.PI)*55:Math.max(0,Math.sin(w.t*3))*3)};if(visible(bird.x,bird.y,40))add(bird.y+55,()=>sprite(c,'props',8,bird.x,bird.y,22));}
 function water(c,w,visible){const t=w.t;c.save();poly(c,sea);c.clip();for(const f of w.fish)if(visible(f.x,f.y,35)){c.globalAlpha=.25;sprite(c,'props',10,f.x,f.y,16+f.phase*1.3,-f.dir,Math.sin(t*.3+f.phase)*.08);}c.globalAlpha=1;for(let i=0;i<12;i++){const x=110+i*51,y=1160+(i%4)*47+Math.sin(t*.6+i)*4;stroke(c,[[x,y],[x+12,y-1],[x+23,y]],'#f1ffff55',.8);}c.restore();
 const falls=[[279,85,20,32],[337,176,19,30],[357,283,25,35],[388,421,20,28],[430,548,23,32],[465,711,30,38],[548,833,30,35]];for(const[x,y,r,h]of falls){if(!visible(x,y,70))continue;for(let i=0;i<4;i++){const yy=y+(t*22+i*9)%h;stroke(c,[[x-r/2+i*r/3,yy],[x-r/2+i*r/3+3,yy+8]],'#f5ffff77',1.2);}}
 // Only cola-coloured jets are added to the existing fountain, with its stone silhouette intact.
 if(visible(686,567,120)){for(let i=0;i<7;i++){const q=(t*.48+i/7)%1,a=i/7*TAU,x=686+Math.cos(a)*q*40,y=510-70*Math.sin(q*Math.PI)+q*50;ellipse(c,x,y,2+q,3+q,'#713c24');}for(let i=0;i<6;i++){const x=670+i*6,y=533+(t*30+i*9)%53;stroke(c,[[x,y],[x+Math.sin(t+i),y+11]],'#9c5c32aa',1.2);}}
 if(visible(925,667,120)){for(let i=0;i<2;i++){const x=928+Math.sin(t*.09+i*2)*57,y=680+Math.cos(t*.14+i*2)*12;sprite(c,'props',9,x,y,22,i?-1:1);ellipse(c,x,y+1,17,2,'#f7ffff77');}}
 }
 function insects(c,w,visible){const t=w.t;for(let i=0;i<12;i++){const base=i<5?[183,278]:[156,537],x=base[0]+Math.sin(t*(.19+i*.011)+i)*70,y=base[1]+Math.cos(t*.17+i*2)*45;if(!visible(x,y,20))continue;const wing=1.2+Math.abs(Math.sin(t*12+i))*2;if(i<5){ellipse(c,x,y,3,2,'#dcb969');stroke(c,[[x,y-1],[x,y+2]],'#715740',1);ellipse(c,x-1,y-3,wing,1,'#ffffe9bb');}else {ellipse(c,x-wing,y,wing,2.7,'#f3d89f');ellipse(c,x+wing,y,wing,2.7,'#d9c3eb');ellipse(c,x,y,1,2.6,'#857458');}}}
 function textureMotion(c,w,visible){const t=w.t;
 // Small articulated patches carry the original painted texture; no replacement geometry.
 if(visible(719,821,80)){c.save();c.translate(728,800);c.rotate(Math.sin(t*.7)*.022);c.beginPath();c.ellipse(0,36,27,42,-.1,0,TAU);c.clip();c.drawImage(staticMap,-728,-800);c.restore();}
 if(visible(160,180,180)){for(const patch of [[80,145,42,22],[190,173,45,25],[128,99,36,21]]){const[x,y,rx,ry]=patch;c.save();c.beginPath();c.ellipse(x,y,rx,ry,0,0,TAU);c.clip();c.drawImage(staticMap,Math.sin(t*.6+x)*.65,Math.sin(t*.5)*.3);c.restore();}}
 }
 function render(c,w,cam,width,height,dpr){c.setTransform(dpr,0,0,dpr,0,0);c.fillStyle='#9cbab4';c.fillRect(0,0,width,height);c.translate(width/2,height/2);c.scale(cam.zoom,cam.zoom);c.translate(-cam.x,-cam.y);const vw=width/cam.zoom,vh=height/cam.zoom,left=Math.max(0,cam.x-vw/2),top=Math.max(0,cam.y-vh/2),right=Math.min(M.W,cam.x+vw/2),bottom=Math.min(M.H,cam.y+vh/2),visible=(x,y,r=100)=>Math.abs(x-cam.x)<vw/2+r&&Math.abs(y-cam.y)<vh/2+r;
 c.drawImage(staticMap,left,top,right-left,bottom-top,left,top,right-left,bottom-top);water(c,w,visible);textureMotion(c,w,visible);
 const draw=[],add=(y,fn)=>draw.push({y,fn});for(const l of layers)if(visible(l.x+l.w/2,l.y+l.h/2,Math.max(l.w,l.h)/2))add(l.z,()=>c.drawImage(l.canvas,l.x,l.y));
 animals(c,w,visible,add);if(visible(w.events.bus.x,w.events.bus.y,180))add(w.events.bus.y+6,()=>bus(c,w));
 for(const n of w.npcs){if(n.hidden||n.role==='angel'||n.seaRide||!visible(n.x,n.y,65))continue;const z=n.state==='climb'?355:n.role==='bed'?447:n.role==='craft'&&['craft','craft-enter','craft-leave'].includes(n.state)?902:n.role==='swimmer'?696:n.state==='slide'?970:n.y;add(z,()=>resident(c,n,w.t));}
 const a=w.player.action;add(a?.kind==='elephant'?974:a?.kind==='pool'?697:w.player.y,()=>frog(c,w.player,w.t));draw.sort((a,b)=>a.y-b.y);for(const d of draw)d.fn();insects(c,w,visible);
 const dolphin=w.events.dolphin;if(dolphin.active){const q=(w.t-dolphin.start)%5/5,x=500+Math.sin((w.t-dolphin.start)*.35)*75,y=1225,lift=Math.sin(q*Math.PI)*53;if(visible(x,y,160)){c.save();poly(c,sea);c.clip();ellipse(c,x,y+1,42,7,'#e9ffff88');sprite(c,'props',6,x,y-lift+25,107,-1,-.35+q*.6);if(q>.6)for(let i=0;i<5;i++)ellipse(c,x-36+i*16,y-Math.sin(q*Math.PI)*14,1.8,4,'#efffffcc');c.restore();const rider=w.npcs.find(n=>n.seaRide);if(rider)resident(c,rider,w.t);}}
 const air=w.events.airship;if(air.active){const q=(w.t-air.start)/60,x=-170+q*1470,y=190+Math.sin(q*Math.PI)*100;if(visible(x,y,260)){sprite(c,'props',1,x,y,195);c.save();c.beginPath();c.rect(x-57,y-74,112,31);c.clip();for(let i=0;i<5;i++)sprite(c,'npc',0,x-42+i*21,y-39+(i%2)*3,32);c.restore();}}
 for(const n of w.npcs)if(n.role==='angel'&&!n.hidden&&visible(n.x,n.y,80))resident(c,n,w.t);
 if(w.player.path.length){const d=w.player.path.at(-1);c.strokeStyle='#fff5c7bd';c.lineWidth=1;c.beginPath();c.ellipse(d.x,d.y,5+Math.sin(w.t*4),2.6,0,0,TAU);c.stroke();}
 if(cam.debug){c.fillStyle='#29fd6750';for(let i=0;i<w.nav.length;i++)if(w.nav[i])c.fillRect(i%M.COLS*M.CELL,Math.floor(i/M.COLS)*M.CELL,M.CELL,M.CELL);c.font='10px sans-serif';c.fillStyle='#121212';for(const z of M.zones){c.fillText(z.id,z.at[0],z.at[1]);}}
 c.setTransform(dpr,0,0,dpr,0,0);
 }
 return{render};
}
root.FrogVillageArt={load,create};
})(globalThis);
