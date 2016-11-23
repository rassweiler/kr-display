/*
Cell Schema. Uses Collection2 and simpleschema. 
NOTE: the server pretty much bypasses this at the moment but this still holds for any client side.
All the cell structural setups is done in main.js.
*/

Cell = new Mongo.Collection('cell');

CellSchema = new SimpleSchema({
	name:{
		type: String,
		label: "Cell Name"
	},
	group:{
		type: String,
		label: "Cell Group",
		optional:true
	},
	shift:{
		type: String,
		label: "Current Shift",
		autoValue: function() {
			if (this.isInsert) {
				return "";
			}
		}
	},
	operator:{
		type: String,
		label: "Current Operator",
		autoValue: function() {
			if (this.isInsert) {
				return "";
			}
		}
	},
	startTime:{
		type: Date,
		label: "Start Time",
		optional:true
	},
	runTime:{
		type: Number,
		label: "Run Time",
		optional:true
	},
	autoTime:{
		type: Number,
		label: "Auto Time",
		optional:true
	},
	downtime:{
		type:Number,
		label: "Downtime",
		autoValue: function() {
			if (this.isInsert) {
				return 0;
			}
		}
	},
	totalDowntime:{
		type:Number,
		label: "Total Downtime",
		autoValue: function() {
			if (this.isInsert) {
				return 0;
			}
		}
	},
	andonOn:{
		type:Boolean,
		label: "Cell Down",
		autoValue: function() {
			if (this.isInsert) {
				return false;
			}
		}
	},
	andonAnswered:{
		type:Boolean,
		label: "Call Answered",
		autoValue: function() {
			if (this.isInsert) {
				return false;
			}
		}
	},
	parts:{
		type:Object,
		label: "Cell Parts",
		optional:true
	},
	'parts.$':{
		type:Object,
		label: "Cell Part",
		optional:true
	},
	'parts.$.name':{
		type:String,
		label: "Part Name",
		optional:true
	},
	'parts.$.current':{
		type:Number,
		label: "Part Count",
		optional:true
	},
	'parts.$.target':{
		type:Number,
		label: "Part Target",
		optional:true
	},
	'parts.$.targetCT':{
		type:Number,
		label: "Target Cycle Time",
		optional:true
	},
	'parts.$.lastCT':{
		type:Number,
		label: "Last Cycle Time",
		optional:true
	},
	'parts.$.bestCT':{
		type:Number,
		label: "Best Cycle Time",
		optional:true
	},
	'parts.$.averageCT':{
		type:Number,
		label: "Average Cycle Time",
		optional:true
	},
	'parts.$.variance':{
		type:[Number],
		label: "Cycle Time Variance",
		optional:true
	},
	'parts.$.timeStamp':{
		type:[Date],
		label: "Cycle Time Variance Time",
		optional:true
	},
	autoRunning:{
		type:Object,
		label: "Cell Autorunning",
		optional:true,
		autoValue: function() {
			if (this.isInsert) {
				return {values:[],timeStamps:[]};
			}
		}
	},
	'autoRunning.values':{
		type:[Number],
		label: "Autorunning Values",
		optional:true
	},
	'autoRunning.timeStamps':{
		type:[Date],
		label: "Autorunning times",
		optional:true
	}
});

Cell.attachSchema(CellSchema);