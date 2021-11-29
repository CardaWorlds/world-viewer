// MatCap-style image rendered on a sphere

var camera, scene, renderer;
var image;
let params = new URLSearchParams(document.location.search.substring(1));
var nft_id = params.get("nft_id");
var mesh;
const satellites = [];

//var seedDate;

init("rocky31.png", "rocky31.png", "CardaWorld0", "Rocky", 5, "Arcane", "small moon, medium moon, large moon", "2021-10-15", "Legendary");

function init(imageURL, heightmap, name, planetType, planetSize, atmosphere, moons, seedDateString, rarity) {
    //------DOCUMENT METADATA-------//
    document.title = name;
    var link = document.createElement('meta');
    link.setAttribute('property', 'og:url');
    link.content = document.location;
    document.getElementsByTagName('head')[0].appendChild(link);

    var previewImage = document.createElement('meta');
    previewImage.setAttribute('property', 'og:image');
    previewImage.content = window.location.href + imageURL;
    document.getElementsByTagName('head')[0].appendChild(previewImage);
    //-------------------------------------
    var seedDate = new Date(seedDateString);
    var planetRadius = 80;
 

    moonsArray = moons.split(", ");

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
    controls.minDistance = 140;
    controls.maxDistance = 280;
    controls.maxPolarAngle = 1.8;
    controls.minPolarAngle = 1.2;
    controls.enablePan = false;


    var light = new THREE.PointLight(0x404040, 3.2);
    light.castShadow = true;
    //light.position.set(0, 0, 380);
    light.position.set(0, 20, 265);
    light.shadow.radius = 9;
    light.shadow.mapSize.width = 2048;
    light.shadow.mapSize.height = 2048;
    light.shadow.bias = 0.0001;

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
        var i = 0;
        for (let moon of moonsArray) {
            var size = moon == "small moon" ? 0.08 * planetRadius / planetSize : (moon == "medium moon" ? 0.16 * planetRadius / planetSize : 0.27 * planetRadius / planetSize);
            var bufferDistance = planetSize + 200; //space between planet and first moon
            var distance = moon == "small moon" ? bufferDistance : (moon == "medium moon" ? bufferDistance + 5 * size : bufferDistance + 8 * size); //distance from center of planet to moon center

            const moonOrbit = new THREE.Object3D();
            moonOrbit.position.x = distance;
            moonOrbit.position.y = 5;
            satellites.push(moonOrbit);

            const moonMaterial = new THREE.MeshPhongMaterial({ map: loader.load("moons/moon" + i + ".png"), color: 0x444444, emissive: 0x444444, bumpMap: loader.load("moons/moon" + i + ".png"), bumpScale: 1.2, displacementMap: loader.load("moons/moon" + i + ".png"), displacementScale: 0.1, reflectivity: 0, shininess: 0 });

            const moonMesh = new THREE.Mesh(moonGeometry, moonMaterial);

            moonMesh.castShadow = true;
            moonMesh.receiveShadow = true;
            moonMesh.scale.set(size, size, size)

            // moonMesh.scale.set(.1, .1, .1);
            moonOrbit.add(moonMesh);
            //  satellites.push(moonMesh);
            scene.add(moonOrbit);
            i++;

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
    var displacementScale = planetType == "Terrestrial" ? 8 : 1.5;

    THREE.ImageUtils.crossOrigin = 'anonymous';

    var texture = loader.load(imageURL)
    var material = new THREE.MeshPhongMaterial({
        color: "#663926",
        map: texture,
        emissive: 0x000000,
        bumpMap: loader.load(heightmap),
        displacementMap: loader.load(heightmap),
        bumpScale: 16, displacementScale: 8,
        reflectivity: 0,
        shininess: 0
    });




    var sphere = new THREE.SphereBufferGeometry(planetRadius, 360, 360)


    mesh = new THREE.Mesh(sphere, material);

    // mesh.material.flatShading = false;
    //mesh.geometry.computeVertexNormals(true);
    mesh.castShadow = true;
    mesh.receiveShadow = true;


    scene.add(mesh);

    // create custom material from the shader code above, used to add glowing atmosphere
    //   that is within specially labeled script tags


    if (atmosphere == "Helium-Hydrogen") {
        var atmosphereColors = "( 0.74, 0.65, 0.3, 1.1 )";
        var glowRadius = 100;

    } else if (atmosphere == "Radioactive") {
        var atmosphereColors = "( 0.94, 0.25, 0.2, 1.1 )";
        var glowRadius = 101;

    }
    else if (atmosphere == "Arcane") {
        var atmosphereColors = "( 0.84, 0.35, 0.8, 1.1 )";
        var glowRadius = 102;

    }
    else if (atmosphere == "Poisonous") {
        var atmosphereColors = "( 0.44, 0.85, 0.2, 1.1 )";
        var glowRadius = 102;

    }
    else {
        var atmosphereColors = "(0.5,0.6,1,1)";
        var glowRadius = 102;

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

    runAnimation(seedDate);

}

function runAnimation(seedDate) {
    animate();
    function animate() {
        //time =0;
        time = (Date.now() - seedDate.getTime()) / 5000
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