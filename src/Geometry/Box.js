class Box {
  constructor({ points }) {
    this.collision = false;
    this.points = points;
    const { length } = points;
    this.edges = Array.from({ length }, (_, index) => points[index].copy().sub(points[(index + 1) % length]));
  }
}

export default Box;
