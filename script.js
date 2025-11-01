import * as THREE from 'three';
import {TextGeometry} from 'three/examples/jsm/geometries/TextGeometry';
import {FontLoader} from 'three/addons/loaders/FontLoader.js';

import chess from './assets/chess.png';
import fms from './assets/fms.png';
import mm from './assets/mm.png';
import ghp from './assets/ghp.png';
import wood from './assets/wood.png';
import me from './assets/me2.png';
import usa from './assets/flags/usa.png';
import az from './assets/flags/az.png';
import ut from './assets/flags/ut.png';
import wa from './assets/flags/wa.png';
import logos from './assets/logos-all1.png';
import byu from './assets/byu.jpg';
import lake from './assets/lake.jpg';

const isPortrait = window.innerWidth < window.innerHeight;
if (isPortrait) document.body.removeChild(document.getElementById('welcome'));

// SET UP RENDERER
const renderer = new THREE.WebGLRenderer();
renderer.shadowMap.enabled = true;
renderer.setClearColor(0x1a1e1f);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// SET UP CAMERA
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
if (isPortrait) {
    camera.position.set(-3, 1.6, 0);
    camera.lookAt(0, 1, 0);
} else {
    camera.position.set(-2, 1.6, 0);
    camera.lookAt(0, .5, 0);
}

// SET UP RESIZE LISTENER
window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
})

// SET UP LIGHTS
const dLight = new THREE.DirectionalLight();
dLight.position.set(-8, 10, 2);
const aLight = new THREE.AmbientLight(0x565656);

// CREATE SCENE
const scene = new THREE.Scene();
scene.add(dLight);
scene.add(aLight);

// CREATE GLOBAL VARIABLES
let clickedObject = null;
const clickables = [];
let gap = 7; // space between polyhedrons on the z-axis

// SET UP LOADERS
const loadingManager = new THREE.LoadingManager();
const fontLoader = new FontLoader(loadingManager);
const textureLoader = new THREE.TextureLoader(loadingManager);

// CREATE POLYHEDRONS
const polyhedronAlpha = getCustomXagonalPrism(1.2, 5, (sides) => populateAlphaSides(sides));
const polyhedronBeta = getCustomXagonalPrism(1.2, 5, (sides) => populateBetaSides(sides));
const polyhedronGamma = getCustomXagonalPrism(1.2, 4, (sides) => populateGammaSides(sides));
const polyhedronDelta = getCustomXagonalPrism(1.2, 6, (sides) => populateDeltaSides(sides));
if (isPortrait) {
    polyhedronAlpha.position.set(0, 1.8, 0);
    polyhedronBeta.position.set(0, .5, 0);
    polyhedronGamma.position.set(0, -.8, 0);
    polyhedronDelta.position.set(0, -2.1, 0);
} else {
    polyhedronAlpha.position.set(0, 1, 0);
    polyhedronBeta.position.set(0, 1, gap);
    polyhedronGamma.position.set(0, 1, 2 * gap);
    polyhedronDelta.position.set(0, 1, -gap);
}
let centeredPolyhedron = polyhedronAlpha;

// CREATE NAVIGATION ARROWS
const leftArrow = getArrow({height: .15, width: .1, depth: .02, rotationX: Math.PI / -2, onClick: () => leftArrowClick()});
const rightArrow = getArrow({height: .15, width: .1, depth: .02, rotationX: Math.PI / 2, onClick: () => rightArrowClick()});
if (isPortrait) {

} else {
    leftArrow.position.set(-1.1, 1, -1.25);
    rightArrow.position.set(-1.1, 1, 1.25);
}

