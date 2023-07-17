import * as THREE from 'three'
import {getCustomPentagonalPrism} from "./shapes"

// SET UP RENDERER (test)
const renderer = new THREE.WebGLRenderer();
renderer.shadowMap.enabled = true
renderer.setClearColor(0x1a1e1f)
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// SET UP CAMERA
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(-3, 1.7, 0)
camera.lookAt(0, 0, 0)

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

const polyhedron = getCustomPentagonalPrism(1, 1.2)
polyhedron.position.set(0, 1, 0)
scene.add(polyhedron)
const leftPolyhedron = getCustomPentagonalPrism(1, 1)
leftPolyhedron.position.set(0, 0, -3)
scene.add(leftPolyhedron)
const rightPolyhedron = getCustomPentagonalPrism(1, 1)
rightPolyhedron.position.set(0, 0, 3)
scene.add(rightPolyhedron)

// SET UP OBJECT'S SPIN
let mouseDown = false
let mouseX = 0
const baseSpin = -0.4;
let deltaXleft = baseSpin
let deltaXmiddle = baseSpin
let deltaXright = baseSpin
let clickedObject = null
addMouseHandler(document.body)

// ANIMATE AND RENDER
renderer.setAnimationLoop(() => {
    if (!mouseDown) updateDeltas()
    if (clickedObject !== leftPolyhedron) rotateObject(leftPolyhedron, deltaXleft)
    if (clickedObject !== polyhedron) rotateObject(polyhedron, deltaXmiddle)
    if (clickedObject !== rightPolyhedron) rotateObject(rightPolyhedron, deltaXright)
    renderer.render(scene, camera);
});

// SET UP MOUSE EVENTS
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
    if (!mouseDown) return
    event.preventDefault()

    let deltaX = event.clientX - mouseX
    if (clickedObject === leftPolyhedron) deltaXleft = deltaX;
    else if (clickedObject === polyhedron) deltaXmiddle = deltaX;
    else if (clickedObject === rightPolyhedron) deltaXright = deltaX;

    rotateObject(clickedObject, deltaX)
    mouseX = event.clientX
}

function onMouseDown(event) {
    event.preventDefault();
    mouseDown = true;
    mouseX = event.clientX;

    const rayCaster = new THREE.Raycaster(undefined, undefined, 0, undefined)
    const mouse = new THREE.Vector2()
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1
    rayCaster.setFromCamera(mouse, camera)
    const intersects = rayCaster.intersectObjects(scene.children)
    if (intersects.length > 0) {
        clickedObject = intersects[0].object.parent
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

    if (Math.abs(deltaXmiddle) > Math.abs(baseSpin)) deltaXmiddle *= .98
    else if (Math.abs(deltaXmiddle) === 0) deltaXmiddle = baseSpin;

    if (Math.abs(deltaXright) > Math.abs(baseSpin)) deltaXright *= .985
    else if (Math.abs(deltaXright) === 0) deltaXright = baseSpin;
}
