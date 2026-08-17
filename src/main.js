import { Menu } from './scenes/start.js';
const screenRatio = window.innerWidth/window.innerHeight;
const dynamicWidth = 360*screenRatio;
//^^ calculate the width based on the divice the users playing on so the image fits
const config = {
    type: Phaser.AUTO,
    title: 'Bond Breakers',
    description: '',
    parent: 'game-container',
    width: 640,
    height: 360,
    backgroundColor: '#000000',
    pixelArt: true,
    roundPixels: true,
    input: {
        activePointer:3,
    },
    scene: [
        Menu
    ],
    physics: {
        default: 'arcade',
        arcade: {debuf:false},
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
}

const game = new Phaser.Game(config);         