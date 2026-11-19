/*
========================================
HTML-ELEMENT
========================================
*/

const startButton =
    document.getElementById("startButton");


const startScreen =
    document.getElementById("startScreen");

const selectionScene =
    document.getElementById("selectionScene");

const familyArea =
    document.getElementById("familyArea");

const surfers =
    document.querySelectorAll(".surfer");

const gameMessage =
    document.getElementById("gameMessage");

const surfScene =
    document.getElementById("surfScene");

const waveArea =
    document.getElementById("waveArea");

const playerElement =
    document.getElementById("player");

const activeSurfer =
    document.getElementById("activeSurfer");

const objectLayer =
    document.getElementById("objectLayer");

const surfScoreElement =
    document.getElementById("surfScore");

const comboDisplay =
    document.getElementById("comboDisplay");

const surfLivesElement =
    document.getElementById("surfLives");

const actionMessage =
    document.getElementById("actionMessage");

const jumpButton =
    document.getElementById("jumpButton");

const leftButton =
    document.getElementById("leftButton");

const rightButton =
    document.getElementById("rightButton");

const upButton =
    document.getElementById("upButton");

const downButton =
    document.getElementById("downButton");

const gameOverScreen =
    document.getElementById("gameOverScreen");

const finalScore =
    document.getElementById("finalScore");

const gameOverComment =
    document.getElementById("gameOverComment");

const playAgainButton =
    document.getElementById("playAgainButton");


/*
========================================
BILDER
========================================
*/

const surfingImages = {
    "Jørgen":
        "assets/images/jorgen-surfing.png",

    "Elisabeth":
        "assets/images/elisabeth-surfing.png",

    "Filip":
        "assets/images/filip-surfing.png",

    "Jens":
        "assets/images/jens-surfing.png"
};


/*
========================================
POENG PER SURFER I DENNE SPILLØKTEN
Poengene lagres bare mens siden er åpen.
========================================
*/

const surferScores = {
    "Jørgen": 0,
    "Elisabeth": 0,
    "Filip": 0,
    "Jens": 0
};

function updateSurferScoreLabels() {
    surfers.forEach(function (surfer) {
        const surferName = surfer.dataset.name;

        let scoreLabel =
            surfer.querySelector(".surfer-best");

        if (!scoreLabel) {
            scoreLabel =
                document.createElement("small");

            /*
            Vi beholder CSS-klassen surfer-best,
            men teksten viser nå rundepoeng.
            */
            scoreLabel.className = "surfer-best";
            surfer.appendChild(scoreLabel);
        }

        scoreLabel.textContent =
            "Poeng: " + surferScores[surferName];
    });
}

function resetSelectedSurferScore() {
    if (!selectedSurfer) {
        return;
    }

    surferScores[selectedSurfer] = 0;
    updateSurferScoreLabels();
}

function saveSelectedSurferScore() {
    if (!selectedSurfer) {
        return;
    }

    surferScores[selectedSurfer] = score;
    updateSurferScoreLabels();
}

updateSurferScoreLabels();

/*
========================================
SPILLDATA
========================================
*/

let gameState = "start";

let selectedSurfer = null;

let score = 0;
let lives = 3;
let combo = 0;

let gameTime = 0;
let difficultyLevel = 1;

let animationFrame = null;
let spawnTimer = null;

let lastFrameTime = 0;

let isJumping = false;
let canBeHit = true;

let gameObjects = [];

let pointerActive = false;

const pointerTarget = {
    x: 0,
    y: 0
};


/*
Spillerens posisjon og fart.
*/

const player = {
    x: 90,
    y: 180,

    width: 180,
    height: 220,

    speed: 390,

    rotation: 0
};


/*
Tastene som holdes inne.
*/

const keys = {
    left: false,
    right: false,
    up: false,
    down: false
};


/*
========================================
STARTINTRO
========================================
*/

startButton.addEventListener(
    "click",
    startIntro
);


function startIntro() {
    if (gameState !== "start") {
        return;
    }

    gameState = "intro";

    startButton.disabled = true;

    startScreen.classList.add(
        "hidden-away"
    );

    gameMessage.textContent =
        "Familien er på vei til stranden!";

    setTimeout(function () {
        gameMessage.textContent = "";

        showSurfers();
    }, 800);
}


