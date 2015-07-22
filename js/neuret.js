function Neuret (parent, x, y, i) {
	var self = this;
	
	var dna = parent ? i < 3 ? parent.dna : alterDna(parent.dna) : randomDna();
	
	this.dna = dna;
	this.x = x;
	this.y = y;
	this.a = 0;
	this.food = 0;
	this.hasPebble = false;
	
	this.debug = 0;
	
	this.color = 'rgb(' + dna[0] + ',' + dna[1] + ',' + dna[2] + ')';
	
	var total = dna[3] + dna[4] + dna[5] + dna[6];
	
	if (total == 0) {
		dna[3] = 1;
		total = 1;
	}
	
	this.speed = dna[3] / total * 255 | 0;
	this.strength = dna[4] / total * 255 | 0;
	this.vision = dna[5] / total * 255 | 0;
	this.health = dna[6] / total * 255 | 0;
	
	var sqVision = this.vision * this.vision;
	
	this.name = {
		first: names.first[Math.random() * names.first.length | 0],
		last: parent ? parent.name.last : names.last[Math.random() * names.last.length | 0]
	};
	
	this.brain = new NeuralNetwork(dna);
	
	var scan = function (list, start, end, range) {
		start = (start + self.a + Math.TAU) % Math.TAU;
		end = (end + self.a + Math.TAU) % Math.TAU;
		
		for (var i = 0; i < list.length; i++) {
			if (list[i] == self) continue;
			
			var x = list[i].x;
			var y = list[i].y;
			
			var dx = x - self.x;
			var dy = y - self.y;
			if (dx * dx + dy * dy > sqVision + 100) continue;
			
			var angTo = Math.atan2(y - self.y, x - self.x);
			angTo = (angTo + Math.TAU) % Math.TAU;
			
			if (start > end) {
				var inside = angTo < end
			} else {
				var inside = angTo > start && angTo < end;
			}
			
			if (inside) return 255;
		}
		
		return 0;
	};
	
	var tick = 0;
		
	var lists = ['food', 'neurets', 'pebbles'];
	var angles = [[-0.1, 0.1], [-2.5, -0.1], [0.1, 2.5]];
	
	this.tick = function () {
		var input = [];
		
		for (var i = 0; i < lists.length; i++) {
			for (var j in angles) {
				input.push(scan(world[lists[i]], angles[j][0], angles[j][1], this.vision));
			}
		}
		
		input.push(this.hasPebble ? 255 : 0, this.health);
		input.push(!(tick % 11) * 255, !(tick % 37) * 255, !(tick % 103) * 255);
		input.push(!(tick % 279) * 255, !(tick % 500) * 255);
		
		var output = this.brain.tick(input);
		
		this.debug = input;
		
		if (output.forward) {
			this.x += Math.cos(this.a) * this.speed * 0.01 * (this.hasPebble ? 0.4 : 1);
			this.y += Math.sin(this.a) * this.speed * 0.01 * (this.hasPebble ? 0.4 : 1);
		}
		
		if (output.back) {
			this.x -= Math.cos(this.a) * this.speed * 0.005 * (this.hasPebble ? 0.4 : 1);
			this.y -= Math.sin(this.a) * this.speed * 0.005 * (this.hasPebble ? 0.4 : 1);
		}
		
		if (output.leftSlowly) {
			this.a -= 0.03;
		}
		
		if (output.leftQuickly) {
			this.a -= 0.1;
		}
		
		if (output.rightSlowly) {
			this.a += 0.03;
		}
		
		if (output.rightQuickly) {
			this.a += 0.1;
		}
		
		if (output.throwPebble && this.hasPebble) {
			var xv = Math.cos(this.a);
			var yv = Math.sin(this.a);
			world.pebbles.push(new Pebble(self.x + xv * 15, self.y + yv * 15, xv * this.strength * 0.1 + 1, yv * this.strength * 0.1 + 1));
			this.hasPebble = false;
		}
		
		if (output.dropPebble && this.hasPebble) {
			var xv = Math.cos(this.a);
			var yv = Math.sin(this.a);
			world.pebbles.push(new Pebble(self.x - xv * 15, self.y - yv * 15));
			this.hasPebble = false;
		}
		
		if (self.x > WIDTH - 10 || self.x < 10 || self.y > HEIGHT - 10 || self.y < 10) self.a += Math.PI;
		if (self.x > WIDTH - 10) self.x = WIDTH - 10;
		if (self.x < 10) self.x = 10;
		if (self.y > HEIGHT - 10) self.y = HEIGHT - 10;
		if (self.y < 10) self.y = 10;
		
		tick++;
	};
	
	this.getDna = function () {
		return Array.apply(0, dna);
	};
}

var names = {
	first: [
		'Able',
		'Angry',
		'Weird',
		'Funny',
		'Stupid',
		'Silly',
		'Smelly',
		'Odd',
		'Average',
		'Strange',
		'Quick',
		'Happy',
		'Dangerous',
		'Cautious',
		'Sleepy',
		'Depressed',
		'Clever',
		'Important',
		'Friendly',
		'Fat',
		'Hungry',
		'Desperate',
		'Fast',
		'Crazy',
		'Sane',
		'Suspicious'
	],
	last: [
		'Stomper',
		'Attacker',
		'Runner',
		'Fighter',
		'Eater',
		'Sprinter',
		'Thrower',
		'Hurler',
		'Jumper',
		'Roller',
		'Chaser',
		'Joker',
		'Watcher',
		'Flyer',
		'Killer',
		'Saver',
		'Finder',
		'Winner',
		'Diver',
		'Swimmer',
		'Eater'
	]
};

