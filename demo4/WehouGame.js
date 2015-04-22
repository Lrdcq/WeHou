//-----------------------------
//---------wehou_game----------
//-----------v 0.11------------
//--------sp for demo4---------
//-----------------------------
var WEHOUGAME={}
WEHOUGAME.renderintime=2;
WEHOUGAME.gotime=0;
WEHOUGAME.power=0;

WEHOUGAME.graze=0;
WEHOUGAME.miss=0;
WEHOUGAME.misscd=0;
WEHOUGAME.misscut=0;
WEHOUGAME.timecut=0;
WEHOUGAME.score=0;
WEHOUGAME.topscore=0;
WEHOUGAME.hiscore=0;

WEHOUGAME.kd=[];
WEHOUGAME.inrep=false;
WEHOUGAME.repdata;
WEHOUGAME.tempcanvas = new Array();
WEHOUGAME.tempmesh = new Array();
WEHOUGAME.myplalist=new WEHOUCORE.planeSet();
WEHOUGAME.myimglist=new WEHOUCORE.imgSet();
WEHOUGAME.myplalistbre=new WEHOUCORE.planeSet();
WEHOUGAME.myimglistbre=new WEHOUCORE.imgSet();
WEHOUGAME.myplalistbos=new WEHOUCORE.planeSet();
WEHOUGAME.myimglistbos=new WEHOUCORE.imgSet();
WEHOUGAME.mymusiclist=new Array();
WEHOUGAME.myselist=new Array();
WEHOUGAME.mainstory=new WEHOUCORE.storySet("unknown");
WEHOUGAME.selfcont=new WEHOUCORE.selfSet();
WEHOUGAME.addBulletImg=function(list,rs){
	WEHOUGAME.myimglistbre.add(list,rs===undefined?1:rs,1,1);
}
WEHOUGAME.getBulletImg=function(n){
	return WEHOUGAME.myimglistbre.l[n];
}
WEHOUGAME.addBullet=function(img,w,h,d,type,repeat,cut,rt){
	WEHOUGAME.myplalistbre.add(w,h,img,{d:d,end:(type=='laser'?1:0),rep:repeat||1,cut:(cut?cut:null),rt:(rt?1:0)});
}
WEHOUGAME.getBullet=function(n){
	return WEHOUGAME.myplalistbre.l[n];
}
WEHOUGAME.addBossImg=function(list){
	WEHOUGAME.myimglistbos.add(list,0,0);
}
WEHOUGAME.getBossImg=function(n){
	return WEHOUGAME.myimglistbos.l[n];
}
WEHOUGAME.addBoss=function(img,w,h,cut){
	var n=WEHOUGAME.myplalistbos.add(w,h,img,{cut:cut});
	WEHOUGAME.myplalistbos.l[n].add(WEHOUGAME.myplalist.l[0].clone());
	WEHOUGAME.myplalistbos.l[n].act=function(){
		var sl=Math.sin(WEHOUCORE.time/50)*0.4;
		var mc=this.children[0];
		mc.rotation.z+=0.1;
		mc.scale.x=2.2+sl;
		mc.scale.y=2.2+sl;
	}
	WEHOUGAME.myplalistbos.l[n].end=function(){
		var mc=this.children[0];
		mc.rotation.z+=0.1;
		mc.scale.x+=0.05;
		mc.scale.y+=0.05;
		if(mc.material.opacity>0){mc.material.opacity-=0.005;}
	}
}
WEHOUGAME.getBoss=function(n){
	return WEHOUGAME.myplalistbos.l[n];
}
WEHOUGAME.addMusic=function(name,loop){
	var msi=new Audio(name);
	if(loop){msi.loop=1;}
	WEHOUGAME.mymusiclist.push(msi);
}
WEHOUGAME.getMusic=function(n){
	return WEHOUGAME.mymusiclist[n];
}
WEHOUGAME.addSe=function(name,loop){
	var msi=new Audio(name);
	msi.volume=0.5;
	if(loop){msi.loop=1;}
	WEHOUGAME.myselist.push(msi);
}
WEHOUGAME.getSe=function(n){
	return WEHOUGAME.myselist[n];
}
WEHOUGAME.userInt=function(){}
WEHOUGAME.intGame=function(dom){
	dom.innerHTML+="<div id='canvas-core' style='border:3px solid #000;width:"+(WEHOUCORE.w)+"px;height:"+(WEHOUCORE.h)+"px;position:absolute;top:0;left:0;'></div><div id='canvas-ui' style='border:3px solid #000;width:"+(WEHOUCORE.w)+"px;height:"+(WEHOUCORE.h)+"px;position:absolute;top:0;left:0;'></div><div id='loadmsg'>加载基础代码中</div>";
	dom.innerHTML+="<div id='hiscore' style='position:absolute;top:64px;left:605px;width:130px;text-align:right;font-size:22px;font-family:Tahoma;color:#aaa;font-weight:normal;text-shadow:#000 2px 0 0,#000 -2px 0 0,#000 0 2px 0,#000 0 -2px 0;'></div><div id='topscore' style='position:absolute;top:97px;left:605px;width:130px;text-align:right;font-size:22px;font-family:Tahoma;color:#ddd;font-weight:normal;text-shadow:#000 2px 0 0,#000 -2px 0 0,#000 0 2px 0,#000 0 -2px 0;'></div><div id='score' style='position:absolute;top:130px;left:605px;width:130px;text-align:right;font-size:22px;font-family:Tahoma;color:#ddd;font-weight:normal;text-shadow:#000 2px 0 0,#000 -2px 0 0,#000 0 2px 0,#000 0 -2px 0;'></div><div id='misscut' style='position:absolute;top:166px;left:605px;width:130px;text-align:right;font-size:22px;font-family:Tahoma;color:#9f9;font-weight:normal;text-shadow:#000 2px 0 0,#000 -2px 0 0,#000 0 2px 0,#000 0 -2px 0;'></div></div><div id='miss' style='position:absolute;top:202px;left:605px;width:130px;text-align:right;font-size:22px;font-family:Tahoma;color:#f99;font-weight:normal;text-shadow:#000 2px 0 0,#000 -2px 0 0,#000 0 2px 0,#000 0 -2px 0;'></div>";
	if(!document.createElement('canvas').getContext( "experimental-webgl")){alert('你的浏览器并不能很好的支持本游戏。\n请更换为chrome');WEHOUCORE.time=-10;}
	WEHOUCORE.initcoreenv(document.getElementById('canvas-core'));
	//UI
	var dom=document.getElementById('canvas-ui');
	var width = dom.clientWidth;
	var height = dom.clientHeight;
	WEHOUGAME.ui={};
	WEHOUGAME.ui.renderer=new THREE.WebGLRenderer({antialias:true});
	WEHOUGAME.ui.renderer.setSize(width, height);
	dom.appendChild(WEHOUGAME.ui.renderer.domElement);
	WEHOUGAME.ui.camera=new THREE.OrthographicCamera(-WEHOUCORE.w/2,WEHOUCORE.w/2,WEHOUCORE.h/2,-WEHOUCORE.h/2,-20000,20000);
	WEHOUGAME.ui.camera.lookAt(new THREE.Vector3( 0, 0, 0 ));
	WEHOUGAME.ui.scene = new THREE.Scene();
	//
	WEHOUGAME.myimglist.add(['img/sysimg_01.png'],1,0);
	WEHOUGAME.myimglist.add(['img/img_player.png'],0,0);
	//SE
	WEHOUGAME.addSe('se/se_pldead00.ogg',0);//MISS声音
	//常用面库
	WEHOUGAME.myplalist.add(108,108,WEHOUGAME.myimglist.l[0],{cut:[0,1/4,5/8,7/8]});//-------00魔法阵
	WEHOUGAME.myplalist.l[0].position.set(0,0,-2000);
	//lm
	WEHOUGAME.myplalist.add(40,50,WEHOUGAME.myimglist.l[1]);//-------01player
	WEHOUGAME.myplalist.add(77,77,WEHOUGAME.myimglist.l[0],{cut:[0,1/8,7/8,1]});//-------02
	WEHOUGAME.myplalist.l[2].position.set(0,0,20000);
	WEHOUGAME.myplalist.add(55,55,WEHOUGAME.myimglist.l[0],{cut:[1/8,1/4,7/8,1]});//-------03
	WEHOUGAME.myplalist.l[3].position.set(0,0,-500);
	WEHOUGAME.myplalist.l[1].add(WEHOUGAME.myplalist.l[2]);
	WEHOUGAME.myplalist.l[1].add(WEHOUGAME.myplalist.l[3]);
	WEHOUCORE.webgl.scene.add(WEHOUGAME.myplalist.l[1]);
	//
	my2dpiclist = new Array();
	var img = new Image();
	img.src = WEHOUCORE.regimg('img/sysimg_01.png');
	my2dpiclist.push(img);
	img = new Image();
	img.src = WEHOUCORE.regimg('img/imgend.png');
	my2dpiclist.push(img);
	//temp=canvas
	WEHOUGAME.tempcanvas[0] = document.createElement( 'canvas' );//canvas1d-name
	WEHOUGAME.tempcanvas[0].width = 455;
	WEHOUGAME.tempcanvas[0].height = 40;
	WEHOUGAME.tempmesh[0]=WEHOUCORE.canvas2mesh(WEHOUGAME.tempcanvas[0]);
	WEHOUGAME.tempcanvas[1] = document.createElement( 'canvas' );//canvas1d-time
	WEHOUGAME.tempcanvas[1].width = 280;
	WEHOUGAME.tempcanvas[1].height = 100;
	WEHOUGAME.tempmesh[1]=WEHOUCORE.canvas2mesh(WEHOUGAME.tempcanvas[1]);
	WEHOUGAME.tempcanvas[2] = document.createElement( 'canvas' );//canvas1d-text
	WEHOUGAME.tempcanvas[2].width = 300;
	WEHOUGAME.tempcanvas[2].height = 50;
	WEHOUGAME.tempmesh[2]=WEHOUCORE.canvas2mesh(WEHOUGAME.tempcanvas[2]);
	WEHOUGAME.tempcanvas[3] = document.createElement( 'canvas' );//canvas1d-rep
	WEHOUGAME.tempcanvas[3].width = 300;
	WEHOUGAME.tempcanvas[3].height = 300;
	WEHOUGAME.tempmesh[3]=WEHOUCORE.canvas2mesh(WEHOUGAME.tempcanvas[3]);
	WEHOUGAME.tempcanvas[4] = document.createElement( 'canvas' );//load/end
	WEHOUGAME.tempcanvas[4].width = 500;
	WEHOUGAME.tempcanvas[4].height = 550;
	WEHOUGAME.tempmesh[4]=WEHOUCORE.canvas2mesh(WEHOUGAME.tempcanvas[4]);
	WEHOUGAME.tempcanvas[5] = document.createElement( 'canvas' );//boss-stars
	WEHOUGAME.tempcanvas[5].width = 280;
	WEHOUGAME.tempcanvas[5].height = 100;
	WEHOUGAME.tempmesh[5]=WEHOUCORE.canvas2mesh(WEHOUGAME.tempcanvas[5]);
	
	//
	var cxt=WEHOUGAME.tempcanvas[4].getContext("2d");
	cxt.font = 'bold 40px 黑体';
	cxt.textBaseline = 'hanging';
	cxt.textAlign = 'center';
	cxt.fillStyle = "rgba(255,255,255,1)";
	cxt.lineWidth = 2;
	cxt.strokeText('少女加载中', 200, 240);
	cxt.fillText('少女加载中',200, 240);
	WEHOUGAME.tempmesh[4].material.map.needsUpdate = true;
	WEHOUGAME.ui.scene.add(WEHOUGAME.tempmesh[4]);
	WEHOUGAME.ui.renderer.render(WEHOUGAME.ui.scene,WEHOUGAME.ui.camera);
	//
	WEHOUGAME.userInt();
	//
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
			document.getElementById('canvas-ui').addEventListener('drop',dragdo,false);
			document.getElementById('canvas-ui').addEventListener('dragover',dragdo2,false);
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
	WEHOUGAME.mainstory.actlist[0]=function(msg,t,nt){//符卡名字
		var cxt;
		if(t==nt){
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
		if(t<=nt+100&&t>nt+20){
			WEHOUGAME.tempmesh[0].position.x=24;
			WEHOUGAME.tempmesh[0].position.y=WEHOUCORE.slowmove[0](t-nt-20,-250,506,80);
		}else if(t<nt+20){
			var gt=nt+19-t;
			WEHOUGAME.tempmesh[0].position.x=24-gt*50;
			WEHOUGAME.tempmesh[0].position.y=-250;
			WEHOUGAME.tempmesh[0].scale.x=gt/5+1;
			WEHOUGAME.tempmesh[0].scale.y=gt/5+1;
			WEHOUGAME.tempmesh[0].material.opacity=(19-gt)/20;
		}
	}
	WEHOUGAME.mainstory.actlist[1]=function(msg,t,nt){//对话
		var num=msg.length/2;
		if(t-nt<=num*110){
			if((t-nt)%110==0){
				var tk=msg,wc=(t-nt)/110;
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
		if(t==nt){
			WEHOUGAME.gotime=msg;
			WEHOUGAME.tempmesh[1].position.y=250;
			WEHOUGAME.tempmesh[1].material.opacity=0;
		}
	}
	WEHOUGAME.mainstory.actlist[3]=function(msg,t,nt){//场景向量
		if(t==nt){
			WEHOUGAME.power=msg;
		}
	}
	WEHOUGAME.mainstory.actlist[4]=function(msg,t,nt){//更改boss贴图
		if(t==nt){
			var mc=WEHOUGAME.myplalistbos.l[msg[0]];
			mc.geometry.faceVertexUvs[0][0][0].u=mc.geometry.faceVertexUvs[0][0][1].u=msg[1][0];
			mc.geometry.faceVertexUvs[0][0][2].u=mc.geometry.faceVertexUvs[0][0][3].u=msg[1][1];
			mc.geometry.faceVertexUvs[0][0][0].v=mc.geometry.faceVertexUvs[0][0][3].v=msg[1][2];
			mc.geometry.faceVertexUvs[0][0][1].v=mc.geometry.faceVertexUvs[0][0][2].v=msg[1][3];
			mc.geometry.uvsNeedUpdate=true;
		}
	}
	WEHOUGAME.mainstory.actlist[5]=function(msg,t,nt){//音乐
		if(t==nt){
			msg[0].currentTime=msg[1];
			msg[0].play();
		}
		if(msg[0].currentTime>=msg[2]){
			if(msg[3]==0){
				msg[0].pause();
			}else{
				msg[0].currentTime=msg[1];
				msg[0].play();
			}
		}
	}
	WEHOUGAME.mainstory.actlist[6]=function(msg,t,nt){//boss信息
		if(t==nt){
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
		if(t<nt+100&&msg[2]==1){
			WEHOUGAME.tempmesh[5].position.y=232+(nt+100-t)*0.2;
			WEHOUGAME.tempmesh[5].material.opacity=1-(nt+100-t)*0.01;
		}
	}
	WEHOUGAME.mainstory.actlist[7]=function(msg,t,nt){//计分统计设定
		if(t==nt){
			WEHOUGAME.topscore+=WEHOUGAME.score;
			if(WEHOUGAME.miss==0){
				WEHOUGAME.topscore+=WEHOUGAME.score*0.5;
			}
			if(WEHOUGAME.topscore>WEHOUGAME.hiscore){
				WEHOUGAME.hiscore=WEHOUGAME.topscore;
				if(window.localStorage){
					localStorage.hs=WEHOUGAME.hiscore;
					WEHOUGAME.hiscore=localStorage.hs;
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
	//
	WEHOUCORE.deal.cheathit=WEHOUCORE.deal.hit=function(){
		if(!WEHOUGAME.misscd){
			WEHOUGAME.getSe(0).currentTime=0;
			WEHOUGAME.getSe(0).play();
			WEHOUGAME.misscd=60;
			WEHOUGAME.miss++;
			if(WEHOUGAME.misscut<1){
				WEHOUGAME.score=Math.floor(WEHOUGAME.misscut*WEHOUGAME.score);
				document.getElementById('miss').innerHTML=WEHOUGAME.miss;
			}
		}
	}
	WEHOUCORE.deal.graze=function(){}
	WEHOUCORE.webgl.renderer.clear();
}
WEHOUGAME.gamestart=function(){
	var cxt=WEHOUGAME.tempcanvas[4].getContext("2d");
	cxt.clearRect(0,0,800,600);
	WEHOUGAME.ui.scene.remove(WEHOUGAME.tempmesh[4]);
	//
	if(window.localStorage&&localStorage.hs){
		WEHOUGAME.hiscore=localStorage.hs;
	}//
	WEHOUGAME.kd=[0,0,0,0,0,0];
	if(!WEHOUGAME.inrep){
		document.body.onkeydown=function(e){
			if(e.keyCode==37){WEHOUGAME.kd[0]=1;}
			if(e.keyCode==38){WEHOUGAME.kd[1]=1;}
			if(e.keyCode==39){WEHOUGAME.kd[2]=1;}
			if(e.keyCode==40){WEHOUGAME.kd[3]=1;}
			if(e.keyCode==90){WEHOUGAME.kd[5]=1;}
			if(e.keyCode==88){history.go(0);}
			WEHOUGAME.kd[4]=e.shiftKey;
		}
		document.body.onkeyup=function(e){
			if(e.keyCode==37){WEHOUGAME.kd[0]=0;}
			if(e.keyCode==38){WEHOUGAME.kd[1]=0;}
			if(e.keyCode==39){WEHOUGAME.kd[2]=0;}
			if(e.keyCode==40){WEHOUGAME.kd[3]=0;}
			if(e.keyCode==90){WEHOUGAME.kd[5]=0;}
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
	cxt.strokeText(WEHOUGAME.topscore,266,230);
	cxt.fillText(WEHOUGAME.topscore,266,230);
	//localStorage
	if(window.localStorage){
		localStorage.hs=WEHOUGAME.hiscore;
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
	if(!WEHOUCORE.gameover){
		requestAnimationFrame(WEHOUGAME.render);
	}else{
		WEHOUGAME.gameover();
		return 0;
	}
	//
	//
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
	else{mv=6}
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
	var ww=WEHOUCORE.w/2-30,hh=WEHOUCORE.h/2-30;
	if(WEHOUCORE.lmpos.x>ww){WEHOUCORE.lmpos.x=ww}
	if(WEHOUCORE.lmpos.x<-ww){WEHOUCORE.lmpos.x=-ww}
	if(WEHOUCORE.lmpos.y>hh){WEHOUCORE.lmpos.y=hh}
	if(WEHOUCORE.lmpos.y<-hh){WEHOUCORE.lmpos.y=-hh}
	WEHOUGAME.mainstory.deal(WEHOUCORE.time);
	WEHOUGAME.selfcont.runGroup(WEHOUGAME.kd[5]);
	WEHOUGAME.myplalist.l[1].position.set(WEHOUCORE.lmpos.x,WEHOUCORE.lmpos.y,1.5);
	WEHOUGAME.myplalist.l[2].rotation.z+=0.02;
	WEHOUGAME.myplalist.l[3].rotation.z-=0.02;
	//
	WEHOUCORE.time++;
	//倒计时画面处理
	if(WEHOUGAME.gotime>0){
		if(WEHOUGAME.gotime==999999){
			var tms='∞';
		}else{
			WEHOUGAME.gotime--;
			var tms=(WEHOUGAME.gotime/60).toFixed(1);
		}
		cxt=WEHOUGAME.tempcanvas[1].getContext("2d");
		cxt.clearRect(0,0,280,100);
		
		cxt.strokeText(tms+'s', 150, 2);
		cxt.fillText(tms+'s', 150, 2);
		WEHOUGAME.tempmesh[1].material.map.needsUpdate=true;
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
	//分数
	WEHOUGAME.misscd>0?WEHOUGAME.misscd--:0;
	if(WEHOUGAME.score+WEHOUGAME.timecut>0){
		WEHOUGAME.score+=WEHOUGAME.timecut;
	}else{
		WEHOUGAME.score=0;
	}
	document.getElementById('score').innerHTML=WEHOUGAME.score;
	//渲染
	if(WEHOUCORE.time%WEHOUGAME.renderintime==1){
		WEHOUCORE.webgl.renderer.render(WEHOUCORE.webgl.scene,WEHOUCORE.webgl.camera);
		WEHOUGAME.ui.renderer.render(WEHOUGAME.ui.scene,WEHOUGAME.ui.camera);
	}
}