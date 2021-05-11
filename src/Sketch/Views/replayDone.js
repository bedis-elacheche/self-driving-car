import menu from './menu';

const replayDone = ({ sk, sections }) => {
  sk.push();
  sk.translate(sections.canvas.width / 2, sections.canvas.height / 2);
  sk.fill('#2d3436');
  sk.textSize(32);
  sk.textAlign(sk.CENTER);
  sk.text('Replay is over', 0, 0);
  sk.pop();
  const menuItems = ['(T) Resume training', '(R) Replay training results', '(E) Export last genome', '(M) Main menu'];
  menu({ sk, sections, items: menuItems });

  sk.noLoop();
};

export default replayDone;
