/*global Phaser*/
import * as ChangeScene from './ChangeScene.js';
import Player from '../sprites/Player.js';
import Enemy from '../sprites/Enemy.js';
import Spell from '../sprites/Spell.js';
import Platform from '../sprites/Platform.js';
import Lever from '../sprites/Lever.js';
import PressurePlate from '../sprites/PressurePlate.js';
import Rock from '../sprites/Rock.js';
import Box from '../sprites/Box.js';
export default class s0r2 extends Phaser.Scene {

	constructor () {
		super('s0r2');
	}

	init (data) {
		// Initialization code goes here
	}

	preload () {
		/* ---------- LOADS SPRITE SHEETS ---------- */
		this.load.spritesheet('player', './assets/spriteSheets/idleFinal.png', {
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
		this.load.spritesheet('water', './assets/spriteSheets/water.png', {
			frameHeight: 32,
			frameWidth: 32,
		});
		this.load.spritesheet('earth', './assets/spriteSheets/earth.png', {
			frameHeight: 96,
			frameWidth: 32,
		});
		this.load.spritesheet('fire', './assets/spriteSheets/fire.png', {
			frameHeight: 32,
			frameWidth: 48,
		});
		this.load.spritesheet('air', './assets/spriteSheets/air.png', {
			frameHeight: 32,
			frameWidth: 48,
		});
		this.load.spritesheet('guiMana', './assets/spriteSheets/guiMana.png', {
			frameHeight: 32,
			frameWidth: 32
		});
		this.load.spritesheet('guiSpell', './assets/spriteSheets/guiSpell.png', {
			frameHeight: 10,
			frameWidth: 40
		});

		/* ---------- LOADS LEVEL TILEMAP ---------- */
		this.load.image('tiles', './assets/images/tilemapv2.png');
		this.load.tilemapTiledJSON('s0r2', './assets/map/s0r2.json')

		/* ---------- LOADS SPRITES FOR GAME OBJECTS ---------- */
		this.load.image('platform', './assets/sprites/platform.png');
		this.load.image('spike', './assets/sprites/spike.png');
		this.load.image('rock', './assets/sprites/rock.png');
		this.load.image('box', './assets/sprites/box.png');
		this.load.image('cameraFrame', './assets/sprites/cameraFrame.png');
	}	// ---------- END OF PRELOAD ---------- //

	create (data) {
		ChangeScene.addSceneEventListeners(this);

		/* ---------- GLOBAL VARIABLES --------- */
		this.resetLevel = false
		this.gameWidth = this.cameras.main.width
		this.gameHeight = this.cameras.main.height

		/* ---------- CREATES MAP ---------- */
		const map = this.make.tilemap({key: 's0r2'});
		const tileset = map.addTilesetImage('tilemapv2', 'tiles');
		this.layer = map.createStaticLayer('Tile Layer 1', tileset, 0, 0);
		this.layer.setCollisionByProperty({ collides: true });

		/* ---------- CREATES PLAYER ---------- */
		this.player = new Player(this, 50, 520, 'player');

		/* ---------- ADJUSTS CAMERA ---------- */
		let camera = this.cameras.main;
		camera.setZoom(2);
		camera.startFollow(this.player);
		camera.setBounds(0, 0, 800, 640);

		/* ---------- CREATES GUI ---------- */
		this.guiMana = this.physics.add.sprite(this.cameras.main.width / 3.75, this.cameras.main.height / 3.5, 'guiMana').setFrame(22).setScrollFactor(0, 0);
		this.guiSpell = this.physics.add.sprite(this.cameras.main.width / 3.75 + 33, this.cameras.main.height / 3.5, 'guiSpell').setScrollFactor(0, 0);
		this.anims.create({
			key: 'manaRegen',
			frames: this.anims.generateFrameNumbers('guiMana', {start: 0, end: 21}),
			frameRate: 20,
			repeat: 0
		});

		/* ---------- CREATES DOOR ---------- */
		this.door = this.physics.add.sprite(755, 350);

		/* ---------- CREATES KEYS FOR INTERACTING ---------- */
		this.switchFire = this.input.keyboard.addKey('one');
		this.switchEarth = this.input.keyboard.addKey('two');
		this.switchWater = this.input.keyboard.addKey('three');
		this.switchAir = this.input.keyboard.addKey('four');
		this.interact = this.input.keyboard.addKey('e');
		this.reset = this.input.keyboard.addKey('r');
		this.castSpell = this.input.keyboard.addKey('space');
	}	// ---------- END OF CREATE ---------- //

	update (time, delta) {

		/* ---------- RESETS LEVEL ---------- */
		if (this.resetLevel) {
			this.scene.start('s0r2')
		}

		/* ---------- STARTS NEXT LEVEL ---------- */
		if (this.nextLevel) {
			this.scene.start('s0r3')
		}

		/* ---------- MOVES PLAYER ---------- */
		this.player.move(this);

		/*----------- Enemy AI -------------- */
		for(var x in this.enemyGroup){
			this.enemyGroup[x].move(this, this.player);
		}

		if (this.player.platform) {
			console.log(this.player.platform);
		}

		this.physics.overlap(this.player, this.door, () => this.nextLevel = true);

		/* ---------- CHECKS TO DEACTIVATE SPELLS ---------- */
		if (this.player.spellActive['fire']) {
			this.player.fire.deactivate(this, this.enemyGroup);
			for (let x in this.enemyGroup) {
				this.physics.overlap(this.player.fire, this.enemyGroup[x], () => this.enemyGroup[x].deactivate(this, this.player.fire, x));
			}
		}
		if (this.player.spellActive['water']) {
			this.player.water.deactivate(this, this.enemyGroup);
			for (let x in this.enemyGroup) {
				this.physics.overlap(this.player.water, this.enemyGroup[x], () => this.enemyGroup[x].deactivate(this, this.player.water, x));
			}
			if (this.boxGroup) {
				for (let x in this.boxGroup) {
					this.physics.add.overlap(this.boxGroup[x], this.player.water, () => {
						this.player.water.suspend(this, this.boxGroup[x]);
					});
				}
			}
		}
		if (this.player.spellActive['air']) {
			this.player.air.deactivate(this, this.enemyGroup);
			for (let x in this.enemyGroup) {
				this.physics.overlap(this.player.air, this.enemyGroup[x], () => this.enemyGroup[x].deactivate(this, this.player.air, x));
			}
			if (this.rockGroup) {
				for (let x in this.rockGroup) {
					this.physics.add.overlap(this.rockGroup[x], this.player.air, () => {
						this.player.air.push(this, this.rockGroup[x], this.player.direction);
					});
				}
			}
			if (this.boxGroup) {
				for (let x in this.boxGroup) {
					this.physics.add.overlap(this.boxGroup[x], this.player.air, () => {
						this.player.air.push(this, this.boxGroup[x], this.player.direction);
					});
				}
			}
		}

		/* ---------- CASTING SPELLS ---------- */
		if (this.switchFire.isDown) {
			this.player.currentSpell = 'fire';
			this.guiSpell.setFrame(0);
		} else if (this.switchAir.isDown) {
			this.player.currentSpell = 'air';
			this.guiSpell.setFrame(1);
		} else if (this.switchEarth.isDown) {
			this.player.currentSpell = 'earth';
			this.guiSpell.setFrame(2);
		} else if (this.switchWater.isDown) {
			this.player.currentSpell = 'water';
			this.guiSpell.setFrame(3);
		}

		if (this.reset.isDown) {
			this.resetLevel = true;
		}

		// Casts spell if cooldown timer has been met
		if (this.castSpell.isDown && this.player.spellTimer > 70 ) {
			this.player.cast(this, this.player.currentSpell, this.player.flipX);
			this.guiMana.play('manaRegen', true);
	 	}

		if (this.player.raisingEarth) {
			if (this.player.earthBox.body.height >= 117) {
				this.player.raisingEarth = false;
			}
			this.player.earthBox.body.height += 2.1;
			this.player.y -= 1;
			this.player.earthBox.body.offset.set(0, -this.player.earthBox.body.height);
		}
	}	// ----- END OF UPDATE ----- //

}	// ----- END OF PHASER SCENE ----- //
