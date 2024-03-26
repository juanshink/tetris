import { BLOCK_SIZE, BOARD_WIDTH, BOARD_HEIGHT } from './const'
import { EVENT_MOV } from './const'
import { PIECES } from './pieces'
import './style.css'

// importo el audio de mp3




// 1) Inicializar el canvas

const canvas = document.querySelector('canvas')
const context = canvas.getContext('2d')

const $score = document.querySelector('#score')
let score = 0

const $level = document.querySelector('#level')
let level = 0

const $nextpiece = document.querySelector('#nextpiece');
let nextPieceShape = getNextPiece();


canvas.width = BLOCK_SIZE * BOARD_WIDTH
canvas.height = BLOCK_SIZE * BOARD_HEIGHT

context.scale(BLOCK_SIZE, BLOCK_SIZE)


// 3) Board

const board = createdBord(BOARD_WIDTH, BOARD_HEIGHT)

function createdBord(width, height){
  return Array(height).fill().map(() => Array(width).fill(0))
}

// 4) Pieces

const piece = {
  position: {x:6, y:0},
  shape:getNextPiece()
}

// Proxima piez

function getNextPiece() {
  const nextPieceIndex = Math.floor(Math.random() * PIECES.length);
  return PIECES[nextPieceIndex];
}


// 2) Game loop

let dropCounter = 0;
let lastTime = 0;
let speedMultiplier = 1; // Multiplicador de velocidad inicial

function update(time = 0){
  const deltaTime = time - lastTime;
  lastTime = time;

  dropCounter += deltaTime * speedMultiplier; // Aumenta el contador de caída basado en el multiplicador de velocidad

  if(dropCounter > 1000){
    piece.position.y++;
    dropCounter = 0;
    if (checkCollision()){
      piece.position.y--;
      solidifyPiece();
      removeRow();
    }
  }

   // Verifica si el puntaje alcanza un múltiplo de 50 para aumentar la velocidad
   if (score % 50 === 0 && score !== 0) {
    console.log("este es el score: ", score)
    speedMultiplier += 0.02; //(aumenta la velocidad)
  }

  draw();
  window.requestAnimationFrame(update);
}

function draw(){
  context.fillStyle = '#000'
  context.fillRect(0, 0, canvas.width, canvas.height)

  board.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value === 1){
        context.fillStyle = 'yellow'
        context.fillRect(x, y, 1, 1)
      }
    })
  })
  
  piece.shape.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value === 1) {
        // Dibuja el borde de la pieza
        context.fillStyle = 'black'; // Color del borde
        context.fillRect(x + piece.position.x - 0.05, y + piece.position.y - 0.05, 1.1, 1.1); // Aumenta ligeramente el tamaño del rectángulo para crear el borde
        // Dibuja el interior de la pieza
        context.fillStyle = 'red'; // Color del interior
        context.fillRect(x + piece.position.x, y + piece.position.y, 1, 1);
      }
    });
  });

  showNextPiece(nextPieceShape);
  $score.innerText = score 
  $level.innerText = level
}


// 5) Mover las piezas

  document.addEventListener('keydown', event => {

    if (event.key === EVENT_MOV.LEFT){
     moveLeft()
    } 
      
    if (event.key === EVENT_MOV.RIGTH){
      moveRight()
    }

    if (event.key === EVENT_MOV.DOWN) {
      moveDown()
    }

    // Rotar las piezas
    if (event.key === EVENT_MOV.UP) {
      rotate()
    }

  })

  function moveLeft(){
    piece.position.x--
    if(checkCollision()){
      piece.position.x++
    }
  }

  function moveRight(){
    piece.position.x++
      if(checkCollision()){
        piece.position.x--
      }
  }

  function moveDown(){
    piece.position.y++
    if(checkCollision()){
      piece.position.y--
      solidifyPiece()
      removeRow()
    }
  }

  function rotate(){
    const rotated = []

      for(let i=0; i < piece.shape[0].length; i++){
        const row = []

        for(let j = piece.shape.length - 1; j >= 0; j--){
          row.push(piece.shape[j][i])
        }

        rotated.push(row)
      }

      const previousShape = piece.shape
      piece.shape = rotated
      if(checkCollision()){
        piece.shape = previousShape
      }
  }

// 6) Colisiones

function checkCollision(){
  return piece.shape.find((row, y) =>{
    return row.find((value, x) =>{
      return(
        value !== 0 &&
        board[y + piece.position.y]?.[x + piece.position.x] != 0
      )
    })
  })
}

// 7) Solidificacion

function solidifyPiece(){
  // Solidificar la pieza actual en el tablero
  piece.shape.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value === 1){
        board[y + piece.position.y][x + piece.position.x] = 1
      }
    })
  });

  // Reiniciar la posición de la pieza actual
  piece.position.x = Math.floor(BOARD_WIDTH / 2);
  piece.position.y = 0;

  // Asignar la forma de la próxima pieza a la pieza actual
  piece.shape = nextPieceShape;

  // Obtener la forma de la próxima pieza para el siguiente ciclo
  nextPieceShape = getNextPiece();

  // Dibujar la pieza actual en el canvas
  draw();

  // Verificar si hay colisión con la nueva pieza
  if(checkCollision()){
    window.alert('GAME OVER');
    board.forEach((row) => row.fill(0));
  }
}


