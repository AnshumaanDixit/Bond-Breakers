const GAME_WIDTH = 1100;
const GAME_HEIGHT = 700;

class StartScene extends Phaser.Scene {
    constructor() { super("StartScene"); }

    create() {
        this.cameras.main.setBackgroundColor("#08111f");

        this.add.text(GAME_WIDTH / 2, 135, "SCIENCE BOSS BATTLE", {
            fontFamily: "Arial", fontSize: "48px", color: "#f7c948",
            fontStyle: "bold"
        }).setOrigin(0.5);

        this.add.text(GAME_WIDTH / 2, 205,
            "Defeat the Knowledge Boss by answering Science questions!",
            { fontFamily: "Arial", fontSize: "22px", color: "#dbe7f5" }
        ).setOrigin(0.5);

        const start = this.add.rectangle(GAME_WIDTH/2, 360, 270, 75, 0xf7c948)
            .setInteractive({ useHandCursor: true });

        this.add.text(GAME_WIDTH/2, 360, "START BATTLE", {
            fontFamily: "Arial", fontSize: "26px", color: "#08111f",
            fontStyle: "bold"
        }).setOrigin(0.5);

        start.on("pointerover", () => start.setFillStyle(0xffd866));
        start.on("pointerout", () => start.setFillStyle(0xf7c948));
        start.on("pointerdown", () => this.scene.start("BossBattleScene"));
    }
}

class BossBattleScene extends Phaser.Scene {
    constructor() { super("BossBattleScene"); }

    create() {
        this.quiz = new QuizManager();
        this.questions = this.quiz.getRandomQuestions(5);
        this.index = 0;

        this.maxBossHP = 100;
        this.maxPlayerHP = 100;
        this.bossHP = 100;
        this.playerHP = 100;
        this.score = 0;
        this.correct = 0;
        this.combo = 0;
        this.bestCombo = 0;
        this.locked = false;

        this.cameras.main.setBackgroundColor("#0b1627");

        this.createStaticUI();
        this.createCharacters();
        this.showQuestion();
    }

    createStaticUI() {
        this.add.text(35, 25, "⚗ SCIENCE BOSS BATTLE", {
            fontFamily: "Arial", fontSize: "28px", color: "#f7c948",
            fontStyle: "bold"
        });

        this.scoreText = this.add.text(780, 30, "Score: 0", {
            fontFamily: "Arial", fontSize: "20px", color: "#ffffff"
        });
        this.comboText = this.add.text(940, 30, "Combo: 0", {
            fontFamily: "Arial", fontSize: "20px", color: "#7ee787"
        });

        this.questionNoText = this.add.text(35, 85, "", {
            fontFamily: "Arial", fontSize: "18px", color: "#9fb3c8"
        });

        this.chapterText = this.add.text(35, 112, "", {
            fontFamily: "Arial", fontSize: "17px", color: "#7dd3fc"
        });

        this.add.rectangle(550, 465, 1010, 260, 0x142238)
            .setStrokeStyle(2, 0x304766);

        this.feedbackText = this.add.text(550, 405, "", {
            fontFamily: "Arial", fontSize: "22px", color: "#f7c948",
            fontStyle: "bold", align: "center"
        }).setOrigin(0.5);

        this.questionText = this.add.text(550, 450, "", {
            fontFamily: "Arial", fontSize: "23px", color: "#ffffff",
            fontStyle: "bold", align: "center", wordWrap: { width: 900 }
        }).setOrigin(0.5);

        this.timerText = this.add.text(550, 620, "", {
            fontFamily: "Arial", fontSize: "19px", color: "#f7c948",
            fontStyle: "bold"
        }).setOrigin(0.5);
    }

