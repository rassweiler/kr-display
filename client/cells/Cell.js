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
		if(valueX){
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
					height: 200
				},
				padding: {
					right: 20
				},
				title:{
					text:'Cycle Time Variance'
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
					label:'Time',
					padding: {left:0, right:0},
					tick:{
					  format:'%H:%M'
					}
				  },
				  y:{
					max:60,
					min:-60,
					label:'Seconds',
					padding: {top:0, bottom:0},
					tick: {
						count: 7
					}
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
		}else{
			return null;
		}
	},
	chartData2:()=>{
		var id = FlowRouter.getParam('_id');
		var cell = Cell.findOne({_id:id});
		var valueX2 = cell.gap.valueX;
		console.log(valueX2);
		if(valueX2){
			var l = valueX2.length;
			for(var i = 0; i < l; ++i){
				var d = Date.parse(valueX2[i]);
				valueX2[i] = d;
			}
			valueX2.unshift('valueX2');
			var valueY2 = cell.autoRunning;
			valueY2.unshift('valueY2');
			var a = {
				size: {
					height: 100
				},
				padding: {
					right: 20
				},
				title:{
					text:'Auto Running'
				},
				data: {
				  x:'valueX2',
				  columns: [
					valueX2,
					valueY2
				  ],
				  type: 'area-step',
				  colors: {
						'valueY2': '#00ff00'
					}
				},
				axis:{
				  x:{
					type:'timeseries',
					label:'Time',
					padding: {left:0, right:0},
					tick:{
					  format:'%H:%M'
					}
				  },
				  y:{
					max:1,
					min:0,
					label:'Running',
					padding: {top:0, bottom:0},
					tick: {
						count: 2
					}
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
		}else{
			return null;
		}
	}
});