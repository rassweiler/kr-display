//TODO: Add proper checks -----------
Cell.deny({
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

Utility.deny({
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

Meteor.publish('cell', function(id){
	check(id,String);
	return Cell.find({_id:id});
});

Meteor.publish('cells', function(){
	return Cell.find();
});

Meteor.publish('groups', function(){
	return Group.find();
});

Meteor.publish('utilities', function(){
	return Utility.find();
});

Meteor.publish('allJobs', function () {
	return Jobs.find({});
});