jQuery(document).ready(function(){	
	var sliderTooltip = function(event, ui) {
		var curValue = (ui.value/10 || 12) + "\u00B0" + "C"; // current value (when sliding) or initial value (at start)
		var tooltip = '<div class="tooltip"><div class="tooltip-inner">' + curValue + '</div><div class="tooltip-arrow"></div></div>';

		$('.ui-slider-handle').html(tooltip); //attach tooltip to the slider handle
	}

	doUpdate();
	window.setInterval(doUpdate, 1000)
	$("#onoff").click(function(){
		$.ajax({
			url: '/status.json',
			data: {'enabled': !enabled},
			success: parseStatus,
		});
	});

	$("#temperature").slider({
    min: 100,
    max: 300,
    value: 120,
		range: "min",
		animate: true,
		create: function(event, ui) {
			sliderTooltip(event, ui);
		},
		slide: function(event, ui) {
			sliderTooltip(event, ui);
		}
		
  });
	
});

function ui_update(event){
	if (event == 'target'){
		$("
	}
	alert(event);
}

function doUpdate(){
	$.ajax({
		type: "GET",
		url: '/status.json',
		//data: {'foo': 'bar'},
		success: parseStatus,
	});
}

function parseStatus(data) {
	data = $.parseJSON(data)
	enabled = data["enabled"]
	if (data["enabled"]){
		$('#onoff').attr('class', 'on');
		$('#onoff').text("Enabled");
	} else {
		$('#onoff').attr('class', 'off');
		$('#onoff').text("Disabled");
	}
}