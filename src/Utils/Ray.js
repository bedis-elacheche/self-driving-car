class Ray {
  constructor({ sk, angle, origin, heading, maxDistance = Infinity }) {
    this.sk = sk;
    this.angle = angle;
    this.origin = origin;
    this.dir = p5.Vector.fromAngle(angle + heading);
    this.intersection = null;
    this.maxDistance = maxDistance;
  }

  update({ origin: { x, y }, heading }) {
    this.origin.set(x, y);
    this.dir.setHeading(this.angle + heading);
    this.intersection = null;
  }

  setIntersection(point) {
    this.intersection = point;
  }

  get value() {
    const { intersection, origin, maxDistance } = this;

    if (intersection) {
      return 1 - origin.dist(intersection) / maxDistance;
    }

    return 1;
  }

  isInVision(intersection) {
    const { origin, maxDistance } = this;

    return origin.dist(intersection) <= maxDistance;
  }

  cast(boundary) {
    const x1 = boundary.a.x;
    const y1 = boundary.a.y;
    const x2 = boundary.b.x;
    const y2 = boundary.b.y;

    const x3 = this.origin.x;
    const y3 = this.origin.y;
    const x4 = this.origin.x + this.dir.x;
    const y4 = this.origin.y + this.dir.y;

    const denominator = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    if (denominator === 0) {
      return null;
    }

    const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denominator;
    const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denominator;

    if (t > 0 && t < 1 && u > 0) {
      const x = x1 + t * (x2 - x1);
      const y = y1 + t * (y2 - y1);
      const intersection = new p5.Vector(x, y);

      return this.isInVision(intersection) ? intersection : null;
    }

    return null;
  }
}

export default Ray;
