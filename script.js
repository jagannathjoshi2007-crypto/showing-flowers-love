// ============================================================
// HAND GESTURE FLOWER GARDEN
// Complete script.js
// ============================================================

const video = document.getElementById("video");
const canvas = document.getElementById("handCanvas");
const ctx = canvas.getContext("2d");

const stage = document.getElementById("stage");
const flowersLayer = document.getElementById("flowers");

const statusEl = document.getElementById("status");
const fingerCountEl = document.getElementById("fingerCount");
const loadingEl = document.getElementById("loading");

const cursor1 = document.getElementById("cursor1");
const cursor2 = document.getElementById("cursor2");


// ============================================================
// SETTINGS
// ============================================================

const FLOWERS = [
    "🌸",
    "🌺",
    "🌼",
    "🌻",
    "💮"
];

// Distance between flowers
const FLOWER_DISTANCE = 14;

// Distance used while filling fast movement
const TRAIL_SPACING = 7;

// Maximum flowers
const MAX_FLOWERS = 400;

// Small cooldown
const FLOWER_DELAY = 15;


// ============================================================
// VARIABLES
// ============================================================

let flowers = [];

let previousFlowerPositions = [];

let previousFingerPositions = [];

let lastPlantTime = 0;

let throwing = false;


// ============================================================
// CANVAS SIZE
// ============================================================

function resizeCanvas() {

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

}

resizeCanvas();

window.addEventListener(
    "resize",
    resizeCanvas
);


// ============================================================
// DISTANCE
// ============================================================

function distance(a, b) {

    return Math.hypot(
        a.x - b.x,
        a.y - b.y
    );

}


// ============================================================
// CREATE SINGLE FLOWER
// ============================================================

function createFlower(x, y) {

    if (throwing) {
        return;
    }


    // Prevent exact overlap
    const tooClose =
        previousFlowerPositions.some(
            position => {

                return distance(
                    position,
                    {
                        x: x,
                        y: y
                    }
                ) < FLOWER_DISTANCE;

            }
        );


    if (tooClose) {
        return;
    }


    // Create flower
    const flower =
        document.createElement("div");

    flower.className = "flower";


    // Random flower
    flower.textContent =
        FLOWERS[
        Math.floor(
            Math.random() *
            FLOWERS.length
        )
        ];


    // Random size
    flower.style.fontSize =
        `${28 + Math.random() * 22}px`;


    // Position
    flower.style.left =
        `${x}px`;

    flower.style.top =
        `${y}px`;


    flowersLayer.appendChild(
        flower
    );


    // Pop animation
    requestAnimationFrame(() => {

        flower.classList.add(
            "planted"
        );

    });


    flowers.push(flower);


    previousFlowerPositions.push({
        x: x,
        y: y
    });


    // Remove oldest flower if too many
    if (
        flowers.length >
        MAX_FLOWERS
    ) {

        const oldFlower =
            flowers.shift();

        if (oldFlower) {
            oldFlower.remove();
        }

        previousFlowerPositions.shift();

    }

}


// ============================================================
// CREATE FLOWER TRAIL
// ============================================================

function createFlowerTrail(
    x1,
    y1,
    x2,
    y2
) {

    const dx = x2 - x1;
    const dy = y2 - y1;

    const length =
        Math.hypot(dx, dy);


    /*
        Fast finger movement:

        Previous point
              |
              |
              |  ← fill all points
              |
              ↓
        Current point
    */

    const steps =
        Math.max(
            1,
            Math.ceil(
                length /
                TRAIL_SPACING
            )
        );


    for (
        let i = 1;
        i <= steps;
        i++
    ) {

        const t =
            i / steps;


        const x =
            x1 +
            dx * t;


        const y =
            y1 +
            dy * t;


        createFlower(
            x,
            y
        );

    }

}


// ============================================================
// THROW ALL FLOWERS
// ============================================================

