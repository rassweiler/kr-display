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
		label:'Part Name',
		optional: true
	},
	'parts.$.current':{
		type:Number,
		label:'Parts Made',
		optional: true
	},
	'parts.$.target':{
		type:Number,
		label:'Parts Target',
		optional: true
	},
	'parts.$.targetCT':{
		type:Number,
		label:'Target Cycle Time',
		optional: true
	},
	'parts.$.lastCT':{
		type:Number,
		label:'Last Cycle Time',
		optional: true
	},
	'parts.$.averageCT':{
		type:Number,
		label:'Average Cycle Time',
		optional: true
	},
	'parts.$.bestCT':{
		type:Number,
		label:'Best Cycle Time',
		optional: true
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