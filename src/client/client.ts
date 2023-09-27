import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import Stats from 'three/examples/jsm/libs/stats.module'
import { MapControls } from 'three/examples/jsm/controls/MapControls.js';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import { GUI } from 'dat.gui'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import { Reflector } from 'three/examples/jsm/objects/Reflector.js';
// @ts-ignore
import { addmodel } from './addmodel';
import { HDRCubeTextureLoader } from 'three/examples/jsm/loaders/HDRCubeTextureLoader.js';
import { FlakesTexture } from 'three/examples/jsm/textures/FlakesTexture.js';
import {DefaultLoadingManager} from 'three';

const scene = new THREE.Scene()
const pickableObjects: THREE.Mesh[] = []
let intersectedObject: THREE.Object3D | null
const originalMaterials: { [id: string]: THREE.Material | THREE.Material[] } =
    {}
const highlightedMaterial = new THREE.MeshBasicMaterial({
    wireframe: true,
    color: 0x00ff00,
})
scene.background = new THREE.Color( 0xf2f2f2);
// scene.add(new THREE.AxesHelper(5))
const camera = new THREE.PerspectiveCamera(
    100,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
)
camera.position.z = 2

const light = new THREE.DirectionalLight(0xffffff, 1)
scene.add(light)
light.position.x = 5
light.position.y = 9
light.position.z = 6.5
light.castShadow = true
const helper = new THREE.DirectionalLightHelper(light)
// scene.add(helper)

// camera.lookAt(0.5, 0.5, 0.5)
// controls.target.set(.5, .5, .5)
// controls.update()

// controls.addEventListener('change', () => console.log("Controls Change"))
// controls.addEventListener('start', () => console.log("Controls Start Event"))
// controls.addEventListener('end', () => console.log("Controls End Event"))
// controls.autoRotate = true
// controls.autoRotateSpeed = 10
// controls.enableDamping = true
// controls.dampingFactor = .01
// controls.enableKeys = true //older versions
// controls.listenToKeyEvents(document.body)
// controls.keys = {
//     LEFT: "ArrowLeft", //left arrow
//     UP: "ArrowUp", // up arrow
//     RIGHT: "ArrowRight", // right arrow
//     BOTTOM: "ArrowDown" // down arrow
// }
// controls.mouseButtons = {
//     LEFT: THREE.MOUSE.ROTATE,
//     MIDDLE: THREE.MOUSE.DOLLY,
//     RIGHT: THREE.MOUSE.PAN
// }
// controls.touches = {
//     ONE: THREE.TOUCH.ROTATE,
//     TWO: THREE.TOUCH.DOLLY_PAN
// }
// controls.screenSpacePanning = true
// controls.minAzimuthAngle = 0
// controls.maxAzimuthAngle = Math.PI / 2
// controls.minPolarAngle = 0
// controls.maxPolarAngle = Math.PI
// controls.maxDistance = 4
// controls.minDistance = 2


// make the camera look down
camera.position.set(0, 4, 0);
camera.up.set(0, 1, 0);
camera.lookAt(0, 0, 0);


// const dirLight = new THREE.DirectionalLight( 0xefefff, 1.5 );
// dirLight.position.set( 10, 10, 10 );

// scene.add( dirLight );



// const camera = new THREE.PerspectiveCamera(
//     50,
//     window.innerWidth / window.innerHeight,
//     .1,
//     1000
// )
// camera.position.z = 2

const renderer = new THREE.WebGLRenderer()
// Since Three r150, and Blender 3.6, lighting has changed significantly.
//
// renderer.physicallyCorrectLights = true // is now deprecated since Three r150. Use renderer.useLegacyLights = false instead.
//
// If exporting lights from Blender, they are very bright.
// lights exported from blender are 10000 times brighter when used in Threejs
// so, you can counter this by setting renderer.useLegacyLights = false
renderer.useLegacyLights = false // WebGLRenderer.physicallyCorrectLights = true is now WebGLRenderer.useLegacyLights = false
// however, they are now still 100 times brighter in Threejs than in Blender,
// so to try and match the threejs scene shown in video, reduce Spotlight watts in Blender to 10w.
// The scene in blender will be lit very dull. 
// Blender and Threejs use different renderers, they will never match. Just try your best.
//
renderer.shadowMap.enabled = true
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

const controls = new OrbitControls(camera, renderer.domElement)

// camera.lookAt(0.5, 0.5, 0.5)
// controls.target.set(.5, .5, .5)
// controls.update()

