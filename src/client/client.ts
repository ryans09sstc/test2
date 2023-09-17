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
scene.add(new THREE.AxesHelper(5))
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
scene.add(helper)

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


const loader = new GLTFLoader()

loader.load(
    'models/scene.gltf',
    function (gltf) {
        gltf.scene.traverse(function (child) {
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
            // if ((child as THREE.Light).isLight) {
            //     const l = child as THREE.SpotLight
            //     l.castShadow = true
            //     l.shadow.bias = -0.003
            //     l.shadow.mapSize.width = 2048
            //     l.shadow.mapSize.height = 2048
            // }

        })
        scene.add(gltf.scene)
        gltf.animations; // Array<THREE.AnimationClip>
		gltf.scene; // THREE.Group
		gltf.scenes; // Array<THREE.Group>
		gltf.cameras; // Array<THREE.Camera>
		gltf.asset; // Object
        gltf.scene.position.x = 0;
        gltf.scene.position.y = 0;
        gltf.scene.position.z = -3;
        gltf.scene.scale.x = 1;
        gltf.scene.scale.y = 1;
        gltf.scene.scale.z= 1;
        // var lightings = scene.getObjectByName('ceiling_lamps')
        // lightings!.visible = false
        // var ceiling = scene.getObjectByName('ceiling')
        // ceiling!.visible = false
        // var floor = scene.getObjectByName('floor')
        // floor!.visible = false
        var house = scene.getObjectByName('house')
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
scene.add( box );

const gui = new GUI()
const userform = gui.addFolder('Insert Model')
var loadmodel = { add:function(){ 
    addmodel()
    objLoader.load(
        "models/" + model1 + ".json",
        (object) => {
            // (object.children[0] as THREE.Mesh).material = material
            object.traverse(function (child) {
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
            console.log(scene.getObjectByName(model1))
            var obj1 = scene.getObjectByName(model1)
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
}};


userform.add(loadmodel,'add');

var loadmodel2 = { add:function(){ 
     
    objLoader.load(
        "models/" + "18L45D" + ".json",
        (object) => {
            // (object.children[0] as THREE.Mesh).material = material
            object.traverse(function (child) {
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
            console.log(scene.getObjectByName("18L45D"))
            var obj1 = scene.getObjectByName("18L45D")
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
}};
userform.add(loadmodel2,'add').name("add2")
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

