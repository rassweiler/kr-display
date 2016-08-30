import { Meteor } from 'meteor/meteor';
var Connection = Tedious.Connection;

Meteor.startup(() => {
	// code to run on server at startup
	// Remove deleted utilities
	console.log(Date());
	var utilities = Meteor.settings.private.utilities;
	var utility = Utility.find({});
	var remove = [];
	utility.forEach(function(ut){
		var found = false;
		for(val in utilities){
			if(ut.name == utilities[val]){
				found = true;
				break;
			}
		}
		if(!found){
			remove.push(ut.name);
		}
	});
	Utility.remove({'name':{'$in':remove}});
	// Add missing utilities
	for(val in utilities){
		utility = Utility.findOne({name:utilities[val]});
		if(!utility){
			Utility.insert({name: utilities[val], fault: false}, function(error, result) {
				console.log(error);
			});
		}
	}
	// Remove deleted cells
	var cellList = Meteor.settings.private.cells;
	var cells = Cell.find({});
	var remove = [];
	cells.forEach(function(ut){
		var found = false;
		for(val in cellList){
			if(ut.name == cellList[val]){
				found = true;
				break;
			}
		}
		if(!found){
			remove.push(ut.name);
		}
	});
	Cell.remove({'name':{'$in':remove}});
	// Add missing cells
	for(val in cellList){
		cell = Cell.findOne({name:cellList[val]});
		if(!cell){
			Cell.insert({name: cellList[val], fault:false, answered:false,lastCT:0,bestCT:0, averageCT:0,partsMade:0,partsTarget:0, gap:{valueY:[0],valueX:[0]}}, function(error, result) {
				if(error){
					console.log(error);
				}
			});
		}
	}
	//Connect
	var config = Meteor.settings.private.database.config;
	var connection = new Connection(config);
	connection.on('connect', function (err) {
		if (err) return console.error(err);
		var request = new Tedious.Request("SELECT FromPLC, ShiftName, ProductionDate FROM dbo.ProductionResultFromPLC WHERE ShiftName = 'A'", function (err, rowCount) {
			if (err) {
				console.log(err);
			}
		});
		request.on('row', function (columns) {
			console.log(columns);
			/*
			var r = '';
			columns.forEach(function (column) {
				r = r + ' ' + column.value;
			});
			console.log('\n ', r);
			*/
			// "select CycleVariance, DateTime from dbo.ProductionResultFromPLC WHERE DateTime < CURRENT_TIMESTAMP AND DateTime > DateADD(hh, -3, CURRENT_TIMESTAMP)"
			console.log(Date());
		});

		connection.execSql(request);
	});
});