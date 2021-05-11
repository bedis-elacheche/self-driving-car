const menu = ({ sk, items, sections: { canvas } }) => {
  sk.push();
  sk.translate(canvas.width + 10, 0);
  sk.textSize(14);
  sk.fill('#2d3436');
  items.forEach((item, index) => {
    sk.text(item, 0, (index + 1) * 25);
  });
  sk.pop();
};

export default menu;