// 8) Remover linea

let linesforuplevel = 0

function removeRow(){
  const rowsToRemove = []

  board.forEach((row, y) => {
    if (row.every(value => value === 1)){
      rowsToRemove.push(y)
    }
  })

  rowsToRemove.forEach(y => {
    board.splice(y, 1)
    const newRow = Array(BOARD_WIDTH).fill(0)
    board.unshift(newRow)
    score += 10
    linesforuplevel += 1
    if (linesforuplevel === 5){
      level += 1
      linesforuplevel = 0
    }
  })
}

//////////////////////////////////////////////

const $start = document.querySelector('.startButton')
const section = document.querySelector('section')

$start.addEventListener('click', () =>{
  update()

  section.remove()

  const audio = new Audio('./tetrissong.mp3')
  audio.volume = 0.5
  audio.play()

})

/// MOSTRAR LA SIGUIENTE PIEZA


function showNextPiece(nextPieceShape) {
  // Limpiar el contenido actual del elemento HTML
  $nextpiece.innerHTML = '';

  // Crear un nuevo canvas para dibujar la próxima pieza
  const nextPieceCanvas = document.createElement('canvas');
  const nextPieceContext = nextPieceCanvas.getContext('2d');

  // Calcular el tamaño del canvas basado en la forma de la próxima pieza
  nextPieceCanvas.width = nextPieceShape[0].length * BLOCK_SIZE;
  nextPieceCanvas.height = nextPieceShape.length * BLOCK_SIZE;

  // Escalar el contexto del canvas
  nextPieceContext.scale(BLOCK_SIZE, BLOCK_SIZE);

  // Dibujar la próxima pieza en el canvas
  nextPieceShape.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value === 1) {
        nextPieceContext.fillStyle = 'red';
        nextPieceContext.fillRect(x, y, 1, 1);
      }
    });
  });

  $nextpiece.appendChild(nextPieceCanvas);
}


////// PARA JUGAR EN CELULAR

// Agregar event listeners para los gestos táctiles y clics
document.addEventListener('touchstart', handleTouchStart, false);
document.addEventListener('touchmove', handleTouchMove, false);
document.addEventListener('dblclick', handleChangePiece, false);
document.addEventListener('touchend', handleTouchEnd, false);

// Variables para almacenar las posiciones iniciales de los gestos táctiles
let xDown = null;
let yDown = null;

// Función para manejar el inicio del gesto táctil
function handleTouchStart(evt) {
    const firstTouch = evt.touches[0];
    xDown = firstTouch.clientX;
    yDown = firstTouch.clientY;
}

// Función para manejar el movimiento del gesto táctil
function handleTouchMove(evt) {
    if (!xDown || !yDown) {
        return;
    }

    const xUp = evt.touches[0].clientX;
    const yUp = evt.touches[0].clientY;

    const xDiff = xDown - xUp;
    const yDiff = yDown - yUp;

    // Distinguir si el gesto fue horizontal o vertical
    if (Math.abs(xDiff) > Math.abs(yDiff)) {
        // Si el movimiento es horizontal, determinar si fue hacia la izquierda o derecha
        if (xDiff > 0) {
            moveLeft(); // Llamar a la función para mover la pieza hacia la izquierda
        } else {
            moveRight(); // Llamar a la función para mover la pieza hacia la derecha
        }
    }

    // Reiniciar las posiciones iniciales de los gestos táctiles
    xDown = null;
    yDown = null;
}

// Función para manejar el evento de fin del gesto táctil
function handleTouchEnd(evt) {
  // Si se levanta el dedo después de un gesto hacia abajo, mover la pieza hacia abajo
  if (yDown) {
      moveDown(); // Llamar a la función para mover la pieza hacia abajo
  }
}

// Función para manejar el evento de doble clic en la pieza
function handleChangePiece(evt) {
  // Obtener las coordenadas del clic
  const rect = canvas.getBoundingClientRect();
  const clickX = evt.clientX - rect.left;
  const clickY = evt.clientY - rect.top;

  // Verificar si el doble clic ocurrió dentro del área de juego
  if (clickX >= 0 && clickX <= canvas.width && clickY >= 0 && clickY <= canvas.height) {
      // Calcular las coordenadas relativas dentro de la pieza
      const relativeX = clickX / BLOCK_SIZE - piece.position.x;
      const relativeY = clickY / BLOCK_SIZE - piece.position.y;

      // Verificar si el doble clic ocurrió dentro de la pieza
      if (relativeX >= 0 && relativeX < piece.shape[0].length &&
          relativeY >= 0 && relativeY < piece.shape.length) {
          rotate(); // Llamar a la función para rotar la pieza
      }
  }
}