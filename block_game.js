"use strict";
function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min) ) + min;
}

class Piece {
  constructor(board, point_array, texture, tint=null) {
    this.all_rotations = point_array;
    this.rotation_index = getRndInteger(0, this.all_rotations.length);
    this.texture = texture;
    this.tint = tint;
    this.position = [5, 0];
    this.board = board;
    this.moved = true;
  }

  get currentRotation() {
    return this.all_rotations[this.rotation_index];
  }

  get height() {
    return this.currentRotation.map(b=>b[1]).filter((v, i, self) => self.indexOf(v) === i).length;
  }

  get width() {
    return this.currentRotation.map(b=>b[0]).filter((v, i, self) => self.indexOf(v) === i).length;
  }

  get x() {
    return this.position[0];
  }

  get y() {
    return this.position[1];
  }

  dropByOne() {
    return this.moved = this.move(0, 1, 0);
  }

  move(delta_x, delta_y, delta_rotation) {
    let moved = true;
    let potential = this.all_rotations[(this.rotation_index + delta_rotation) % this.all_rotations.length]

    potential.forEach((posns) => {
      if (!this.board.emptyAt([posns[0] + delta_x + this.position[0], posns[1] + delta_y + this.position[1]]))
        moved = false;
    });

    // Try moving the piece back into the board if we're trying to rotate it on the edge
    if (!moved && delta_rotation) {
      moved = true;
      let max_x = potential.reduce((acc, b) => b[0] > acc ? b[0] : acc, potential[0][0]) + this.position[0];
      let min_x = potential.reduce((acc, b) => b[0] < acc ? b[0] : acc, potential[0][0]) + this.position[0];
      delta_x = min_x < 0 ? -min_x : (Board.numColumns - 1) - max_x;
      potential.forEach((posns) => {
      if (!this.board.emptyAt([posns[0] + delta_x + this.position[0], posns[1] + delta_y + this.position[1]]))
        moved = false;
      });
    }

    if (moved) {
      this.position[0] += delta_x;
      this.position[1] += delta_y;
      this.rotation_index = (this.rotation_index + delta_rotation) % this.all_rotations.length;
    }
    return moved;
  }
}

class Level {
  constructor(board, data) {
    this.board = board;
    this.pieces = data.pieces;
    this.setBackground(data.background, data.tint);
    this.board.delay = data.delay;
    this.events = data.events;
    this.number = data.number;
    this.nextLevel = data.nextLevel;
  }

  setBackground(background, tint) {
    this.board.game.background.texture = background;
    if (tint) {
      this.board.game.background.tint = tint;
    }
  }

  nextPiece() {
    let i = getRndInteger(0, this.pieces.length);
    let piece = this.pieces[i];
    return new Piece(this.board, piece.points, piece.texture, piece.tint);
  }
}

class Board {
  constructor(game) {
    this.game = game;
    this.grid = [];
    for(let i = 0; i < Board.numRows; i++) {
      let row = [];
      for(let j = 0; j < Board.numColumns; j++) {
        row.push(undefined);
      }
      this.grid.push(row);
    }
    this.levels = Levels.slice();
    this.level = new Level(this, this.levels.shift());
    this.currentBlock = this.level.nextPiece();
    this.previewPiece = this.level.nextPiece();
    this.score = 0;
    this.lines = 0;
    this.pieces = 0;
  }

  gameOver() {
    return this.grid[1].find(b=>b);
  }

  run() {
    let ran = this.currentBlock.dropByOne();
    if (!ran) {
      this.storeCurrent();
      if (!this.gameOver()) {
        this.nextPiece();
      }
    }
    this.game.updateScore();
    this.draw();
  }

  moveLeft() {
    if (!this.gameOver() && this.game.running) {
      this.currentBlock.move(-1, 0, 0);
    }
    this.draw();
  }

  moveRight() {
    if (!this.gameOver() && this.game.running) {
      this.currentBlock.move(1, 0, 0);
    }
    this.draw();
  }

  rotateClockwise() {
    if (!this.gameOver() && this.game.running) {
      this.currentBlock.move(0, 0, 1);
    }
    this.draw();
  }

  rotateCounterClockwise() {
    if (!this.gameOver() && this.game.running) {
      this.currentBlock.move(0, 0, -1);
    }
    this.draw();
  }

