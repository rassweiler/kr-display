Template.Cell.onCreated(function(){
	var self = this;
	self.autorun(function(){
		var name = FlowRouter.getParam('cellName');
		self.subscribe('cell', name);
	});
});

Template.Cell.helpers({
	hasVariance:function(name){
		var cell = Cell.findOne({name:FlowRouter.getParam('cellName')});
		if(!cell.parts[name].variance){
			return false;
		}
		return (cell.parts[name].variance.length>0)?true:false;
	},
	getCurrentPartId:function(part){
		var name = FlowRouter.getParam('cellName');
		var id = name+part;
		return id;
	},
	parts:function(obj){
		var result = [];
		for (var key in obj) result.push(obj[key]);
		return result;
	},
	cell:()=>{
		var name = FlowRouter.getParam('cellName');
		return Cell.findOne({name:name});
	},
	hasCycleTimes:()=>{
		var name = FlowRouter.getParam('cellName');
		var cell = Cell.findOne({name:name});
		return (cell.lastCT > 0 || cell.bestCT > 0 || cell.averageCT > 0 || cell.targetCT > 0) ? true:false
	},
	partChart:function(part){
		var partName = part;
		var name = FlowRouter.getParam('cellName');
		var cell = Cell.findOne({name:name});
		if(cell.parts[partName]){
			var timeStamp = cell.parts[partName].timeStamp;
			if(!timeStamp){
				return null;
			}
			if(timeStamp && timeStamp.length > 0){
				/*
				var l = timeStamp.length;
				for(var i = 0; i < l; ++i){
					var d = Date.parse(timeStamp[i]);
					timeStamp[i] = d;
				}
				*/
				timeStamp.unshift('timeStamp');
				if(cell.parts[partName].variance.length > 0){
					var positive = ['positive'];
					var negative = ['negative'];
					for(val in cell.parts[partName].variance){
						if(cell.parts[partName].variance[val] > 0){
							positive.push(cell.parts[partName].variance[val]);
							negative.push(0);
						}else{
							positive.push(0);
							negative.push(cell.parts[partName].variance[val]);
						}
					}
					var a = {
						size: {
							height: 100
						},
						padding: {
							right: 20
						},
						title:{
							text:partName+' Cycle Time Variance'
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
							max:40,
							min:-40,
							label:'Seconds',
							padding: {top:0, bottom:0},
							tick: {
								count: 5
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
			}else{
				return null;
			}
		}else{
			return null;
		}
	},
	autoRunningChart:()=>{
		var name = FlowRouter.getParam('cellName');
		var cell = Cell.findOne({name:name});
		var timeStamp = cell.timeStamp;
		if(timeStamp && timeStamp.length > 0){
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