import menu from './menu';

const trainingOver = ({ sk, sections }) => {
  sk.push();
  sk.translate(sections.canvas.width / 2, sections.canvas.height / 2);
  sk.fill('#2d3436');
  sk.textSize(32);
  sk.textAlign(sk.CENTER);
  sk.text('Training is over', 0, 0);
  sk.pop();
  const menuItems = ['(T) Resume training', '(R) Play training results', '(E) Export last genome', '(M) Main menu'];
  menu({ sk, sections, items: menuItems });

  sk.noLoop();
};

export default trainingOver;
