import * as THREE from 'three';
import {TextGeometry} from 'three/examples/jsm/geometries/TextGeometry';
import {FontLoader} from 'three/addons/loaders/FontLoader.js';

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
import pfeifferhorn from './assets/pfeifferhorn.jpg';
import voxbox from './assets/voxbox.png';
import pilot from './assets/pilot.jpg';
import whitney from './assets/whitney.png';
import bird from './assets/bird.png';
import ragnar from './assets/ragnar.png';
import campout from './assets/campout.png';

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
});

// SET UP LIGHTS
const dLight = new THREE.DirectionalLight();
dLight.position.set(-8, 10, 2);
const aLight = new THREE.AmbientLight(0x565656);

// CREATE SCENE
const scene = new THREE.Scene();
scene.add(dLight);
scene.add(aLight);

// CREATE GLOBAL VARIABLES
let loadedFont = null;
let clickedObject = null;
const clickables = [];
const gap = 7; // space between polyhedrons on the z-axis
const alphaLabel = 'Work Experience / Education';
const betaLabel = 'Personal Coding Projects';
const gammaLabel = 'Skills / About Me';
const deltaLabel = 'Random Pics';

// SET UP LOADERS
const loadingManager = new THREE.LoadingManager();
const fontLoader = new FontLoader(loadingManager);
const textureLoader = new THREE.TextureLoader(loadingManager);
function loadFont() {
    return new Promise((resolve, reject) => {
        if (loadedFont) return resolve(loadedFont);
        fontLoader.load('fonts/noto-sans-regular.json', (font) => {
            loadedFont = font;
            resolve(font);
        }, undefined, (err) => reject(err));
    });
}

// CREATE POLYHEDRONS
const polyhedronAlpha = await getCustomXagonalPrism(1.2, 5, (sides) => populateAlphaSides(sides));
polyhedronAlpha.rotateY(Math.PI / 2);
const polyhedronBeta = await getCustomXagonalPrism(1.2, 6, (sides) => populateBetaSides(sides));
const polyhedronGamma = await getCustomXagonalPrism(1.2, 5, (sides) => populateGammaSides(sides));
const polyhedronDelta = await getCustomXagonalPrism(1.2, 5, (sides) => populateDeltaSides(sides));
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

// CREATE NAVIGATION ARROWS AND TEXT
const leftArrow = getArrow({height: .15, width: .1, depth: .02, rotationX: Math.PI / -2, onClick: () => leftArrowClick()});
const rightArrow = getArrow({height: .15, width: .1, depth: .02, rotationX: Math.PI / 2, onClick: () => rightArrowClick()});
const prevText = await getArrowText('Previous:', 1.1, -1.1, {color: 0xdddddd, size: .05});
const nextText = await getArrowText('Next:', 1.1, 1.1, {color: 0xdddddd, size: .05});
const leftNavText = await getArrowText(deltaLabel, 1, -1.1, {color: 0xdddddd, size: .03, height: .002});
const rightNavText = await getArrowText(betaLabel, 1, 1.1, {color: 0xdddddd, size: .03, height: .002});
if (isPortrait) {

} else {
    leftArrow.position.set(-1.1, 1.2, -1.1);
    rightArrow.position.set(-1.1, 1.2, 1.1);
}