// controls.addEventListener('change', () => console.log("Controls Change"))
// controls.addEventListener('start', () => console.log("Controls Start Event"))
// controls.addEventListener('end', () => console.log("Controls End Event"))
// controls.autoRotate = true
// controls.autoRotateSpeed = 10
// controls.enableDamping = true
// controls.dampingFactor = .01
// controls.enableKeys = true //older versions
// controls.listenToKeyEvents(document.body)
// controls.keys = {
//     LEFT: "ArrowLeft", //left arrow
//     UP: "ArrowUp", // up arrow
//     RIGHT: "ArrowRight", // right arrow
//     BOTTOM: "ArrowDown" // down arrow
// }
// controls.mouseButtons = {
//     LEFT: THREE.MOUSE.ROTATE,
//     MIDDLE: THREE.MOUSE.DOLLY,
//     RIGHT: THREE.MOUSE.PAN
// }
// controls.touches = {
//     ONE: THREE.TOUCH.ROTATE,
//     TWO: THREE.TOUCH.DOLLY_PAN
// }
// controls.screenSpacePanning = true
// controls.minAzimuthAngle = 0
// controls.maxAzimuthAngle = Math.PI / 2
// controls.minPolarAngle = 0
// controls.maxPolarAngle = Math.PI
// controls.maxDistance = 4
// controls.minDistance = 2
new HDRCubeTextureLoader()
					.setPath( 'textures/cube/pisaHDR/' )
					.load( [ 'px.hdr', 'nx.hdr', 'py.hdr', 'ny.hdr', 'pz.hdr', 'nz.hdr' ],
						function ( texture ) {
                            const loader = new GLTFLoader()

loader.load(
    'models/scene.gltf',
    function (gltf) {
        gltf.scene.traverse(function (child) {
            if (((child as THREE.Mesh).isMesh) && (child as THREE.Mesh).name.includes('table_table1_0')) {
                (child as THREE.Mesh).material = material1
            }
            if ((child as THREE.Mesh).isMesh) {
                const m = child as THREE.Mesh
                //the sphere and plane will not be mouse picked. THe plane will receive shadows while everything else casts shadows.
                switch (m.name) {
                    
                    default:
                        m.castShadow = true
                        child.receiveShadow = true;
                        pickableObjects.push(m)
                        //store reference to original materials for later
                        originalMaterials[m.name] = (m as THREE.Mesh).material
                }

            
            }
            

        })
        scene.add(gltf.scene)
        gltf.animations; // Array<THREE.AnimationClip>
		gltf.scene; // THREE.Group
		gltf.scenes; // Array<THREE.Group>
		gltf.cameras; // Array<THREE.Camera>
		gltf.asset; // Object
        gltf.scene.position.x = 3.3;
        gltf.scene.position.y = 0;
        gltf.scene.position.z = 0;
        gltf.scene.scale.x = 1;
        gltf.scene.scale.y = 1;
        gltf.scene.scale.z= 1;
        var table = (scene.getObjectByName("table_table1_0") as THREE.Mesh)
        
        table!.material = material1
        console.log(table)

        // var lightings = scene.getObjectByName('ceiling_lamps')
        // lightings!.visible = false
        // var ceiling = scene.getObjectByName('ceiling')
        // ceiling!.visible = false
        // var floor = scene.getObjectByName('floor')
        // floor!.visible = false
        
        // house!.visible = false
    
    },
    (xhr) => {
        console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
    },
    (error) => {
        console.log(error)
    }
)
                            
const objLoader = new THREE.ObjectLoader();
const group = new THREE.Group();
scene.add( group )
group.name = "customfixture"
var model1 = '18R45D'
var locationx = 0
var locationy = 0
var rotationa = 0
var v1 = new THREE.Vector3(0, 0, 0)
var v2 = new THREE.Vector3(0, 0, 0)
var o = new THREE.Vector3(0, 1, 0)
var center = new THREE.Vector3(0, 0, 0)
const aabb = new THREE.Box3();
const box = new THREE.BoxHelper( group, 0xffff00 );
// scene.add( box );

const gui = new GUI()
const userform = gui.addFolder('Insert Model')

document.getElementById("btn1")!.addEventListener("click", load, false);
document.getElementById("btn2")!.addEventListener("click", load, false);


function load() {
    
        var group2 = scene.getObjectByName("customfixture")
    var locationx = 0
    var locationy = 0
    var rotationa = 0
    for (var i = group2!.children.length - 1; i >= 0; i--) {
        group.remove(group2!.children[i]);
    }
    let selectElement: HTMLSelectElement = 
document.getElementById('lstBox1') as HTMLSelectElement;

for (let i = 0; i < selectElement.options.length; i++) {
  let option: HTMLOptionElement = selectElement.options[i];
  console.log(option);
  objLoader.load(
        
    "models/" + option.label + ".json",
    (object) => {
        // (object.children[0] as THREE.Mesh).material = material
        object.traverse(function (child) {
            if (((child as THREE.Mesh).isMesh) && (child as THREE.Mesh).name.includes('Body1')) {
                const textureLoader = new THREE.TextureLoader()
        const normalMap3 = new THREE.CanvasTexture( new FlakesTexture() );
                        normalMap3.wrapS = THREE.RepeatWrapping;
                        normalMap3.wrapT = THREE.RepeatWrapping;
                        normalMap3.repeat.x = 10;
                        normalMap3.repeat.y = 6;
                        normalMap3.anisotropy = 16;
        let material = new THREE.MeshPhysicalMaterial( {
            clearcoat: 1.0,
            clearcoatRoughness: 0.1,
            metalness: 0.9,
            roughness: 1.0,
            color: 0x0000ff,
            normalMap: normalMap3,
            normalScale: new THREE.Vector2( 0.15, 0.15 )
        } );
                (child as THREE.Mesh).material = material
            }
            if (((child as THREE.Mesh).isMesh) && (child as THREE.Mesh).name.includes('Body2')) {
                const textureLoader = new THREE.TextureLoader()
        const normalMap3 = new THREE.CanvasTexture( new FlakesTexture() );
                        normalMap3.wrapS = THREE.RepeatWrapping;
                        normalMap3.wrapT = THREE.RepeatWrapping;
                        normalMap3.repeat.x = 10;
                        normalMap3.repeat.y = 6;
                        normalMap3.anisotropy = 16;
        let material = new THREE.MeshPhysicalMaterial( {
            clearcoat: 1.0,
            clearcoatRoughness: 0.1,
            metalness: 0.9,
            roughness: 1.0,
            color: 0x0000ff,
            normalMap: normalMap3,
            normalScale: new THREE.Vector2( 0.15, 0.15 )
        } );
                (child as THREE.Mesh).material = material
            }
            if ((child as THREE.Mesh).isMesh) {
                const m = child as THREE.Mesh
            //the sphere and plane will not be mouse picked. THe plane will receive shadows while everything else casts shadows.
            switch (m.name) {
                
                default:
                    m.castShadow = true
                    child.receiveShadow = false;
                    pickableObjects.push(m)
                    //store reference to original materials for later
                    originalMaterials[m.name] = (m as THREE.Mesh).material
            }
            }
        })
        scene.add(object)
        group.add(object)
        console.log(scene.getObjectByName(option.label))
        var obj1 = scene.getObjectByName(option.label)
        var group1 = scene.getObjectByName("customfixture")
        group1!.position.set(0,0,0)
        object.scale.set( .04, .04, .04 )
        object.position.set(v1.x, 0, v1.z)
        object.rotation.set( THREE.MathUtils.degToRad(270), 0, THREE.MathUtils.degToRad(rotationa) )
        locationx = obj1!.userData.X*.04 + locationx
        locationy = obj1!.userData.Y*.04 + locationy
        console.log(scene)
        v2 = new THREE.Vector3(obj1?.userData.X*.04, 0, obj1?.userData.Y*.04)
        v2.applyAxisAngle(o,THREE.MathUtils.degToRad(rotationa))
        v1 = v1.add(v2)
        rotationa = obj1!.userData.A + rotationa
        aabb.setFromObject( group1! );
        aabb.getCenter(center)
        group1!.position.set(-center.x,3,-center.z)
        box.setFromObject(group1!)
        
        
        
        
        
        
    },
    (xhr) => {
        console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
    },
    (error) => {
        console.log(error)
    }
)
}
    

  
    
}

var removemodel = { add:function(){ 
    var groupchild = group.children[0];
    group.remove(group.children[0]);
    
    
}};
userform.add(removemodel,'add').name('Remove')
var topview = { add:function(){ 
    console.log("clicked") 
    camera.position.set(0, 4, 0);
    camera.up.set(0, 1, 0);
    camera.lookAt(0, 0, 0);
    controls.target = new THREE.Vector3(0,0,0)
    
}};
    userform.add(topview,'add').name('Top View')
window.addEventListener('resize', onWindowResize, false)
    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight
        camera.updateProjectionMatrix()
        renderer.setSize(window.innerWidth, window.innerHeight)
        render()
    } 
							const geometry = new THREE.SphereGeometry( .8, 64, 32 );

							const textureLoader = new THREE.TextureLoader();

							const diffuse = textureLoader.load( 'textures/carbon/Carbon.png' );
							diffuse.colorSpace = THREE.SRGBColorSpace;
							diffuse.wrapS = THREE.RepeatWrapping;
							diffuse.wrapT = THREE.RepeatWrapping;
							diffuse.repeat.x = 10;
							diffuse.repeat.y = 10;

							const normalMap = textureLoader.load( 'textures/carbon/Carbon_Normal.png' );
							normalMap.wrapS = THREE.RepeatWrapping;
							normalMap.wrapT = THREE.RepeatWrapping;
							normalMap.repeat.x = 10;
							normalMap.repeat.y = 10;

							const normalMap2 = textureLoader.load( 'textures/water/Water_1_M_Normal.jpg' );
                            const normalMap5 = textureLoader.load( 'textures/table1_baseColor.jpg' );
                            
							const normalMap3 = new THREE.CanvasTexture( new FlakesTexture() );
							normalMap3.wrapS = THREE.RepeatWrapping;
							normalMap3.wrapT = THREE.RepeatWrapping;
							normalMap3.repeat.x = 10;
							normalMap3.repeat.y = 6;
							normalMap3.anisotropy = 16;

							const normalMap4 = textureLoader.load( 'textures/golfball.jpg' );

							const clearcoatNormalMap = textureLoader.load( 'textures/pbr/Scratched_gold/Scratched_gold_01_1K_Normal.png' );
                            var material1 = new THREE.MeshPhysicalMaterial( {
                                metalness: 0.0,
								roughness: 0.5,
								clearcoat: .5,
								normalMap: normalMap5,
                                emissiveMap: normalMap5,
								clearcoatNormalMap: clearcoatNormalMap,

								// y scale is negated to compensate for normal map handedness.
								clearcoatNormalScale: new THREE.Vector2( 2.0, - 2.0 )
                            } );
							// car paint

							let material = new THREE.MeshPhysicalMaterial( {
								clearcoat: 1.0,
								clearcoatRoughness: 0.1,
								metalness: 0.9,
								roughness: 0.5,
								color: 0x0000ff,
								normalMap: normalMap3,
								normalScale: new THREE.Vector2( 0.15, 0.15 )
							} );

							

							// fibers

							material = new THREE.MeshPhysicalMaterial( {
								roughness: 0.5,
								clearcoat: 1.0,
								clearcoatRoughness: 0.1,
								map: diffuse,
								normalMap: normalMap
							} );
							

							// golf

							material = new THREE.MeshPhysicalMaterial( {
								metalness: 0.0,
								roughness: 0.1,
								clearcoat: 1.0,
								normalMap: normalMap4,
								clearcoatNormalMap: clearcoatNormalMap,

								// y scale is negated to compensate for normal map handedness.
								clearcoatNormalScale: new THREE.Vector2( 2.0, - 2.0 )
							} );
							

							// clearcoat + normalmap

							material = new THREE.MeshPhysicalMaterial( {
								clearcoat: 1.0,
								metalness: 1.0,
								color: 0xff0000,
								normalMap: normalMap2,
								normalScale: new THREE.Vector2( 0.15, 0.15 ),
								clearcoatNormalMap: clearcoatNormalMap,

								// y scale is negated to compensate for normal map handedness.
								clearcoatNormalScale: new THREE.Vector2( 2.0, - 2.0 )
							} );
                            
							

							//

							scene.background = texture;
							scene.environment = texture;
                            console.log(scene)
						}

					);




