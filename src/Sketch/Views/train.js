import menu from './menu';
import { clamp, msToTime } from '../../Utils';

const train = ({
  dt,
  sk,
  track,
  sections,
  population,
  showTraining,
  stopTraining,
  showDeadCitizens,
  mutationProbability,
}) => {
  population.train({ dt, track, showTraining, showDeadCitizens });
  const { alive, history, size, generation } = population;

  let percentage = 0;
  let fitness = 0;
  let time = null;
  const previousRun = history[history.length - 1];

  if (previousRun) {
    fitness = previousRun.fitness;
    time = previousRun.time;
    percentage = clamp(((previousRun.score + 1) / track.checkpoints.length) * 100, 0, 100);
  }

  sk.push();
  sk.textSize(16);

  if (!showTraining) {
    sk.noStroke();
    sk.fill('#dfe6e9');
    sk.translate(sections.canvas.width / 2, sections.canvas.height / 2);
    sk.rect(-200, -20, 400, 40);

    sk.fill('#82ccdd');
    sk.rect(-200, -20, 4 * percentage, 40);
    sk.fill('#2d3436');
    sk.textAlign(sk.CENTER);
    sk.text(`Track completion: ${percentage.toFixed(2)} %`, 0, 5);
  }
  sk.pop();

  const menuItems = [
    `Generation: ${generation}`,
    `Citizens: ${size}`,
    `Alive: ${alive}`,
    `Mutation probability: ${mutationProbability * 100} %`,
    `Track completion: ${percentage.toFixed(2)} %`,
    `Fitness: ${fitness.toFixed(3)}`,
    `Time ${msToTime(time)}`,
    '(A) Add 10 citizens',
    size > 11 && `(R) Remove 10 citizens`,
    '(K) Kill citizens',
    `(C) ${showTraining ? 'Hide' : 'Display'} citizens`,
    showTraining && `(D) ${showDeadCitizens ? 'Hide' : 'Display'} dead citizens`,
    '(S) Stop training',
  ].filter(Boolean);

  menu({ sk, sections, items: menuItems });

  if (alive === 0) {
    const { bestCitizen } = population;
    if (stopTraining) {
      population.history.push(bestCitizen);

      return true;
    }

    population.evolve({ mutationProbability });
  }

  return false;
};

export default train;
