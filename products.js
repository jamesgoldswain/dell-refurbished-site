var request = require("request"),   cheerio = require("cheerio"),  url = '';
var https = require("https");

var app = {
    init: function () {
        this.products = [];

        for(var i = 0; i < app.categories.length; i++){
            this.getProducts(app.categories[i]);
        }
    },
    getProducts : function(category) {

        request(category.link, function (error, response, body) {
            if (!error) {
                var $ = cheerio.load(body);
                
                var products = {
                    headers : [],
                    products : []
                };

                var tdHeaders = $('td.gridTitle').toArray();
                
                for (var i = 0; i < tdHeaders.length; i++){
                    var header = $(tdHeaders[i]).text().trim();
                    products.headers.push({ value : header });
                }  

                $("[name='grid_0']").next().find('tr').each(function(i,e){
            
                    var product = { 
                        category : category.name
                    }

                    var tds = $(e).find('td.gridCell').toArray();

                    var productDetails = tds.map(function (e) { return { value: $(e).text() } });

                    products.products.push({ detail : productDetails });

                });
                app.save(category, products);

            } else {
                console.log("We’ve encountered an error: " + error);
            }
        });
    },
    save : function(category, doc){
        
        var AWS = require('aws-sdk');
        var moment = require('moment');

        var s3 = new AWS.S3();
        var myBucket = 'dell.refurbished.jamesgoldswain';
        var myKey = category.safeName +'.json';

        params = { 
            Bucket: myBucket, 
            Key: myKey, 
            Body: JSON.stringify(doc),
            ACL:'public-read'
        };

        s3.putObject(params, function(err, data) {

            if (err) {

                console.log(err)

            } else {

                console.log("Successfully uploaded data to myBucket/myKey");

            }

        });

    }


};


https.get("https://s3.amazonaws.com/dell.refurbished.jamesgoldswain/Categories.json", function(res){
    var body = '';

    res.on('data', function(chunk){
        body += chunk;
    });

    res.on('end', function(){
        var data = JSON.parse(body);
        app.categories = data;
        app.init();
    });
}).on('error', function(e){
      console.log("Got an error: ", e);
});
