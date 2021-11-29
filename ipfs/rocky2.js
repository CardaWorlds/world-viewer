// MatCap-style image rendered on a sphere

var camera, scene, renderer;
var image;
let params = new URLSearchParams(document.location.search.substring(1));
var nft_id = params.get("nft_id");
var mesh;
const satellites = [];

var seedDate = new Date('2021-10-13T03:04:05.678Z');

init("CardaWorld0.png", "heightmap_0.png", "CardaWorld0", "Ice world, Gold", "Terrestrial", 1.2, "small moon, medium moon, big moon");

animate();
function init(imageURL, heightmap, name, rarities, planetType, planetSize, moons) {
    var planetRadius = 80;

    raritiesArray = rarities.split(", ");
    console.log(raritiesArray);

    moonsArray = moons.split(", ");
    console.log(moonsArray);

    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true }); //alpha: true is used to allow backgrounds
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    //renderer.shadowMap.type = THREE.PCFSoftShadowMap;


    document.body.appendChild(renderer.domElement);

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.set(0, 0, 200);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.minDistance = 120;
    controls.maxDistance = 280;
    controls.maxPolarAngle = 1.8;
    controls.minPolarAngle = 1.2;
    controls.enablePan = false;


    var light = new THREE.PointLight(0x404040, 3.2);
    light.castShadow = true;
    //light.position.set(0, 0, 380);
    light.position.set(0, 20, 210);
    light.shadow.radius = 12;
    light.shadow.mapSize.width = 2048;
    light.shadow.mapSize.height = 2048;
    light.shadow.bias = 0.0001;
    light.shadowDarkness = 0.1;

    const d = 100;

    light.shadow.camera.left = - d;
    light.shadow.camera.right = d;
    light.shadow.camera.top = d;
    light.shadow.camera.bottom = - d;
    /* let helper = new THREE.CameraHelper ( light.shadow.camera );
    scene.add( helper ); */

    scene.add(light);

    var ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);

    const loader = new THREE.TextureLoader();

    const cubeLoader = new THREE.CubeTextureLoader();
    const spaceTexture = cubeLoader.load([
        './resources/space-posx.jpg',
        './resources/space-negx.jpg',
        './resources/space-posy.jpg',
        './resources/space-negy.jpg',
        './resources/space-posz.jpg',
        './resources/space-negz.jpg',
    ]);
    spaceTexture.encoding = THREE.sRGBEncoding;
    scene.background = spaceTexture;

    // ----- test moon -------
    if (moonsArray != []) {
        var moonGeometry = new THREE.SphereBufferGeometry(1, 200, 200);
        for (let moon of moonsArray) {
            console.log(moon)
            var size = moon == "small moon" ? 0.09 * planetRadius / planetSize : (moon == "medium moon" ? 0.15 * planetRadius / planetSize : 0.2 * planetRadius / planetSize);
            console.log(size)
            var bufferDistance = planetSize + 100; //space between planet and first moon
            var distance = moon == "small moon" ? bufferDistance : (moon == "medium moon" ? bufferDistance + 3 * size : bufferDistance + 5 * size); //distance from center of planet to moon center

            const moonOrbit = new THREE.Object3D();
            moonOrbit.position.x = distance;
            moonOrbit.position.y = 5;
            satellites.push(moonOrbit);

            const moonMaterial = new THREE.MeshPhongMaterial({ color: 0x777777, emissive: 0x111111, bumpMap: loader.load('moon1.png'), bumpScale: 1.2, reflectivity: 0, roughness: 1, shininess: 0 });

            const moonMesh = new THREE.Mesh(moonGeometry, moonMaterial);

            moonMesh.castShadow = true;
            moonMesh.receiveShadow = true;
            moonMesh.scale.set(size, size, size)

            // moonMesh.scale.set(.1, .1, .1);
            moonOrbit.add(moonMesh);
            //  satellites.push(moonMesh);
            scene.add(moonOrbit);

        }
    }

    //+++++++++++++++++++++++++
    var texture = loader.load(imageURL);
    texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    texture.minFilter = THREE.LinearMipmapLinearFilter;

    var heightmapTexture = loader.load(heightmap);
    //heightmapTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    heightmapTexture.minFilter = THREE.LinearFilter;

    var bumpScale = planetType == "Terrestrial" ? 1.8 : 0;
    var displacementScale = planetType == "Terrestrial" ? 8 : 2;

    THREE.ImageUtils.crossOrigin = 'anonymous';

    var texture = loader.load('rocky0.png')
/*     var material = new THREE.MeshPhongMaterial({
        color: "#663926",
        map: texture,
        emissive: 0x000000,
        bumpMap: loader.load('rocky0.png'),
        displacementMap: loader.load('rocky0.png'),
        bumpScale: 20, displacementScale: 8,
        reflectivity: 0,
        shininess: 0
    }); */


    var sphere = new THREE.SphereBufferGeometry(planetRadius, 360, 360)

    material = new THREE.ShaderMaterial( {
        uniforms: {
            tExplosion: {
              type: "t",
              value: THREE.ImageUtils.loadTexture( 'rocky0.png' )
            },
            time: { // float initialized to 0
              type: "f",
              value: 0.0
            }
          },
        vertexShader: document.getElementById( 'vertexShader2' ).textContent,
        fragmentShader: document.getElementById( 'fragmentShader2' ).textContent
      } );

    // create a sphere and assign the material
    mesh = new THREE.Mesh(
        new THREE.IcosahedronGeometry(planetRadius, 8),
        material
    );

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

    var ballGeometry = new THREE.SphereBufferGeometry(glowRadius, 360, 360);
    var ball = new THREE.Mesh(ballGeometry, customMaterial);

    scene.add(ball);

}

function animate(time) {

    //time *=0.001;
    time = (Date.now() - seedDate.getTime()) / 2000
    satellites.forEach((obj) => {
        if (time) {
            var dist = Math.sqrt(obj.position.x * obj.position.x + obj.position.z * obj.position.z);
            obj.position.x = dist * Math.sin(time * 0.5 / Math.sqrt(dist));
            obj.position.z = dist * Math.cos(time * 0.5 / Math.sqrt(dist));
        }

    });
    requestAnimationFrame(animate);
    //controls.update(); // not required here
    mesh.rotation.x = 0.000001;
    mesh.rotation.y = time;

    renderer.render(scene, camera);

    render();

}

function render(time) {

    renderer.render(scene, camera);

}
window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);

}