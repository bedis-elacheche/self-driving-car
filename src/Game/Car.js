import { Sensors, clamp } from '../Utils';
import { Box, Utils } from '../Geometry';

class Car {
  constructor({
    x,
    y,
    sk,
    width = 20,
    heading = 0,
    debug = false,
    maxVelocity = 4,
    color = '#686de0',
    visionDistance = 200,
  }) {
    const origin = new p5.Vector(x, y);

    this.sk = sk;
    this.width = width;
    this.color = color;
    this.debug = debug;
    this.origin = origin;
    this.heading = heading;
    this.maxVelocity = maxVelocity;
    this.visionDistance = visionDistance;

    this.score = 0;
    this.velocity = 0;
    this.steerAngle = 0;
    this.isDead = false;
    this.isDone = false;
    this.acceleration = 0;
    this.lastCheckpoint = 0;
    this.startAt = sk.frameCount;
    this.deadAt = null;
    this.length = width * 2;
    this.maxSteering = Math.PI / 30;
    this.wheelBase = this.length / 4;
    this.maxAcceleration = maxVelocity / 4;
    this.freeDeceleration = maxVelocity / 4;
    this.brakeDeceleration = maxVelocity / 2;
    this.lastCheckpointReachedAt = sk.frameCount;

    this.sensors = new Sensors({
      angles: [-Math.PI / 4, -Math.PI / 8, 0, Math.PI / 8, Math.PI / 4],
      sk,
      origin,
      heading,
      visionDistance,
    });
  }

  get frontBox() {
    const {
      origin: { x, y },
      width,
      length,
      heading,
    } = this;
    const left = x + length * 0.25;
    const right = x + length / 2;
    const bottom = y + width * 0.25;
    const top = y - width * 0.25;
    const rotate = (point) => Utils.rotatePoint(point, { x, y }, heading);

    return new Box({
      points: [
        rotate({ x: left, y: top }),
        rotate({ x: right, y: top }),
        rotate({ x: right, y: bottom }),
        rotate({ x: left, y: bottom }),
      ],
    });
  }

  get life() {
    const { startAt, deadAt, isDead, sk } = this;

    return isDead ? deadAt - startAt : sk.frameCount - startAt;
  }

  get time() {
    return parseInt((this.life / 30) * 1000, 10);
  }

  checkProgress(checkpoints) {
    const { frontBox, isDead, isDone, lastCheckpoint, sk } = this;
    let checkpoint = -1;

    if (isDone || isDead) {
      return;
    }

    const from = Math.max(0, lastCheckpoint - 3);
    const to = Math.min(checkpoints.length, lastCheckpoint + 3);

    for (let i = from; i < to; i += 1) {
      const isOnTrack = Utils.polygonCollision(checkpoints[i], frontBox);
      if (isOnTrack) {
        checkpoint = i;
      }
    }

    const isOutsideTheTrack = checkpoint === -1;
    const isOnFinishLine = checkpoint === checkpoints.length - 1;

    this.isDone = isOnFinishLine;
    if (checkpoint > -1 && checkpoint !== lastCheckpoint) {
      this.lastCheckpointReachedAt = sk.frameCount;
    }
    this.lastCheckpoint = checkpoint;
    if (!isOutsideTheTrack) {
      this.score = checkpoint;
    }
    if (isOutsideTheTrack || isOnFinishLine) {
      this.die();
    }
  }

  die() {
    this.isDead = true;
    this.deadAt = this.sk.frameCount;
  }

  goBackward(dt) {
    if (this.velocity > 0) {
      this.acceleration = -this.brakeDeceleration;
    } else {
      this.acceleration -= 1 * dt;
    }

    this.acceleration = clamp(this.acceleration, -this.maxAcceleration, this.maxAcceleration);
  }

  goForward(dt) {
    if (this.velocity < 0) {
      this.acceleration = this.brakeDeceleration;
    } else {
      this.acceleration += 1 * dt;
    }

    this.acceleration = clamp(this.acceleration, -this.maxAcceleration, this.maxAcceleration);
  }

  render() {
    const {
      sk,
      debug,
      sensors,
      heading,
      origin: { x, y },
    } = this;

    if (debug) {
      sensors.render();
    }

    sk.push();
    sk.rectMode(sk.CENTER);
    sk.translate(x, y);
    sk.rotate(heading);

    this.renderTires();
    this.renderBody();
    this.renderLights();

    sk.pop();
  }

  renderBody() {
    const { sk, length, width, color, isDead, isDone } = this;
    let bodyColor = color;

    if (isDone) {
      bodyColor = '#f7b731';
    } else if (isDead) {
      bodyColor = 'lightgray';
    }

    sk.fill(bodyColor);
    sk.rect(0, 0, length, width, 5);
    sk.fill('#2d3436');
    sk.rect(-length / 24, 0, 0.7 * length, 0.8 * width, 5);
    sk.fill(bodyColor);
    sk.rect(-length / 12, 0, 0.45 * length, 0.6 * width, 5);
  }

  renderLights() {
    const { sk, length, width } = this;
    const x = length / 2;
    const y = width / 3;
    const w = width / 8;
    const h = width / 4;

    sk.fill('#ffeaa7');
    sk.ellipse(x, -y, w, h);
    sk.ellipse(x, y, w, h);
    sk.fill('#ff7979');
    sk.ellipse(-x, -y, w, h);
    sk.ellipse(-x, y, w, h);
  }

  renderTires() {
    const { sk, length, width } = this;
    const x = length / 3;
    const y = width / 2;
    const w = width / 4;
    const h = width / 8;

    sk.fill('#2d3436');
    sk.rect(x, -y, w, h);
    sk.rect(x, y, w, h);
    sk.rect(-x, -y, w, h);
    sk.rect(-x, y, w, h);
  }

  release(dt) {
    if (Math.abs(this.velocity) > dt * this.freeDeceleration) {
      this.acceleration = -this.freeDeceleration * Math.sign(this.velocity);
    } else if (dt) {
      this.acceleration = -this.velocity / dt;
    }
  }

  rotate(steerAngle) {
    const { Vector } = p5;
    const { origin, heading, velocity, wheelBase } = this;
    const carHeading = Vector.fromAngle(heading);
    const carSteering = Vector.fromAngle(heading + steerAngle);
    const frontWheel = Vector.add(origin, Vector.mult(carHeading, wheelBase / 2));
    const backWheel = Vector.sub(origin, Vector.mult(carHeading, wheelBase / 2));

    frontWheel.add(Vector.mult(carSteering, velocity));
    backWheel.add(Vector.mult(carHeading, velocity));
    this.origin.set((frontWheel.x + backWheel.x) / 2, (frontWheel.y + backWheel.y) / 2);
    this.heading = Math.atan2(frontWheel.y - backWheel.y, frontWheel.x - backWheel.x);
    this.steerAngle = steerAngle;
  }

  turnLeft(dt) {
    const angle = clamp(this.steerAngle - this.maxSteering * dt, -this.maxSteering, this.maxSteering);

    this.rotate(angle);
  }

  turnRight(dt) {
    const angle = clamp(this.steerAngle + this.maxSteering * dt, -this.maxSteering, this.maxSteering);

    this.rotate(angle);
  }

  update({ dt, track }) {
    this.velocity = clamp(this.velocity + this.acceleration * dt, -this.maxVelocity, this.maxVelocity);

    this.rotate(this.steerAngle);
    this.sensors.update(this);

    if (track) {
      this.checkProgress(track.checkpoints);
      if (!this.isDead) {
        this.sensors.look(track.boundaries);
      }
    }
  }
}

export default Car;