function throwFlowers() {

    if (throwing) {
        return;
    }


    if (flowers.length === 0) {
        return;
    }


    throwing = true;


    const currentFlowers =
        [...flowers];


    flowers = [];

    previousFlowerPositions = [];

    previousFingerPositions = [];


    currentFlowers.forEach(
        flower => {

            const angle =
                Math.random() *
                Math.PI *
                2;


            const power =
                300 +
                Math.random() *
                650;


            const throwX =
                Math.cos(angle) *
                power;


            const throwY =
                Math.sin(angle) *
                power -
                180;


            const rotation =
                Math.random() *
                1000 -
                500;


            flower.style.setProperty(
                "--throw-x",
                `${throwX}px`
            );


            flower.style.setProperty(
                "--throw-y",
                `${throwY}px`
            );


            flower.style.setProperty(
                "--rotation",
                `${rotation}deg`
            );


            flower.classList.add(
                "throwing"
            );


            setTimeout(() => {

                flower.remove();

            }, 1000);

        }
    );


    setTimeout(() => {

        throwing = false;

    }, 1100);

}


// ============================================================
// FINGER UP DETECTION
// ============================================================

function fingerIsUp(
    lm,
    tip,
    pip,
    mcp
) {

    const tipY =
        lm[tip].y;

    const pipY =
        lm[pip].y;

    const mcpY =
        lm[mcp].y;


    return (
        tipY <
        pipY - 0.025 &&

        pipY <
        mcpY + 0.05
    );

}


// ============================================================
// FINGER STATES
// ============================================================

function getFingerStates(lm) {

    // INDEX
    const index =
        fingerIsUp(
            lm,
            8,
            6,
            5
        );


    // MIDDLE
    const middle =
        fingerIsUp(
            lm,
            12,
            10,
            9
        );


    // RING
    const ring =
        fingerIsUp(
            lm,
            16,
            14,
            13
        );


    // PINKY
    const pinky =
        fingerIsUp(
            lm,
            20,
            18,
            17
        );


    // ========================================================
    // THUMB
    // ========================================================

    const thumbTip =
        lm[4];

    const thumbIP =
        lm[3];

    const thumbMCP =
        lm[2];


    const thumbOpen =
        distance(
            thumbTip,
            thumbMCP
        ) >
        distance(
            thumbIP,
            thumbMCP
        ) * 1.15;


    return {

        thumb: thumbOpen,

        index: index,

        middle: middle,

        ring: ring,

        pinky: pinky

    };

}


// ============================================================
// NORMAL FINGER COUNT
// ============================================================

function countNormalFingers(states) {

    let count = 0;


    if (states.index) {
        count++;
    }

    if (states.middle) {
        count++;
    }

    if (states.ring) {
        count++;
    }

    if (states.pinky) {
        count++;
    }


    return count;

}


// ============================================================
// FULL FINGER COUNT
// ============================================================

function countAllFingers(states) {

    let count =
        countNormalFingers(
            states
        );


    if (states.thumb) {
        count++;
    }


    return count;

}


// ============================================================
// ACTIVE FINGER TIPS
// ============================================================

function getActiveTips(
    lm,
    states
) {

    const tips = [];


    /*
        Thumb intentionally excluded.

        1 finger:
        index

        2 fingers:
        index + middle
    */


    if (states.index) {

        tips.push({
            point: lm[8],
            finger: "index"
        });

    }


    if (states.middle) {

        tips.push({
            point: lm[12],
            finger: "middle"
        });

    }


    if (states.ring) {

        tips.push({
            point: lm[16],
            finger: "ring"
        });

    }


    if (states.pinky) {

        tips.push({
            point: lm[20],
            finger: "pinky"
        });

    }


    return tips;

}


// ============================================================
// VIDEO DISPLAY RECTANGLE
// ============================================================

function getVideoRect() {

    const stageWidth =
        stage.clientWidth;

    const stageHeight =
        stage.clientHeight;


    const videoWidth =
        video.videoWidth || 640;

    const videoHeight =
        video.videoHeight || 480;


    const videoRatio =
        videoWidth /
        videoHeight;

    const stageRatio =
        stageWidth /
        stageHeight;


    let width;
    let height;
    let left;
    let top;


    /*
        object-fit: contain
    */

    if (
        stageRatio >
        videoRatio
    ) {

        height =
            stageHeight;

        width =
            height *
            videoRatio;

        left =
            (
                stageWidth -
                width
            ) / 2;

        top = 0;

    }

    else {

        width =
            stageWidth;

        height =
            width /
            videoRatio;

        left = 0;

        top =
            (
                stageHeight -
                height
            ) / 2;

    }


    return {
        left: left,
        top: top,
        width: width,
        height: height
    };

}


