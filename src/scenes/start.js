import { Player } from '../../entity/player.js'
export class Menu extends Phaser.Scene {
    constructor() {
        super('Start');
        //^^ initializer for parent class to initialize the scene
        this.dropdown = false;
    }
    preload() {
        this.load.image('bg', 'assets/background.png');
        this.load.spritesheet('idle','assets/Idle_dummy.png',{frameWidth: 45, frameHeight:128});
        //^^load the spritesheet for player as well as background image, a sprite sheet is a image which has all the sprite images, we can control it with framewidth and frameheight, and further with .setframe
        this.load.image('left','assets/left.png');
        this.load.image('right','assets/right.png');
        this.load.image('atk','assets/attack.png');
    }
    create() {
        this.physics.world.setBounds(0,0,2560,360);
        this.background = this.add.image(0,0, 'bg').setOrigin(0,0);
        //^^set the world boundary in physics.world and add the image and name it to this.background, with its origin set to 0,0
        this.player = new Player(this,100,275,'idle');
        //^^create new player, 'this' refers to this scene, next two are the horizontal and vertical position of the player, and 'idle' is its image.
        this.player.setFrame(0);
        this.player.setDepth(100);
        //^^next we setframe as we told above for spritesheet mechanic, starting with setframe(0) next we setdepth so the player is always on top
        this.cameras.main.setBounds(-100,0,2660 + (34*3),360);
        //^^further increased the width so that the right side's attack buttons are also not ran over by the player, btw each attack button is a square of 34px
        //^^here the format is (x,y, width of level, height of level) here the x origin is -100 because of how the buttons are placed, there are two buttons, each of width 50px camera is allowed to move past 100px origin so player dosent walk into buttons, and for that reason we need the width to be set to 2660 so it corresponds with border at 2560 and not 2460
        //^^set the camera's bounds so it dosent go out the world boundary
        this.cameras.main.startFollow(this.player,true,0.05,0.05);
        //^^setup so camera follows the player
        const leftBtn = this.add.sprite(25, 345, 'left').setInteractive().setScrollFactor(0);
        const rightBtn = this.add.sprite(75,345, 'right').setInteractive().setScrollFactor(0);
        //^^adding left and right buttons as sprites, which will be interactive with .setInteractive() and will not be affected by camera movement by .setScrollFactor(0)
        leftBtn.on('pointerdown',()=> {this.player.touchLeft = true;});
        leftBtn.on('pointerup',()=>{this.player.touchLeft = false;});
        leftBtn.on('pointerout',()=>{this.player.touchLeft = false;});
        rightBtn.on('pointerdown',()=>{this.player.touchRight = true;});
        rightBtn.on('pointerup',()=>{this.player.touchRight = false;});
        rightBtn.on('pointerout',()=>{this.player.touchRight = false;});
        //^^ 'pointerdown' 'pointerup' 'pointerout' are all strings that are strings returned by setinteractive() on actions 'clicked the sprite', 'clicked off the sprite', 'clicked the sprite and dragged off the screen' respectively.
        //^^ ()=>{} is a form of lamda function in js
        this.atk = this.add.sprite(600,345,'atk').setInteractive().setScrollFactor(0);
        this.activeAtkIndex = 0;
        this.elements = ['water','hydrogen','oxygen','fe','na','s'];
        this.textureFile = {
            water: 'atk',
            hydrogen: 'assets/attack.png',
            oxygen: 'assets/attack.png',
            fe: 'assets/attack.png',
            na: 'assets/attack.png',
            s: 'assets/attack.png'
        }
        //^^ made attack button and added them to the screen
        this.atk.setScale(1.5,1.5);
    }
    updateAtkButton() {
        if(this.activeAtkIndex<5)
            this.atk.setTexture(this.textureFile[this.elements[this.activeAtkIndex++]]);
        else {
            this.atk.setTexture(this.textureFile[this.elements[0]]);
            this.activeAtkIndex = 0;
        }
    }
    update(){
        this.player.update();
        this.updateAtkButton();
    }
}
