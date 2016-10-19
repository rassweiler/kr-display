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
	shift:{
		type: String,
		label: "Current Shift"
	},
	operator:{
		type: Number,
		label: "Current Operator"
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
	'parts.$.targetCT':{
		type:Number,
		label:'Target Cycle Time'
	},
	'parts.$.lastCT':{
		type:Number,
		label:'Last Cycle Time'
	},
	'parts.$.averageCT':{
		type:Number,
		label:'Average Cycle Time'
	},
	'parts.$.bestCT':{
		type:Number,
		label:'Best Cycle Time'
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