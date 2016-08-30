'use strict';
/// <reference path="typings/tsd.d.ts" />
var currentMood;
// Get elements from DOM
var pageheader = $("#page-header")[0]; //note the [0], jQuery returns an object, so to get the html DOM object we need the first item in the object
var pagecontainer = $("#page-container")[0];
// The html DOM object has been casted to a input element (as defined in index.html) as later we want to get specific fields that are only avaliable from an input element object
var imgSelector = $("#my-file-selector")[0];
var refreshbtn = $("#refreshbtn")[0]; //You dont have to use [0], however this just means whenever you use the object you need to refer to it with [0].
// Register button listeners
imgSelector.addEventListener("change", function () {
    pageheader.innerHTML = "Analysing mood...";
    processImage(function (file) {
        // Get emotions based on image
        sendEmotionRequest(file, function (emotionScores) {
            // Find out most dominant emotion
            currentMood = getCurrMood(emotionScores); //this is where we send out scores to find out the predominant emotion
            changeUI(); //time to update the web app, with their emotion!
        });
    });
});
refreshbtn.addEventListener("click", function () {
    // TODO: Load random song based on mood
    alert("You clicked the button");
});
function processImage(callback) {
    var file = imgSelector.files[0]; //get(0) is required as imgSelector is a jQuery object so to get the DOM object, its the first item in the object. files[0] refers to the location of the photo we just chose.
    var reader = new FileReader();
    if (file) {
        reader.readAsDataURL(file); //used to read the contents of the file
    }
    else {
        console.log("Invalid file");
    }
    reader.onloadend = function () {
        //After loading the file it checks if extension is jpg or png and if it isnt it lets the user know.
        if (!file.name.match(/\.(jpg|jpeg|png)$/)) {
            pageheader.innerHTML = "Please upload an image file (jpg or png).";
        }
        else {
            //if file is photo it sends the file reference back up
            callback(file);
        }
    };
}
function changeUI() {
    //Show detected mood
    pageheader.innerHTML = "Your mood is: " + currentMood.name; //Remember currentMood is a Mood object, which has a name and emoji linked to it. 
    //Display song refresh button
    refreshbtn.style.display = "inline";
    //Remove offset at the top
    pagecontainer.style.marginTop = "20px";
}
// Refer to http://stackoverflow.com/questions/35565732/implementing-microsofts-project-oxford-emotion-api-and-file-upload
// and code snippet in emotion API documentation
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
            pageheader.innerHTML = "Can't detect a human face. Please try another photo.";
        }
    })
        .fail(function (error) {
        pageheader.innerHTML = "Sorry, something went wrong. Please try again later.";
        console.log(error.getAllResponseHeaders());
    });
}
// Section of code that handles the mood
//A Mood class which has the mood as a string
var Mood = (function () {
    function Mood(mood) {
        this.mood = mood;
        this.name = mood;
    }
    return Mood;
}());
var happy = new Mood("happy");
var sad = new Mood("sad");
var scared = new Mood("scared");
var angry = new Mood("angry");
var neutral = new Mood("neutral");
// any type as the scores values is from the project oxford api request (so we dont know the type)
function getCurrMood(scores) {
    var currentMood;
    var currentMax = 0;
    var scoreArray = new Array();
    scoreArray.push(scores.happiness);
    scoreArray.push(scores.sadness);
    scoreArray.push(scores.fear);
    scoreArray.push(scores.angry);
    scoreArray.push(scores.neutral);
    var arrayLength = scoreArray.length;
    //Analyses maximum mood score
    for (var i = 0; i < arrayLength; i++) {
        if (scores[i] > currentMax) {
            if (i == 0) {
                currentMood = happy;
            }
            else if (i == 1) {
                currentMood = sad;
            }
            else if (i == 2) {
                currentMood = scared;
            }
            else if (i == 3) {
                currentMood = angry;
            }
            else {
                currentMood = neutral;
            }
        }
    }
    return currentMood;
}
