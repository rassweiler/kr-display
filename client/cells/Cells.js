Template.Cells.onCreated(function(){
	var self = this;
	self.autorun(function(){
		self.subscribe('cells');
	});
});

Template.Cells.helpers({
	cells:()=>{
		return Cell.find({});
	}
});