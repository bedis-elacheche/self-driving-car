import { random } from 'mathjs';
import SmartCar from './SmartCar';

class Population {
  constructor({ sk, size, debug, width, origin, brain, maxVelocity, visionDistance }) {
    this.sk = sk;
    this.size = size;
    this.generation = 0;
    this.items = Array.from(
      { length: size },
      () =>
        new SmartCar({
          sk,
          debug,
          width,
          brain,
          origin,
          maxVelocity,
          visionDistance,
        })
    );
    this.history = [];
    this.replayIndex = 0;
  }

  get highscore() {
    return Math.max(...this.history.map((citizen) => citizen.score));
  }

  get isReplayDone() {
    const { replayIndex, history } = this;

    return replayIndex === history.length && history[replayIndex - 1].isDead;
  }

  get fitnessSum() {
    return this.items.reduce((acc, citizen) => acc + citizen.fitness, 0);
  }

  get alive() {
    return this.items.filter((citizen) => !citizen.isDead).length;
  }

  get bestCitizen() {
    const { items } = this;
    let [best] = items;

    items.forEach((citizen) => {
      if (citizen.fitness > best.fitness) {
        best = citizen;
      }
    });

    return best;
  }

  evolve({ mutationProbability }) {
    const { bestCitizen, fitnessSum, size } = this;

    this.history.push(bestCitizen);

    const newItems = [bestCitizen.clone()];

    for (let i = 0; i < size - 2; i += 1) {
      const parentA = this.selectParent(fitnessSum);
      const parentB = this.selectParent(fitnessSum);

      newItems.push(SmartCar.crossOver({ parents: [parentA, parentB], mutationProbability }));
    }

    this.items = newItems;
    this.generation += 1;
  }

  export() {
    return this.history[this.history.length - 1].export();
  }

  exportAll() {
    return this.history.map((citizen) => citizen.export());
  }

  killAll() {
    this.items.forEach((citizen) => citizen.die());
  }

  prepareCitizenForReplay() {
    const { replayIndex } = this;
    if (this.history[replayIndex]) {
      this.history[replayIndex] = this.history[replayIndex].clone();
    }
  }

  renderReplay({ dt, track }) {
    const { replayIndex, history, sk } = this;

    const citizen = history[replayIndex];

    citizen.update({ dt, track });
    citizen.render();

    if (citizen.isDead) {
      this.replayIndex += 1;
      this.prepareCitizenForReplay();

      sk.noLoop();
      setTimeout(() => {
        sk.loop();
      }, 2000);
    }
  }

  replay() {
    this.replayIndex = 0;
    this.prepareCitizenForReplay();
  }

  selectParent(sum) {
    const { size, items } = this;
    const r = random(sum);
    let partial = 0;

    for (let i = 0; i < size - 1; i += 1) {
      const citizen = items[i];

      partial += citizen.fitness;

      if (partial > r) {
        return citizen;
      }
    }

    return items[0];
  }

  setSize(size) {
    this.size = size;
  }

  train({ dt, track, showTraining, showDeadCitizens }) {
    if (showTraining) {
      track.render();
    }

    this.items.forEach((citizen) => {
      if (!citizen.isDead) {
        citizen.update({ dt, track });
      }

      const shouldRender = citizen.isDead ? showTraining && showDeadCitizens : showTraining;
      if (shouldRender) {
        citizen.render();
      }
    });
  }
}

export default Population;
