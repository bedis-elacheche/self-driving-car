import { matrix, random } from 'mathjs';
import Ray from './Ray';
import Sensors from './Sensors';

export const clamp = (value, min, max) => Math.max(min, Math.min(value, max));

export const msToTime = (ms) => {
  if (!ms) {
    return '--:--:--';
  }

  let seconds = parseInt(ms / 1000, 10);
  let minutes = parseInt(seconds / 60, 10);
  const hours = parseInt(minutes / 60, 10);

  seconds %= 60;
  minutes %= 60;

  return [hours, minutes, seconds].map((item) => item.toString().padStart(2, '0')).join`:`;
};

export const randomMatrix = (shape) => matrix(random(shape, -1, 1));

export const crossOverMatrices = ({ matrices: [matrixA, matrixB], mixingRatio = 0.5, mutationProbability }) =>
  matrixA.map((value, index) => {
    let gene = value;

    if (random() < mixingRatio) {
      gene = matrixB.get(index);
    }

    if (random() > mutationProbability) {
      gene += random(-0.05, 0.05);
    }

    return gene;
  });

export { Ray, Sensors };
