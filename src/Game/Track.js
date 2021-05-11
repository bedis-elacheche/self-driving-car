import { Box, Boundary } from '../Geometry';

class Track {
  constructor({ shape, sk, debug = false }) {
    this.sk = sk;
    this.debug = debug;

    this.makeBoundaries(shape);
    this.makeCheckpoints();

    const {
      left: [startLeft],
      right: [startRight],
    } = shape;

    this.start = {
      x: Math.floor((startLeft.x + startRight.x) / 2),
      y: Math.floor((startLeft.y + startRight.y) / 2),
      angle: Math.atan2(startRight.y - startLeft.y, startRight.x - startLeft.x) - Math.PI / 2,
    };
  }

  getCheckpointColor(index, car) {
    const { debug, checkpoints } = this;

    if (index === 0 || index === checkpoints.length - 1) {
      return 'white';
    }

    if (debug && car) {
      const from = Math.max(0, car.lastCheckpoint - 3);
      const to = Math.min(checkpoints.length - 1, car.lastCheckpoint + 3);
      if (index >= from && index <= to) {
        return 'red';
      }
    }

    return '#7f8c8d';
  }

  makeBoundaries({ left, right }) {
    const length = left.length - 1;
    const boundaries = {
      left: [],
      right: [],
    };

    for (let index = 0; index < length; index += 1) {
      const leftBoundary = new Boundary({
        a: left[index],
        b: left[index + 1],
      });
      boundaries.left.push(leftBoundary);

      const rightBoundary = new Boundary({
        a: right[index],
        b: right[index + 1],
      });
      boundaries.right.push(rightBoundary);
    }

    this.boundaries = boundaries;
  }

  makeCheckpoints() {
    const { left, right } = this.boundaries;
    const { length } = left;

    this.checkpoints = Array.from(
      { length },
      (_, index) =>
        new Box({
          points: [left[index].a, left[index].b, right[index].b, right[index].a],
        })
    );
  }

  render(car) {
    this.renderCircuit(car);

    if (this.debug) {
      this.renderCheckPoints();
    }
  }

  renderCircuit(car) {
    const { sk, checkpoints } = this;

    sk.push();
    checkpoints.forEach(({ points: [a, b, c, d] }, index) => {
      const color = this.getCheckpointColor(index, car);

      sk.fill(color);
      sk.stroke(color);
      sk.quad(a.x, a.y, b.x, b.y, c.x, c.y, d.x, d.y);
    });

    sk.pop();
  }

  renderCheckPoints() {
    const { sk, checkpoints } = this;

    sk.push();
    sk.stroke('white');

    checkpoints.forEach(({ points: [, b, c] }) => {
      sk.line(b.x, b.y, c.x, c.y);
    });
    sk.pop();
  }
}

export default Track;
