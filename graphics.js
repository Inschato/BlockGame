"use strict";
class BlockGameCanvas {
  constructor(stage) {
    this.container = new PIXI.Container();
    this.stage = stage;
  }

  place(width, height, x, y) {
    this.width = width;
    this.height = height;
    this.container.x = x;
    this.container.y = y;
    let graphics = new PIXI.Graphics();
    graphics.beginFill(0x0f0e11);
    graphics.lineStyle(2, 0xf0f0f0);
    graphics.drawRect(0, 0, height, width);
    this.container.addChild(graphics);

    let mask = new PIXI.Graphics();
    mask.visible = false;
    mask.drawRect(x, y, height, width);
    this.container.mask = mask;
    this.stage.addChild(this.container);
  }

  delete() {
    this.container.destroy();
  }
}

class BlockGameRect {
  constructor(canvas, x, y, width, height, texture, tint) {
    this.container = new PIXI.Container();
    this.container.x = x;
    this.container.y = y;

    this.sprite = new PIXI.Sprite(texture);
    if (tint) {
      this.sprite.tint = tint;
    }

    // TODO: Either fix inconsistent border rendering, or remove.
    this.graphics = new PIXI.Graphics();
    this.graphics.lineStyle(2, 0xAAAAAA);
    this.graphics.drawRect(0, 0, width, height);

    this.container.addChild(this.graphics);
    this.container.addChild(this.sprite);

    canvas.container.addChild(this.container);
  }

  remove() {
    this.container.destroy();
  }

  move(dx, dy) {
    this.container.x += dx;
    this.container.y += dy;
  }
}

class BlockGameButton {
  constructor(canvas, x, y, sprite, callback) {
    this.sprite = new PIXI.Sprite.fromImage(sprite);
    this.sprite.x = x;
    this.sprite.y = y;
    this.sprite.interactive = true;
    this.sprite.buttonMode = true;
    this.sprite.on('pointerdown', callback);

    // This shouldn't be hard coded.
    this.graphics = new PIXI.Graphics();
    //this.graphics.beginFill(0xFF0000);
    this.graphics.lineStyle(5, 0xf6ff00);
    this.graphics.drawRect(x, y, 120, 40);

    canvas.addChild(this.graphics);
    canvas.addChild(this.sprite);
  }

  remove() {
    this.sprite.destroy();
  }
}
