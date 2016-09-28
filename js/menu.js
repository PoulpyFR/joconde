function displayMenu(element) {
	var dropdown = $(element).parent().find('.menu_dropdown')[0];
	$.each($('.menu_dropdown'), function(key, value) {
		if(value != dropdown)
			$(value).hide();
	});
	$(dropdown).toggle();
}
		
window.onclick = function(event) {
	if (!event.target.matches('.menu_button')) {
		$.each($('.menu_dropdown'), function(key, value) {
			$(value).hide();
		});
	}
}
