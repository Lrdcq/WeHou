//-----------------------------
//---------wehou_core----------
//-----------v 0.21------------
//----------by lrdcq-----------
//-----------------------------
var WEHOUCORE={}

WEHOUCORE.w=500;
WEHOUCORE.h=550;
WEHOUCORE.time=0;
WEHOUCORE.cheat=0;
WEHOUCORE.lmpos=new THREE.Vector2(0,-270);
WEHOUCORE.bspos=[new THREE.Vector2(0,-350),new THREE.Vector2(0,-350),new THREE.Vector2(0,-350)];
WEHOUCORE.bshit=[-1,-1,-1];
WEHOUCORE.webgl={};
WEHOUCORE.gameover=0;
WEHOUCORE.deal={}
WEHOUCORE.deal.graze=function(){}
WEHOUCORE.deal.hit=function(){WEHOUCORE.gameover=1;}
WEHOUCORE.deal.cheathit=function(){}
WEHOUCORE.deal.hitting=function(){}
WEHOUCORE.nowstory={};//当前故事对象
WEHOUCORE.noweffect={};//当前特效对象
WEHOUCORE.nowself={};//当前自机组对象
WEHOUCORE.randomseed=new Date().getTime()%1000000;
WEHOUCORE.randomuse=0;
WEHOUCORE.imglist=[];
WEHOUCORE.regimg=function(name){
	WEHOUCORE.imglist.push(name);
	return name;
}
WEHOUCORE.zcount=2;
WEHOUCORE.zcounter=function(z){
	if(z){WEHOUCORE.zcount=z;}
	else{WEHOUCORE.zcount+=1;}
	return WEHOUCORE.zcount;
}
WEHOUCORE.random=function(){
	var tp=WEHOUCORE.randomseed+WEHOUCORE.randomuse*178279;
	tp=(tp/1000)*(tp%1000);
	var tp=tp%1000/1000;
	WEHOUCORE.randomuse++;
	if(WEHOUCORE.randomuse>100){WEHOUCORE.randomuse=0;}
	return tp;
}
WEHOUCORE.initcoreenv=function(dom){
	var width = dom.clientWidth;
	var height = dom.clientHeight;
	WEHOUCORE.webgl.renderer=new THREE.WebGLRenderer({antialias:true});
	WEHOUCORE.webgl.renderer.setSize(width, height);
	dom.appendChild(WEHOUCORE.webgl.renderer.domElement);
	WEHOUCORE.webgl.camera=new THREE.OrthographicCamera(-WEHOUCORE.w/2,WEHOUCORE.w/2,WEHOUCORE.h/2,-WEHOUCORE.h/2,-60000,60000);
	WEHOUCORE.webgl.scene=new THREE.Scene();
}
WEHOUCORE.a2a=function(v1,a){
	var v2=new THREE.Vector2(); 
	v2.x=v1.x * Math.cos(a) - v1.y * Math.sin(a);
	v2.y=v1.x * Math.sin(a) + v1.y * Math.cos(a);
	return v2;
}
WEHOUCORE.p2p=function(v1,v2,d,nc){
	if(d<=0){return 0;}
	var v=(v1.x-v2.x)*(v1.x-v2.x)+(v1.y-v2.y)*(v1.y-v2.y);
	if(d==9999){
		return Math.sqrt(v);
	}else{
		if(!nc&&(v<d*d+200)){
			WEHOUCORE.deal.graze();
			if(v>d*d){return 2;}
			else{return 1;}
		}
		if(v>d*d){return 0;}
		else{return 1;}
	}
}
WEHOUCORE.p2l=function(p,n1,n2,d){
	var a=WEHOUCORE.p2p(p,n1,9999,1),b=WEHOUCORE.p2p(p,n2,9999,1),c=WEHOUCORE.p2p(n2,n1,9999,1),ds=0;
	if(a*a>=b*b+c*c){ds=b}
	else if(b*b>=a*a+c*c){ds=a}
	else{
		var s=(a+b+c)/2;
		s=Math.sqrt(s*(s-a)*(s-b)*(s-c));
		ds=2*s/c;
	}
	if(d){
		if(ds>d){return 0;}
		else{return 1;}
	}else{
		return ds;
	}
}
WEHOUCORE.slowmove=[];
WEHOUCORE.slowmove[0]=function(t,b,c,d){//缓进缓出
	if ((t/=d/2) < 1) return c/2*t*t*t + b;
	return c/2*((t-=2)*t*t + 2) + b;
}
WEHOUCORE.slowmove[1]=function(t,b,c,d){//线性
	return c*t/d + b; 
}
WEHOUCORE.slowmove[2]=function(t,b,c,d){//缓出
	return c*((t=t/d-1)*t*t + 1) + b;
}
WEHOUCORE.slowmove[3]=function(t,b,c,d,s){//折返出
	if (s == undefined) s = 1.70158;
	return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
}
//
WEHOUCORE.canvas2mesh=function(canvas,w,h,opt){
	var tmesh=new THREE.Mesh(new THREE.PlaneGeometry(w||canvas.width,h||canvas.height,0,0),new THREE.MeshBasicMaterial({map:new THREE.Texture(canvas),transparent:true,depthWrite:false,depthTest:false}));
	tmesh.material.map.needsUpdate = true;
	return tmesh;
}
//class
//图片集合
WEHOUCORE.imgSet=function(){
	this.l=new Array();
}
WEHOUCORE.imgSet.prototype.add=function(imglist,bl,al,isn,issdr){
	for(var i=0;i<imglist.length;i++){
		WEHOUCORE.imglist.push(imglist[i]);
		var tx=THREE.ImageUtils.loadTexture(imglist[i]);
		if(isn){tx.minFilter=THREE.NearestFilter;}
		if(issdr){var c=new THREE.MeshBasicMaterial({ map:THREE.ImageUtils.loadTexture(imglist[i])});
		}else{
			var c=new THREE.ShaderMaterial({//默认shader
				uniforms:{texture1:{type:'t',value:tx}},
				vertexShader:
				'varying vec2 vUv;'+
				'varying float alphas;'+
				'void main(){'+
				'	vUv=uv;'+
				'	mat4 mv=modelMatrix;'+
				'	alphas=mv[2][2];'+
				'	if(mv[0][2]>0.0){'+
				'		vUv.x=vUv.x+mv[0][2]*floor(mv[2][0]);'+
				'		vUv.y=vUv.y-mv[0][2]*floor(mv[2][1]);'+
				'	}else if(mv[0][2]<0.0){'+
				'		vUv.x=fract(mv[2][0])+fract(mv[2][1])-vUv.x;'+
				'		vUv.x=vUv.x-mv[0][2]*floor(mv[2][0]);'+
				'		vUv.y=vUv.y+mv[0][2]*floor(mv[2][1]);'+
				'	}'+
				'	mv[0][2]=0.0;'+//UV移动距离 2
				'	mv[2][0]=0.0;'+//水平移动次数 8
				'	mv[2][1]=0.0;'+//垂直移动次数 9
				'	gl_Position=projectionMatrix*mv*vec4(position,1.0);'+
				'}',
				fragmentShader:
				'uniform sampler2D texture1;'+
				'varying vec2 vUv;'+
				'varying float alphas;'+
				'void main(){'+
				'	vec2 uv=vUv;'+
				'	vec4 fc=texture2D(texture1,uv);'+
				'	fc[3]=fc[3]*alphas;'+
				'	gl_FragColor=fc;'+
				'}'
			});
		}
		c.transparent=true;
		if(bl==1){
			c.blending=THREE.AdditiveBlending;
		}else if(bl==2){
			c.blending=THREE.SubtractiveBlending;
		}
		var t=new Array();
		t.push(c);
		this.l.push(c);
	}
}
//Shader图片集合
WEHOUCORE.shaderSet=function(){
	this.l=new Array();
}
WEHOUCORE.shaderSet.prototype.add=function(rule,act,isb){
	var t=new THREE.ShaderMaterial(rule);
	t.transparent=true;
	if(isb){t.blending=THREE.AdditiveBlending;}
	if(act){t.action=act;}
	this.l.push(t);
	return this.l.length-1;
}
WEHOUCORE.shaderSet.prototype.deal=function(){
	for(var i=0;i<this.l.length;i++){
		if(this.l[i].action){this.l[i].action(this.l[i].uniforms);}
	}
}
//片面集合
WEHOUCORE.planeSet=function(){
	this.l=new Array();
}
WEHOUCORE.planeSet.prototype.add=function(w,h,img,z){
	var pg=new THREE.PlaneGeometry(w,h,0,0);
	if(z){
		if(z.d){pg.d=z.d;}
		pg.cut=[0,1];
		if(z.cut&&z.cut.length==4){
			pg.cut=[z.cut[1],z.cut[0]-z.cut[1]];
			pg.faceVertexUvs[0][0][0].u=pg.faceVertexUvs[0][0][1].u=z.cut[0];
			pg.faceVertexUvs[0][0][2].u=pg.faceVertexUvs[0][0][3].u=z.cut[1];
			pg.faceVertexUvs[0][0][0].v=pg.faceVertexUvs[0][0][3].v=z.cut[2];
			pg.faceVertexUvs[0][0][1].v=pg.faceVertexUvs[0][0][2].v=z.cut[3];
			if(z.rt){
				pg.faceVertexUvs[0][0][1].u=pg.faceVertexUvs[0][0][2].u=z.cut[0];
				pg.faceVertexUvs[0][0][0].u=pg.faceVertexUvs[0][0][3].u=z.cut[1];
				pg.faceVertexUvs[0][0][0].v=pg.faceVertexUvs[0][0][1].v=z.cut[2];
				pg.faceVertexUvs[0][0][2].v=pg.faceVertexUvs[0][0][3].v=z.cut[3];
			}
		}
		if(z.end&&z.end!=0){
			pg.vertices[2].y-=pg.vertices[0].y;pg.vertices[0].y=0;
			pg.vertices[3].y-=pg.vertices[1].y;pg.vertices[1].y=0;
		}
		if(z.rep!=1){
			var ef=0;
			if(z.rep>8){z.rep/=3;ef=1;}
			pg.rep=[z.rep,Math.abs(z.cut[0]-z.cut[1]),ef,z.cut[0],z.cut[1]];
		}
	}
	var ms=new THREE.Mesh(pg,img);
	this.l.push(ms);
	return this.l.length-1;
}
//发射器集合
WEHOUCORE.bberSet=function(){
	this.l=new Array();
}
WEHOUCORE.bberSet.prototype.add=function(parent,zz,x){
	var gox=x||1;
	this.l.push(new WEHOUCORE['Bb'+gox](parent,zz));
}
//敌方轨迹集合
WEHOUCORE.lineSet=function(ms,bl){
	this.l=new Array();
	this.bl=bl;
	this.bl.parent=this;
	this.st=new Array();
	this.ms=ms.mesh||null;
	this.delms=(ms.delmesh==undefined)?true:ms.delmesh;
	if(this.ms==null){this.delms=false;}
	this.slx=ms.slowx||0;
	this.sly=ms.slowy||0;
	this.hit=(ms.hit==undefined)?99999:ms.hit;
	this.hit_dis=(ms.hit_dis==undefined)?60:ms.hit_dis;
	this.k_dis=ms.kick_dis||0;
	if(!this.ms){this.ms={};this.ms.position=new THREE.Vector2()}
	this.times=0;
	this.alltimes=0;
	this.player=ms.player||'act';
	this.lt=new THREE.Vector2();
	this.eve=ms.reload||[];
}
WEHOUCORE.lineSet.prototype.addline=function(la){
	this.l=this.l.concat(la);
}
WEHOUCORE.lineSet.prototype.addst=function(la){
	this.st=this.st.concat(la);
}
WEHOUCORE.lineSet.prototype.gogogo=function(bx,isb){
	if(this.alltimes&&(this.alltimes==this.l[this.l.length-1])){
		this.st=[[]];
		this.l=[0,new THREE.Vector2(-9998,-9998),new THREE.Vector2(0,0),50,new THREE.Vector2(-500,400),new THREE.Vector2(0,0),0];
		this.t=null;
		this.times=0;
	}
	for(var i=0;i<this.eve.length;i++){
		if(this.eve[i][0]=='h'?this.ms.hit<this.eve[i][1]:
		this.eve[i][0]=='t'?this.alltimes>=this.eve[i][1]:
		0){
			this.st=this.eve[i][2];
			this.eve[i][1]=this.eve[i][0]=='h'?-1000:100000;
		}
	}
	if(isb){
		for(var i=3;i<this.l.length-2;i+=3){
			if(this.times>=this.l[i-3]&&this.times<this.l[i]){
				if(this.times==this.l[i-3]){
					this.t=this.t||new THREE.Vector2(this.l[1].x==-9998?this.ms.position.x:this.l[1].x,this.l[1].y==-9998?this.ms.position.y:this.l[1].y);
					this.lt.x=this.t.x;
					this.lt.y=this.t.y;
					this.t.x=(this.l[i+1].x==-9999)?((Math.abs(WEHOUCORE.lmpos.x)<=(WEHOUCORE.w/2-80))?WEHOUCORE.lmpos.x:Math.abs(WEHOUCORE.lmpos.x)/WEHOUCORE.lmpos.x*(WEHOUCORE.w/2-80)):(this.l[i+1].x==-9998)?this.lt.x:this.l[i+1].x;
					this.t.y=(this.l[i+1].y==-9999)?((Math.abs(WEHOUCORE.lmpos.y)<=(WEHOUCORE.h/2-80))?WEHOUCORE.lmpos.y:Math.abs(WEHOUCORE.lmpos.y)/WEHOUCORE.lmpos.y*(WEHOUCORE.h/2-80)):(this.l[i+1].y==-9998)?this.lt.y:this.l[i+1].y;
					if(this.l[i+2]){
						this.t.x+=-WEHOUCORE.random()*(this.l[i+2].x+5)+this.l[i+2].x/2;
						this.t.y+=-WEHOUCORE.random()*(this.l[i+2].y+5)+this.l[i+2].y/2;
					}
				}
				var t=this.st[(i-3)/3];
				var nowx=WEHOUCORE.slowmove[this.slx](this.times-this.l[i-3],this.lt.x,this.t.x-this.lt.x,this.l[i]-this.l[i-3]);
				var nowy=WEHOUCORE.slowmove[this.sly](this.times-this.l[i-3],this.lt.y,this.t.y-this.lt.y,this.l[i]-this.l[i-3]);
				this.ms.position.set(nowx,nowy,WEHOUCORE.zcounter());
				WEHOUCORE.bspos[bx].x=nowx;WEHOUCORE.bspos[bx].y=nowy;
				for(var j=0;j<t.length;j++){
					this.bl.l[t[j]].p.x=this.bl.l[t[j]].pl?this.bl.l[t[j]].gp.x+nowx:(this.bl.l[t[j]].gp.x>10000?this.bl.l[t[j]].gp.x-20000+WEHOUCORE.lmpos.x:this.bl.l[t[j]].gp.x);
					this.bl.l[t[j]].p.y=this.bl.l[t[j]].pl?this.bl.l[t[j]].gp.y+nowy:(this.bl.l[t[j]].gp.y>10000?this.bl.l[t[j]].gp.y-20000+WEHOUCORE.lmpos.y:this.bl.l[t[j]].gp.y);
					this.bl.l[t[j]].bread();
				}
				break;
			}
		}
	}
	for(var i=0;i<this.bl.l.length;i++){
		this.bl.l[i].going(bx*50+i+2);
	}
	if(this.k_dis&&WEHOUCORE.p2p(WEHOUCORE.bspos[bx],WEHOUCORE.lmpos,this.k_dis,1)){
		WEHOUCORE.deal.hit();
	}
	if(this.ms[this.player]){
		this.ms[this.player](this.alltimes);
	}
	this.times++;
	this.alltimes++;
	if(this.times>this.l[this.l.length-4]){
		this.times=0;
	}
}
WEHOUCORE.lineSet.prototype.show=function(){
	if(this.ms){
		WEHOUCORE.webgl.scene.add(this.ms);
		this.ms.hit=this.hit;
		this.ms.hit_dis=this.hit_dis;
		if(this.ms.hit){WEHOUCORE.nowself.addHiter(this.ms);
		}else{WEHOUCORE.nowself.delHiter(this.ms);}
	}
}
WEHOUCORE.lineSet.prototype.clear=function(p){
	for(var i=0;i<this.bl.l.length;i++){
		this.bl.l[i].clear(this.ms.position,800,p);
	}
}
WEHOUCORE.lineSet.prototype.clean=function(){
	for(var i=0;i<this.bl.l.length;i++){
		this.bl.l[i].clean();
	}
	if(this.delms){
		WEHOUCORE.webgl.scene.remove(this.ms);
		if(this.ms.hit){WEHOUCORE.nowself.delHiter(this.ms);}
		this.ms.deallocate();
	}
}
//自机弹幕组
WEHOUCORE.selfSet=function(){
	this.l=new Array();
	this.useGroup=0;
	this.hitlist=[];
	WEHOUCORE.nowself=this;
}
WEHOUCORE.selfSet.prototype.add=function(z2){
	var myberlist=new WEHOUCORE.bberSet();
	for(var i=0;i<z2.length;i++){
		myberlist.add(myberlist,z2[i]);
	}
	this.l.push(myberlist);
}
WEHOUCORE.selfSet.prototype.addHiter=function(ms){
	this.hitlist.push(ms);
}
WEHOUCORE.selfSet.prototype.delHiter=function(ms){
	var index=this.hitlist.indexOf(ms);
	if(index!==-1){this.hitlist.splice(index,1);}
}
WEHOUCORE.selfSet.prototype.runGroup=function(){
	var ul=this.l[this.useGroup];
	for(var j=0;j<ul.l.length;j++){
		if(WEHOUGAME.kd[5]){
			ul.l[j].p.x=ul.l[j].gp.x+WEHOUCORE.lmpos.x;
			ul.l[j].p.y=ul.l[j].gp.y+WEHOUCORE.lmpos.y;
			ul.l[j].bread();
		}
		ul.l[j].going(1);
	}
}
//特效组
WEHOUCORE.effectSet=function(){
	this.l=new Array();
	this.useGroup=0;
	this.pushlist=[];
	WEHOUCORE.noweffect=this;
}
WEHOUCORE.effectSet.prototype.add=function(z2){
	var myberlist=new WEHOUCORE.bberSet();
	for(var i=0;i<z2.length;i++){
		myberlist.add(myberlist,z2[i],2);
	}
	this.l.push(myberlist);
}
WEHOUCORE.effectSet.prototype.push=function(id,d){
	this.pushlist.push([id,d.x,d.y]);
}
WEHOUCORE.effectSet.prototype.runGroup=function(){
	var ul=this.l[this.useGroup];
	for(var j=0;j<this.pushlist.length;j++){
		var id=this.pushlist[j][0];
		ul.l[id].p.x=this.pushlist[j][1];
		ul.l[id].p.y=this.pushlist[j][2];
		ul.l[id].ot=0;
		ul.l[id].bread();
	}
	for(var j=0;j<ul.l.length;j++){
		ul.l[j].going(1);
	}
	this.pushlist=[];
}
//全局故事集合
WEHOUCORE.storySet=function(n){
	this.name=n;
	this.l=new Array();
	this.s=new Array();
	this.t=0;
	this.at=0;
	this.p=0;
	this.self=new WEHOUCORE.selfSet();//自机弹幕
	this.effect=new WEHOUCORE.effectSet();//特效组
}
WEHOUCORE.storySet.prototype.setName=function(n){
	this.name=n;
}
WEHOUCORE.storySet.prototype.add=function(z1,z2,z3,z4){
	var myberlist=new WEHOUCORE.bberSet();
	for(var i=0;i<z2.length;i++){
		myberlist.add(myberlist,z2[i]);
	}
	var mylinlist=new WEHOUCORE.lineSet(z1,myberlist);
	mylinlist.addline(z3);
	mylinlist.addst(z4);
	this.l.push(mylinlist);
}
WEHOUCORE.storySet.prototype.adds=function(s){
	this.s.push(s);
}
WEHOUCORE.storySet.prototype.actlist=new Array();
WEHOUCORE.storySet.prototype.deal=function(){
	WEHOUCORE.zcounter(2);
	WEHOUCORE.nowstory=this;
	var ns=this.s[this.p];
	var timex=ns.time+30;
	if(ns.group){
		for(var j=0;j<ns.group.length;j++){
			var g=this.l[ns.group[j]];
			if(this.t==0){
				g.show();
				g.gogogo(j,true);
			}else if(this.t==timex-1){
				g.clean();
				WEHOUGAME.slowtime=1;
				WEHOUCORE.bshit[j]=-2;
			}else if(this.t>=timex-30){
				if(ns.circleclear){
					g.clear(1-(timex-this.t)/30);
					WEHOUGAME.slowtime=4;
					WEHOUGAME.mainstory.effect.push(1,WEHOUCORE.bspos[0]);
				}else{
					g.clear(1.2);
				}
				g.gogogo(j,false);
				WEHOUCORE.bshit[j]=-1;
			}else{
				g.gogogo(j,true);
				if((!ns.bt)&&g.ms&&g.ms.hit_dis){
					WEHOUCORE.bshit[j]=g.ms.hit/g.hit;
					if(g.ms.hit<=0){
						g.ms.hit=g.hit;
						this.storyCT('jumpnext');
						WEHOUCORE.bshit[j]=-3;
					}
				}
			}
		}
	}
	this.self.runGroup();
	this.effect.runGroup();
	if(ns.act){
		for(var j=0;j<ns.act.length;j+=2){
			if(ns.act[j]==9999){
				WEHOUCORE.lmpos.x=9999;
				WEHOUCORE.gameover=1;
			}else{
				this.actlist[ns.act[j]](ns.act[j+1],this.at,ns.time);
			}
		}
	}
	if(this.at<ns.time){this.at++;}
	if(!ns.statics){this.t++;}else{this.t=1;}
	if(this.t==timex){this.p++;this.t=0;this.at=0;}
}
WEHOUCORE.storySet.prototype.storyCT=function(act){
	if(act=='jumpnext'){
		this.at=this.t=this.s[this.p].time;
		this.s[this.p].statics=false;
	}
}
//弹幕个体
WEHOUCORE.Ball=function(meshs,t,v,va,a,bb,al,val,s,vs){
	this.ms=meshs;
	this.ms.addMatrix=new THREE.Matrix4(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);
	if(this.ms.geometry&&this.ms.geometry.rep){this.ms.adsta=0;}
	this.bp=new THREE.Vector2(this.ms.position.x,this.ms.position.y);
	this.t=new THREE.Vector2(t.x-this.bp.x,t.y-this.bp.y);
	var ds=Math.sqrt((this.t.x)*(this.t.x)+(this.t.y)*(this.t.y));
	this.t.x=(this.t.x)*this.tdis/ds+this.bp.x;
	this.t.y=(this.t.y)*this.tdis/ds+this.bp.y;
	this.v=v;
	this.va=va;
	this.a=a;
	this.btime=0;
	this.bb=bb||[];
	this.gz=0;
	this.alpha=al||1;
	this.valpha=val||0;
	this.vsize=vs||new THREE.Vector2(0,0);
	if(s){
		this.ms.scale.x=s.x;this.ms.scale.y=s.y;
	}
}
WEHOUCORE.Ball.prototype.tdis=3600;
//复杂弹幕发射器
WEHOUCORE.Bb1=function(parent,z){
	this.parent=parent;
	/*
	弹幕类型
	ball    普通敌机弹幕
	laser   敌机直线固体激光
	line    曲线激光
	self    自机弹幕
	enemy   敌机
	运动模式
	normal 正常的(点->目标->旋转)
	gravity 重力的(点->力)
	mesh 3D的(点->嵌入3D框架)
	*/
	this.type=z.type||'ball';//弹幕类型
	this.motion=z.motion||'normal';//运动模式
	if(this.type=='line'){
		this.lmat=z.linematerial||null;//激光材质
		this.cut=z.materialcut||[0,1];//材质切片
		this.llong=z.linelong||50;//激光长度
		this.ms=null;
		this.aptime=z.appeartime||0;
	}else if(this.type=='laser'){
		this.ms=z.mesh||null;//ms;//形状指针
		var gg=this.ms.geometry?this.ms.geometry:this.ms[0].geometry;
		this.longl=Math.abs(gg.vertices[2].y);
		this.shortl=Math.abs(gg.vertices[0].x)*2;
		this.att=(z.appearline==undefined)?30:z.appearline;//提示线
		if(this.att<=10){this.att=0}
		this.rnum=z.numberrandom||0;//rnum;//随机度
		this.rat=1;
	}else{
		this.ms=z.mesh||null;//ms;//形状指针
		this.rnum=z.numberrandom||0;//rnum;//随机度
		this.rat=(z.rotating==undefined)?1:z.rotating;//rat;
		this.outer=z.outfield||false;//outer;
		if(this.type=='self'){
			this.dmg=z.damage;//自机子弹威力
			this.islaser=z.likelaser||0;
			if(this.islaser){
				var gg=this.ms.geometry?this.ms.geometry:this.ms[0].geometry;
				this.longl=Math.abs(gg.vertices[2].y);
				this.shortl=Math.abs(gg.vertices[0].x)*2;
			}
		}else if(this.type=='enemy'){
			this.hit=z.hitblood||40;
			this.hit_dis=z.hitdistance||20;
		}
	}
	if(this.motion!='mesh'){
		this.gp=z.position||new THREE.Vector2(0,0);//gp;//发射器位置
		this.p=new THREE.Vector2();
		this.rp=z.positionrandom||new THREE.Vector2(0,0);//rp;//位置随机度
		this.pl=(z.positionlock===undefined)?true:z.positionlock;//位置相对觉对
		this.v=z.speed||[3]//v;//速度
		this.ve=z.speedchange||[0,0]//ae;//每次偏移速度
		this.rv=z.speedrandom||0//rv;//随机度
		this.t=z.target||WEHOUCORE.lmpos;//t;//new THREE.Vector2();
		if(this.t.x==29999&&this.t.y==29999){this.t.x=WEHOUCORE.lmpos.x;this.t.y=WEHOUCORE.lmpos.y;}
		this.rt=z.targetrandom||0;//rt;//目标随机度
		if(this.motion=='normal'){
			this.va=z.palstance||[0]//va;//偏移度
			this.a=z.acceleration||[0]//a;//加速度
			this.rva=z.palstancerandom||0//rva;//随机度
			this.rvauto=z.autopalstance||false;
		}else if(this.motion=='gravity'){
			this.g=z.gravity||new THREE.Vector2(0,-0.03);//重力加速度
			this.f=z.decay||new THREE.Vector2(0.7,0.8);//衰减
		}
		this.num=z.number||1;//num;//发生数目zzzzzzzzzzzzzz
		this.ne=z.numberchange||[0,0]//ae;//每次偏移数目
	
		this.angle=z.angle||[-360]//angle;//角度
		this.aoff=z.angleoffset||0;//角度偏移
		this.ae=z.anglechange||[0,0]//ae;//每次转动角度
		this.rangle=z.anglerandom||0//rangle;//随机度
		this.tangle=z.anglefactor||[]//tangle;//角度时间因素
		this.aall=[0,0,0,0,0];
		this.ds=z.distance||0//ds;//出生点距离
	}else{
		this.gp=new THREE.Vector2(0,0);
		this.p=new THREE.Vector2();
		this.pl=true;
		
		this.vert=z.vert||[];
		this.num=this.vert.length;
		for(k=0;k<this.num;k++){this.vert[k]=new THREE.Vector4(this.vert[k].x,this.vert[k].y,this.vert[k].z,1)}
		
		this.bk=z.goback||0;
		this.fout=z.faceout||false;
		
		//预定矩阵
		var gmat4=new THREE.Matrix4();
		if(z.setmove){gmat4.setPosition(z.setmove);}
		if(z.setrotate){gmat4.setRotationFromEuler(z.setrotate,THREE.Object3D.defaultEulerOrder);}
		if(z.setsize){gmat4.scale(z.setsize);}
		for(k=0;k<this.num;k++){this.vert[k]=gmat4.multiplyVector4(this.vert[k])}
		
		//变换矩阵
		this.meshv=z.meshmove||new THREE.Vector3(0,0,0);
		this.meshr=z.meshrotate||new THREE.Vector3(0,0,0);
		this.meshs=z.meshsize||new THREE.Vector3(1,1,1);
		this.tmat4=new THREE.Matrix4();
		this.tmat4.setPosition(this.meshv);
		this.tmat4.setRotationFromEuler(this.meshr,THREE.Object3D.defaultEulerOrder);
		this.tmat4.scale(this.meshs);
	}
	this.lock=z.locked||false;//lock;
	if(this.lock){this.changep=new THREE.Vector2(0,0)}
	this.bt=z.lifetime||300//bt;//生存时间
	this.time=z.period||30//time;//发射周期
	this.dwf=z.diewithfather||false;//和父级一起消亡
	this.protect=z.protect||false;//
	this.cstable=z.cloudprotect==undefined?true:z.cloudprotect;
	this.ot=0;
	this.toff=z.timeoffset||0;//生成时间偏移
	this.ballbox=new Array();
	this.event=z.bulletevents||[]//弹幕事件;
	this.myeve=z.myevents||[]//发射器事件
	this.deve=z.dieevents||[]//死亡事件;
	this.se=z.birthse||0;//发生音效
	this.secount=0;
	this.sep=z.seperiod||1;//音效发射间隔
}
WEHOUCORE.Bb1.prototype.bread = function(al) {
	var i;
	if((this.ot-this.toff>=0)&&(this.ot-this.toff)%this.time==0){
		//音效
		if(this.se&&WEHOUCORE.nowstory.seplay&&this.secount%this.sep==0){
			WEHOUCORE.nowstory.seplay(this.se-1);
		}
		this.secount++;
		
		if(this.motion!='mesh'){
			//计算目标位置
			var lt=new THREE.Vector2();
			lt.x=this.t.x;
			lt.y=this.t.y;
			if(lt.x==30000){lt.x=this.parentball.t.x;}
			if(lt.y==30000){lt.y=this.parentball.t.y;}
			lt.sub(lt,this.p);
			if(Math.abs(lt.x)<2&&Math.abs(lt.y)<2){lt.y=-100;}
			//计算生成数量和位置
			var tnum=this.num+(this.rnum?-Math.floor(WEHOUCORE.random()*this.rnum):0)+Math.floor(this.aall[2]);
			var pfgx=(this.rp.x>0),rpgx;
			if(!pfgx&&this.rp.x){rpgx=-WEHOUCORE.random()*this.rp.x+this.rp.x/2;}
			var pfgy=(this.rp.x>0),rpgy;
			if(!pfgy&&this.rp.y){rpgy=-WEHOUCORE.random()*this.rp.y+this.rp.y/2;}
		}else{
			tnum=this.num;
		}
		for(var i=0;i<tnum;i++){
			//复制mesh
			if(this.ms){
				if(!this.ms.position){
					var goti=Math.floor(WEHOUCORE.random()*this.ms.length);
					var tm=this.ms[goti].clone();
				}else{
					var tm=this.ms.clone();
				}
			}else{
				var tm=new Object();
				tm.position=new Object();
			}
			//敌机数据
			if(this.type=='enemy'){
				tm.hit=this.hit;
				tm.hit_dis=this.hit_dis;
				WEHOUCORE.nowself.addHiter(tm);
			}
			if(this.motion!='mesh'){
				//位置计算
				tm.position.x=this.p.x+(this.rp.x?(pfgx?(WEHOUCORE.random()*this.rp.x-this.rp.x/2):rpgx):0);
				tm.position.y=this.p.y+(this.rp.y?(pfgy?(WEHOUCORE.random()*this.rp.y-this.rp.y/2):rpgy):0);
				tm.position.z=2;
				if(lt.x>=10000){lt.x=tm.position.x+lt.x-20000;}
				if(lt.y>=10000){lt.y=tm.position.y+lt.y-20000;}
				//方向计算
				var tt=0,tag;
				if(this.angle.length==1&&this.angle[0]<0){tag=[(-this.angle[0])/tnum];}
				else{tag=this.angle;}
				if(tnum%2==1){
					if(i==(tnum-1)/2){tt=0;}
					else if(i<(tnum-1)/2){for(j=i;j<(tnum-1)/2;j++){tt+=(tag[j]===undefined?tag[0]:tag[j]);}}
					else if(i>(tnum-1)/2){for(j=i-1;j>(tnum-1)/2-1;j--){tt-=(tag[j]===undefined?tag[0]:tag[j]);}}
				}else{
					if(i<tnum/2){for(j=i;j<=tnum/2-1;j++){tt+=(tag[j]===undefined?tag[0]:tag[j]);if(j==tnum/2-1){tt-=(tag[j]===undefined?tag[0]:tag[j])/2;}}}
					else if(i>=tnum/2){for(j=i-1;j>=tnum/2-1;j--){tt-=(tag[j]===undefined?tag[0]:tag[j]);if(j==tnum/2-1){tt+=(tag[j]===undefined?tag[0]:tag[j])/2;}}}
				}
				tt+=this.rangle?Math.floor(WEHOUCORE.random()*this.rangle-this.rangle/2):0;
				tt+=this.aall[0];
				tt+=this.aoff;
				if(this.tangle.length){tt+=Math.sin(WEHOUCORE.time/this.tangle[0])*this.tangle[1];}
				var tx=WEHOUCORE.a2a(lt,tt/180*Math.PI);
				tx.add(tx,this.p);
				this.rt?tx.add(tx,new THREE.Vector2(WEHOUCORE.random()*this.rt-this.rt/2,WEHOUCORE.random()*this.rt-this.rt/2)):0;
			}else{
				tm.position.x=this.vert[i].x;
				tm.position.y=this.vert[i].y;
				tm.position.z=2;
			}
			if(this.rat==3&&this.ms){
				tm.rotation.z=WEHOUCORE.random()*Math.PI*2;
			}
			//生成弹幕对象
			if(this.motion=='normal'){
				var tb=new WEHOUCORE.Ball(tm,tx,(this.v[i]||this.v[0])+this.aall[1]+(this.rv?(WEHOUCORE.random()*this.rv-this.rv/2):0),(this.va[i]||this.va[0])+(this.rva?(WEHOUCORE.random()*this.rva-this.rva/2):0),this.a[i]||this.a[0]);
			}else if(this.motion=='gravity'){
				var govv=(this.v[i]||this.v[0])+this.aall[1]+(this.rv?(WEHOUCORE.random()*this.rv-this.rv/2):0);
				var ds=Math.sqrt(tx.x*tx.x+tx.y*tx.y);
				var tb=new WEHOUCORE.Ball(tm,tx,new THREE.Vector2(tx.x*govv/ds,tx.y*govv/ds),0,new THREE.Vector2(this.g.x,this.g.y));
			}else if(this.motion=='mesh'){
				var tb=new WEHOUCORE.Ball(tm,new THREE.Vector2(0,0),this.tmat4,0,this.vert[i].clone());
				//alert(this.vert[i]+' '+this.vert[i].x+' '+this.vert[i].x)
			}
			//曲线激光生成
			if(this.type=='line'){
				var lmss=new THREE.PlaneGeometry(1,1,0,this.llong-1);
				for(m=0;m<this.llong*2;m++){
					lmss.vertices[m].x=tb.bp.x;lmss.vertices[m].y=tb.bp.y;
				}
				for(m=0;m<this.llong-1;m++){
					var tuv=lmss.faceVertexUvs[0][m];
					for(p=0;p<2;p++){tuv[p].u=tuv[p].v;tuv[p].v=this.cut[0];}
					for(p=2;p<4;p++){tuv[p].u=tuv[p].v;tuv[p].v=this.cut[1];}
				}
				tb.lms=new THREE.Mesh(lmss,this.lmat);
				tb.lms.position.z=20;
				tb.lms.geometry.uvsNeedUpdate=true;
				tb.lms.geometry.verticesNeedUpdate=true;
				tb.lms.geometry.dynamic = true;
				WEHOUCORE.webgl.scene.add(tb.lms);
				//var mesh2 = THREE.SceneUtils.createMultiMaterialObject( lmss, [ new THREE.MeshLambertMaterial( { color: 0x222222 } ), new THREE.MeshBasicMaterial( { color: 0xffffff, wireframe: true, transparent: true } ) ] );
				//mesh2.position.z=20;
				//WEHOUCORE.webgl.scene.add(mesh2);
			}
			//其他数据处理
			if(this.lock){tb.lockp=new THREE.Vector2(this.p.x,this.p.y);tb.changp=new THREE.Vector2(0,0)}
			if(this.parentball){tb.parentball=this.parentball}
			this.ballbox.push(tb);
			//移动上屏幕
			if(this.ms){WEHOUCORE.webgl.scene.add(this.ballbox[this.ballbox.length-1].ms)};
		}
		if(this.motion!='mesh'){
			//弹幕生成循环统计
			this.aall[0]+=this.ae[0];
			if((this.ae[0]>0&&this.aall[0]>this.ae[1])||(this.ae[0]<0&&this.aall[0]<this.ae[1])){this.aall[0]=0}
			this.aall[1]+=this.ve[0];
			if((this.ve[0]>0&&this.aall[1]>this.ve[1])||(this.ve[0]<0&&this.aall[1]<this.ve[1])){this.aall[1]=0}
			this.aall[2]+=this.ne[0];
			if((this.ne[0]>0&&this.aall[2]>this.ne[1])||(this.ne[0]<0&&this.aall[2]<this.ne[1])){this.aall[2]=0}
		}
		
	}
	//弹幕生成器事件
	for(l=0;l<this.myeve.length;l++){
		if(this.ot==this.myeve[l][0]){
			if(this.myeve[l][1]=='t'){
				this.t.x=this.myeve[l][2].x;this.t.y=this.myeve[l][2].y;
				if(this.t.x==29999&&this.t.y==29999){this.t.x=WEHOUCORE.lmpos.x;this.t.y=WEHOUCORE.lmpos.y;}
			}else{
				this[this.myeve[l][1]]=this.myeve[l][2];
			}
		}
	}
	this.ot++;
	return 11;
}
WEHOUCORE.Bb1.prototype.going=function(zp){
	for(var i=0;i<this.ballbox.length;i++){
		var tz=this.ballbox[i];
		if(tz.btime<this.bt){
			//出界处理
			if(this.outer&&(tz.ms.position.x>(WEHOUCORE.w/2+30)||tz.ms.position.x<-(WEHOUCORE.w/2+30)||tz.ms.position.y>(WEHOUCORE.h/2+30)||tz.ms.position.y<-(WEHOUCORE.h/2+30))){
				tz.btime=this.bt+11;
				if(this.ms){
					tz.ms.scale.x=0;
					tz.ms.scale.y=0;
				}
				continue;
			}
			//父级死亡处理
			if(this.dwf&&tz.parentball&&tz.parentball.dieflag){
				tz.btime=this.bt;
			}
			//this is event弹幕事件
			for(l=0;l<this.event.length;l++){
				if(this.event[l][0]=='t'?tz.btime==this.event[l][1]:
				this.event[l][0]=='-x'?tz.ms.position.x<=(this.event[l][1]>=30000?WEHOUCORE.bspos[0].x+(this.event[l][1]-40000):this.event[l][1]>=10000?WEHOUCORE.lmpos.x+(this.event[l][1]-20000):this.event[l][1]):
				this.event[l][0]=='+x'?tz.ms.position.x>=(this.event[l][1]>=30000?WEHOUCORE.bspos[0].x+(this.event[l][1]-40000):this.event[l][1]>=10000?WEHOUCORE.lmpos.x+(this.event[l][1]-20000):this.event[l][1]):
				this.event[l][0]=='+y'?tz.ms.position.y>=(this.event[l][1]>=30000?WEHOUCORE.bspos[0].x+(this.event[l][1]-40000):this.event[l][1]>=10000?WEHOUCORE.lmpos.y+(this.event[l][1]-20000):this.event[l][1]):
				this.event[l][0]=='-y'?tz.ms.position.y<=(this.event[l][1]>=30000?WEHOUCORE.bspos[0].x+(this.event[l][1]-40000):this.event[l][1]>=10000?WEHOUCORE.lmpos.y+(this.event[l][1]-20000):this.event[l][1]):
				this.event[l][0]=='nt'?tz.btime&&((tz.btime-this.event[l][1][1])%this.event[l][1][0])==0:
				this.event[l][0]=='ds'&&(!tz.gds)?WEHOUCORE.p2p(tz.ms.position,this.event[l][1][0],this.event[l][1][1],1)==1&&(tz.gds=1):
				this.event[l][0]=='-ds'&&(!tz.gds)?!(WEHOUCORE.p2p(tz.ms.position,this.event[l][1][0],this.event[l][1][1],1)==1)&&(tz.gds=1):
				this.event[l][0]=='ft'?tz.parentball.btime==this.event[l][1]:
				0){
					var ge=this.event[l][2];
					for(m=0;m<ge.length;m+=3){
						if(ge[m]=="a"){
							if(this.motion=='normal'){
								tz.a=ge[m+1]+WEHOUCORE.random()*ge[m+2]-ge[m+2]/2;
							}else if(this.motion=='gravity'){
								tz.a.x=ge[m+1].x;tz.a.y=ge[m+1].y;
							}else{
								tz.a=ge[m+1];
							}
						}else if(ge[m]=="v"){
							if(this.motion=='normal'){
								tz.v=ge[m+1]+WEHOUCORE.random()*ge[m+2]-ge[m+2]/2;
							}else if(this.motion=='gravity'){
								if(ge[m+1].x){
									tz.v.x=ge[m+1].x;tz.v.y=ge[m+1].y;
								}else{
									var tx=tz.t;
									var ds=Math.sqrt(tx.x*tx.x+tx.y*tx.y);
									tz.v.x=tx.x*ge[m+1]/ds;
									tz.v.y=tx.y*ge[m+1]/ds;
								}
							}else{
								tz.v=ge[m+1];
							}
						}else if(ge[m]=="va"){tz.va=ge[m+1]+WEHOUCORE.random()*ge[m+2]-ge[m+2]/2;}
						else if(ge[m]=="t"){
							tz.t=ge[m+1].clone();
							if(tz.t.x>=10000){if(tz.t.x==29999){tz.t.x=tz.ms.position.x+WEHOUCORE.lmpos.x-tz.bp.x;}else{tz.t.x=tz.ms.position.x+tz.t.x-20000;}}
							if(tz.t.y>=10000){if(tz.t.y==29999){tz.t.y=tz.ms.position.y+WEHOUCORE.lmpos.y-tz.bp.y;}else{tz.t.y=tz.ms.position.y+tz.t.y-20000;}}
							tz.bp.x=tz.ms.position.x;tz.bp.y=tz.ms.position.y;
							ge[m+2].x?(tz.t.x+=+WEHOUCORE.random()*ge[m+2].x-ge[m+2].x/2):0;
							ge[m+2].y?(tz.t.y+=+WEHOUCORE.random()*ge[m+2].y-ge[m+2].y/2):0;
							tz.t.sub(tz.t,tz.ms.position);
							var ds=Math.sqrt((tz.t.x)*(tz.t.x)+(tz.t.y)*(tz.t.y));
							tz.t.x=(tz.t.x)*tz.tdis/ds+tz.ms.position.x;
							tz.t.y=(tz.t.y)*tz.tdis/ds+tz.ms.position.y;
						}else if(ge[m]=="ms"){
							var p=tz.ms.position.clone();
							WEHOUCORE.webgl.scene.remove(tz.ms);
							tz.ms.deallocate();
							tz.ms=ge[m+1].clone();
							tz.ms.position=p;
							WEHOUCORE.webgl.scene.add(tz.ms);
							//tz.ms.material=ge[m+1].material;
							
						}else if(ge[m]=="bb"){
							if(ge[m+1]){
								tz.bb=[ge[m+1][0],ge[m+1][1]];
								this.parent.l[tz.bb[0]].p.x=tz.ms.position.x;
								this.parent.l[tz.bb[0]].p.y=tz.ms.position.y;
								if(ge[m+2]){
									tz.bb[2]=ge[m+2];
								}
							}else{
								tz.bb=0;
							}
						}else if(ge[m]=="p"){
							if(ge[m+1].x!=29999){tz.ms.position.x=ge[m+1].x;}
							if(ge[m+1].y!=29999){tz.ms.position.y=ge[m+1].y;}
						}else if(ge[m]=="-x"){
							if(!tz.gx){
								if(this.event[l][0]=='+x'||this.event[l][0]=='-x'){
									tz.ms.position.x=this.event[l][1]*2-tz.ms.position.x;
									tz.t.x=2*this.event[l][1]-tz.t.x;
									tz.bp.x=2*this.event[l][1]-tz.bp.x;
								}else{
									tz.t.x=2*tz.ms.position.x-tz.t.x;
									tz.bp.x=2*tz.ms.position.x-tz.bp.x;
								}
								tz.gx=1;
							}
						}else if(ge[m]=="-y"){
							if(!tz.gy){
								if(this.event[l][0]=='+y'||this.event[l][0]=='-y'){
									tz.ms.position.y=this.event[l][1]*2-tz.ms.position.y;
									tz.t.y=2*this.event[l][1]-tz.t.y;
									tz.bp.y=2*this.event[l][1]-tz.bp.y;
								}else{
									tz.t.y=2*tz.ms.position.y-tz.t.y;
									tz.bp.y=2*tz.ms.position.y-tz.bp.y;
								}
								tz.gy=1;
							}
						}else if(ge[m]=="jumpnext"){
							WEHOUCORE.nowstory.storyCT('jumpnext');
						}else if(ge[m]=="se"){
							WEHOUCORE.nowstory.seplay(ge[m+1]-1);
						}else if(ge[m]=="die"){
							tz.btime=this.bt-1;
						}else{
							tz[ge[m]]=ge[m+1];
							//alert(tz.btime)
						}
					}
				}
			}
			//event end
			//出现特效
			var fg=0;
			if(tz.btime==0){fg=this.ds;}
			if(tz.btime<10&&this.ms&&this.type!='laser'&&this.type!='self'){
				var sl=3-(tz.btime+1)*0.2;
				tz.alpha=tz.btime/9;
				tz.ms.scale.x=sl;
				tz.ms.scale.y=sl;
			}
			if(this.type=='laser'&&(this.att==0)&&tz.btime*this.v[0]<=this.longl){
				tz.ms.scale.y=tz.btime*tz.v/this.longl;
			}else if(this.type=='laser'&&(this.att>0)&&tz.btime==0){
				tz.ms.scale.x=0;
			}else if(this.type=='laser'&&(this.att>0)&&tz.btime==1){
				tz.ms.scale.x=4/this.shortl;
			}else if(this.type=='laser'&&(this.att>0)&&tz.btime>this.att-10&&tz.btime<this.att){
				tz.ms.scale.x=(10-this.att+tz.btime)/10;
			}else if(this.type=='laser'&&(this.att>0)&&tz.btime==this.att){
				tz.ms.scale.x=1;
			}
			//坐标处理
			if(this.motion=='normal'){
				tz.v+=tz.a;
				if(this.lock){
					tz.ms.position.x-=tz.changp.x;tz.ms.position.y-=tz.changp.y;
				}
				tz.t.sub(tz.t,tz.bp);
				var gx=(tz.t.x)*(tz.v+fg)/tz.tdis,gy=(tz.t.y)*(tz.v+fg)/tz.tdis;
				tz.ms.position.x+=gx?gx:0;
				tz.ms.position.y+=gy?gy:0;
				tz.ms.position.z=WEHOUCORE.zcounter();
				if(tz.va){
					if(tz.va>1000){
						var bv=tz.va-2000;
						var tt=new THREE.Vector2(tz.t.x,tz.t.y);
						tz.t=WEHOUCORE.a2a(tz.t,bv/180*Math.PI);
						tt.sub(tz.t,tt);
						tt.multiplyScalar(Math.sqrt((tz.ms.position.x-tz.bp.x)*(tz.ms.position.x-tz.bp.x)+(tz.ms.position.y-tz.bp.y)*(tz.ms.position.y-tz.bp.y))/tz.tdis);
						tz.ms.position.x+=tt.x;
						tz.ms.position.y+=tt.y;
						gx+=tt.x;
						gy+=tt.y;
					}else{
						var gova=0;
						if(this.rvauto){
							var ddd=(tz.t.x-WEHOUCORE.lmpos.x)*(tz.ms.position.y-WEHOUCORE.lmpos.y)-(tz.t.y-WEHOUCORE.lmpos.y)*(tz.ms.position.x-WEHOUCORE.lmpos.x);
							if(ddd>0){
								gova=-tz.va;
							}else if(ddd<0){
								gova=tz.va;
							}
						}else{
							gova=tz.va;
						}
						tz.t=WEHOUCORE.a2a(tz.t,gova/180*Math.PI);
					}
				}
				if(this.lock){tz.t.add(tz.t,tz.bp);}
				else{tz.t.add(tz.t,tz.bp);}
				if(this.lock){
					if(!tz.parentball){tz.changp.x=this.parent.parent.ms.position.x-tz.lockp.x;tz.changp.y=this.parent.parent.ms.position.y-tz.lockp.y;}
					else{tz.changp.x=tz.parentball.ms.position.x-tz.lockp.x;tz.changp.y=tz.parentball.ms.position.y-tz.lockp.y;}
					tz.ms.position.x+=tz.changp.x;tz.ms.position.y+=tz.changp.y;
				}
			}else if(this.motion=='gravity'){
				tz.v.x+=tz.a.x;tz.v.y+=tz.a.y;
				var gx=tz.v.x*this.f.x,gy=tz.v.y*this.f.y;
				tz.ms.position.x+=gx;
				tz.ms.position.y+=gy;
				tz.ms.position.z=WEHOUCORE.zcounter();
			}else if(this.motion=='mesh'){
				tz.a=tz.v.multiplyVector4(tz.a);
				gx=tz.ms.position.x;
				gy=tz.ms.position.y;
				tz.ms.position.x=tz.a.x;
				tz.ms.position.y=tz.a.y;
				if(this.lock){
					var cp=new THREE.Vector2();
					if(!tz.parentball){cp.x=this.parent.parent.ms.position.x;cp.y=this.parent.parent.ms.position.y;}
					else{cp.x=tz.parentball.ms.position.x;cp.y=tz.parentball.ms.position.y;}
					tz.ms.position.x+=cp.x;
					tz.ms.position.y+=cp.y;
				}
				if(this.bk){
					var ag=tz.a.z>=this.bk[0]?1:(tz.a.z<=this.bk[1]?0:(tz.a.z-this.bk[1])/(this.bk[0]-this.bk[1]));
					tz.alpha=(tz.btime<10)?(ag>tz.alpha?tz.alpha:ag):ag;
				}
				if(this.fout){
					gx=tz.a.x;
					gy=tz.a.y;
				}else{
					gx=tz.ms.position.x-gx;
					gy=tz.ms.position.y-gy;
				}
				tz.ms.position.z=WEHOUCORE.zcounter();
			}
			//关键：传递给shader的多余信息
			if((!(this.type=='line'))&&this.ms){
				tz.ms.scale.z=tz.alpha;//透明度
				if(tz.ms.geometry.rep){
					tz.ms.addMatrix.elements[2]=tz.ms.geometry.rep[1];
					tz.ms.addMatrix.elements[8]=Math.floor(tz.btime/10)%tz.ms.geometry.rep[0];
					if(tz.ms.geometry.rep[2]){
						if(Math.abs(gx)>0.3){
							if(tz.ms.adsta<15){tz.ms.addMatrix.elements[9]=1;tz.ms.addMatrix.elements[8]=Math.floor(tz.ms.adsta/5);tz.ms.adsta++;}
							else{tz.ms.addMatrix.elements[9]=2;}
						}else{
							if(tz.ms.adsta>0){tz.ms.addMatrix.elements[9]=1;tz.ms.addMatrix.elements[8]=Math.floor(tz.ms.adsta/5);tz.ms.adsta--;}
							else{tz.ms.addMatrix.elements[9]=0;}
						}
						if(gx<0){
							tz.ms.addMatrix.elements[8]+=tz.ms.geometry.rep[3];
							tz.ms.addMatrix.elements[9]+=tz.ms.geometry.rep[4];
							tz.ms.addMatrix.elements[2]=-tz.ms.addMatrix.elements[2];
						}
					}
				}
			}
			//旋转图像
			if(this.rat==1&&this.ms){
				tz.ms.rotation.z=(gx!=0?Math.PI/2+Math.atan(gy/gx):Math.PI);
				if(this.type=='ball'){tz.ms.rotation.z+=Math.PI}
				if((gx>0&&gy<0)||(gx>=0&&gy>=0)){tz.ms.rotation.z+=Math.PI}
			}else if(this.rat==2&&this.ms){
				tz.ms.rotation.z+=0.1;
			}
			
			var dflag=0;
			//line 曲线激光判定
			if(this.type=='line'){
				tz.lms.scale.z=tz.alpha;//透明度
				var ds2=Math.sqrt(gx*gx+gy*gy),m=0;
				var psex=new THREE.Vector2(5*gy/ds2,-5*gx/ds2);
				var thispoint=new THREE.Vector2((tz.lms.geometry.vertices[m].x+tz.lms.geometry.vertices[m+1].x)/2,(tz.lms.geometry.vertices[m].y+tz.lms.geometry.vertices[m+1].y)/2);
				for(m=0;m<this.llong*2-2;m+=2){
					tz.lms.geometry.vertices[m].x=tz.lms.geometry.vertices[m+2].x;tz.lms.geometry.vertices[m].y=tz.lms.geometry.vertices[m+2].y;
					tz.lms.geometry.vertices[m+1].x=tz.lms.geometry.vertices[m+3].x;tz.lms.geometry.vertices[m+1].y=tz.lms.geometry.vertices[m+3].y;
					var nextpoint=new THREE.Vector2((tz.lms.geometry.vertices[m+2].x+tz.lms.geometry.vertices[m+3].x)/2,(tz.lms.geometry.vertices[m+2].y+tz.lms.geometry.vertices[m+3].y)/2);
					//if(WEHOUCORE.p2p(,WEHOUCORE.lmpos,9,1)==1){dflag=1}
					if(WEHOUCORE.p2l(WEHOUCORE.lmpos,thispoint,nextpoint,5)==1){dflag=1}
					thispoint=nextpoint;
				}
				if(tz.btime<this.aptime){dflag=0;tz.lms.scale.z=tz.alpha<0.5?tz.alpha:0.5;}
				tz.lms.geometry.vertices[m].x=tz.ms.position.x+psex.x;tz.lms.geometry.vertices[m].y=tz.ms.position.y+psex.y;tz.lms.geometry.vertices[m].z=0;
				tz.lms.geometry.vertices[m+1].x=tz.ms.position.x-psex.x;tz.lms.geometry.vertices[m+1].y=tz.ms.position.y-psex.y;tz.lms.geometry.vertices[m+1].z=0;
				tz.lms.position.z=WEHOUCORE.zcounter();
				tz.lms.geometry.verticesNeedUpdate = true;
			}
			//laser 激光的判定
			if(this.type=='laser'&&tz.btime>=this.att&&tz.ms.geometry.d){
				var n1=WEHOUCORE.a2a(new THREE.Vector2(0,-this.longl*tz.ms.scale.y+tz.ms.geometry.d+20),tz.ms.rotation.z)
				var n2=WEHOUCORE.a2a(new THREE.Vector2(0,-tz.ms.geometry.d-20),tz.ms.rotation.z)
				if(WEHOUCORE.p2l(WEHOUCORE.lmpos,new THREE.Vector2(tz.ms.position.x+n1.x,tz.ms.position.y+n1.y),new THREE.Vector2(tz.ms.position.x+n2.x,tz.ms.position.y+n2.y),tz.ms.geometry.d)){dflag=1}
			}
			//self 自机弹幕判定
			if(this.type=='self'){
				var xl=WEHOUCORE.nowself.hitlist;
				for(w=0;w<xl.length;w++){
					var cflag=false;
					if(this.islaser){
						var n1=WEHOUCORE.a2a(new THREE.Vector2(0,-this.longl*tz.ms.scale.y+tz.ms.geometry.d+20),tz.ms.rotation.z)
						var n2=WEHOUCORE.a2a(new THREE.Vector2(0,-tz.ms.geometry.d-20),tz.ms.rotation.z)
						if(WEHOUCORE.p2l(xl[w].position,new THREE.Vector2(tz.ms.position.x+n1.x,tz.ms.position.y+n1.y),new THREE.Vector2(tz.ms.position.x+n2.x,tz.ms.position.y+n2.y),xl[w].hit_dis)){cflag=true}
					}else if(WEHOUCORE.p2p(tz.ms.position,xl[w].position,xl[w].hit_dis,1)){cflag=true}
					if(cflag){
						tz.btime=this.bt-1;
						xl[w].hit-=this.dmg;
						WEHOUCORE.deal.hitting();
						break;
					}
				}
			}
			//enemy 敌机死亡判断
			if(this.type=='enemy'){
				if(tz.ms.hit<0){
					tz.btime=this.bt-1;
					WEHOUCORE.nowself.delHiter(tz.ms);
				}
			}
			//子弹幕生成
			if(tz.bb&&tz.bb.length){
				if(tz.bb[2]==5||tz.bb[2]==9){
					//this.parent.l[tz.bb[0]].p.x=this.parent.l[tz.bb[0]].pl?this.parent.l[tz.bb[0]].gp.x+tz.ms.position.x:(this.parent.l[tz.bb[0]].gp.x>10000?this.parent.l[tz.bb[0]].gp.x-20000+WEHOUCORE.lmpos.x:this.parent.l[tz.bb[0]].parent.x);
					//this.parent.l[tz.bb[0]].p.y=this.parent.l[tz.bb[0]].pl?this.parent.l[tz.bb[0]].gp.y+tz.ms.position.y:(this.parent.l[tz.bb[0]].gp.y>10000?this.parent.l[tz.bb[0]].gp.y-20000+WEHOUCORE.lmpos.y:this.parent.l[tz.bb[0]].parent.y);
					this.parent.l[tz.bb[0]].p.x=this.parent.l[tz.bb[0]].gp.x;
					this.parent.l[tz.bb[0]].p.y=this.parent.l[tz.bb[0]].gp.y;
				}else{
					this.parent.l[tz.bb[0]].p.x=tz.ms.position.x;
					this.parent.l[tz.bb[0]].p.y=tz.ms.position.y;
				}
				this.parent.l[tz.bb[0]].ot=tz.bb[1];
				this.parent.l[tz.bb[0]].parentball=tz;
				this.parent.l[tz.bb[0]].bread();
				tz.bb[1]++;
				if(tz.bb[2]==1||tz.bb[2]==5){
					tz.bb=0;
				}
			}
			//普通弹幕/敌机判定和处理
			if((this.cstable?(tz.btime>10&&tz.alpha>0.95):1)&&(((this.type=='ball'||this.type=='enemy')&&this.ms&&tz.ms.geometry.d&&((tz.gz=WEHOUCORE.p2p(tz.ms.position,WEHOUCORE.lmpos,tz.ms.geometry.d,tz.gz))==1)))||dflag==1){
				if(WEHOUCORE.cheat==0){
					WEHOUCORE.deal.hit();
					if((!this.protect)&&(this.type=='ball'||this.type=='enemy')){tz.btime=this.bt-1;}
					//break;
				}else{
					WEHOUCORE.deal.cheathit();
					if((!this.protect)&&(this.type=='ball'||this.type=='enemy')){tz.btime=this.bt-1;}
				}
			}
			tz.btime++;
		}else if(tz.btime-this.bt<=10){
			//死亡事件
			if(tz.btime==this.bt){
				tz.dieflag=true;
				for(l=0;l<this.deve.length;l++){
					if(this.deve[l][0]=='bb'){
						tz.bb=[this.deve[l][1][0],this.deve[l][1][1]];
					}else if(this.deve[l][0]=='eff'){
						WEHOUCORE.noweffect.push(this.deve[l][1],tz.ms.position.x,tz.ms.position.y);
					}else{
						this[this.deve[l][0]]=this.deve[l][1];
					}
				}
			}
			//处理可能的事件
			if(tz.bb&&tz.bb.length){
				this.parent.l[tz.bb[0]].p.x=tz.ms.position.x;
				this.parent.l[tz.bb[0]].p.y=tz.ms.position.y;
				this.parent.l[tz.bb[0]].ot=tz.bb[1];
				this.parent.l[tz.bb[0]].parentball=tz;
				this.parent.l[tz.bb[0]].bread();
				tz.bb[1]++;
			}
			//消失阶段
			if((this.type=='ball'||this.type=='enemy')&&this.ms){
				var sl=(10-tz.btime+this.bt)*0.1;
				tz.ms.scale.x=sl;
				tz.ms.scale.y=sl;
			}else if(this.type=='laser'){
				tz.ms.scale.x=(10-tz.btime+this.bt)/10;
			}else if(this.type=='line'){
				tz.lms.scale.z-=0.1;
			}else if(this.type=='self'){
				tz.ms.position.y+=(10-tz.btime+this.bt)*1.0;
				if(tz.btime-this.bt==10){tz.ms.scale.x=0;}
			}
			tz.btime++;
		}
	}
	//清理
	for(var i=0;i<this.ballbox.length;){
		if(this.ballbox[i].btime>this.bt+10){
			if(this.type=='ball'||this.type=='laser'||this.type=='self'||this.type=='enemy'){
				var t=this.ballbox.shift().ms;
				if(this.type=='enemy'){
					WEHOUCORE.nowself.delHiter(t);
				}
				if(this.ms){
					WEHOUCORE.webgl.scene.remove(t);
					t.deallocate();
				}
			}else if(this.type=='line'){
				var t=this.ballbox.shift().lms;
				WEHOUCORE.webgl.scene.remove(t);
				t.deallocate();
			}
		}else{
			break;
		}
	}
	return 22;
}
WEHOUCORE.Bb1.prototype.clear = function(p,dis,per) {//位置 距离 百分比
	var a=this.ballbox.length;
	for(var i=0;i<a;i++){
		var m=this.ballbox[i];
		if(((m.ms.position.x-p.x)*(m.ms.position.x-p.x)+(m.ms.position.y-p.y)*(m.ms.position.y-p.y)<=dis*dis*per*per)&&this.ballbox[i].btime<=this.bt){
			this.ballbox[i].btime=this.bt+1;
		}
	}
}
WEHOUCORE.Bb1.prototype.clean = function() {
	var a=this.ballbox.length;
	for(var i=0;i<a;i++){
		if(this.type=='ball'||this.type=='laser'||this.type=='enemy'||this.type=='self'){
			var t=this.ballbox.shift().ms;
			WEHOUCORE.nowself.delHiter(t);
			if(this.ms){
				WEHOUCORE.webgl.scene.remove(t);
				t.deallocate();
			}
		}else if(this.type=='line'){
			var t=this.ballbox.shift().lms;
			WEHOUCORE.webgl.scene.remove(t);
			t.deallocate();
		}
	}
}
//精简发射器
WEHOUCORE.Bb2=function(parent,z){
	this.parent=parent;
	this.ms=z.mesh||null;//ms;//形状指针
	this.rnum=z.numberrandom||0;//rnum;//随机度
	this.lock=z.locked||false;//lock;
	this.gp=z.position||new THREE.Vector2(0,0);//gp;//发射器位置
	this.p=new THREE.Vector2();
	this.rp=z.positionrandom||new THREE.Vector2(0,0);//rp;//位置随机度
	this.pl=(z.positionlock===undefined)?true:z.positionlock;//位置相对觉对
	this.num=z.number||1;//num;//发生数目zzzzzzzzzzzzzz
	this.ds=z.distance||0//ds;//出生点距离
	this.bt=z.lifetime||300//bt;//生存时间
	this.time=z.period||30//time;//发射周期
	this.ot=0;
	this.ballbox=new Array();
	//
	this.alpha=z.alpha||9;//透明度
	this.valpha=z.valpha||0;
	this.size=z.vsize||new THREE.Vector2(1,1);
	this.vsize=z.vsize||new THREE.Vector2(0,0);
	this.asize=z.asize||0;
	
	this.angle=z.angle||0;
	this.rangle=z.anglerandom||0;
}
WEHOUCORE.Bb2.prototype.bread = function(al) {
	var i;
	if(this.ot%this.time==0){
		var tnum=this.num+(this.rnum?-Math.floor(WEHOUCORE.random()*this.rnum):0);
		var pfgx=(this.rp.x>0),rpgx;
		if(!pfgx&&this.rp.x){rpgx=-WEHOUCORE.random()*this.rp.x+this.rp.x/2;}
		var pfgy=(this.rp.x>0),rpgy;
		if(!pfgy&&this.rp.y){rpgy=-WEHOUCORE.random()*this.rp.y+this.rp.y/2;}
		for(var i=0;i<tnum;i++){
			var tm;
			if(this.ms){
				if(!this.ms.position){
					var goti=Math.floor(WEHOUCORE.random()*this.ms.length);
					tm=this.ms[goti].clone();
					tm.ms=this.ms[goti].ms;
				}else{
					tm=this.ms.clone();
					if(this.ms.ms){tm.ms=this.ms.ms;};
				}
			}else{
				tm=new Object();
				tm.position=new Object();
			}
			
			tm.position.x=this.p.x+(this.rp.x?(pfgx?(WEHOUCORE.random()*this.rp.x-this.rp.x/2):rpgx):0);
			tm.position.y=this.p.y+(this.rp.y?(pfgy?(WEHOUCORE.random()*this.rp.y-this.rp.y/2):rpgy):0);
			tm.position.z=2;
			tm.rotation.z=(this.angle+WEHOUCORE.random()*this.rangle)*Math.PI/180;
			var tb=new WEHOUCORE.Ball(tm,new THREE.Vector2(1000,1000),0,0,0,[],this.alpha,this.valpha,this.size,this.vsize.clone());
			if(this.parentball){tb.parentball=this.parentball}
			this.ballbox.push(tb);
			if(this.ms){WEHOUCORE.webgl.scene.add(this.ballbox[this.ballbox.length-1].ms)};
		}
	}
	this.ot++;
	return 11;
}
WEHOUCORE.Bb2.prototype.going=function(zp){
	for(var i=0;i<this.ballbox.length;i++){
		var tz=this.ballbox[i];
		tz.vsize.x+=this.asize;
		tz.vsize.y+=this.asize;
		if(tz.vsize.x){tz.ms.scale.x+=tz.vsize.x;}
		if(tz.vsize.y){tz.ms.scale.y+=tz.vsize.y;}
		if(tz.valpha){tz.alpha+=tz.valpha;}
		if(tz.alpha>1){tz.alpha=1;}
		if(tz.alpha<0){tz.alpha=0;}
		tz.ms.scale.z=tz.alpha;
		tz.ms.position.z=WEHOUCORE.zcounter();
		tz.btime++;
	}
	for(var i=0;i<this.ballbox.length;){
		if(this.ballbox[i].btime>this.bt){
			var t=this.ballbox.shift().ms;
			if(this.ms){
				WEHOUCORE.webgl.scene.remove(t);
				t.deallocate();
			}
		}else{
			break;
		}
	}
	return 22;
}
WEHOUCORE.Bb2.prototype.clear = function() {
	var a=this.ballbox.length;
	for(var i=0;i<a;i++){
		if(this.ballbox[i].btime<this.bt){
			this.ballbox[i].btime=this.bt;
		}
	}
}