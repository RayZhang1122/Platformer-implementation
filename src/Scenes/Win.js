class Win extends Phaser.Scene {
    constructor() {
        super("winScene");
        this.mykey;
        
    }
    
    init(data) {
        // Retrieve the score from the data object
        this.score = data.score;
    }

    create() {
        this.mykey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        const message = this.add.text(500,400,"You Win! Diamond Score: " + this.score + "/3. Press Space to play again.")
    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(this.mykey)) {
            this.scene.start("loadScene");
        }
       
    }

}