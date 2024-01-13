// Get references to HTML elements
const baseImageUpload = document.getElementById('baseImageUpload');
const addOverlayBtn = document.getElementById('addOverlayBtn');
const resizeControl = document.getElementById('resizeControl');
const rotateControl = document.getElementById('rotateControl');
const canvas = document.getElementById('imageCanvas');
const ctx = canvas.getContext('2d');
const downloadBtn = document.getElementById('downloadBtn');
const resetBtn = document.getElementById('resetBtn');

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

// Set initial canvas dimensions and add resize event listener
setCanvasDimensions();
window.addEventListener('resize', setCanvasDimensions);

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
        overlayImageScale = resizeControl.value / 100;
        drawImages();
    }
});

// Handle rotation of the overlay image
rotateControl.addEventListener('input', function() {
    overlayRotation = parseInt(rotateControl.value);
    drawImages();
});

// Mouse interactions for dragging
canvas.addEventListener('mousedown', startDragging);
canvas.addEventListener('mousemove', dragImage);
canvas.addEventListener('mouseup', stopDragging);

// Load image and display it on the canvas
function loadImage(file, isBase) {
    const reader = new FileReader();
    reader.onload = function(event) {
        const img = new Image();
        img.onload = function() {
            if (isBase) {
                baseImage = img;
                scaleBaseImageToFitCanvas();
                drawImages();
            }
        }
        img.src = event.target.result;
    }
    reader.readAsDataURL(file);
}

// Load overlay image and display it on the canvas
function loadOverlayImage(url) {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = function() {
        overlayImage = img;
        calculateOverlayScale();
        overlayPosition = { x: 50, y: 50 };
        drawImages();
    }
    img.src = url;
}

// Scale base image to fit the canvas while maintaining aspect ratio
function scaleBaseImageToFitCanvas() {
    let scale = Math.min(canvas.width / baseImage.width, canvas.height / baseImage.height);
    baseImage.width *= scale;
    baseImage.height *= scale;
}

// Calculate initial scale for overlay image
function calculateOverlayScale() {
    if (baseImage && overlayImage) {
        overlayImageScale = 0.2 * (baseImage.width / overlayImage.width);
        resizeControl.value = overlayImageScale * 100;
    }
}

// Start dragging overlay image
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

// Drag overlay image
function dragImage(e) {
    if (isDragging) {
        const rect = canvas.getBoundingClientRect();
        overlayPosition.x = e.clientX - rect.left - dragStartX;
        overlayPosition.y = e.clientY - rect.top - dragStartY;
        drawImages();
    }
}

// Stop dragging overlay image
function stopDragging() {
    isDragging = false;
}

// Draw base and overlay images on the canvas
function drawImages() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (baseImage) {
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

// Reset button functionality
resetBtn.addEventListener('click', function() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    baseImage = null;
    overlayImage = null;
    overlayImageScale = 0.2;
    overlayRotation = 0;
    overlayPosition = { x: 50, y: 50 };
    isDragging = false;
    dragStartX = 0;
    dragStartY = 0;
    baseImageUpload.value = '';
    resizeControl.value = 20;
    rotateControl.value = 0;
    drawImages();
});

// Download button functionality
downloadBtn.addEventListener('click', function() {
    const dataURL = canvas.toDataURL('image/png');
    const downloadLink = document.createElement('a');
    downloadLink.href = dataURL;
    downloadLink.download = 'edited_image.png';
    downloadLink.click();
});

// Function to set canvas dimensions dynamically
function setCanvasDimensions() {
    const maxWidth = 500;
    const maxHeight = 500;
    const aspectRatio = maxWidth / maxHeight;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    if (viewportWidth < maxWidth) {
        canvas.width = viewportWidth;
        canvas.height = viewportWidth / aspectRatio;
    } else {
        canvas.width = maxWidth;
        canvas.height = maxHeight;
    }

    if (baseImage) {
        scaleBaseImageToFitCanvas();
        calculateOverlayScale();
        drawImages();
    }
}

