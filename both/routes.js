/*
All possible routes in the app.
*/

// Home Page
FlowRouter.route('/', {
    name: 'home',
    action() {
        BlazeLayout.render("MainLayout", {main: "Home"}); //(Layout File, {main: partial file})
    }
});

// About Page
FlowRouter.route('/about', {
    name: 'about',
    action() {
        BlazeLayout.render("MainLayout", {main: "About"}); //(Layout File, {main: partial file})
    }
});

var cellRoutes = FlowRouter.group({
	prefix: '/cells',
	name:'cells'
});

cellRoutes.route('/', {
	name: 'cells',
	action() {
		BlazeLayout.render("MainLayout", {main: "CellList"});
	}
});

cellRoutes.route('/:cellName', {
	name:'cell',
	action() {
		BlazeLayout.render("MainLayout", {main: "Cell"});
	}
});

cellRoutes.route('/:cellName/operator', {
	name:'operator',
	action: function(params) {
		BlazeLayout.render("MainLayout", {main: "CellOperator"});
	}
});

cellRoutes.route('/:cellName/shift-report', {
	name:'report',
	action: function(params) {
		BlazeLayout.render("MainLayout", {main: "CellReport"});
	}
});

cellRoutes.route('/:cellName/event-report', {
	name:'event',
	action: function(params) {
		BlazeLayout.render("MainLayout", {main: "CellEvent"});
	}
});

cellRoutes.route('/:cellName/scrap-report', {
	name:'scrapoperator',
	action: function(params) {
		BlazeLayout.render("MainLayout", {main: "CellScrap"});
	}
});

cellRoutes.route('/:cellName/tech-report', {
	name:'tech',
	action: function(params) {
		BlazeLayout.render("MainLayout", {main: "CellTech"});
	}
});