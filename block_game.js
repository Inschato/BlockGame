"use strict";
function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min) ) + min;
}

class Piece {
  constructor(point_array, color, board) {    
    this.all_rotations = point_array;
    this.rotation_index = getRndInteger(0, this.all_rotations.length);
    this.color = color;
    this.position = [5, 0];
    this.board = board;
    this.moved = true;
  }
  
  currentRotation() {
    return this.all_rotations[this.rotation_index];
  }
  
  height() {
    return this.currentRotation().map(b=>b[1]).filter((v, i, self) => self.indexOf(v) === i).length;
  }
  
  width() {
    return this.currentRotation().map(b=>b[0]).filter((v, i, self) => self.indexOf(v) === i).length;
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
    
    if (moved) {
      this.position[0] += delta_x;
      this.position[1] += delta_y;
      this.rotation_index = (this.rotation_index + delta_rotation) % this.all_rotations.length;
    }    
    return moved;
  }
  
  static rotations(point_array) {
    let rotate1 = point_array.map(p => [-p[1], p[0]]);
    let rotate2 = point_array.map(p => [-p[0], -p[1]]);
    let rotate3 = point_array.map(p => [p[1], -p[0]]);
    return [point_array, rotate1, rotate2, rotate3];
  }
  
  static nextPiece(board) {
    let i = getRndInteger(0, Piece.All_Pieces.length)
    return new Piece(Piece.All_Pieces[i], Piece.All_Colors[i], board);
  }
}

Piece.All_Pieces = [[[[0, 0], [1, 0], [0, 1], [1, 1]]],  // square (only needs one)
               Piece.rotations([[0, 0], [-1, 0], [1, 0], [0, -1]]), // T
               [[[0, 0], [-1, 0], [1, 0], [2, 0]], // long (only needs two)
               [[0, 0], [0, -1], [0, 1], [0, 2]]],
               Piece.rotations([[0, 0], [0, -1], [0, 1], [1, 1]]), // L
               Piece.rotations([[0, 0], [0, -1], [0, 1], [-1, 1]]), // inverted L
               Piece.rotations([[0, 0], [-1, 0], [0, -1], [1, -1]]), // S
               Piece.rotations([[0, 0], [1, 0], [0, -1], [-1, -1]])]; // Z
               
Piece.All_Colors = [0x00FFFF, 0xD3D3D3, 0xFF0000, 0xFFFF00, 0xFF1493, 0x0000FF, 0x00FF00];

class Board {
  constructor(game) {
    this.grid = [];
    for(let i = 0; i < Board.numRows; i++) {
      let row = [];
      for(let j = 0; j < Board.numColumns; j++) {
        row.push(undefined);
      }
      this.grid.push(row);
    }
    this.currentBlock = Piece.nextPiece(this);
    this.previewPiece = Piece.nextPiece(this);
    this.score = 0;
    this.lines = 0;
    this.pieces = 0;
    this.game = game;
    this.delay = 500;
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
    this.previewPiece = Piece.nextPiece(this);
    this.drawOnce();
    this.currentPos = undefined;
    this.pieces++;
  }
  
  storeCurrent() {    
    let locations = this.currentBlock.currentRotation();    
    let displacement = this.currentBlock.position;    
    for (let i in locations) {
      let current = locations[i];
      this.grid[current[1] + displacement[1]][current[0] + displacement[0]] =
        this.currentPos[i];
    }    
    this.removeFilled();
    this.delay = this.delay - 2 < 80 ? 80 : this.delay - 2;
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
        this.score += 10;
        this.lines += 1;        
      }
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
    this.root = new PIXI.Application(610, 900, {backgroundColor : 0xadd8e6});
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
    let label = new PIXI.Text('Current Score: ', {fontSize: 12});
    label.x = 335;
    label.y = 145;
    this.root.stage.addChild(label);
    this.score = new PIXI.Text(this.board.score, {fontSize: 12});
    this.score.x = 426;
    this.score.y = 145;
    this.root.stage.addChild(this.score);
    
    label = new PIXI.Text('Next Piece', {fontSize: 16});
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
  }
  
  drawPiece(piece, old=undefined) {
    if (old && piece.moved) {
      old.forEach(block=>block.remove());
    }
    let size = Board.blockSize;
    let blocks = piece.currentRotation();
    let start = piece.position;
    return blocks.map(block => 
      new BlockGameRect(this.canvas, start[0]*size + block[0]*size + 3, 
                       start[1]*size + block[1]*size, size, size,
                       piece.color));
  }
  
  drawPreviewPiece(piece, old=undefined) {
    let size = Board.blockSize;
    let center_piece = (piece) => {
      let height = piece.height() * size;
      let width = piece.width() * size;
      return [this.preview_canvas.width / 2 - width / 2,
              this.preview_canvas.height / 2 - height / 2];
    }
    
    function normalize(currentRotation) {
      let minWidth = currentRotation.reduce((acc, b) => b < acc ? b : acc)[0];
      let minHeight = currentRotation.reduce((acc, b) => b[1] < acc ? b[1] : acc, currentRotation[0][1]);      
      return currentRotation.map(block=> [block[0] - minWidth, block[1] - minHeight]);
    }
    
    if (old) {
      old.forEach(block=>block.remove());
    }
    
    let blocks = normalize(piece.currentRotation());   
    let start = center_piece(piece);    
    return blocks.map(block => 
      new BlockGameRect(this.preview_canvas, start[0] +block[0]*size, start[1] + block[1]*size, size, size, piece.color));
  }
}

let r = new BlockGame();