    createCharacters() {
        // Lightweight vector-style characters, so no external image assets are required.
        this.playerBody = this.add.circle(230, 245, 65, 0x4da3ff);
        this.add.text(230, 245, "🧑‍🔬", { fontSize: "70px" }).setOrigin(0.5);
        this.add.text(230, 330, "PLAYER", {
            fontFamily: "Arial", fontSize: "20px", color: "#ffffff", fontStyle: "bold"
        }).setOrigin(0.5);

        this.bossBody = this.add.circle(870, 235, 85, 0xd94b4b);
        this.bossEmoji = this.add.text(870, 235, "👹", { fontSize: "90px" }).setOrigin(0.5);
        this.add.text(870, 340, "KNOWLEDGE BOSS", {
            fontFamily: "Arial", fontSize: "20px", color: "#ffffff", fontStyle: "bold"
        }).setOrigin(0.5);

        this.add.text(550, 260, "VS", {
            fontFamily: "Arial", fontSize: "30px", color: "#f7c948", fontStyle: "bold"
        }).setOrigin(0.5);

        this.add.text(90, 365, "PLAYER HP", {
            fontFamily: "Arial", fontSize: "16px", color: "#9fb3c8"
        });
        this.playerBarBg = this.add.rectangle(180, 390, 260, 18, 0x26384f);
        this.playerBar = this.add.rectangle(180, 390, 260, 18, 0x55d66b);

        this.add.text(760, 365, "BOSS HP", {
            fontFamily: "Arial", fontSize: "16px", color: "#9fb3c8"
        });
        this.bossBarBg = this.add.rectangle(870, 390, 260, 18, 0x26384f);
        this.bossBar = this.add.rectangle(870, 390, 260, 18, 0xef5350);

        this.playerHPText = this.add.text(180, 410, "100 / 100", {
            fontFamily: "Arial", fontSize: "15px", color: "#ffffff"
        }).setOrigin(0.5);

        this.bossHPText = this.add.text(870, 410, "100 / 100", {
            fontFamily: "Arial", fontSize: "15px", color: "#ffffff"
        }).setOrigin(0.5);
    }

    showQuestion() {
        if (this.bossHP <= 0) return this.finish(true);
        if (this.playerHP <= 0) return this.finish(false);
        if (this.index >= this.questions.length) return this.finish(this.bossHP < this.maxBossHP);

        this.locked = false;
        const q = this.questions[this.index];

        this.questionNoText.setText(`Question ${this.index + 1} / ${this.questions.length}`);
        this.chapterText.setText(q.chapter);
        this.questionText.setText(q.question);
        this.feedbackText.setText("");

        if (this.optionButtons) this.optionButtons.forEach(b => b.destroy());
        this.optionButtons = [];

        const positions = [
            [300, 535], [800, 535], [300, 585], [800, 585]
        ];

        q.options.forEach((option, i) => {
            const [x, y] = positions[i];
            const bg = this.add.rectangle(x, y, 430, 40, 0x263a55)
                .setInteractive({ useHandCursor: true });

            const label = this.add.text(x - 195, y, `${String.fromCharCode(65+i)}. ${option}`, {
                fontFamily: "Arial", fontSize: "16px", color: "#ffffff",
                wordWrap: { width: 390 }
            }).setOrigin(0, 0.5);

            bg.on("pointerover", () => !this.locked && bg.setFillStyle(0x345274));
            bg.on("pointerout", () => !this.locked && bg.setFillStyle(0x263a55));
            bg.on("pointerdown", () => this.answer(i));

            this.optionButtons.push(bg, label);
        });

        this.timeLeft = 15;
        this.timerText.setText(`Time: ${this.timeLeft}s`);

        this.timeEvent = this.time.addEvent({
            delay: 1000,
            repeat: 14,
            callback: () => {
                if (this.locked) return;
                this.timeLeft--;
                this.timerText.setText(`Time: ${this.timeLeft}s`);
                if (this.timeLeft <= 0) this.answer(-1);
            }
        });
    }

    answer(selected) {
        if (this.locked) return;
        this.locked = true;
        if (this.timeEvent) this.timeEvent.remove(false);

        const q = this.questions[this.index];
        const correct = selected === q.correctAnswer;

        if (correct) {
            this.correct++;
            this.combo++;
            this.bestCombo = Math.max(this.bestCombo, this.combo);

            const damage = 20 + Math.max(0, this.combo - 1) * 2;
            this.bossHP = Math.max(0, this.bossHP - damage);
            this.score += 100 + this.combo * 10;

            this.feedbackText.setColor("#7ee787");
            this.feedbackText.setText(`✓ CORRECT!  Boss takes ${damage} damage!`);
            this.attackBoss(damage);
        } else {
            this.combo = 0;
            this.playerHP = Math.max(0, this.playerHP - 15);

            this.feedbackText.setColor("#ff7b72");
            this.feedbackText.setText(selected === -1
                ? "⏰ TIME'S UP! The Boss attacks!"
                : "✗ WRONG! The Boss attacks!");
            this.attackPlayer();
        }

        this.scoreText.setText(`Score: ${this.score}`);
        this.comboText.setText(`Combo: ${this.combo}`);
        this.updateBars();

        this.time.delayedCall(1100, () => {
            this.index++;
            this.showQuestion();
        });
    }

