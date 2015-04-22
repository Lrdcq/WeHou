//-----------------------------
//---------wehou_game----------
//-----------v 0.21------------
//--------sp for demo6---------
//-----------------------------
var WEHOUGAME={}

WEHOUGAME.mainstory=new WEHOUCORE.storySet("unknown");

WEHOUGAME.renderintime=2;
WEHOUGAME.rendereachtime=1;
WEHOUGAME.slowtime=1;
WEHOUGAME.onpause=false;
WEHOUGAME.gotime=0;
WEHOUGAME.lastshowtime=0;
WEHOUGAME.power=0;

WEHOUGAME.graze=0;
WEHOUGAME.miss=0;
WEHOUGAME.missall=0;
WEHOUGAME.misscd=0;
WEHOUGAME.misscut=0;
WEHOUGAME.timecut=0;
WEHOUGAME.score=0;
WEHOUGAME.topscore=0;
WEHOUGAME.hiscore=0;

WEHOUGAME.kd=[];
WEHOUGAME.lmturn=0;//自机移动图片标记
WEHOUGAME.inrep=false;
WEHOUGAME.onsp=false;//是否在SP背景下
WEHOUGAME.repdata;
WEHOUGAME.dom=null;//dom备用
WEHOUGAME.tempcanvas=new Array();
WEHOUGAME.tempmesh=new Array();
WEHOUGAME.tempspbg=new Array();
WEHOUGAME.myplalist=new WEHOUCORE.planeSet();//片面
WEHOUGAME.myimglist=new WEHOUCORE.imgSet();//片面用材质
WEHOUGAME.myshaderlist=new WEHOUCORE.shaderSet();//shader材质
WEHOUGAME.myplalistbre=new WEHOUCORE.planeSet();//弹幕片面
WEHOUGAME.myplalistot=new WEHOUCORE.planeSet();//其他片面
WEHOUGAME.myplalistsdr=new WEHOUCORE.planeSet();//shader片面
WEHOUGAME.myimglistbre=new WEHOUCORE.imgSet();//弹幕片面材质
WEHOUGAME.myplalistbos=new WEHOUCORE.planeSet();//boss片面
WEHOUGAME.myplalistbox=new WEHOUCORE.planeSet();//boss盒子
WEHOUGAME.myimglistbos=new WEHOUCORE.imgSet();//boss片面材质
WEHOUGAME.mymusiclist=new Array();//音乐
WEHOUGAME.mymusicon=[];//正在播放的音乐
WEHOUGAME.myselist=new Array();//音效buffers
WEHOUGAME.myaudio=new AudioContext()||NULL;//声效系统上下文
WEHOUGAME.addBulletImg=function(list,rs){
	WEHOUGAME.myimglistbre.add(list,rs===undefined?1:rs,1,1);
	return WEHOUGAME.myimglistbre.l.length-1;
}
WEHOUGAME.getBulletImg=function(n){
	return WEHOUGAME.myimglistbre.l[n];
}
WEHOUGAME.addBullet=function(img,w,h,d,type,repeat,cut,rt){
	WEHOUGAME.myplalistbre.add(w,h,img,{d:d,end:(type=='laser'?1:0),rep:repeat||1,cut:(cut?cut:null),rt:(rt?1:0)});
	return WEHOUGAME.myplalistbre.l.length-1;
}
WEHOUGAME.getBullet=function(n){
	return WEHOUGAME.myplalistbre.l[n];
}
WEHOUGAME.addPla=function(img,w,h,cut,rt){
	WEHOUGAME.myplalistot.add(w,h,img,{end:0,cut:(cut?cut:null),rt:(rt?1:0)});
	return WEHOUGAME.myplalistot.l.length-1;
}
WEHOUGAME.getPla=function(n){
	return WEHOUGAME.myplalistot.l[n];
}
WEHOUGAME.addShader=function(img,w,h,vs,fs,cut){
	WEHOUGAME.myplalistsdr.add(w,h,WEHOUGAME.myshaderlist.l[WEHOUGAME.myshaderlist.add({uniforms:{texture1:{type:'t',value:img.map}},vertexShader:vs,fragmentShader:fs})],{cut:cut});
	return WEHOUGAME.myplalistsdr.l.length-1;
}
WEHOUGAME.getShader=function(n){
	return WEHOUGAME.myplalistsdr.l[n];
}
WEHOUGAME.boss_color=new THREE.Vector3(1,0.25,0.25);
WEHOUGAME.boss_black=new THREE.Vector2(0,0);
WEHOUGAME.addBossImg=function(list){
	WEHOUGAME.myimglistbos.add(list,0,0,1,0,{
		vert:
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
		frag:
				'uniform sampler2D texture1;'+
				'uniform vec3 boss_color;'+
				'uniform vec2 black;'+
				'varying vec2 vUv;'+
				'varying float alphas;'+
				'void main(){'+
				'	vec2 uv=vUv;'+
				'	vec4 fc=texture2D(texture1,uv);'+
				'	fc[3]=fc[3]*alphas;'+
				'	if(fc.x>0.3&&fc.y<0.08&&fc.z<0.08){'+
				'		float ex=1.0-fc.x;'+
				'		fc.x=fc.x*boss_color.x;'+
				'		fc.y=boss_color.y-ex;fc.z=boss_color.z-ex;}'+
				'	if(black.x>1.0){fc.x=0.0;fc.y=0.0;fc.z=0.0;}'+
				'	gl_FragColor=fc;'+
				'}',
		uniforms:{boss_color:{type:'v3',value:WEHOUGAME.boss_color},black:{type:'v2',value:WEHOUGAME.boss_black}}
	});
	return WEHOUGAME.myimglistbos.l.length-1;
}
WEHOUGAME.getBossImg=function(n){
	return WEHOUGAME.myimglistbos.l[n];
}
WEHOUGAME.addBoss=function(img,w,h,cut,video){
	var n=WEHOUGAME.myplalistbox.add(0,0,img,{cut:[0,0,0,0]});
	var n2=WEHOUGAME.myplalistbos.add(w,h,img,{cut:cut});
	var b=WEHOUGAME.myplalistbos.l[n];
	b.position.y=10;
	b.addMatrix=new THREE.Matrix4(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);
	b.addMatrix.elements[2]=Math.min(Math.abs(cut[0]-cut[1]),Math.abs(cut[2]-cut[3]));
	var c=WEHOUGAME.myplalistbox.l[n];
	c.add(WEHOUGAME.myplalist.l[0].clone());
	c.add(WEHOUGAME.myplalist.l[4].clone());
	c.add(WEHOUGAME.myplalist.l[5].clone());
	c.add(b);
	b.video=video;
	b.now_video='normal';
	b.face=1;
	b.now_time=0;
	b.now_mod=1; // 0('back') 1('normal') 2('turn') 3('unturn') 4('run') -1('gameing')
	c.deal=function(t,x,y,nx,ny){
		function setstate(mod){
			switch(mod){
			case 0:b.now_video='back';break;
			case 1:b.now_video='normal';break;
			case 2:b.now_video='turn';break;
			case 3:b.now_video='unturn';break;
			case 4:b.now_video='run';break;
			}
			b.now_time=0;
			b.now_mod=mod;
		}
		if(x>0.1&&b.face==-1&&b.now_mod==1){b.face=1;setstate(0)}
		else if(x<-0.1&&b.face==1&&b.now_mod==1){b.face=-1;setstate(0)}
		
		if(x<0.1&&b.face==1&&nx-WEHOUCORE.lmpos.x>=50&&b.now_mod==1){b.face=-1;setstate(0)}
		else if(x>-0.1&&b.face==-1&&nx-WEHOUCORE.lmpos.x<-50&&b.now_mod==1){b.face=1;setstate(0)}
		
		if(Math.abs(x)>0.5&&b.now_mod==1){setstate(2)}
		else if(Math.abs(x)<0.5&&b.now_mod==4){setstate(3)}
		
		var v=b.video[b.now_video];
		if(x>0.5&&b.now_mod==-1&&!v[v.length-1]){b.face=1}
		else if(x<-0.5&&b.now_mod==-1&&!v[v.length-1]){b.face=-1}

		for(var i=1;i<=(v.length-2)/3;i++){
			if(b.now_time==v[i*3]){
				if(b.face==1){
					b.addMatrix.elements[2]=Math.abs(b.addMatrix.elements[2]);
					b.addMatrix.elements[8]=v[i*3-2];
				}else{
					b.addMatrix.elements[2]=-Math.abs(b.addMatrix.elements[2]);
					b.addMatrix.elements[8]=v[i*3-2]+1;
				}
				b.addMatrix.elements[9]=v[i*3-1];
				if(v[v.length-1]){b.face=v[v.length-1]}
				break;
			}
		}
		b.now_time++;
		if(b.now_time==v[0]){
			if(b.now_mod==4){setstate(4)}
			else if(b.now_mod==0){setstate(1)}
			else if(b.now_mod==2){setstate(4)}
			else if(b.now_mod==3){setstate(1)}
			else{setstate(1)}
		}
	}
	c.act=function(t){
		var sl=Math.sin(WEHOUCORE.time/50)*0.4;
		var mc=this.children[0];
		mc.rotation.z+=0.1;
		mc.scale.x=2.35+sl;
		mc.scale.y=2.35+sl;
		if(t==1){
			var mc=this.children[1];
			mc.scale.x=0;
			mc.scale.y=0;
			var mc=this.children[2];
			mc.scale.x=0;
			mc.scale.y=0;
		}
	}
	c.sp=function(t){
		var sl=Math.sin(WEHOUCORE.time/50)*0.4;
		var mc=this.children[0];
		mc.rotation.z+=0.1;
		mc.scale.x=2.35+sl;
		mc.scale.y=2.35+sl;
		this.children[1].rotation.z-=0.02;
		this.children[2].rotation.z+=0.02;
		if(t<60){
			var x=WEHOUCORE.slowmove[3](t,0,1,60);
			var mc=this.children[1];
			mc.scale.x=mc.scale.y=x;
			var mc=this.children[2];
			mc.scale.x=mc.scale.y=x;
		}
	}
	c.end=function(t){
		var mc=this.children[0];
		mc.rotation.z+=0.1;
		mc.scale.x+=0.05;
		mc.scale.y+=0.05;
		if(t==1){
			var mc=this.children[1];
			mc.scale.x=0;
			mc.scale.y=0;
			var mc=this.children[2];
			mc.scale.x=0;
			mc.scale.y=0;
		}
		if(mc.material.opacity>0){mc.material.opacity-=0.005;}
	}
	c.onting=function(t){
		if(t==1){
			var mc=this.children[0];
			mc.scale.x=0;
			mc.scale.y=0;
			var mc=this.children[1];
			mc.scale.x=0;
			mc.scale.y=0;
			var mc=this.children[2];
			mc.scale.x=0;
			mc.scale.y=0;
		}
	}
}
WEHOUGAME.getBoss=function(n){
	return WEHOUGAME.myplalistbox.l[n];
}
WEHOUGAME.playBoss=function(n,name){
	t=WEHOUGAME.myplalistbos.l[n];
	t.now_video=name;
	t.now_time=0;
	t.now_mod=-1;
}
WEHOUGAME.addMusic=function(name,loop){
	var msi=new Audio(name);
	if(loop){msi.loop=1;}
	WEHOUGAME.mymusiclist.push(msi);
}
WEHOUGAME.getMusic=function(n){
	return WEHOUGAME.mymusiclist[n];
}
WEHOUGAME.addSe=function(list){
	 var loader=new BufferLoader(WEHOUGAME.myaudio,list,function(buffers){
		WEHOUGAME.myselist=buffers;
	 });
	 loader.load();
}
WEHOUGAME.playSenow=new Array();//
WEHOUGAME.playSe=function(id,x,y){
	for(var i=0;i<WEHOUGAME.playSenow.length;i++){
		if(WEHOUGAME.playSenow[i][0]==id){return;}
	}
	WEHOUGAME.playSenow.push([id,0,0]);
}
if(WEHOUGAME.myaudio){
	WEHOUGAME.mainstory.seplay=WEHOUGAME.playSe;
	WEHOUGAME.playSenode=WEHOUGAME.myaudio.createGain();
	WEHOUGAME.playSenode.gain.value=0.15;
	WEHOUGAME.playSenode.connect(WEHOUGAME.myaudio.destination);
}
WEHOUGAME.runSe=function(){//运行
	for(var i=0;i<WEHOUGAME.playSenow.length;i++){
		var s=WEHOUGAME.myaudio.createBufferSource();
		s.buffer=WEHOUGAME.myselist[WEHOUGAME.playSenow[i][0]];
		s.connect(WEHOUGAME.playSenode);
		s.start(0);
	}
	WEHOUGAME.playSenow=[];
}
WEHOUGAME.userInt=function(){}
WEHOUGAME.intGame=function(dom){
	if(!WEHOUGAME.dom){
		WEHOUGAME.dom=dom;
		dom.innerHTML+="<div id='canvas-bg' style='border:3px solid #000;width:"+(WEHOUCORE.w)+"px;height:"+(WEHOUCORE.h)+"px;position:absolute;top:0px;left:0px;'></div><div id='canvas-core' style='border:3px solid #000;width:"+(WEHOUCORE.w)+"px;height:"+(WEHOUCORE.h)+"px;position:absolute;top:0;left:0;'></div><div id='canvas-ui' style='border:3px solid #000;width:"+(WEHOUCORE.w)+"px;height:"+(WEHOUCORE.h)+"px;position:absolute;top:0;left:0;'></div><div id='loadmsg'>加载基础代码中</div>";
		dom.innerHTML+="<div id='hiscore' style='position:absolute;top:64px;left:605px;width:130px;text-align:right;font-size:22px;font-family:Tahoma;color:#aaa;font-weight:normal;text-shadow:#000 2px 0 0,#000 -2px 0 0,#000 0 2px 0,#000 0 -2px 0;'></div><div id='topscore' style='position:absolute;top:97px;left:605px;width:130px;text-align:right;font-size:22px;font-family:Tahoma;color:#ddd;font-weight:normal;text-shadow:#000 2px 0 0,#000 -2px 0 0,#000 0 2px 0,#000 0 -2px 0;'></div><div id='score' style='position:absolute;top:130px;left:605px;width:130px;text-align:right;font-size:22px;font-family:Tahoma;color:#ddd;font-weight:normal;text-shadow:#000 2px 0 0,#000 -2px 0 0,#000 0 2px 0,#000 0 -2px 0;'></div><div id='misscut' style='position:absolute;top:166px;left:605px;width:130px;text-align:right;font-size:22px;font-family:Tahoma;color:#9f9;font-weight:normal;text-shadow:#000 2px 0 0,#000 -2px 0 0,#000 0 2px 0,#000 0 -2px 0;'></div></div><div id='miss' style='position:absolute;top:202px;left:605px;width:130px;text-align:right;font-size:22px;font-family:Tahoma;color:#f99;font-weight:normal;text-shadow:#000 2px 0 0,#000 -2px 0 0,#000 0 2px 0,#000 0 -2px 0;'></div>";//备用canvas
		dom.innerHTML+="<div id='game-talk' style='width:800px;height:600px;position:absolute;top:-25px;left:-30px;overflow:hidden;'></div>";//对话框
		if(!document.createElement('canvas').getContext( "experimental-webgl")){alert('你的浏览器并不能很好的支持本游戏。\n请更换为chrome');WEHOUCORE.time=-10;}
	}
	WEHOUCORE.initcoreenv(document.getElementById('canvas-core'));
	//UI 的3D环境
	WEHOUGAME.ui={};
	WEHOUGAME.ui.renderer=new THREE.WebGLRenderer({antialias:true});
	WEHOUGAME.ui.renderer.setSize(WEHOUCORE.w,WEHOUCORE.h);
	document.getElementById('canvas-ui').appendChild(WEHOUGAME.ui.renderer.domElement);
	WEHOUGAME.ui.camera=new THREE.OrthographicCamera(-WEHOUCORE.w/2,WEHOUCORE.w/2,WEHOUCORE.h/2,-WEHOUCORE.h/2,-20000,20000);
	WEHOUGAME.ui.camera.lookAt(new THREE.Vector3( 0, 0, 0 ));
	WEHOUGAME.ui.scene = new THREE.Scene();
	//BG 背景的3D环境
	
	document.getElementById('canvas-bg').appendChild(WEHOUGAME.bg.renderer.domElement);
	WEHOUGAME.bg.renderer.setClearColorHex(0x000000, 1.0);
	WEHOUGAME.bg.scene=new THREE.Scene();
	WEHOUGAME.bg.camera=new THREE.OrthographicCamera(-WEHOUCORE.w/2,WEHOUCORE.w/2,WEHOUCORE.h/2,-WEHOUCORE.h/2,-2000,2000);
	   WEHOUGAME.bg.renderer.render(WEHOUGAME.bg.scene,WEHOUGAME.bg.camera);//for test
	WEHOUGAME.bg.rtt=new THREE.WebGLRenderTarget(500,550,{minFilter:THREE.LinearFilter,magFilter:THREE.NearestFilter,format:THREE.RGBFormat});

	WEHOUGAME.bg.uniforms={
		texture1:{type:'t',value:WEHOUGAME.bg.rtt},//3D渲染到贴图的
		texture2:{type:'t',value:0},//3D渲染到贴图的
		uvb:{type:'v2',value:new THREE.Vector2(-1.0,-1.0)},
		move:{type:'v3',value:new THREE.Vector3(60.0,40.0,1.8)},
		is:{type:'f',value:-1.0},//是否有boss
		w:{type:'v2',value:new THREE.Vector2(WEHOUCORE.w,WEHOUCORE.h)},//屏幕大小
		time:{type:'f',value:0.0},//时间因素
		isover:{type:'f',value:0.0}//是否有叠加图层
	};
	var rttshader=new THREE.ShaderMaterial({
		uniforms:WEHOUGAME.bg.uniforms,
		vertexShader:
		'varying vec2 vUv;'+
		'void main() {'+
		'	vUv = uv;'+
		'	gl_Position = projectionMatrix * modelViewMatrix * vec4( position,1.0 );'+
		'}',
		fragmentShader:
		'uniform sampler2D texture1;'+
		'uniform sampler2D texture2;'+
		'uniform float is;'+
		'uniform float isover;'+
		'uniform float time;'+
		'uniform vec3 move;'+
		'uniform vec2 uvb;'+
		'uniform vec2 w;'+
		'varying vec2 vUv;'+
		'void main(){'+
		'	vec2 tuv=vec2(vUv.x*w.x-w.x/2.0,vUv.y*w.y-w.y/2.0);'+
		'	vec2 uv2=vec2(vUv.x,vUv.y);'+
		'	float dis=200.0;'+
		'	if(is>0.0){'+
		'		dis=sqrt((tuv.x-uvb.x)*(tuv.x-uvb.x)+(tuv.y-uvb.y)*(tuv.y-uvb.y));'+
		'		if(dis<140.0){'+
		'			uv2.x=uv2.x+(tuv.x-uvb.x)/1000.0*(140.0-dis)/140.0*sin(time+uv2.x*10.0);'+
		'			uv2.y=uv2.y+(tuv.y-uvb.y)/1000.0*(140.0-dis)/140.0*sin(time+uv2.y*10.0);'+
		'		}'+
		'	}'+
		'	vec4 fc=texture2D(texture1,uv2);'+
		'	if(isover>0.5){'+
		'		vec2 uv3=vec2(uv2.x*move.z+time/move.x,uv2.y*move.z+time/move.y);'+
		'		vec4 fd=texture2D(texture2,uv3);'+
		'		if(fd[3]>0.8){'+
		'			fc.x=1.0-(1.0-fc.x)/fd.x;'+
		'			fc.y=1.0-(1.0-fc.y)/fd.y;'+
		'			fc.z=1.0-(1.0-fc.z)/fd.z;'+
		'		}'+
		'	}'+
		'	if(is>0.0&&dis<80.0){'+
		'		fc.x=fc.x+(1.0-fc.x)*(80.0-dis)/1280.0;'+
		'		fc.z=fc.z+(1.0-fc.z)*(80.0-dis)/840.0;'+
		'	}'+
		'	gl_FragColor = fc;'+
		'}'
	});
	WEHOUGAME.bg.face=new THREE.Mesh(new THREE.PlaneGeometry(WEHOUCORE.w,WEHOUCORE.h,0,0),rttshader);
	WEHOUGAME.bg.scene.add(WEHOUGAME.bg.face);
	//加载SE
	WEHOUGAME.addSe(['se/se_boon00.ogg','se/se_kira00.ogg','se/se_boon01.ogg','se/se_lazer01.ogg','se/se_timeout2.ogg','se/se_pldead00.ogg','se/se_cat00.ogg','se/se_enep01.ogg','se/se_nep00.ogg','se/se_don00.ogg','se/se_ch01.ogg']);
	//子弹击中 子弹散开 开扇 开激光 时间到了 MISS SC展开 爆炸 魔炮 开水
	//WEHOUGAME.playSe(6);
	//SP背景
	WEHOUGAME.tempspbg[0]=THREE.ImageUtils.loadTexture(WEHOUCORE.regimg('img/sp_1_bg.jpg'));
	WEHOUGAME.tempspbg[1]=THREE.ImageUtils.loadTexture(WEHOUCORE.regimg('img/sp_1_fl.png'));
	WEHOUGAME.tempspbg[2]=THREE.ImageUtils.loadTexture(WEHOUCORE.regimg('img/sp_2_bg.jpg'));
	WEHOUGAME.tempspbg[3]=THREE.ImageUtils.loadTexture(WEHOUCORE.regimg('img/sp_2_fl.png'));

	//boss和自机范例
	WEHOUGAME.myimglist.add(['img/sysimg_01.png'],1,0);
	WEHOUGAME.myimglist.add(['img/img_player.png'],0,0);
	WEHOUGAME.myimglist.add(['img/eff_line.png'],1,0,0,1);
	WEHOUGAME.myimglist.l[2].map.wrapS=WEHOUGAME.myimglist.l[2].map.wrapT=THREE.RepeatWrapping;
	WEHOUGAME.myimglist.l[2].opacity=0.4;
	//
	WEHOUGAME.myplalist.add(96,96,WEHOUGAME.myimglist.l[0],{cut:[0,1/4,5/8,7/8]});//-------00魔法阵
	WEHOUGAME.myplalist.l[0].position.set(0,0,-2000);
	//lm
	WEHOUGAME.myplalist.add(40,50,WEHOUGAME.myimglist.l[1],{cut:[0,1/8,1,13/16]});//-------01玩家
	WEHOUGAME.myplalist.l[1].addMatrix=new THREE.Matrix4(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);
	WEHOUGAME.myplalist.l[1].addMatrix.elements[2]=1/8;
	WEHOUGAME.myplalist.add(77,77,WEHOUGAME.myimglist.l[0],{cut:[0,1/8,7/8,1]});//-------02判定点
	WEHOUCORE.webgl.scene.add(WEHOUGAME.myplalist.l[1]);
	WEHOUCORE.webgl.scene.add(WEHOUGAME.myplalist.l[2]);
	//继续魔法阵
	var makecur=function(cut,r1,r2){
		var tempg=new THREE.PlaneGeometry(400,12,cut,0);
		for(i=0;i<cut+1;i++){
			var x=WEHOUCORE.a2a(new THREE.Vector2(0,r1),2*Math.PI/cut*i);
			tempg.vertices[i].x=x.x;tempg.vertices[i].y=x.y;
		}
		for(i=0;i<cut+1;i++){
			var x=WEHOUCORE.a2a(new THREE.Vector2(0,r2),2*Math.PI/cut*i);
			tempg.vertices[i+cut+1].x=x.x;tempg.vertices[i+cut+1].y=x.y;
		}
		return tempg;
	}
	var tempg=makecur(59,190,210),tempcut=[0,1,4/8,5/8];
	tempg.faceVertexUvs[0]=[];
	var gridX=59,gridZ=1;
	for(iz=0;iz<1;iz++){
		for(ix=0;ix<59;ix++){
			tempg.faceVertexUvs[0].push([
				new THREE.UV((ix/gridX)*4,tempcut[3]),
				new THREE.UV((ix/gridX)*4,tempcut[2]),
				new THREE.UV(((ix+1)/gridX)*4,tempcut[2]),
				new THREE.UV(((ix+1)/gridX)*4,tempcut[3])
			]);
		}
	}
	WEHOUGAME.myplalist.l[4]=new THREE.Mesh(tempg,WEHOUGAME.myimglist.l[2]);//----4
	WEHOUGAME.myplalist.l[4].position.set(0,0,-1500);
	tempg=makecur(59,212,232),tempcut=[0,1,2/8,3/8];
	tempg.faceVertexUvs[0]=[];
	var gridX=59,gridZ=1;
	for(iz=0;iz<1;iz++){
		for(ix=0;ix<59;ix++){
			tempg.faceVertexUvs[0].push([
				new THREE.UV((ix/gridX)*4,tempcut[3]),
				new THREE.UV((ix/gridX)*4,tempcut[2]),
				new THREE.UV(((ix+1)/gridX)*4,tempcut[2]),
				new THREE.UV(((ix+1)/gridX)*4,tempcut[3])
			]);
		}
	}
	WEHOUGAME.myplalist.l[5]=new THREE.Mesh(tempg,WEHOUGAME.myimglist.l[2]);//----4
	WEHOUGAME.myplalist.l[5].position.set(0,0,-1600);
	
	//canvas相关图预定义
	my2dpiclist = new Array();
	var img = new Image();
	img.src = WEHOUCORE.regimg('img/sysimg_01.png');
	my2dpiclist.push(img);
	img = new Image();
	img.src = WEHOUCORE.regimg('img/imgend.png');
	my2dpiclist.push(img);
	//temp=canvas
	WEHOUGAME.tempcanvas[0] = document.createElement( 'canvas' );//canvas1d-name 符卡名
	WEHOUGAME.tempcanvas[0].width = 455;
	WEHOUGAME.tempcanvas[0].height = 40;
	WEHOUGAME.tempmesh[0]=WEHOUCORE.canvas2mesh(WEHOUGAME.tempcanvas[0]);
	WEHOUGAME.tempcanvas[1] = document.createElement( 'canvas' );//canvas1d-time 时间显示
	WEHOUGAME.tempcanvas[1].width = 280;
	WEHOUGAME.tempcanvas[1].height = 100;
	WEHOUGAME.tempmesh[1]=WEHOUCORE.canvas2mesh(WEHOUGAME.tempcanvas[1]);
	WEHOUGAME.tempcanvas[2] = document.createElement( 'canvas' );//canvas1d-text 对话框
	WEHOUGAME.tempcanvas[2].width = 300;
	WEHOUGAME.tempcanvas[2].height = 50;
	WEHOUGAME.tempmesh[2]=WEHOUCORE.canvas2mesh(WEHOUGAME.tempcanvas[2]);
	WEHOUGAME.tempcanvas[3] = document.createElement( 'canvas' );//canvas1d-rep rep容器
	WEHOUGAME.tempcanvas[3].width = 300;
	WEHOUGAME.tempcanvas[3].height = 300;
	WEHOUGAME.tempmesh[3]=WEHOUCORE.canvas2mesh(WEHOUGAME.tempcanvas[3]);
	WEHOUGAME.tempcanvas[4] = document.createElement( 'canvas' );//load/end 菜单画面
	WEHOUGAME.tempcanvas[4].width = 500;
	WEHOUGAME.tempcanvas[4].height = 550;
	WEHOUGAME.tempmesh[4]=WEHOUCORE.canvas2mesh(WEHOUGAME.tempcanvas[4]);
	WEHOUGAME.tempcanvas[5] = document.createElement( 'canvas' );//boss-stars boss名字与关卡数
	WEHOUGAME.tempcanvas[5].width = 280;
	WEHOUGAME.tempcanvas[5].height = 100;
	WEHOUGAME.tempmesh[5]=WEHOUCORE.canvas2mesh(WEHOUGAME.tempcanvas[5]);
	
	WEHOUGAME.tempcanvas[6] = document.createElement( 'canvas' );//血条
	WEHOUGAME.tempcanvas[6].width = 300;
	WEHOUGAME.tempcanvas[6].height = 6;
	WEHOUGAME.tempmesh[6]=new THREE.Mesh(makecur(59,66,72),new THREE.MeshBasicMaterial({map:new THREE.Texture(WEHOUGAME.tempcanvas[6]),transparent:true,depthWrite:false,depthTest:false}));
	
	//绘制加载界面
	var cxt=WEHOUGAME.tempcanvas[4].getContext("2d");
	cxt.font = 'bold 24px 黑体';
	cxt.textBaseline = 'hanging';
	cxt.textAlign = 'center';
	cxt.fillStyle = "rgba(255,255,255,1)";
	cxt.lineWidth = 2;
	cxt.strokeText('少女加载中', 250, 240);
	cxt.fillText('少女加载中',250, 240);
	WEHOUGAME.tempmesh[4].material.map.needsUpdate = true;
	WEHOUGAME.ui.scene.add(WEHOUGAME.tempmesh[4]);
	WEHOUGAME.ui.renderer.render(WEHOUGAME.ui.scene,WEHOUGAME.ui.camera);
	//
	WEHOUGAME.userInt();
	//内置特效
	WEHOUGAME.mainstory.effect.add([
		{mesh:WEHOUGAME.getBullet(WEHOUGAME.addBullet(WEHOUGAME.getBulletImg(1),30,30,0,'ball',1,[3/8,4/8,7/8,6/8])),period:50,position:vec2(0,0),positionrandom:vec2(0,0),lifetime:100,valpha:-0.01,size:vec2(0,0),vsize:vec2(0.08,0.08),asize:-0.0008,anglerandom:360},
		{mesh:WEHOUGAME.getBullet(WEHOUGAME.addBullet(WEHOUGAME.getBulletImg(1),128,128,0,'ball',1,[8/16,9/16,15/16,1])),period:50,position:vec2(0,0),positionrandom:vec2(50,50),lifetime:100,valpha:-0.01,size:vec2(0,0),vsize:vec2(0.1,0.1),asize:-0.0005,anglerandom:360}
	]);
	//
	WEHOUGAME.intEffect&&WEHOUGAME.intEffect();
	//开始加载
	var img = new Image();
	img.src = WEHOUCORE.regimg('img/imgload.png');
	img.onload = function(){
		//
		var goon2=function(){
			var cxt=WEHOUGAME.tempcanvas[4].getContext("2d");
			cxt.clearRect(0,0,500,550);
			cxt.drawImage(img,0,0,500,550); 
			WEHOUGAME.tempmesh[4].material.map.needsUpdate = true;
			WEHOUGAME.ui.renderer.render(WEHOUGAME.ui.scene,WEHOUGAME.ui.camera);
			var dragdo=function(e){
				e.stopPropagation();
				e.preventDefault();
				inrepstart=1;
				var reader = new FileReader();
				reader.readAsDataURL(e.dataTransfer.files[0]);
				reader.onload=function(e) {
					var urlData=this.result;
					var cxtzz=WEHOUGAME.tempcanvas[3].getContext("2d");
					var imgzz=new Image();
					imgzz.src=urlData;
					imgzz.onload = function(){
						cxtzz.drawImage(imgzz,0,0); 
						WEHOUGAME.repdata=cxtzz.getImageData(0,0,300,300);
						var tn="",pl="";
						for(k=0;WEHOUGAME.repdata.data[k*2+10]!=255;k++){
							tn+=String.fromCharCode(WEHOUGAME.repdata.data[k*2+10])
						}
						for(k=0;WEHOUGAME.repdata.data[k*2+64]!=255;k++){
							pl+=String.fromCharCode(WEHOUGAME.repdata.data[k*2+64])
						}
						var sd=WEHOUGAME.repdata.data[256-6]*0x10000+WEHOUGAME.repdata.data[256-4]*0x100+WEHOUGAME.repdata.data[256-2]*0x1;
						WEHOUCORE.randomseed=sd;
						WEHOUGAME.inrep=true;
						if(tn==WEHOUGAME.mainstory.name){alert("游戏地图为"+tn+"的机师为"+pl+"的一个replay加载成功");}
						else{alert("replay加载成功,但本游戏地图（"+WEHOUGAME.mainstory.name+"）与存档（"+tn+"）不对应");}
						WEHOUGAME.gamestart();
					}
				}; 
				return false;
			}
			var dragdo2=function(e){
				e.stopPropagation();
				e.preventDefault();
			}
			document.body.addEventListener('drop',dragdo,false);
			document.body.addEventListener('dragover',dragdo2,false);
			document.body.onkeydown=function(e){
				if(e.keyCode==90){
					WEHOUGAME.gamestart();
				}else if(e.keyCode==67){
					WEHOUCORE.cheat=1;
				}
			}
		}
		
		//
		var imgsrclist=WEHOUCORE.imglist;
		var gtx=document.getElementById("loadmsg");
		gtx.innerHTML="0/"+imgsrclist.length;
		var goload=function(i){
			if(i<=imgsrclist.length){
			gtx.innerHTML=i+"/"+imgsrclist.length;
			var img = new Image();
			img.src = imgsrclist[i-1];
			img.onload = goload(i+1);
			img.onerror = function(){
				alert("资源"+imgsrclist[i-1]+"加载失败");
			}
			}else{
				gtx.innerHTML="";
				goon2();
			}
		}
		goload(1);
	}
	//3CANVAS的基本设置
	var cxt=WEHOUGAME.tempcanvas[1].getContext("2d");
	cxt.font = 'bold 24px Tahoma';
	cxt.textBaseline = 'hanging';
	cxt.textAlign = 'center';
	cxt.fillStyle = '#ffffff';
	cxt.lineWidth = 2;
	cxt=WEHOUGAME.tempcanvas[0].getContext("2d");
	cxt.font = 'bold 21px 黑体';
	cxt.textBaseline = 'hanging';
	cxt.textAlign = 'right';
	cxt.fillStyle = '#ffffff';
	cxt.lineWidth = 2;
	cxt=WEHOUGAME.tempcanvas[2].getContext("2d");
	cxt.font = 'bold 19px 黑体';
	cxt.textBaseline = 'hanging';
	cxt.textAlign = 'center';
	cxt.fillStyle = '#000000';
	cxt=WEHOUGAME.tempcanvas[5].getContext("2d");
	cxt.font = 'bold 8px Tahoma';
	cxt.textBaseline = 'hanging';
	cxt.textAlign = 'left';
	cxt.fillStyle = '#a8f085';
	cxt.lineWidth = 1;
	//
	
	WEHOUGAME.mainstory.actlist[0]=function(msg,t){//符卡名字
		var cxt;
		if(t==0){
			if(msg==""){
				cxt=WEHOUGAME.tempcanvas[0].getContext("2d");
				cxt.clearRect(0,0,555,40);
				WEHOUGAME.ui.scene.remove(WEHOUGAME.tempmesh[0]);
			}else{
				cxt=WEHOUGAME.tempcanvas[0].getContext("2d");
				cxt.clearRect(0,0,555,40);
				cxt.drawImage(my2dpiclist[0],0,128+64,400,50,200,0,400,50); 
				cxt.strokeText(msg, 450, 8);
				cxt.fillText(msg, 450, 8);
				//新绘制一个NAME
				WEHOUGAME.tempmesh[0].material.map.needsUpdate = true;
				WEHOUGAME.ui.scene.add(WEHOUGAME.tempmesh[0]);
			}
		}
		if(t<=100&&t>20){
			WEHOUGAME.tempmesh[0].position.x=24;
			WEHOUGAME.tempmesh[0].position.y=WEHOUCORE.slowmove[0](t-20,-250,506,80);
		}else if(t<20){
			var gt=19-t;
			WEHOUGAME.tempmesh[0].position.x=24-gt*50;
			WEHOUGAME.tempmesh[0].position.y=-250;
			WEHOUGAME.tempmesh[0].scale.x=gt/5+1;
			WEHOUGAME.tempmesh[0].scale.y=gt/5+1;
			WEHOUGAME.tempmesh[0].material.opacity=(19-gt)/20;
		}
	}
	WEHOUGAME.mainstory.actlist[1]=function(msg,t){//对话
		var num=msg.length/2;
		if(t<=num*110){
			if((t)%110==0){
				var tk=msg,wc=(t)/110;
				if(wc<num){
					cxt=WEHOUGAME.tempcanvas[2].getContext("2d");
					cxt.clearRect(0,0,400,70);
					if(tk[wc*2]==1){
						cxt.drawImage(my2dpiclist[0],0,256,256,44,0,0,300,50);
						cxt.fillText(tk[wc*2+1],150,23);
						WEHOUGAME.tempmesh[2].material.map.needsUpdate = true;
						WEHOUGAME.tempmesh[2].position.x=WEHOUCORE.bspos[0].x;
						WEHOUGAME.tempmesh[2].position.y=WEHOUCORE.bspos[0].y-50
						WEHOUGAME.ui.scene.add(WEHOUGAME.tempmesh[2]);
					}else{
						cxt.drawImage(my2dpiclist[0],0,304,256,44,0,0,300,50);
						cxt.fillText(tk[wc*2+1], 150, 7);
						WEHOUGAME.tempmesh[2].material.map.needsUpdate = true;
						WEHOUGAME.tempmesh[2].position.x=WEHOUCORE.lmpos.x;
						WEHOUGAME.tempmesh[2].position.y=WEHOUCORE.lmpos.y+50
						WEHOUGAME.ui.scene.add(WEHOUGAME.tempmesh[2]);
					}
				}else{
					cxt=WEHOUGAME.tempcanvas[2].getContext("2d");
					cxt.clearRect(0,0,400,70);
					WEHOUGAME.ui.scene.remove(WEHOUGAME.tempmesh[2]);
				}
			}
		}
	}
	WEHOUGAME.mainstory.actlist[2]=function(msg,t,nt){//时间
		if(t==0){
			WEHOUGAME.gotime=msg;
			WEHOUGAME.tempmesh[1].position.y=250;
			WEHOUGAME.tempmesh[1].material.opacity=0;
		}else if(t==nt){
			WEHOUGAME.gotime=0;
		}
	}
	WEHOUGAME.mainstory.actlist[3]=function(msg,t){//场景向量
		if(t==0){
			WEHOUGAME.power=msg;
		}
	}
	WEHOUGAME.mainstory.actlist[4]=function(msg,t){//更改boss贴图
		if(t==0){
			var mc=WEHOUGAME.myplalistbos.l[msg[0]];
			mc.geometry.faceVertexUvs[0][0][0].u=mc.geometry.faceVertexUvs[0][0][1].u=msg[1][0];
			mc.geometry.faceVertexUvs[0][0][2].u=mc.geometry.faceVertexUvs[0][0][3].u=msg[1][1];
			mc.geometry.faceVertexUvs[0][0][0].v=mc.geometry.faceVertexUvs[0][0][3].v=msg[1][2];
			mc.geometry.faceVertexUvs[0][0][1].v=mc.geometry.faceVertexUvs[0][0][2].v=msg[1][3];
			mc.geometry.uvsNeedUpdate=true;
		}
	}
	WEHOUGAME.mainstory.actlist[5]=function(msg,t){//音乐
		if(t==0){
			if(!msg){msg=[];}
			WEHOUGAME.mymusicon=msg;
			if(msg.length){
				msg[0].currentTime=msg[1];
				msg[0].volume=0.3;
				msg[0].play();
			}
		}
	}
	WEHOUGAME.mainstory.actlist[6]=function(msg,t,nt){//boss信息
		if(t==0){
			if(msg[0]!=''){
				var cxt=WEHOUGAME.tempcanvas[5].getContext("2d");
				cxt.clearRect(0,0,280,100);
				cxt.strokeText(msg[0],0,8);
				cxt.fillText(msg[0],0,8);
				var ti,tj,str='',tt=Math.floor(msg[1]/10),tg=msg[1]%10;
				for(ti=1;ti<=tt;ti++){
					str='★★★★★★★★★★';
					cxt.strokeText(str,0,8+ti*14);
					cxt.fillText(str,0,8+ti*14);
				}
				str='';
				for(tj=0;tj<tg;tj++){
					str+='★';
				}
				cxt.strokeText(str,0,8+ti*14);
				cxt.fillText(str,0,8+ti*14);
				WEHOUGAME.tempmesh[5].position.x=-106;
				WEHOUGAME.tempmesh[5].position.y=232;
				WEHOUGAME.tempmesh[5].material.map.needsUpdate = true;
				WEHOUGAME.ui.scene.add(WEHOUGAME.tempmesh[5]);
			}else{
				WEHOUGAME.ui.scene.remove(WEHOUGAME.tempmesh[5]);
			}
		}
		if(t<100&&msg[2]==1){
			WEHOUGAME.tempmesh[5].position.y=232+(100-t)*0.2;
			WEHOUGAME.tempmesh[5].material.opacity=1-(100-t)*0.01;
		}
		if(t==nt&&msg[3]){
			WEHOUGAME.ui.scene.remove(WEHOUGAME.tempmesh[5]);
		}
	}
	WEHOUGAME.mainstory.actlist[7]=function(msg,t){//计分统计设定
		if(t==0){
			WEHOUGAME.topscore+=WEHOUGAME.score;
			if(WEHOUGAME.miss==0){
				WEHOUGAME.topscore+=WEHOUGAME.score*0.5;
			}
			if(WEHOUGAME.topscore>WEHOUGAME.hiscore){
				WEHOUGAME.hiscore=WEHOUGAME.topscore;
				if(window.localStorage){
					localStorage.d6_hs=WEHOUGAME.hiscore;
					WEHOUGAME.hiscore=localStorage.d6_hs;
				}
			}
			//
			WEHOUGAME.miss=0;
			WEHOUGAME.misscut=msg[1];
			WEHOUGAME.score=msg[0];
			if(msg[2]){
				WEHOUGAME.timecut=msg[2];
			}else{
				WEHOUGAME.timecut=0;
			}
			document.getElementById('topscore').innerHTML=WEHOUGAME.topscore;
			document.getElementById('hiscore').innerHTML=WEHOUGAME.hiscore;
			document.getElementById('miss').innerHTML='';
			var mdiv=document.getElementById('misscut');
			if(WEHOUGAME.misscut<1){
				mdiv.innerHTML=WEHOUGAME.misscut*100+'%';
			}else{
				mdiv.innerHTML='';
			}
		}
	}
	WEHOUGAME.mainstory.actlist[8]=function(msg,t){//关卡title
		if(t==msg[3]){
			msg[0].position.set(0,60,10000);
			msg[1].position.set(0,110,11000);
			msg[2].position.set(140,60,9000);
			msg[0].scale.z=0;
			msg[1].scale.z=0;
			msg[2].scale.z=0;
			WEHOUCORE.webgl.scene.add(msg[0]);
			WEHOUCORE.webgl.scene.add(msg[1]);
			WEHOUCORE.webgl.scene.add(msg[2]);
		}else if(t==msg[4]){
			WEHOUCORE.webgl.scene.remove(msg[0]);
			WEHOUCORE.webgl.scene.remove(msg[1]);
			WEHOUCORE.webgl.scene.remove(msg[2]);
		}else{
			if(t-msg[3]<=50){
				msg[1].scale.z=(t-msg[3])/50;
				msg[2].scale.z=(t-msg[3])/50;
				msg[2].rotation.z=(t-msg[3])/50-1;
			}
			if(t-msg[3]<=90&&t-msg[3]>40){
				msg[0].scale.z=(t-msg[3]-40)/50;
			}
			if(msg[4]-t<=50){
				msg[0].scale.z=(msg[4]-t)/50;
				msg[1].scale.z=(msg[4]-t)/50;
				msg[2].scale.z=(msg[4]-t)/50;
			}
		}
	}
	var nowplay_talk=0,timeoffset=0,presscd=0;
	WEHOUGAME.mainstory.actlist[9]=function(msg,t,nt){//显示人物立绘和对话
		if(t==0){//填充DOM
			var d=document.getElementById('game-talk'),str='',count_b=0;
			nowplay_talk=0;timeoffset=0,presscd=0;
			for(var kk=0;kk<msg[0].length-1;kk++){
				str+='<div id=talkface_'+kk+" style='background-image:url(img/face.png);background-position:-"+msg[0][kk][2]+"px -"+msg[0][kk][3]+"px;width:"+msg[0][kk][4]+'px;height:'+msg[0][kk][5]+"px;position:absolute;bottom:0;"+(msg[0][kk][1]==0?'left:0;':'right:'+(200-count_b*60)+'px;')+"'></div>";
				if(msg[0][kk][1]){count_b++;}
			}
			str+="<div id=talkface_msg style='background-color:rgba(255,238,170,0.9);border:3px solid #000;position:absolute;bottom:100px;font-size:20px;font-family:黑体;padding:10px 20px;border-radius:14px;'>我说，这是测试的文字。<br>你明白我的意思啦~</div>";
			d.innerHTML=str;
			if(msg[0][kk][0]){presscd=99999;}
		}else if(t==nt){
			document.getElementById('game-talk').innerHTML='';
		}
		for(kk=1;kk<msg.length;kk++){
			if(t+timeoffset==msg[kk][0]){
				nowplay_talk=kk;
				for(var ll=0;ll<msg[0].length-1;ll++){
					var d=document.getElementById('talkface_'+ll);
					if(ll==msg[kk][1]){
						d.style.opacity=1;
						d.style.margin='0';
					}else{
						d.style.opacity=0.75;
						d.style.margin='0 -50px -20px -50px';
					}
				}
				var d=document.getElementById('talkface_msg');
				if(msg[0][msg[kk][1]][1]){
					d.style.right='300px';
					d.style.left='';
				}else{
					d.style.left='150px';
					d.style.right='';
				}
				d.innerHTML=msg[kk][2];
			}
		}
		if(WEHOUGAME.kd[5]){
			if(presscd){presscd--;return;}
			if(msg[nowplay_talk+1]){
				timeoffset=msg[nowplay_talk+1][0]-t-1;
			}else{
				WEHOUGAME.mainstory.storyCT('jumpnext');
				presscd=99999;
				return;
			}
			presscd=10;
		}
	}
	WEHOUGAME.mainstory.actlist[10]=function(msg,t,nt){//boss血条创建
		var bossid=msg[0],v=WEHOUCORE.bshit[bossid];
		var cxt=WEHOUGAME.tempcanvas[6].getContext("2d");
		var runcut=function(){
			for(xxx=1;xxx<msg[1].length-1;xxx++){
				cxt.fillStyle='#63f';
				cxt.fillRect(300*msg[1][xxx]-1,0,3,6);
				cxt.fillStyle='#fff';
				cxt.fillRect(300*msg[1][xxx],1,1,4);
			}
		}
		if(t==0){
			cxt.clearRect(0,0,300,6);
			cxt.fillStyle='#f00';
			cxt.fillRect(0,1,300,1);
			cxt.fillRect(0,4,300,1);
			runcut();
			WEHOUGAME.tempmesh[6].material.map.needsUpdate=true;
			WEHOUGAME.ui.scene.add(WEHOUGAME.tempmesh[6]);
			WEHOUGAME.tempmesh[6].position.z=-100;
		}else if(t==nt&&msg[3]){
			WEHOUGAME.ui.scene.remove(WEHOUGAME.tempmesh[6]);
		}
		if(v>=0){
			cxt.clearRect(0,2,300,2);
			cxt.fillStyle='#fff';
			if(msg[2]!=99){cxt.fillRect(0,2,300*((msg[1][msg[2]]-msg[1][msg[2]+1])*v+msg[1][msg[2]+1]),2);}
			else{cxt.fillRect(0,2,300*v,2);}
			runcut();
			WEHOUGAME.tempmesh[6].material.map.needsUpdate=true;
		}else if(v==-3&&msg[3]){
			WEHOUGAME.ui.scene.remove(WEHOUGAME.tempmesh[6]);
		}
		WEHOUGAME.tempmesh[6].position.x=WEHOUCORE.bspos[bossid].x;
		WEHOUGAME.tempmesh[6].position.y=WEHOUCORE.bspos[bossid].y;
	}
	WEHOUGAME.mainstory.actlist[11]=function(msg,t,nt){//SP背景
		if(t==1){
			WEHOUGAME.playSe(6);
			WEHOUGAME.onsp=true;
			WEHOUGAME.bg.uniforms.texture1.value=WEHOUGAME.tempspbg[2*msg[0]];
			WEHOUGAME.bg.uniforms.texture2.value=WEHOUGAME.tempspbg[2*msg[0]+1];
			WEHOUGAME.bg.uniforms.texture1.value.wrapS=WEHOUGAME.bg.uniforms.texture1.value.wrapT=THREE.RepeatWrapping;
			WEHOUGAME.bg.uniforms.texture2.value.wrapS=WEHOUGAME.bg.uniforms.texture2.value.wrapT=THREE.RepeatWrapping;
			WEHOUGAME.bg.uniforms.isover.value=1.0;
			if(msg[1]){
				var t=WEHOUGAME.bg.uniforms.move.value;
				t.x=msg[1].x;t.y=msg[1].y;t.z=msg[1].z;
			}
		}
		if(t==nt){
			WEHOUGAME.onsp=false;
			WEHOUGAME.bg.uniforms.texture1.value=WEHOUGAME.bg.rtt;
			WEHOUGAME.bg.uniforms.isover.value=0.0;
		}
	}
	WEHOUGAME.mainstory.actlist[12]=function(msg,t,nt){//黑掉
		if(t==1){
			WEHOUGAME.boss_black.x=3;
		}
	}
	//
	WEHOUCORE.deal.cheathit=WEHOUCORE.deal.hit=function(){//处理撞击
		if(!WEHOUGAME.misscd){
			WEHOUGAME.playSe(5);
			WEHOUGAME.misscd=60;
			WEHOUGAME.miss++;
			WEHOUGAME.missall++;
			if(WEHOUGAME.misscut<1){
				WEHOUGAME.score=Math.floor(WEHOUGAME.misscut*WEHOUGAME.score);
				document.getElementById('miss').innerHTML=WEHOUGAME.miss;
				WEHOUGAME.mainstory.effect.push(0,WEHOUCORE.lmpos);
			}
		}
	}
	WEHOUCORE.deal.graze=function(){}
	WEHOUCORE.deal.hitting=function(){
		if(!WEHOUGAME.timecut){WEHOUGAME.score+=130;}
	}
	WEHOUCORE.deal.partend=function(){
		t=WEHOUGAME.myplalistbos.l[0];
		t.now_video='normal';
		t.now_time=0;
		t.now_mod=1;
	}
	WEHOUCORE.webgl.renderer.clear();
}
WEHOUGAME.puase=function(){
	if(WEHOUGAME.onpause){
		WEHOUGAME.onpause=false;
		if(WEHOUGAME.mymusicon.length){WEHOUGAME.mymusicon[0].play();}
		WEHOUGAME.render();
	}else{
		WEHOUGAME.onpause=true;
		if(WEHOUGAME.mymusicon.length){WEHOUGAME.mymusicon[0].pause();}
	}
}
WEHOUGAME.gamestart=function(){
	var cxt=WEHOUGAME.tempcanvas[4].getContext("2d");
	cxt.clearRect(0,0,800,600);
	WEHOUGAME.ui.scene.remove(WEHOUGAME.tempmesh[4]);
	//
	if(window.localStorage&&localStorage.d6_hs){
		WEHOUGAME.hiscore=localStorage.d6_hs;
	}//
	WEHOUGAME.kd=[0,0,0,0,0,0];
	if(!WEHOUGAME.inrep){
		document.body.onkeydown=function(e){
			if(e.keyCode==37){WEHOUGAME.kd[0]=1;}
			if(e.keyCode==38){WEHOUGAME.kd[1]=1;}
			if(e.keyCode==39){WEHOUGAME.kd[2]=1;}
			if(e.keyCode==40){WEHOUGAME.kd[3]=1;}
			if(e.keyCode==90){WEHOUGAME.kd[5]=1;}
			if(e.keyCode==88){WEHOUGAME.kd[4]=1;history.go(0);}
			if(e.keyCode==27){WEHOUGAME.puase()}
			WEHOUGAME.kd[4]=e.shiftKey;
		}
		document.body.onkeyup=function(e){
			if(e.keyCode==37){WEHOUGAME.kd[0]=0;}
			if(e.keyCode==38){WEHOUGAME.kd[1]=0;}
			if(e.keyCode==39){WEHOUGAME.kd[2]=0;}
			if(e.keyCode==40){WEHOUGAME.kd[3]=0;}
			if(e.keyCode==90){WEHOUGAME.kd[5]=0;}
			if(e.keyCode==88){WEHOUGAME.kd[4]=0;}
			WEHOUGAME.kd[4]=e.shiftKey;
		}	
	}else{
		document.body.onkeydown=function(e){
			if(e.keyCode==88){history.go(0);}
		}
		document.body.onkeyup=function(e){
		}
	}
	cxt=WEHOUGAME.tempcanvas[3].getContext("2d");
	if(!WEHOUGAME.inrep){
		WEHOUGAME.repdata=cxt.createImageData(300,300);
	}else{
		
	}
	//
	WEHOUGAME.render();
}
WEHOUGAME.gameover=function(){
	cxt=WEHOUGAME.tempcanvas[4].getContext("2d");
	cxt.drawImage(my2dpiclist[1],0,0,500,550);
	cxt.font = 'normal 22px Tahoma';
	cxt.textAlign = 'left';
	cxt.fillStyle = '#ddd';
	cxt.lineWidth = 6;
	//
	cxt.strokeText(WEHOUGAME.topscore,266,230-5);
	cxt.fillText(WEHOUGAME.topscore,266,230-5);
	
	cxt.strokeText(WEHOUGAME.missall,266,270-10);
	cxt.fillText(WEHOUGAME.missall,266,270-10);
	//localStorage
	if(window.localStorage){
		localStorage.d6_hs=WEHOUGAME.hiscore;
	}
	//
	WEHOUGAME.tempmesh[4].material.map.needsUpdate = true;
	WEHOUGAME.ui.scene.add(WEHOUGAME.tempmesh[4]);
	WEHOUGAME.ui.renderer.render(WEHOUGAME.ui.scene,WEHOUGAME.ui.camera);
	document.body.onkeydown=function(e){
		if(e.keyCode==90){
			history.go(0);
		}else if(e.keyCode==67){
			var gsd=WEHOUCORE.randomseed;
			var player=prompt('请输入您的名字:');
			if(!player){
				history.go(0);
				return;
			}
			if(player.length>30){
				player=player.substr(0,30);
			}
			
			for(k=0;k<WEHOUGAME.mainstory.name.length;k++){//地图名字从10开始
				WEHOUGAME.repdata.data[k*2+10]=WEHOUGAME.mainstory.name.charCodeAt(k)
				WEHOUGAME.repdata.data[k*2+11]=255;
			}
			WEHOUGAME.repdata.data[k*2+10]=255;
			WEHOUGAME.repdata.data[k*2+11]=255;
			WEHOUGAME.repdata.data[k*2+12]=255;
			WEHOUGAME.repdata.data[k*2+13]=255;
			for(k=0;k<player.length;k++){//玩家名字从64开始
				WEHOUGAME.repdata.data[k*2+64]=player.charCodeAt(k)
				WEHOUGAME.repdata.data[k*2+65]=255;
			}
			WEHOUGAME.repdata.data[k*2+64]=255;
			WEHOUGAME.repdata.data[k*2+65]=255;
			WEHOUGAME.repdata.data[k*2+66]=255;
			WEHOUGAME.repdata.data[k*2+67]=255;
			WEHOUGAME.repdata.data[256-8]=255;//种子从256-8开始
			WEHOUGAME.repdata.data[256-7]=255;
			WEHOUGAME.repdata.data[256-6]=(gsd&0x0000ff0000)/0x10000;
			WEHOUGAME.repdata.data[256-5]=255;
			WEHOUGAME.repdata.data[256-4]=(gsd&0x000000ff00)/0x100;
			WEHOUGAME.repdata.data[256-3]=255;
			WEHOUGAME.repdata.data[256-2]=(gsd&0x00000000ff)/0x1;
			WEHOUGAME.repdata.data[256-1]=255;
			var cxt=WEHOUGAME.tempcanvas[3].getContext("2d");
			cxt.putImageData(WEHOUGAME.repdata,0,0);
			alert('正在输出replay图片，右键保存此图片即可')
			window.open(WEHOUGAME.tempcanvas[3].toDataURL('image/png'));
			history.go(0);
		}
	}
}

