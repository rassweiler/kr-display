Fiber = Npm.require('fibers');
import { Meteor } from 'meteor/meteor';
var Connection = Tedious.Connection;
// Initialize Logger:
this.log = new Logger();
// Initialize LoggerFile and enable with default settings:
(new LoggerFile(this.log,Meteor.settings.private.log.options)).enable();

Jobs.allow({
	insert: function(){
		return true;
	},
	update: function(){
		return true;
	},
	remove: function(){
		return true;
	}
});

Meteor.startup(() => {
	// Remove old jobs
	Jobs.remove({});
	Jobs.startJobServer();
	var connected = false;
	// code to run on server at startup
	// Remove deleted utilities
	log.info("Started job server");
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
				log.error(error);
				console.log(error);
			});
		}
	}
	log.info("Checked Utilities");
	// Remove deleted cells
	var cellList = Meteor.settings.private.cells;
	var cells = Cell.find({});
	var remove = [];
	cells.forEach(function(ut){
		var found = false;
		for(val in cellList){
			if(ut.name == cellList[val].name){
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
		cell = Cell.findOne({name:cellList[val].name});
		if(!cell){
			Cell.insert({name: cellList[val].name, group: cellList[val].group, shift:"", operator:0, andonOn:false, andonAnswered:false, downtime:0,totalDowntime:0,parts:[], cycleVariance:[],autoRunning:[],timeStamp:[]}, function(error, result) {
				if(error){
					log.error(error);
					console.log(error);
				}
			});
		}
	}
	cell = null;
	log.info("Checked Cells");
	//Start data collection jobs
	var config = Meteor.settings.private.database.config;
	var connection = new Connection(config);

	connection.on('connect', function (err) {
		if (err){
			log.error(err);
			return console.error(err);
		}
		connected = true;
	});

	cells.forEach(function(cell){
		log.info("Setting Up Jobs");
		var job = new Job(Jobs, 'queryDB',{cell:cell.name});
		job.priority('normal').retry({ retries: 5,wait: 5*1000 }).delay(5*1000).repeat({ wait: 30*1000 }).save();
	});

	var workers = Jobs.processJobs('queryDB',function (job, cb) {
		log.info("Running Job: "+job.data.cell);
		var cellName = job.data.cell;
		var query = "SELECT * FROM dbo."+ Meteor.settings.private.database.table +" WHERE Cell = '"+ cellName + "'";
		if(connected){
				var request = new Tedious.Request(query, function (err, rowCount) {
					if (err) {
						console.log(err);
						log.error(err);
						job.log("Job failed with error" + err,{level: 'warning'});
						job.fail("" + err);
						cb();
					}
				});
				request.on('doneInProc', function (rowCount, more, rows) {
					log.info("Recieved SQL Request For Cell: "+job.data.cell);
					Fiber(function() {
						if(rowCount > 0){
							var cell = Cell.find({name:cellName});
							var id = cell.fetch()[0]._id;
							if(id){
								//Find Cell Parts and targets
								var parts = [];
								for(var i = 0; i < rowCount; ++i){
									var part = {};
									part.name = rows[i]["PartNo"];
									part.current = rows[i]["PartCount"];
									part.target = rows[i]["TargetBuild"];
									autoRunning.push(rows[i]["AutoRunning"]["value"] ? 1:0 );
									cycleVariance.push(rows[i]["CycleVariance"]["value"]);
									timeStamp.push(new Date(rows[i]["TimeStamp"]["value"]));
								}
								for(var key in rows[0]){
									if(!Meteor.settings.private.database.nonpartcolumns.includes(key)){
										if(!key.includes("-Target")){
											part = {};
											part.name = key;
											part.current = rows[0][key]["value"];
											parts.push(part);
										}
									}
								}
								for(var key in rows[0]){
									if(!Meteor.settings.private.database.nonpartcolumns.includes(key)){
										if(key.includes("-Target")){
											var part = key.split("-")[0];
											var i = -1;
											for (var x in parts){
												if(parts[x].name == part){
													i = x;
													break;
												}
											}
											if(i > -1){
												parts[i].target = rows[0][key]["value"];
											}
										}
									}
								}
								var andonOn = rows[0].AndonOn.value;
								var andonAnswered = rows[0].AndonAnswered.value;
								var lastCT = rows[0].CycleTime.value;
								var bestCT = rows[0].BestCycleTime.value;
								var averageCT = rows[0].AverageCycleTime.value;
								var targetCT = rows[0].TargetCycleTime.value;
								var autoRunning = [];
								var cycleVariance = [];
								var timeStamp = [];
								for(var i = 0; i < rows.length; ++i){
									autoRunning.push(rows[i]["AutoRunning"]["value"] ? 1:0 );
									cycleVariance.push(rows[i]["CycleVariance"]["value"]);
									timeStamp.push(new Date(rows[i]["TimeStamp"]["value"]));
								}
								Cell.update(id,{$set: {parts:parts,andonOn:andonOn,andonAnswered:andonAnswered,lastCT:lastCT,bestCT:bestCT,averageCT:averageCT,targetCT:targetCT,autoRunning:autoRunning,cycleVariance:cycleVariance,timeStamp:timeStamp}}, function(error, result){
									if(error){
										log.error(error);
									}
								});
								log.info("Finished Parsing Request");
							}
						}else{
							log.error("No sql rows returned!");
						}
					}).run();
				});
				connection.execSql(request);
				job.done();
				cb();
				Jobs.remove({status:'completed'});
				log.info("Completed Job");
		}else{
			console.log("Not connected to db.");
			log.error("Not connected to db.");
			job.log("Job failed with error: Not connected to db.",{level: 'warning'});
			job.fail("" + "Not Connected to db.");
		}
	});
});