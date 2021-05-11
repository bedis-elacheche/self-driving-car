import { tanh, add, multiply } from 'mathjs';
import { randomMatrix, crossOverMatrices } from '../Utils';

class NeuralNetwork {
  static crossOver({ parents: [parentA, parentB], mixingRatio, mutationProbability }) {
    const weights = parentA.weights.map((matrixA, layerIndex) => {
      const matrixB = parentB.weights[layerIndex];

      return crossOverMatrices({ matrices: [matrixA, matrixB], mixingRatio, mutationProbability });
    });

    const biases = parentB.biases.map((matrixA, layerIndex) => {
      const matrixB = parentB.biases[layerIndex];

      return crossOverMatrices({ matrices: [matrixA, matrixB], mixingRatio, mutationProbability });
    });

    return new NeuralNetwork({ weights, biases });
  }

  static activate(matrix) {
    return tanh(matrix);
  }

  constructor({ layers, weights, biases }) {
    if (layers) {
      const shapes = Array.from({ length: layers.length - 1 }, (_, index) => {
        const w = layers[index];
        const h = layers[index + 1];

        return [h, w];
      });
      this.weights = shapes.map((shape) => randomMatrix(shape));
      this.biases = shapes.map(([h]) => randomMatrix([h, 1]));
    } else {
      this.weights = weights;
      this.biases = biases;
    }
  }

  export() {
    const { weights, biases } = this;

    return {
      weights: weights.map((matrix) => matrix.toArray()),
      biases: biases.map((matrix) => matrix.toArray()),
    };
  }

  predict(input) {
    const { weights, biases } = this;
    let output = input.clone();

    for (let i = 0; i < weights.length; i += 1) {
      const vector = add(multiply(weights[i], output), biases[i]);

      output = NeuralNetwork.activate(vector);
    }

    return output;
  }
}

export default NeuralNetwork;
