var currentMood;
// Get elements from DOM
var pageheader = $("#page-header")[0]; //note the [0], jQuery returns an object, so to get the html DOM object we need the first item in the object
var pagecontainer = $("#page-container")[0];
var bg2header = $("#bg2-header")[0];
var bg2 = $(".bg-2")[0];
var picture;
// The html DOM object has been casted to a input element (as defined in index.html) as later we want to get specific fields that are only avaliable from an input element object
var imgSelector = $("#my-file-selector")[0];
//var refreshbtn = $("#refreshbtn")[0]; //You dont have to use [0], however this just means whenever you use the object you need to refer to it with [0].
// Register button listeners
imgSelector.addEventListener("change", function () {
    pageheader.innerHTML = "Generating a verse...";
    processImage(function (file) {
        // Get emotions based on image
        sendEmotionRequest(file, function (emotionScores) {
            // Find out most dominant emotion
            currentMood = getCurrMood(emotionScores); //this is where we send out scores to find out the predominant emotion
            changeUI(); //time to update the web app, with their emotion!
        });
    });
});
function processImage(callback) {
    var file = imgSelector.files[0]; //get(0) is required as imgSelector is a jQuery object so to get the DOM object, its the first item in the object. files[0] refers to the location of the photo we just chose.
    var reader = new FileReader();
    if (file) {
        reader.readAsDataURL(file); //used to read the contents of the file
    }
    else {
        console.log("Invalid file.");
    }
    reader.onloadend = function () {
        //After loading the file it checks if extension is jpg or png and if it isnt it lets the user know.
        if (!file.name.match(/\.(jpg|jpeg|png)$/)) {
            pageheader.innerHTML = "Please upload an image file (jpg or png).";
        }
        else {
            //if file is photo it sends the file reference back up
            picture = reader.result;
            callback(file);
        }
    };
}
function changeUI() {
    //Updating first container
    pageheader.innerHTML = "Please see below.";
    //Updating second container
    var img = $("#new-photo-container")[0];
    img.src = picture;
    img.style.height = "220px";
    img.style.width = "300px";
    bg2header.innerHTML = currentMood.verseid;
    pagecontainer.style.marginTop = "20px";
}
function sendEmotionRequest(file, callback) {
    $.ajax({
        url: "https://api.projectoxford.ai/emotion/v1.0/recognize",
        beforeSend: function (xhrObj) {
            // Request headers
            xhrObj.setRequestHeader("Content-Type", "application/octet-stream");
            xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key", "849349f7cccb44e2a91efb392cc0cc13");
        },
        type: "POST",
        data: file,
        processData: false
    })
        .done(function (data) {
        if (data.length != 0) {
            // Get the emotion scores
            var scores = data[0].scores;
            callback(scores);
        }
        else {
            pageheader.innerHTML = "Cannot detect a human face. Please try another photo. ";
        }
    })
        .fail(function (error) {
        pageheader.innerHTML = "Sorry, something went wrong. Please try again later.";
        console.log(error.getAllResponseHeaders());
    });
}
// Section of code that handles the mood
//A Mood class which has the mood as a string and its corresponding emoji
var Mood = (function () {
    function Mood(mood, verse) {
        this.mood = mood;
        this.verse = verse;
        this.name = mood;
        this.verseid = verse;
    }
    return Mood;
}());
var happy = new Mood("happy", "The Mighty One has done great things for me - holy is His name. - Luke 1:49");
var sad = new Mood("sad", "But now, Lord, what do I look for? My hope is in You. - Psalm 39:7");
var scared = new Mood("scared", "God is our regure and strength. - Psalm 46:1");
var angry = new Mood("angry", "A gentle answer turns away wrath, but harsh words stir up anger. - Proverbs 15:1");
var neutral = new Mood("neutral", "No matter what happens, always be thankful, for this is God's will for you who belong to Christ Jesus. - 1 Thes 5:18");
// any type as the scores values is from the project oxford api request (so we dont know the type)
function getCurrMood(scores) {
    // In a practical sense, you would find the max emotion out of all the emotions provided. However we'll do the below just for simplicity's sake :P
    if (scores.happiness > 0.4) {
        currentMood = happy;
    }
    else if (scores.sadness > 0.4) {
        currentMood = sad;
    }
    else if (scores.fear > 0.4) {
        currentMood = scared;
    }
    else if (scores.anger > 0.4) {
        currentMood = angry;
    }
    else {
        currentMood = neutral;
    }
    return currentMood;
}
