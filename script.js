// Get references to HTML elements
const baseImageUpload = document.getElementById('baseImageUpload');
const addOverlayBtn = document.getElementById('addOverlayBtn');
const resizeControl = document.getElementById('resizeControl');
const rotateControl = document.getElementById('rotateControl');
const canvas = document.getElementById('imageCanvas');
const ctx = canvas.getContext('2d');
const downloadBtn = document.getElementById('downloadBtn'); // Reference to the Download Image button
const resetBtn = document.getElementById('resetBtn');

// Set canvas dimensions
canvas.width = 500; // Set canvas width
canvas.height = 500; // Set canvas height

// Initialize variables
let baseImage = null;
let overlayImage = null;
let overlayImageScale = 0.2; // Initial scale (20%)
let overlayRotation = 0;
let overlayPosition = { x: 50, y: 50 };
let isDragging = false;
let dragStartX, dragStartY;

// Overlay image URL
const overlayImageUrl = 'https://i.ibb.co/zrTcXKZ/blue-phat.png';

// Load base image when a file is selected
baseImageUpload.addEventListener('change', function(e) {
    loadImage(e.target.files[0], true);
});

// Load overlay image when "ADD PHAT" button is clicked
addOverlayBtn.addEventListener('click', function() {
    loadOverlayImage(overlayImageUrl);
});

// Handle resizing of the overlay image
resizeControl.addEventListener('input', function() {
    if (baseImage && overlayImage) {
        overlayImageScale = (resizeControl.value / 100) * (baseImage.width / overlayImage.width);
        drawImages();
    }
});

// Handle rotation of the overlay image
rotateControl.addEventListener('input', function() {
    overlayRotation = parseInt(rotateControl.value);
    drawImages();
});

// Handle mouse interactions for dragging
canvas.addEventListener('mousedown', startDragging);
canvas.addEventListener('mousemove', dragImage);
canvas.addEventListener('mouseup', stopDragging);

// Load an image and display it on the canvas
function loadImage(file, isBase) {
    const reader = new FileReader();
    reader.onload = function(event) {
        const img = new Image();
        img.onload = function() {
            if (isBase) {
                baseImage = img;
                scaleBaseImageToFitCanvas();
                calculateOverlayScale();
                drawImages();
            }
        }
        img.src = event.target.result;
    }
    reader.readAsDataURL(file);
}

// Load the overlay image and display it on the canvas
function loadOverlayImage(url) {
    const img = new Image();
    img.crossOrigin = "Anonymous"; // Important for images from other domains
    img.onload = function() {
        overlayImage = img;
        calculateOverlayScale();
        overlayPosition = { x: 50, y: 50 }; // Reset position when a new image is added
        drawImages();
    }
    img.src = url;
}

// Scale the base image to fit the canvas while maintaining aspect ratio
function scaleBaseImageToFitCanvas() {
    let scale = Math.min(canvas.width / baseImage.width, canvas.height / baseImage.height);
    baseImage.width *= scale;
    baseImage.height *= scale;
}

// Calculate the initial scale for the overlay image
function calculateOverlayScale() {
    if (baseImage && overlayImage) {
        overlayImageScale = 0.2 * (baseImage.width / overlayImage.width); // 20% of base image's width
        resizeControl.value = 20; // Set to 20% in the range input
    }
}

// Handle starting to drag the overlay image
function startDragging(e) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (mouseX >= overlayPosition.x && mouseX <= overlayPosition.x + overlayImage.width * overlayImageScale &&
        mouseY >= overlayPosition.y && mouseY <= overlayPosition.y + overlayImage.height * overlayImageScale) {
        isDragging = true;
        dragStartX = mouseX - overlayPosition.x;
        dragStartY = mouseY - overlayPosition.y;
    }
}

// Handle dragging the overlay image
function dragImage(e) {
    if (isDragging) {
        const rect = canvas.getBoundingClientRect();
        overlayPosition.x = e.clientX - rect.left - dragStartX;
        overlayPosition.y = e.clientY - rect.top - dragStartY;
        drawImages();
    }
}

// Handle stopping the drag of the overlay image
function stopDragging() {
    isDragging = false;
}

// Draw both the base image and overlay image on the canvas
function drawImages() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (baseImage) {
        // Draw the base image centered in the canvas
        ctx.drawImage(baseImage, (canvas.width - baseImage.width) / 2, (canvas.height - baseImage.height) / 2, baseImage.width, baseImage.height);
    }

    if (overlayImage) {
        ctx.save();
        ctx.translate(overlayPosition.x + overlayImage.width * overlayImageScale / 2, overlayPosition.y + overlayImage.height * overlayImageScale / 2);
        ctx.rotate(overlayRotation * Math.PI / 180);
        ctx.drawImage(overlayImage, -overlayImage.width * overlayImageScale / 2, -overlayImage.height * overlayImageScale / 2, overlayImage.width * overlayImageScale, overlayImage.height * overlayImageScale);
        ctx.restore();
    }
}

resetBtn.addEventListener('click', function() {
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Reset variables and overlay
    baseImage = null;
    overlayImage = null;
    overlayImageScale = 0.2; // Initial scale (20%)
    overlayRotation = 0;
    overlayPosition = { x: 50, y: 50 };
    isDragging = false;
    dragStartX = 0;
    dragStartY = 0;

    // Reset input controls
    baseImageUpload.value = '';
    resizeControl.value = 20;
    rotateControl.value = 0;

    // Redraw (clear) the canvas
    drawImages();
});

// Handle downloading the edited image when the "Download Image" button is clicked
downloadBtn.addEventListener('click', function() {
    // Create a data URL from the canvas content
    const dataURL = canvas.toDataURL('image/png'); // You can specify the desired image format

    // Create a temporary anchor element for downloading
    const downloadLink = document.createElement('a');
    downloadLink.href = dataURL;
    downloadLink.download = 'phatted_image.jpg'; // Specify the desired file name and extension

    // Trigger a click event on the anchor element to start the download
    downloadLink.click();
});
