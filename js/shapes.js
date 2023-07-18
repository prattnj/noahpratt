import * as THREE from "three";
import {polarToCartesian} from "./util";
import {FontLoader} from "three/examples/jsm/loaders/FontLoader";
import {TextGeometry} from "three/examples/jsm/geometries/TextGeometry";
import fourpeaks from '../assets/4peaks.jpg'
import mm from '../assets/mm.png'
import ghp from '../assets/ghp.png'

export const clickables = []
const fontLoader = new FontLoader()
const textureLoader = new THREE.TextureLoader()
const prismHeight = 1

export function getCustomPentagonalPrism(radius, instance) {
    if (instance !== 'l' && instance !== 'm' && instance !== 'r') return

    const SMALL_R = radius * Math.cos(Math.PI / 5)
    const SIDE = 2 * radius * Math.sin(Math.PI / 5)

    // Create 2 pentagons
    const bottom = new THREE.Mesh(new THREE.CircleGeometry(radius, 5), new THREE.MeshStandardMaterial({color: 0x3de2ff, side: THREE.DoubleSide}))
    const top = new THREE.Mesh(new THREE.CircleGeometry(radius, 5), new THREE.MeshStandardMaterial({color: 0x3de2ff, side: THREE.DoubleSide}))

    // Add titles to top pentagon
    if (instance === 'l' || instance === 'r') {
        const loader = new FontLoader();
        loader.load('fonts/noto-sans-regular.json', function (font) {

            const message = instance === 'l' ? "PROJECTS" : "SOCIAL"
            const geometry = new TextGeometry( message, {
                font: font,
                size: .22,
                height: .01,
            } );
            geometry.computeBoundingBox()
            const textWidth = geometry.boundingBox.max.x - geometry.boundingBox.min.x

            const text = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({color: 0x000000, side: THREE.DoubleSide}))

            text.position.set(-.05, textWidth / 2, 0)
            text.rotation.z += Math.PI / -2

            top.add(text)
        } );
    }

    // Create 5 rectangles
    const sides = []
    for (let i = 0; i < 5; i ++) {
        const side = new THREE.Mesh(new THREE.PlaneGeometry(SIDE, prismHeight), new THREE.MeshStandardMaterial({color: 0x3de2ff, side: THREE.DoubleSide}))
        sides.push(side)
    }
    if (instance === 'l') getLeftSides(sides);
    else if (instance === 'm') getMiddleSides(sides);
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
        sides[0].add(getTopText('Family Map', font))

        // SIDE 1
        sides[1].add(getTopText('GoatHouse Pizza', font))
        sides[1].add(getBottomText('Online hub for my pizza company', font))

        // SIDE 2
        sides[2].add(getTopText('Music Metrics', font))
        sides[2].add(getBottomText('Full stack music statistics software', font))

        // SIDE 3
        sides[3].add(getTopText('Chess', font))

        // SIDE 4
        sides[4].add(getTopText('<add project>', font))
    });

    // ADD IMAGES
    sides[1].add(getPictureFrame(1, .6, ghp, "https://goathousepizza.com"))
    sides[2].add(getPictureFrame(1, .6, mm, "https://musicmetrics.app"))
}

function getMiddleSides(sides) {

    // ADD ALL TEXT
    fontLoader.load('fonts/noto-sans-regular.json', function (font) {
        // SIDE 0
        sides[0].add(getTopText('Work Experience', font))

        // SIDE 1
        sides[1].add(getTopText('Education', font))

        // SIDE 2
        sides[2].add(getTopText('Pic of me', font))

        // SIDE 3
        sides[3].add(getTopText('Welcome', font))

        // SIDE 4
        sides[4].add(getTopText('Hobbies', font))
    });

    // ADD IMAGES
    sides[3].add(getPictureFrame(1, .5, fourpeaks, null))
}

function getRightSides(sides) {

    // ADD ALL TEXT
    fontLoader.load('fonts/noto-sans-regular.json', function (font) {
        // SIDE 0
        sides[0].add(getTopText('Spotify', font))

        // SIDE 1
        sides[1].add(getTopText('Instagram', font))

        // SIDE 2
        sides[2].add(getTopText('Gmail', font))

        // SIDE 3
        sides[3].add(getTopText('Github', font))

        // SIDE 4
        sides[4].add(getTopText('LinkedIn', font))
    });

    // ADD IMAGES
}

function centerTextX(geometry) {
    geometry.computeBoundingBox()
    const textWidth = geometry.boundingBox.max.x - geometry.boundingBox.min.x
    return textWidth / -2
}

function getTopText(text, font, options) {
    if (options === undefined) options = {}
    const geometry = new TextGeometry(text, {
        font: font,
        size: options.size || .1,
        height: options.thickness || .01,
    } );
    const words = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({color: 0x0000ff, side: THREE.DoubleSide}))
    words.position.set(centerTextX(geometry), .35 * (options.height || 1), 0)
    return words
}

function getBottomText(text, font, options) {
    if (options === undefined) options = {}
    const geometry = new TextGeometry(text, {
        font: font,
        size: options.size || .05,
        height: options.thickness || .005,
    } );
    const words = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({color: 0x0000ff, side: THREE.DoubleSide}))
    words.position.set(centerTextX(geometry), -.42 * (options.height || 1), 0)
    return words
}

function getPictureFrame(x, y, res, url) {
    const geometry = new THREE.BoxGeometry(x, y, .05)
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
    clickables.push([mesh, materials, materials2, url])
    return mesh
}
