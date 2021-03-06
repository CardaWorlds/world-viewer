// MatCap-style image rendered on a sphere

var camera, scene, renderer;
var gifCamera;
var image;
let params = new URLSearchParams(document.location.search.substring(1));
var nft_id = params.get("nft_id");
var mesh;
var gifCanvas;
// document.getElementById("share-btn").addEventListener("click",(e)=>{window.open("https://viewer.cardaworlds.io/?nft_id="+nft_id, "_blank");})


var capturer = new CCapture({ format: 'gif', workersPath: 'screen-capture/', framerate: 30, quality: 200, name: "CardaWorld", workers: 8 });
// var capturer = new CCapture({ format: "webm",framerate: 20, quality: 20});


fetch("https://cardaworlds-api.herokuapp.com/CheckAsset/" + nft_id, {
    //fetch("http://127.0.0.1:5000/CheckAsset/" + nft_id, {
    "dataType": 'jsonp',
    "method": "GET"
})
    .then(response => response.json())
    .then(response => {
        console.log(response);
        var metadata = response.onchain_metadata;
        var image_ipfs = metadata.image.replace("ipfs://", "")
        var imageURL = "https://gw2.easy-ipfs.com/ipfs/" + image_ipfs
        var nft_info = {
            "asset_id": response.asset,
            "asset_name": response.name,
            "description": metadata.description,
            "name": metadata.name,
            "planetName": metadata.planetName,
            "galaxyType": metadata.galaxyType,
            "rarities": metadata.rarities,
            "imageURL": imageURL,
            "heightmap": "https://gw2.easy-ipfs.com/ipfs/" + metadata.files[0].src.replace("ipfs://", ""),
            "background": "https://gw2.easy-ipfs.com/ipfs/" + metadata.files[1].src.replace("ipfs://", "")
        }

        init(nft_info.imageURL, nft_info.heightmap, nft_info.background, nft_info.name, nft_info.planetName, nft_info.rarities, nft_info.galaxyType);
        animate();

    })
    .catch(err => {
        console.log(err);
    });


function saveCapture() {
    capturer.start();
    let button = document.getElementById("saveGIF");
    button.disabled = true;
    button.innerHTML = "Recording...";
    setTimeout(function () {
        console.log("stopped");
        button.innerHTML = "Saving...";
        button.style.color = "yellow";
        capturer.stop();
        capturer.save();

    }, 8000);

}
document.getElementById("saveGIF").addEventListener('click', () => { saveCapture() });

function init(imageURL, heightmap, background, name, planetName, rarities, galaxyType) {
    console.log(heightmap)
    image = document.createElement('img');
    height_image = document.createElement('img');



    var nftInfo = document.getElementById("NFTinfo");
    var nft_title = document.getElementById("NFTtitle");

    var background_color = document.createElement('p');
    background_color.innerHTML = "<b>Galaxy type: </b>" + galaxyType;
    nftInfo.appendChild(background_color);

    var nft_planet_name = document.createElement('p');
    nft_planet_name.innerHTML = "<b>Name: </b>" + planetName;


    var nft_link = document.getElementById("NFTlink");
    nft_link.innerHTML = name;
    //nftInfo.appendChild(nft_title);
    nftInfo.appendChild(nft_planet_name)

    nft_link.setAttribute("href", imageURL);
    nft_link.setAttribute("target", "_blank");

    rarities_html = '<b>Rarities: </b><ul><li>' + rarities.replace(/,/gi, '</li><li>') + '</li></ul>';
    document.getElementById("raritiesDiv").innerHTML = rarities_html;
    raritiesArray =rarities.split(",");
    console.log(raritiesArray);



    image.crossOrigin = "anonymous";
    image.src = imageURL;
    image.width = 720;
    image.height = 1080;
    image.style.maxHeight = "30%";
    image.style.maxWeight = "30%";

    height_image.crossOrigin = "anonymous";
    height_image.src = heightmap;
    height_image.width = 720;
    height_image.height = 1080;

    //document.body.style.backgroundImage = "url(" + background + ")";

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

    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true }); //alpha: true is used to allow backgrounds
    renderer.setSize(window.innerWidth, window.innerHeight);

    gifCanvas = document.getElementById("gifCanvas")
    gifRenderer = new THREE.WebGLRenderer({ alpha: true, canvas: gifCanvas, antialias: true }); //alpha: true is used to allow backgrounds
    gifRenderer.setSize(450, 300);
    gifCamera = new THREE.PerspectiveCamera(40, 450 / 300, 1, 1000);
    gifCamera.position.set(0, 0, 248);


    document.body.appendChild(renderer.domElement);



    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.set(0, 0, 200);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.minDistance = 110;
    controls.maxDistance = 200;
    controls.maxPolarAngle =1.8;
    controls.minPolarAngle =1.2;
    controls.enablePan = false;


    document.body.appendChild(image);

    var texture = new THREE.Texture(image)
    texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    texture.minFilter =  THREE.LinearMipmapLinearFilter;

    image.onload = function () {
        texture.needsUpdate = true;
    };

    var uniforms = {
        "tex": { value: texture }
    };

    var light = new THREE.DirectionalLight(0x404040, 4);
    light.position.set(50, 50, 40);
    scene.add(light);
    light.shadow.radius=10;

    var ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const loader = new THREE.TextureLoader();
    /* loader.load(background, function (texture) {
        scene.background = texture;
    }); */

    const cubeLoader = new THREE.CubeTextureLoader();
    const spaceTexture = cubeLoader.load([
        './resources/'+galaxyType+'-space-posx.jpg',
        './resources/'+galaxyType+'-space-negx.jpg',
        './resources/'+galaxyType+'-space-posy.jpg',
        './resources/'+galaxyType+'-space-negy.jpg',
        './resources/'+galaxyType+'-space-posz.jpg',
        './resources/'+galaxyType+'-space-negz.jpg',
    ]);
    spaceTexture.encoding = THREE.sRGBEncoding;
    scene.background = spaceTexture;


    THREE.ImageUtils.crossOrigin = 'anonymous';
    var material = new THREE.MeshPhongMaterial({
        map: loader.load(imageURL),
        bumpMap: loader.load(heightmap),
        bumpScale: 1.8,
        displacementMap: loader.load(heightmap),
        displacementScale: 8,
        shininess: 15

    });

    var sphere = new THREE.SphereBufferGeometry(80, 1080, 720)

    mesh = new THREE.Mesh(sphere, material)

    scene.add(mesh);

    // create custom material from the shader code above, used to add glowing atmosphere
    //   that is within specially labeled script tags
    if(raritiesArray.includes("Radioactive atmosphere")){
        var atmosphereColors="( 0.96, 0.576, 0.1019, 1.3 )";
        var glowRadius=105;

    }else{
        var atmosphereColors="(0.5,0.6,1,1)";
        var glowRadius=98;

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
    gifRenderer.render(scene, gifCamera);

    render();

}

function render() {

    capturer.capture(gifCanvas);
    renderer.render(scene, camera);

}

