const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startGameBtn = document.getElementById('startGameBtn');
const introduction = document.getElementById('introduction');
const message = document.getElementById('message');

// Function to start the game
function startGame() {
    // Hide the introduction section
    introduction.style.display = 'none';

    // Show the game canvas
    canvas.style.display = 'block';

    // Initialize the game logic
    console.log('Game started!');
    update(); // Call the game loop
}

// Attach event listener to the start button
startGameBtn.addEventListener('click', startGame);

let car = {
    x: 375,
    y: 500,
    width: 100, // Car width
    height: 60, // Car height
    speed: 0,
    maxSpeed: 60, // Default maximum speed
    stopTime: 0,
    hasStopped: false,
    inSchoolZone: false,
    slowedDown: false
};

let gameOver = false;

// Preload images
const signalImages = {
    stop: 'stop-sign.png',
    pedestrian: 'pedestrian-crossing.png',
    speedLimit: 'speed-limit.png',
    yield: 'yield-sign.png',
    speedBump: 'speed-bump.png',
    railsignal: 'railroad-crossing.png',
    schoolZone: 'school-zone.png',
    rail: 'rail.png',
    endschoolzone: 'endschoolzone.png', // End school zone image
    car: 'car.png', // Car image
    red: 'red.jpg', // Red signal image
    yellow: 'yellow.jpg', // Yellow signal image
    green: 'green.jpg', // Green signal image
    roadwork: 'roadwork.png', // Roadwork image
    cone: 'cone.png', // Cone image
    leftSide: 'Left.jpeg', // Left side image
    rightSide: 'Right.jpeg' // Right side image
};

let signals = [
    { type: 'stop', x: 300, y: 0, width: 50, height: 50, active: true },
    { type: 'trafficLight', x: 300, y: -600, width: 50, height: 150, active: true, cycleTime: 0, currentColor: 'green' },
    { type: 'pedestrian', x: 300, y: -1100, width: 50, height: 50, active: true },
    { type: 'speedLimit', x: 300, y: -1600, width: 50, height: 50, active: true },
    { type: 'yield', x: 300, y: -2100, width: 50, height: 50, active: true },
    { type: 'speedBump', x: 300, y: -2600, width: 50, height: 50, active: true },
    { type: 'roadwork', x: 430, y: -3100, width: 40, height: 40, active: true },
    { type: 'cone', x: 430, y: -3150, width: 20, height: 40, active: true },
    { type: 'schoolZone', x: 300, y: -4200, width: 50, height: 50, active: true },
    { type: 'endschoolzone', x: 300, y: -4900, width: 50, height: 50, active: true }
];

let currentSignalIndex = 0;

// Preload images
let images = {};
for (let key in signalImages) {
    images[key] = new Image();
    images[key].src = signalImages[key];
    console.log(`Loading image: ${signalImages[key]}`);
}

let lineYPositions = [];

function drawCar() {
    ctx.drawImage(images.car, car.x, car.y, car.width, car.height);
}

//function drawRoad() {
//    const sidePadding = 20; // Space between the road and side images
//
//    // Draw the left side image with padding
//    ctx.drawImage(images.leftSide, 0, 0, 350 - sidePadding, canvas.height);
//
//    // Draw the right side image with padding
//    ctx.drawImage(images.rightSide, 450 + sidePadding, 0, 350 - sidePadding, canvas.height);
//
//    // Draw the road
//    ctx.fillStyle = 'gray';
//    ctx.fillRect(350 - sidePadding, 0, 100 + 2 * sidePadding, canvas.height);
//
//    // Draw the white dashed lines in the center of the road
//    ctx.fillStyle = 'white';
//    for (let y = -20; y < canvas.height; y += 40) {
//        const linePosition = (y + lineYPositions[0]) % canvas.height;
//        ctx.fillRect(395, linePosition, 10, 20);
//    }
//
//    // Update the line position for animation
//    lineYPositions[0] += car.speed / 10;
//    if (lineYPositions[0] >= 40) {
//        lineYPositions[0] = 0; // Reset the position to create a looping effect
//    }
//}

function drawRoad() {
    console.log('Drawing road with space for signals');
    lineYPositions.push(0);

    const sidePadding = 20; // Space between the road and side images

    // Draw the left side image with padding
    ctx.drawImage(images.leftSide, 0, 0, 350 - sidePadding, canvas.height);

    // Draw the right side image with padding
    ctx.drawImage(images.rightSide, 450 + sidePadding, 0, 350 - sidePadding, canvas.height);

    // Draw the road
    ctx.fillStyle = 'gray';
    ctx.fillRect(350 - sidePadding, 0, 100 + 2 * sidePadding, canvas.height);

    // Draw the white dashed lines in the center of the road
    ctx.fillStyle = 'white';
    for (let y = -20; y < canvas.height; y += 40) {
        const linePosition = (y + lineYPositions[0]) % canvas.height;
        ctx.fillRect(395, linePosition, 10, 20);
    }

    // Update the line position for animation
    lineYPositions[0] += car.speed / 10;
    if (lineYPositions[0] >= 40) {
        lineYPositions[0] = 0; // Reset the position to create a looping effect
    }
}


