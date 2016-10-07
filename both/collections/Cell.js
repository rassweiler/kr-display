Cell = new Mongo.Collection('cell');

CellSchema = new SimpleSchema({
	name:{
		type: String,
		label: "Cell Name"
	},
	group:{
		type: String,
		label: "Cell Group"
	},
	downtime:{
		type:Number,
		label: "Downtime"
	},
	totalDowntime:{
		type:Number,
		label: "Total Downtime"
	},
	andonOn:{
		type:Boolean,
		label: "Cell Down"
	},
	andonAnswered:{
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
	parts:{
		type:Array
	},
	'parts.$':{
		type:Object,
		optional:true
	},
	'parts.$.name':{
		type:String,
		label:'Part Name'
	},
	'parts.$.current':{
		type:Number,
		label:'Parts Made'
	},
	'parts.$.target':{
		type:Number,
		label:'Parts Target'
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
		type:String
	}
});

Cell.attachSchema(CellSchema);