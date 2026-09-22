(function(root){'use strict';
const W=1086,H=1448,CELL=5,COLS=Math.ceil(W/CELL),ROWS=Math.ceil(H/CELL),TAU=Math.PI*2;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),lerp=(a,b,t)=>a+(b-a)*t,dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),point=a=>({x:a[0],y:a[1]});
function random(seed){let s=seed>>>0;return()=>{s+=0x6d2b79f5;let t=s;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};}
function inPoly(x,y,poly){let inside=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])inside=!inside;}return inside;}
function segDistance(x,y,a,b){const dx=b[0]-a[0],dy=b[1]-a[1],t=clamp(((x-a[0])*dx+(y-a[1])*dy)/(dx*dx+dy*dy||1),0,1);return Math.hypot(x-a[0]-t*dx,y-a[1]-t*dy);}
// Positive walk surfaces, traced against the registered standard map. Unlisted pixels are solid.
const paths=[
 {r:12,p:[[64,330],[86,358],[56,405],[51,480],[84,511],[194,517],[292,522],[332,551],[367,593],[394,614]]},
 {r:13,p:[[286,521],[327,484],[369,471],[416,467],[445,457]]},
 {r:10,p:[[292,522],[291,478],[302,445],[281,411],[248,376],[232,334],[248,313],[279,300],[291,268],[315,241]]},
 {r:12,p:[[311,238],[340,237],[375,239],[410,245],[437,252]]},
 {r:13,p:[[127,677],[216,665],[288,622],[332,636],[382,619],[412,629],[451,641],[488,655],[525,680],[563,688],[610,697]]},
 {r:12,p:[[216,665],[253,682],[275,713],[286,762],[320,792],[343,816],[345,848],[330,871],[297,881],[253,906],[204,935],[165,974]]},
 {r:13,p:[[267,889],[232,927],[255,956],[272,974]]},
 {r:13,p:[[485,1060],[520,1104],[552,1133],[613,1160],[693,1190],[773,1200],[824,1178],[866,1163]]},
 {r:14,p:[[163,973],[124,981],[95,1005],[66,1030],[102,1044],[152,1036]]},
 {r:16,p:[[448,454],[493,438],[537,452],[584,448],[641,452],[702,443],[768,446],[817,472],[877,497],[947,505],[1016,488],[1083,477]]},
 {r:16,p:[[746,454],[730,482],[729,506],[770,537],[805,565],[808,590]]},
 {r:13,p:[[607,452],[591,481],[568,496],[560,528],[574,562],[571,608],[573,645],[574,672],[610,697],[655,703],[719,713],[741,737],[769,775],[811,795],[870,789],[897,824],[898,875],[911,911],[955,930],[983,949]]},
 {r:12,p:[[805,565],[827,545],[844,529],[825,512],[780,514],[739,501],[680,487],[609,483],[568,496]]},
 {r:13,p:[[760,728],[741,737],[769,775],[811,795],[870,789],[897,824],[880,875],[867,916],[865,956],[819,985],[772,1015],[724,1026],[682,1024],[628,1023],[575,1037],[526,1049],[479,1072]]},
 {r:13,p:[[880,875],[898,875]]},
 {r:12,p:[[865,956],[862,984],[881,1029],[870,1084],[849,1121],[866,1163],[921,1195],[970,1227],[1047,1264]]},
 {r:10,p:[[253,906],[207,901],[197,910]]}
];
const fields=[
 [[25,510],[91,507],[159,525],[219,544],[256,568],[269,609],[235,650],[172,678],[70,706],[31,689]],
 [[18,354],[75,347],[93,396],[55,424],[24,428]],
 [[110,360],[203,359],[283,392],[314,433],[289,459],[218,436],[150,414]],
 [[40,429],[104,413],[205,442],[248,479],[191,513],[85,510],[38,484]],
 [[535,1041],[651,1010],[728,1005],[775,1031],[731,1076],[689,1120],[611,1137],[553,1111],[505,1072]],
 [[599,1121],[691,1100],[746,1148],[798,1161],[783,1199],[699,1221],[627,1190]],
 [[858,1156],[914,1152],[979,1181],[1060,1211],[1086,1250],[1086,1349],[1002,1298],[933,1254],[876,1222]],
 [[32,937],[100,941],[178,968],[172,1039],[110,1060],[8,1022],[8,974]],
 [[727,454],[831,450],[966,477],[1038,483],[997,517],[897,522],[816,493]],
 [[474,428],[550,423],[585,443],[546,467],[498,475],[451,459]]
];
const blocks=[
 // Ground footprints include clearance for the actor's feet, not just painted silhouettes.
 [[757,686],[802,686],[806,719],[768,723]],
 [[279,816],[322,812],[327,850],[282,856]],
 [[706,976],[752,972],[756,1003],[714,1008]],

 [[779,715],[836,721],[942,745],[950,775],[850,783],[798,758]],
 [[90,250],[155,248],[146,327],[106,344],[77,323]],
 [[335,528],[374,540],[375,569],[351,560]],
 [[487,445],[521,440],[527,482],[489,490]],
 [[547,743],[611,763],[640,799],[660,869],[631,942],[581,971],[527,951],[508,917],[540,849]],
 [[605,563],[668,542],[735,562],[769,602],[752,638],[707,661],[641,651],[603,627]],
 [[931,798],[1020,784],[1040,875],[998,911],[936,893]],
 [[59,1023],[80,1023],[80,1053],[59,1053]],
 [[758,1019],[821,1035],[831,1070],[802,1137],[733,1134],[721,1107]],
 [[529,1036],[579,1031],[612,1066],[601,1103],[567,1110],[520,1081]]
];
const animalFootprints=[{x:187,y:388,rx:45,ry:15},{x:289,y:422,rx:44,ry:15},{x:151,y:626,rx:48,ry:17}];
function walkable(x,y){if(animalFootprints.some(a=>((x-a.x)/a.rx)**2+((y-a.y)/a.ry)**2<1))return false;if(x<8||y<190||x>W-8||y>H-8)return false;if(blocks.some(poly=>inPoly(x,y,poly)))return false;if(fields.some(poly=>inPoly(x,y,poly)))return true;return paths.some(path=>path.p.some((b,i)=>i&&segDistance(x,y,path.p[i-1],b)<path.r));}
function roadPoint(p){let best=null,score=Infinity;for(const path of paths)for(let i=1;i<path.p.length;i++){const a=path.p[i-1],b=path.p[i],dx=b[0]-a[0],dy=b[1]-a[1],q=clamp(((p.x-a[0])*dx+(p.y-a[1])*dy)/(dx*dx+dy*dy||1),0,1),v={x:a[0]+dx*q,y:a[1]+dy*q};if(walkable(v.x,v.y)){const d=dist(p,v);if(d<score){best=v;score=d;}}}return best;}
function roadDistance(p){const r=roadPoint(p);return r?dist(p,r):Infinity;}
function lineClear(a,b){const n=Math.ceil(dist(a,b)/2.5);for(let i=0;i<=n;i++)if(!walkable(lerp(a.x,b.x,i/(n||1)),lerp(a.y,b.y,i/(n||1))))return false;return true;}
const zones=[
 {id:'flowers',x:134,y:472,r:100,at:[222,493],line:'花丛里，连发呆都是香香的。'},
 {id:'orchard',x:163,y:301,r:120,at:[248,313],line:'捡到一颗小苹果。'},
 {id:'cow',x:240,y:402,r:90,at:[309,452],line:'你们慢慢吃，我就看看。'},
 {id:'pig',x:143,y:623,r:80,at:[201,640],line:'嘘，小猪在做一个软软的梦。'},
 {id:'house',x:618,y:388,r:100,at:[580,447],line:'云朵枕头看起来好软呀。'},
 {id:'bus',x:902,y:464,r:125,at:[770,484],line:'一起等下一班校车吧。'},
 {id:'fountain',x:681,y:598,r:92,at:[575,615],line:'咕嘟咕嘟，是可乐味的喷泉。'},
 {id:'pool',x:925,y:668,r:122,at:[760,728],line:'凉凉的水，轻轻拍一下。'},
 {id:'craft',x:165,y:842,r:108,at:[297,881],line:'画一朵小花，送给今天。'},
 {id:'elephant',x:692,y:856,r:120,at:[867,916],line:'轮到小宝蛙滑下来啦！'},
 {id:'toilet',x:989,y:855,r:85,at:[919,917],line:'小宝在里面，等等它吧。'},
 {id:'beach',x:611,y:1110,r:140,at:[664,1165],line:'海豚，过来一起玩呀。'}
];
function nearest(p){if(walkable(p.x,p.y))return {...p};let best=null,score=Infinity;for(let y=clamp(p.y-160,190,H-10);y<Math.min(H-10,p.y+160);y+=5)for(let x=clamp(p.x-160,8,W-8);x<Math.min(W-8,p.x+160);x+=5)if(walkable(x,y)){const d=(x-p.x)**2+(y-p.y)**2;if(d<score){score=d;best={x,y};}}return best;}
class Heap{constructor(){this.a=[]}push(n){let i=this.a.length;this.a.push(n);while(i){const p=(i-1)>>1;if(this.a[p].f<=n.f)break;this.a[i]=this.a[p];i=p}this.a[i]=n}pop(){const a=this.a,r=a[0],e=a.pop();if(a.length){let i=0;while(i*2+1<a.length){let j=i*2+1;if(j+1<a.length&&a[j+1].f<a[j].f)j++;if(a[j].f>=e.f)break;a[i]=a[j];i=j}a[i]=e}return r}get length(){return this.a.length}}
function findPath(w,from,to){from=nearest(from);to=nearest(to);if(!from||!to)return [];if(lineClear(from,to))return [to];const nav=w.nav,pos=i=>({x:i%COLS*CELL+2.5,y:Math.floor(i/COLS)*CELL+2.5});function index(p){const k=Math.floor(p.y/CELL)*COLS+Math.floor(p.x/CELL);for(let d=0;d<4;d++)for(let y=-d;y<=d;y++)for(let x=-d;x<=d;x++){const j=k+y*COLS+x;if(nav[j]&&lineClear(p,pos(j)))return j;}return -1;}
 const start=index(from),end=index(to);if(start<0||end<0)return[];const heap=new Heap(),cost=new Float32Array(nav.length).fill(Infinity),prev=new Int32Array(nav.length).fill(-1),closed=new Uint8Array(nav.length);cost[start]=0;heap.push({id:start,f:0});while(heap.length){const id=heap.pop().id;if(closed[id])continue;if(id===end){const chain=[];for(let k=end;k!==start&&k>=0;k=prev[k])chain.push(pos(k));chain.reverse();chain.unshift(pos(start));chain.push(to);let last=from;const result=[];for(let i=0;i<chain.length;i++){let k=i;while(k+1<chain.length&&lineClear(last,chain[k+1]))k++;result.push(chain[k]);last=chain[k];i=k;}return result;}closed[id]=1;const x=id%COLS,y=Math.floor(id/COLS);let edge=0;for(const[dx,dy]of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,1],[1,-1],[-1,-1]]){const edgeIndex=edge++;const xx=x+dx,yy=y+dy,j=yy*COLS+xx;if(xx<0||yy<0||xx>=COLS||yy>=ROWS||!nav[j]||closed[j])continue;if(dx&&dy&&(!nav[y*COLS+xx]||!nav[yy*COLS+x]))continue;if(!w.edges[id*8+edgeIndex])continue;const n=cost[id]+(dx&&dy?1.414:1);if(n>=cost[j])continue;cost[j]=n;prev[j]=id;heap.push({id:j,f:n+Math.hypot(xx-end%COLS,yy-Math.floor(end/COLS))});}}return[];}
