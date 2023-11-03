var totalCounter = 0;
var initialLoadComplete = false;
var imageCountInput = document.getElementById("imageCount");
var loadMoreButton = document.getElementById("loadMoreImages");
var loadedImageLinks = []; // Array to store loaded image links

function randomString(string_length) {
    var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
    var output = "";
    for (var i = 0; i < string_length; i++) {
        var index = Math.floor(Math.random() * chars.length);
        output += chars.substring(index, index + 1);
    }
    document.getElementById("current").innerHTML = output;
    return output;
};

function fetchVisitedLinks() {
    return fetch('/visited-links')
        .then((response) => {
            if (!response.ok) {
                throw new Error('Failed to retrieve visited links');
            }
            return response.json();
        });
}

async function loadImages() {
    try {

        document.title = "Loading Images..."; // Change the title when loading starts

        const imageContainer = document.getElementById("image-container");
        const imageCountDisplay = document.getElementById("imageCountDisplay");
        const imageCount = parseInt(imageCountInput.value, 10);

        imageCountDisplay.textContent = imageCount;
        totalCounter = 0;
        initialLoadComplete = false;
        loadMoreButton.style.display = "none";
        imageContainer.innerHTML = '';
        loadedImageLinks = [];

        // Make an HTTP request to the server to retrieve visited links
        const visitedLinks = await fetchVisitedLinks();
        loadedImageLinks = visitedLinks;
        loadNextImage(imageCount);
    } catch (error) {
        console.error(error);
        loadNextImage(imageCount);
    }
}

function loadNextImage(imageCount) {
    if (totalCounter < imageCount) {
        // Calculate progress percentage based on totalCounter and imageCount
        var progressPercentage = (totalCounter / imageCount) * 100;

        // Update the width of the custom progress bar
        document.getElementById("custom-progress-bar").style.width = progressPercentage + "%";

        var randStr = randomString(5);
        var imgSrc = "http://i.imgur.com/" + randStr + ".jpg";

        if (!loadedImageLinks.includes(imgSrc)) {
            var imgObject = new Image();

            imgObject.onload = function() {
                if (this.width != 161 || this.height != 81) {
                    addImage(this.src);
                    totalCounter++;

                    if (totalCounter === imageCount) {
                        initialLoadComplete = true;
                        loadMoreButton.style.display = "block";
                    }
                }
                loadNextImage(imageCount);
            }

            imgObject.src = imgSrc;
        } else {
            // If the image is a duplicate, continue to the next image
            loadNextImage(imageCount);
        }
    }
}

function loadMoreImages() {
    if (initialLoadComplete) {
        var imageCount = parseInt(imageCountInput.value, 10);
        loadImages(imageCount);
    }
}

function addImage(imgSrc) {
    // Make an HTTP request to the server to add the visited link
    document.title = "Images Loaded"; // Change the title when images are loaded

    fetch('/add-link', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `url=${encodeURIComponent(imgSrc)}`, // Ensure that imgSrc contains the URL you want to send
        })
        .then(function (response) {
            if (!response.ok) {
                console.error('Failed to add link to the database');
            }
        })
        .catch(function (error) {
            console.error(error);
        });

    var imgItem = document.createElement("div");
    imgItem.classList.add("img-item");
    var img = document.createElement("img");
    img.src = imgSrc;
    imgItem.appendChild(img);
    document.getElementById("image-container").appendChild(imgItem);
    loadedImageLinks.push(imgSrc);
}