import { ChemInfo } from '../src/chemistry/chemistry.js'
export class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene,x,y,texture,type,health=100,defense=100) {
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
        
        
        this.health = health;
        this.enemytype = type;
        this.valency = ChemInfo[this.enemytype].valence;
        this.charge = ChemInfo[this.enemytype].charge;
        this.defense = defense;
        //^^ made some properties to the enemy, such as health, its element's type and its element's valency

        this.hitbox = scene.add.rectangle(this.x,this.y,100,50,0x0000ff,0);
        scene.physics.add.existing(this.hitbox);
        this.hitbox.body.allowGravity = false;
        this.hitbox.body.enable = false;
        //^^initialized enemy's hitbox, 

        this.isAttacking = false;
        //^^flag for stopping spam of attack, as well as to control enemy's movement when its in attack state.
    }
    takeDmg(atkType)
    {   let dmgDealt = 0;
        let defDealt = 0;
        if(atkType.reactivity > 0 &&  atkType.reactivity>ChemInfo[this.enemytype].reactivity && atkType.name!='Hydrogen') {
            if(ChemInfo[this.enemytype].reactivity!=0) {
                defDealt = 10 + (2*(atkType.reactivity - ChemInfo[this.enemytype].reactivity));
                this.enemytype = atkType.key;
                this.valency = atkType.valence;
                this.charge = atkType.charge;
                }
            //^^the above is the damage logic for displacement reaction, if the attacking is a metal and its reactivity is greater than the one enemy currently has
            else if(atkType.reactivity>=13 && ChemInfo[this.enemytype].pH<=2) {
                dmgDealt -= 800;
            }
            //^^ logic for highly reactive metal reacting with strong acid
        }
        
        
        else if(atkType.reactivity>=13)
        {
            if(ChemInfo[this.enemytype].name=='Water')
                dmgDealt = -500;
            
        }
        //^^the above is damage logic for if enemy type is water and we add a highly reactive metal to it
        
        else if(atkType.name == 'Electron') {
            if(ChemInfo[this.enemytype].name!='Water' && ChemInfo[this.enemytype].name!='Hydrochloric Acid' && ChemInfo[this.enemytype].name!='Sodium Hydroxide') {
                this.valency += 1;
                this.charge -= 1;
            }
            if(this.charge<=-4 || this.valency>=9) {
                dmgDealt = -2147483648;
            }
        }
        //^^if the attack was an electron it increases the valency and decreases charge, if valency is greater than 8 or if charge is lower than -3, then that is unstable condition and the enemy ceases to exist, 
        //^^note: this wont work if the enemy is water type or if enemy is of type strong acid or strong base
        
        
        else if(atkType.name == 'Water' && ChemInfo[this.enemytype].reactivity>=13)
        {
            dmgDealt = -500;
        }
        //^^if the enemy is of highly reactive element, then it would react violently with water, and take heavy damage
        
        else if(atkType.pH <7 || atkType.pH>7) {
            if((ChemInfo[this.enemytype].pH<7 && atkType.pH>7) || (ChemInfo[this.enemytype].pH>7 && atkType.pH<7)) {
                defDealt = -1*this.defense;
            }
            //^^logic for neutralization reaction
            else if(ChemInfo[this.enemytype].name == 'Water') {
                defDealt -= 10;
            }
            //^^logic for if we add strong acid or strong base to water, which results in decreasing or increasing the pH
            else if(atkType.pH<=2 && ChemInfo[this.enemytype].reactivity>=13)
            {
                dmgDealt = -800;
            }
            //^^logic for if we add strong acid to highly reactive metal
            else if(atkType.pH>=13 && (ChemInfo[this.enemytype].name=='Aluminium'||ChemInfo[this.enemytype].name=='Zinc'||ChemInfo[this.enemytype].name=='Lead'))
            {
                dmgDealt -= 30;
                defDealt -= 10;
            }
            //^^logic for corrosion of amphoteric.
            else {
                if(atkType.pH<=2 && ChemInfo[this.enemytype].reactivity>6 && ChemInfo[this.enemytype].reactivity<=12) {
                    defDealt = -20;
                }
            }
            //^^logic for corrosion, if enemy is of metal type and is below sodium in reactivity series but above H
        }
        else if(atkType.name == 'Water' && (ChemInfo[this.enemytype].reactivity<=2 || ChemInfo[this.enemytype].reactivity>=13))
        {
            dmgDealt = -200;  
        }
        //^^logic for if water was added to strong acid or strong base
        
        else {
            dmgDealt = 10
        }
        //^^if the enemy is not attacked with a valid available attack they instead HEAL


        if(defDealt<0)
        {
            this.setTint(0x0000ff);
            this.scene.time.delayedCall(150,()=>{
                if(this.active)
                    this.clearTint();
            })
        }
        else if(defDealt>0)
        {
            this.setTint(0xffffff);
            this.scene.time.delayedCall(150,()=>{
                if(this.active)
                    this.clearTint();
            })
        }
        //^^effect for defense.
        this.defense += defDealt;
        this.defense = this.defense<=0?0:this.defense;
        if(dmgDealt<0) {
            dmgDealt += this.defense;
            dmgDealt = dmgDealt>0?0:dmgDealt;
        }
        if(dmgDealt>0) {
            this.setTint(0x00ff00);
            this.scene.time.delayedCall(150,()=>{
                if(this.active)
                    this.clearTint();
            })
        }
        else if(dmgDealt<0) {
            this.setTint(0xff0000);
            this.scene.time.delayedCall(150, ()=>{
                if(this.active)
                    this.clearTint();
            })
        }
        //^^damage effect logic.

        this.health += dmgDealt;
        if(this.health<=0)
        {
            if(this.hitbox){
                this.hitbox.destroy();
                this.destroy();
            }
        }
        //^^checks of if the health is lower than 0.
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