/*
========================================
VIS FAMILIEN
========================================
*/

function showSurfers() {
    surfers.forEach(function (surfer, index) {
        setTimeout(function () {
            surfer.classList.add("enter");
        }, index * 1200);
    });

    const introLength =
        (surfers.length - 1) * 1200
        + 1150;

    setTimeout(function () {
        familyArea.classList.add("ready");

        gameState = "characterSelect";

        gameMessage.textContent =
            "Velg en surfer!";
    }, introLength);
}


/*
========================================
VELG SURFER
========================================
*/

surfers.forEach(function (surfer) {
    surfer.addEventListener(
        "click",
        chooseSurfer
    );
});


function chooseSurfer(event) {
    if (gameState !== "characterSelect") {
        return;
    }

    const clickedSurfer =
        event.currentTarget;

    selectedSurfer =
        clickedSurfer.dataset.name;

    /* Ny runde for valgt surfer starter på null. */
    resetSelectedSurferScore();

    surfers.forEach(function (surfer) {
        surfer.classList.remove(
            "selected",
            "not-selected"
        );

        if (surfer === clickedSurfer) {
            surfer.classList.add("selected");
        } else {
            surfer.classList.add(
                "not-selected"
            );
        }
    });

    gameState = "transition";

    gameMessage.textContent =
        selectedSurfer +
        " er klar for bølgene!";

    setTimeout(function () {
        startSurfing();
    }, 1300);
}


/*
========================================
START SURFESPILLET
========================================
*/

function startSurfing() {
    selectionScene.classList.add("hidden");

    surfScene.classList.remove("hidden");

    gameMessage.textContent = "";

    activeSurfer.src =
        surfingImages[selectedSurfer];

    activeSurfer.alt =
        selectedSurfer +
        " surfer på et surfebrett";

    score = 0;
    lives = 3;
    combo = 0;
    gameTime = 0;
    difficultyLevel = 1;

    gameObjects = [];

    objectLayer.innerHTML = "";

    isJumping = false;
    canBeHit = true;

    keys.left = false;
    keys.right = false;
    keys.up = false;
    keys.down = false;

    gameState = "surfing";

    /*
    Startposisjon beregnes når
    surfescenen er synlig.
    */

    setTimeout(function () {
        resetPlayerPosition();

        updateInterface();

        createRandomObject();

        clearInterval(spawnTimer);

        spawnTimer = setInterval(
            createRandomObject,
            2500
        );

        lastFrameTime =
            performance.now();

        animationFrame =
            requestAnimationFrame(gameLoop);
    }, 80);
}


/*
========================================
STARTPOSISJON
========================================
*/

function resetPlayerPosition() {
    player.width =
        playerElement.offsetWidth;

    player.height =
        playerElement.offsetHeight;

    player.x =
        waveArea.clientWidth * 0.12;

    player.y =
        waveArea.clientHeight
        - player.height
        - 25;

    pointerTarget.x = player.x;
    pointerTarget.y = player.y;

    drawPlayer();
}


/*
========================================
SPILLØKKE
========================================
*/

function gameLoop(currentTime) {
    if (gameState !== "surfing") {
        return;
    }

    let deltaTime =
        (currentTime - lastFrameTime)
        / 1000;

    deltaTime =
        Math.min(deltaTime, 0.05);

    lastFrameTime = currentTime;

    gameTime += deltaTime;

    updateDifficultyMessage();
    updatePlayer(deltaTime);

    updateObjects(deltaTime);

    checkAllCollisions();

    removeOldObjects();

    animationFrame =
        requestAnimationFrame(gameLoop);
}


/*
========================================
FLYTT SPILLEREN
========================================
*/

