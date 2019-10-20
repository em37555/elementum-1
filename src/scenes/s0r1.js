/*global Phaser*/
import * as ChangeScene from './ChangeScene.js';
import Player from '../sprites/Player.js';
import Enemy from '../sprites/Enemy.js';
import Spell from '../sprites/Spell.js';
import Platform from '../sprites/Platform.js';
import Lever from '../sprites/Lever.js';
import Box from '../sprites/Box.js';
import Rock from '../sprites/Rock.js';
export default class s0r1 extends Phaser.Scene {

	constructor () {
		super('s0r1');
	}


	init (data) {
		// Initialization code goes here
	}


	preload () {

		/* ---------- LOADS SPRITE SHEETS ---------- */
		this.load.spritesheet('player', './assets/spriteSheets/idleFinal.png', {	// Combine all player spritesheets into one soon
			frameHeight: 39,
			frameWidth: 34,
		});
		this.load.spritesheet('lever', './assets/spriteSheets/lever.png',{
			frameHeight: 6,
			frameWidth: 9
	    });
		this.load.spritesheet('run', './assets/spriteSheets/runPlayer.png',{
			frameHeight: 39,
			frameWidth: 34
	    });
		this.load.spritesheet('slimeAni', './assets/spriteSheets/slimesprite.png',{
			frameHeight: 14,
			frameWidth:	 21
		});
		this.load.spritesheet('tempPlatform', './assets/spriteSheets/platformMove.png',{
			frameHeight: 32,
			frameWidth:	 96
		});
		this.load.spritesheet('manaBar', './assets/spriteSheets/manaPotion.png', {
			frameHeight: 64,
			frameWidth: 64,
		});
		this.load.spritesheet('water', './assets/spriteSheets/bubbleAnimation.png', {
			frameHeight: 32,
			frameWidth: 32,
		});
		this.load.spritesheet('earth', './assets/spriteSheets/earthAnimation.png', {
			frameHeight: 32,
			frameWidth: 64,
		});
		this.load.spritesheet('fire', './assets/spriteSheets/fireballAnimation.png', {
			frameHeight: 32,
			frameWidth: 48,
		});
		this.load.spritesheet('air', './assets/spriteSheets/airAnimation.png', {
			frameHeight: 32,
			frameWidth: 48,
		});

		/* ---------- LOADS BACKGROUND -----------------------*/
		this.load.image('background', './assets/images/backgroundimage1.png');
		this.load.image('topbanner', './assets/images/topbanner.png');
		this.load.image('textBanner', './assets/images/textBackground.png');

		/* ---------- LOADS LEVEL TILEMAP ---------- */
		this.load.image('tiles', './assets/images/newTileMap.png');
		this.load.tilemapTiledJSON('s0r1', './assets/map/s0r1.json');

		/* ---------- LOADS SPRITES FOR SPELL FRAMES ---------- */
		this.load.image('airFrame', './assets/sprites/airFrame.png');
		this.load.image('bubbleFrame', './assets/sprites/bubbleFrame.png');
		this.load.image('fireFrame', './assets/sprites/fireFrame.png');
		this.load.image('earthFrame', './assets/sprites/earthFrame.png');

		/* ---------- LOADS SPRITES FOR GAME OBJECTS ---------- */
		this.load.image('spike', './assets/sprites/spike.png');
		this.load.image('door', './assets/sprites/door.png');


	}	// ----- END OF PRELOAD ----- //


