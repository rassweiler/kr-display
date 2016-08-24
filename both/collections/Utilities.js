Utility = new Mongo.Collection('utility');

//TODO: Add proper checks -----------
Utility.allow({
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

UtilitySchema = new SimpleSchema({
	name:{
		type: String,
		label: "Utility Name"
	},
	fault:{
		type:Boolean,
		label: "Fault"
	}
});

Utility.attachSchema(UtilitySchema);