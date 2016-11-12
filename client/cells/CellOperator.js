Template.CellOperator.onCreated(function(){
	var self = this;
	self.autorun(function(){
		var name = FlowRouter.getParam('cellName');
		self.subscribe('cell', name);
	});
});

Template.CellOperator.helpers({
	cell:()=>{
		var name = FlowRouter.getParam('cellName');
		return Cell.findOne({name:name});
	}
});