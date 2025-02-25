class Platformer extends Phaser.Scene {
    constructor() {
        super("platformerScene");
    }

    init() {
        // variables and settings
        this.ACCELERATION = 400;
        this.DRAG = 500;    // DRAG < ACCELERATION = icy slide
        this.physics.world.gravity.y = 1500;
        this.JUMP_VELOCITY = -600;
        this.PARTICLE_VELOCITY = 50;
        this.SCALE = 2.0;
    }

    create() {
        // Create a new tilemap game object which uses 18x18 pixel tiles, and is
        // 90 tiles wide and 25 tiles tall.
        this.map = this.add.tilemap("platformer-level-1", 18, 18, 90, 25);

        // Add a tileset to the map
        // First parameter: name we gave the tileset in Tiled
        // Second parameter: key for the tilesheet (from this.load.image in Load.js)
        this.tileset = this.map.addTilesetImage("kenny_tilemap_packed", "tilemap_tiles");

        // Create a layer
        this.groundLayer = this.map.createLayer("Layer 1", this.tileset, 0, 0);

        // Make it collidable
        this.groundLayer.setCollisionByProperty({
            collides: true
        });

        this.waterLayer = this.map.createLayer("Layer 2", this.tileset, 0, 0);

        this.waterLayer.setCollisionByProperty({
            collides: true
        });


        this.diamonds = this.map.createFromObjects("Objects", {
            name: "diamond",
            key: "tilemap_sheet",
            frame: 67
        });
        
        this.flag = this.map.createFromObjects("Objects", {
            name: "flag",
            key: "tilemap_sheet",
            frame: 112
        });


        this.physics.world.enable(this.diamonds, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.world.enable(this.flag, Phaser.Physics.Arcade.STATIC_BODY);

        this.diamondGroup = this.add.group(this.diamonds);
        
        

        // set up player avatar
        my.sprite.player = this.physics.add.sprite(30, 345, "platformer_characters", "tile_0000.png");
        my.sprite.player.setCollideWorldBounds(true);

        // Enable collision handling
        this.physics.add.collider(my.sprite.player, this.groundLayer);
        this.physics.add.collider(my.sprite.player, this.waterLayer, this.playerHitWater, null, this);

        this.score = 0;
        this.scoreText = this.add.text(1400, 16, 'diamond: '+ this.score, { fontSize: '32px', fill: '#737' });

        // set up Phaser-provided cursor key input
        cursors = this.input.keyboard.createCursorKeys();

        this.rKey = this.input.keyboard.addKey('R');

        // debug key listener (assigned to D key)
        this.input.keyboard.on('keydown-D', () => {
            this.physics.world.drawDebug = this.physics.world.drawDebug ? false : true
            this.physics.world.debugGraphic.clear()
        }, this);


        my.vfx.walking = this.add.particles(0, 0, "kenny-particles", {
            frame: ['dirt_01.png', 'dirt_03.png'],
            scale: {start: 0.03, end: 0.1},
            lifespan: 350,
            alpha: {start: 1, end: 0.1}, 
        });

        my.vfx.walking.stop();
        

        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.startFollow(my.sprite.player, true, 0.25, 0.25); // (target, [,roundPixels][,lerpX][,lerpY])
        this.cameras.main.setDeadzone(50, 50);
        this.cameras.main.setZoom(this.SCALE);
        

    }

    playerHitWater(player, water) {
        // Here you can handle what happens when the player hits the water.
        // For now, we will just restart the scene.
        this.scene.restart();
    }

    update() {
        if(cursors.left.isDown) {
            my.sprite.player.setAccelerationX(-this.ACCELERATION);
            my.sprite.player.resetFlip();
            my.sprite.player.anims.play('walk', true);
            // TODO: add particle following code here
            my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth/2-10, my.sprite.player.displayHeight/2-5, false);

            my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);

            // Only play smoke effect if touching the ground

            if (my.sprite.player.body.blocked.down) {

                my.vfx.walking.start();

            }

        } else if(cursors.right.isDown) {
            my.sprite.player.setAccelerationX(this.ACCELERATION);
            my.sprite.player.setFlip(true, false);
            my.sprite.player.anims.play('walk', true);
            // TODO: add particle following code here
            my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth/2-14, my.sprite.player.displayHeight/2-5, false);

            my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);

            // Only play smoke effect if touching the ground

            if (my.sprite.player.body.blocked.down) {

                my.vfx.walking.start();

            }

        } else {
            // Set acceleration to 0 and have DRAG take over
            my.sprite.player.setAccelerationX(0);
            my.sprite.player.setDragX(this.DRAG);
            my.sprite.player.anims.play('idle');
            // TODO: have the vfx stop playing
            my.vfx.walking.stop();
        }

        // player jump
        // note that we need body.blocked rather than body.touching b/c the former applies to tilemap tiles and the latter to the "ground"
        if(!my.sprite.player.body.blocked.down) {
            my.sprite.player.anims.play('jump');
        }
        if(my.sprite.player.body.blocked.down && Phaser.Input.Keyboard.JustDown(cursors.up)) {
            my.sprite.player.body.setVelocityY(this.JUMP_VELOCITY);
        }

        if(Phaser.Input.Keyboard.JustDown(this.rKey)) {
            this.scene.restart();
        }

        this.physics.add.overlap(my.sprite.player, this.diamondGroup, (obj1, obj2) => {
            obj2.destroy(); 
            this.score += 1;
            this.scoreText.setText('diamond: ' + this.score);
        });

        this.physics.add.overlap(my.sprite.player, this.flag, (obj1, obj2) => {
            this.scene.start("winScene", { score: this.score });
            
        });

    }
}