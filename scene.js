import * as THREE from './vendor/three.module.min.js';

// Lit, extruded interface cards with ray selection, pointer rotation and drag navigation.
export async function mountDeck(host,rewards,selected,onSelect,{compact=false,reduced=false}={}) {
  let renderer;
  try{renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});}catch(_){
    host.dataset.renderer='fallback';let fallbackIndex=selected;
    const flipFallback=()=>host.querySelector('.collectible')?.classList.toggle('is-turned');
    const keyFallback=e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();fallbackIndex=(fallbackIndex+(e.key==='ArrowRight'?1:-1)+rewards.length)%rewards.length;onSelect(fallbackIndex);}else if(e.key==='Enter'||e.key===' '){e.preventDefault();flipFallback();}};
    host.addEventListener('keydown',keyFallback);
    return{select:i=>{fallbackIndex=i;},flip:flipFallback,setReduced:()=>{},dispose:()=>host.removeEventListener('keydown',keyFallback)};
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.65));renderer.setClearColor(0x000000,0);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;
  host.prepend(renderer.domElement);renderer.domElement.setAttribute('aria-hidden','true');host.dataset.renderer='webgl';
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(36,1,.1,100);camera.position.set(0,.1,8.4);scene.add(new THREE.AmbientLight(0xffffff,2.5));
  const key=new THREE.DirectionalLight(0xffffff,4);key.position.set(-3,4,5);scene.add(key);const purple=new THREE.PointLight(0xb097ff,22,15);purple.position.set(3,2,3);scene.add(purple);const lime=new THREE.PointLight(0x6587c4,13,15);lime.position.set(-4,-2,2);scene.add(lime);
  const medal=await new Promise(resolve=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>resolve(null);img.src='assets/medal-nocturne.png';});
  const cards=[],textures=[];let index=selected,flip=0,drag=0,mouseX=0,mouseY=0,frame,disposed=false,down=false,start=0,last=0,moved=false;
  function texture(r,back=false){
    const c=document.createElement('canvas');c.width=600;c.height=820;const x=c.getContext('2d');const g=x.createLinearGradient(0,0,600,820);g.addColorStop(0,({blue:'#202938',gold:'#302919',violet:'#302041'})[r.accent]||'#252334');g.addColorStop(.52,back?'#201329':'#111019');g.addColorStop(1,back?'#30203d':'#292035');x.fillStyle=g;x.fillRect(0,0,600,820);x.strokeStyle='#9674c090';x.lineWidth=3;x.beginPath();x.roundRect(20,20,560,780,25);x.stroke();x.fillStyle='#e0d2f2';x.font='500 25px Arial';x.fillText('O R I O N',49,68);x.font='14px Arial';x.fillText('POINTS COLLECTION',49,96);x.textAlign='right';x.font='15px monospace';x.fillText('0'+(rewards.indexOf(r)+1)+'/07',550,66);x.textAlign='left';
    if(medal)x.drawImage(medal,back?85:160,back?164:124,back?430:345,back?430:345);
    if(back){x.textAlign='center';x.font='500 29px Arial';x.fillText('THE NEXT CHAPTER',300,684);x.font='18px Arial';x.fillText('TURN TO REVEAL',300,725);}else{x.font=r.value.length>5?'bold 51px Arial':'bold 116px Arial';x.fillText(r.value,44,r.value.length>5?514:560);x.font='19px Arial';x.fillText(r.type,48,602);x.fillStyle='#322144';x.beginPath();x.roundRect(38,660,524,100,17);x.fill();x.fillStyle='#d7b5ff';x.font='bold 37px Arial';x.fillText((r.variable?'From ':'')+new Intl.NumberFormat('en-US').format(r.cost),59,708);x.font='18px Arial';x.fillText('ORION POINTS',59,737);x.textAlign='right';x.font='20px Arial';x.fillText('90 DAYS',538,720);}
    const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=renderer.capabilities.getMaxAnisotropy();textures.push(t);return t;
  }
  const geometry=new THREE.BoxGeometry(1.87,2.56,.09);
  rewards.forEach((r,i)=>{const edge=new THREE.MeshPhysicalMaterial({color:0x554567,metalness:.8,roughness:.25,clearcoat:1});const front=new THREE.MeshBasicMaterial({map:texture(r),toneMapped:false});const back=new THREE.MeshBasicMaterial({map:texture(r,true),toneMapped:false});const mesh=new THREE.Mesh(geometry,[edge,edge,edge,edge,front,back]);mesh.userData.index=i;scene.add(mesh);cards.push(mesh);});
  const ray=new THREE.Raycaster(),pointer=new THREE.Vector2();
  function resize(){if(disposed)return;const w=host.clientWidth,h=host.clientHeight;renderer.setSize(w,h);camera.aspect=w/h;camera.position.z=compact?6.2:(w<500?6.4:5.7);camera.updateProjectionMatrix();}
  const ro=new ResizeObserver(resize);ro.observe(host);resize();
  function select(i,notify=true){index=(i+rewards.length)%rewards.length;flip=0;if(notify)onSelect(index);}
  function pick(e){const b=renderer.domElement.getBoundingClientRect();pointer.set((e.clientX-b.left)/b.width*2-1,-(e.clientY-b.top)/b.height*2+1);ray.setFromCamera(pointer,camera);return ray.intersectObjects(cards)[0]?.object;}
  const onDown=e=>{if(e.button!==0)return;down=true;start=last=e.clientX;moved=false;host.setPointerCapture(e.pointerId);};
  const onMove=e=>{const b=host.getBoundingClientRect();mouseX=(e.clientX-b.left)/b.width-.5;mouseY=(e.clientY-b.top)/b.height-.5;if(down){drag+=(e.clientX-last)*.005;last=e.clientX;if(Math.abs(e.clientX-start)>8)moved=true;}};
  const onUp=e=>{if(!down)return;down=false;if(moved){if(Math.abs(e.clientX-start)>35)select(index+(e.clientX<start?1:-1));}else{const hit=pick(e);if(hit){if(hit.userData.index===index)flip=flip?0:Math.PI;else select(hit.userData.index);}}drag=0;};const onCancel=()=>{down=false;drag=0;};
  host.addEventListener('pointerdown',onDown);host.addEventListener('pointermove',onMove);host.addEventListener('pointerup',onUp);host.addEventListener('pointercancel',onCancel);
  const onKey=e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();select(index+(e.key==='ArrowRight'?1:-1));}if(e.key==='Enter'||e.key===' '){e.preventDefault();flip=flip?0:Math.PI;}};host.addEventListener('keydown',onKey);
  let visible=true;const io=new IntersectionObserver(e=>visible=e[0].isIntersecting);io.observe(host);
  function animate(t){if(disposed)return;frame=requestAnimationFrame(animate);if(!visible||document.hidden)return;cards.forEach((m,i)=>{let d=i-index;if(d>3)d-=7;if(d< -3)d+=7;const a=Math.abs(d);m.visible=a<=2;const rate=reduced?1:.09;m.position.lerp(new THREE.Vector3(d*1.53+drag,(reduced?0:Math.sin(t*.0008+i)*.07)-a*.1,-a*.75),rate);m.rotation.y+=(-d*.31+(i===index?flip:0)+(reduced?0:mouseX*.12)+drag*.2-m.rotation.y)*rate;m.rotation.x+=((reduced?0:mouseY*.08)-m.rotation.x)*rate;m.rotation.z+=(-d*.08-m.rotation.z)*rate;});renderer.render(scene,camera);}
  frame=requestAnimationFrame(animate);
  return{select:i=>select(i,false),flip:()=>{flip=flip?0:Math.PI;},setReduced:v=>{reduced=v;},dispose:()=>{disposed=true;cancelAnimationFrame(frame);ro.disconnect();io.disconnect();host.removeEventListener('pointerdown',onDown);host.removeEventListener('pointermove',onMove);host.removeEventListener('pointerup',onUp);host.removeEventListener('pointercancel',onCancel);host.removeEventListener('keydown',onKey);cards.forEach(c=>[...new Set(c.material)].forEach(m=>m.dispose()));geometry.dispose();textures.forEach(t=>t.dispose());renderer.dispose();renderer.forceContextLoss();renderer.domElement.remove();}};
}
