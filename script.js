var myGamePiece;
var myObstacles = [];
var crashed = false;
var score = 0;
var previousHighScore = 0;  // Puntuación más alta registrada
var gameSpeed = 15;  // Intervalo inicial del juego (menor es más rápido)

function showGame() {
    // Ocultar el menú de inicio y mostrar el juego
    document.getElementById('startMenu').style.display = 'none';
    document.getElementById('gameContainer').style.display = 'block';
    startGame(); // Comenzar el juego
}

function goToMenu() {
    // Detener el juego y mostrar el menú de inicio
    document.getElementById('gameContainer').style.display = 'none';
    document.getElementById('startMenu').style.display = 'flex';
    
    // Mostrar la puntuación final
    document.getElementById('scoreMessage').innerText = "Última puntuación: " + score + " puntos";
    
    // Actualizar la puntuación más alta si es necesario
    if (score > previousHighScore) {
        previousHighScore = score;
    }
}

function startGame() {
    crashed = false;
    score = 0;  // Reiniciar la puntuación
    //gameSpeed = 20;   Restablecer la velocidad del juego
    updateScore(); // Mostrar la puntuación inicial
    myGamePiece = new component(30, 30, "white", 10, 120);
    myObstacles = [];
    myGameArea.start();
    updateBackground();  // Asegurarse de que el fondo esté en el estado correcto al iniciar el juego

    window.addEventListener('keydown', function (e) {
        switch(e.keyCode) {
            case 37: moveleft(); break; // Left arrow
            case 38: moveup(); break;   // Up arrow
            case 39: moveright(); break; // Right arrow
            case 40: movedown(); break;  // Down arrow
        }
    });
    window.addEventListener('keyup', clearmove);
}

var myGameArea = {
    canvas : document.createElement("canvas"),
    start : function() {
        this.canvas.width = 480;
        this.canvas.height = 270;
        this.context = this.canvas.getContext("2d");
        document.getElementById('gameContainer').insertBefore(this.canvas, document.getElementById('gameContainer').childNodes[1]);
        this.frameNo = 0;
        this.interval = setInterval(updateGameArea, gameSpeed);
    },
    clear : function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },
    stop : function() {
        clearInterval(this.interval);
    },
    adjustSpeed : function(newSpeed) {
        // Detener el intervalo actual y ajustar la velocidad
        clearInterval(this.interval);
        this.interval = setInterval(updateGameArea, newSpeed);
    }
}

