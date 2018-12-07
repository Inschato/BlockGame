"use strict";
class BlockGameCanvas {
  constructor(stage) {
    this.container = new PIXI.Container();
    this.stage = stage;
  }
  
  place(width, height, x, y) {
    this.container.x = x;
    this.container.y = y;
    let graphics = new PIXI.Graphics();
    graphics.beginFill(0x808080);
    graphics.lineStyle(2, 0xf0f0f0);
    graphics.drawRect(0, 0, height, width);
    this.container.addChild(graphics);
    
    let mask = new PIXI.Graphics();
    mask.drawRect(x, y, height, width);
    this.container.mask = mask;
    this.stage.addChild(this.container);
  }
  
  delete() {
    this.container.destroy();
  }
}

class BlockGameRect {
  constructor(canvas, x, y, width, height, color) {    
    this.graphics = new PIXI.Graphics();
    this.graphics.beginFill(color);
    this.graphics.lineStyle(1, 0x000000);
    this.graphics.drawRoundedRect(x, y, width, height, 5);
    canvas.container.addChild(this.graphics);
  }
  
  remove() {
    this.graphics.destroy();
  }
  
  move(dx, dy) {    
    this.graphics.x += dx;
    this.graphics.y += dy;
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