  dropAllTheWay() {
    if (this.game.running) {
      let ran = this.currentBlock.dropByOne();
      this.currentPos.forEach(block=> block.remove());
      while (ran) {
        this.score += 1;
        ran = this.currentBlock.dropByOne();
      }
      this.draw();
      this.storeCurrent();
      if (!this.gameOver()) {
        this.nextPiece();
      }
      this.game.updateScore();
      this.draw();
    }
  }

  // TODO: Fix this function to work properly
  dropOne() {

  }

  nextPiece() {
    this.currentBlock = this.previewPiece;
    this.previewPiece = this.level.nextPiece();
    this.drawOnce();
    this.currentPos = undefined;
    this.pieces++;
  }

  storeCurrent() {
    let locations = this.currentBlock.currentRotation;
    let displacement = this.currentBlock.position;
    for (let i in locations) {
      let current = locations[i];
      this.grid[current[1] + displacement[1]][current[0] + displacement[0]] =
        this.currentPos[i];
    }
    this.removeFilled();
  }

  emptyAt(point) {
    if (!(point[0] >= 0 && point[0] < Board.numColumns)) {
      return false;
    } else if (point[1] < 1) {
      return true;
    } else if (point[1] >= Board.numRows) {
      return false;
    }
    return (this.grid[point[1]][point[0]] == undefined);
  }

  removeFilled() {
    let linesCleared = 0;
    for(let i = 2; i < this.grid.length; i++) {
      // see if row is filled
      if (this.grid[i].findIndex(e=>e==undefined) == -1) {
        // remove filled row
        for (let j in this.grid[i]) {
          this.grid[i][j].remove();
          this.grid[i][j] = undefined;
        }
        // Shift down rows above
        for (let j = this.grid.length - i + 1; j <= this.grid.length; j++) {
          for (let k in this.grid[j]) {
            if (this.grid[this.grid.length - j][k])
              this.grid[this.grid.length - j][k].move(0, Board.blockSize);
          }
          this.grid[this.grid.length - j + 1] = this.grid[this.grid.length - j];
        }
        // Need to make a new array here because we're overwriting arrays in the code above
        let row = [];
        for(let j = 0; j < Board.numColumns; j++) {
          row.push(undefined);
        }
        this.grid[0] = row;
        this.lines += 1;
        linesCleared += 1;
      }
    }
    this.updateScore(linesCleared);
  }

  updateScore(linesCleared) {
    let clearPoints = 50 * 2 << linesCleared - 1;
    // Bonus for getting multiple 4+ line clears in a row
    if(this.lastClear >= 4 && linesCleared >= 4) {
      clearPoints += 400;
    }
    if (linesCleared > 0) {
      this.lastClear = linesCleared;
      this.updateLevel();
    }
    this.score += clearPoints * this.level.number;
  }

  updateLevel() {
    if (Levels.length > 0 && this.lines >= this.level.nextLevel) {
      this.level = new Level(this, this.levels.shift());
      this.game.level.text = this.level.number;
    }
  }

  draw() {
    this.currentPos = this.game.drawPiece(this.currentBlock, this.currentPos);
  }

  drawOnce() {
    this.previewBlocks = this.game.drawPreviewPiece(this.previewPiece, this.previewBlocks)
  }
}

Board.blockSize = 28;
Board.numColumns = 10;
Board.numRows = 27;

class BlockGame {
  constructor() {
    this.root = new PIXI.Application(610, 863, {backgroundColor : 0xadd8e6});
    this.background = new PIXI.extras.TilingSprite(Block_Textures[0], this.root.screen.width, this.root.screen.height);
    this.root.stage.addChild(this.background);
    document.getElementById("game").appendChild(this.root.view);
    this.setBoard();
    this.initHud();
    this.running = true;
    this.game_over = false;
    document.body.addEventListener("keydown", e => this.handleKeyDowns(e));
    this.runGame();
  }

  setBoard() {
    this.canvas = new BlockGameCanvas(this.root.stage);
    this.preview_canvas = new BlockGameCanvas(this.root.stage);
    this.board = new Board(this);
    this.canvas.place(Board.blockSize * Board.numRows + 3,
                      Board.blockSize * Board.numColumns + 6, 24, 80);

    this.preview_canvas.place(Board.blockSize * 4 + 3,
                              Board.blockSize * 4 + 3, 335, 200);
    this.board.drawOnce();
  }

