import * as THREE from 'three'
import {TextGeometry} from 'three/examples/jsm/geometries/TextGeometry';
import {FontLoader} from 'three/addons/loaders/FontLoader.js';

import chess from './assets/chess.png';
import fms from './assets/fms.png';
import mm from './assets/mm.png';
import ghp from './assets/ghp.png';
import wood from './assets/wood.png';
import me from './assets/me2.png'
import usa from './assets/flags/usa.png'
import az from './assets/flags/az.png'
import ut from './assets/flags/ut.png'
import wa from './assets/flags/wa.png'
import logos from './assets/logos-all1.png'
import byu from './assets/byu.jpg'

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
const fontLoader = new FontLoader(loadingManager)
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

    // Deselect everything
    document.body.style.cursor = "auto"
    resetClickables()

    // Cursor logic
    const intersects = setUpRayCaster(event)
    if (intersects.length > 0) {
        const clicked = intersects[0].object
        const index = clickablesContains(clicked)
        if (index >= 0) {
            clickables[index][0].material = clickables[index][2]
            lastClickable = clickables[index][0]
            document.body.style.cursor = "pointer"
        }
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
        if (isChildOf(clicked, leftPolyhedron)) clickedObject = leftPolyhedron;
        else if (isChildOf(clicked, rightPolyhedron)) clickedObject = rightPolyhedron;
        else clickedObject = null;
    }
}

function onMouseUp(event) {
    event.preventDefault();
    mouseDown = false;
    clickedObject = null
}

// HELPERS
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

function resetClickables() {
    clickables.forEach(item => {
        item[0].material = item[1]
    })
}

function clickablesContains(object) {
    for (let i = 0; i < clickables.length; i++) if (clickables[i][0] === object || isChildOf(object, clickables[i][0])) return i
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

function isChildOf(x, y) {
    while (x !== scene) {
        x = x.parent
        if (x === y) return true
    }
    return false
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
        sides[0].add(getText('Teaching Assistant / Head TA', font, {yPos: .38, size: .058}))
        sides[0].add(getText('BYU Computer Science Department', font, {yPos: .3, size: .03}))
        sides[0].add(getText('Course Material Developer', font, {yPos: .08, size: .058}))
        sides[0].add(getText('BYU Computer Science Department', font, {yPos: 0, size: .03}))
        sides[0].add(getText('Founder / Developer', font, {yPos: -.22, size: .058}))
        sides[0].add(getText('Music Metrics, LLC.', font, {yPos: -.3, size: .03}))
        sides[0].add(getText('GoatHouse, LLC.', font, {yPos: -.38, size: .03}))

        // SIDE 1
        sides[1].add(getBillboard('Education', font))
        sides[1].add(getText('2020 - 2024', font, {yPos: -.15}))
        sides[1].add(getText('BS in Computer Science (3.92 GPA)', font, {yPos: -.25}))
        sides[1].add(getText('Emphasis: Software Engineering', font, {yPos: -.35}))
        sides[1].add(getText('Minor in Physics', font, {yPos: -.45}))

        // SIDE 2
        sides[2].add(getBillboard('Portrait', font))

        // SIDE 3
        sides[3].add(getBillboard('Socials', font))

        const linkedin = getSocialMedia('LinkedIn', 'https://linkedin.com/in/noahjpratt', font)
        linkedin.position.set(-.25, .1, 0)
        sides[3].add(linkedin)

        const github = getSocialMedia('GitHub', 'https://github.com/prattnj', font)
        github.position.set(.3, .1, 0)
        sides[3].add(github)

        const gmail = getSocialMedia('Gmail', 'https://musicmetrics.app', font)
        gmail.position.set(-.35, -.125, 0)
        sides[3].add(gmail)

        const instagram = getSocialMedia('Instagram', 'https://instagram.com/_noahpratt00', font)
        instagram.position.set(.225, -.125, 0)
        sides[3].add(instagram)

        const facebook = getSocialMedia('Facebook', 'https://facebook.com/noah.pratt.18400/', font)
        facebook.position.set(-.25, -.35, 0)
        sides[3].add(facebook)

        const strava = getSocialMedia('Strava', 'https://strava.com/athletes/121620992', font)
        strava.position.set(.32, -.35, 0)
        sides[3].add(strava)

        // SIDE 4
        sides[4].add(getBillboard('About Me', font))
    });

    // ADD IMAGES

    // SIDE 0

    // SIDE 1
    const byuPic = getPicture(1, .5, .02, byu)
    byuPic.position.y = .2
    sides[1].add(byuPic)

    // SIDE 2
    sides[2].add(getPicture(.6, .6, .02, me))
    const usaFlag = getPicture(.3, .2, .01, usa)
    const azFlag = getPicture(.3, .2, .01, az)
    const utFlag = getPicture(.3, .2, .01, ut)
    const waFlag = getPicture(.3, .2, .01, wa)
    usaFlag.position.set(-.35, .3, 0)
    azFlag.position.set(.35, .3, 0)
    utFlag.position.set(-.35, -.3, 0)
    waFlag.position.set(.35, -.3, 0)
    usaFlag.rotateZ(.3)
    azFlag.rotateZ(-.3)
    utFlag.rotateZ(-.3)
    waFlag.rotateZ(.3)
    sides[2].add(usaFlag, azFlag, utFlag, waFlag)

    // SIDE 3
    const logoPic = getPicture(1.1, .2, .03, logos)
    logoPic.position.y = .35
    sides[3].add(logoPic)

    // SIDE 4
}

