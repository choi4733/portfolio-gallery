// Earth surface texture: https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg
(() => {
 const section = document.querySelector('.immersive');
 const stage = section?.querySelector('.immersive_stage');
 if (!stage) return;
 const canvas = document.createElement('canvas');
 canvas.className = 'earth_globe';
 canvas.setAttribute('aria-hidden', 'true');
 const gl = canvas.getContext('webgl', { alpha: false, antialias: false, powerPreference: 'low-power' });
 if (!gl) return; // The existing image remains the fallback.
 const vertex = `attribute vec2 position; void main(){gl_Position=vec4(position,0.,1.);}`;
 const fragment = `
 precision highp float;
 uniform vec2 resolution;
 uniform sampler2D surface;
 uniform float progress;
 float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
 void main(){
  vec2 uv=gl_FragCoord.xy/resolution;
  vec2 p=(gl_FragCoord.xy-.5*resolution)/resolution.y;
  float aspect=resolution.x/resolution.y;
  vec3 sky=vec3(.006,.014,.027);
  vec2 cells=floor(uv*vec2(260.,170.));
  vec2 starPosition=fract(uv*vec2(260.,170.));
  float stars=step(.994,hash(cells))*pow(max(0.,1.-length(starPosition-.5)*2.),10.);
  sky+=vec3(.45,.58,.75)*stars*.65;
  // A large globe sits behind the right side of the opening title.
  vec2 center=mix(vec2(0.,-1.28),vec2(aspect*.78,-.25),smoothstep(0.,1.,progress));
  float radius=1.12;
  vec2 q=(p-center)/radius;
  float dist=length(q);
  vec3 color=sky;
  if(dist<1.){
   vec3 normal=vec3(q,sqrt(max(0.,1.-dot(q,q))));
   // Tilt the axis, then turn longitude around the globe's Y axis.
   float tilt=.27;
   vec3 n=vec3(cos(tilt)*normal.x-sin(tilt)*normal.y,sin(tilt)*normal.x+cos(tilt)*normal.y,normal.z);
   float angle=2.1+progress*.85;
   vec3 rotated=vec3(cos(angle)*n.x+sin(angle)*n.z,n.y,-sin(angle)*n.x+cos(angle)*n.z);
   vec2 mapUV=vec2(atan(rotated.z,rotated.x)/6.2831853+.5,asin(clamp(rotated.y,-1.,1.))/3.14159265+.5);
   vec3 land=texture2D(surface,mapUV).rgb;
   float sun=dot(normal,normalize(vec3(.6,.65,.65)));
      float lighting=.30+.90*smoothstep(-.35,.9,sun);
   // The map only controls point density; no colored atlas is shown.
   float landMask=smoothstep(.015,.18,land.r-land.b*.72);
   vec2 pointGrid=mapUV*vec2(1500.,750.);
   vec2 cell=floor(pointGrid);
   vec2 offset=vec2(hash(cell),hash(cell+17.))*.46-.23;
   float dotShape=1.-smoothstep(.10,.26,length(fract(pointGrid)-.5-offset));
   float density=step(.40,hash(cell+43.));
   float points=dotShape*density*(.08+landMask*.92);
   float grain=hash(cell+91.);
      color=vec3(.002,.004,.007);
   color+=vec3(.48,.53,.60)*points*lighting*(.35+grain*.65);
   color+=vec3(.009,.014,.021)*landMask*lighting;
   float rim=pow(1.-normal.z,4.);
   color+=vec3(.10,.14,.20)*rim*smoothstep(-.45,.6,sun)*.65;
   color=mix(sky,color,(1.-smoothstep(.997,1.,dist)));
  }else{
   float halo=exp(-(dist-1.)*100.)*.35+exp(-(dist-1.)*14.)*.24;
   color+=vec3(.32,.39,.52)*halo;
  }
  gl_FragColor=vec4(color,1.);
 }`;
 function shader(type, source) {
  const s=gl.createShader(type); gl.shaderSource(s,source); gl.compileShader(s);
  if (!gl.getShaderParameter(s,gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
  return s;
 }
 let program;
 try {
  program=gl.createProgram();
  gl.attachShader(program,shader(gl.VERTEX_SHADER,vertex));
  gl.attachShader(program,shader(gl.FRAGMENT_SHADER,fragment));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program,gl.LINK_STATUS)) return;
 } catch (_) { return; }
 stage.prepend(canvas);
 gl.useProgram(program);
 const buffer=gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
 gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
 const location=gl.getAttribLocation(program,'position');
 gl.enableVertexAttribArray(location); gl.vertexAttribPointer(location,2,gl.FLOAT,false,0,0);
 const sizeUniform=gl.getUniformLocation(program,'resolution');
 const progressUniform=gl.getUniformLocation(program,'progress');
 const texture=gl.createTexture();
 gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D,texture);
 gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
 gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
 gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
 gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
 gl.uniform1i(gl.getUniformLocation(program,'surface'),0);
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let target=0,current=0,frame=0,ready=false,lastTime=0;
 function draw() {
  const ratio=Math.min(devicePixelRatio||1,1.5);
  const width=Math.round(stage.clientWidth*ratio),height=Math.round(innerHeight*ratio);
  if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height;gl.viewport(0,0,width,height);}
  gl.uniform2f(sizeUniform,width,height); gl.uniform1f(progressUniform,current);
  gl.drawArrays(gl.TRIANGLES,0,6);
 }
 function tick(time) {
  frame=0;
  const dt=Math.min(time-(lastTime||time-16),64); lastTime=time;
  current=reduced.matches?0:current+(target-current)*(1-Math.exp(-dt/100));
  if(Math.abs(target-current)<.0001) current=target;
  draw();
  if(!reduced.matches&&Math.abs(target-current)>.0001) frame=requestAnimationFrame(tick);
 }
 function schedule(){if(ready&&!frame){lastTime=0;frame=requestAnimationFrame(tick);}}
 section.addEventListener('earthprogress',event=>{target=reduced.matches?0:event.detail;schedule();});
 addEventListener('resize',schedule,{passive:true});
 reduced.addEventListener('change',()=>{target=0;current=0;schedule();});
 const image=new Image();
 image.onload=()=>{
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);
  gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,image);
  ready=true; draw(); stage.classList.add('has_globe'); canvas.classList.add('is_ready'); schedule();
 };
 image.src=new URL('../img/earth-surface.jpg',document.currentScript.src).href;
 canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();ready=false;cancelAnimationFrame(frame);frame=0;stage.classList.remove('has_globe');canvas.classList.remove('is_ready');});
})();