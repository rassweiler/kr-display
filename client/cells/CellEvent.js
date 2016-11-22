Template.CellEvent.onCreated(function(){
	var self = this;
	self.autorun(function(){
		var name = FlowRouter.getParam('cellName');
		self.subscribe('cell', name);
	});
});

Template.CellEvent.helpers({
	cell:()=>{
		var name = FlowRouter.getParam('cellName');
		return Cell.findOne({name:name});
	},
	getNow:()=>{
		var date = moment().format("YYYY-MM-DDTHH:mm");
		return date;
	}
});