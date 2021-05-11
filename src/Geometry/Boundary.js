class Boundary {
  constructor({ a, b }) {
    this.a = new p5.Vector(a.x, a.y);
    this.b = new p5.Vector(b.x, b.y);
  }
}

export default Boundary;
