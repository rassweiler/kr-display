Template.CellList.onCreated(function(){
	var self = this;
	self.autorun(function(){
		self.subscribe('cells');
	});
});

Template.CellList.helpers({
	cells:()=>{
		return Cell.find({},{sort: {group: 1, name: 1}});
	}
});