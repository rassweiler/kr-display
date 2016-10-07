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
	hasCycleTimes:()=>{
		var id = FlowRouter.getParam('_id');
		var cell = Cell.findOne({_id:id});
		return (cell.lastCT > 0 || cell.bestCT > 0 || cell.averageCT > 0 || cell.targetCT > 0) ? true:false
	},
	chartData:()=>{
		var id = FlowRouter.getParam('_id');
		var cell = Cell.findOne({_id:id});
		var timeStamp = cell.timeStamp;
		if(timeStamp.length > 0){
			var l = timeStamp.length;
			for(var i = 0; i < l; ++i){
				var d = Date.parse(timeStamp[i]);
				timeStamp[i] = d;
			}
			timeStamp.unshift('timeStamp');
			var positive = ['positive'];
			var negative = ['negative'];
			for(val in cell.cycleVariance){
				if(cell.cycleVariance[val] > 0){
					positive.push(cell.cycleVariance[val]);
					negative.push(0);
				}else{
					positive.push(0);
					negative.push(cell.cycleVariance[val]);
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
				  x:'timeStamp',
				  columns: [
					timeStamp,
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
		var timeStamp = cell.timeStamp;
		if(timeStamp.length > 0){
			var l = timeStamp.length;
			for(var i = 0; i < l; ++i){
				var d = Date.parse(timeStamp[i]);
				timeStamp[i] = d;
			}
			timeStamp.unshift('timeStamp');
			var autoRunning = cell.autoRunning;
			autoRunning.unshift('autoRunning');
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
				  x:'timeStamp',
				  columns: [
					timeStamp,
					autoRunning
				  ],
				  type: 'area-step',
				  colors: {
						'autoRunning': '#00ff00'
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