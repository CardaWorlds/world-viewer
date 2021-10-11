   // MatCap-style image rendered on a sphere

   var camera, scene, renderer;
   var image;
   let params = new URLSearchParams(document.location.search.substring(1));
   var nft_id = params.get("nft_id");
   var mesh;

   init("CardaWorld1650.png", "heightmap_1650.png", "CardaWorld1650", "Mushroom forest, Gold, Volcanoes, Cryptonic atmosphere", "purple", "Terrestrial");
   animate();
   function init(imageURL, heightmap, name, rarities, galaxyType, planetType) {

       raritiesArray = rarities.split(", ");
       console.log(raritiesArray);

       renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true }); //alpha: true is used to allow backgrounds
       renderer.setSize(window.innerWidth, window.innerHeight);

       document.body.appendChild(renderer.domElement);

       scene = new THREE.Scene();

       camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1000);
       camera.position.set(0, 0, 200);

       controls = new THREE.OrbitControls(camera, renderer.domElement);
       controls.minDistance = 110;
       controls.maxDistance = 200;
       controls.maxPolarAngle = 1.8;
       controls.minPolarAngle = 1.2;
       controls.enablePan = false;


       var light = new THREE.DirectionalLight(0x404040, 4);
       light.position.set(50, 50, 40);
       light.shadow.bias = -1;

       scene.add(light);

       var ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
       scene.add(ambientLight);

       const loader = new THREE.TextureLoader();

       var blue_bg = "space_blue.jpg"
       var purple_bg = "space_purple.jpg";
       var gold_bg = "space_golden.jpg";

       var bg = galaxyType == "blue" ? blue_bg : (galaxyType == "gold" ? gold_bg : purple_bg);
       //Space background is a large sphere
       var spacetex = loader.load(bg);
       var spacesphereGeo = new THREE.SphereBufferGeometry(250, 1080, 720);
       var spacesphereMat = new THREE.MeshPhongMaterial();
       spacesphereMat.map = spacetex;

       var spacesphere = new THREE.Mesh(spacesphereGeo, spacesphereMat);

       //spacesphere needs to be double sided as the camera is within the spacesphere
       spacesphere.material.side = THREE.DoubleSide;

       spacesphere.material.map.wrapS = THREE.RepeatWrapping;
       spacesphere.material.map.wrapT = THREE.RepeatWrapping;
       spacesphere.material.map.repeat.set(5, 3);

       scene.add(spacesphere);


       var texture = loader.load(imageURL);
       texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
       texture.minFilter = THREE.LinearMipmapLinearFilter;

       var heightmapTexture = loader.load(heightmap);
       //heightmapTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();
       heightmapTexture.minFilter = THREE.LinearFilter;

       var bumpScale=planetType== "Terrestrial" ? 1.8 : 0;
       var displacementScale=planetType== "Terrestrial" ? 8 : 2;

       THREE.ImageUtils.crossOrigin = 'anonymous';
       var material = new THREE.MeshPhongMaterial({
           map: texture,
           bumpMap: loader.load(heightmapTexture),
           bumpScale: 1.8,
           displacementMap: heightmapTexture,
           displacementScale: 8,
           shininess: 2
       });

       var sphere = new THREE.SphereBufferGeometry(80, 2000, 720)


       mesh = new THREE.Mesh(sphere, material)
       mesh.material.map.wrapS = THREE.RepeatWrapping;
       mesh.material.map.wrapT = THREE.RepeatWrapping;
       mesh.material.map.repeat.set(1, 1);

       mesh.material.flatShading = false;
       mesh.geometry.computeVertexNormals(true);

       scene.add(mesh);

       // create custom material from the shader code above, used to add glowing atmosphere
       //   that is within specially labeled script tags

       if (raritiesArray.includes("Cryptonic atmosphere")) {
           var atmosphereColors = "( 0.24, 0.143, 0.8, 1.4 )";
           var glowRadius = 105;

       } else {
           var atmosphereColors = "(0.5,0.6,1,1)";
           var glowRadius = 98;

       }

       var fragmentShader = `varying vec3 vNormal;
                        void main() 
                        {
                        float intensity = pow( 0.7 - dot( vNormal, vec3( 0.0, 0.0, 1.0 ) ), 4.0 ); 
                        gl_FragColor = vec4${atmosphereColors} * intensity;
                        }`;

       var customMaterial = new THREE.ShaderMaterial(
           {
               uniforms: {},
               vertexShader: document.getElementById('vertexShader').textContent,
               fragmentShader: fragmentShader,
               side: THREE.BackSide,
               blending: THREE.AdditiveBlending,
               transparent: true
           });

       var ballGeometry = new THREE.SphereBufferGeometry(glowRadius, 1080, 720);
       var ball = new THREE.Mesh(ballGeometry, customMaterial);

       scene.add(ball);

   }

   function animate() {

       requestAnimationFrame(animate);
       //controls.update(); // not required here
       mesh.rotation.x = 0.000001;
       mesh.rotation.y = Date.now() * 0.0003;

       renderer.render(scene, camera);

       render();

   }

   function render() {
       renderer.render(scene, camera);
       renderer.setPixelRatio(window.devicePixelRatio);
   }
   window.addEventListener( 'resize', onWindowResize, false );

   function onWindowResize(){
       camera.aspect = window.innerWidth / window.innerHeight;
       camera.updateProjectionMatrix();
       renderer.setSize( window.innerWidth, window.innerHeight );
   
   }