function component(width, height, color, x, y) {
    this.width = width;
    this.height = height;
    this.speedX = 0;
    this.speedY = 0;    
    this.x = x;
    this.y = y;    
    this.passed = false;
    
    this.update = function() {
        ctx = myGameArea.context;
        ctx.fillStyle = color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
    
    this.newPos = function() {
        // Calcular nueva posición
        this.x += this.speedX;
        this.y += this.speedY;
        
        // Limitar movimiento en los bordes del canvas
        if (this.x < 0) {  // Límite izquierdo
            this.x = 0;
        }
        if (this.x + this.width > myGameArea.canvas.width) {  // Límite derecho
            this.x = myGameArea.canvas.width - this.width;
        }
        if (this.y < 0) {  // Límite superior
            this.y = 0;
        }
        if (this.y + this.height > myGameArea.canvas.height) {  // Límite inferior
            this.y = myGameArea.canvas.height - this.height;
        }
    }

    this.crashWith = function(otherobj) {
        var myleft = this.x;
        var myright = this.x + (this.width);
        var mytop = this.y;
        var mybottom = this.y + (this.height);
        var otherleft = otherobj.x;
        var otherright = otherobj.x + (otherobj.width);
        var othertop = otherobj.y;
        var otherbottom = otherobj.y + (otherobj.height);
        var crash = true;
        if ((mybottom < othertop) || (mytop > otherbottom) || (myright < otherleft) || (myleft > otherright)) {
            crash = false;
        }
        return crash;
    }
}


function updateGameArea() {
    if (crashed) return;

    for (i = 0; i < myObstacles.length; i += 1) {
        // Detectar colisión
        if (myGamePiece.crashWith(myObstacles[i])) {
            triggerCrash();
            return;
        } 
        
        // Comprobar si el jugador ha sorteado una pared (cuando pasa el borde izquierdo del obstáculo)
        if (myObstacles[i].x + myObstacles[i].width < myGamePiece.x && !myObstacles[i].passed) {
            myObstacles[i].passed = true;  // Marca la pared como sorteada
            score += 50;  // Aumenta la puntuación
            updateScore();  // Actualiza la puntuación en pantalla
            updateBackground();  // Verificar y actualizar el fondo
            checkDifficultyIncrease();  // Verificar si se debe aumentar la dificultad
        }
    }
    
    myGameArea.clear();
    myGameArea.frameNo += 1;
    
    // Añadir obstáculos
    if (myGameArea.frameNo == 1 || everyinterval(150)) {
        var x = myGameArea.canvas.width;
        var minHeight = 20;
        var maxHeight = 200;
        var height = Math.floor(Math.random()*(maxHeight-minHeight+1)+minHeight);
        var minGap = 50;
        var maxGap = 200;
        var gap = Math.floor(Math.random()*(maxGap-minGap+1)+minGap);
        myObstacles.push(new component(10, height, "black", x, 0));
        myObstacles.push(new component(10, x - height - gap, "black", x, height + gap));
    }
    
    for (i = 0; i < myObstacles.length; i += 1) {
        myObstacles[i].x += -1;
        myObstacles[i].update();
    }
    
    myGamePiece.newPos();    
    myGamePiece.update();
}

function everyinterval(n) {
    if ((myGameArea.frameNo / n) % 1 == 0) {return true;}
    return false;
}

function moveup() {
    myGamePiece.speedY = -1; 
}

function movedown() {
    myGamePiece.speedY = 1; 
}

function moveleft() {
    myGamePiece.speedX = -1; 
}

function moveright() {
    myGamePiece.speedX = 1; 
}

function clearmove() {
    myGamePiece.speedX = 0; 
    myGamePiece.speedY = 0; 
}

function triggerCrash() {
    crashed = true;
    myGameArea.stop();
    var canvasElement = document.body.getElementsByTagName("canvas")[0];
    canvasElement.classList.add("crash");
    
    setTimeout(function() {
        canvasElement.classList.remove("crash");
        goToMenu(); // Volver al menú de inicio y mostrar la puntuación
    }, 500); // Mostrar el menú después de 0.5 segundos
}

function updateScore() {
    document.getElementById('scoreBoard').innerText = "Puntuación: " + score;
}

function updateBackground() {
    var canvasElement = document.getElementsByTagName('canvas')[0];
    if (score > previousHighScore) {
        // Puntuación actual es mayor que la anterior
        canvasElement.style.backgroundColor = '#4CAF50'; // Verde
    } else {
        // Puntuación actual es menor o igual que la anterior
        canvasElement.style.backgroundColor = '#f44336'; // Rojo
    }
}

function checkDifficultyIncrease() {
    if (score % 1000 === 0 && score !== 0) {
        // Aumentar la dificultad (acelerar el juego)
        gameSpeed = gameSpeed * 0.8;  // Incremento del 20% en la velocidad
        myGameArea.adjustSpeed(gameSpeed);
    }
}

// Guardar la puntuación más alta en LocalStorage
function saveHighScore(score) {
    // Verificar si existe una puntuación más alta almacenada
    var storedHighScore = localStorage.getItem('highScore');

    // Si no existe, o si la nueva puntuación es mayor, almacenarla
    if (storedHighScore === null || score > storedHighScore) {
        localStorage.setItem('highScore', score);
        alert('¡Nueva puntuación más alta guardada: ' + score + ' puntos!');
    }
}

// Obtener la puntuación más alta desde LocalStorage
function getHighScore() {
    var highScore = localStorage.getItem('highScore');

    // Si no hay una puntuación almacenada, devolver 0
    if (highScore === null) {
        return 0;
    }

    return parseInt(highScore);
}

function updateScore() {
    document.getElementById('scoreBoard').innerText = "Puntuación: " + score;

    // Mostrar la puntuación más alta
    var highScore = getHighScore();
    document.getElementById('highScoreBoard').innerText = "Puntuación más alta: " + highScore;
}

function triggerCrash() {
    crashed = true;
    myGameArea.stop();

    // Guardar la puntuación más alta si es necesario
    saveHighScore(score);

    // Mostrar animación de choque y volver al menú
    var canvasElement = document.body.getElementsByTagName("canvas")[0];
    canvasElement.classList.add("crash");

    setTimeout(function() {
        canvasElement.classList.remove("crash");
        goToMenu(); // Volver al menú de inicio y mostrar la puntuación
    }, 500);
}

function setDifficulty(level) {
    if (level === 'easy') {
        gameSpeed = 20;  // Velocidad más lenta para el modo fácil
    } else if (level === 'normal') {
        gameSpeed = 15;  // Velocidad normal
    } else if (level === 'hard') {
        gameSpeed = 10;  // Velocidad más rápida para el modo difícil
    }
    document.getElementById('scoreMessage').innerText = "Dificultad seleccionada: " + level.charAt(0).toUpperCase() + level.slice(1);
}

window.addEventListener('keydown', function (e) {
    switch(e.keyCode) {
        case 37: moveLeftActive = true; break; // Flecha izquierda
        case 38: moveUpActive = true; break;   // Flecha arriba
        case 39: moveRightActive = true; break; // Flecha derecha
        case 40: moveDownActive = true; break;  // Flecha abajo
    }
});

window.addEventListener('keyup', function (e) {
    switch(e.keyCode) {
        case 37: moveLeftActive = false; break;
        case 38: moveUpActive = false; break;
        case 39: moveRightActive = false; break;
        case 40: moveDownActive = false; break;
    }
});
