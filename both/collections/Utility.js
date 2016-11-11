/*
Utility Schema. Uses Collection2 and simpleschema. 
NOTE: This isn't used yet beyond the inital utility populating.
This is for future features.
*/

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