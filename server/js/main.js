jQuery(document).ready(function(){	
	var sliderTooltip = function(event, ui) {
		var curValue = (ui.value/10 || 12) + "\u00B0C"; // current value (when sliding) or initial value (at start)
		var tooltip = '<div class="tooltip"><div class="tooltip-inner">' + curValue + '</div><div class="tooltip-arrow"></div></div>';

		$('.ui-slider-handle').html(tooltip); //attach tooltip to the slider handle
	}

	do_update();
	window.setInterval(do_update, 10000)
	$("#onoff").click(function(){
		$.ajax({
			url: '/status.json',
			data: {'enabled': !enabled},
			success: parse_status,
		});
	});

	$("#temperature").slider({
		min: 96,
		max: 300,
		value: 120,
			range: "min",
			animate: true,
			create: function(event, ui) {
				sliderTooltip(event, ui);
			},
			slide: function(event, ui) {
				sliderTooltip(event, ui);
				
				if (ui.value < 100){  // corrected
					$('#temperature').slider('value', 100);
					ui.value = 100;
					sliderTooltip(event, ui);
					return false;
				}
			},
			change: function(event, ui){
				console.log(typeof(event.button));
				if (typeof(event.button) != "undefined"){
					// From user
					target_changed(ui.value/10);
					
				}
				sliderTooltip(event, ui);
			} 
  });
	
});

function mode_changed(val){
	$.ajax({
		type: "GET",
		url: '/status.json',
		data: {'mode': val},
		success: parse_status,
	});
}

function target_changed(new_target){
	$.ajax({
		type: "GET",
		url: '/status.json',
		data: {'target': new_target},
		success: parse_status,
	});
}

function do_update(){
	$.ajax({
		type: "GET",
		url: '/status.json',
		//data: {'foo': 'bar'},
		success: parse_status,
	});
}

function parse_status(data) {
	data = $.parseJSON(data)
	enabled = data["enabled"]
	if (data["enabled"]){
		$('#onoff').attr('class', 'on');
		$('#onoff').text("Enabled");
	} else {
		$('#onoff').attr('class', 'off');
		$('#onoff').text("Disabled");
	}
	console.log(data['heater_on']);
	if (data['heater_on']){
		$('#led').addClass('red');
	} else {
		$('#led').removeClass('red');
	}
	window.setTimeout(400, function(){$('#temperature').slider('value', (data['target'])*10);});
	$('#temp').text("Temperature: " + data['last_reading'] + "\u00B0C");
	mode = data["mode"];
	if (mode == 'target'){
		$("#slider").show();
		$("#target").prop('checked', true);
	} else{
		$("#slider").hide();
		if (mode == 'off'){
			$("#off").prop('checked', true);
		} else if (mode == 'on'){
			$("#on").prop('checked', true);
		} else if (mode == 'auto'){
			$("#auto").prop('checked', true);
		}
	}
	
}