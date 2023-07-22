import * as THREE from "three";
import {FontLoader} from "three/examples/jsm/loaders/FontLoader";
import {TextGeometry} from "three/examples/jsm/geometries/TextGeometry";
import fourpeaks from '../assets/4peaks.jpg'
import fms from '../assets/fms.png'
import ghp from '../assets/ghp.png'
import mm from '../assets/mm.png'
import chess from '../assets/chess.png'
import wood from '../assets/wood.png'

export const clickables = []
const fontLoader = new FontLoader()
const textureLoader = new THREE.TextureLoader()
const prismHeight = 1

export function getCustomPentagonalPrism(radius, instance) {
    if (instance !== 'l' && instance !== 'r') return

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
        sides[0].add(getTopText('Work Experience', font))

        // SIDE 1
        sides[1].add(getTopText('Education', font))

        // SIDE 2
        sides[2].add(getTopText('Pic of me', font))

        // SIDE 3
        sides[3].add(getTopText('Socials', font))

        // SIDE 4
        sides[4].add(getTopText('Hobbies', font))
    });

    // ADD IMAGES
    sides[3].add(getProjectPicture(1, .5, fourpeaks, null))
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
        alignment: 'center'
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
