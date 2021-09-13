// MatCap-style image rendered on a sphere

var camera, scene, renderer;
var image;

init();
animate();
var mesh;

function init() {

    info = document.createElement('div');
    info.style.position = 'absolute';
    info.style.top = '30px';
    info.style.width = '100%';
    info.style.textAlign = 'center';
    info.style.color = '#fff';
    info.style.fontWeight = 'bold';
    info.style.backgroundColor = 'transparent';
    info.style.zIndex = '1';
    info.style.fontFamily = 'Monospace';
    //info.innerHTML = 'Drag mouse to rotate camera; scroll to zoom';
    document.body.appendChild(info);

    renderer = new THREE.WebGLRenderer({ alpha: true }); //alpha: true is used to allow backgrounds
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    
    

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.set(0, 0, 150);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.minDistance = 75;
    controls.maxDistance = 200;
    controls.enablePan = false;

    image = document.createElement('img');
    height_image = document.createElement('img');

    document.body.appendChild(image);
    //document.body.appendChild(height_image);

    var texture = new THREE.Texture(image)
    var heightmap = new THREE.Texture(height_image)

    image.onload = function () {
        texture.needsUpdate = true;
    };

    var uniforms = {
        "tex": { value: texture }
    };

    var light = new THREE.DirectionalLight(0x404040, 3);
    light.position.set( 50, 50, 40);
    scene.add(light);

    var ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);


    var material = new THREE.MeshPhongMaterial({
        map: THREE.ImageUtils.loadTexture('./CardaWorld1106.png'),
        bumpMap:THREE.ImageUtils.loadTexture('./heightmap_1106.png'),
        bumpScale:2,
        shininess:10

        /* uniforms: uniforms,
        vertexShader: document.getElementById('vertex_shader').textContent,
        fragmentShader: document.getElementById('fragment_shader').textContent, */
    });
    /* material.displacementMap = heightmap; 
    material.displacementScale = 1000;  */
    //material.normalMap   = heightmap; 
    var sphere = new THREE.SphereGeometry(40, 1080, 720)

    mesh = new THREE.Mesh(sphere, material)
    /* if ( mesh.isMesh ) {
        const position = mesh.geometry.attributes.position;
        position.needsUpdate = true
        const vector = new THREE.Vector3();
        console.log(position)
        console.log(vector.fromBufferAttribute(position,100020));
        for ( let i = 0, l = position.count; i < l; i ++ ){
           var p =vector.fromBufferAttribute( position, i );
           mesh.geometry.attributes.position.normalized=true;
        }
     
     } */
    

    scene.add(mesh);


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

}
image.crossOrigin = "anonymous";
image.src = './CardaWorld1106.png';
image.width = 720;
image.height = 1080;

height_image.crossOrigin = "anonymous";
height_image.src = 'https://i.ibb.co/kS3qWBL/heightmap-9.png';
height_image.width = 720;
height_image.height = 1080;
