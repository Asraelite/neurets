function NeuralNetwork (dna) {
	var self = this;
	
	this.neurons = [];
	
	for (var i = 7; i < 31; i += 3) {
		var neuron = new Neuron(self, (dna[i] % 48) + 8, (dna[i + 1] % 48) + 8, dna[i + 2], false);
		this.neurons.push(neuron);
	}
	
	for (var i = 31; i < 126; i += 3) {
		var neuron = new Neuron(self, (dna[i] % 48) + 8, (dna[i + 1] % 48) + 8, dna[i + 2], false);
		this.neurons.push(neuron);
	}
	
	for (var i = 0; i < 16; i++) {
		var neuron = new Neuron(self, false, false, 128, i);
		this.neurons.push(neuron);
	}
	
	this.tick = function (input) {
		for (var i in self.neurons) {
			self.neurons[i].clear();
		}
		
		for (var i in self.neurons) {
			self.neurons[i].tick(input);
		}
		
		var output = {
			forward: false,
			back: false,
			leftSlowly: false,
			leftQuickly: false,
			rightSlowly: false,
			rightQuickly: false,
			throwPebble: false,
			dropPebble: false
		};
		
		var j = 0;
		
		for (var i in output) {
			output[i] = self.neurons[j++].value > 64;
		}
		
		return output;
	};
}

function Neuron (network, from1, from2, multiplier, input) {
	var self = this;
	
	this.multiplier = multiplier / 128;
	if (multiplier > 250) this.multiplier = -1;
	this.from1 = from1;
	this.from2 = from2;
	this.value = 0;
	
	this.clear = function () {
		//self.value = 0;
	};
	
	this.tick = function (_input) {
		if (input !== false) {
			self.value = _input[input];
		} else {
			var v = (network.neurons[from1].value + network.neurons[from2].value) / 2;
			var nv = self.multiplier < 0 ? (255 - v) / 2 : v * self.multiplier;
			if(this.value > nv) nv = (this.value * 4 + nv) / 5;
			self.value = Math.min(Math.max(nv, 0), 255) | 0;
		}
	};
}

