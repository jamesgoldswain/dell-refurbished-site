Handlebars.registerHelper('replacespaces', function (text) {
    return text.replace('&nbsp;', '');
});

Handlebars.registerHelper('url', function (text) {
    return baseUrl + text + '.json';
});

Handlebars.registerHelper('isFirst', function (item, block) {
    return block;
});

var baseUrl = 'https://s3.amazonaws.com/dell.refurbished.jamesgoldswain/'
var app = {
    init: function () {
        this.products = {
            headers : []
        };

        categoryTemplate = Handlebars.compile($('#category-template').html());
        $('.categoryDropdown').html(categoryTemplate(app.categories));

        this.bindEvents();
    },
    getProducts : function(url){
        $('#products').html('loading ...');
        productTemplate = Handlebars.compile($('#product-template').html());
        $.getJSON(url,
            function (data) {

            app.products = { 
                headers : data.headers, 
                products : data.products 
            };
            
            if (app.products.products.length > 0) {
                $('#products').html(productTemplate(app.products));
                $('#productData').DataTable();
            }else{
                $('#products').html('sorry no products!')
            }
        });
    },
    bindEvents: function () {
        $('.categoryDropdown').on('change', 'select', this.dropDownChanged.bind(this));
    },
    dropDownChanged: function (e) {
        e.preventDefault();

        this.getProducts(e.target.value);
    }
}

$.getJSON(baseUrl + "Categories.json",
    function (data) {
    app.categories = { categories : data };
    app.init();
});