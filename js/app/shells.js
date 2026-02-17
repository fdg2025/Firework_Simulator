import { IS_DESKTOP, IS_HEADER, PI_2, PI_HALF } from "./constants.js";
import { COLOR, INVISIBLE, makePistilColor, randomColor, whiteOrGold } from "./colors.js";
import { perfTuning } from "./perf.js";

export function createShellSystem({
	selectors,
	getStageSize,
	getMainStageSize,
	isRunning,
	getQuality,
	particles,
	soundManager,
	myMath,
	randomWord,
	getWordDots,
}) {
	const { Star, Spark, BurstFlash } = particles;
	let introSequencePlayed = false;

	function createParticleArc(start, arcLength, count, randomness, particleFactory) {
		const angleDelta = arcLength / count;
		const end = start + arcLength - angleDelta * 0.5;

		if (end > start) {
			for (let angle = start; angle < end; angle = angle + angleDelta) {
				particleFactory(angle + Math.random() * angleDelta * randomness);
			}
		} else {
			for (let angle = start; angle > end; angle = angle + angleDelta) {
				particleFactory(angle + Math.random() * angleDelta * randomness);
			}
		}
	}

	function createBurst(count, particleFactory, startAngle = 0, arcLength = PI_2) {
		const R = 0.5 * Math.sqrt(count / Math.PI);
		const C = 2 * R * Math.PI;
		const C_HALF = C / 2;

		for (let i = 0; i <= C_HALF; i++) {
			const ringAngle = (i / C_HALF) * PI_HALF;
			const ringSize = Math.cos(ringAngle);
			const partsPerFullRing = C * ringSize;
			const partsPerArc = partsPerFullRing * (arcLength / PI_2);

			const angleInc = PI_2 / partsPerFullRing;
			const angleOffset = Math.random() * angleInc + startAngle;
			const maxRandomAngleOffset = angleInc * 0.33;

			for (let j = 0; j < partsPerArc; j++) {
				const randomAngleOffset = Math.random() * maxRandomAngleOffset;
				const angle = angleInc * j + angleOffset + randomAngleOffset;
				particleFactory(angle, ringSize);
			}
		}
	}

	function createWordBurst(wordText, particleFactory, centerX, centerY) {
		const map = getWordDots(wordText);
		if (!map) return;
		const dcenterX = map.width / 2;
		const dcenterY = map.height / 2;
		const color = randomColor();
		const strobed = Math.random() < 0.5;
		const strobeColor = strobed ? randomColor() : color;

		for (let i = 0; i < map.points.length; i++) {
			const point = map.points[i];
			const x = centerX + (point.x - dcenterX);
			const y = centerY + (point.y - dcenterY);
			particleFactory({ x, y }, color, strobed, strobeColor);
		}
	}

	function crossetteEffect(star) {
		const startAngle = Math.random() * PI_HALF;
		createParticleArc(startAngle, PI_2, 4, 0.5, (angle) => {
			Star.add(star.x, star.y, star.color, angle, Math.random() * 0.6 + 0.75, 600);
		});
	}

	function floralEffect(star) {
		const { quality } = getQuality();
		const count = 12 + 6 * quality;
		createBurst(count, (angle, speedMult) => {
			Star.add(star.x, star.y, star.color, angle, speedMult * 2.4, 1000 + Math.random() * 300, star.speedX, star.speedY);
		});
		BurstFlash.add(star.x, star.y, 46);
		soundManager.playSound("burstSmall");
	}

	function fallingLeavesEffect(star) {
		const { quality } = getQuality();
		createBurst(7, (angle, speedMult) => {
			const newStar = Star.add(star.x, star.y, INVISIBLE, angle, speedMult * 2.4, 2400 + Math.random() * 600, star.speedX, star.speedY);

			newStar.sparkColor = COLOR.Gold;
			newStar.sparkFreq = 144 / quality;
			newStar.sparkSpeed = 0.28;
			newStar.sparkLife = 750;
			newStar.sparkLifeVariation = 3.2;
		});
		BurstFlash.add(star.x, star.y, 46);
		soundManager.playSound("burstSmall");
	}

	function crackleEffect(star) {
		const { isHighQuality } = getQuality();
		const count = isHighQuality ? 32 : 16;
		createParticleArc(0, PI_2, count, 1.8, (angle) => {
			Spark.add(star.x, star.y, COLOR.Gold, angle, Math.pow(Math.random(), 0.45) * 2.4, 300 + Math.random() * 200);
		});
	}

	class Shell {
		constructor(options) {
			Object.assign(this, options);
			this.starLifeVariation = options.starLifeVariation || 0.125;
			this.color = options.color || randomColor();
			this.glitterColor = options.glitterColor || this.color;
			this.disableWord = options.disableWord || false;

			if (!this.starCount) {
				const density = (options.starDensity || 1) * (perfTuning.enabled ? perfTuning.scale : 1);
				const scaledSize = this.spreadSize / 54;
				this.starCount = Math.max(6, scaledSize * scaledSize * density);
			}
		}

		launch(position, launchHeight) {
			const { width, height } = getStageSize();
			const hpad = 60;
			const vpad = 50;
			const minHeightPercent = 0.45;
			const minHeight = height - height * minHeightPercent;

			const launchX = position * (width - hpad * 2) + hpad;
			const launchY = height;
			const burstY = minHeight - launchHeight * (minHeight - vpad);

			const launchDistance = launchY - burstY;
			const launchVelocity = Math.pow(launchDistance * 0.04, 0.64);

			const comet = (this.comet = Star.add(
				launchX,
				launchY,
				typeof this.color === "string" && this.color !== "random" ? this.color : COLOR.White,
				Math.PI,
				launchVelocity * (this.horsetail ? 1.2 : 1),
				launchVelocity * (this.horsetail ? 100 : 400)
			));

			const { quality, isHighQuality } = getQuality();
			comet.heavy = true;
			comet.spinRadius = myMath.random(0.32, 0.85);
			comet.sparkFreq = 32 / quality;
			if (isHighQuality) comet.sparkFreq = 8;
			comet.sparkLife = 320;
			comet.sparkLifeVariation = 3;
			if (this.glitter === "willow" || this.fallingLeaves) {
				comet.sparkFreq = 20 / quality;
				comet.sparkSpeed = 0.5;
				comet.sparkLife = 500;
			}
			if (this.color === INVISIBLE) {
				comet.sparkColor = COLOR.Gold;
			}

			if (Math.random() > 0.4 && !this.horsetail) {
				comet.secondColor = INVISIBLE;
				comet.transitionTime = Math.pow(Math.random(), 1.5) * 700 + 500;
			}

			comet.onDeath = (cometInstance) => this.burst(cometInstance.x, cometInstance.y);

			soundManager.playSound("lift");
		}

		burst(x, y) {
			const speed = this.spreadSize / 96;

			let color;
			let onDeath;
			let sparkFreq;
			let sparkSpeed;
			let sparkLife;
			let sparkLifeVariation = 0.25;
			let playedDeathSound = false;

			if (this.crossette)
				onDeath = (star) => {
					if (!playedDeathSound) {
						soundManager.playSound("crackleSmall");
						playedDeathSound = true;
					}
					crossetteEffect(star);
				};
			if (this.crackle)
				onDeath = (star) => {
					if (!playedDeathSound) {
						soundManager.playSound("crackle");
						playedDeathSound = true;
					}
					crackleEffect(star);
				};
			if (this.floral) onDeath = floralEffect;
			if (this.fallingLeaves) onDeath = fallingLeavesEffect;

			if (this.glitter === "light") {
				sparkFreq = 400;
				sparkSpeed = 0.3;
				sparkLife = 300;
				sparkLifeVariation = 2;
			} else if (this.glitter === "medium") {
				sparkFreq = 200;
				sparkSpeed = 0.44;
				sparkLife = 700;
				sparkLifeVariation = 2;
			} else if (this.glitter === "heavy") {
				sparkFreq = 80;
				sparkSpeed = 0.8;
				sparkLife = 1400;
				sparkLifeVariation = 2;
			} else if (this.glitter === "thick") {
				sparkFreq = 16;
				sparkSpeed = getQuality().isHighQuality ? 1.65 : 1.5;
				sparkLife = 1400;
				sparkLifeVariation = 3;
			} else if (this.glitter === "streamer") {
				sparkFreq = 32;
				sparkSpeed = 1.05;
				sparkLife = 620;
				sparkLifeVariation = 2;
			} else if (this.glitter === "willow") {
				sparkFreq = 120;
				sparkSpeed = 0.34;
				sparkLife = 1400;
				sparkLifeVariation = 3.8;
			}

			const quality = getQuality().quality;
			sparkFreq = (sparkFreq / quality) / (perfTuning.enabled ? perfTuning.scale : 1);

			const starFactory = (angle, speedMult) => {
				const standardInitialSpeed = this.spreadSize / 1800;

				const star = Star.add(
					x,
					y,
					color || randomColor(),
					angle,
					speedMult * speed,
					this.starLife + Math.random() * this.starLife * this.starLifeVariation,
					this.horsetail ? this.comet && this.comet.speedX : 0,
					this.horsetail ? this.comet && this.comet.speedY : -standardInitialSpeed
				);

				if (this.secondColor) {
					star.transitionTime = this.starLife * (Math.random() * 0.05 + 0.32);
					star.secondColor = this.secondColor;
				}

				if (this.strobe) {
					star.transitionTime = this.starLife * (Math.random() * 0.08 + 0.46);
					star.strobe = true;
					star.strobeFreq = Math.random() * 20 + 40;
					if (this.strobeColor) {
						star.secondColor = this.strobeColor;
					}
				}

				star.onDeath = onDeath;

				if (this.glitter) {
					star.sparkFreq = sparkFreq;
					star.sparkSpeed = sparkSpeed;
					star.sparkLife = sparkLife;
					star.sparkLifeVariation = sparkLifeVariation;
					star.sparkColor = this.glitterColor;
					star.sparkTimer = Math.random() * star.sparkFreq;
				}
			};

			const dotStarFactory = (point, dotColor, strobe, strobeColor) => {
				const standardInitialSpeed = this.spreadSize / 1800;

				if (strobe) {
					const speedVal = Math.random() * 0.1 + 0.05;

					const star = Star.add(
						point.x,
						point.y,
						dotColor,
						Math.random() * 2 * Math.PI,
						speedVal,
						this.starLife + Math.random() * this.starLife * this.starLifeVariation + speedVal * 1000,
						this.horsetail ? this.comet && this.comet.speedX : 0,
						this.horsetail ? this.comet && this.comet.speedY : -standardInitialSpeed,
						2
					);

					star.transitionTime = this.starLife * (Math.random() * 0.08 + 0.46);
					star.strobe = true;
					star.strobeFreq = Math.random() * 20 + 40;
					star.secondColor = strobeColor;
				} else {
					Spark.add(
						point.x,
						point.y,
						dotColor,
						Math.random() * 2 * Math.PI,
						Math.pow(Math.random(), 0.15) * 1.4,
						this.starLife + Math.random() * this.starLife * this.starLifeVariation + 1000
					);
				}

				const tailChance = perfTuning.enabled ? perfTuning.scale : 1;
				if (Math.random() < tailChance) {
					Spark.add(
						point.x + 5,
						point.y + 10,
						dotColor,
						Math.random() * 2 * Math.PI,
						Math.pow(Math.random(), 0.05) * 0.4,
						this.starLife + Math.random() * this.starLife * this.starLifeVariation + 2000
					);
				}
			};

			if (typeof this.color === "string") {
				if (this.color === "random") {
					color = null;
				} else {
					color = this.color;
				}

				if (this.ring) {
					const ringStartAngle = Math.random() * Math.PI;
					const ringSquash = Math.pow(Math.random(), 2) * 0.85 + 0.15;

					createParticleArc(0, PI_2, this.starCount, 0, (angle) => {
						const initSpeedX = Math.sin(angle) * speed * ringSquash;
						const initSpeedY = Math.cos(angle) * speed;
						const newSpeed = myMath.pointDist(0, 0, initSpeedX, initSpeedY);
						const newAngle = myMath.pointAngle(0, 0, initSpeedX, initSpeedY) + ringStartAngle;
						const star = Star.add(
							x,
							y,
							color,
							newAngle,
							newSpeed,
							this.starLife + Math.random() * this.starLife * this.starLifeVariation
						);

						if (this.glitter) {
							star.sparkFreq = sparkFreq;
							star.sparkSpeed = sparkSpeed;
							star.sparkLife = sparkLife;
							star.sparkLifeVariation = sparkLifeVariation;
							star.sparkColor = this.glitterColor;
							star.sparkTimer = Math.random() * star.sparkFreq;
						}
					});
				} else {
					createBurst(this.starCount, starFactory);
				}
			} else if (Array.isArray(this.color)) {
				if (Math.random() < 0.5) {
					const start = Math.random() * Math.PI;
					const start2 = start + Math.PI;
					const arc = Math.PI;
					color = this.color[0];
					createBurst(this.starCount, starFactory, start, arc);
					color = this.color[1];
					createBurst(this.starCount, starFactory, start2, arc);
				} else {
					color = this.color[0];
					createBurst(this.starCount / 2, starFactory);
					color = this.color[1];
					createBurst(this.starCount / 2, starFactory);
				}
			} else {
				throw new Error("无效的烟花颜色。应为字符串或字符串数组，但得到:" + this.color);
			}

			if (!this.disableWord && selectors.wordShell()) {
				const scale = perfTuning.enabled ? perfTuning.scale : 1;
				const wordChance = Math.max(0.05, 0.15 * scale);
				const selectChance = Math.max(0.2, 0.5 * scale);
				if (Math.random() < wordChance) {
					if (Math.random() < selectChance) {
						createWordBurst(randomWord(), dotStarFactory, x, y);
					}
				}
			}

			if (this.pistil) {
				const innerShell = new Shell({
					spreadSize: this.spreadSize * 0.5,
					starLife: this.starLife * 0.6,
					starLifeVariation: this.starLifeVariation,
					starDensity: 1.4,
					color: this.pistilColor,
					glitter: "light",
					disableWord: true,
					glitterColor: this.pistilColor === COLOR.Gold ? COLOR.Gold : COLOR.White,
				});
				innerShell.burst(x, y);
			}

			if (this.streamers) {
				const innerShell = new Shell({
					spreadSize: this.spreadSize * 0.9,
					starLife: this.starLife * 0.8,
					starLifeVariation: this.starLifeVariation,
					starCount: Math.floor(Math.max(6, this.spreadSize / 45)),
					color: COLOR.White,
					disableWord: true,
					glitter: "streamer",
				});
				innerShell.burst(x, y);
			}

			BurstFlash.add(x, y, this.spreadSize / 4);

			if (this.comet) {
				const maxDiff = 2;
				const sizeDifferenceFromMaxSize = Math.min(maxDiff, selectors.shellSize() - this.shellSize);
				const soundScale = (1 - sizeDifferenceFromMaxSize / maxDiff) * 0.3 + 0.7;
				soundManager.playSound("burst", soundScale);
			}
		}
	}

	const crysanthemumShell = (size = 1) => {
		const { isLowQuality, isHighQuality } = getQuality();
		const glitter = Math.random() < 0.25;
		const singleColor = Math.random() < 0.72;
		const color = singleColor ? randomColor({ limitWhite: true }) : [randomColor(), randomColor({ notSame: true })];
		const pistil = singleColor && Math.random() < 0.42;
		const pistilColor = pistil && makePistilColor(color);
		const secondColor = singleColor && (Math.random() < 0.2 || color === COLOR.White) ? pistilColor || randomColor({ notColor: color, limitWhite: true }) : null;
		const streamers = !pistil && color !== COLOR.White && Math.random() < 0.42;
		let starDensity = glitter ? 1.1 : 1.25;
		if (isLowQuality) starDensity *= 0.8;
		if (isHighQuality) starDensity = 1.2;
		return {
			shellSize: size,
			spreadSize: 300 + size * 100,
			starLife: 900 + size * 200,
			starDensity,
			color,
			secondColor,
			glitter: glitter ? "light" : "",
			glitterColor: whiteOrGold(),
			pistil,
			pistilColor,
			streamers,
		};
	};

	const ghostShell = (size = 1) => {
		const shell = crysanthemumShell(size);
		shell.starLife *= 1.5;
		const ghostColor = randomColor({ notColor: COLOR.White });
		shell.streamers = true;
		const pistil = Math.random() < 0.42;
		const pistilColor = pistil && makePistilColor(ghostColor);
		shell.color = INVISIBLE;
		shell.secondColor = ghostColor;
		shell.glitter = "";

		if (pistil) {
			shell.pistil = pistil;
			shell.pistilColor = pistilColor;
		}
		return shell;
	};

	const strobeShell = (size = 1) => {
		const color = randomColor({ limitWhite: true });
		return {
			shellSize: size,
			spreadSize: 280 + size * 92,
			starLife: 1100 + size * 200,
			starLifeVariation: 0.4,
			starDensity: 1.1,
			color,
			glitter: "light",
			glitterColor: COLOR.White,
			strobe: true,
			strobeColor: Math.random() < 0.5 ? COLOR.White : null,
			pistil: Math.random() < 0.5,
			pistilColor: makePistilColor(color),
		};
	};

	const palmShell = (size = 1) => {
		const color = randomColor();
		const thick = Math.random() < 0.5;
		return {
			shellSize: size,
			color,
			spreadSize: 250 + size * 75,
			starDensity: thick ? 0.15 : 0.4,
			starLife: 1800 + size * 200,
			glitter: thick ? "thick" : "heavy",
		};
	};

	const ringShell = (size = 1) => {
		const color = randomColor();
		const pistil = Math.random() < 0.75;
		return {
			shellSize: size,
			ring: true,
			color,
			spreadSize: 300 + size * 100,
			starLife: 900 + size * 200,
			starCount: 2.2 * PI_2 * (size + 1),
			pistil,
			pistilColor: makePistilColor(color),
			glitter: !pistil ? "light" : "",
			glitterColor: color === COLOR.Gold ? COLOR.Gold : COLOR.White,
			streamers: Math.random() < 0.3,
		};
	};

	const crossetteShell = (size = 1) => {
		const color = randomColor({ limitWhite: true });
		return {
			shellSize: size,
			spreadSize: 300 + size * 100,
			starLife: 750 + size * 160,
			starLifeVariation: 0.4,
			starDensity: 0.85,
			color,
			crossette: true,
			pistil: Math.random() < 0.5,
			pistilColor: makePistilColor(color),
		};
	};

	const floralShell = (size = 1) => ({
		shellSize: size,
		spreadSize: 300 + size * 120,
		starDensity: 0.12,
		starLife: 500 + size * 50,
		starLifeVariation: 0.5,
		color: Math.random() < 0.65 ? "random" : Math.random() < 0.15 ? randomColor() : [randomColor(), randomColor({ notSame: true })],
		floral: true,
	});

	const fallingLeavesShell = (size = 1) => ({
		shellSize: size,
		color: INVISIBLE,
		spreadSize: 300 + size * 120,
		starDensity: 0.12,
		starLife: 500 + size * 50,
		starLifeVariation: 0.5,
		glitter: "medium",
		glitterColor: COLOR.Gold,
		fallingLeaves: true,
	});

	const willowShell = (size = 1) => ({
		shellSize: size,
		spreadSize: 300 + size * 100,
		starDensity: 0.6,
		starLife: 3000 + size * 300,
		glitter: "willow",
		glitterColor: COLOR.Gold,
		color: INVISIBLE,
	});

	const crackleShell = (size = 1) => {
		const { isLowQuality } = getQuality();
		const color = Math.random() < 0.75 ? COLOR.Gold : randomColor();
		return {
			shellSize: size,
			spreadSize: 380 + size * 75,
			starDensity: isLowQuality ? 0.65 : 1,
			starLife: 600 + size * 100,
			starLifeVariation: 0.32,
			glitter: "light",
			glitterColor: COLOR.Gold,
			color,
			crackle: true,
			pistil: Math.random() < 0.65,
			pistilColor: makePistilColor(color),
		};
	};

	const horsetailShell = (size = 1) => {
		const color = randomColor();
		return {
			shellSize: size,
			horsetail: true,
			color,
			spreadSize: 250 + size * 38,
			starDensity: 0.9,
			starLife: 2500 + size * 300,
			glitter: "medium",
			glitterColor: Math.random() < 0.5 ? whiteOrGold() : color,
			strobe: color === COLOR.White,
		};
	};

	function randomShellName() {
		return Math.random() < 0.5 ? "Crysanthemum" : shellNames[(Math.random() * (shellNames.length - 1) + 1) | 0];
	}

	function randomShell(size) {
		if (IS_HEADER) return randomFastShell()(size);
		return shellTypes[randomShellName()](size);
	}

	function shellFromConfig(size) {
		return shellTypes[selectors.shellName()](size);
	}

	const fastShellBlacklist = ["Falling Leaves", "Floral", "Willow"];
	function randomFastShell() {
		const isRandom = selectors.shellName() === "Random";
		let shellName = isRandom ? randomShellName() : selectors.shellName();
		if (isRandom) {
			while (fastShellBlacklist.includes(shellName)) {
				shellName = randomShellName();
			}
		}
		return shellTypes[shellName];
	}

	const shellTypes = {
		Random: randomShell,
		Crackle: crackleShell,
		Crossette: crossetteShell,
		Crysanthemum: crysanthemumShell,
		"Falling Leaves": fallingLeavesShell,
		Floral: floralShell,
		Ghost: ghostShell,
		"Horse Tail": horsetailShell,
		Palm: palmShell,
		Ring: ringShell,
		Strobe: strobeShell,
		Willow: willowShell,
	};

	const shellNames = Object.keys(shellTypes);

	function fitShellPositionInBoundsH(position) {
		const edge = 0.18;
		return (1 - edge * 2) * position + edge;
	}

	function fitShellPositionInBoundsV(position) {
		return position * 0.75;
	}

	function getRandomShellPositionH() {
		return fitShellPositionInBoundsH(Math.random());
	}

	function getRandomShellPositionV() {
		return fitShellPositionInBoundsV(Math.random());
	}

	function getRandomShellSize() {
		const baseSize = selectors.shellSize();
		const maxVariance = Math.min(2.5, baseSize);
		const variance = Math.random() * maxVariance;
		const size = baseSize - variance;
		const height = maxVariance === 0 ? Math.random() : 1 - variance / maxVariance;
		const centerOffset = Math.random() * (1 - height * 0.65) * 0.5;
		const x = Math.random() < 0.5 ? 0.5 - centerOffset : 0.5 + centerOffset;
		return {
			size,
			x: fitShellPositionInBoundsH(x),
			height: fitShellPositionInBoundsV(height),
		};
	}

	function launchShellFromConfig(event) {
		const shell = new Shell(shellFromConfig(selectors.shellSize()));
		const { width, height } = getMainStageSize();

		shell.launch(event ? event.x / width : getRandomShellPositionH(), event ? 1 - event.y / height : getRandomShellPositionV());
	}

	function seqRandomShell() {
		const size = getRandomShellSize();
		const shell = new Shell(shellFromConfig(size.size));
		shell.launch(size.x, size.height);

		let extraDelay = shell.starLife;
		if (shell.fallingLeaves) {
			extraDelay = 4600;
		}

		return 900 + Math.random() * 600 + extraDelay;
	}

	function seqRandomFastShell() {
		const shellType = randomFastShell();
		const size = getRandomShellSize();
		const shell = new Shell(shellType(size.size));
		shell.launch(size.x, size.height);

		let extraDelay = shell.starLife;

		return 900 + Math.random() * 600 + extraDelay;
	}

	function seqTwoRandom() {
		const size1 = getRandomShellSize();
		const size2 = getRandomShellSize();
		const shell1 = new Shell(shellFromConfig(size1.size));
		const shell2 = new Shell(shellFromConfig(size2.size));
		const leftOffset = Math.random() * 0.2 - 0.1;
		const rightOffset = Math.random() * 0.2 - 0.1;
		shell1.launch(0.3 + leftOffset, size1.height);
		setTimeout(() => {
			shell2.launch(0.7 + rightOffset, size2.height);
		}, 100);

		let extraDelay = Math.max(shell1.starLife, shell2.starLife);
		if (shell1.fallingLeaves || shell2.fallingLeaves) {
			extraDelay = 4600;
		}

		return 900 + Math.random() * 600 + extraDelay;
	}

	function seqTriple() {
		const shellType = randomFastShell();
		const baseSize = selectors.shellSize();
		const smallSize = Math.max(0, baseSize - 1.25);

		const offset = Math.random() * 0.08 - 0.04;
		const shell1 = new Shell(shellType(baseSize));
		shell1.launch(0.5 + offset, 0.7);

		const leftDelay = 1000 + Math.random() * 400;
		const rightDelay = 1000 + Math.random() * 400;

		setTimeout(() => {
			const innerOffset = Math.random() * 0.08 - 0.04;
			const shell2 = new Shell(shellType(smallSize));
			shell2.launch(0.2 + innerOffset, 0.1);
		}, leftDelay);

		setTimeout(() => {
			const innerOffset = Math.random() * 0.08 - 0.04;
			const shell3 = new Shell(shellType(smallSize));
			shell3.launch(0.8 + innerOffset, 0.1);
		}, rightDelay);

		return 4000;
	}

	function seqPyramid() {
		const barrageCountHalf = IS_DESKTOP ? 7 : 4;
		const largeSize = selectors.shellSize();
		const smallSize = Math.max(0, largeSize - 3);
		const randomMainShell = Math.random() < 0.78 ? crysanthemumShell : ringShell;
		const randomSpecialShell = randomShell;

		function launchShell(x, useSpecial) {
			const isRandom = selectors.shellName() === "Random";
			const shellType = isRandom ? (useSpecial ? randomSpecialShell : randomMainShell) : shellTypes[selectors.shellName()];
			const shell = new Shell(shellType(useSpecial ? largeSize : smallSize));
			const height = x <= 0.5 ? x / 0.5 : (1 - x) / 0.5;
			shell.launch(x, useSpecial ? 0.75 : height * 0.42);
		}

		let count = 0;
		let delay = 0;
		while (count <= barrageCountHalf) {
			if (count === barrageCountHalf) {
				setTimeout(() => {
					launchShell(0.5, true);
				}, delay);
			} else {
				const offset = (count / barrageCountHalf) * 0.5;
				const delayOffset = Math.random() * 30 + 30;
				setTimeout(() => {
					launchShell(offset, false);
				}, delay);
				setTimeout(() => {
					launchShell(1 - offset, false);
				}, delay + delayOffset);
			}

			count++;
			delay += 200;
		}

		return 3400 + barrageCountHalf * 250;
	}

	function seqSmallBarrage() {
		seqSmallBarrage.lastCalled = Date.now();
		const barrageCount = IS_DESKTOP ? 11 : 5;
		const specialIndex = IS_DESKTOP ? 3 : 1;
		const shellSize = Math.max(0, selectors.shellSize() - 2);
		const randomMainShell = Math.random() < 0.78 ? crysanthemumShell : ringShell;
		const randomSpecialShell = randomFastShell();

		function launchShell(x, useSpecial) {
			const isRandom = selectors.shellName() === "Random";
			const shellType = isRandom ? (useSpecial ? randomSpecialShell : randomMainShell) : shellTypes[selectors.shellName()];
			const shell = new Shell(shellType(shellSize));
			const height = (Math.cos(x * 5 * Math.PI + PI_HALF) + 1) / 2;
			shell.launch(x, height * 0.75);
		}

		let count = 0;
		let delay = 0;
		while (count < barrageCount) {
			if (count === 0) {
				launchShell(0.5, false);
				count += 1;
			} else {
				const offset = (count + 1) / barrageCount / 2;
				const delayOffset = Math.random() * 30 + 30;
				const useSpecial = count === specialIndex;
				setTimeout(() => {
					launchShell(0.5 + offset, useSpecial);
				}, delay);
				setTimeout(() => {
					launchShell(0.5 - offset, useSpecial);
				}, delay + delayOffset);
				count += 2;
			}
			delay += 200;
		}

		return 3400 + barrageCount * 120;
	}
	seqSmallBarrage.cooldown = 15000;
	seqSmallBarrage.lastCalled = Date.now();

	const sequences = [seqRandomShell, seqTwoRandom, seqTriple, seqPyramid, seqSmallBarrage];

	let isFirstSeq = true;
	const finaleCount = 32;
	let currentFinaleCount = 0;
	function startSequence() {
		if (isFirstSeq) {
			isFirstSeq = false;
			if (IS_HEADER) {
				return seqTwoRandom();
			}
			const shell = new Shell(crysanthemumShell(selectors.shellSize()));
			shell.launch(0.5, 0.5);
			return 2400;
		}

		if (selectors.finale()) {
			seqRandomFastShell();
			if (currentFinaleCount < finaleCount) {
				currentFinaleCount++;
				return 170;
			}
			currentFinaleCount = 0;
			return 6000;
		}

		const rand = Math.random();

		if (rand < 0.08 && Date.now() - seqSmallBarrage.lastCalled > seqSmallBarrage.cooldown) {
			return seqSmallBarrage();
		}

		if (rand < 0.1) {
			return seqPyramid();
		}

		if (rand < 0.6 && !IS_HEADER) {
			return seqRandomShell();
		} else if (rand < 0.8) {
			return seqTwoRandom();
		}
		return seqTriple();
	}

	function scheduleIntroSequence() {
		if (introSequencePlayed || IS_HEADER) return;
		introSequencePlayed = true;
		setTimeout(() => {
			if (!isRunning()) return;
			seqTwoRandom();
		}, 1200);
	}

	return {
		shellNames,
		launchShellFromConfig,
		startSequence,
		scheduleIntroSequence,
		sequences,
	};
}
