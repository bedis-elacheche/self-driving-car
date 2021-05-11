import { matrix } from 'mathjs';
import { Car } from '../Game';
import NeuralNetwork from './NeuralNetwork';

class SmartCar extends Car {
  static crossOver({ parents: [parentA, parentB], mutationProbability }) {
    const { sk, width, color, debug, initialOrigin, visionDistance, maxVelocity, fitness: parentAFitness } = parentA;
    const { fitness: parentBFitness } = parentB;
    const totalFitness = parentAFitness + parentBFitness;
    const mixingRatio = totalFitness > 0 ? parentBFitness / totalFitness : 0.5;
    const brain = NeuralNetwork.crossOver({
      mixingRatio,
      mutationProbability,
      parents: [parentA.brain, parentB.brain],
    });

    return new SmartCar({
      sk,
      color,
      width,
      debug,
      brain,
      maxVelocity,
      visionDistance,
      origin: initialOrigin,
    });
  }

  constructor({ sk, color, width, debug, brain, origin, visionDistance, maxVelocity }) {
    super({ sk, x: origin.x, y: origin.y, color, width, debug, maxVelocity, visionDistance, heading: origin.angle });
    this.initialOrigin = origin;
    this.initBrain(brain);
  }

  get fitness() {
    const { score, isDone, time } = this;
    const ONE_MINUTE = 60000;
    let fitness = score * 100;
    let timeFactor = time || 0;

    if (isDone) {
      fitness += 500;
    } else {
      timeFactor = time + ONE_MINUTE;
    }

    return fitness / timeFactor;
  }

  clone() {
    const { color, width, debug, sk, initialOrigin, maxVelocity, visionDistance, brain } = this;

    return new SmartCar({
      sk,
      color,
      width,
      debug,
      brain,
      maxVelocity,
      visionDistance,
      origin: initialOrigin,
    });
  }

  export() {
    const { color, maxVelocity, width, visionDistance, brain } = this;

    return {
      color,
      width,
      maxVelocity,
      visionDistance,
      brain: brain.export(),
    };
  }

  initBrain(brain) {
    const options = brain || {
      layers: [this.sensors.length + 2, 10, 2],
    };

    this.brain = new NeuralNetwork(options);
  }

  importGenome({ brain }) {
    if (brain) {
      const { biases, weights } = brain;

      this.brain = new NeuralNetwork({
        biases: biases.map((m) => matrix(m)),
        weights: weights.map((m) => matrix(m)),
      });
    }
  }

  predict(dt) {
    const { brain, sensors, heading, velocity } = this;
    const input = matrix([velocity, heading % (2 * Math.PI), ...sensors.value].map((item) => [item]));
    const [[direction], [steering]] = brain.predict(input).toArray();

    if (steering <= -0.33) {
      this.turnLeft(dt);
    } else if (steering <= 0.66) {
      this.rotate(0);
    } else {
      this.turnRight(dt);
    }

    if (direction <= -0.33) {
      this.goBackward(dt);
    } else if (direction <= 0.66) {
      this.release();
    } else {
      this.goForward(dt);
    }
  }

  update({ dt, track }) {
    const MAX_IDLE = 50;
    const MAX_LIFE = 1000;

    super.update({ dt, track });
    this.predict(dt);

    if (this.sk.frameCount - this.lastCheckpointReachedAt >= MAX_IDLE || this.life >= MAX_LIFE) {
      this.die();
    }
  }
}

export default SmartCar;