WEHOUGAME.render=function() {
	
	if((!WEHOUCORE.gameover)&&(!WEHOUGAME.onpause)){
		requestAnimationFrame(WEHOUGAME.render);
	}else{
		if(WEHOUCORE.gameover){
			WEHOUGAME.gameover();
			return 0;
		}
	}
	//运算
	if(WEHOUCORE.time%WEHOUGAME.slowtime==0){
		var mv;
		if(WEHOUGAME.inrep){
			var g=WEHOUGAME.repdata.data[WEHOUCORE.time*2+256];
			if(g&1){WEHOUGAME.kd[0]=1}else{WEHOUGAME.kd[0]=0}
			if(g&2){WEHOUGAME.kd[1]=1}else{WEHOUGAME.kd[1]=0}
			if(g&4){WEHOUGAME.kd[2]=1}else{WEHOUGAME.kd[2]=0}
			if(g&8){WEHOUGAME.kd[3]=1}else{WEHOUGAME.kd[3]=0}
			if(g&16){WEHOUGAME.kd[4]=1}else{WEHOUGAME.kd[4]=0}
			if(g&32){WEHOUGAME.kd[5]=1}else{WEHOUGAME.kd[5]=0}
		}else{
			WEHOUGAME.repdata.data[WEHOUCORE.time*2+256-1]=255;
			WEHOUGAME.repdata.data[WEHOUCORE.time*2+256]=(WEHOUGAME.kd[0]*1+WEHOUGAME.kd[1]*2+WEHOUGAME.kd[2]*4+WEHOUGAME.kd[3]*8+WEHOUGAME.kd[4]*16+WEHOUGAME.kd[5]*32);
			WEHOUGAME.repdata.data[WEHOUCORE.time*2+256+1]=255;
			WEHOUGAME.repdata.data[WEHOUCORE.time*2+256+3]=255;
		}
		if(WEHOUGAME.kd[4]){mv=2}
		else{mv=6.8}
		if(WEHOUGAME.kd[0]+WEHOUGAME.kd[1]+WEHOUGAME.kd[2]+WEHOUGAME.kd[3]>=2){mv*=0.707;}
		if(WEHOUGAME.kd[0]){WEHOUCORE.lmpos.x-=mv;}
		if(WEHOUGAME.kd[1]){WEHOUCORE.lmpos.y+=mv;}
		if(WEHOUGAME.kd[2]){WEHOUCORE.lmpos.x+=mv;}
		if(WEHOUGAME.kd[3]){WEHOUCORE.lmpos.y-=mv;}
		if(WEHOUGAME.power){
			var gtx=(WEHOUGAME.power.x>=10000)?WEHOUCORE.lmpos.x+WEHOUGAME.power.x-20000:WEHOUGAME.power.x;
			var gty=(WEHOUGAME.power.y>=10000)?WEHOUCORE.lmpos.y+WEHOUGAME.power.y-20000:WEHOUGAME.power.y;
			var v=WEHOUGAME.power.z,ds=Math.sqrt((gtx-WEHOUCORE.lmpos.x)*(gtx-WEHOUCORE.lmpos.x)+(gty-WEHOUCORE.lmpos.y)*(gty-WEHOUCORE.lmpos.y));
			if(v<ds){
				WEHOUCORE.lmpos.x+=(gtx-WEHOUCORE.lmpos.x)/ds*v;
				WEHOUCORE.lmpos.y+=(gty-WEHOUCORE.lmpos.y)/ds*v;
			}else{
				WEHOUCORE.lmpos.x=gtx;WEHOUCORE.lmpos.y=gty;
			}
		}
		var ww=WEHOUCORE.w/2-20,hh=WEHOUCORE.h/2-20;
		if(WEHOUCORE.lmpos.x>ww){WEHOUCORE.lmpos.x=ww}
		if(WEHOUCORE.lmpos.x<-ww){WEHOUCORE.lmpos.x=-ww}
		if(WEHOUCORE.lmpos.y>hh){WEHOUCORE.lmpos.y=hh}
		if(WEHOUCORE.lmpos.y<-hh){WEHOUCORE.lmpos.y=-hh}
		
		var lmm=WEHOUGAME.myplalist.l[1];
		lmm.position.set(WEHOUCORE.lmpos.x,WEHOUCORE.lmpos.y,1);
		//lmm.addMatrix.elements[8]=Math.floor(WEHOUCORE.time/6)%8;
		//lmm.addMatrix.elements[9]=0;
		if(WEHOUGAME.kd[0]&&WEHOUGAME.lmturn>-4){WEHOUGAME.lmturn--}
		else if(WEHOUGAME.kd[2]&&WEHOUGAME.lmturn<4){WEHOUGAME.lmturn++}
		else if(WEHOUGAME.lmturn<0){WEHOUGAME.lmturn++}
		else if(WEHOUGAME.lmturn>0){WEHOUGAME.lmturn--}
		if(WEHOUGAME.lmturn==0){
			lmm.addMatrix.elements[8]=Math.floor(WEHOUCORE.time/6)%8;
			lmm.addMatrix.elements[9]=0;
		}else if(WEHOUGAME.lmturn==4){
			lmm.addMatrix.elements[8]=Math.floor(WEHOUCORE.time/6)%4+4;
			lmm.addMatrix.elements[9]=4;
		}else if(WEHOUGAME.lmturn==-4){
			lmm.addMatrix.elements[8]=Math.floor(WEHOUCORE.time/6)%4+4;
			lmm.addMatrix.elements[9]=2;
		}else if(WEHOUGAME.lmturn>0){
			lmm.addMatrix.elements[8]=Math.floor(WEHOUGAME.lmturn);
			lmm.addMatrix.elements[9]=4;
		}else if(WEHOUGAME.lmturn<0){
			lmm.addMatrix.elements[8]=Math.floor(-WEHOUGAME.lmturn);
			lmm.addMatrix.elements[9]=2;
		}
		//
		var lmm=WEHOUGAME.myplalist.l[2];
		lmm.rotation.z+=0.02;
		WEHOUGAME.mainstory.deal();
		lmm.position.set(WEHOUCORE.lmpos.x,WEHOUCORE.lmpos.y,WEHOUCORE.zcounter());
		//boss变色
		var t=WEHOUGAME.boss_color;
		t.x=(t.x-0.5)*2;
		t.y=(t.y-0.25)*2;
		t.z=(t.z-0.25)*2;
		if(t.z==0&&t.x>0){
			t.x-=0.005;t.y+=0.005;
			if(t.x<0){t.x=0}
			if(t.y>1){t.y=1}
		}
		if(t.x==0&&t.y>0){
			t.y-=0.005;t.z+=0.005;
			if(t.y<0){t.y=0}
			if(t.z>1){t.z=1}
		}
		if(t.y==0&&t.z>0){
			t.z-=0.005;t.x+=0.005;
			if(t.z<0){t.z=0}
			if(t.x>1){t.x=1}
		}
		t.x=t.x*0.5+0.5;
		t.y=t.y*0.5+0.25;
		t.z=t.z*0.5+0.25;
		//倒计时画面处理
		if(WEHOUGAME.gotime>0){
			if(WEHOUGAME.gotime==999999){
				var tms='∞';
			}else{
				WEHOUGAME.gotime--;
				var tms=(WEHOUGAME.gotime/60).toFixed(1);
			}
			if(tms!=WEHOUGAME.lastshowtime){
				cxt=WEHOUGAME.tempcanvas[1].getContext("2d");
				cxt.clearRect(0,0,280,100);
				cxt.strokeText(tms+'s', 150, 2);
				cxt.fillText(tms+'s', 150, 2);
				WEHOUGAME.tempmesh[1].material.map.needsUpdate=true;
				WEHOUGAME.lastshowtime=tms;
				if(tms<10&&tms%1==0){WEHOUGAME.playSe(4);}
			}
			if(WEHOUGAME.tempmesh[1].position.y>200){
				WEHOUGAME.tempmesh[1].position.y-=0.5;
				WEHOUGAME.tempmesh[1].material.opacity+=0.008;
			}else{
				WEHOUGAME.tempmesh[1].position.y=200;
			}
			WEHOUGAME.ui.scene.add(WEHOUGAME.tempmesh[1]);
		}else if(WEHOUGAME.gotime==0){
			WEHOUGAME.gotime=-1;
			cxt=WEHOUGAME.tempcanvas[1].getContext("2d");
			cxt.clearRect(0,0,180,100);
			WEHOUGAME.ui.scene.remove(WEHOUGAME.tempmesh[1]);
		}
		//音乐处理
		if(WEHOUGAME.mymusicon.length){
			var msg=WEHOUGAME.mymusicon;
			if(msg[0].currentTime>=msg[2]){
				if(!msg[3]){
					msg[0].pause();
				}else{
					msg[0].currentTime=msg[3];
					msg[0].play();
				}
			}
		}
		//分数
		WEHOUGAME.misscd>0?WEHOUGAME.misscd--:0;
		if(WEHOUGAME.score+WEHOUGAME.timecut>0){
			WEHOUGAME.score+=WEHOUGAME.timecut;
		}else{
			WEHOUGAME.score=0;
		}
		document.getElementById('score').innerHTML=WEHOUGAME.score;
		//背景处理
		
		var ww=WEHOUCORE.w/2+30,hh=WEHOUCORE.h/2+30;
		if(WEHOUCORE.bspos[0].x>-ww&&WEHOUCORE.bspos[0].x<ww&&WEHOUCORE.bspos[0].y>-hh&&WEHOUCORE.bspos[0].y<hh){
			WEHOUGAME.bg.uniforms.is.value=1.1;
		}else{
			WEHOUGAME.bg.uniforms.is.value=-1.1;
		}
		WEHOUGAME.bg.uniforms.time.value+=0.13;
		WEHOUGAME.bg.uniforms.uvb.value.x=WEHOUCORE.bspos[0].x;
		WEHOUGAME.bg.uniforms.uvb.value.y=WEHOUCORE.bspos[0].y;
		
		WEHOUGAME.bg.callback&&WEHOUGAME.bg.callback(WEHOUCORE.time);
	}
	//渲染
	if(WEHOUCORE.time%WEHOUGAME.renderintime==1){
		WEHOUGAME.runSe();
		WEHOUGAME.myshaderlist.deal();
		if(!WEHOUGAME.onsp){WEHOUGAME.bg.renderer.render(WEHOUGAME.bg.bscene,WEHOUGAME.bg.bcamera,WEHOUGAME.bg.rtt,true);}
		WEHOUGAME.bg.renderer.render(WEHOUGAME.bg.scene,WEHOUGAME.bg.camera);
		WEHOUCORE.webgl.renderer.render(WEHOUCORE.webgl.scene,WEHOUCORE.webgl.camera);
		WEHOUGAME.ui.renderer.render(WEHOUGAME.ui.scene,WEHOUGAME.ui.camera);
		
		stats.update();
	}
	WEHOUCORE.time++;
}