// ============================================================
// MEDIAPIPE → SCREEN
// ============================================================

function landmarkToScreen(
    point
) {

    const rect =
        getVideoRect();


    /*
        Video is mirrored.

        Therefore:

        screen X =
        1 - MediaPipe X
    */

    const x =
        rect.left +
        (
            1 -
            point.x
        ) *
        rect.width;


    const y =
        rect.top +
        point.y *
        rect.height;


    return {
        x: x,
        y: y
    };

}


// ============================================================
// DRAW HAND SKELETON
// ============================================================

function drawHands(
    allHands
) {

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    const connections = [

        // Thumb
        [0, 1],
        [1, 2],
        [2, 3],
        [3, 4],

        // Index
        [0, 5],
        [5, 6],
        [6, 7],
        [7, 8],

        // Middle
        [5, 9],
        [9, 10],
        [10, 11],
        [11, 12],

        // Ring
        [9, 13],
        [13, 14],
        [14, 15],
        [15, 16],

        // Pinky
        [13, 17],
        [17, 18],
        [18, 19],
        [19, 20],

        // Palm
        [0, 17]

    ];


    allHands.forEach(
        landmarks => {

            // Lines
            ctx.lineWidth = 2;

            ctx.strokeStyle =
                "rgba(0,255,210,.8)";


            connections.forEach(
                connection => {

                    const a =
                        landmarkToScreen(
                            landmarks[
                            connection[0]
                            ]
                        );


                    const b =
                        landmarkToScreen(
                            landmarks[
                            connection[1]
                            ]
                        );


                    ctx.beginPath();


                    ctx.moveTo(
                        a.x,
                        a.y
                    );


                    ctx.lineTo(
                        b.x,
                        b.y
                    );


                    ctx.stroke();

                }
            );


            // Points
            landmarks.forEach(
                (point, index) => {

                    const p =
                        landmarkToScreen(
                            point
                        );


                    const isTip =
                        (
                            index === 4 ||
                            index === 8 ||
                            index === 12 ||
                            index === 16 ||
                            index === 20
                        );


                    ctx.beginPath();


                    ctx.arc(
                        p.x,
                        p.y,
                        isTip ? 6 : 3,
                        0,
                        Math.PI * 2
                    );


                    ctx.fillStyle =
                        isTip
                            ? "#ffffff"
                            : "#00ffd5";


                    ctx.fill();

                }
            );

        }
    );

}


// ============================================================
// MEDIAPIPE HANDS
// ============================================================

const hands =
    new Hands({

        locateFile:
            function (file) {

                return (
                    "https://cdn.jsdelivr.net/npm/" +
                    "@mediapipe/hands/" +
                    file
                );

            }

    });


hands.setOptions({

    maxNumHands: 2,

    modelComplexity: 1,

    minDetectionConfidence: 0.65,

    minTrackingConfidence: 0.65

});


// ============================================================
// RESULTS
// ============================================================

