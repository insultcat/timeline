var particleSystem, scene, camera, container, renderer, controls, projector,
maxParticles = 300000,
pWidth = 10
pHeight = 40,
gravity = 0.998,
increments = 1,
ageDist=[[]],
mData =[0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15,0.15],
fData =[0.30,0.30,0.30,0.30,0.30,0.30,0.30,0.30,0.30,0.30,0.30,0.30,0.30,0.30,0.30,0.30,0.30,0.30,0.30,0.30,0.30,0.30,0.30,0.30,0.30,0.30,0.30,0.30,0.30,0.30,0.30,0.30,0.30,0.30,0.30,0.30,0.30,0.30,0.30,0.30];
calcTotals();
init();

function init(){
  // setup the scene, renderer and camera
  container = document.getElementById( 'container' );
  camera = new THREE.PerspectiveCamera( 28, window.innerWidth / window.innerHeight, 1, 1000000 );
  camera.position.set(0,0,-100);
  camera.rotation.set(Math.PI*-1,0,0);
  scene = new THREE.Scene();
  scene.background = new THREE.Color( 0xffffff );
  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.autoClearColor = true;
  container.appendChild( renderer.domElement );
  window.addEventListener( 'resize', onWindowResize, false );
  //addLabels
  for(c=1;c<ageDist.length;c++){
    var ay = c*(40/(ageDist.length-1))-20;
    var posF = new THREE.Vector3(-20,ay,0);
    var posM = new THREE.Vector3(20,ay,0);
    posF = toXYCoords(posF);
    posM = toXYCoords(posM);

    var text2 = document.createElement('div');
    text2.style.position = 'absolute';
    text2.style.zIndex = 1;
    text2.style.width = 100;
    text2.style.height = 100;
    text2.style.color = "salmon";
    text2.innerHTML = (ay+15).toString();
    text2.style.top = posF.y + 'px';
    text2.style.left = posF.x + 'px';
    document.body.appendChild(text2);

    var text3 = document.createElement('div');
    text3.style.position = 'absolute';
    text3.style.zIndex = 1;
    text3.style.width = 100;
    text3.style.height = 100;
    text3.style.color = "skyblue";
    text3.innerHTML = (ay+15).toString();
    text3.style.top = posM.y + 'px';
    text3.style.left = posM.x + 'px';
    document.body.appendChild(text3);
  }

  //create new particle system
  var positions = [],
  colors =[]
  ages =[]
  a1 = 1,
  a2 = 1;
  for(i = 0; i<maxParticles; i++){
    var a;// = Math.ceil((Math.random()*40-20)/5)*5;
    var color;

    if(i%2 == 0){
      color = new THREE.Color("salmon");
      if(i<ageDist[a1][0]*2 || a1 == ageDist.length-1){
        a = a1*increments;
      }else{
        a1++;
      }
    }else{
      color = new THREE.Color("skyblue");
      if(i<ageDist[a2][1]*2 || a2 == ageDist.length-1){
        a = a2*increments;
      }else{
        a2++;
      }
    }
    var y = (Math.random()*pHeight)-pHeight/2;
    var x = ((Math.random()*pWidth)-pWidth/2)*(Math.pow(gravity,Math.pow(y+25,1.8)));
    colors.push(color.r,color.g,color.b);
    ages.push(a);
    positions.push(x,y,0);
  }
  var particles = new THREE.BufferGeometry();
  particles.addAttribute( 'position', new THREE.Float32BufferAttribute( positions, 3 ) );
  particles.addAttribute( 'customColor', new THREE.Float32BufferAttribute( colors, 3 ) );
  particles.addAttribute( 'age', new THREE.Int32BufferAttribute(ages, 1) );
  var uniforms = {
    color: { value: new THREE.Color( 0xffffff ) },
    texture:{value: new THREE.TextureLoader().load( "particle2.png" )}
  };

  var pmaterial = new THREE.ShaderMaterial( {
    uniforms: uniforms,
    vertexShader: document.getElementById( 'vertexshader' ).textContent,
    fragmentShader: document.getElementById( 'fragmentshader' ).textContent,
  } );
  particleSystem = new THREE.Points(particles, pmaterial);
  particleSystem.name = "points";
  scene.add(particleSystem);
  animate();
}

function updateParticles(){
  var attributes = scene.getObjectByName("points").geometry.attributes;
  var positions = attributes.position.array;

  for(i = 1; i<positions.length-1; i+=3){
    var a = attributes.age.array[(i+2)/3]-pHeight/2;
    //reset after end
    if(positions[i] > a+5 || positions[i] > pHeight/2 ){
      positions[i]= (a+pHeight/2)*Math.random()-pHeight/2;
      positions[i-1]=((Math.random()*pWidth)-pWidth/2)*(Math.pow(gravity,Math.pow(positions[i]+25,1.6)));//(Math.random()*pWidth)-pWidth/2;
    }else{
      // Y coordinate
      positions[i]+=Math.random()/10;
    }
    // X coordinate
    if(a-5 < positions[i]){
      // positions[i-1]=Math.abs((a+20)/4)*Math.sin((a-positions[i])/5*Math.PI+20)-3;
      // positions[i-1]=positions[i-1]*1.015;
      if(((i-1)/3)%2 == 0){
        positions[i-1]-=(positions[i]-(a-5))/80;
        // positions[i-1]=Math.sin((a-positions[i])*Math.PI/20)*(i/300*(Math.pow(gravity,Math.pow(positions[i]+25,1.6))));
      }else{
         positions[i-1]+=(positions[i]-(a-5))/80;
      }
    }else{
      positions[i-1]=positions[i-1]*gravity;
    }
  }
  attributes.position.needsUpdate = true;
}

function calcTotals(){
  var totF=maxParticles/2, totM=maxParticles/2, f=0,m=0;
  for(d=0; d<fData.length; d++){
    f+=(totF*fData[d]);
    m+=(totM*mData[d]);
    totM-=(totM*mData[d]);
    totF-=(totF*fData[d]);
    if(d%increments==0){
      ageDist.push([m,f]);
    }
  }
  console.log(ageDist);
}

function toXYCoords (pos) {
    camera.updateMatrixWorld();
    var vector = pos.project(camera);
    vector.x = (vector.x + 1)/2 * window.innerWidth;
    vector.y = -(vector.y - 1)/2 * window.innerHeight;
    return vector;
}

function animate(){
  requestAnimationFrame( animate );
  updateParticles();
  render();
}

function render() {
  renderer.render( scene, camera );
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight );
}