function updatePlayer(deltaTime) {
    let horizontal = 0;
    let vertical = 0;

    if (keys.left) {
        horizontal -= 1;
    }

    if (keys.right) {
        horizontal += 1;
    }

    if (keys.up) {
        vertical -= 1;
    }

    if (keys.down) {
        vertical += 1;
    }

    /*
    Normaliser diagonal bevegelse.
    */

    if (
        horizontal !== 0
        && vertical !== 0
    ) {
        horizontal *= 0.707;
        vertical *= 0.707;
    }

    if (
        horizontal !== 0
        || vertical !== 0
    ) {
        pointerActive = false;

        player.x +=
            horizontal
            * player.speed
            * deltaTime;

        player.y +=
            vertical
            * player.speed
            * deltaTime;
    }


    /*
    Fingerstyring:
    beveg gradvis mot fingerposisjonen.
    */

    if (pointerActive) {
        const differenceX =
            pointerTarget.x - player.x;

        const differenceY =
            pointerTarget.y - player.y;

        const distance =
            Math.hypot(
                differenceX,
                differenceY
            );

        if (distance > 5) {
            const maximumMovement =
                player.speed
                * 1.25
                * deltaTime;

            const movement =
                Math.min(
                    maximumMovement,
                    distance
                );

            player.x +=
                differenceX
                / distance
                * movement;

            player.y +=
                differenceY
                / distance
                * movement;

            horizontal =
                differenceX / distance;

            vertical =
                differenceY / distance;
        }
    }


    /*
    Figuren vipper litt når den
    beveger seg opp eller ned.
    */

    const targetRotation =
        vertical * 9;

    player.rotation +=
        (targetRotation - player.rotation)
        * 0.14;


    keepPlayerInside();

    drawPlayer();
}


/*
========================================
HOLD SPILLEREN INNENFOR OMRÅDET
========================================
*/

function keepPlayerInside() {
    player.width =
        playerElement.offsetWidth;

    player.height =
        playerElement.offsetHeight;

    const maximumX =
        waveArea.clientWidth
        - player.width;

    const maximumY =
        waveArea.clientHeight
        - player.height;

    player.x =
        Math.max(
            0,
            Math.min(
                player.x,
                maximumX
            )
        );

    player.y =
        Math.max(
            0,
            Math.min(
                player.y,
                maximumY
            )
        );
}


/*
========================================
TEGN SPILLEREN
========================================
*/

function drawPlayer() {
    playerElement.style.left =
        player.x + "px";

    playerElement.style.top =
        player.y + "px";

    playerElement.style.transform =
        "rotate(" +
        player.rotation +
        "deg)";
}


/*
========================================
TASTATUR
========================================
*/

document.addEventListener(
    "keydown",
    function (event) {
        if (gameState !== "surfing") {
            return;
        }

        const key =
            event.key.toLowerCase();

        if (
            key === "arrowleft"
            || key === "a"
        ) {
            keys.left = true;
        }

        if (
            key === "arrowright"
            || key === "d"
        ) {
            keys.right = true;
        }

        if (
            key === "arrowup"
            || key === "w"
        ) {
            keys.up = true;
        }

        if (
            key === "arrowdown"
            || key === "s"
        ) {
            keys.down = true;
        }

        if (
            event.code === "Space"
        ) {
            jump();
        }

        if (
            event.code === "Space"
            || key.startsWith("arrow")
        ) {
            event.preventDefault();
        }
    }
);


document.addEventListener(
    "keyup",
    function (event) {
        const key =
            event.key.toLowerCase();

        if (
            key === "arrowleft"
            || key === "a"
        ) {
            keys.left = false;
        }

        if (
            key === "arrowright"
            || key === "d"
        ) {
            keys.right = false;
        }

        if (
            key === "arrowup"
            || key === "w"
        ) {
            keys.up = false;
        }

        if (
            key === "arrowdown"
            || key === "s"
        ) {
            keys.down = false;
        }
    }
);


/*
========================================
RETNINGKNAPPER
========================================
*/

setupDirectionButton(
    leftButton,
    "left"
);

setupDirectionButton(
    rightButton,
    "right"
);

setupDirectionButton(
    upButton,
    "up"
);

setupDirectionButton(
    downButton,
    "down"
);


function setupDirectionButton(
    button,
    direction
) {
    button.addEventListener(
        "pointerdown",
        function (event) {
            event.preventDefault();

            pointerActive = false;

            keys[direction] = true;

            button.classList.add("active");

            button.setPointerCapture(
                event.pointerId
            );
        }
    );

    button.addEventListener(
        "pointerup",
        function () {
            keys[direction] = false;

            button.classList.remove(
                "active"
            );
        }
    );

    button.addEventListener(
        "pointercancel",
        function () {
            keys[direction] = false;

            button.classList.remove(
                "active"
            );
        }
    );
}


