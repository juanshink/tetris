import { BLOCK_SIZE, BOARD_WIDTH, BOARD_HEIGHT } from './const'
import { EVENT_MOV } from './const'
import './style.css'

// importo el audio de mp3



// 1) Inicializar el canvas

const canvas = document.querySelector('canvas')
const context = canvas.getContext('2d')

const $score = document.querySelector('span')
let score = 0

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
  shape: [
    [1, 1],
    [1, 1]
  ]
}

const PIECES = [
  [
    [1, 1],
    [1, 1]
  ],
  [
    [1, 0],
    [1, 0],
    [1, 1]
  ],
  [
    [1, 1, 1, 1]
  ],
  [
    [0, 1],
    [0, 1],
    [1, 1]
  ],
  [
    [1, 0],
    [1, 0],
    [1, 1]
  ],
  [
    [1, 0],
    [1, 1],
    [1, 0]
  ],
  [
    [0, 1],
    [1, 1],
    [0, 1]
  ],
  [
    [1, 1, 0],
    [0, 1, 1]
  ],
  [
    [0, 1, 1],
    [1, 1, 0]
  ]
]


// 2) Game loop

let dropCounter = 0
let lastTime = 0

function update(time = 0){
  const deltaTime = time - lastTime
  lastTime = time

  dropCounter += deltaTime
  console.log(dropCounter)

  if(dropCounter > 1000){
    piece.position.y++
    dropCounter = 0
    if (checkCollision()){
      piece.position.y--
      solidifyPiece()
      removeRow()
    }
  }

  draw()
  window.requestAnimationFrame(update)
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
    if(value === 1){
      context.fillStyle = 'red'
      context.fillRect(x + piece.position.x, y + piece.position.y, 1, 1)
    }
    })
  })

  $score.innerText = score
}

// 5) Mover la pieza

document.addEventListener('keydown', event => {

  if (event.key === EVENT_MOV.LEFT){
    piece.position.x--
    if(checkCollision()){
      piece.position.x++
    }
  } 
    
  if (event.key === EVENT_MOV.RIGTH){
    piece.position.x++
    if(checkCollision()){
      piece.position.x--
    }
  }

  if (event.key === EVENT_MOV.DOWN) {
    piece.position.y++
    if(checkCollision()){
      piece.position.y--
      solidifyPiece()
      removeRow()
    }
  }

  // Rotar las piezas
  if (event.key === EVENT_MOV.UP) {
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

})

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
  piece.shape.find((row, y) =>{
    row.find((value, x) =>{
      if (value === 1){
        board[y + piece.position.y][x + piece.position.x] = 1
      }
    })
  })

  piece.position.x = Math.floor(BOARD_WIDTH / 2)
  piece.position.y = 0

  // Selecciono una pieza al azar
  piece.shape = PIECES[Math.floor(Math.random() * PIECES.length)]

  // Game Over
  if(checkCollision()){
    window.alert('GAME OVER')
    board.forEach((row) => row.fill(0))
  }
}

// 8) Remover linea

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
  })
}

const $start = document.querySelector('.startButton')
const section = document.querySelector('section')

$start.addEventListener('click', () =>{
  update()

  section.remove()

  const audio = new Audio('./tetrissong.mp3')
  audio.volume = 0.5
  audio.play()

})
