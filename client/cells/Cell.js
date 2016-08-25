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
	},
	chartData:()=>{
		var id = FlowRouter.getParam('_id');
		var cell = Cell.findOne({_id:id});
		var valueX = cell.gap.valueX;
		var l = valueX.length;
		for(var i = 0; i < l; ++i){
			var d = Date.parse(valueX[i]);
			valueX[i] = d;
		}
		valueX.unshift('valueX');
		var positive = ['positive'];
		var negative = ['negative'];
		for(val in cell.gap.valueY){
			if(cell.gap.valueY[val] > 0){
				positive.push(cell.gap.valueY[val]);
				negative.push(0);
			}else{
				positive.push(0);
				negative.push(cell.gap.valueY[val]);
			}
		}
		var a = {
			size: {
				height: 250
			},
			padding: {
				right: 110
			},
			data: {
			  x:'valueX',
			  columns: [
				valueX,
				positive,
				negative
			  ],
			  type: 'area-step',
			  colors: {
					'positive': '#0000ff',
					'negative': '#ff0000'
				}
			},
			axis:{
			  x:{
				type:'timeseries',
				tick:{
				  format:'%H:%M'
				}
			  },
			  y:{
				max:60,
				min:-60
			  }
			},
			legend: {
				show: false
			},
			tooltip: {
				show: false
			}
		};
		return a;
	}
});