/*
========================================
FINGERSTYRING I SPILLOMRÅDET
========================================
*/

waveArea.addEventListener(
    "pointerdown",
    setPointerTarget
);

waveArea.addEventListener(
    "pointermove",
    function (event) {
        if (
            event.buttons === 1
            || event.pointerType === "touch"
        ) {
            setPointerTarget(event);
        }
    }
);


waveArea.addEventListener(
    "pointerup",
    stopPointerSteering
);

waveArea.addEventListener(
    "pointercancel",
    stopPointerSteering
);

waveArea.addEventListener(
    "pointerleave",
    function (event) {
        if (event.pointerType !== "mouse") {
            stopPointerSteering();
        }
    }
);

function stopPointerSteering() {
    pointerActive = false;
}


function setPointerTarget(event) {
    if (gameState !== "surfing") {
        return;
    }

    const areaRect =
        waveArea.getBoundingClientRect();

    pointerTarget.x =
        event.clientX
        - areaRect.left
        - player.width / 2;

    pointerTarget.y =
        event.clientY
        - areaRect.top
        - player.height / 2;

    pointerActive = true;
}


/*
========================================
HOPP
========================================
*/

jumpButton.addEventListener(
    "click",
    jump
);


function jump() {
    if (
        gameState !== "surfing"
        || isJumping
    ) {
        return;
    }

    isJumping = true;

    playerElement.classList.add(
        "jumping"
    );

    setTimeout(function () {
        playerElement.classList.remove(
            "jumping"
        );

        isJumping = false;
    }, 650);
}


/*
========================================
LAG SPILLOBJEKTER
========================================
*/

function updateDifficultyMessage() {
    let newLevel = 1;

    if (gameTime >= 45) {
        newLevel = 4;
    } else if (gameTime >= 30) {
        newLevel = 3;
    } else if (gameTime >= 15) {
        newLevel = 2;
    }

    if (newLevel === difficultyLevel) {
        return;
    }

    difficultyLevel = newLevel;

    const messages = {
        2: "Raskere bølger!",
        3: "Hai-fart!",
        4: "Tropisk storm!"
    };

    showActionMessage(messages[difficultyLevel]);
}


function createRandomObject() {
    if (gameState !== "surfing") {
        return;
    }

    const randomNumber = Math.random();
    let type;

    /*
    35 % gullskjell
    20 % hibiskusblomster
    25 % haier
    20 % andre surfere
    */

    if (randomNumber < 0.35) {
        type = "shell";
    } else if (randomNumber < 0.55) {
        type = "flower";
    } else if (randomNumber < 0.80) {
        type = "wave";
    } else {
        type = "otherSurfer";
    }

    createGameObject(type);
}

function createGameObject(type) {
    const element = document.createElement("div");
    element.classList.add("game-object");

    if (type === "shell") {
        element.classList.add("shell-bonus");
    } else if (type === "flower") {
        element.classList.add("hibiscus-bonus");
    } else if (type === "wave") {
        element.classList.add("shark-obstacle");
    } else {
        element.classList.add("other-surfer-obstacle");
    }

    objectLayer.appendChild(element);

    const objectWidth = element.offsetWidth;
    const objectHeight = element.offsetHeight;
    const topMargin = 20;
    const bottomMargin = 25;

    let availableHeight = Math.max(
        1,
        waveArea.clientHeight
        - objectHeight
        - topMargin
        - bottomMargin
    );

    let y = topMargin + Math.random() * availableHeight;

    /* Haier og andre surfere holder seg i nedre 65 % av vannet. */
    if (type === "wave" || type === "otherSurfer") {
        const lowerStart = waveArea.clientHeight * 0.35;
        availableHeight = Math.max(
            1,
            waveArea.clientHeight
            - objectHeight
            - lowerStart
            - bottomMargin
        );
        y = lowerStart + Math.random() * availableHeight;
    }

    /* Objektene kommer inn fra høyre. */
    const x = waveArea.clientWidth + 60;

    /* Tydelig progresjon uten brå start. */
    /*
    Farten øker tydelig i trinn.

    0–14 sekunder: 260 + gradvis økning
    15–29 sekunder: 360 + gradvis økning
    30–44 sekunder: 470 + gradvis økning
    45+ sekunder: 590 + gradvis økning
    */

    let baseSpeed = 260;

    if (gameTime >= 45) {
        baseSpeed = 590;
    } else if (gameTime >= 30) {
        baseSpeed = 470;
    } else if (gameTime >= 15) {
        baseSpeed = 360;
    }

    let speed = Math.min(
        820,
        baseSpeed
        + gameTime * 2.4
        + score * 0.11
    );

    /* Bonusobjektene er litt enklere å samle. */
    if (type === "shell" || type === "flower") {
        speed *= 0.88;
    }

    const gameObject = {
        element: element,
        type: type,
        x: x,
        y: y,
        width: objectWidth,
        height: objectHeight,
        speed: speed,
        collected: false,
        passed: false
    };

    gameObjects.push(gameObject);
    drawGameObject(gameObject);
}