function getRightSides(sides) {

    // ADD ALL TEXT
    fontLoader.load('fonts/noto-sans-regular.json', function (font) {
        // SIDE 0
        sides[0].add(getBillboard('50 High Points', font))
        sides[0].add(getText('Coming soon...', font, {yPos: .0000001}))

        // SIDE 1
        sides[1].add(getBillboard('Online Chess', font))
        sides[1].add(getText('Fully functional chess server', font, {yPos: -.25}))
        sides[1].add(getText('written in Java. For now, the client', font, {yPos: -.35}))
        sides[1].add(getText('is available as an executable .jar.', font, {yPos: -.45}))

        // SIDE 2
        sides[2].add(getBillboard('Family Map', font))
        sides[2].add(getText('Artificial family history data', font, {yPos: -.25}))
        sides[2].add(getText('generation in both Java and Go.', font, {yPos: -.35}))
        sides[2].add(getText('Client is a native Android app.', font, {yPos: -.45}))

        // SIDE 3
        sides[3].add(getBillboard('Music Metrics', font))
        sides[3].add(getText('Full stack app to see stats about', font, {yPos: -.25}))
        sides[3].add(getText('your all-time Spotify listening', font, {yPos: -.35}))
        sides[3].add(getText('history. Written in Go and React.', font, {yPos: -.45}))

        // SIDE 4
        sides[4].add(getBillboard('GoatHouse Pizza', font))
        sides[4].add(getText('Online hub for my pizza company.', font, {yPos: -.25}))
        sides[4].add(getText('Front end written in Vanilla JS', font, {yPos: -.35}))
        sides[4].add(getText('and utilizes Microsoft Azure.', font, {yPos: -.45}))
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

function getText(text, font, options) {
    if (options === undefined) options = {}
    const geometry = new TextGeometry(text, {
        font: font,
        size: options.size || .05,
        height: options.thickness || .005,
    });
    const words = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({color: 0x333333, side: THREE.DoubleSide}))
    words.position.set(centerTextX(geometry), (options.yPos || 0), 0)
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

function getPicture(x, y, z, res) {
    const geometry = new THREE.BoxGeometry(x, y, z)
    const materials = [
        new THREE.MeshBasicMaterial({color: 0xaaaaaa}),
        new THREE.MeshBasicMaterial({color: 0xaaaaaa}),
        new THREE.MeshBasicMaterial({color: 0xaaaaaa}),
        new THREE.MeshBasicMaterial({color: 0xaaaaaa}),
        new THREE.MeshBasicMaterial({color: 0xffffff, map: textureLoader.load(res)}),
        new THREE.MeshBasicMaterial({color: 0xaaaaaa})
    ]
    return new THREE.Mesh(geometry, materials)
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

function getSocialMedia(text, url, font) {

    const FONT_SIZE = .08
    const HORIZ_PADDING = .1
    const VERT_PADDING = .1
    const HEIGHT = FONT_SIZE + VERT_PADDING;

    const geometry = new TextGeometry(text, {
        font: font,
        size: FONT_SIZE,
        height: .01,
    })
    const textWidth = centerTextX(geometry) * -2

    const boxGeo = new THREE.BoxGeometry(textWidth + HORIZ_PADDING, HEIGHT, .01)
    const boxMat1 = new THREE.MeshStandardMaterial({color: 0xdddddd})
    const boxMat2 = new THREE.MeshStandardMaterial({color: 0xffffff})
    const box = new THREE.Mesh(boxGeo, boxMat1)

    const words = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({color: 0x333333, side: THREE.DoubleSide}))
    words.position.set(textWidth / -2, FONT_SIZE / -2, 0)

    box.add(words)
    clickables.push([box, boxMat1, boxMat2, url])
    return box
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
