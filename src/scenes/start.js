import { Player } from '../../entity/player.js'
import { Enemy } from '../../entity/enemy.js'
import { ChemInfo } from '../chemistry/chemistry.js'
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
        const enemy1 = new Enemy(this,300,275,'idle','k');
        enemy1.setFlipX(true);
        enemy1.setDepth(100);
        //^^made enemy with 'fe' element and weakness 'water'
        const enemy2 = new Enemy(this,700,275,'idle','na');
        enemy2.setFlipX(true);
        enemy2.setDepth(100);
        const enemy3 = new Enemy(this,1100,275,'idle','pt');
        enemy3.setFlipX(true);
        enemy3.setDepth(100);
        const enemy4 = new Enemy(this,1500,275,'idle','ag');
        enemy4.setFlipX(true);
        enemy4.setDepth(100);
        //^^made more enemies
        
        
        this.enemies = this.physics.add.group({classType: Enemy, runChildUpdate: true});
        this.enemies.add(enemy1);
        this.enemies.add(enemy2);
        this.enemies.add(enemy3);
        this.enemies.add(enemy4);
        //^^added enemies and added them to a group for easier hitbox collision checking

        this.enemyHitboxes = this.physics.add.group();
        this.enemyHitboxes.add(enemy1.hitbox);
        this.enemyHitboxes.add(enemy2.hitbox);
        this.enemyHitboxes.add(enemy3.hitbox);
        this.enemyHitboxes.add(enemy4.hitbox);
        //^^set the enemy's hitbox into a group, for overlap when enemy attacks the player
        
        
        this.physics.world.setBounds(0,0,2560,360);
        this.background = this.add.image(0,0, 'bg').setOrigin(0,0);
        //^^set the world boundary in physics.world and add the image and name it to this.background, with its origin set to 0,0
        
        this.player = new Player(this,100,275,'idle');
        //^^create new player, 'this' refers to this scene, next two are the horizontal and vertical position of the player, and 'idle' is its image.
        
        
        this.player.setFrame(0);
        this.player.setDepth(100);
        //^^next we setframe as we told above for spritesheet mechanic, starting with setframe(0) next we setdepth so the player is always on top
        
        
        this.cameras.main.setBounds(-175,0,2735 + (34*3),360);
        //^^further increased the width so that the right side's attack buttons are also not ran over by the player, btw each attack button is a square of 34px
        //^^here the format is (x,y, width of level, height of level) here the x origin is -100 because of how the buttons are placed, there are two buttons, each of width 50px camera is allowed to move past 100px origin so player dosent walk into buttons, and for that reason we need the width to be set to 2660 so it corresponds with border at 2560 and not 2460
        //^^set the camera's bounds so it dosent go out the world boundary
        
        
        this.cameras.main.startFollow(this.player,true,0.05,0.05);
        //^^setup so camera follows the player
        
        
        const leftBtn = this.add.sprite(45, 300, 'left').setInteractive().setScrollFactor(0);
        const rightBtn = this.add.sprite(130,300, 'right').setInteractive().setScrollFactor(0);
        leftBtn.setScale(1.5);
        rightBtn.setScale(1.5);
        //^^adding left and right buttons as sprites, which will be interactive with .setInteractive() and will not be affected by camera movement by .setScrollFactor(0)
        
        
        leftBtn.on('pointerdown',()=> {this.player.touchLeft = true;});
        leftBtn.on('pointerup',()=>{this.player.touchLeft = false;});
        leftBtn.on('pointerout',()=>{this.player.touchLeft = false;});
        rightBtn.on('pointerdown',()=>{this.player.touchRight = true;});
        rightBtn.on('pointerup',()=>{this.player.touchRight = false;});
        rightBtn.on('pointerout',()=>{this.player.touchRight = false;});
        //^^ 'pointerdown' 'pointerup' 'pointerout' are all strings that are strings returned by setinteractive() on actions 'clicked the sprite', 'clicked off the sprite', 'clicked the sprite and dragged off the screen' respectively.
        //^^ ()=>{} is a form of lamda function in js

        this.atk = this.add.sprite(600,320,'atk').setInteractive().setScrollFactor(0);
        this.atk.setScale(1.5);
        this.activeAtkIndex = 0;
        this.elements = ['k','na','ca','mg','al','zn','fe','pb','h','cu','hg','ag','au','pt','water','hcl','naoh','e'];
        this.textureFile = {
            'k' : 'atk',
            'na' : 'atk',
            'ca' : 'atk',
            'mg' : 'atk',
            'al' : 'atk',
            'zn' : 'atk',
            'fe' : 'atk',
            'pb' : 'atk',
            'h' : 'atk',
            'cu' : 'atk',
            'hg' : 'atk',
            'ag' : 'atk',
            'au' : 'atk',
            'pt' : 'atk',
            'water' : '',
            'hcl' : 'atk',
            'naoh' : 'atk',
            'e' : ''
        }
        //^^ made attack button and added them to the screen
        //^^contains logic to make more buttons and elemental attacks
        
        
        const leftAtkChangeBtn = this.add.sprite(575,265,'atk').setInteractive().setScrollFactor(0);
        leftAtkChangeBtn.setScale(0.8);
        const rightAtkChangeBtn = this.add.sprite(620,265,'atk').setInteractive().setScrollFactor(0);
        rightAtkChangeBtn.setScale(0.8);
        //^^logic to change the active attack button, making the buttons first
        
        
        leftAtkChangeBtn.on('pointerdown',()=>{
            if(this.activeAtkIndex==0)
                this.activeAtkIndex = this.elements.length-1;
            else
                this.activeAtkIndex -= 1;
            this.updateAtkButton();
            
        })
        rightAtkChangeBtn.on('pointerdown',()=>{
            this.activeAtkIndex = (this.activeAtkIndex+1)%this.elements.length;
            this.updateAtkButton();
        })
        //^^actual logic for changing the attack button, we are just changing the attack index and the texture of the button
        
        
        this.atk.on('pointerdown',()=>{
            this.player.attack(ChemInfo[this.elements[this.activeAtkIndex]]);
        })
        //^^ this is what i mentioned in the player class, the attack function, sets hitbox to enable and passes attack type to it which then is assigned on the hitbox.
        
        
        this.physics.add.overlap(this.player.hitbox,this.enemies,this.attacked,null,this);
        //^^ listener for collisions between hitbox and enemies inside the this.enemies group, and runs this.attacked if any of them collide as well as passing the hitbox and enemy object into that function it calls.

        this.physics.add.collider(this.player,this.enemies);
        //^^collides the player and enemy so player is unable to advance untill he kills the enemy
    
        this.physics.add.overlap(this.player,this.enemyHitboxes,this.playerAttacked,null,this);
        //^^overlap to check for enemy hitting the player
        let playerHealth = 'Health:'+this.player.health;
        this.playerHud = this.add.text(this.player.x,this.player.y,playerHealth,{
            fontFamily: 'Arial',
            fontSize: '8px',
            fill: '#ffffff',
            backgroundColor: '#000000',
            padding: {x:4,y:2}
             }).setOrigin(0.5).setDepth(100);
    }
    updateAtkButton() {
            this.atk.setTexture(this.textureFile[this.elements[this.activeAtkIndex]]);
            //^^actually changing the texture of the active attack button.
    }
    playerAttacked(player, enemyHitbox) {
        if(enemyHitbox.body.enable==true){
            enemyHitbox.body.enable = false;
            this.player.health-=10;
            player.setTint(0xff0000);
            this.time.delayedCall(150,()=>{
                player.clearTint();
            })
        }
        //^^here if player is attacked, since player will never be destroyed as of right now, theres no need to check for active
        //^^add a blue tint to the player if they are attacked, and clear it after 150ms
        //^^also check if hitboxbody is true, this is a special case related to how physics.add.group handles overlaps, we dont check for hitbox true, it will call the function playerattack and if any enemy overlaps with it, for eg, if multiple enemy are at player, then they both will attack him at the same time if collided.
    }
    attacked(hitbox,enemy) {
        if(hitbox.body.enable == true) {
            enemy.takeDmg(hitbox.currentElement);
            hitbox.body.enable = false;
        }
        //^^logic for attack, if collision happen, from the above overlap method, this is main here.
        //^^this connects our player's attacking back to the enemy in case enemy is hit.
        //^^takeDmg() is a function in enemy, 
        //^^here we have to check if body is true otherwise player will attack all the other enemies if they are in his range, though this can be intentional, right now it is not.
    }
    updatePlayerHUD() {
        let playerHealth = 'Health:'+this.player.health;
        this.playerHud.setPosition(this.player.x,this.player.y-5);
        this.playerHud.setText(playerHealth);
    }
    update(){
        this.player.update();
        this.updatePlayerHUD();
        //^^updating the player for movement each frame
    }
}