/*
========================================
FLYTT SPILLOBJEKTER
========================================
*/

function updateObjects(deltaTime) {
    gameObjects.forEach(function (gameObject) {
        gameObject.x -=
            gameObject.speed * deltaTime;

        drawGameObject(gameObject);
    });
}

function drawGameObject(gameObject) {
    /*
    left og top styrer plasseringen.
    Da kan CSS animere sol og ring uten
    å overskrive objektets posisjon.
    */
    gameObject.element.style.left =
        gameObject.x + "px";

    gameObject.element.style.top =
        gameObject.y + "px";
}


/*
========================================
KOLLISJON
========================================
*/

function checkAllCollisions() {
    const playerRect =
        getSmallerPlayerRect();

    gameObjects.forEach(
        function (gameObject) {
            if (gameObject.collected) {
                return;
            }

            const objectRect =
                gameObject.element
                    .getBoundingClientRect();

            const overlap =
                rectanglesOverlap(
                    playerRect,
                    objectRect
                );

            if (!overlap) {
                return;
            }


            if (gameObject.type === "shell") {
                collectObject(
                    gameObject,
                    10,
                    "Gullskjell! +10"
                );
            }


            if (gameObject.type === "flower") {
                collectObject(
                    gameObject,
                    25,
                    "Hibiskus! +25"
                );
            }


            if (
                gameObject.type === "wave"
                || gameObject.type === "otherSurfer"
            ) {
                /*
                Hopp beskytter mot lave
                hindringer.
                */

                if (isJumping) {
                    jumpOverObject(
                        gameObject
                    );
                } else {
                    hitObstacle(
                        gameObject
                    );
                }
            }
        }
    );
}


/*
Bruk et litt mindre treffområde enn
hele PNG-bildet. Det gjør spillet mer
rettferdig.
*/

function getSmallerPlayerRect() {
    const fullRect =
        playerElement
            .getBoundingClientRect();

    return {
        left:
            fullRect.left
            + fullRect.width * 0.22,

        right:
            fullRect.right
            - fullRect.width * 0.18,

        top:
            fullRect.top
            + fullRect.height * 0.2,

        bottom:
            fullRect.bottom
            - fullRect.height * 0.08
    };
}


function rectanglesOverlap(
    first,
    second
) {
    return (
        first.left < second.right
        &&
        first.right > second.left
        &&
        first.top < second.bottom
        &&
        first.bottom > second.top
    );
}


/*
========================================
SAMLE BONUS
========================================
*/

function collectObject(
    gameObject,
    points,
    message
) {
    gameObject.collected = true;

    gameObject.element.remove();

    score += points;
    combo++;


    /*
    Tre vellykkede samlinger gir
    50 bonuspoeng.
    */

    if (combo > 0 && combo % 3 === 0) {
        score += 50;

        showActionMessage(
            "Super-serie! +50"
        );
    } else {
        showActionMessage(message);
    }

    updateInterface();
}


/*
========================================
HOPP OVER HINDRING
========================================
*/

function jumpOverObject(gameObject) {
    if (gameObject.collected) {
        return;
    }

    gameObject.collected = true;

    gameObject.element.remove();

    score += 30;
    combo++;

    showActionMessage(
        "Flott hopp! +30"
    );

    if (combo > 0 && combo % 3 === 0) {
        score += 50;

        showActionMessage(
            "Tre på rad! +50"
        );
    }

    updateInterface();
}


/*
========================================
TREFF
========================================
*/

