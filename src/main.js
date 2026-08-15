import { Menu } from './scenes/start.js';
const config = {
    type: Phaser.AUTO,
    title: 'Bond Breakers',
    description: '',
    parent: 'game-container',
    width: 640,
    height: 360,
    backgroundColor: '#000000',
    pixelArt: false,
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

new Phaser.Game(config);
            