function create(seed=48139){const rng=random(seed),nav=new Uint8Array(COLS*ROWS);for(let i=0;i<nav.length;i++)nav[i]=walkable(i%COLS*CELL+2.5,Math.floor(i/COLS)*CELL+2.5)?1:0;const edges=new Uint8Array(nav.length*8),directions=[[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,1],[1,-1],[-1,-1]];for(let i=0;i<nav.length;i++){if(!nav[i])continue;const x=i%COLS,y=Math.floor(i/COLS),a={x:x*CELL+2.5,y:y*CELL+2.5};for(let d=0;d<8;d++){const[dx,dy]=directions[d],xx=x+dx,yy=y+dy,j=yy*COLS+xx;if(xx>=0&&xx<COLS&&yy>=0&&yy<ROWS&&nav[j]&&lineClear(a,{x:xx*CELL+2.5,y:yy*CELL+2.5}))edges[i*8+d]=1;}}const w={rng,nav,edges,t:0,npcs:[],player:{x:610,y:697,dir:1,path:[],speed:80,lift:0,hop:0,action:null,face:0},events:{bus:{phase:'away',at:9,next:15,x:1220,y:486,door:0},exam:{active:false,next:30,end:0},airship:{active:true,start:0,next:140},dolphin:{active:false,next:17,start:0},slide:{active:null,next:12,queue:[]}},reactionAt:2,metrics:{near:0,far:0,bus:0,exam:0,slides:0},fish:Array.from({length:20},(_,i)=>({x:80+rng()*580,y:1100+rng()*180,dir:i%2?-1:1,speed:4+rng()*7,phase:rng()*TAU,next:10+rng()*20}))};
 function add(role,x,y,opts={}){const p=(['flower','picker','baby','pigfriend'].includes(role)?nearest({x,y}):roadPoint({x,y}))||{x:610,y:697};w.npcs.push({id:w.npcs.length,role,...p,home:p,path:[],speed:20+rng()*12,pose:0,state:'idle',dir:rng()<.5?-1:1,lift:0,phase:rng()*TAU,next:2+rng()*8,farAt:0,last:0,cooldown:0,reactUntil:0,hidden:false,...opts});}
 for(const p of [[90,525],[174,545],[67,482]])add('flower',...p);add('bear',278,584,{pose:8});add('maple',714,1036,{pose:9});add('baby',126,473,{pose:10});
 add('picker',247,313);add('picker',270,391);add('pigfriend',90,679);add('pigfriend',218,609);
 add('scooter',295,622,{speed:53});add('scooter',854,486,{speed:50});add('bed',583,448);add('bedfriend',464,456);
 add('swimmer',891,655,{x:891,y:655,home:{x:891,y:655}});add('swimmer',960,666,{x:960,y:666,home:{x:960,y:666}});
 add('craft',271,873);add('craft',250,908);add('toilet',900,914);
 for(let i=0;i<3;i++)add('queue',867+i*15,916-i*10);for(const p of [[754,476],[778,486],[743,492]])add('bus',...p);
 for(const [i,p]of [[0,[572,676]],[1,[650,704]],[2,[750,730]],[3,[703,444]],[4,[780,516]]])add(i?'festival':'scholar',...p);
 for(const p of [[253,686],[319,790],[209,933],[448,454],[820,947],[670,1024],[609,1156],[795,770],[162,659],[753,730],[876,1166]])add('wander',...p);
 add('seabuddy',612,1160);add('angel',860,170,{x:860,y:170});w.events.slide.queue=w.npcs.filter(n=>n.role==='queue').map(n=>n.id);w.queueHomes=[0,1,2].map(i=>nearest({x:867+i*15,y:916-i*10}));w.animals=[{id:0,kind:'cow',x:179,y:390,home:{x:179,y:390},phase:0,dir:1},{id:1,kind:'cow',x:281,y:423,home:{x:281,y:423},phase:14,dir:1},{id:2,kind:'pig',x:143,y:627,home:{x:143,y:627},phase:6,dir:1}];return w;
}
function setPath(w,n,target){const p=nearest(target);n.path=p?findPath(w,n,p):[];return !!n.path.length;}
function go(w,target){if(w.player.action)return false;return setPath(w,w.player,target);}
function busBlocks(w,x,y,pad=0){const b=w.events.bus;return b.phase!=='away'&&Math.abs(x-b.x)<103+pad&&y>b.y-22-pad&&y<b.y+12+pad;}
function move(n,dt,speed,collision=true,w=null){let remaining=dt*speed,moved=0;while(n.path.length&&remaining>0){const p=n.path[0],d=dist(n,p);if(d<.3){n.path.shift();continue;}const step=Math.min(remaining,d),x=n.x+(p.x-n.x)/d*step,y=n.y+(p.y-n.y)/d*step;if(collision&&!walkable(x,y)){n.path=[];break;}if(w&&busBlocks(w,x,y,5)&&!busBlocks(w,n.x,n.y,0)){n.waitingBus=true;break;}n.waitingBus=false;n.dx=x-n.x;n.dy=y-n.y;n.dir=n.dx<-.05?-1:n.dx>.05?1:n.dir;n.x=x;n.y=y;remaining-=step;moved+=step;}n.moving=moved>.01;return moved;}
function wander(w,n,r=45){for(let i=0;i<10;i++){let p={x:n.home.x+(w.rng()-.5)*r*2,y:n.home.y+(w.rng()-.5)*r*1.2};if(!['flower','picker','pigfriend'].includes(n.role))p=roadPoint(p)||n.home;if(walkable(p.x,p.y)&&lineClear(n,p)){n.path=[p];return;}}n.path=[];}
function activity(w,n){const r=w.rng(),t=w.t;n.next=t+7+w.rng()*17;n.path=[];n.pose=0;n.state=r<.25?'sit':r<.47?'look':r<.65?'idle':'walk';if(n.role==='flower'){n.state=r<.55?'lie':r<.8?'sit':'walk';n.pose=n.state==='lie'?5:n.state==='sit'?4:0;n.next=t+13+w.rng()*20;}
 else if(n.role==='bear'){n.pose=8;n.state=r<.3?'idle':'walk';}else if(n.role==='maple'){n.pose=9;n.state=r<.7?'hug-leaf':'walk';}else if(n.role==='baby'){n.pose=10;n.state=r<.45?'sleep':r<.7?'lie-baby':'rock';return;}
 else if(n.role==='picker'){n.state=r<.42?'pick':'walk';n.next=t+8+w.rng()*12;}else if(n.role==='scooter'){n.state='ride';n.next=t+8;const dest=n.home.x<400?(n.x<290?[367,593]:[216,665]):(n.x<850?[980,493]:[780,461]);setPath(w,n,point(dest));return;}
 else if(n.role==='bed'){n.state=r<.55?'sleep':r<.8?'bed-sit':'window';n.next=t+16+w.rng()*20;return;}
 if(n.state==='sit')n.pose=4;if(n.state==='walk')wander(w,n,n.role==='wander'?100:42);
 // Small social moments are paired and end on each resident's next decision.
 if(n.role==='wander'&&r>.35&&r<.58){const friend=w.npcs.find(o=>o!==n&&['wander','pigfriend'].includes(o.role)&&dist(n,o)<55&&o.reactUntil<t);if(friend){n.state=r<.44?'hug':r<.51?'chat':'chase';n.peer=friend.id;if(n.state==='chase'){wander(w,friend,70);friend.state='walk';friend.next=t+7;setPath(w,n,nearest({x:friend.x+18,y:friend.y+12})||friend);n.chaseAt=t+1;n.next=t+6;}else {friend.state=n.state;friend.peer=n.id;friend.path=[];friend.next=n.next;if(n.state==='hug')setPath(w,n,nearest({x:friend.x-24,y:friend.y+1})||n);}n.dir=friend.x<n.x?-1:1;}}
}
function slide(q){const a={x:641,y:833},b={x:613,y:855},c={x:625,y:932},d={x:569,y:951},u=1-q;return{x:u*u*u*a.x+3*u*u*q*b.x+3*u*q*q*c.x+q*q*q*d.x,y:u*u*u*a.y+3*u*u*q*b.y+3*u*q*q*c.y+q*q*q*d.y};}
function routeSample(points,q){const segs=points.slice(1).map((p,i)=>Math.hypot(p[0]-points[i][0],p[1]-points[i][1])),total=segs.reduce((a,b)=>a+b,0);let d=clamp(q,0,1)*total;for(let i=0;i<segs.length;i++){if(d<=segs[i])return{x:lerp(points[i][0],points[i+1][0],d/segs[i]),y:lerp(points[i][1],points[i+1][1],d/segs[i])};d-=segs[i];}return point(points.at(-1));}
function slideJourney(from,q){if(q<.3)return{...routeSample([[from.x,from.y],[789,920],[775,875],[738,818],[680,803],[641,833]],q/.3),stage:'climb'};if(q<.62)return{...slide(((q-.3)/.32)**1.35),stage:'slide'};if(q<.91)return{...routeSample([[569,951],[618,972],[693,973],[761,959],[808,946]],(q-.62)/.29),stage:'swim'};return{...routeSample([[808,946],[from.x,from.y]],(q-.91)/.09),stage:'walk'};}
function enterAction(w,id){const z=zones.find(z=>z.id===id),p=w.player;if(!z||p.action||dist(p,point(z.at))>32)return false;const durations={elephant:12,pool:9,craft:7,flowers:7,beach:8,bus:8,pig:6,cow:5,house:5,orchard:6,fountain:5,toilet:4};if(id==='elephant'&&w.events.slide.active)return false;p.action={kind:id,start:w.t,duration:durations[id]||5,return:{x:p.x,y:p.y}};p.path=[];if(id==='beach'){w.events.dolphin.active=true;w.events.dolphin.start=w.t;w.events.dolphin.next=w.t+70;}if(id==='elephant')w.events.slide.active={id:'player',start:w.t};return true;}
function step(w,dt,view){dt=clamp(dt,0,.08);w.t+=dt;const t=w.t,p=w.player,e=w.events;
 if(p.action){const a=p.action,q=clamp((t-a.start)/a.duration,0,1);if(a.kind==='elephant'){const j=slideJourney(a.return,q);p.x=j.x;p.y=j.y;p.slideStage=j.stage;p.lift=j.stage==='climb'?Math.abs(Math.sin(t*6))*2:0;}
 else if(a.kind==='pool'){const blend=q>.8?(1-q)/.2:clamp(q/.2,0,1);p.x=lerp(a.return.x,875,blend);p.y=lerp(a.return.y,684,blend);p.water=q>.18&&q<.82;p.lift=q<.2||q>.8?Math.sin(blend*Math.PI)*18:0;}
 if(q>=1){Object.assign(p,a.return,{action:null,lift:0,slideStage:null,water:false});if(a.kind==='elephant')e.slide.active=null;}}
 else {move(p,dt,p.speed,true,w);p.hop+=p.moving?dt:0;p.lift=p.moving?Math.sin(p.hop% .43/.43*Math.PI)*8:0;if(p.moving){const gate=Math.hypot(p.x-298,p.y-465);if(gate<24)p.lift=Math.max(p.lift,Math.sin((1-gate/24)*Math.PI/2)*29);}}
 const bus=e.bus,oldBus={x:bus.x,y:bus.y};if(bus.phase==='away'&&t>=bus.next){bus.phase='arrive';bus.at=t;w.metrics.bus++;}let bq=t-bus.at;if(bus.phase==='arrive'){bus.x=lerp(1240,908,clamp(bq/11,0,1));bus.y=lerp(506,484,clamp(bq/11,0,1));if(bq>=11){bus.phase='stop';bus.at=t;}}
 else if(bus.phase==='stop'){bus.x=908;bus.y=484;bus.door=clamp(bq/1.3,0,1)*(1-clamp((bq-23)/2,0,1));if(bq>26){bus.phase='depart';bus.at=t;}}
 else if(bus.phase==='depart'){bus.x=lerp(908,1240,clamp(bq/11,0,1));bus.y=lerp(484,506,clamp(bq/11,0,1));bus.door=0;if(bq>11){bus.phase='away';bus.next=t+70+w.rng()*55;}}
 if(['arrive','depart'].includes(bus.phase)){const blockers=[p,...w.npcs.filter(n=>!n.hidden&&!['bus','swimmer','bed','angel'].includes(n.role))].filter(n=>(bus.phase==='arrive'?n.x<oldBus.x:n.x>oldBus.x)&&Math.abs(n.x-bus.x)<117&&n.y>bus.y-31&&n.y<bus.y+21);if(blockers.length){bus.x=oldBus.x;bus.y=oldBus.y;bus.at+=dt;for(const n of blockers){if(n===p||t<(n.giveWayUntil||0))continue;n.giveWayUntil=t+7;n.next=t+7;setPath(w,n,nearest({x:Math.min(n.x,780),y:514})||n);}}}

 const exam=e.exam;if(!exam.active&&t>=exam.next){exam.active=true;exam.start=t;exam.end=t+24;w.metrics.exam++;}if(exam.active&&t>=exam.end){exam.active=false;exam.next=t+95+w.rng()*90;for(const n of w.npcs.filter(n=>['scholar','festival'].includes(n.role))){n.managed=false;wander(w,n,75);n.next=t+14;}}
 if(e.airship.active&&t-e.airship.start>60){e.airship.active=false;e.airship.next=t+100+w.rng()*85;}if(!e.airship.active&&t>e.airship.next){e.airship.active=true;e.airship.start=t;}
 if(!e.dolphin.active&&t>e.dolphin.next){e.dolphin.active=true;e.dolphin.start=t;}if(e.dolphin.active&&t-e.dolphin.start>10){e.dolphin.active=false;e.dolphin.next=t+35+w.rng()*55;}
 if(!e.slide.active&&t>=e.slide.next&&!p.action){const id=e.slide.queue.shift(),n=w.npcs.find(n=>n.id===id);e.slide.active={id:n.id,start:t,from:{x:n.x,y:n.y}};e.slide.next=t+19+w.rng()*18;w.metrics.slides++;}if(e.slide.active&&e.slide.active.id!=='player'&&t-e.slide.active.start>12){e.slide.queue.push(e.slide.active.id);e.slide.active=null;}
 for(const n of w.npcs){const visible=Math.abs(n.x-view.x)<view.w/2+90&&Math.abs(n.y-view.y)<view.h/2+100;if(!visible&&t<n.farAt)continue;const ndt=visible?dt:Math.min(1.5,t-n.last);n.last=t;n.farAt=t+1.5;visible?w.metrics.near++:w.metrics.far++;
 n.hidden=false;n.managed=false;
 if(n.role==='angel'){n.x=800+Math.sin(t*.013)*240;n.y=180+Math.sin(t*.038)*90;n.hidden=(t%150)>75;n.lift=Math.sin(t*.7)*4;continue;}
 if(n.role==='picker'&&n.id===6){const q=(t+n.phase)%110;if(q>29&&q<77){n.path=[];n.managed=true;n.state='climb';let a;if(q<39)a=routeSample([[247,313],[180,326],[123,332],[77,329]],(q-29)/10);else if(q<51)a=routeSample([[77,329],[79,232]],(q-39)/12);else if(q<59)a={x:79,y:232};else if(q<69)a=routeSample([[79,232],[77,329]],(q-59)/10);else a=routeSample([[77,329],[123,332],[180,326],[247,313]],(q-69)/8);Object.assign(n,a);n.pose=q>=39&&q<69?3:1;n.lift=0;continue;}if(n.state==='climb'){Object.assign(n,n.home);n.state='idle';n.next=t+8;}}
 if(n.role==='swimmer'){n.x=n.home.x+Math.sin(t*.13+n.id)*7;n.y=n.home.y+Math.cos(t*.16+n.id)*5;n.state=t<n.reactUntil?'wave':(t+n.phase)%23<7?'splash':'swim';n.pose=4;n.lift=0;continue;}
 if(n.role==='bed'){if(t>=n.next)activity(w,n);n.path=[];n.x=n.state==='window'?639:628;n.y=n.state==='window'?382:n.state==='sleep'?391:406;n.pose=n.state==='sleep'?5:n.state==='window'?3:4;continue;}
 if(n.role==='craft'){const cycle=Math.floor(t/43),seat=cycle%2===(n.id%2),q=t%43;if(seat&&q<34){if(n.craftCycle!==cycle){n.craftCycle=cycle;n.craftFrom={x:n.x,y:n.y};}n.managed=true;n.path=[];if(q<5){Object.assign(n,routeSample([[n.craftFrom.x,n.craftFrom.y],[268,818],[163,835]],q/5));n.pose=1;n.state='craft-enter';n.moving=true;}else if(q<29){n.x=163;n.y=835;n.pose=7;n.state='craft';n.moving=false;}else{Object.assign(n,routeSample([[163,835],[268,818],[271,873]],(q-29)/5));n.pose=2;n.state='craft-leave';n.moving=true;}continue;}else if(['craft','craft-enter','craft-leave'].includes(n.state)){n.x=271;n.y=873;n.state='walk';n.next=t+7;wander(w,n,35);}}
 if(n.role==='seabuddy'){const d=e.dolphin;if(d.active){const q=t-d.start;let at;n.state='sea-play';n.managed=true;n.path=[];if(q<3){at=routeSample([[n.home.x,n.home.y],[585,1174],[521,1211]],q/3);n.seaWater=q>1;}else if(q<7){const wave=q%5/5;n.seaWater=false;at={x:500+Math.sin(q*.35)*75,y:1225-Math.sin(wave*Math.PI)*53-34};n.seaRide=true;}else{at=routeSample([[500+Math.sin(7*.35)*75,1225],[521,1211],[585,1174],[n.home.x,n.home.y]],(q-7)/3);n.seaRide=false;n.seaWater=q<9;}n.x=at.x;n.y=at.y;n.pose=4;n.lift=0;continue;}else if(n.state==='sea-play'){Object.assign(n,n.home);n.seaRide=false;n.seaWater=false;n.state='idle';n.next=t+7;}}

 if(n.role==='toilet'){const q=(t+n.phase)%105;if(q>47&&q<65){n.hidden=true;n.path=[];n.state='toilet';continue;}if(q>38&&q<47&&n.state!=='toilet-walk'){setPath(w,n,{x:919,y:917});n.state='toilet-walk';n.next=t+15;}}
 if(n.role==='queue'){n.managed=true;n.pose=0;const qi=e.slide.queue.indexOf(n.id);if(qi>=0)n.home=w.queueHomes[qi]||n.home;const a=e.slide.active;if(a?.id===n.id){const q=(t-a.start)/12,j=slideJourney(n.home,q);n.state='slide';n.moving=false;n.path=[];n.x=j.x;n.y=j.y;n.slideStage=j.stage;n.lift=j.stage==='climb'?Math.abs(Math.sin(t*6+n.id))*2:0;continue;}if(n.state==='slide'){Object.assign(n,n.home);n.slideStage=null;n.state='queue';}if(!n.path.length&&dist(n,n.home)>3)setPath(w,n,n.home);n.state=t<n.reactUntil?'look':'queue';}
 if(n.role==='bus'){n.managed=true;const k=n.id%3;n.state='wait';if(bus.phase==='stop'){const q=t-bus.at;if(k<2){const f=clamp((q-2-k*3)/4,0,1);n.hidden=q<2+k*3;n.x=lerp(938,n.home.x,f);n.y=lerp(465,n.home.y,f);n.path=[];n.state='alight';n.moving=f>0&&f<1;continue;}else if(q>13){const f=clamp((q-13)/8,0,1);n.x=lerp(n.home.x,938,f);n.y=lerp(n.home.y,465,f);n.hidden=f>=1;n.state='board';n.path=[];n.moving=f<1;continue;}}else if(bus.phase==='depart'){n.hidden=k===2;}else if(bus.phase==='arrive'){n.hidden=k<2;if(k===2)Object.assign(n,n.home);}else if(bus.phase==='away'){n.hidden=false;if(n.state!=='walk'&&t>=n.next){wander(w,n,25);n.next=t+15;}}}

 if(exam.active&&['scholar','festival'].includes(n.role)){n.managed=true;const k=n.role==='scholar'?0:n.id%4+1;const goals=[[575,697],[551,685],[598,691],[625,708],[604,728]],target=nearest(point(goals[k]));if(!n.examJoined){n.examJoined=true;setPath(w,n,target);}n.pose=k?6:6;n.state=k?'celebrate':'exam';}else n.examJoined=false;
 if(!n.managed&&t>=n.next&&t>n.reactUntil)activity(w,n);
 if(n.state==='chase'&&t>n.chaseAt){const friend=w.npcs[n.peer];if(friend)setPath(w,n,friend);n.chaseAt=t+1.2;}let speed=n.state==='chase'?44:n.speed;if(n.role==='scooter'&&(dist(n,p)<75||w.npcs.some(o=>o!==n&&dist(n,o)<40)))speed*=.42;
 move(n,ndt,speed,true,w);if(visible&&!n.managed&&dist(n,p)<21){const d=dist(n,p)||1,x=n.x+(n.x-p.x)/d*.6,y=n.y+(n.y-p.y)/d*.6;if(walkable(x,y)&&(['flower','picker','pigfriend'].includes(n.role)||roadDistance({x,y})<5)){n.x=x;n.y=y;}}if(visible&&!n.managed&&n.role!=='craft')for(const o of w.npcs){if(o===n||o.hidden||['bed','swimmer','angel'].includes(o.role))continue;const d=dist(n,o);if(d>0&&d<22){const push=Math.min(.55,(22-d)*.12),x=n.x+(n.x-o.x)/d*push,y=n.y+(n.y-o.y)/d*push;if(walkable(x,y)&&(['flower','picker','pigfriend'].includes(n.role)||roadDistance({x,y})<5)){n.x=x;n.y=y;}}}n.lift=n.moving?Math.abs(Math.sin(t*8+n.phase))*1.6:n.state==='celebrate'?Math.max(0,Math.sin(t*5+n.phase))*6:0;
 }
 if(t>w.reactionAt){w.reactionAt=t+2+w.rng()*2;if(w.npcs.filter(n=>n.reactUntil>t).length<2){const candidates=w.npcs.filter(n=>!n.hidden&&!['slide','climb'].includes(n.state)&&!['angel','bed','craft','bus','seabuddy','scooter'].includes(n.role)&&n.cooldown<t&&dist(n,p)<85),n=candidates[Math.floor(w.rng()*candidates.length)];if(n&&w.rng()<.7){n.reactUntil=t+4+w.rng()*4;n.cooldown=t+38+w.rng()*25;n.dir=p.x<n.x?-1:1;const r=w.rng();if(n.role==='swimmer'){n.state='wave';}else if(n.role==='queue'){n.state='look';}else if(r<.22){n.state='follow';setPath(w,n,nearest({x:p.x+22,y:p.y+8})||n);}else if(r<.34){n.state='shy';const d=dist(n,p)||1;setPath(w,n,nearest({x:n.x+(n.x-p.x)/d*45,y:n.y+(n.y-p.y)/d*45})||n);}else{n.state='look';n.path=[];n.pose=n.role==='flower'?4:n.pose;}}}}
 for(const a of w.animals){const q=(t+a.phase)%48;a.state=q<22?'rest':q<30?'sniff':q<42?'walk':'rest';const r=q<30?0:q<42?(q-30)/12:1;a.x=a.home.x+Math.sin(r*Math.PI)*17;a.y=a.home.y+Math.sin(r*Math.PI)*5;}
 for(const f of w.fish){if(t>f.next){f.dir*=-1;f.next=t+10+w.rng()*22;}f.x+=f.dir*f.speed*dt;f.y+=Math.sin(t*.3+f.phase)*dt*1.5;if(f.x<50){f.x=50;f.dir=1;}if(f.x>700){f.x=700;f.dir=-1;}}
}
function nearestZone(p){let best=null;for(const z of zones){const d=dist(p,z);if(d<z.r&&(!best||d<best.distance))best={...z,distance:d};}return best;}
const api={W,H,CELL,COLS,ROWS,paths,fields,blocks,zones,walkable,lineClear,nearest,findPath,animalFootprints,roadPoint,roadDistance,create,go,enterAction,step,busBlocks,slide,slideJourney,nearestZone,random,clamp,lerp,inPoly};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.FrogVillageWorld=api;
})(typeof globalThis!=='undefined'?globalThis:this);
