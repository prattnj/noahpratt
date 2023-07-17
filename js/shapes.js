import * as THREE from "three";
import {polarToCartesian} from "./util";
import {FontLoader} from "three/examples/jsm/loaders/FontLoader";
import {TextGeometry} from "three/examples/jsm/geometries/TextGeometry";

export function getCustomPentagonalPrism(height, radius) {

    const SMALL_R = radius * Math.cos(Math.PI / 5)
    const SIDE = 2 * radius * Math.sin(Math.PI / 5)

    // Create 2 pentagons
    const bottom = new THREE.Mesh(new THREE.CircleGeometry(radius, 5), new THREE.MeshStandardMaterial({color: 0x3de2ff, side: THREE.DoubleSide}))
    const top = new THREE.Mesh(new THREE.CircleGeometry(radius, 5), new THREE.MeshStandardMaterial({color: 0x3de2ff, side: THREE.DoubleSide}))

    // Create 5 rectangles
    const sides = []
    for (let i = 0; i < 5; i ++) {
        const side = new THREE.Mesh(new THREE.PlaneGeometry(SIDE, height), new THREE.MeshStandardMaterial({color: 0x3de2ff, side: THREE.DoubleSide}))
        const loader = new FontLoader();

        loader.load('fonts/noto-sans-regular.json', function (font) {

            const geometry = new TextGeometry( 'Noah Pratt', {
                font: font,
                size: .1,
                height: .01,
            } );
            geometry.computeBoundingBox()
            const textWidth = geometry.boundingBox.max.x - geometry.boundingBox.min.x

            const text = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({color: 0x0000ff, side: THREE.DoubleSide}))

            text.position.set(textWidth / -2, .3 * height, 0)

            side.add(text)
        } );
        sides.push(side)
    }

    // Position the pentagons
    bottom.position.set(0, (-height / 2), 0)
    top.position.set(0, (height / 2), 0)
    bottom.rotation.x = Math.PI / 2
    top.rotation.x = Math.PI / 2

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

