import * as THREE from 'three'
import {clickables, getCustomPentagonalPrism} from "./shapes"
import {TextGeometry} from "three/examples/jsm/geometries/TextGeometry";
import {BoxGeometry} from "three";

// SET UP RENDERER
const renderer = new THREE.WebGLRenderer();
renderer.shadowMap.enabled = true
renderer.setClearColor(0x1a1e1f)
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// SET UP CAMERA
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(-2, 1.6, 0)
camera.lookAt(0, .5, 0)

// SET UP RESIZE LISTENER
window.addEventListener('resize', function(){
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
})

// SET UP LIGHTS
const dLight = new THREE.DirectionalLight()
dLight.position.set(-8, 10, 2)
const aLight = new THREE.AmbientLight(0x565656)

// SET UP BASIC SCENE
const scene = new THREE.Scene()
scene.add(dLight)
scene.add(aLight)

// ADD POLYHEDRONS
const leftPolyhedron = getCustomPentagonalPrism(1, 'l')
leftPolyhedron.position.set(0, 1, -1.2)
scene.add(leftPolyhedron)
const rightPolyhedron = getCustomPentagonalPrism(1, 'r')
rightPolyhedron.position.set(0, 1, 1.2)
scene.add(rightPolyhedron)

let lastClickable = null

// SET UP OBJECT'S SPIN
let mouseDown = false
let mouseX = 0
const baseSpin = -0.4;
let deltaXleft = baseSpin
let deltaXright = baseSpin
let clickedObject = null
addMouseHandler(document.body)

// ANIMATE AND RENDER
renderer.setAnimationLoop(() => {
    if (!mouseDown) updateDeltas()
    if (clickedObject !== leftPolyhedron) rotateObject(leftPolyhedron, deltaXleft)
    if (clickedObject !== rightPolyhedron) rotateObject(rightPolyhedron, deltaXright)
    renderer.render(scene, camera);
});

// SET UP MOUSE EVENTS AND ROTATION
function addMouseHandler(canvas) {
    canvas.addEventListener('mousemove', function(e) {
        onMouseMove(e)
    }, false)
    canvas.addEventListener('mousedown', function(e) {
        onMouseDown(e)
    }, false)
    canvas.addEventListener('mouseup', function(e) {
        onMouseUp(e)
    }, false)
    canvas.addEventListener('mouseout', function(e) {
        onMouseUp(e)
    }, false)
}

function onMouseMove(event) {
    event.preventDefault()

    // Rotation logic
    if (mouseDown) {
        let deltaX = event.clientX - mouseX
        if (clickedObject === leftPolyhedron) deltaXleft = deltaX;
        else if (clickedObject === rightPolyhedron) deltaXright = deltaX;

        rotateObject(clickedObject, deltaX)
        mouseX = event.clientX
        return
    }

    // Cursor logic
    const intersects = setUpRayCaster(event)
    if (intersects.length > 0) {
        const clicked = intersects[0].object
        const index = clickablesContains(clicked)
        if (index >= 0) {
            clicked.material = clickables[index][2]
            lastClickable = clicked
            document.body.style.cursor = "pointer"
        } else {
            if (lastClickable !== null) lastClickable.material = clickables[clickablesContains(lastClickable)][1]
            document.body.style.cursor = "auto"
        }
    } else {
        // deselect all picture frames
        document.body.style.cursor = "auto"
        clickables.forEach(item => {
            item[0].material = item[1]
        })
    }
}

function onMouseDown(event) {
    event.preventDefault();
    mouseDown = true;
    mouseX = event.clientX;

    const intersects = setUpRayCaster(event)
    if (intersects.length > 0) {
        const clicked = intersects[0].object
        const index = clickablesContains(clicked)
        if (index >= 0 && clickables[index][3] !== null) {
            window.open(clickables[index][3])
            lastClickable.material = clickables[index][1]
        }
        if (clicked.geometry instanceof TextGeometry) {
            if (clicked.parent.geometry instanceof BoxGeometry) clickedObject = clicked.parent.parent.parent
            else clickedObject = clicked.parent.parent
        } else if (clicked.geometry instanceof BoxGeometry) {
            if (clicked.parent.geometry instanceof BoxGeometry) clickedObject = clicked.parent.parent.parent
            else clickedObject = clicked.parent.parent
        }
        else clickedObject = clicked.parent
    }
}

function onMouseUp(event) {
    event.preventDefault();
    mouseDown = false;
    clickedObject = null
}

function rotateObject(object, deltaX) {
    if (object === null) return
    object.rotation.y += deltaX / 200
}

function updateDeltas() {
    if (Math.abs(deltaXleft) > Math.abs(baseSpin)) deltaXleft *= .98
    else if (Math.abs(deltaXleft) === 0) deltaXleft = baseSpin;

    if (Math.abs(deltaXright) > Math.abs(baseSpin)) deltaXright *= .985
    else if (Math.abs(deltaXright) === 0) deltaXright = baseSpin;
}

function clickablesContains(object) {
    for (let i = 0; i < clickables.length; i++) if (clickables[i][0] === object) return i;
    return -1
}

function setUpRayCaster(event) {
    const rayCaster = new THREE.Raycaster(undefined, undefined, 0, undefined)
    const mouse = new THREE.Vector2()
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1
    rayCaster.setFromCamera(mouse, camera)
    return rayCaster.intersectObjects(scene.children)
}
