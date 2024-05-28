class Begin extends Phaser.Scene {
    constructor() {
        super("BeginScene");
        this.mykey;
        
    }

    create() {
        this.mykey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        const message = this.add.text(500,400,"Catch the flag to win, press Space to Play!")
    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(this.mykey)) {
            this.scene.start("loadScene");
        }
       
    }

}