function leftArrowClick() {
    if (centeredPolyhedron === polyhedronAlpha) {
        // center delta
        centeredPolyhedron = polyhedronDelta;
        moveZ(polyhedronAlpha, gap);
        moveZ(polyhedronBeta, 2 * gap);
        moveZ(polyhedronGamma, -gap, true);
        moveZ(polyhedronDelta, 0);
    } else if (centeredPolyhedron === polyhedronBeta) {
        // center alpha
        centeredPolyhedron = polyhedronAlpha;
        moveZ(polyhedronAlpha, 0);
        moveZ(polyhedronBeta, gap);
        moveZ(polyhedronGamma, 2 * gap);
        moveZ(polyhedronDelta, -gap, true);
    } else if (centeredPolyhedron === polyhedronGamma) {
        // center beta
        centeredPolyhedron = polyhedronBeta;
        moveZ(polyhedronAlpha, -gap, true);
        moveZ(polyhedronBeta, 0);
        moveZ(polyhedronGamma, gap);
        moveZ(polyhedronDelta, 2 * gap);
    } else if (centeredPolyhedron === polyhedronDelta) {
        // center gamma
        centeredPolyhedron = polyhedronGamma;
        moveZ(polyhedronAlpha, 2 * gap);
        moveZ(polyhedronBeta, -gap, true);
        moveZ(polyhedronGamma, 0);
        moveZ(polyhedronDelta, gap);
    }
}
function rightArrowClick() {
    if (centeredPolyhedron === polyhedronAlpha) {
        // center beta
        centeredPolyhedron = polyhedronBeta;
        moveZ(polyhedronAlpha, -gap);
        moveZ(polyhedronBeta, 0);
        moveZ(polyhedronGamma, gap);
        moveZ(polyhedronDelta, 2 * gap, true);
    } else if (centeredPolyhedron === polyhedronBeta) {
        // center gamma
        centeredPolyhedron = polyhedronGamma;
        moveZ(polyhedronAlpha, 2 * gap, true);
        moveZ(polyhedronBeta, -gap);
        moveZ(polyhedronGamma, 0);
        moveZ(polyhedronDelta, gap);
    } else if (centeredPolyhedron === polyhedronGamma) {
        // center delta
        centeredPolyhedron = polyhedronDelta;
        moveZ(polyhedronAlpha, gap);
        moveZ(polyhedronBeta, 2 * gap, true);
        moveZ(polyhedronGamma, -gap);
        moveZ(polyhedronDelta, 0);
    } else if (centeredPolyhedron === polyhedronDelta) {
        // center alpha
        centeredPolyhedron = polyhedronAlpha;
        moveZ(polyhedronAlpha, 0);
        moveZ(polyhedronBeta, gap);
        moveZ(polyhedronGamma, 2 * gap, true);
        moveZ(polyhedronDelta, -gap);
    }
}

