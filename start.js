import { Init } from "./ranger2.js";

function cvs_mv2(gw,gh,ss,as,ab,ms){
	var d=document;
	var c=d.getElementById('cv');
	//var s=d.getElementById('sp_info').getBoundingClientRect();
	var i=c.getBoundingClientRect();
	var w=window.innerWidth;
	var h=window.innerHeight;
	//var mrs=d.getElementById('mrw_ads').style;
	var cvs=c.style;
	if(ss<=w){
		// var l=i.left+i.width+150-s.left;
		// if(s.left>i.left && 0<l)	mrs.left=l+'px';
		// else						mrs.left='0';
		cvs.width=gw+'px';
		cvs.height=gh+'px';
	}else{
		// mrs.left='0';
		w=d.body.clientWidth;
		var sc=(gw/gh>w/h)?w/gw:h/gh;
		sc=Math.min(sc,ms);
		cvs.width=(gw*sc)+'px';
		cvs.height=(gh*sc)+'px';
	}
	var p=window.devicePixelRatio;
	if(!p)	p=1;
	if(gw>(w*p) || gh>(h*p)){
		if(0===as)	c.classList.add('nrnb');
		else		c.classList.remove('nrnb');
	}else{
		if(0===ab)	c.classList.add('nrnb');
		else		c.classList.remove('nrnb');
	}
	window.onresize=function(){cvs_mv2(gw,gh,ss,as,ab,ms);}
}

function cookie_get(nm){
	var r=[],dc=document.cookie;
	if(dc){
		var c=dc.split('; ');
		for(var i=0; i<c.length; i++){
			var k=c[i].split('=');
			if(k[0]===nm && k[1]!=''){
				k[1]=decodeURIComponent(k[1]);
				if('user'===nm){
					r=k[1].substr(0,k[1].indexOf(':')).split('_');
					r[6]=k[1].substr(k[1].indexOf(':')+1);
				}else{
					r[0]=k[1];
				}
				break;
			}
		}
	}
	return (r);
}

function startGame() {
    var src_ck = cookie_get("user");
    Init(src_ck[3], 1);
    cvs_mv2(640, 432, 1000, 1, 0, 1);
    const overlay = document.getElementById("overlay");
    if (overlay) overlay.style.opacity = "0";
    setTimeout(() => overlay && (overlay.style.display = "none"), 600);
    document.getElementById("status").textContent = "Running";
}

window.addEventListener("load", startGame);

document.getElementById("fullscreenBtn").addEventListener("click", () => {
    if (typeof window.full_screen === "function") window.full_screen();
    else if (typeof pf === "function") pf();
});