	create (data) {
	    ChangeScene.addSceneEventListeners(this);

		/* ---------- GLOBAL VARIABLES --------- */
		this.resetLevel = false
		this.gameWidth = this.cameras.main.width
		this.gameHeight = this.cameras.main.height


		/* --------- CREATES BACKGROUND --------- */
		this.add.image(350, 325,'background').setScale(1.1);


		/* ---------- CREATES MAP ---------- */
		const map = this.make.tilemap({key: 's0r1'});
		const tileset = map.addTilesetImage('newTileMap', 'tiles');
		this.layer = map.createStaticLayer('Tile Layer 1', tileset, 0, 0);
		this.layer.setCollisionByProperty({ collides: true });


		/* ---------- TOP BANNER ---------- */
		this.add.image(350, 35,'topbanner').setScale(15, 1.7);


		/* ---------- CREATES MANA BAR ---------- */
		this.manaBar = this.add.sprite(this.cameras.main.width - 50, 40, 'manaBar', 27);
		this.anims.create({
			key: "regenMana",
			frames: this.anims.generateFrameNumbers("manaBar", {start: 0, end: 27}),
			frameRate: 24,
		});

		/* ---------- TUTORIAL TEXT ---------- */
		this.add.image(410, 210,'textBanner').setScale(8.5, 1.7);
		this.tutorialText = this.add.text(175, 200, 'Use the arrow keys to move left, right, and jump');


		/* ---------- CREATES SPELL FRAMES ---------- */
		this.fireFrame = this.add.sprite(48, 40, 'fireFrame');
		this.earthFrame = this.add.sprite(111, 40, 'earthFrame');
		this.waterFrame = this.add.sprite(174, 40, 'bubbleFrame');
		this.airFrame = this.add.sprite(237, 40, 'airFrame');

		this.frameGroup = [this.fireFrame, this.earthFrame, this.waterFrame, this.airFrame];


		/* ---------- CREATES PLAYER ---------- */
		this.player = new Player(this, 50, 460, 'player');


		/* ---------- CREATES DOOR ---------- */
		this.door = this.physics.add.sprite(754, 448, 'door');


		/* ------ CREATE SPIKES ---------------- */
		this.spikeGroup = [];
		for (let i = 0; i <= 5; i++) {
			this.spikeGroup.push(this.physics.add.sprite(16*i + 360, 635, 'spike').setScale(0.3))
		}

		/* ---------- KEYS FOR INTERACTING ---------- */
		this.switchFire = this.input.keyboard.addKey('one');
		this.switchEarth = this.input.keyboard.addKey('two');
		this.switchWater = this.input.keyboard.addKey('three');
		this.switchAir = this.input.keyboard.addKey('four');
		this.interact = this.input.keyboard.addKey('e');
		this.castSpell = this.input.keyboard.addKey('space');

	}	// ---------- END OF CREATE ---------- //


	update (time, delta) {

		/* ---------- RESETS LEVEL ---------- */
		if (this.resetLevel) {
			this.scene.start('s0r1')
		}


		/* ---------- STARTS NEXT LEVEL ---------- */
		if (this.nextLevel) {
			this.scene.start('s0r2')
		}


		/* ---------- MOVES PLAYER ---------- */
		this.player.move(this);

		/* ----------- PLAYER KILLERS ----------- */
		this.physics.overlap(this.player, Object.values(this.spikeGroup), () => this.resetLevel = true);
		this.physics.overlap(this.player, this.door, () => this.nextLevel = true);


		/* ---------- CHECKS TO DEACTIVATE SPELLS ---------- */
		if (this.player.spellActive['fire']) {
			this.player.fireball.deactivate(this, this.enemyGroup);
			for (let x in this.enemyGroup) {
				this.physics.overlap(this.player.fireball, this.enemyGroup[x], () => this.enemyGroup[x].deactivate(this, this.player.fireball, x));
			}
		}
		if (this.player.spellActive['water']) {
			this.player.bubble.deactivate(this, this.enemyGroup);
			for (let x in this.enemyGroup) {
				this.physics.overlap(this.player.bubble, this.enemyGroup[x], () => this.enemyGroup[x].deactivate(this, this.player.bubble, x));
			}
			if (this.box) {
				this.physics.add.overlap(this.box, this.player.bubble, () => {
					this.player.bubble.suspend(this, this.box);
				});
			}
		}
		if (this.player.spellActive['air']) {
			this.player.airwave.deactivate(this, this.enemyGroup);
			for (let x in this.enemyGroup) {
				this.physics.overlap(this.player.airwave, this.enemyGroup[x], () => this.enemyGroup[x].deactivate(this, this.player.airwave, x));
			}
			if (this.rock) {
				this.physics.add.overlap(this.rock, this.player.airwave, () => {
					this.player.airwave.push(this, this.rock);
				});
			}
		}


		/* ---------- CASTING SPELLS ---------- */
		if (this.switchFire.isDown) {
			this.player.currentSpell = 'fire';
			this.player.changeSpellFrame(this, 0);
		} else if (this.switchEarth.isDown) {
			this.player.currentSpell = 'earth';
			this.player.changeSpellFrame(this, 1);
		} else if (this.switchWater.isDown) {
			this.player.currentSpell = 'water';
			this.player.changeSpellFrame(this, 2);
		} else if (this.switchAir.isDown) {
			this.player.currentSpell = 'air';
			this.player.changeSpellFrame(this, 3);
		}

		// Casts spell if cooldown timer has been met
		if (this.castSpell.isDown && this.player.spellTimer > 70 ) {
			this.player.cast(this, this.player.currentSpell, this.player.flipX);
			this.manaBar.play('regenMana', true);
	 	}

    }	// ----- END OF UPDATE ----- //

}	// ----- END OF PHASER SCENE ----- //