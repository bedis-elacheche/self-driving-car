import Ray from './Ray';

class Sensors {
  constructor({ angles, origin, heading, sk, visionDistance }) {
    this.sk = sk;
    this.origin = origin;
    this.visionDistance = visionDistance;

    this.rays = angles.map(
      (angle) =>
        new Ray({
          sk,
          angle,
          origin,
          heading,
          maxDistance: visionDistance,
        })
    );
  }

  update({ origin, heading }) {
    this.origin.set(origin.x, origin.y);
    this.rays.forEach((ray) => {
      ray.update({ origin, heading });
    });
  }

  look(boundaries) {
    const { rays, origin } = this;
    const allBoundaries = [...boundaries.left, ...boundaries.right];

    rays.forEach((ray) => {
      let closest = null;
      let record = Infinity;

      allBoundaries.forEach((boundary) => {
        const point = ray.cast(boundary);

        if (point) {
          const distance = p5.Vector.dist(origin, point);
          if (distance < record) {
            record = distance;
            closest = point;
          }
        }
      });

      ray.setIntersection(closest);
    });
  }

  get length() {
    return this.rays.length;
  }

  get value() {
    return this.rays.map((ray) => ray.value);
  }

  render() {
    const { rays, sk } = this;
    sk.push();
    sk.stroke('black');
    rays.forEach(({ intersection }) => {
      if (!intersection) {
        return;
      }

      sk.push();
      sk.translate(intersection.x, intersection.y);
      sk.line(-3, 3, 3, -3);
      sk.line(3, 3, -3, -3);
      sk.pop();
    });
    sk.pop();
  }
}

export default Sensors;