export function getCustomDodecahedron() {

    const PHI = (1 + Math.sqrt(5)) / 2

    // Pentagon
    const P_BIG_R = 1
    const P_SMALL_R = P_BIG_R * Math.cos(Math.PI / 5)
    const P_SIDE = 2 * P_BIG_R * Math.sin(Math.PI / 5)
    const P_HEIGHT = P_SMALL_R + P_BIG_R;

    // Angles
    const DD_DIHEDRAL_ANGLE = 2 * Math.atan(PHI)        // Angle between faces in radians
    const DD_EXTERNAL_ANGLE = Math.PI - DD_DIHEDRAL_ANGLE

    // Dodecahedron
    const H1 = P_HEIGHT * Math.sin(DD_EXTERNAL_ANGLE)   // Vertical distance between an upper side vertex and the ground
    const H2 = P_SIDE * Math.sin(DD_EXTERNAL_ANGLE)     // Vertical distance between a lower side vertex and the ground
    const DODECAHEDRON_HEIGHT = H1 + H2
    const Y_POS1 = P_SMALL_R * Math.sin(DD_EXTERNAL_ANGLE)
    const Y_POS2 = DODECAHEDRON_HEIGHT - Y_POS1

    // Radial (lateral) distance from the center of a side pentagon to the center of the dodecahedron's base
    const RADIAL_DISTANCE = (P_SMALL_R / 2) * Math.cos(DD_EXTERNAL_ANGLE) + P_SMALL_R

    // Create 12 pentagons
    const pentagons = []
    for (let i = 0; i < 12; i ++) {
        const pentagon = new THREE.Mesh(new THREE.CircleGeometry(1, 5), new THREE.MeshBasicMaterial({color: Math.random() * 0xffffff, side: THREE.DoubleSide}))
        pentagons.push(pentagon)
    }

    // POSITION --------------------------------------------------------------------------------------------------------

    // Bottom and top
    pentagons[0].position.set(0, 0, 0)
    pentagons[1].position.set(0, DODECAHEDRON_HEIGHT, 0)

    // Lower pentagons
    const lower1 = polarToCartesian(RADIAL_DISTANCE, Math.PI / 5)
    const lower2 = polarToCartesian(RADIAL_DISTANCE, 3 * Math.PI / 5)
    const lower3 = polarToCartesian(RADIAL_DISTANCE, 5 * Math.PI / 5)
    const lower4 = polarToCartesian(RADIAL_DISTANCE, 7 * Math.PI / 5)
    const lower5 = polarToCartesian(RADIAL_DISTANCE, 9 * Math.PI / 5)
    pentagons[2].position.set(lower1[0], Y_POS1, lower1[1])
    pentagons[3].position.set(lower2[0], Y_POS1, lower2[1])
    pentagons[4].position.set(lower3[0], Y_POS1, lower3[1])
    pentagons[5].position.set(lower4[0], Y_POS1, lower4[1])
    pentagons[6].position.set(lower5[0], Y_POS1, lower5[1])

    // Upper pentagons
    const upper1 = polarToCartesian(RADIAL_DISTANCE, 0)
    const upper2 = polarToCartesian(RADIAL_DISTANCE, 2 * Math.PI / 5)
    const upper3 = polarToCartesian(RADIAL_DISTANCE, 4 * Math.PI / 5)
    const upper4 = polarToCartesian(RADIAL_DISTANCE, 6 * Math.PI / 5)
    const upper5 = polarToCartesian(RADIAL_DISTANCE, 8 * Math.PI / 5)
    pentagons[7].position.set(upper1[0], Y_POS2, upper1[1])
    pentagons[8].position.set(upper2[0], Y_POS2, upper2[1])
    pentagons[9].position.set(upper3[0], Y_POS2, upper3[1])
    pentagons[10].position.set(upper4[0], Y_POS2, upper4[1])
    pentagons[11].position.set(upper5[0], Y_POS2, upper5[1])

    // TILT ------------------------------------------------------------------------------------------------------------

    // ROTATION --------------------------------------------------------------------------------------------------------


    //pentagons[2].rotation.x += DD_DIHEDRAL_ANGLE - (Math.PI / 2)
    //pentagons[2].rotation.y = 3 * Math.PI / 10
    //pentagons[2].rotation.z = Math.PI

    //pentagons[4].rotation.x = Math.PI / 2
    //pentagons[4].rotation.y = DD_DIHEDRAL_ANGLE
    //pentagons[4].rotateOnAxis(new THREE.Vector3(1, 0, 0), Math.PI / 2)

    // Bottom and top
    pentagons[0].rotation.x = Math.PI / 2
    pentagons[1].rotation.x = Math.PI / 2
    pentagons[1].rotation.y = Math.PI

    // Lower pentagons
    pentagons[2].rotation.z = Math.PI / 10
    pentagons[3].rotation.z = Math.PI / 10
    pentagons[4].rotation.z = Math.PI / 10
    pentagons[5].rotation.z = Math.PI / 10
    pentagons[6].rotation.z = Math.PI / 10

    pentagons[2].rotation.y = 13 * Math.PI / 10
    pentagons[3].rotation.y = 9 * Math.PI / 10
    pentagons[4].rotation.y = 5 * Math.PI / 10
    pentagons[5].rotation.y = Math.PI / 10
    pentagons[6].rotation.y = -3 * Math.PI / 10

    //pentagons[4].rotation.x = Math.PI / 2

    // Upper pentagons
    pentagons[7].rotation.z = -1 * Math.PI / 10
    pentagons[8].rotation.z = -1 * Math.PI / 10
    pentagons[9].rotation.z = -1 * Math.PI / 10
    pentagons[10].rotation.z = -1 * Math.PI / 10
    pentagons[11].rotation.z = -1 * Math.PI / 10

    pentagons[7].rotation.y = 5 * Math.PI / 10
    pentagons[8].rotation.y = Math.PI / 10
    pentagons[9].rotation.y = -3 * Math.PI / 10
    pentagons[10].rotation.y = -7 * Math.PI / 10
    pentagons[11].rotation.y = -11 * Math.PI / 10

    const group = new THREE.Group()
    for (let i = 0; i < 12; i ++) group.add(pentagons[i])
    return group
}