/*
Model -- could also load this from a server
*/

var mapLocales = [
	{
		clickCount: 0,
		name: 'Tabby',
		imgSrc: 'img/434164568_fea0ad4013_z.jpg',
		imgAttribution: 'https://www.flickr.com/photos/bigtallguy/434164568',
		nicknames: [
			{nickname: "Tabitha"},
			{nickname: "Mrs T"},
			{nickname: "Little Meow Meow Face"}
		]	
	},
	{
		clickCount: 0,
		name: 'Tiger',
		imgSrc: 'img/4154543904_6e2428c421_z.jpg',
		imgAttribution: 'https://www.flickr.com/photos/xshamx/4154543904',
		nicknames: [
			{nickname: "Tigger"},
			{nickname: "Mr Growls"}
		]
	}

]

var ViewModel = function() { 
	var self = this;

	self.setmap = function() {

	};

	this.catList = ko.observableArray([]);

	mapLocales.forEach(function(catItem) {
		self.catList.push(new Cat(catItem));
	});

	this.currentCat = ko.observable(this.catList()[0]);

	this.incrementCounter = function() {
		self.currentCat().clickCount(self.currentCat().clickCount() + 1);
	};

	this.setCat = function(clickedCat) {
		self.currentCat(clickedCat);
	};
}



var Cat = function(data) {
	this.clickCount = ko.observable(data.clickCount);
	this.name = ko.observable(data.name);
	this.imgSrc = ko.observable(data.imgSrc);
	this.imgAttribution = ko.observable(data.imgAttribution);
	this.nicknames = ko.observableArray(data.nicknames);	

	this.level = ko.computed(function() {
		if (this.clickCount() < 5) {
			return "kitten";
		}
		else if (this.clickCount() < 10) {
			return "teen";
		}
		else if (this.clickCount() < 34) {
			return "cat";
		}
		else {
			return "grumpy old man";
		}
	}, this);

}