function moveZ(mesh, newZ, overrideAnimation = false) {

    if (overrideAnimation) {
        mesh.position.z = newZ;
        return;
    }

    const startZ = mesh.position.z;
    const deltaZ = newZ - startZ;

    const startTime = performance.now();

    const duration = 500;

    function animate(time) {
        const elapsed = time - startTime;
        const t = Math.min(elapsed / duration, 1);
        const ease = 1 - Math.pow(1 - t, 3);
        mesh.position.z = startZ + deltaZ * ease;
        if (t < 1) requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
}

// CREATE LOADING BEHAVIOR
loadingManager.onLoad = function() {
    const loadingHTML = document.getElementById('loading');
    if (loadingHTML !== undefined && loadingHTML !== null) document.body.removeChild(loadingHTML);
    scene.add(polyhedronAlpha);
    scene.add(polyhedronBeta);
    scene.add(polyhedronGamma);
    scene.add(polyhedronDelta);
    scene.add(leftArrow);
    scene.add(rightArrow);
}

// SET UP OBJECT'S SPIN
let mouseDown = false;
let mouseX = 0;
const baseSpin = -0.4;
let deltaXAlpha = baseSpin;
let deltaXBeta = baseSpin;
let deltaXGamma = baseSpin;
let deltaXDelta = baseSpin;
addMouseHandler(document.body);

// ANIMATE AND RENDER
renderer.setAnimationLoop(() => {
    if (!mouseDown) updateDeltas();
    if (clickedObject !== polyhedronAlpha) rotateObject(polyhedronAlpha, deltaXAlpha);
    if (clickedObject !== polyhedronBeta) rotateObject(polyhedronBeta, deltaXBeta);
    if (clickedObject !== polyhedronGamma) rotateObject(polyhedronGamma, deltaXGamma);
    if (clickedObject !== polyhedronDelta) rotateObject(polyhedronDelta, deltaXDelta);
    renderer.render(scene, camera);
});

// SET UP MOUSE EVENTS AND ROTATION
function addMouseHandler(canvas) {
    canvas.addEventListener('mousemove', function(e) {
        e.preventDefault();
        onMouseMove(e, true);
    }, false);
    canvas.addEventListener('mousedown', function(e) {
        e.preventDefault();
        onMouseDown(e, true);
    }, false);
    canvas.addEventListener('mouseup', function(e) {
        onMouseUp(e);
    }, false);
    canvas.addEventListener('mouseout', function(e) {
        e.preventDefault();
        onMouseUp();
    }, false);
    canvas.addEventListener('touchstart', function(e) {
        onMouseDown(e, false);
    }, false);
    canvas.addEventListener('touchmove', function(e) {
        onMouseMove(e, false);
    }, false);
    canvas.addEventListener('touchend', function() {
        onMouseUp();
    });
}

function onMouseMove(event, isMouse) {
    // Rotation logic
    if (mouseDown) {
        let deltaX = isMouse ? event.clientX - mouseX : event.touches[0].clientX - mouseX;
        if (clickedObject === polyhedronAlpha) deltaXAlpha = deltaX;
        else if (clickedObject === polyhedronBeta) deltaXBeta = deltaX;
        else if (clickedObject === polyhedronGamma) deltaXGamma = deltaX;
        else if (clickedObject === polyhedronDelta) deltaXDelta = deltaX;

        rotateObject(clickedObject, deltaX);
        mouseX = isMouse ? event.clientX : event.touches[0].clientX;
        return;
    }

    // Deselect everything
    document.body.style.cursor = "auto";
    resetClickables();

    // Cursor logic
    const intersects = setUpRayCaster(event);
    if (intersects.length > 0) {
        const clicked = intersects[0].object;
        const index = clickablesContains(clicked);
        if (index >= 0) {
            clickables[index][0].material = clickables[index][2];
            document.body.style.cursor = "pointer";
        }
    }
}

function onMouseDown(event, isMouse) {
    mouseDown = true;
    mouseX = isMouse ? event.clientX : event.touches[0].clientX;

    const intersects = setUpRayCaster(isMouse ? event : event.touches[0]);
    if (intersects.length > 0) {
        const clicked = intersects[0].object;
        const index = clickablesContains(clicked);
        if (index >= 0 && clickables[index][3] !== null) {
            clickables[index][3]();
        }
        if (isChildOf(clicked, polyhedronAlpha)) clickedObject = polyhedronAlpha;
        else if (isChildOf(clicked, polyhedronBeta)) clickedObject = polyhedronBeta;
        else if (isChildOf(clicked, polyhedronGamma)) clickedObject = polyhedronGamma;
        else if (isChildOf(clicked, polyhedronDelta)) clickedObject = polyhedronDelta;
        else clickedObject = null;
    }
}

function onMouseUp() {
    mouseDown = false;
    clickedObject = null
}

// HELPERS
function rotateObject(object, deltaX) {
    if (object === null) return;
    object.rotation.y += deltaX / 200;
}

function updateDeltas() {
    if (Math.abs(deltaXAlpha) > Math.abs(baseSpin)) deltaXAlpha *= .98;
    else if (Math.abs(deltaXAlpha) === 0) deltaXAlpha = baseSpin;

    if (Math.abs(deltaXBeta) > Math.abs(baseSpin)) deltaXBeta *= .985;
    else if (Math.abs(deltaXBeta) === 0) deltaXBeta = baseSpin;

    if (Math.abs(deltaXGamma) > Math.abs(baseSpin)) deltaXGamma *= .98;
    else if (Math.abs(deltaXGamma) === 0) deltaXGamma = baseSpin;

    if (Math.abs(deltaXDelta) > Math.abs(baseSpin)) deltaXDelta *= .99;
    else if (Math.abs(deltaXDelta) === 0) deltaXDelta = baseSpin;
}

function resetClickables() {
    clickables.forEach(item => {
        item[0].material = item[1];
    });
}

function clickablesContains(object) {
    for (let i = 0; i < clickables.length; i++) if (clickables[i][0] === object || isChildOf(object, clickables[i][0])) return i;
    return -1;
}

function setUpRayCaster(event) {
    const rayCaster = new THREE.Raycaster(undefined, undefined, 0, undefined);
    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    rayCaster.setFromCamera(mouse, camera);
    return rayCaster.intersectObjects(scene.children);
}

function isChildOf(x, y) {
    while (x !== scene) {
        x = x.parent;
        if (x === y) return true;
    }
    return false;
}

// OBJECTS
function getCustomXagonalPrism(radius, numSides, populateSides) {

    const prismHeight = 1;

    const SMALL_R = radius * Math.cos(Math.PI / numSides);
    const SIDE = 2 * radius * Math.sin(Math.PI / numSides);

    // Create top and bottom x-gons
    const bottom = new THREE.Mesh(new THREE.CircleGeometry(radius, numSides), new THREE.MeshStandardMaterial({color: 0x3de2ff, side: THREE.DoubleSide}));
    const top = new THREE.Mesh(new THREE.CircleGeometry(radius, numSides), new THREE.MeshStandardMaterial({color: 0x3de2ff, side: THREE.DoubleSide}));

    // Create x rectangles
    const sides = [];
    for (let i = 0; i < numSides; i ++) {
        const side = new THREE.Mesh(new THREE.PlaneGeometry(SIDE, prismHeight), new THREE.MeshStandardMaterial({color: 0x3de2ff, side: THREE.DoubleSide}));
        sides.push(side);
    }
    populateSides(sides);

    // Position the x-gons
    bottom.position.set(0, (-prismHeight / 2), 0);
    top.position.set(0, (prismHeight / 2), 0);
    bottom.rotation.x = Math.PI / 2;
    top.rotation.x = Math.PI / -2;

    // Position the rectangles
    for (let i = 0; i < numSides; i ++) {
        const pos = polarToCartesian(SMALL_R, (((2 * i) - 1) * Math.PI) / numSides);
        sides[i].position.set(pos[0], 0, pos[1]);
        sides[i].rotation.y = ((numSides + 2) - (4 * i)) * Math.PI / (numSides * 2);
    }

    const group = new THREE.Group;
    group.add(bottom);
    group.add(top);
    for (let i = 0; i < numSides; i ++) group.add(sides[i]);

    return group;
}

function populateAlphaSides(sides) {

    // ADD ALL TEXT
    fontLoader.load('fonts/noto-sans-regular.json', function (font) {
        // SIDE 0
        sides[0].add(getBillboard('Work Experience', font));
        sides[0].add(getText('Full Stack Developer', font, {yPos: .38, size: .058}));
        sides[0].add(getText('DHI Computing Services, Inc.', font, {yPos: .30, size: .037}));
        sides[0].add(getText('Teaching Assistant / Head TA', font, {yPos: .16, size: .058}));
        sides[0].add(getText('BYU Computer Science Department', font, {yPos: .08, size: .037}));
        sides[0].add(getText('Course Material Developer', font, {yPos: -.08, size: .058}));
        sides[0].add(getText('BYU Computer Science Department', font, {yPos: -.16, size: .037}));
        sides[0].add(getText('Founder / Developer', font, {yPos: -.32, size: .058}));
        sides[0].add(getText('Music Metrics, LLC. & GoatHouse, LLC.', font, {yPos: -.40, size: .037}));

        // SIDE 1
        sides[1].add(getBillboard('Education', font));
        sides[1].add(getText('2020 - 2024', font, {yPos: -.15}));
        sides[1].add(getText('BS in Computer Science (3.92 GPA)', font, {yPos: -.25}));
        sides[1].add(getText('Emphasis: Software Engineering', font, {yPos: -.35}));
        sides[1].add(getText('Minor in Physics', font, {yPos: -.45}));

        // SIDE 2
        sides[2].add(getBillboard('Portrait', font));

        // SIDE 3
        sides[3].add(getBillboard('Socials', font));

        const linkedin = getSocialMedia('LinkedIn', 'https://linkedin.com/in/noahjpratt', font);
        linkedin.position.set(-.25, .1, 0);
        sides[3].add(linkedin);

        const github = getSocialMedia('GitHub', 'https://github.com/prattnj', font);
        github.position.set(.3, .1, 0);
        sides[3].add(github);

        const gmail = getSocialMedia('Gmail', '', font);
        gmail.position.set(-.35, -.125, 0);
        sides[3].add(gmail);

        const instagram = getSocialMedia('Instagram', 'https://instagram.com/_noahpratt00', font);
        instagram.position.set(.225, -.125, 0);
        sides[3].add(instagram);

        const facebook = getSocialMedia('Facebook', 'https://facebook.com/noah.pratt.18400/', font);
        facebook.position.set(-.25, -.35, 0);
        sides[3].add(facebook);

        const strava = getSocialMedia('Strava', 'https://strava.com/athletes/121620992', font);
        strava.position.set(.32, -.35, 0);
        sides[3].add(strava);

        // SIDE 4
        sides[4].add(getBillboard('About Me', font));
        sides[4].add(getText('Born and raised in the Valley of the Sun,', font, {yPos: .43, size: .04}));
        sides[4].add(getText('I\'m a full stack software developer who', font, {yPos: .35, size: .04}));
        sides[4].add(getText('thrives on efficient solutions and clean', font, {yPos: .27, size: .04}));
        sides[4].add(getText('code. Away from the screen, I channel the', font, {yPos: .19, size: .04}));
        sides[4].add(getText('same determination into conquering the', font, {yPos: .11, size: .04}));
        sides[4].add(getText('great outdoors of the American West.', font, {yPos: .03, size: .04}));
    });

    // ADD IMAGES

    // SIDE 0

    // SIDE 1
    const byuPic = getPicture(1, .5, .02, byu);
    byuPic.position.y = .2;
    sides[1].add(byuPic);

    // SIDE 2
    sides[2].add(getPicture(.6, .6, .02, me));
    const usaFlag = getPicture(.3, .2, .01, usa);
    const azFlag = getPicture(.3, .2, .01, az);
    const utFlag = getPicture(.3, .2, .01, ut);
    const waFlag = getPicture(.3, .2, .01, wa);
    usaFlag.position.set(-.35, .3, 0);
    azFlag.position.set(.35, .3, 0);
    utFlag.position.set(-.35, -.3, 0);
    waFlag.position.set(.35, -.3, 0);
    usaFlag.rotateZ(.3);
    azFlag.rotateZ(-.3);
    utFlag.rotateZ(-.3);
    waFlag.rotateZ(.3);
    sides[2].add(usaFlag, azFlag, utFlag, waFlag);

    // SIDE 3
    const logoPic = getPicture(1.1, .2, .03, logos);
    logoPic.position.y = .35;
    sides[3].add(logoPic);

    // SIDE 4
    const lakePic = getPicture(1, .48, .01, lake);
    lakePic.position.y = -.24;
    sides[4].add(lakePic);
}

function populateBetaSides(sides) {

    // ADD ALL TEXT
    fontLoader.load('fonts/noto-sans-regular.json', function (font) {
        // SIDE 0
        sides[0].add(getBillboard('50 High Points', font));
        sides[0].add(getText('Coming soon...', font, {yPos: .0000001}));

        // SIDE 1
        sides[1].add(getBillboard('Online Chess', font));
        sides[1].add(getText('Fully functional chess server', font, {yPos: -.25}));
        sides[1].add(getText('written in Java. For now, the client', font, {yPos: -.35}));
        sides[1].add(getText('is available as an executable .jar.', font, {yPos: -.45}));

        // SIDE 2
        sides[2].add(getBillboard('Family Map', font));
        sides[2].add(getText('Artificial family history data', font, {yPos: -.25}));
        sides[2].add(getText('generation in both Java and Go.', font, {yPos: -.35}));
        sides[2].add(getText('Client is a native Android app.', font, {yPos: -.45}));

        // SIDE 3
        sides[3].add(getBillboard('Music Metrics', font));
        sides[3].add(getText('Full stack app to see stats about', font, {yPos: -.25}));
        sides[3].add(getText('your all-time Spotify listening', font, {yPos: -.35}));
        sides[3].add(getText('history. Written in Go and React.', font, {yPos: -.45}));

        // SIDE 4
        sides[4].add(getBillboard('GoatHouse Pizza', font));
        sides[4].add(getText('Online hub for my pizza company.', font, {yPos: -.25}));
        sides[4].add(getText('Front end written in Vanilla JS', font, {yPos: -.35}));
        sides[4].add(getText('and utilizes Microsoft Azure.', font, {yPos: -.45}));
    });

    // ADD IMAGES

    // SIDE 0

    // SIDE 1
    sides[1].add(getProjectPicture(chess, "https://cs240.noahpratt.com"));

    // SIDE 2
    sides[2].add(getProjectPicture(fms, "https://fms.noahpratt.com"));

    // SIDE 3
    sides[3].add(getProjectPicture(mm, "https://musicmetrics.app"));

    // SIDE 4
    sides[4].add(getProjectPicture(ghp, "https://goathousepizza.com"));
}

function populateGammaSides(sides) {

}

function populateDeltaSides(sides) {

}

function getText(text, font, options) {
    if (options === undefined) options = {};
    const geometry = new TextGeometry(text, {
        font: font,
        size: options.size || .05,
        height: options.thickness || .005,
    });
    const words = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({color: 0x333333, side: THREE.DoubleSide}));
    words.position.set(centerTextX(geometry), (options.yPos || 0), 0);
    return words;
}