hands.onResults(
    function (results) {

        // Clear canvas
        ctx.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );


        // ====================================================
        // NO HAND
        // ====================================================

        if (
            !results.multiHandLandmarks ||
            results.multiHandLandmarks.length === 0
        ) {

            statusEl.textContent =
                "✋ Camera ke saamne hand lao";


            fingerCountEl.textContent =
                "Fingers: 0";


            cursor1.style.display =
                "none";

            cursor2.style.display =
                "none";


            previousFingerPositions = [];


            return;

        }


        // ====================================================
        // DRAW SKELETON
        // ====================================================

        drawHands(
            results.multiHandLandmarks
        );


        // ====================================================
        // PROCESS HANDS
        // ====================================================

        let normalFingerTotal = 0;

        let activeTips = [];


        results.multiHandLandmarks.forEach(
            function (lm) {

                const states =
                    getFingerStates(
                        lm
                    );


                // Count normal fingers
                normalFingerTotal +=
                    countNormalFingers(
                        states
                    );


                // Get active tips
                const tips =
                    getActiveTips(
                        lm,
                        states
                    );


                activeTips.push(
                    ...tips
                );

            }
        );


        // ====================================================
        // DISPLAY COUNT
        // ====================================================

        fingerCountEl.textContent =
            `Fingers: ${normalFingerTotal}`;


        // ====================================================
        // 5 FINGER OPEN PALM
        // ====================================================

        let hasOpenPalm = false;


        results.multiHandLandmarks.forEach(
            function (lm) {

                const states =
                    getFingerStates(
                        lm
                    );


                const fullCount =
                    countAllFingers(
                        states
                    );


                if (
                    fullCount === 5
                ) {

                    hasOpenPalm =
                        true;

                }

            }
        );


        if (hasOpenPalm) {

            statusEl.textContent =
                "🖐️ Open Palm → THROW!";


            cursor1.style.display =
                "none";

            cursor2.style.display =
                "none";


            previousFingerPositions = [];


            throwFlowers();


            return;

        }


        // ====================================================
        // 1 OR 2 FINGERS
        // ====================================================

        if (
            normalFingerTotal === 1 ||
            normalFingerTotal === 2
        ) {

            if (
                normalFingerTotal === 1
            ) {

                statusEl.textContent =
                    "☝️ 1 Finger → Flower";

            }
            else {

                statusEl.textContent =
                    "✌️ 2 Fingers → Flowers";

            }


            // Hide cursors first
            cursor1.style.display =
                "none";

            cursor2.style.display =
                "none";


            const now =
                Date.now();


            if (
                now -
                lastPlantTime >=
                FLOWER_DELAY
            ) {

                /*
                    Only first 2 active tips
                */

                const selectedTips =
                    activeTips.slice(
                        0,
                        2
                    );


                selectedTips.forEach(
                    function (
                        item,
                        index
                    ) {

                        const screen =
                            landmarkToScreen(
                                item.point
                            );


                        // ==================================================
                        // CURSOR
                        // ==================================================

                        const cursor =
                            index === 0
                                ? cursor1
                                : cursor2;


                        cursor.style.display =
                            "block";


                        cursor.style.left =
                            `${screen.x}px`;


                        cursor.style.top =
                            `${screen.y}px`;


                        // ==================================================
                        // FLOWER TRAIL
                        // ==================================================

                        const previous =
                            previousFingerPositions[
                            index
                            ];


                        if (previous) {

                            /*
                                Fill the complete
                                path between previous
                                and current fingertip.
                            */

                            createFlowerTrail(

                                previous.x,
                                previous.y,

                                screen.x,
                                screen.y

                            );

                        }
                        else {

                            /*
                                First point
                            */

                            createFlower(
                                screen.x,
                                screen.y
                            );

                        }


                        // Save current position
                        previousFingerPositions[
                            index
                        ] = {

                            x: screen.x,

                            y: screen.y

                        };

                    }
                );


                lastPlantTime =
                    now;

            }


            return;

        }


        // ====================================================
        // 0 FINGERS
        // ====================================================

        if (
            normalFingerTotal === 0
        ) {

            statusEl.textContent =
                "✊ Finger open karo";


            cursor1.style.display =
                "none";

            cursor2.style.display =
                "none";


            previousFingerPositions = [];


            return;

        }


        // ====================================================
        // 3 OR 4 FINGERS
        // ====================================================

        statusEl.textContent =
            `${normalFingerTotal} Fingers — 1 ya 2 dikhao`;


        cursor1.style.display =
            "none";

        cursor2.style.display =
            "none";


        previousFingerPositions = [];

    }
);


// ============================================================
// CAMERA
// ============================================================

const camera =
    new Camera(
        video,
        {

            onFrame:
                async function () {

                    await hands.send({
                        image: video
                    });

                },

            width: 640,

            height: 480

        }
    );


// ============================================================
// START CAMERA
// ============================================================

camera
    .start()
    .then(
        function () {

            loadingEl.classList.add(
                "hidden"
            );


            statusEl.textContent =
                "Camera ready — ☝️ finger dikhao";

        }
    )
    .catch(
        function (error) {

            console.error(
                "Camera Error:",
                error
            );


            loadingEl.innerHTML = `

                <div>
                    ❌ Camera start nahi hua
                </div>

                <div style="
                    font-size:12px;
                    opacity:.7;
                    margin-top:10px;
                ">
                    ${error.message}
                </div>

            `;

        }
    );