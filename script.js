import * as THREE from 'three'
import {TextGeometry} from "three/examples/jsm/geometries/TextGeometry";
import {BoxGeometry} from "three";
import {FontLoader} from "three/addons/loaders/FontLoader.js";
import chess from "./assets/chess.png";
import fms from "./assets/fms.png";
import mm from "./assets/mm.png";
import ghp from "./assets/ghp.png";
import wood from "./assets/wood.png";

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

// CREATE SCENE
const scene = new THREE.Scene()
scene.add(dLight)
scene.add(aLight)

// CREATE GLOBAL VARIABLES
let clickedObject = null
let lastClickable = null
const clickables = []

// SET UP LOADERS
const loadingManager = new THREE.LoadingManager()
const fontLoader = new FontLoader()
const textureLoader = new THREE.TextureLoader(loadingManager)

// CREATE POLYHEDRONS
const leftPolyhedron = getCustomPentagonalPrism(1, 'l')
leftPolyhedron.position.set(0, 1, -1.2)
const rightPolyhedron = getCustomPentagonalPrism(1, 'r')
rightPolyhedron.position.set(0, 1, 1.2)

// CREATE LOADING BEHAVIOR
loadingManager.onLoad = function() {
    const loadingHTML = document.getElementById('loading')
    if (loadingHTML !== undefined && loadingHTML !== null) document.body.removeChild(loadingHTML)
    scene.add(leftPolyhedron)
    scene.add(rightPolyhedron)
}

// SET UP OBJECT'S SPIN
let mouseDown = false
let mouseX = 0
const baseSpin = -0.4;
let deltaXleft = baseSpin
let deltaXright = baseSpin
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

// SHAPES
function getCustomPentagonalPrism(radius, instance) {
    if (instance !== 'l' && instance !== 'r') return

    const prismHeight = 1

    const SMALL_R = radius * Math.cos(Math.PI / 5)
    const SIDE = 2 * radius * Math.sin(Math.PI / 5)

    // Create 2 pentagons
    const bottom = new THREE.Mesh(new THREE.CircleGeometry(radius, 5), new THREE.MeshStandardMaterial({color: 0x3de2ff, side: THREE.DoubleSide}))
    const top = new THREE.Mesh(new THREE.CircleGeometry(radius, 5), new THREE.MeshStandardMaterial({color: 0x3de2ff, side: THREE.DoubleSide}))

    // Create 5 rectangles
    const sides = []
    for (let i = 0; i < 5; i ++) {
        const side = new THREE.Mesh(new THREE.PlaneGeometry(SIDE, prismHeight), new THREE.MeshStandardMaterial({color: 0x3de2ff, side: THREE.DoubleSide}))
        sides.push(side)
    }
    if (instance === 'l') getLeftSides(sides);
    else if (instance === 'r') getRightSides(sides);

    // Position the pentagons
    bottom.position.set(0, (-prismHeight / 2), 0)
    top.position.set(0, (prismHeight / 2), 0)
    bottom.rotation.x = Math.PI / 2
    top.rotation.x = Math.PI / -2

    // Position the rectangles
    for (let i = 0; i < 5; i ++) {
        const pos = polarToCartesian(SMALL_R, (((2 * i) - 1) * Math.PI) / 5)
        sides[i].position.set(pos[0], 0, pos[1])
        sides[i].rotation.y = (7 - (4 * i)) * Math.PI / 10
    }

    const group = new THREE.Group
    group.add(bottom)
    group.add(top)
    for (let i = 0; i < 5; i ++) group.add(sides[i])

    return group
}

function getLeftSides(sides) {

    // ADD ALL TEXT
    fontLoader.load('fonts/noto-sans-regular.json', function (font) {
        // SIDE 0
        sides[0].add(getBillboard('Work Experience', font))

        // SIDE 1
        sides[1].add(getBillboard('Education', font))

        // SIDE 2
        sides[2].add(getBillboard('Pic of me', font))

        // SIDE 3
        sides[3].add(getBillboard('Socials', font))

        // SIDE 4
        sides[4].add(getBillboard('Hobbies', font))
    });

    // ADD IMAGES
}

