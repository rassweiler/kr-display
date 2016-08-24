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
	down:{
		type:Boolean,
		label: "Cell Down"
	},
	answered:{
		type:Boolean,
		label: "Call Answered"
	}
});

Cell.attachSchema(CellSchema);