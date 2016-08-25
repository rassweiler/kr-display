Template.Cell.onCreated(function(){
	var self = this;
	self.autorun(function(){
		var id = FlowRouter.getParam('_id');
		self.subscribe('cell', id);
	});
});

Template.Cell.helpers({
	cell:()=>{
		var id = FlowRouter.getParam('_id');
		return Cell.findOne({_id:id});
	}
});