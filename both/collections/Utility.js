Utility = new Mongo.Collection('utility');

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