function drawSignals() {
    signals.forEach(signal => {
        if (signal.active) {
            if (signal.type === 'trafficLight') {
                let lightImage;
                switch (signal.currentColor) {
                    case 'red':
                        lightImage = images.red;
                        break;
                    case 'yellow':
                        lightImage = images.yellow;
                        break;
                    case 'green':
                        lightImage = images.green;
                        break;
                }
                ctx.drawImage(lightImage, signal.x, signal.y, 30, 60);
            } else if (images[signal.type]) {
                ctx.drawImage(images[signal.type], signal.x, signal.y, signal.width, signal.height);
            }
        }
    });
}

function drawSpeed() {
    const speedText = `Speed ${car.speed} mph`;
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';

    // Measure the text width to align it in the center
    const textWidth = ctx.measureText(speedText).width;

    // Calculate the x-coordinate to center the text horizontally
    const xPosition = (canvas.width - textWidth) / 2;

    // Set the y-coordinate to position the text at the bottom of the canvas
    const yPosition = canvas.height - 20; // 20 pixels above the bottom edge

    ctx.fillText(speedText, xPosition, yPosition);
}

function checkCollision() {
    console.log('Checking Collisions..');
    let signal = signals[currentSignalIndex];

    if (!signal.active || signal.y > canvas.height || signal.y + signal.height < 0) {
        return;
    }
    if (car.y <= signal.y + signal.height && car.y + car.height >= signal.y) {
//    if (car.y + car.height >= signal.y - 10 && car.y <= signal.y + signal.height + 10) {
        if (signal.type === 'stop' && !car.hasStopped) {
            gameOver = true;
            document.getElementById('message').innerText = 'You failed to stop at the STOP sign!';
        } else if (signal.type === 'trafficLight') {
            if (signal.color === 'red' && !car.hasStopped) {
                gameOver = true;
                document.getElementById('message').innerText = 'You ran a red light!';
            }
        } else if (signal.type === 'speedLimit') {
            car.maxSpeed = 40;
            if (car.speed > 40) {
                gameOver = true;
                document.getElementById('message').innerText = 'You exceeded the speed limit of 40 mph!';
            }
        } else if (signal.type === 'speedBump') {
            if (car.speed > 20) {
                gameOver = true;
                document.getElementById('message').innerText = 'You didn\'t slow down to 20 mph at the speed bump!';
            }
        } else if (signal.type === 'schoolZone') {
            car.inSchoolZone = true;
            car.maxSpeed = 20;
            if (car.speed > 20) {
                gameOver = true;
                document.getElementById('message').innerText = 'You didn\'t slow down to 20 mph in a school zone!';
            }
        } else if (signal.type === 'endschoolzone') {
            car.inSchoolZone = false;
            car.maxSpeed = 60;
            document.getElementById('message').innerText = 'You exited the school zone. Speed limit lifted.';
        } else if (signal.type === 'roadwork') {
            if (car.x + car.width > signal.x && car.x < signal.x + signal.width) {
                gameOver = true;
                console.error('Game Over: You collided with the roadwork zone!');
                document.getElementById('message').innerText = 'You collided with the roadwork zone!';
            }
        }

        signal.active = false;
        currentSignalIndex++;

        if (currentSignalIndex >= signals.length) {
            gameOver = true;
            document.getElementById('message').innerText = 'You have successfully completed the game!';
            return;
        }
    }
}

document.addEventListener('keydown', (e) => {
    if (e.code === 'ArrowUp') {
        car.speed = Math.min(car.speed + 20, car.maxSpeed);
    } else if (e.code === 'ArrowDown') {
        car.speed = Math.max(car.speed - 20, 0);
    } else if (e.code === 'ArrowLeft') {
        if (car.x > 360) {
            car.x = 320;
        }
    } else if (e.code === 'ArrowRight') {
        if (car.x < 390) {
            car.x = 380;
        }
    } else if (e.code === 'Space') {
        car.speed = 0;
        car.hasStopped = true;
        setTimeout(() => {
            car.hasStopped = false;
        }, 1000);
    }
});

function update() {
    if (!gameOver) {
        signals.forEach(signal => {
            signal.y += car.speed / 10;

            if (signal.y > canvas.height) {
                signal.y -= canvas.height + 5000;
                signal.active = true;
                if (signal.type === 'trafficLight') {
                    signal.cycleTime = 0;
                    signal.currentColor = 'green';
                }
            }

            if (signal.type === 'trafficLight') {
                signal.cycleTime += 16.67;
                if (signal.cycleTime >= 7000) {
                    signal.cycleTime = 0;
                }

                if (signal.cycleTime < 3000) {
                    signal.currentColor = 'green';
                } else if (signal.cycleTime < 4000) {
                    signal.currentColor = 'yellow';
                } else {
                    signal.currentColor = 'red';
                }
            }
        });

        checkCollision();

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawRoad();
        drawCar();
        drawSignals();
        drawSpeed();

        requestAnimationFrame(update);
    }
}

let imagesLoaded = 0;
let totalImages = Object.keys(signalImages).length;

for (let key in signalImages) {
    images[key] = new Image();
    images[key].src = signalImages[key];
    images[key].onload = () => {
        imagesLoaded++;
        if (imagesLoaded === totalImages) {
            console.log('All images loaded. Ready to start!');
        }
    };
}
