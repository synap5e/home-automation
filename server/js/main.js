jQuery(document).ready(function(){	
	$("#onoff").click(function(){
		if ($('#onoff').attr('class') == 'on'){
			$('#onoff').attr('class', 'off');
			$('#onoff').text("Disabled");
		} else {
			$('#onoff').attr('class', 'on');
			$('#onoff').text("Enabled");
		}
		$.get("http://10.0.0.10", function(data) {
		});
	});

});