function leftArrowClick() {
    if (centeredPolyhedron === polyhedronAlpha) {
        // center delta
        updateNavText(leftNavText, gammaLabel);
        updateNavText(rightNavText, alphaLabel);
        centeredPolyhedron = polyhedronDelta;
        moveZ(polyhedronAlpha, gap);
        moveZ(polyhedronBeta, 2 * gap);
        moveZ(polyhedronGamma, -gap, true);
        moveZ(polyhedronDelta, 0);
    } else if (centeredPolyhedron === polyhedronBeta) {
        // center alpha
        updateNavText(leftNavText, deltaLabel);
        updateNavText(rightNavText, betaLabel);
        centeredPolyhedron = polyhedronAlpha;
        moveZ(polyhedronAlpha, 0);
        moveZ(polyhedronBeta, gap);
        moveZ(polyhedronGamma, 2 * gap);
        moveZ(polyhedronDelta, -gap, true);
    } else if (centeredPolyhedron === polyhedronGamma) {
        // center beta
        updateNavText(leftNavText, alphaLabel);
        updateNavText(rightNavText, gammaLabel);
        centeredPolyhedron = polyhedronBeta;
        moveZ(polyhedronAlpha, -gap, true);
        moveZ(polyhedronBeta, 0);
        moveZ(polyhedronGamma, gap);
        moveZ(polyhedronDelta, 2 * gap);
    } else if (centeredPolyhedron === polyhedronDelta) {
        // center gamma
        updateNavText(leftNavText, betaLabel);
        updateNavText(rightNavText, deltaLabel);
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
        updateNavText(leftNavText, alphaLabel);
        updateNavText(rightNavText, gammaLabel);
        centeredPolyhedron = polyhedronBeta;
        moveZ(polyhedronAlpha, -gap);
        moveZ(polyhedronBeta, 0);
        moveZ(polyhedronGamma, gap);
        moveZ(polyhedronDelta, 2 * gap, true);
    } else if (centeredPolyhedron === polyhedronBeta) {
        // center gamma
        updateNavText(leftNavText, betaLabel);
        updateNavText(rightNavText, deltaLabel);
        centeredPolyhedron = polyhedronGamma;
        moveZ(polyhedronAlpha, 2 * gap, true);
        moveZ(polyhedronBeta, -gap);
        moveZ(polyhedronGamma, 0);
        moveZ(polyhedronDelta, gap);
    } else if (centeredPolyhedron === polyhedronGamma) {
        // center delta
        updateNavText(leftNavText, gammaLabel);
        updateNavText(rightNavText, alphaLabel);
        centeredPolyhedron = polyhedronDelta;
        moveZ(polyhedronAlpha, gap);
        moveZ(polyhedronBeta, 2 * gap, true);
        moveZ(polyhedronGamma, -gap);
        moveZ(polyhedronDelta, 0);
    } else if (centeredPolyhedron === polyhedronDelta) {
        // center alpha
        updateNavText(leftNavText, deltaLabel);
        updateNavText(rightNavText, betaLabel);
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

// CREATE LOADING BEHAVIOR / ADD OBJECTS TO SCENE
loadingManager.onLoad = function() {
    const loadingHTML = document.getElementById('loading');
    if (loadingHTML !== undefined && loadingHTML !== null) document.body.removeChild(loadingHTML);
    scene.add(polyhedronAlpha);
    scene.add(polyhedronBeta);
    scene.add(polyhedronGamma);
    scene.add(polyhedronDelta);
    scene.add(leftArrow);
    scene.add(rightArrow);
    scene.add(prevText);
    scene.add(nextText);
    scene.add(leftNavText);
    scene.add(rightNavText);
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
async function getCustomXagonalPrism(radius, numSides, populateSides) {

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
    await populateSides(sides);

    // Position the x-gons
    bottom.position.set(0, (-prismHeight / 2), 0);
    top.position.set(0, (prismHeight / 2), 0);
    bottom.rotation.x = Math.PI / 2;
    top.rotation.x = Math.PI / -2;

    // Position the rectangles
    for (let i = 0; i < numSides; i ++) {
        const pos = polarToCartesian(SMALL_R, (((2 * i) - 1) * Math.PI) / numSides);
        sides[sides.length - 1 - i].position.set(pos[0], 0, pos[1]);
        sides[sides.length - 1 - i].rotation.y = ((numSides + 2) - (4 * i)) * Math.PI / (numSides * 2);
    }

    const group = new THREE.Group;
    group.add(bottom);
    group.add(top);
    for (let i = 0; i < numSides; i ++) group.add(sides[i]);

    return group;
}

async function populateAlphaSides(sides) {

    // SIDE 0: Welcome (first visible on initial page load)
    sides[0].add(await getBillboard('Welcome'));
    sides[0].add(await getText('Thanks for visiting my portfolio!', {yPos: .4, size: .058}));
    sides[0].add(await getText('Click the on-screen arrows and spin the', {yPos: .32}));
    sides[0].add(await getText('prisms to explore my work experience,', {yPos: .24}));
    sides[0].add(await getText('projects, and other skills and hobbies.', {yPos: .16}));
    const pfeifferhornPic = getPicture(1, .55, .02, pfeifferhorn);
    pfeifferhornPic.position.y = -.16;
    sides[0].add(pfeifferhornPic);

    // SIDE 1: Education
    sides[1].add(await getBillboard('Education'));
    sides[1].add(await getText('2020 - 2024', {yPos: -.15}));
    sides[1].add(await getText('BS in Computer Science (3.93 GPA)', {yPos: -.25}));
    sides[1].add(await getText('Emphasis: Software Engineering', {yPos: -.35}));
    sides[1].add(await getText('Minor in Physics', {yPos: -.45}));
    const byuPic = getPicture(1, .5, .02, byu);
    byuPic.position.y = .2;
    sides[1].add(byuPic);

    // SIDE 2: DHI
    sides[2].add(await getBillboard('Work Experience 1'));
    sides[2].add(await getText('DHI Computing Service, Inc.', {yPos: .39, size: .065}));
    sides[2].add(await getText('Full Stack Developer | June 2024 - Present', {yPos: .3, size: .045}));
    sides[2].add(getHorizontalLine(1.2, {yPos: .25}));
    sides[2].add(await getText('• Developed a variety of products for employees and', {yPos: .16, size: .039}));
    sides[2].add(await getText('end-users of banks and credit unions nationwide', {yPos: .09, size: .039}));
    sides[2].add(await getText('• Took lead on a large project to integrate our new', {yPos: 0, size: .039}));
    sides[2].add(await getText('new mobile app with our existing core functionality', {yPos: -.07, size: .039}));
    sides[2].add(await getText('• Leveraged tools and frameworks, like C#, .NET,', {yPos: -.16, size: .039}));
    sides[2].add(await getText('and Azure DevOps, to create meaningful products', {yPos: -.23, size: .039}));
    sides[2].add(await getText('• Worked in an environment with experienced devs', {yPos: -.32, size: .039}));
    sides[2].add(await getText('to meet deadlines from management and clients', {yPos: -.39, size: .039}));

    // SIDE 3: TA
    sides[3].add(await getBillboard('Work Experience 2'));
    sides[3].add(await getText('BYU Computer Science Department', {yPos: .39, size: .055}));
    sides[3].add(await getText('Teaching Assistant | August 2022 - June 2024', {yPos: .3, size: .045}));
    sides[3].add(getHorizontalLine(1.2, {yPos: .25}));
    sides[3].add(await getText('• Guided students in mastering object-oriented', {yPos: .16, size: .039}));
    sides[3].add(await getText('programming, offering debugging techniques', {yPos: .09, size: .039}));
    sides[3].add(await getText('and real-world best practices in coding', {yPos: .02, size: .039}));
    sides[3].add(await getText('• Taught essential server-client concepts, including', {yPos: -.07, size: .039}));
    sides[3].add(await getText('WebSocket functions and network communication', {yPos: -.14, size: .039}));
    sides[3].add(await getText('• Fostered collaborative problem-solving, enhancing', {yPos: -.23, size: .039}));
    sides[3].add(await getText('students\' software engineering skills and my own', {yPos: -.3, size: .039}));

    // SIDE 4: Course Material Developer
    sides[4].add(await getBillboard('Work Experience 3'));
    sides[4].add(await getText('BYU Computer Science Department', {yPos: .39, size: .055}));
    sides[4].add(await getText('Course Material Developer | May 2023 - June 2024', {yPos: .3, size: .04}));
    sides[4].add(getHorizontalLine(1.2, {yPos: .25}));
    sides[4].add(await getText('• Collaborated with professors to design and', {yPos: .16, size: .039}));
    sides[4].add(await getText('implement new curriculum for a software course', {yPos: .09, size: .039}));
    sides[4].add(await getText('• Worked with other TAs to develop automated', {yPos: 0, size: .039}));
    sides[4].add(await getText('grading software that reduced labor costs', {yPos: -.07, size: .039}));
    sides[4].add(await getText('by about 200 hours, or ~$3,600, per semester', {yPos: -.14, size: .039}));
    sides[4].add(await getText('• Leveraged version control systems beyond basic', {yPos: -.23, size: .039}));
    sides[4].add(await getText('functions in the project\'s development process,', {yPos: -.3, size: .039}));
    sides[4].add(await getText('ensuring efficient code collaboration and tracking', {yPos: -.37, size: .039}));
}

async function populateBetaSides(sides) {

    // SIDE 0: Music Metrics
    sides[0].add(await getBillboard('Music Metrics'));
    sides[0].add(await getText('Software that tracks, analyzes, and reports', {yPos: .42, size: .04}));
    sides[0].add(await getText('statistics from your Spotify listening habits.', {yPos: .34, size: .04}));
    sides[0].add(await getText('Server written in Go with MySQL, client', {yPos: .26, size: .04}));
    sides[0].add(await getText('utilizes React and good UI/UX principles.', {yPos: .18, size: .04}));
    sides[0].add(await getText('Click below to visit site:', {yPos: .1, size: .04}));
    sides[0].add(getProjectPicture(.85, .55, mm, "https://musicmetrics.app", {yPos: -.2}));

    // SIDE 1: GoatHouse Pizza
    sides[1].add(await getBillboard('GoatHouse Pizza'));
    sides[1].add(await getText('One of my first projects, this website was', {yPos: .42, size: .04}));
    sides[1].add(await getText('written in vanilla HTML and JS to serve the', {yPos: .34, size: .04}));
    sides[1].add(await getText('online ordering and marketing needs of a', {yPos: .26, size: .04}));
    sides[1].add(await getText('pizza business founded by myself 3 friends.', {yPos: .18, size: .04}));
    sides[1].add(await getText('Click below to visit site:', {yPos: .1, size: .04}));
    sides[1].add(getProjectPicture(.85, .55, ghp, "https://goathousepizza.com", {yPos: -.2}));

    // SIDE 2: Vox Box
    sides[2].add(await getBillboard('Vox Box'));
    sides[2].add(await getText('AI written in Python (using PyTorch) that', {yPos: .42, size: .04}));
    sides[2].add(await getText('is trained to produce vocal samples of my', {yPos: .34, size: .04}));
    sides[2].add(await getText('voice, and can be adapted to use anyone\'s', {yPos: .26, size: .04}));
    sides[2].add(await getText('voice. No UI/website exists, just a command', {yPos: .18, size: .04}));
    sides[2].add(await getText('line tool for now. But here\'s the repo:', {yPos: .1, size: .04}));
    sides[2].add(getProjectPicture(.85, .55, voxbox, "https://github.com/prattnj/vox-box", {yPos: -.2}));

    // SIDE 3: Nebula
    sides[3].add(await getBillboard('Nebula'));
    sides[3].add(await getText('With a team of software engineering', {yPos: .42, size: .04}));
    sides[3].add(await getText('capstone students, wrote the MVP for a', {yPos: .34, size: .04}));
    sides[3].add(await getText('new business whose goal is to revolutionize', {yPos: .26, size: .04}));
    sides[3].add(await getText('the housing industry with a new product', {yPos: .18, size: .04}));
    sides[3].add(await getText('that seeks to eliminate the pains that are', {yPos: .1, size: .04}));
    sides[3].add(await getText('all too common with existing housing apps.', {yPos: .02, size: .04}));
    sides[3].add(await getText('The PWA, utilizing React and Tailwind CSS,', {yPos: -.06, size: .04}));
    sides[3].add(await getText('is proprietary and therefore private, but', {yPos: -.14, size: .04}));
    sides[3].add(await getText('taught me useful skills, including new', {yPos: -.22, size: .04}));
    sides[3].add(await getText('DevOps and testing techniques.', {yPos: -.3, size: .04}));
    sides[3].add(getHorizontalLine(1, {yPos: -.4}));

    // SIDE 4: BYU Projects
    sides[4].add(await getBillboard('BYU Projects'));
    sides[4].add(await getText('An Android app, supported by a Java', {yPos: .42, size: .039}));
    sides[4].add(await getText('backend, that lets users create and explore', {yPos: .35, size: .039}));
    sides[4].add(await getText('artificial family history generation.', {yPos: .28, size: .039}));
    sides[4].add(await getTextButton('Click here to visit repo', () => window.open(), {fontSize: .02, yPos: .23, paddingX: .1, paddingY: .02}));
    sides[4].add(getHorizontalLine(1, {yPos: .18}));
    sides[4].add(await getText('A chess server that allows multiple', {yPos: .11, size: .039}));
    sides[4].add(await getText('players, spectators, and games. WebSocket', {yPos: .04, size: .039}));
    sides[4].add(await getText('notifications are utilized.', {yPos: -.03, size: .039}));
    sides[4].add(await getTextButton('Click here to visit repo', () => window.open('https://github.com/prattnj/chess2024'), {fontSize: .02, yPos: -.08, paddingX: .1, paddingY: .02}));
    sides[4].add(getHorizontalLine(1, {yPos: -.13}));
    sides[4].add(await getText('An Android app that mimics Twitter, using', {yPos: -.2, size: .039}));
    sides[4].add(await getText('AWS DynamoDB, EC2, Lambdas, and queues', {yPos: -.27, size: .039}));
    sides[4].add(await getText('to achieve core social media functionality.', {yPos: -.34, size: .039}));
    sides[4].add(await getTextButton('Click here to visit repo', () => window.open('https://github.com/prattnj/tweeter'), {fontSize: .02, yPos: -.41, paddingX: .1, paddingY: .02}));

    // SIDE 5: Other Projects
    sides[5].add(await getBillboard('Other Projects'));
    sides[5].add(await getText('Fact Fiesta, an API that delivers fun facts', {yPos: .42, size: .04}));
    sides[5].add(await getText('on a variety of topics to the caller.', {yPos: .34, size: .04}));
    sides[5].add(await getTextButton('Click here to print a fun fact to the console!', printFactFiesta, {fontSize: .035, yPos: .28, paddingX: .1, paddingY: .04, color2: 0x23ff67}));
    sides[5].add(getHorizontalLine(1, {yPos: .21}));
    sides[5].add(await getText('A variety of small games and fun things,', {yPos: .14, size: .04}));
    sides[5].add(await getText('including Worlde, 24 (look it up), a', {yPos: .06, size: .04}));
    sides[5].add(await getText('YouTube / mp3 converter, and replicas', {yPos: -.02, size: .04}));
    sides[5].add(await getText('of old projects but in different languages.', {yPos: -.1, size: .04}));
    sides[5].add(getHorizontalLine(1, {yPos: -.15}));
    sides[5].add(await getText('A CLI app that delivers stats from Garmin.', {yPos: -.22, size: .04}));
    sides[5].add(await getText('For example, what was my average bedtime', {yPos: -.3, size: .04}));
    sides[5].add(await getText('this week? In which month did I take the', {yPos: -.38, size: .04}));
    sides[5].add(await getText('most steps? What\'s my all-time high HR?', {yPos: -.46, size: .04}));
}

async function populateGammaSides(sides) {

    // SIDE 0: Socials / Contact
    sides[0].add(await getBillboard('Socials / Contact'));
    const logoPic = getPicture(1.1, .2, .03, logos);
    logoPic.position.y = .35;
    sides[0].add(logoPic);
    const linkedin = await getTextButton('LinkedIn', 'https://linkedin.com/in/noahjpratt');
    linkedin.position.set(-.25, .1, 0);
    sides[0].add(linkedin);
    const github = await getTextButton('GitHub', 'https://github.com/prattnj');
    github.position.set(.3, .1, 0);
    sides[0].add(github);
    const gmail = await getTextButton('Gmail', 'mailto:prattnj@gmail.com');
    gmail.position.set(-.35, -.125, 0);
    sides[0].add(gmail);
    const instagram = await getTextButton('Instagram', 'https://instagram.com/_noahpratt00');
    instagram.position.set(.225, -.125, 0);
    sides[0].add(instagram);
    const facebook = await getTextButton('Facebook', 'https://facebook.com/noah.pratt.18400/');
    facebook.position.set(-.25, -.35, 0);
    sides[0].add(facebook);
    const strava = await getTextButton('Strava', 'https://strava.com/athletes/121620992');
    strava.position.set(.32, -.35, 0);
    sides[0].add(strava);

    // SIDE 1: Portrait
    sides[1].add(await getBillboard('Portrait'));
    sides[1].add(getPicture(.6, .6, .02, me));
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
    sides[1].add(usaFlag, azFlag, utFlag, waFlag);

    // SIDE 2: About Me
    sides[2].add(await getBillboard('About Me'));
    sides[2].add(await getText('Born and raised in the Valley of the Sun, I\'m a', {yPos: .43, size: .04}));
    sides[2].add(await getText('full stack software developer who thrives on', {yPos: .35, size: .04}));
    sides[2].add(await getText('efficient solutions and clean code. Away from the', {yPos: .27, size: .04}));
    sides[2].add(await getText('screen, I channel the same determination into', {yPos: .19, size: .04}));
    sides[2].add(await getText('conquering the great outdoors of the Western USA.', {yPos: .11, size: .04}));
    const lakePic = getPicture(1.15, .55, .01, lake);
    lakePic.position.y = -.19;
    sides[2].add(lakePic);

    // SIDE 3: Skills / Proficiencies
    sides[3].add(await getBillboard('Skills / Proficiencies'));
    sides[3].add(await getText('Programming Languages', {yPos: .42, size: .05}));
    sides[3].add(await getText('(in order of comfort)', {yPos: .35, size: .035}));
    sides[3].add(await getText('Java | C# | JavaScript | Go | Python | C | C++ | Ruby', {yPos: .28, size: .035}));
    sides[3].add(getHorizontalLine(1.2, {yPos: .23}));
    sides[3].add(await getText('Frontend Tools and Frameworks', {yPos: .15, size: .05}));
    sides[3].add(await getText('React | Vue | Knockout | Tailwind CSS | Material UI', {yPos: .07, size: .035}));
    sides[3].add(await getText('3JS (you\'re looking at it) | Node.js | .NET | Next.js', {yPos: .01, size: .035}));
    sides[3].add(getHorizontalLine(1.2, {yPos: -.04}));
    sides[3].add(await getText('Cloud Services / Computing', {yPos: -.12, size: .05}));
    sides[3].add(await getText('Azure | GitHub | AWS (Lambda, EC2, SQS) | Google', {yPos: -.2, size: .035}));
    sides[3].add(getHorizontalLine(1.2, {yPos: -.25}));
    sides[3].add(await getText('Databases', {yPos: -.33, size: .05}));
    sides[3].add(await getText('MySQL | EntityFramework | DynamoDB | Supabase', {yPos: -.41, size: .035}));

    // SIDE 4: Skills / Proficiencies 2
    sides[4].add(await getBillboard('Skills cont\'d.'));
    sides[4].add(await getText('Mobile Development', {yPos: .42, size: .05}));
    sides[4].add(await getText('Android Studio | Kotlin | Flutter | PWAs', {yPos: .34, size: .035}));
    sides[4].add(getHorizontalLine(1.2, {yPos: .29}));
    sides[4].add(await getText('Miscellaneous Tools / Frameworks', {yPos: .21, size: .05}));
    sides[4].add(await getText('PyTorch | Deep Learning | Self-hosting | Linux', {yPos: .13, size: .035}));
    sides[4].add(getHorizontalLine(1.2, {yPos: .08}));
    sides[4].add(await getText('Less Relevant', {yPos: 0, size: .05}));
    sides[4].add(await getText('3D Design | CAD Software | Sound Design | DAW', {yPos: -.08, size: .035}));
    sides[4].add(await getText('Arduino | Computer / Electrical Engineering', {yPos: -.14, size: .035}));
    sides[4].add(getHorizontalLine(1.2, {yPos: -.19}));
    sides[4].add(await getText('Even Less Relevant (Hobbies)', {yPos: -.27, size: .05}));
    sides[4].add(await getText('Mountain Biking | Hiking | Backpacking | Snowboarding', {yPos: -.35, size: .035}));
    sides[4].add(await getText('Piano | Guitar | Cars | Sports | Event Hosting', {yPos: -.41, size: .035}));
}

async function populateDeltaSides(sides) {

    // SIDE 0
    const pilotPic = getPicture(1.3, .8, .01, pilot);
    pilotPic.position.y = .06;
    sides[0].add(pilotPic);
    sides[0].add(await getText('Aspiring Aviator', {yPos: -.44, size: .04}));

    // SIDE 1
    const whitneyPic = getPicture(1.3, .7, .01, whitney);
    whitneyPic.position.y = .06;
    sides[1].add(whitneyPic);
    sides[1].add(await getText('Highest Point in Lower 48', {yPos: -.44, size: .04}));

    // SIDE 2
    const birdPic = getPicture(1.3, .65, .01, bird);
    birdPic.position.y = .06;
    sides[2].add(birdPic);
    sides[2].add(await getText('Friend of Nature', {yPos: -.44, size: .04}));

    // SIDE 3
    const ragnarPic = getPicture(1.3, .75, .01, ragnar);
    ragnarPic.position.y = .06;
    sides[3].add(ragnarPic);
    sides[3].add(await getText('"200ish Miles" in San Diego', {yPos: -.44, size: .04}));

    // SIDE 4
    const campoutPic = getPicture(1.3, .8, .01, campout);
    campoutPic.position.y = .06;
    sides[4].add(campoutPic);
    sides[4].add(await getText('One of My Infamous Campouts', {yPos: -.44, size: .04}));
}

async function getText(text, options = {}) {
    const font = await loadFont();
    const geometry = new TextGeometry(text, {
        font: font,
        size: options.size || .05,
        height: options.height || .005,
    });
    if (options.center) geometry.center();
    const words = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({color: options.color || 0x333333, side: THREE.DoubleSide}));
    words.position.set((options.xPos || centerTextX(geometry)), (options.yPos || 0), (options.zPos || 0));
    return words;
}

async function getArrowText(baseText, yPos, zPos, options = {}) {
    const text = await getText(baseText, {color: options.color || 0x999999, size: options.size, height: options.height, center: true});
    text.position.set(-1.1, yPos, zPos);
    text.rotateY(-Math.PI / 2);
    return text;   
}

function updateNavText(mesh, newText) {
    const defaultOptions = {
        font: loadedFont,
        size: .03,
        height: 0.002,
    };
    if (mesh.geometry) mesh.geometry.dispose();
    const newGeometry = new TextGeometry(newText, defaultOptions);
    newGeometry.center();
    mesh.geometry = newGeometry;
}

function getProjectPicture(x, y, res, url, options = {}) {
    const geometry = new THREE.BoxGeometry(x, y, options.z || .03);
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
    mesh.position.y = options.yPos || .15;
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

async function getBillboard(text) {
    const font = await loadFont();

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

async function getTextButton(text, callback, options = {}) {
    const font = await loadFont();

    const FONT_SIZE = options.fontSize || .08;
    const HORIZ_PADDING = options.paddingX || .1;
    const VERT_PADDING = options.paddingY || .1;
    const HEIGHT = FONT_SIZE + VERT_PADDING;

    const geometry = new TextGeometry(text, {
        font: font,
        size: FONT_SIZE,
        height: .01,
    });
    const textWidth = centerTextX(geometry) * -2;

    const boxGeo = new THREE.BoxGeometry(textWidth + HORIZ_PADDING, HEIGHT, .01);
    const boxMat1 = new THREE.MeshStandardMaterial({color: options.color1 || 0xdddddd});
    const boxMat2 = new THREE.MeshStandardMaterial({color: options.color2 || 0xffffff});
    const box = new THREE.Mesh(boxGeo, boxMat1);

    const words = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({color: 0x333333, side: THREE.DoubleSide}));
    words.position.set(textWidth / -2, FONT_SIZE / -2, 0);

    box.add(words);
    box.position.y = options.yPos || 0;
    clickables.push([box, boxMat1, boxMat2, callback]);
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
    const material = new THREE.MeshStandardMaterial({color: 0xdddddd});
    const material2 = new THREE.MeshStandardMaterial({color: 0x3de2ff});
    const mesh = new THREE.Mesh(geometry, material);

    geometry.center();
    mesh.rotateX(rotationX);
    mesh.rotateY(Math.PI / 2);
    
    clickables.push([mesh, material, material2, onClick]);

    return mesh;
}

function getHorizontalLine(length, options = {}) {
    const geometry = new THREE.BoxGeometry(length, .005, .005);
    const material = new THREE.MeshStandardMaterial({color: options.color || 0x333333});
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.y = options.yPos || 0;
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

function printFactFiesta() {
    fetch('https://factfiesta.noahpratt.com').then(response => {
        if (!response.ok) throw new Error();
        return response.text();
    })
    .then(data => {
        console.log('%cFun fact returned from my API:\n\n%s', 'color: #32ffce', data);
    })
    .catch(error => {
        console.log('%cJust kidding, the fun fact API is down right now :(', 'color: #fd4133')
    });
}