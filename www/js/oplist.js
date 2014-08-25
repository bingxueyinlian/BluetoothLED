var OperationList =  function(data) {
    var defaultData = [
                { title: 'Cloudy', min: 2700, max: 6300, slider_val: 5121, brightness: 15 },
                { title: 'SunLight', min: 2700, max: 6300, slider_val: 3422, brightness: 20 },
                { title: 'Sunset', min: 2700, max: 6300, slider_val: 2700, brightness: 15 },
                { title: 'CandleLight', min: 2700, max: 6300, slider_val: 2700, brightness: 8 },
                { title: 'StarLight', min: 2700, max: 6300, slider_val: 3061, brightness: 20 }
              ];
    this.initialize = function() {
        this.setData(data);
        this.render();
    }
	this.setData = function(newData){
		if (newData) {
            defaultData = newData;
        }
	}
    this.render = function() {
        var itemListTpl = Handlebars.compile($("#op-list-tpl").html());
        $('.topcoat-list__container').html(itemListTpl(defaultData));
    }
    this.initialize();
};