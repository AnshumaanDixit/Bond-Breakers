export class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene,x,y,texture) {
        super(scene,x,y,texture);
        //^^ initialized scene,x,y,texture to parent class ready for further making
        scene.add.existing(this);
        scene.physics.add.existing(this);
        //^^ added the scene with player and made sure it is affected by the physics

        this.body.allowGravity = false;
        this.setCollideWorldBounds(true);
        //^^ made sure the body is not affected by gravity, and made sure the object collides with world borders.

        this.cursors = scene.input.keyboard.createCursorKeys();
        //^^ this.cursor refers to 

        this.touchLeft = false;
        this.touchRight = false;
        //^^ initialized logic for onscreen button movements.

        this.health = 100;
        this.isStaggered = false;
        this.isAttacking = false;

        this.hitbox = scene.add.rectangle(this.x,this.y,125,75,0xff0000,0);
        scene.physics.add.existing(this.hitbox);
        this.hitbox.body.allowGravity = false;
        this.hitbox.body.enable = false;
        //^^initialize a hitbox at the player's location,of width 125 and height 75, of #ff0000 color, and 0.5 opacity.
        //^^the hitbox has no gravity and is initially disabled.
    }
    attack(type) {
        if(this.isAttacking || this.isStaggered) 
            return;
        //^^this means if attack is triggered within 200ms of its prev activation, this means attack is being spammed.
        this.isAttacking = true;
        this.setVelocityX(0);
        //^^set attacking to true and velocity to 0 to make sure the player dosent move while attacking

        this.hitbox.currentElement = type;
        this.hitbox.body.enable = true;
        this.scene.time.delayedCall(200,()=>{
            this.hitbox.body.enable = false;
            this.isAttacking = false;
        })
        //^^the attack logic, checks for if the attack is pressed, and if it is comes here to enable hitbox, and disable it by a delay function, disabling it after 200ms
        //^^also storing the type of attack in the hitbox itself
    }
    update() {
        this.handleMove();
        this.handleHitbox();
        //^^ contains the function that must be run each frame.
    }
    handleMove() {
        if(this.isStaggered || this.isAttacking)
        {
            this.setVelocityX(0);
            return;
        }
        this.setVelocityX(0);
        if(this.touchLeft || this.cursors.left.isDown)
        {
            this.setFlipX(true);
            this.setVelocityX(-320);
        }
        else if(this.touchRight || this.cursors.right.isDown)
        {
            this.setFlipX(false);
            this.setVelocityX(320);
        }
        else {

        }
        //^^logic for moving the player, whether by touch screen or weather by keyboard
    }
    handleHitbox() {
        const offsetX = this.flipX ? -30:30;
        this.hitbox.setPosition(this.x+offsetX,this.y+32);
        //^^needed to keep the hitbox at player's location, this runs 60times a second to make sure the hitbox is at its place where it should be.
    }
}