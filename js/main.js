const MUTATION_CHANCE = 0.01; // 0 to 1
const MUTATION_AMOUNT = 25; // 1 to 255
const MAX_POPULATION = 15; // 2+
const GENERATION_TIME = 30; // 1+
const FOOD_COUNT = 70; // 1+
const PEBBLE_COUNT = 30; // 0+
const THROW_DISTANCE = 100; // 1+
const WIDTH = window.innerWidth - 15;
const HEIGHT = window.innerHeight - 15;
var SHOW_BRAIN = false;

Math.TAU = Math.PI * 2;

/*
	DNA Structure:
		A Uint8Array, each between 0 and 255.
		
		0-2:
			Color, in RGB form.
		
		3-6:
			Allocation to speed, strength, vision, and health of neuret.
		
		7-125:
			Neural network connections.
		
		126-127:
			Name
	
	Inputs (in order):
		See food ahead
		See food left
		See food right
		See enemy ahead
		See enemy left
		See enemy right
		See pebble ahead
		See pebble left
		See pebble right
		Have pebble
		Health
		11 tick clock
		37 tick clock
		103 tick clock
		279 tick clock
		500 tick clock
	
	Outputs (in order):
		Forward
		Back
		Left slowly
		Left quickly
		Right slowly
		Right quickly
		Throw pebble
		Drop pebble
	
*/

var world;

function init() {
	world = new World();
	
	tick();
}

function tick() {
	world.tick();
	
	window.requestAnimationFrame(tick);
}

function World () {
	this.renderer = new Renderer();
	this.neurets = [];
	this.food = [];
	this.pebbles = [];
	this.generation = 1;
	this.frame = 0;
	
	for(var i = 0; i < MAX_POPULATION; i++) {
		var x = Math.random() * WIDTH;
		var y = Math.random() * HEIGHT;
		this.neurets.push(new Neuret(false, x, y));
	}
	
	this.tick = function () {
		for (var i in this.neurets) {
			this.neurets[i].tick();
		}
		
		if (this.food.length < FOOD_COUNT) {
			var x = Math.random() * WIDTH;
			var y = Math.random() * HEIGHT;
			this.food.push(new Food(x, y));
		}
		
		if (this.pebbles.length < PEBBLE_COUNT) {
			var x = Math.random() * WIDTH;
			var y = Math.random() * HEIGHT;
			this.pebbles.push(new Pebble(x, y));
		}
		
		for (var i in this.food) {
			for (var j in this.neurets) {
				var f = this.food[i];
				var n = this.neurets[j];
				var dx = f.x - n.x;
				var dy = f.y - n.y;
				if (dx * dx + dy * dy < 100) {
					f.kill = true;
					n.food++;
					n.health += 10;
				}
			}
		}
		
		for (var i in this.pebbles) {
			this.pebbles[i].tick();
			
			for (var j = 0; j < this.neurets.length; j++) {
				var p = this.pebbles[i];
				var n = this.neurets[j];
				var dx = p.x - n.x;
				var dy = p.y - n.y;
				if (dx * dx + dy * dy < 100) {
					if (p.killing) {
						for (var k = 0; k < 5; k++) {
							var x = (Math.random() - 0.5) * 40 + n.x;
							var y = (Math.random() - 0.5) * 40 + n.y;
							this.food.push(new Food(x, y));
						}
						//this.neurets.slice(j--, 1);
						p.kill = true;
					} else if(!n.hasPebble) {
						p.kill = true;
						n.hasPebble = true;
					}
				}
			}
		}
		
		for (var i = 0; i < this.food.length; i++) {
			if (this.food[i].kill) {
				this.food.splice(i, 1);
				i--;
			}
		}
		
		for (var i = 0; i < this.pebbles.length; i++) {
			if (this.pebbles[i].kill) {
				this.pebbles.splice(i, 1);
				i--;
			}
		}
		
		if (this.frame++ > GENERATION_TIME * 60) {
			var bestDna = [];
			this.frame = 0;
			
			this.neurets.sort(function (a, b) {
				return b.food - a.food;
			});
			
			var n = this.neurets;
			
			bestDna.push(n[0], n[0], n[0], n[1], n[2]);
			q = bestDna;
			
			this.neurets = [];
			
			for(var i = 0; i < MAX_POPULATION; i++) {
				var x = Math.random() * WIDTH;
				var y = Math.random() * HEIGHT;
				var p = bestDna[Math.random() * 5 | 0];
				this.neurets.push(new Neuret(p, x, y, i));
			}
		}
		
		this.renderer.render();
	}
}