function hitObstacle(gameObject, hitMessage = "Au! Ett liv mindre") {
    if (
        gameObject.collected
        || !canBeHit
    ) {
        return;
    }

    gameObject.collected = true;

    gameObject.element.remove();

    canBeHit = false;

    lives--;
    combo = 0;

    playerElement.classList.add("hit");

    showActionMessage(hitMessage);

    updateInterface();

    setTimeout(function () {
        playerElement.classList.remove(
            "hit"
        );

        canBeHit = true;
    }, 950);

    if (lives <= 0) {
        endGame();
    }
}


/*
========================================
FJERN GAMLE OBJEKTER
========================================
*/

function removeOldObjects() {
    gameObjects = gameObjects.filter(function (gameObject) {
        if (gameObject.collected) {
            return false;
        }

        /* Objektet har passert høyre kant. */
        if (
            gameObject.x
            + gameObject.width
            < -150
        ) {
            gameObject.element.remove();

            /* Unngått hindring gir fem poeng. */
            if (
                gameObject.type === "wave"
                || gameObject.type === "otherSurfer"
            ) {
                score += 5;
                updateInterface();
            }

            return false;
        }

        return true;
    });
}


/*
========================================
KORT BESKJED
========================================
*/

function showActionMessage(message) {
    actionMessage.textContent =
        message;

    actionMessage.classList.remove(
        "show"
    );

    /*
    Tvinger nettleseren til å starte
    animasjonen på nytt.
    */

    void actionMessage.offsetWidth;

    actionMessage.classList.add(
        "show"
    );
}


/*
========================================
OPPDATER SKJERM
========================================
*/

function updateInterface() {
    surfScoreElement.textContent =
        "Poeng: " + score;

    comboDisplay.textContent =
        "Serie: " + combo;

    let hearts = "";

    for (
        let index = 0;
        index < lives;
        index++
    ) {
        hearts += "❤️ ";
    }

    surfLivesElement.textContent =
        "Liv: " + hearts;
}


/*
========================================
GAME OVER
========================================
*/

function endGame() {
    gameState = "gameOver";

    clearInterval(spawnTimer);

    cancelAnimationFrame(
        animationFrame
    );

    saveSelectedSurferScore();

    finalScore.textContent =
        selectedSurfer +
        " fikk " +
        score +
        " poeng.";

    if (score < 100) {
        gameOverComment.textContent =
            "En god start. Prøv å samle flere gullskjell!";
    } else if (score < 300) {
        gameOverComment.textContent =
            "Flott surfing! Haiene begynner å få problemer.";
    } else {
        gameOverComment.textContent =
            "Fantastisk! Familien har fått en surfemester.";
    }

    gameOverScreen.classList.remove(
        "hidden"
    );
}


/*
========================================
SPILL PÅ NYTT
========================================
*/

playAgainButton.addEventListener(
    "click",
    resetGame
);


function resetGame() {
    clearInterval(spawnTimer);

    cancelAnimationFrame(
        animationFrame
    );

    gameObjects = [];

    objectLayer.innerHTML = "";

    gameOverScreen.classList.add(
        "hidden"
    );

    surfScene.classList.add("hidden");

    selectionScene.classList.remove(
        "hidden"
    );

    surfers.forEach(function (surfer) {
        surfer.classList.remove(
            "selected",
            "not-selected"
        );
    });

    selectedSurfer = null;

    score = 0;
    lives = 3;
    combo = 0;

    isJumping = false;
    canBeHit = true;
    pointerActive = false;

    familyArea.classList.add("ready");

    gameState = "characterSelect";

    gameMessage.textContent =
        "Velg en surfer!";
}


/*
========================================
SLIPP ALLE KONTROLLER
========================================
*/

function resetControls() {
    keys.left = false;
    keys.right = false;
    keys.up = false;
    keys.down = false;
    pointerActive = false;

    document.querySelectorAll(".control-button")
        .forEach(function (button) {
            button.classList.remove("active");
        });
}

window.addEventListener("blur", resetControls);
document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
        resetControls();
    }
});

/*
========================================
ENDRET SKJERMSTØRRELSE
========================================
*/

window.addEventListener(
    "resize",
    function () {
        if (gameState !== "surfing") {
            return;
        }

        keepPlayerInside();

        drawPlayer();
    }
);