function getProjectPicture(res, url) {
    const geometry = new THREE.BoxGeometry(1, .6, .05);
    const materials = [
        new THREE.MeshBasicMaterial({color: 0xaaaaaa}),
        new THREE.MeshBasicMaterial({color: 0xaaaaaa}),
        new THREE.MeshBasicMaterial({color: 0xaaaaaa}),
        new THREE.MeshBasicMaterial({color: 0xaaaaaa}),
        new THREE.MeshBasicMaterial({color: 0xcccccc, map: textureLoader.load(res)}),
        new THREE.MeshBasicMaterial({color: 0xaaaaaa})
    ];
    const materials2 = [
        new THREE.MeshBasicMaterial({color: 0xeeeeee}),
        new THREE.MeshBasicMaterial({color: 0xeeeeee}),
        new THREE.MeshBasicMaterial({color: 0xeeeeee}),
        new THREE.MeshBasicMaterial({color: 0xeeeeee}),
        new THREE.MeshBasicMaterial({color: 0xffffff, map: textureLoader.load(res)}),
        new THREE.MeshBasicMaterial({color: 0xeeeeee})
    ];
    const mesh = new THREE.Mesh(geometry, materials);
    mesh.position.y = .15;
    clickables.push([mesh, materials, materials2, () => window.open(url)]);
    return mesh;
}

