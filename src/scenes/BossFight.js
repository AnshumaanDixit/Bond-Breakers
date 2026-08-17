const GAME_WIDTH = 640;

import { QuizManager } from '../chemistry/QuizManager.js';
import { Level } from '../scenes/start.js';
const COLORS = {
    bg: "#0a0a12",          
    panel: 0x12121c,        
    border: 0x3a3a52,       
    text: "#e0e0e0",
    highlight: "#f7c948",
    playerColors: { core: 0x000000, outline: 0x4da3ff, hp: 0x4caf50 },
    bossColors: { core: 0x1a0505, outline: 0xff4d4d, hp: 0xe53935 }
};

export class StartScene extends Phaser.Scene {
    constructor() { super("StartScene"); }

    create() {
        this.cameras.main.setBackgroundColor(COLORS.bg);

        this.scale.setGameSize(1100, 700);
        
        this.scale.scaleMode = Phaser.Scale.FIT;
        this.scale.autoCenter = Phaser.Scale.CENTER_BOTH;
        this.scale.updateScale(); // Applies the changes instantly

        // Retro JRPG Title
        this.add.text(GAME_WIDTH / 2, 200, "SCIENCE BOSS BATTLE", {
            fontFamily: "Courier New, monospace", fontSize: "48px", color: COLORS.highlight, fontStyle: "bold"
        }).setOrigin(0.5);

        this.add.text(GAME_WIDTH / 2, 260, "Defeat the Knowledge Boss by answering Science questions!", {
            fontFamily: "Courier New", fontSize: "18px", color: COLORS.text
        }).setOrigin(0.5);

        // Styled Button
        const startBtn = this.add.rectangle(GAME_WIDTH / 2, 400, 300, 60, COLORS.panel)
            .setStrokeStyle(3, 0xf7c948)
            .setInteractive({ useHandCursor: true });

        const btnText = this.add.text(GAME_WIDTH / 2, 400, "ENGAGE BATTLE", {
            fontFamily: "Courier New", fontSize: "24px", color: COLORS.highlight, fontStyle: "bold"
        }).setOrigin(0.5);

        startBtn.on("pointerover", () => { startBtn.setFillStyle(0x2a2a3a); });
        startBtn.on("pointerout", () => { startBtn.setFillStyle(COLORS.panel); });
        startBtn.on("pointerdown", () => this.scene.start("BossBattleScene"));
        
    }
}

export class BossBattleScene extends Phaser.Scene {
    constructor() { super("BossBattleScene"); }

    create() {
       

        // 1. Initialize logic
        this.quiz = new QuizManager();
        this.questions = this.quiz.getRandomQuestions(5);
        this.index = 0;

        this.maxBossHP = 100;
        this.maxPlayerHP = 100;
        this.bossHP = 100;
        this.playerHP = 100;
        
        this.combo = 0;
        this.locked = false;

        this.cameras.main.setBackgroundColor(COLORS.bg);

        // 2. Build the RPG Scene
        this.createCharacters();
        this.createUI();
        this.showQuestion();

        this.children.list.forEach(child => {
            if (child.type === 'Text') {
                child.setResolution(3); // 3x density fixes the camera crunch
                child.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
            }
        });
    }

    createCharacters() {
        // PLAYER AVATAR (Glowing JRPG Diamond)
        this.playerSprite = this.add.rectangle(230, 220, 70, 70, COLORS.playerColors.core)
            .setStrokeStyle(4, COLORS.playerColors.outline).setAngle(45);
            
        // Floating idle animation
        this.tweens.add({
            targets: this.playerSprite, y: 210, duration: 1500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
        });

        // BOSS AVATAR (Pulsating Monolith)
        this.bossSprite = this.add.rectangle(870, 220, 100, 140, COLORS.bossColors.core)
            .setStrokeStyle(4, COLORS.bossColors.outline);
            
        this.tweens.add({
            targets: this.bossSprite, scaleX: 1.05, scaleY: 1.05, duration: 2000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
        });

        // VS Text
        this.add.text(550, 220, "VS", { fontFamily: "Courier New", fontSize: "32px", color: "#555555", fontStyle: "bold" }).setOrigin(0.5);
    }

    createUI() {
        // HEALTH BARS
        this.add.text(90, 320, "PLAYER", { fontFamily: "Courier New", fontSize: "16px", color: COLORS.text, fontStyle: "bold" });
        this.playerBarBg = this.add.rectangle(180, 345, 260, 20, 0x000000).setStrokeStyle(2, 0x555555);
        this.playerBar = this.add.rectangle(50, 345, 260, 20, COLORS.playerColors.hp).setOrigin(0, 0.5);

        this.add.text(760, 320, "BOSS", { fontFamily: "Courier New", fontSize: "16px", color: COLORS.text, fontStyle: "bold" });
        this.bossBarBg = this.add.rectangle(870, 345, 260, 20, 0x000000).setStrokeStyle(2, 0x555555);
        this.bossBar = this.add.rectangle(740, 345, 260, 20, COLORS.bossColors.hp).setOrigin(0, 0.5);

        // JRPG DIALOGUE PANEL
        this.add.rectangle(550, 540, 1060, 280, COLORS.panel)
            .setStrokeStyle(4, COLORS.border);

        this.chapterText = this.add.text(40, 420, "", { fontFamily: "Courier New", fontSize: "16px", color: COLORS.highlight });
        
        this.questionText = this.add.text(550, 460, "", {
            fontFamily: "Courier New", fontSize: "20px", color: "#ffffff",
            fontStyle: "bold", align: "center", wordWrap: { width: 980 }
        }).setOrigin(0.5);

        this.feedbackText = this.add.text(550, 390, "", {
            fontFamily: "Courier New", fontSize: "24px", fontStyle: "bold"
        }).setOrigin(0.5);
    }

