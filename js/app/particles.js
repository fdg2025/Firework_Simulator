import { PI_2 } from "./constants.js";
import { COLOR_CODES_W_INVIS } from "./colors.js";

function createParticleCollection() {
	const collection = {};
	COLOR_CODES_W_INVIS.forEach((color) => {
		collection[color] = [];
	});
	return collection;
}

export const BurstFlash = {
	active: [],
	_pool: [],

	_new() {
		return {};
	},

	add(x, y, radius) {
		const instance = this._pool.pop() || this._new();

		instance.x = x;
		instance.y = y;
		instance.radius = radius;

		this.active.push(instance);
		return instance;
	},

	returnInstance(instance) {
		this._pool.push(instance);
	},
};

export const Star = {
	airDrag: 0.98,
	airDragHeavy: 0.992,

	active: createParticleCollection(),
	_pool: [],

	_new() {
		return {};
	},

	preallocate(count) {
		for (let i = 0; i < count; i++) {
			this._pool.push(this._new());
		}
	},

	add(x, y, color, angle, speed, life, speedOffX, speedOffY, size = 3) {
		const instance = this._pool.pop() || this._new();
		instance.visible = true;
		instance.heavy = false;
		instance.x = x;
		instance.y = y;
		instance.prevX = x;
		instance.prevY = y;
		instance.color = color;
		instance.speedX = Math.sin(angle) * speed + (speedOffX || 0);
		instance.speedY = Math.cos(angle) * speed + (speedOffY || 0);
		instance.life = life;
		instance.fullLife = life;
		instance.size = size;
		instance.spinAngle = Math.random() * PI_2;
		instance.spinSpeed = 0.8;
		instance.spinRadius = 0;
		instance.sparkFreq = 0;
		instance.sparkSpeed = 1;
		instance.sparkTimer = 0;
		instance.sparkColor = color;
		instance.sparkLife = 750;
		instance.sparkLifeVariation = 0.25;
		instance.strobe = false;

		this.active[color].push(instance);
		return instance;
	},

	returnInstance(instance) {
		instance.onDeath && instance.onDeath(instance);
		instance.onDeath = null;
		instance.secondColor = null;
		instance.transitionTime = 0;
		instance.colorChanged = false;
		this._pool.push(instance);
	},
};

export const Spark = {
	drawWidth: 0,
	airDrag: 0.9,

	active: createParticleCollection(),
	_pool: [],

	_new() {
		return {};
	},

	preallocate(count) {
		for (let i = 0; i < count; i++) {
			this._pool.push(this._new());
		}
	},

	add(x, y, color, angle, speed, life) {
		const instance = this._pool.pop() || this._new();

		instance.x = x;
		instance.y = y;
		instance.prevX = x;
		instance.prevY = y;
		instance.color = color;
		instance.speedX = Math.sin(angle) * speed;
		instance.speedY = Math.cos(angle) * speed;
		instance.life = life;

		this.active[color].push(instance);
		return instance;
	},

	returnInstance(instance) {
		this._pool.push(instance);
	},
};
