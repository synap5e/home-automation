function timeSliderTooltip(val) {
    if (val >= Math.pow(10, 6)) {
        var curValue = "Forever"
    } else {
        var curValue = Math.floor(val / 60) + ":" + ("00" + val % 60).substr(-2);
    }
    var tooltip = '<div class="tooltip"><div class="tooltip-inner">' + curValue + '</div><div class="tooltip-arrow"></div></div>';
    $('#time_slider').find('.ui-slider-handle').html(tooltip);
}
function sliderTooltip(event, ui) {
	var curValue = (ui.value/10 || 12) + "\u00B0C"; // current value (when sliding) or initial value (at start)
	var tooltip = '<div class="tooltip"><div class="tooltip-inner">' + curValue + '</div><div class="tooltip-arrow"></div></div>';
	$('#temperature').find('.ui-slider-handle').html(tooltip); //attach tooltip to the slider handle
}
function set_time(val) {
    val = Math.round(val / 5)*5
    $("#slider").slider("option", "value", val);
}
jQuery(document).ready(function(){	
	initial_value = 1 * 60
	$("#time_slider").slider({
		min: 5,
		max: 5 * 60 + 5,
		value: initial_value,
		step: 5,
		animate: true,
		range: "min",
		slide: function (event, ui) {
			if (ui.value > 5*60){
				ui.value = Math.pow(10, 6);
			}
			timeSliderTooltip(ui.value);
		},
		create: function (event, ui) {
			timeSliderTooltip(initial_value);
		},
		change: function(event, ui){
			if (ui.value > 5*60){
				ui.value = Math.pow(10, 6);
			}
			if (typeof(event.button) != "undefined"){
				// From user
				console.log(ui.value);
				do_update({'minutes_remaining': ui.value});
			}
			timeSliderTooltip(ui.value);
		} 
	});

	do_update({});
	window.setInterval(function(){do_update({});}, 10000)
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
				
				if (ui.value < 100){
					$('#temperature').slider('value', 100);
					ui.value = 100;
					sliderTooltip(event, ui);
					return false;
				}
			},
			change: function(event, ui){
				if (typeof(event.button) != "undefined"){
					// From user
					do_update({'target': ui.value/10});
				}
				sliderTooltip(event, ui);
			} 
  });
	
});

function mode_changed(val){
	do_update({'mode': val});
}

function do_update(data){
	$.ajax({
		type: "GET",
		url: '/status.json',
		data: data,
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
	if (data['heater_on']){
		$('#led').addClass('red');
	} else {
		$('#led').removeClass('red');
	}
	window.setTimeout(function(){
		$('#temperature').slider('value', (data['target'])*10);
		$('#time_slider').slider('value', data['minutes_remaining']);
	}, 200);
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
	if (mode == 'auto'){
		$('#time_slider').hide();
	} else {
		$('#time_slider').show();
	}
	
}