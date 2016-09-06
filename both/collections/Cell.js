Cell = new Mongo.Collection('cell');

//TODO: Add proper checks -----------
Cell.allow({
	insert: function(){
		return true;
	},
	update: function(){
		return true;
	},
	remove: function(){
		return true;
	}
});

CellSchema = new SimpleSchema({
	name:{
		type: String,
		label: "Cell Name"
	},
	fault:{
		type:Boolean,
		label: "Cell Down"
	},
	downtime:{
		type:Number,
		label: "Downtime"
	},
	totalDowntime:{
		type:Number,
		label: "Total Downtime"
	},
	answered:{
		type:Boolean,
		label: "Call Answered"
	},
	lastCT:{
		type:Number,
		label: "Last Cycle Time"
	},
	bestCT:{
		type:Number,
		label: "Best Cycle Time"
	},
	averageCT:{
		type:Number,
		label: "Average Cycle Time"
	},
	targetCT:{
		type:Number,
		label: "Target Cycle Time"
	},
	partsMade:{
		type:Number,
		label: "Parts Made"
	},
	partsTarget:{
		type:Number,
		label: "Parts Made Target"
	},
	cycleVariance:{
		type:Array
	},
	'cycleVariance.$':{
		type:Number
	},
	autoRunning:{
		type:Array
	},
	'autoRunning.$':{
		type:Number
	},
	timeStamp:{
		type:Array
	},
	'timeStamp.$':{
		type:Date
	}
});

Cell.attachSchema(CellSchema);