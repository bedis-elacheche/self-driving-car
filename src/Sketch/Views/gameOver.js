import menu from './menu';
import { msToTime } from '../../Utils';

const gameOver = ({ sk, car, track, sections }) => {
  sk.push();
  sk.translate(sections.canvas.width / 2, sections.canvas.height / 2);
  sk.fill('#2d3436');
  sk.textSize(32);
  sk.textAlign(sk.CENTER);
  sk.text('Game over', 0, 0);
  sk.pop();

  const menuItems = [
    `Checkpoints: ${car.score} / ${track.checkpoints.length}`,
    `Gas: ${car.gas.toFixed(0)} %`,
    `Time elapsed: ${msToTime(car.time)}`,
    '(R) Play again',
    '(M) Main menu',
  ];
  menu({ sk, sections, items: menuItems });
  sk.noLoop();
};

export default gameOver;
