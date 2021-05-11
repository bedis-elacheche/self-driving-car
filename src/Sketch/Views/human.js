import menu from './menu';
import { msToTime } from '../../Utils';

const human = ({ sk, dt, car, track, sections }) => {
  const left = sk.keyIsDown(sk.LEFT_ARROW);
  const right = sk.keyIsDown(sk.RIGHT_ARROW);
  const up = sk.keyIsDown(sk.UP_ARROW);
  const down = sk.keyIsDown(sk.DOWN_ARROW);

  if (left) {
    car.turnLeft(dt);
  } else if (right) {
    car.turnRight(dt);
  } else {
    car.rotate(0);
  }

  if (up) {
    car.goForward(dt);
  } else if (down) {
    car.goBackward(dt);
  } else {
    car.release(dt);
  }

  car.update({ dt, track });

  track.render(car);
  car.render();

  const menuItems = [
    `Checkpoints: ${car.score} / ${track.checkpoints.length}`,
    `Time elapsed: ${msToTime(car.time)}`,
    '(R) Restart',
    '(M) Main menu',
  ];
  menu({ sk, sections, items: menuItems });

  return car.isDead || car.isDone;
};

export default human;
