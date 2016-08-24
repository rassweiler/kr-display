Template.Cell.onCreated(function(){
	var self = this;
	self.autorun(function(){
		self.subscribe('cells');
	});
});

Template.Cell.helpers({
	cell:()=>{
		var id = FlowRouter.getParam('_id');
		return Cell.findOne({_id:id});
	}
});