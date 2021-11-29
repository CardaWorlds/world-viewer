/* class Planet {
    constructor(map, heightmap, size, atmosphere)
}
 */

function createPlanet(loader,map, heightmap, planetType, atmosphere, planetSize) {
    
    var heightmapTexture = loader.load(heightmap);
    //heightmapTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    heightmapTexture.minFilter = THREE.LinearFilter;

    var bumpScale = planetType == "Terrestrial" ? 1.8 : 0;
    var displacementScale = planetType == "Terrestrial" ? 8 : (planetType == "Gas giant" ? 0 : 2);

    THREE.ImageUtils.crossOrigin = 'anonymous';
    var material = new THREE.MeshPhongMaterial({
        map: map,
        bumpMap: loader.load(heightmapTexture),
        bumpScale: bumpScale,
        displacementMap: heightmapTexture,
        displacementScale: displacementScale,
        shininess: 0,
        reflectivity:0
    });
   
    var sphere = new THREE.SphereBufferGeometry(1, 360, 360)

    mesh = new THREE.Mesh(sphere, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.scale.set(planetSize, planetSize, planetSize)
    // gaseousMesh.rotation.set(Math.PI/2,0, 0); // Set initial rotation

    
    return mesh

    //objects.push(createAtmosphere(atmosphere,planetOrbit, objects))
}

function createAtmosphere(atmosphere,planetOrbit){
    if (atmosphere == "Helium-Hydrogen") {
        var atmosphereColors = "( 0.5, 0.5, 0.3, 1.1 )";
        var glowRadius = 105;

    } else if (atmosphere == "Radioactive") {
        var atmosphereColors = "( 0.94, 0.25, 0.2, 1.1 )";
        var glowRadius = 105;

    }
    else if (atmosphere == "Arcane") {
        var atmosphereColors = "( 0.68, 0.2, 0.87, 1.1 )";
        var glowRadius = 103;

    }
    else if (atmosphere == "Poisonous") {
        var atmosphereColors = "( 0.44, 0.85, 0.2, 1.1 )";
        var glowRadius = 103;

    }
    else if (atmosphere == "Eldritch") {
        var atmosphereColors = "( 0.84, 0.25, 0.82, 1.1 )";
        var glowRadius = 103;

    }else if (atmosphere == "Poisonous") {
        var atmosphereColors = "( 0.44, 0.85, 0.2, 1.1 )";
        var glowRadius = 103;

    }
    else if (atmosphere == "Thaumaturgic") {
        var atmosphereColors = "( 0.1, 0.1, 0.9, 1.1 )";
        var glowRadius = 103;

    }
    else if (atmosphere == "Balanced") {
        var atmosphereColors = "( 0.0, 0.0, 0.9, 1.1 )";
        var glowRadius = 103;

    } else if(atmosphere=="Biodome"){
        var atmosphereColors = "( 0.5, 0.9, 0.8 , 0.8 )";
        var glowRadius=103;

    }
    else {
        var atmosphereColors = "(0.5,0.6,1,1)";
        var glowRadius = 105;

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

    objects.push(ball);
    planetOrbit.add(ball);

    ////------------------------

    if(atmosphere=="Eldritch"){
        atmosphereColors = "(0.8,0.1,0.1,1)";
        glowRadius = 95;
        var blending=THREE.NormalBlending;

    } else if(atmosphere=="Thaumaturgic"){
        atmosphereColors = "(0.1,0.9,0,1)";
        glowRadius = 95;
        var blending=THREE.AdditiveBlending;
    } else if(atmosphere=="Balanced"){
        atmosphereColors = "(0.8,0.1,0,1)";
        glowRadius = 95;
        var blending=THREE.NormalBlending;
    } else if(atmosphere=="Red laser shield"){
        atmosphereColors = "(0.9,0.1,0,1)";
        glowRadius = 95;
        var blending=THREE.NormalBlending;
    } else if(atmosphere=="Green laser shield"){
        atmosphereColors = "(0.1,0.9,0,1)";
        glowRadius = 95;
        var blending=THREE.NormalBlending;
    }
    else if(atmosphere=="Purple laser shield"){
        atmosphereColors = "(0.65,0.1,0.85,1)";
        glowRadius = 95;
        var blending=THREE.NormalBlending;
    } else if(atmosphere=="Biodome"){
        atmosphereColors = "(0.85,1,0.45,0.7)";
        glowRadius = 95;
        var blending=THREE.NormalBlending;
    }
    else{
        atmosphereColors = "(0,0,0,0)";
        var blending=THREE.AdditiveBlending;
    }
    
    if(atmosphere == "Red laser shield" || atmosphere=="Purple laser shield" || atmosphere=="Green laser shield"){
        var fragmentShader2 = `varying vec3 vNormal;
                        void main() 
                        {
                        float intensity = pow( 0.7 + dot( vNormal, vec3( 0.0, 0.0, 1.0 ) ), 2.0 ); 
                        gl_FragColor = vec4${atmosphereColors} * intensity;
                        }`;
    } else if(atmosphere == "Biodome"){
        var blending=THREE.AdditiveBlending;
        var fragmentShader2 = `varying vec3 vNormal;
                        void main() 
                        {
                        float intensity = pow( 0.3 + dot( vNormal, vec3( 0.0, 0.0, 1.0 ) ), 0.5 ); 
                        gl_FragColor = vec4${atmosphereColors} * intensity;
                        }`;
    } else{
        var fragmentShader2 = `varying vec3 vNormal;
                        void main() 
                        {
                        float intensity = pow( 0.7-dot( vNormal, vec3( 0.0, 0.0, 1.0 ) ),4.0 ); 
                        gl_FragColor = vec4${atmosphereColors} * intensity;
                        }`;

    }
    
    var customMaterial = new THREE.ShaderMaterial(
        {
            uniforms: {},
            vertexShader: document.getElementById('vertexShader').textContent,
            fragmentShader: fragmentShader2,
            side: THREE.BackSide,
            blending: blending,
            transparent: true
        });


    var ballGeometry = new THREE.SphereBufferGeometry(glowRadius, 360, 360);
    var ball = new THREE.Mesh(ballGeometry, customMaterial);

    objects.push(ball);
    planetOrbit.add(ball);
}

//crear una clase PLanet para crear cada planeta(devuelve el mesh del planeta y el objeto atmosfera), luego una function createMoons que devuelve un objeto moonOrbit con todas las lunas de un planeta, luego una funcion createRings que aniade rings a un planeta