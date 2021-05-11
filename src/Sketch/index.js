import STATE from './state';
import * as Views from './Views';
import { Car, Track } from '../Game';
import { Population } from '../AI';
import TrackShape from '../../assets/TrackShape.json';
import Genome from '../../assets/genome.json';

/* eslint-disable no-param-reassign */
const sketch = (sk) => {
  const DEBUG = true;
  const CAR_WIDTH = 10;
  const CAR_MAX_VELOCITY = 2;
  const VISION_DISTANCE = 50;
  const MUTATION_PROBABILITY = 0.05;
  const LOAD_BEST_GENOME = false;

  const sections = {
    menu: { width: 275, height: 550 },
    canvas: { width: 975, height: 550 },
  };

  let car;
  let track;
  let population;
  let state = STATE.INIT;
  let stopTraining = false;
  let showTraining = true;
  let populationSize = 100;
  let showDeadCitizens = true;

  sk.setup = () => {
    sk.createCanvas(
      sections.canvas.width + sections.menu.width,
      Math.max(sections.canvas.height, sections.menu.height)
    );
    track = new Track({
      sk,
      shape: TrackShape,
    });
    sk.frameRate(30);
  };

  sk.draw = () => {
    sk.background('#dfe6e9');
    sk.fill('#b8e994');
    sk.rect(0, 0, sections.canvas.width, sections.canvas.height);
    const dt = sk.deltaTime / 250;

    switch (state) {
      case STATE.HUMAN: {
        const isGameOver = Views.human({ dt, sk, car, track, sections });

        if (isGameOver) {
          state = STATE.GAME_OVER;
        }
        break;
      }
      case STATE.GAME_OVER: {
        Views.gameOver({ sk, car, track, sections });
        break;
      }
      case STATE.TRAINING:
        {
          const isTrainingDone = Views.train({
            dt,
            sk,
            track,
            sections,
            population,
            stopTraining,
            showTraining,
            showDeadCitizens,
            mutationProbability: MUTATION_PROBABILITY,
          });

          if (isTrainingDone) {
            state = STATE.TRAINING_OVER;
          }
        }
        break;
      case STATE.TRAINING_OVER: {
        Views.trainingOver({ sk, population, sections });
        showTraining = true;
        stopTraining = false;
        showDeadCitizens = true;
        break;
      }
      case STATE.REPLAY: {
        const isReplayDone = Views.replay({ sk, dt, track, population, sections });
        if (isReplayDone) {
          state = STATE.REPLAY_DONE;
        }
        break;
      }
      case STATE.REPLAY_DONE: {
        Views.replayDone({ sk, sections });
        break;
      }
      default: {
        Views.initial({ sk, sections });
        break;
      }
    }
  };

  sk.keyTyped = () => {
    const key = sk.key.toUpperCase();
    const main = () => {
      state = STATE.INIT;
      sk.noLoop();
      sk.redraw();
    };
    const play = () => {
      car = new Car({
        sk,
        debug: DEBUG,
        width: CAR_WIDTH,
        x: track.start.x,
        y: track.start.y,
        heading: track.start.angle,
        maxVelocity: CAR_MAX_VELOCITY,
        visionDistance: VISION_DISTANCE,
      });
      state = STATE.HUMAN;
      sk.loop();
    };
    const train = () => {
      state = STATE.TRAINING;
      population =
        population ||
        new Population({
          sk,
          debug: DEBUG,
          width: CAR_WIDTH,
          origin: track.start,
          size: populationSize,
          maxVelocity: CAR_MAX_VELOCITY,
          visionDistance: VISION_DISTANCE,
        });
      if (LOAD_BEST_GENOME) {
        population.items[0].importGenome(Genome);
      }
      sk.loop();
    };

    switch (state) {
      case STATE.INIT: {
        switch (key) {
          case 'T': {
            train();
            break;
          }
          case 'P': {
            play();
            break;
          }
        }
        break;
      }
      case STATE.TRAINING: {
        switch (key) {
          case 'S': {
            stopTraining = true;
            break;
          }
          case 'A': {
            populationSize += 10;
            population.setSize(populationSize);
            break;
          }
          case 'R': {
            populationSize -= 10;
            population.setSize(populationSize);
            break;
          }
          case 'K': {
            population.killAll();
            break;
          }
          case 'C': {
            showTraining = !showTraining;
            break;
          }
          case 'D': {
            showDeadCitizens = !showDeadCitizens;
            break;
          }
        }
        break;
      }
      case STATE.REPLAY: {
        switch (key) {
          case 'R': {
            state = STATE.REPLAY;
            population.replay();
            sk.loop();
            break;
          }
          case 'M': {
            main();
            break;
          }
        }
        break;
      }
      case STATE.REPLAY_DONE:
      case STATE.TRAINING_OVER: {
        switch (key) {
          case 'T': {
            train();
            break;
          }
          case 'R': {
            state = STATE.REPLAY;
            population.replay();
            sk.loop();
            break;
          }
          case 'E': {
            const genome = population.export();
            sk.saveJSON(genome, 'genome.json', true);
            break;
          }
          case 'M': {
            main();
            break;
          }
        }
        break;
      }
      case STATE.HUMAN:
      case STATE.GAME_OVER: {
        switch (key) {
          case 'R': {
            play();
            break;
          }
          case 'M': {
            main();
            break;
          }
        }
        break;
      }
    }
  };
};
/* eslint-enable no-param-reassign  */

export default sketch;
