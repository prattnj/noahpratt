export function polarToCartesian(radius, theta) {
    const x = radius * Math.cos(theta);
    const y = radius * Math.sin(theta);
    return [x, y];
}