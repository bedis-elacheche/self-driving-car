import menu from './menu';

const initial = ({ sk, sections }) => {
  sk.push();
  sk.translate(sections.canvas.width / 2, sections.canvas.height / 2);
  sk.fill('#2d3436');
  sk.textSize(32);
  sk.textAlign(sk.CENTER);
  sk.text('Self driving car', 0, 0);
  sk.pop();
  const menuItems = ['(P) Play the track yourself', '(T) Train cars'];
  menu({ sk, sections, items: menuItems });

  sk.noLoop();
};

export default initial;
