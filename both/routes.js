// Home Page
FlowRouter.route('/', {
    name: 'home',
    action() {
        BlazeLayout.render("MainLayout", {main: "Home"}); //(Layout File, {main: partial file})
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

cellRoutes.route('/:_id', {
	name: 'cell',
	action() {
		BlazeLayout.render("MainLayout", {main: "Cell"});
	}
});