    showQuestion() {
        // === FIXED WIN/LOSS LOGIC ===
        if (this.bossHP <= 0) return this.finish(true);
        if (this.playerHP <= 0) return this.finish(false);
        // If we ran out of questions and boss is still alive, player loses!
        if (this.index >= this.questions.length) return this.finish(false);

        this.locked = false;
        const q = this.questions[this.index];

        this.chapterText.setText(`[ ${q.chapter} - Q${this.index + 1}/5 ]`);
        this.questionText.setText(q.question);
        this.feedbackText.setText("");

        // Build Option Buttons
        if (this.optionButtons) this.optionButtons.forEach(b => b.destroy());
        this.optionButtons = [];

        const positions = [ [280, 530], [820, 530], [280, 600], [820, 600] ];

        q.options.forEach((option, i) => {
            const [x, y] = positions[i];
            
            const btnBg = this.add.rectangle(x, y, 480, 50, 0x000000)
                .setStrokeStyle(2, COLORS.border)
                .setInteractive({ useHandCursor: true });

            const label = this.add.text(x, y, `${String.fromCharCode(65+i)}. ${option}`, {
                fontFamily: "Courier New", fontSize: "16px", color: COLORS.text, wordWrap: { width: 450 }
            }).setOrigin(0.5);

            btnBg.on("pointerover", () => !this.locked && btnBg.setFillStyle(0x2a2a3a));
            btnBg.on("pointerout", () => !this.locked && btnBg.setFillStyle(0x000000));
            btnBg.on("pointerdown", () => this.answer(i));

            this.optionButtons.push(btnBg, label);
        });
    }

    answer(selected) {
        if (this.locked) return;
        this.locked = true;

        const q = this.questions[this.index];
        const isCorrect = (selected === q.correctAnswer);

        if (isCorrect) {
            this.combo++;
            // Calculate Damage (Combo multiplies damage)
            const damage = 20 + (Math.max(0, this.combo - 1) * 5);
            this.bossHP = Math.max(0, this.bossHP - damage);

            this.feedbackText.setText(`CRITICAL HIT! [${damage} DMG]`).setColor("#00ff00");
            this.attackAnimation(this.playerSprite, this.bossSprite, damage, "#00ff00");
        } else {
            this.combo = 0;
            // Increased Boss damage to 30. (4 wrong answers = Death)
            const damage = 30; 
            this.playerHP = Math.max(0, this.playerHP - damage);

            this.feedbackText.setText(`INCORRECT! BOSS ATTACKS! [${damage} DMG]`).setColor("#ff0000");
            this.attackAnimation(this.bossSprite, this.playerSprite, damage, "#ff0000");
        }

        this.updateBars();

        // Use delayedCall to move to the next question cleanly
        this.time.delayedCall(1500, () => {
            this.index++;
            this.showQuestion();
        });
    }

    attackAnimation(attacker, target, damage, color) {
        // Lunge forward
        this.tweens.add({
            targets: attacker,
            x: attacker.x + (attacker.x < 500 ? 50 : -50),
            duration: 150,
            yoyo: true,
            ease: "Power2"
        });

        // Flash target and shake
        this.time.delayedCall(150, () => {
            // Spawn floating damage text
            const dmgText = this.add.text(target.x, target.y - 40, `-${damage}`, {
                fontFamily: "Courier New", fontSize: "36px", color: color, fontStyle: "bold"
            }).setOrigin(0.5);

            this.tweens.add({ targets: dmgText, y: target.y - 100, alpha: 0, duration: 800, onComplete: () => dmgText.destroy() });
            
            // Camera shake for impact!
            this.cameras.main.shake(200, 0.01);
        });
    }

    updateBars() {
        // Animate health bar reduction smoothly
        this.tweens.add({
            targets: this.playerBar,
            width: 260 * (this.playerHP / this.maxPlayerHP),
            duration: 300
        });

        this.tweens.add({
            targets: this.bossBar,
            width: 260 * (this.bossHP / this.maxBossHP),
            duration: 300
        });
    }

    finish(won) {
        this.scene.start("ResultScene", { won: won });
    }
}

export class ResultScene extends Phaser.Scene {
    constructor() { super("ResultScene"); }

    create(data) {

        this.cameras.main.setBackgroundColor(COLORS.bg);

        const title = data.won ? "VICTORY ACHIEVED" : "SYSTEM FAILURE";
        const color = data.won ? "#00ff00" : "#ff0000";
        const subtitle = data.won ? "The Knowledge Boss was neutralized." : "You were defeated. Study and try again.";

        this.add.text(GAME_WIDTH/2, 250, title, {
            fontFamily: "Courier New", fontSize: "52px", color: color, fontStyle: "bold"
        }).setOrigin(0.5);

        this.add.text(GAME_WIDTH/2, 320, subtitle, {
            fontFamily: "Courier New", fontSize: "20px", color: COLORS.text 
        }).setOrigin(0.5);

        const btn = this.add.rectangle(GAME_WIDTH/2, 450, 260, 60, COLORS.panel)
            .setStrokeStyle(3, color)
            .setInteractive({ useHandCursor: true });

        this.add.text(GAME_WIDTH/2, 450, "REBOOT SYSTEM", {
            fontFamily: "Courier New", fontSize: "24px", color: color, fontStyle: "bold"
        }).setOrigin(0.5);

        btn.on("pointerdown", () => this.scene.start('Start'));

    }
}