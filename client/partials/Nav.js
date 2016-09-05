Template.Nav.events({
	'click .fa-bars':function(){
		Session.set('showMenu', !Session.get('showMenu'));
	}
});