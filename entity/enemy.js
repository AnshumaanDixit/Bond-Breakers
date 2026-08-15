export class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene,x,y,texture,type,weakness) {
        super(scene,x,y,texture);
        scene.add.existing(this);
        scene.physics.add.existing(this);
        //^^added the enemy to scene, and initialized it using its parent class
        
        
        this.scene = scene;
        this.body.allowGravity = false;
        this.setCollideWorldBounds(true);
        //^^this is to make sure the enemy is on same level as player


        this.setImmovable(true);
        this.setPushable(false);
        //^^make sure enemy is immovable and not pushable
        
        
        this.health = 100;
        this.enemytype = type;
        this.weakness = weakness;
        //^^ made some properties to the enemy, such as health, weakness and type

        this.hitbox = scene.add.rectangle(this.x,this.y,100,50,0x0000ff,0);
        scene.physics.add.existing(this.hitbox);
        this.hitbox.body.allowGravity = false;
        this.hitbox.body.enable = false;
        //^^initialized enemy's hitbox, 

        this.isAttacking = false;
        //^^flag for stopping spam of attack, as well as to control enemy's movement when its in attack state.
    }
    takeDmg(element)
    {
        if(this.weakness==element){
            this.health-=10;
            if(this.health<=0){
                this.destroy();
                this.hitbox.destroy();
            }
            else {
                this.setTint(0xff0000);
                this.scene.time.delayedCall(150,()=>{
                    if(this.active)
                        this.clearTint();
                });
            }
        }
        //^^the above is the damage logic for enemy, if its weakness is same as what the player attacked it with, then it takes damage.
        else {
            this.health+=10;
            this.setTint(0x00ff00);
            this.scene.time.delayedCall(150,()=>{
                if(this.active)
                    this.clearTint();
            })
        }
        //^^the above is if the element the enemy is attacked with is not its weakness
    }
    updateHitbox() {
        this.hitbox.setPosition(this.x,this.y);
        //^^to update the hitbox
    }
    attack() {
        if(this.isAttacking) {
            return;
        }
        //^^ again this is to stop spam from being called immediately essentially stopping hyper speed attacks.
        this.isAttacking = true;
        //^^set attacking to true, this will first of all stop attack from being called again, and as well as this will also help further when animations are done
        this.hitbox.body.enable = true;
        //^^set hitbox to true so overlap can occur and player can take damage
        this.scene.time.delayedCall(200, ()=>{
            if(this.active){
            this.hitbox.body.enable = false;
            this.scene.time.delayedCall(1000,()=>{
                this.isAttacking = false;
            })
        }
    });
    //^^the above is for disabling the hitbox after damage is also to add a delay between attacking of the enemy, enemy will only attack once every second
}
    checkForPlayer() {
        const player = this.scene.player;
        const dist = Phaser.Math.Distance.Between(this.x,this.y,player.x,player.y);
        if(dist<100 && dist>50)
        {
            if(this.x>player.x)
                this.setVelocityX(-100);
        }
        else if(dist<=50)
        {
            this.setVelocityX(0);
            this.attack();
        }
        else {
            this.setVelocityX(0);
        }
        //^^the above is the movement logic for the enemy AI moving towards the player if they are close to 100px to them, and attacking them if under 50px.
    }
    update() {
        this.updateHitbox();
        this.checkForPlayer();
    }

}