  initHud() {
    let fontStyle =  {fontSize: 16,
                      fontFamily: 'segue',
                      fontStyle: 'italic',
                      fontWeight: 'bold',
                      fill: '#ffff00',
                      stroke: '#000000',
                      strokeThickness: 3};

    let label = new PIXI.Text('Current Score: ', fontStyle);
    label.x = 335;
    label.y = 80;
    this.root.stage.addChild(label);
    this.score = new PIXI.Text(this.board.score, fontStyle);
    this.score.x = 446;
    this.score.y = 80;
    this.root.stage.addChild(this.score);

    label = new PIXI.Text('Level: ', fontStyle);
    label.x = 335;
    label.y = 120;
    this.root.stage.addChild(label);
    this.level = new PIXI.Text(this.board.level.number, fontStyle);
    this.level.x = 446;
    this.level.y = 120;
    this.root.stage.addChild(this.level);

    label = new PIXI.Text('Lines: ', fontStyle);
    label.x = 335;
    label.y = 100;
    this.root.stage.addChild(label);
    this.lines = new PIXI.Text(this.board.lines, fontStyle);
    this.lines.x = 446;
    this.lines.y = 100;
    this.root.stage.addChild(this.lines);

    label = new PIXI.Text('Next Piece', fontStyle);
    label.x = 355;
    label.y = 180;
    this.root.stage.addChild(label);

    this.button_new_game = new BlockGameButton(this.root.stage, 24, 20, "images/new_game_button.png", () => this.newGame());
    this.button_pause = new BlockGameButton(this.root.stage, 187, 20, "images/pause_button.png", () => this.pause());

    this.button_left = new BlockGameButton(this.root.stage, 335, 735, "images/left_button.png", () => this.board.moveLeft());
    this.button_right = new BlockGameButton(this.root.stage, 475, 735, "images/right_button.png", () => this.board.moveRight());
    this.button_drop = new BlockGameButton(this.root.stage, 405, 795, "images/drop_button.png", () => this.board.dropAllTheWay());
    this.button_clockwise = new BlockGameButton(this.root.stage, 405, 675, "images/clockwise_button.png", () => this.board.rotateClockwise());
  }

  runGame() {
    if (!this.board.gameOver() && this.running) {
      clearTimeout(this.timer);
      this.timer = setTimeout(() => {this.board.run(); this.runGame();}, this.board.delay);
    }
  }

  handleKeyDowns(e) {
    switch(e.key) {
      case "ArrowUp":
        this.board.rotateClockwise();
        break;
      case " ":
        this.board.dropAllTheWay();
        break;
      case "ArrowDown":
        this.board.dropOne();
        break;
      case "ArrowLeft":
        this.board.moveLeft();
        break;
      case "ArrowRight":
        this.board.moveRight();
        break;
      case "p":
        this.pause();
        break;
      default:
        console.log(e.key);
        break;
    }
  }

  newGame() {
    this.canvas.delete();
    this.setBoard();
    this.running = true;
    this.runGame();
  }

  pause() {
    if (this.running) {
      this.running = false;
      clearTimeout(this.timer);
    } else {
      this.running = true;
      this.runGame();
    }
  }

  updateScore() {
    this.score.text = this.board.score;
    this.lines.text = this.board.lines;
    this.level.text = this.board.level.number;
  }

  drawPiece(piece, old=undefined) {
    if (old && piece.moved) {
      old.forEach(block => block.remove());
    }
    let size = Board.blockSize;
    let blocks = piece.currentRotation;
    return blocks.map(block =>
      new BlockGameRect(this.canvas, piece.x*size + block[0]*size + 3,
                       piece.y*size + block[1]*size, size, size,
                       piece.texture, piece.tint));
  }

  drawPreviewPiece(piece, old=undefined) {
    let size = Board.blockSize;
    let center_piece = (piece) => {
      let height = piece.height * size;
      let width = piece.width * size;
      return [this.preview_canvas.width / 2 - width / 2,
              this.preview_canvas.height / 2 - height / 2];
    }

    function normalize(currentRotation) {
      let minWidth = currentRotation.reduce((acc, b) => b < acc ? b : acc)[0];
      let minHeight = currentRotation.reduce((acc, b) => b[1] < acc ? b[1] : acc, currentRotation[0][1]);
      return currentRotation.map(block => [block[0] - minWidth, block[1] - minHeight]);
    }

    if (old) {
      old.forEach(block => block.remove());
    }

    let blocks = normalize(piece.currentRotation);
    let [x, y] = center_piece(piece);
    return blocks.map(block =>
      new BlockGameRect(this.preview_canvas, x + block[0]*size, y + block[1]*size, size, size, piece.texture, piece.tint));
  }
}

let r = new BlockGame();
