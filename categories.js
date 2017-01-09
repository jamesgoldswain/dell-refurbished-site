var request = require("request"),   cheerio = require("cheerio"),  url = '';

var app = {
    init: function () {
        this.categories = [];
        this.getCategories("http://www.dell.com/learn/au/en/audhs1/campaigns/dell-outlet-au?c=au&l=en&s=dhs&~ck=bt&redirect=1");  
    },
    getCategories : function(url){

        request(url, function (error, response, body) {
            if (!error) {
                var $ = cheerio.load(body);

                var categoryLinks = $(".nodeIntroText").find('table span');

                categoryLinks.each(function(i,e){

                    var categoryLink = $(e).find('a');

                    if (categoryLink.length > 0){
                        var category = {  name: categoryLink.text() , safeName: categoryLink.text().trim().replace(' ','') , link : categoryLink.attr('href') };
                        app.categories.push(category);
                    }
                });

                app.save(app.categories);

            } else {
                console.log("We’ve encountered an error: " + error);
            }
        });
    },
    save : function(doc){
        
        var AWS = require('aws-sdk');
        var moment = require('moment');

        var s3 = new AWS.S3();
        var myBucket = 'dell.refurbished.jamesgoldswain';
        var myKey = 'Categories.json';

        params = { 
            Bucket: myBucket, 
            Key: myKey,
            Body: JSON.stringify(doc),
            ACL:'public-read'};

        s3.putObject(params, function(err, data) {

            if (err) {

                console.log(err)

            } else {

                console.log("Successfully uploaded data to myBucket/myKey");

            }

        });

    }

};

app.init();