const stats = new Stats()
const raycaster = new THREE.Raycaster()
let intersects: THREE.Intersection[]

const mouse = new THREE.Vector2()

function onDocumentMouseMove(event: MouseEvent) {
    mouse.set(
        (event.clientX / renderer.domElement.clientWidth) * 2 - 1,
        -(event.clientY / renderer.domElement.clientHeight) * 2 + 1
    )
    raycaster.setFromCamera(mouse, camera)
    intersects = raycaster.intersectObjects(pickableObjects, false)

    if (intersects.length > 0) {
        intersectedObject = intersects[0].object
        // console.log(intersects[0].object.name)
        // console.log(intersects[0].object.parent)
    } else {
        intersectedObject = null
    }
    pickableObjects.forEach((o: THREE.Mesh, i) => {
        if (intersectedObject && intersectedObject.name === o.name) {
            // pickableObjects[i].material = highlightedMaterial
        } else {
            pickableObjects[i].material = originalMaterials[o.name]
        }
    })
}
document.addEventListener('mousemove', onDocumentMouseMove, false)
document.body.appendChild(stats.dom)
document.body.appendChild( VRButton.createButton( renderer ) );
renderer.xr.enabled = true;



function animate() {
    requestAnimationFrame(animate)

    // controls.update()

    render()

    stats.update()
}
renderer.outputColorSpace = THREE.SRGBColorSpace;
function render() {
    renderer.render(scene, camera)
}
renderer.setAnimationLoop( function () {

	renderer.render( scene, camera );

} );
animate()


function openSidebar() {
    throw new Error('Function not implemented.');
}

function closeSidebar() {
    throw new Error('Function not implemented.');
}

