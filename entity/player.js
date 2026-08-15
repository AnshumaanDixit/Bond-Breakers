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
    }
    update() {
        this.handleMove();
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
    }
}