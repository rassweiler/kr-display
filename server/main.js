import { Meteor } from 'meteor/meteor';
var Connection = Tedious.Connection;

Meteor.startup(() => {
	// code to run on server at startup
	var config = Meteor.settings.private.databases[0].config;
	var connection = new Connection(config);
	connection.on('connect', function (err) {
		if (err) return console.error(err);
		var request = new Tedious.Request('SELECT TOP 1 FromPLC, ShiftName, ProductionDate FROM dbo.ProductionResultFromPLC', function (err, rowCount) {
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
		});

		connection.execSql(request);
	});
});