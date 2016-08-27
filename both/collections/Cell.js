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
		label: "Cell Down",
		optional: true
	},
	answered:{
		type:Boolean,
		label: "Call Answered",
		optional: true
	},
	lastCT:{
		type:Number,
		label: "Last Cycle Time",
		optional: true
	},
	bestCT:{
		type:Number,
		label: "Best Cycle Time",
		optional: true
	},
	averageCT:{
		type:Number,
		label: "Average Cycle Time",
		optional: true
	},
	partsMade:{
		type:Number,
		label: "Parts Made",
		optional: true
	},
	partsTarget:{
		type:Number,
		label: "Parts Made Target",
		optional: true
	},
	gap:{
		type:Object
	},
	'gap.$.valueX':{
		type:Array
	},
	'gap.$.valueX.$':{
		type:Number
	},
	'gap.$.valueY':{
		type:Array
	},
	'gap.$.valueY.$':{
		type:Number
	}
});

Cell.attachSchema(CellSchema);