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
	},
	getRunPercent:()=>{
		var name = FlowRouter.getParam('cellName');
		var cell = Cell.findOne({name:name});
		if(cell){
			return ((cell.autoTime/cell.runTime)*100);
		}else{
			return null;
		}
	},
	getDateFormat:function(date){
		let date2 = moment(date).format('YYYY MM DD');
		return date2;
	}
});