function getRightSides(sides) {

    // ADD ALL TEXT
    fontLoader.load('fonts/noto-sans-regular.json', function (font) {
        // SIDE 0
        sides[0].add(getBillboard('50 High Points', font))
        sides[0].add(getBottomText('Coming soon...', font, {yPos: .0000001}))

        // SIDE 1
        sides[1].add(getBillboard('Online Chess', font))
        sides[1].add(getBottomText('Fully functional chess server', font, {yPos: -.25}))
        sides[1].add(getBottomText('written in Java. For now, the client', font, {yPos: -.35}))
        sides[1].add(getBottomText('is available as an executable .jar.', font, {yPos: -.45}))

        // SIDE 2
        sides[2].add(getBillboard('Family Map', font))
        sides[2].add(getBottomText('Artificial family history data', font, {yPos: -.25}))
        sides[2].add(getBottomText('generation in both Java and Go.', font, {yPos: -.35}))
        sides[2].add(getBottomText('Client is a native Android app.', font, {yPos: -.45}))

        // SIDE 3
        sides[3].add(getBillboard('Music Metrics', font))
        sides[3].add(getBottomText('Full stack app to see stats about', font, {yPos: -.25}))
        sides[3].add(getBottomText('your all-time Spotify listening', font, {yPos: -.35}))
        sides[3].add(getBottomText('history. Written in Go and React.', font, {yPos: -.45}))

        // SIDE 4
        sides[4].add(getBillboard('GoatHouse Pizza', font))
        sides[4].add(getBottomText('Online hub for my pizza company.', font, {yPos: -.25}))
        sides[4].add(getBottomText('Front end written in Vanilla JS', font, {yPos: -.35}))
        sides[4].add(getBottomText('and utilizes Microsoft Azure.', font, {yPos: -.45}))
    });

    // ADD IMAGES

    // SIDE 0

    // SIDE 1
    sides[1].add(getProjectPicture(chess, "https://cs240.noahpratt.com"))

    // SIDE 2
    sides[2].add(getProjectPicture(fms, "https://fms.noahpratt.com"))

    // SIDE 3
    sides[3].add(getProjectPicture(mm, "https://musicmetrics.app"))

    // SIDE 4
    sides[4].add(getProjectPicture(ghp, "https://goathousepizza.com"))
}

function getBottomText(text, font, options) {
    if (options === undefined) options = {}
    const geometry = new TextGeometry(text, {
        font: font,
        size: options.size || .05,
        height: options.thickness || .005,
    });
    const words = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({color: 0x0000ff, side: THREE.DoubleSide}))
    words.position.set(centerTextX(geometry), (options.yPos || -.42), 0)
    return words
}

function getProjectPicture(res, url) {
    const geometry = new THREE.BoxGeometry(1, .6, .05)
    const materials = [
        new THREE.MeshBasicMaterial({color: 0xaaaaaa}),
        new THREE.MeshBasicMaterial({color: 0xaaaaaa}),
        new THREE.MeshBasicMaterial({color: 0xaaaaaa}),
        new THREE.MeshBasicMaterial({color: 0xaaaaaa}),
        new THREE.MeshBasicMaterial({color: 0xcccccc, map: textureLoader.load(res)}),
        new THREE.MeshBasicMaterial({color: 0xaaaaaa})
    ]
    const materials2 = [
        new THREE.MeshBasicMaterial({color: 0xeeeeee}),
        new THREE.MeshBasicMaterial({color: 0xeeeeee}),
        new THREE.MeshBasicMaterial({color: 0xeeeeee}),
        new THREE.MeshBasicMaterial({color: 0xeeeeee}),
        new THREE.MeshBasicMaterial({color: 0xffffff, map: textureLoader.load(res)}),
        new THREE.MeshBasicMaterial({color: 0xeeeeee})
    ]
    const mesh = new THREE.Mesh(geometry, materials)
    mesh.position.y = .15
    clickables.push([mesh, materials, materials2, url])
    return mesh
}

function getBillboard(text, font) {

    const FONT_SIZE = .08
    const HORIZ_PADDING = .1
    const VERT_PADDING = .1
    const HEIGHT = FONT_SIZE + VERT_PADDING;

    const geometry = new TextGeometry(text, {
        font: font,
        size: FONT_SIZE,
        height: .01,
    });
    const textWidth = centerTextX(geometry) * -2

    // Create base
    const boardGeo = new THREE.BoxGeometry(textWidth + HORIZ_PADDING, HEIGHT, .01)
    const boardMats = [
        new THREE.MeshStandardMaterial({color: 0x998250}),
        new THREE.MeshStandardMaterial({color: 0x998250}),
        new THREE.MeshStandardMaterial({color: 0x998250}),
        new THREE.MeshStandardMaterial({color: 0x998250}),
        new THREE.MeshStandardMaterial({color: 0xaa9960, map: textureLoader.load(wood)}),
        new THREE.MeshStandardMaterial({color: 0xffffff, map: textureLoader.load(wood)})
    ]
    const board = new THREE.Mesh(boardGeo, boardMats)

    // Add text
    const textMesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({color: 0xdddddd}))
    textMesh.position.set(textWidth / -2, FONT_SIZE / -2, 0)
    board.add(textMesh)

    // Add posts
    const postGeo = new THREE.BoxGeometry(.02, .3, .02)
    const postMat = new THREE.MeshStandardMaterial({color: 0x553333})
    const post1 = new THREE.Mesh(postGeo, postMat)
    const post2 = new THREE.Mesh(postGeo, postMat)
    post1.position.set(textWidth / -2, -.04, -.01)
    post2.position.set(textWidth / 2, -.04, -.01)
    board.add(post1)
    board.add(post2)

    board.position.set(0, .61, -.05)

    return board
}

function centerTextX(geometry) {
    geometry.computeBoundingBox()
    const textWidth = geometry.boundingBox.max.x - geometry.boundingBox.min.x
    return textWidth / -2
}

function polarToCartesian(radius, theta) {
    const x = radius * Math.cos(theta);
    const y = radius * Math.sin(theta);
    return [x, y];
}