    attackBoss(damage) {
        this.tweens.add({
            targets: this.playerBody,
            x: 720,
            duration: 300,
            yoyo: true,
            ease: "Power2"
        });

        const hit = this.add.text(870, 180, `-${damage}`, {
            fontFamily: "Arial", fontSize: "34px", color: "#ffe66d",
            fontStyle: "bold"
        }).setOrigin(0.5);

        this.tweens.add({
            targets: [this.bossBody, this.bossEmoji],
            scale: 1.12,
            duration: 120,
            yoyo: true,
            repeat: 1
        });

        this.tweens.add({
            targets: hit, y: 125, alpha: 0, duration: 700,
            onComplete: () => hit.destroy()
        });
    }

    attackPlayer() {
        this.tweens.add({
            targets: [this.bossBody, this.bossEmoji],
            x: 300,
            duration: 300,
            yoyo: true,
            ease: "Power2"
        });

        this.tweens.add({
            targets: [this.playerBody],
            x: 230,
            angle: { from: -6, to: 6 },
            duration: 80,
            repeat: 4,
            yoyo: true
        });
    }

    updateBars() {
        this.playerBar.width = 260 * (this.playerHP / this.maxPlayerHP);
        this.bossBar.width = 260 * (this.bossHP / this.maxBossHP);
        this.playerBar.x = 50 + this.playerBar.width / 2;
        this.bossBar.x = 740 + this.bossBar.width / 2;

        this.playerHPText.setText(`${this.playerHP} / ${this.maxPlayerHP}`);
        this.bossHPText.setText(`${this.bossHP} / ${this.maxBossHP}`);
    }

    finish(won) {
        if (this.timeEvent) this.timeEvent.remove(false);

        const attempted = Math.min(this.index, this.questions.length);
        const accuracy = attempted ? Math.round((this.correct / attempted) * 100) : 0;

        this.scene.start("ResultScene", {
            won, score: this.score, correct: this.correct,
            attempted, accuracy, bestCombo: this.bestCombo
        });
    }
}

class ResultScene extends Phaser.Scene {
    constructor() { super("ResultScene"); }

    create(data) {
        this.cameras.main.setBackgroundColor("#08111f");

        const title = data.won ? "🏆 VICTORY!" : "💡 TRY AGAIN";
        const color = data.won ? "#7ee787" : "#f7c948";

        this.add.text(GAME_WIDTH/2, 110, title, {
            fontFamily: "Arial", fontSize: "52px", color, fontStyle: "bold"
        }).setOrigin(0.5);

        this.add.text(GAME_WIDTH/2, 185,
            data.won ? "You defeated the Knowledge Boss!" : "Keep learning and challenge the Boss again.",
            { fontFamily: "Arial", fontSize: "22px", color: "#dbe7f5" }
        ).setOrigin(0.5);

        this.add.text(GAME_WIDTH/2, 300,
            `Score: ${data.score}\nCorrect: ${data.correct}/${data.attempted}\nAccuracy: ${data.accuracy}%\nBest Combo: ${data.bestCombo}`,
            { fontFamily: "Arial", fontSize: "25px", color: "#ffffff", align: "center", lineSpacing: 14 }
        ).setOrigin(0.5);

        const btn = this.add.rectangle(GAME_WIDTH/2, 510, 260, 70, 0xf7c948)
            .setInteractive({ useHandCursor: true });

        this.add.text(GAME_WIDTH/2, 510, "PLAY AGAIN", {
            fontFamily: "Arial", fontSize: "24px", color: "#08111f", fontStyle: "bold"
        }).setOrigin(0.5);

        btn.on("pointerdown", () => this.scene.start("BossBattleScene"));
    }
}

const config = {
    type: Phaser.AUTO,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    backgroundColor: "#08111f",
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [StartScene, BossBattleScene, ResultScene]
};

new Phaser.Game(config);
