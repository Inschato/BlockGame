"use strict";

function rotations(point_array) {
    let rotate1 = point_array.map(p => [-p[1], p[0]]);
    let rotate2 = point_array.map(p => [-p[0], -p[1]]);
    let rotate3 = point_array.map(p => [p[1], -p[0]]);
    return [point_array, rotate1, rotate2, rotate3];
  };

let Basic_Pieces = [[[[0, 0], [1, 0], [0, 1], [1, 1]]],  // square (only needs one)
               rotations([[0, 0], [-1, 0], [1, 0], [0, -1]]), // T
               [[[0, 0], [-1, 0], [1, 0], [2, 0]], // long (only needs two)
               [[0, 0], [0, -1], [0, 1], [0, 2]]],
               rotations([[0, 0], [0, -1], [0, 1], [1, 1]]), // L
               rotations([[0, 0], [0, -1], [0, 1], [-1, 1]]), // inverted L
               rotations([[0, 0], [-1, 0], [0, -1], [1, -1]]), // S
               rotations([[0, 0], [1, 0], [0, -1], [-1, -1]])]; // Z

let Block_Textures = [PIXI.Texture.fromImage("images/blocks/block2.png"),
                      PIXI.Texture.fromImage("images/blocks/block1.png"),
                      PIXI.Texture.fromImage("images/blocks/block3.png"),
                      PIXI.Texture.fromImage("images/blocks/block4.png")];

let level1Pieces =
  [{points: Basic_Pieces[0], texture: Block_Textures[0], tint: 0x00FFFF},
   {points: Basic_Pieces[1], texture: Block_Textures[0], tint: 0xD3D3D3},
   {points: Basic_Pieces[2], texture: Block_Textures[2], tint: 0xFF0000},
   {points: Basic_Pieces[3], texture: Block_Textures[1], tint: 0xFFFF00},
   {points: Basic_Pieces[4], texture: Block_Textures[1], tint: 0xFF1493},
   {points: Basic_Pieces[5], texture: Block_Textures[1], tint: 0x0000FF},
   {points: Basic_Pieces[6], texture: Block_Textures[1], tint: 0x00FF00}, ];

let Levels =
  [{pieces: level1Pieces, background: Block_Textures[3], tint: 0xCCDDFF, delay: 500, number: 1, nextLevel: 10},
   {pieces: level1Pieces, background: Block_Textures[2], tint: 0x667799, delay: 400, number: 2, nextLevel: 20},
   {pieces: level1Pieces, background: Block_Textures[1], tint: 0x445577, delay: 300, number: 3, nextLevel: 30},
   {pieces: level1Pieces, background: Block_Textures[0], tint: 0x775544, delay: 250, number: 4, nextLevel: 40},
   {pieces: level1Pieces, background: Block_Textures[0], tint: 0x777744, delay: 220, number: 5, nextLevel: 50},
   {pieces: level1Pieces, background: Block_Textures[0], tint: 0x008800, delay: 180, number: 6, nextLevel: 60},
   {pieces: level1Pieces, background: Block_Textures[0], tint: 0x006666, delay: 150, number: 7, nextLevel: 70},
   {pieces: level1Pieces, background: Block_Textures[0], tint: 0x123456, delay: 120, number: 8, nextLevel: 80},
   {pieces: level1Pieces, background: Block_Textures[3], tint: 0x994444, delay: 100, number: 9, nextLevel: 90},
   {pieces: level1Pieces, background: Block_Textures[2], tint: 0x990000, delay: 80, number: 10},
  ];