function Renderer () {
	var canvas = document.getElementsByTagName('canvas')[0];
	var context = canvas.getContext('2d');
	canvas.width = WIDTH;
	canvas.height = HEIGHT;
	
	this.render = function () {
		context.clearRect(0, 0, canvas.width, canvas.height);
		context.globalAlpha = 0.8;
		
		for (var i in world.food) {
			var food = world.food[i];
			
			context.beginPath();
			context.arc(food.x, food.y, 5, 0, 2 * Math.PI, false);
			context.fillStyle = '#5c8';
			context.fill();
			context.closePath();
		}
		
		for (var i in world.pebbles) {
			var pebble = world.pebbles[i];
			
			context.beginPath();
			context.arc(pebble.x, pebble.y, 5, 0, 2 * Math.PI, false);
			context.fillStyle = pebble.killing ? '#944' : '#444';
			context.fill();
			context.closePath();
		}
		
		for (var i in world.neurets) {
			var neuret = world.neurets[i];
			
			context.beginPath();
			context.arc(neuret.x, neuret.y, 12, 0, 2 * Math.PI, false);
			context.fillStyle = neuret.color;
			context.fill();
			context.fillStyle = neuret.hasPebble ? '#f00' : i == 0 ? '#fff' : '#000';
			context.globalAlpha = neuret.hasPebble ? 1 : 0.5;
			context.fill();
			context.closePath();
			
			context.beginPath();
			context.moveTo(neuret.x, neuret.y);
			context.arc(neuret.x, neuret.y, 10, 0.1 + neuret.a, -0.1 + neuret.a);
			context.lineTo(neuret.x, neuret.y);
			context.fillStyle = neuret.color;
			context.globalAlpha = 1;
			context.fill();
			
			context.fillStyle = '#f00';
			var d = neuret.debug;
			var b = 0;
			
			for (var j = 0; j < 3; j++) {
				context.fillStyle = ['#0f0', '#f00', '#666'][j];
				context.globalAlpha = 0.2;
				if (d[b++]) {
					context.moveTo(neuret.x, neuret.y);
					context.arc(neuret.x, neuret.y, neuret.vision, -0.1 + neuret.a, 0.1 + neuret.a);
					context.lineTo(neuret.x, neuret.y);
					context.fill();
				}
				context.globalAlpha = 0.1;
				if (d[b++]) {
					context.moveTo(neuret.x, neuret.y);
					context.arc(neuret.x, neuret.y, neuret.vision, -2.5 + neuret.a, -0.1 + neuret.a);
					context.lineTo(neuret.x, neuret.y);
					context.fill();
				}
				context.globalAlpha = 0.1;
				if (d[b++]) {
					context.moveTo(neuret.x, neuret.y);
					context.arc(neuret.x, neuret.y, neuret.vision, 0.1 + neuret.a, 2.5 + neuret.a);
					context.lineTo(neuret.x, neuret.y);
					context.fill();
				}
			}
			
			context.globalAlpha = 1;
		}
		
		var net = world.neurets[0].brain;
		context.lineWidth = 1;
		
		var a = 0;
		var cx = WIDTH / 2;
		var cy = HEIGHT / 2;
		var r = Math.min(WIDTH, HEIGHT) / 2 - 50;
		
		if (!SHOW_BRAIN) return;
		
		context.beginPath();
		context.arc(cx, cy, r + 10, 0, Math.TAU, false);
		context.fillStyle = '#fff';
		context.globalAlpha = 0.5;
		context.fill();
		context.closePath();
		
		for (var i in net.neurons) {
			var x = Math.cos(a) * r + cx;
			var y = Math.sin(a) * r + cy;
			var n = net.neurons[i];
			var v = n.value;
			var f1 = n.from1 * (Math.TAU / 56);
			var f2 = n.from2 * (Math.TAU / 56);
			context.globalAlpha = 1;
			context.fillStyle = 'rgb(' + v + ',' + v + ',0)';
			if (i > 40) {
				context.fillStyle = 'rgb(' + (v + 50) + ',0,0)';
				context.fillRect(x - 3, y - 3, 6, 6);
			} else if (i < 9) {
				context.fillStyle = v > 64 ? '#00f' : '#004';
				context.fillRect(x - 3, y - 3, 6, 6);
			} else {
				context.fillRect(x - 2, y - 2, 4, 4);
			}
			var f = f1;
			v = n.from1 ? net.neurons[n.from1].value : 0;
			context.lineWidth = Math.abs(n.multiplier);
			for (var j = 0; j < 2; j++) {
				context.beginPath();
				context.moveTo(Math.cos(a) * (r - 3) + cx, Math.sin(a) * (r - 3) + cy);
				context.lineTo(Math.cos(f) * (r - 3) + cx, Math.sin(f) * (r - 3) + cy);
				context.globalAlpha = 0.4;
				context.strokeStyle = 'rgb(' + v + ',' + v + ',0)';
				if (n.from1) context.stroke();
				context.closePath();
				f = f2;
				v = n.from2 ? net.neurons[n.from2].value : 0;
			}
			a += (Math.TAU / 56);
		}
//		*/
	};
}

function Food (x, y) {
	this.x = x;
	this.y = y;
}

function Pebble (x, y, xvel, yvel) {
	this.x = x;
	this.y = y;
	this.xvel = xvel || 0;
	this.yvel = yvel || 0;
	this.killing = false;
	
	this.tick = function () {
		this.killing = this.xvel * this.xvel + this.yvel * this.yvel > 1;
		this.x += this.xvel;
		this.y += this.yvel;
		this.xvel *= 0.95;
		this.yvel *= 0.95;
		if (this.x >= WIDTH - 5 || this.y >= HEIGHT - 5 || this.x <= 5 || this.y <= 5) {
			this.xvel = 0;
			this.yvel = 0;
		}
		this.x = Math.max(Math.min(this.x, WIDTH - 5), 5);
		this.y = Math.max(Math.min(this.y, HEIGHT - 5), 5);
	}
}

function randomDna () {
	var dna = new Uint8Array(128);
	
	for (var i in dna) {
		dna[i] = Math.random() * 255 | 0;
	}
	
	return dna;
}

function alterDna (_dna) {
	var dna = new Uint8Array(_dna);
	
	for (var k = 0; k < dna.length; k++) {
		if (Math.random() < MUTATION_CHANCE || k < 3) {
			var change = (Math.random() - 0.5) * MUTATION_AMOUNT * 2;
			dna[k] += change;
			dna[k] = Math.min(255, Math.max(0, dna[k])) | 0;
		}
	}
	
	return dna;
}

window.addEventListener('load', init);

