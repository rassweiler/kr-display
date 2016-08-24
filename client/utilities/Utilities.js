Template.Utilities.onCreated(function(){
	var self = this;
	self.autorun(function(){
		self.subscribe('utilities');
	});
});

Template.Utilities.helpers({
	utilities:()=>{
		return Utility.find({});
	}
});