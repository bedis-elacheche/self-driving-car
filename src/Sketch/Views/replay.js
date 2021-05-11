import menu from './menu';
import { msToTime } from '../../Utils';

const replay = ({ sk, dt, track, population, sections }) => {
  track.render();
  population.renderReplay({ dt, track });

  const { history, replayIndex, highscore } = population;
  const citizen = history[replayIndex] || history[replayIndex - 1];

  const menuItems = [
    `Generation: ${Math.min(replayIndex + 1, history.length)} / ${history.length}`,
    `Score: ${citizen.score}`,
    `Highscore: ${highscore}`,
    `Time: ${msToTime(citizen.time)}`,
    '(R) Restart',
    '(M) Main menu',
  ];

  menu({ sk, sections, items: menuItems });

  return population.isReplayDone;
};

export default replay;
