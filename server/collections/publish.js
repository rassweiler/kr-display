Meteor.publish('cells', function(){
	return Cell.find();
});

Meteor.publish('groups', function(){
	return Group.find();
});

Meteor.publish('utilities', function(){
	return Utility.find();
});