function getPicture(x, y, z, res) {
    const geometry = new THREE.BoxGeometry(x, y, z);
    const materials = [
        new THREE.MeshBasicMaterial({color: 0xaaaaaa}),
        new THREE.MeshBasicMaterial({color: 0xaaaaaa}),
        new THREE.MeshBasicMaterial({color: 0xaaaaaa}),
        new THREE.MeshBasicMaterial({color: 0xaaaaaa}),
        new THREE.MeshBasicMaterial({color: 0xffffff, map: textureLoader.load(res)}),
        new THREE.MeshBasicMaterial({color: 0xaaaaaa})
    ];
    return new THREE.Mesh(geometry, materials);
}

function getBillboard(text, font) {

    const FONT_SIZE = .08;
    const HORIZ_PADDING = .1;
    const VERT_PADDING = .1;
    const HEIGHT = FONT_SIZE + VERT_PADDING;

    const geometry = new TextGeometry(text, {
        font: font,
        size: FONT_SIZE,
        height: .01,
    });
    const textWidth = centerTextX(geometry) * -2;

    // Create base
    const boardGeo = new THREE.BoxGeometry(textWidth + HORIZ_PADDING, HEIGHT, .01);
    const boardMats = [
        new THREE.MeshStandardMaterial({color: 0x998250}),
        new THREE.MeshStandardMaterial({color: 0x998250}),
        new THREE.MeshStandardMaterial({color: 0x998250}),
        new THREE.MeshStandardMaterial({color: 0x998250}),
        new THREE.MeshStandardMaterial({color: 0xaa9960, map: textureLoader.load(wood)}),
        new THREE.MeshStandardMaterial({color: 0xffffff, map: textureLoader.load(wood)}),
    ];
    const board = new THREE.Mesh(boardGeo, boardMats);

    // Add text
    const textMesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({color: 0xdddddd}));
    textMesh.position.set(textWidth / -2, FONT_SIZE / -2, 0);
    board.add(textMesh);

    // Add posts
    const postGeo = new THREE.BoxGeometry(.02, .3, .02);
    const postMat = new THREE.MeshStandardMaterial({color: 0x553333});
    const post1 = new THREE.Mesh(postGeo, postMat);
    const post2 = new THREE.Mesh(postGeo, postMat);
    post1.position.set(textWidth / -2, -.04, -.01);
    post2.position.set(textWidth / 2, -.04, -.01);
    board.add(post1);
    board.add(post2);

    board.position.set(0, .61, -.05);

    return board;
}

function getSocialMedia(text, url, font) {

    const FONT_SIZE = .08;
    const HORIZ_PADDING = .1;
    const VERT_PADDING = .1;
    const HEIGHT = FONT_SIZE + VERT_PADDING;

    const geometry = new TextGeometry(text, {
        font: font,
        size: FONT_SIZE,
        height: .01,
    });
    const textWidth = centerTextX(geometry) * -2;

    const boxGeo = new THREE.BoxGeometry(textWidth + HORIZ_PADDING, HEIGHT, .01);
    const boxMat1 = new THREE.MeshStandardMaterial({color: 0xdddddd});
    const boxMat2 = new THREE.MeshStandardMaterial({color: 0xffffff});
    const box = new THREE.Mesh(boxGeo, boxMat1);

    const words = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({color: 0x333333, side: THREE.DoubleSide}));
    words.position.set(textWidth / -2, FONT_SIZE / -2, 0);

    box.add(words);
    clickables.push([box, boxMat1, boxMat2, () => window.open(url)]);
    return box;
}

function getArrow({width = 0.5, height = 1, headHeightRatio = 0.5, depth = 0.2, rotationX = 0, onClick = () => {}}) {

    const headHeight = height * headHeightRatio;
    const shaftHeight = height - headHeight;
    const halfWidth = width / 2;

    const shape = new THREE.Shape();
    shape.moveTo(-halfWidth / 2, 0);
    shape.lineTo(halfWidth / 2, 0);
    shape.lineTo(halfWidth / 2, shaftHeight);
    shape.lineTo(halfWidth, shaftHeight);
    shape.lineTo(0, height);
    shape.lineTo(-halfWidth, shaftHeight);
    shape.lineTo(-halfWidth / 2, shaftHeight);
    shape.closePath();

    const extrudeSettings = {
        depth,
        bevelEnabled: false
    };
    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    const material = new THREE.MeshStandardMaterial({color: 0x999999});
    const material2 = new THREE.MeshStandardMaterial({color: 0x3de2ff});
    const mesh = new THREE.Mesh(geometry, material);

    geometry.center();
    mesh.rotateX(rotationX);
    mesh.rotateY(Math.PI / 2);
    
    clickables.push([mesh, material, material2, onClick]);

    return mesh;
}

function centerTextX(geometry) {
    geometry.computeBoundingBox();
    const textWidth = geometry.boundingBox.max.x - geometry.boundingBox.min.x;
    return textWidth / -2;
}

function polarToCartesian(radius, theta) {
    const x = radius * Math.cos(theta);
    const y = radius * Math.sin(theta);
    return [x, y];
}
