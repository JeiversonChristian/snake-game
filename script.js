const canvas = document.getElementById("gameCanvas"); // canvas principal
const ctx = canvas.getContext("2d");

const energyBar = document.getElementById("energy-bar"); // canvas da barra de energia
const scoreDisplay = document.getElementById("score-display"); // canvas da pontuação

// canvas dos botões
const playButton = document.getElementById("play-button");
const pauseButton = document.getElementById("pause-button");
const restartButton = document.getElementById("restart-button");

// Configurações do jogo
const boxSize = 20; // tamanho de um bloco para uma célula da cobra ou para a comida (20x20)
const canvasSize = canvas.width / boxSize; // Calcula a quantidade de blocos (ou células) que caberão no canvas em uma única direção (horizontal ou vertical).
// let snake = [{ x: 5, y: 5 }]; um array com um objeto { x: 5, y: 5 } que define a posição inicial da cabeça da cobra
// Math.floor(Math.random()) -> [0,1]; Math.floor(Math.random() * canvasSize) -> [0,canvasSize]
let snake = [
    {
        x: Math.floor(Math.random() * (canvasSize - 6)) + 3, // Garante distância mínima de 3 blocos
        y: Math.floor(Math.random() * (canvasSize - 6)) + 3  // Garante distância mínima de 3 blocos
    }
];
// direção inicial da cobra
let randon_direction = Math.floor(Math.random() * 4);
let direction = "RIGHT"; // Valor padrão

switch (randon_direction) {
    case 0:
        direction = "UP";
        break;
    case 1:
        direction = "DOWN";
        break;
    case 2:
        direction = "LEFT";
        break;
    case 3:
        direction = "RIGHT";
        break;
    default:
        direction = "RIGHT"; // Valor de fallback, se necessário
        break;
}
let food = generateFood();
let score = 0;
let energy = 100; // Energia inicial da cobra
let energyDecreaseRate = 1.0; // Taxa de redução da energia
let gameRunning = false; // Controla se o jogo está em execução
let gameInterval; // Referência ao intervalo do jogo

// Controle da cobra
document.addEventListener("keydown", changeDirection);

function changeDirection(event) {
    const key = event.key.toUpperCase(); // Transforma a tecla em maiúscula para garantir compatibilidade
    if (key === "W" && direction !== "DOWN") direction = "UP";
    if (key === "S" && direction !== "UP") direction = "DOWN";
    if (key === "A" && direction !== "RIGHT") direction = "LEFT";
    if (key === "D" && direction !== "LEFT") direction = "RIGHT";
}

// Gerar comida
function generateFood() {
    return {
        x: Math.floor(Math.random() * canvasSize),
        y: Math.floor(Math.random() * canvasSize)
    };
}

// Desenhar o jogo
function drawGame() {
    if (!gameRunning) return; // Pausar o jogo se ele não estiver em execução

    ctx.clearRect(0, 0, canvas.width, canvas.height); // limpa o canvas para desenhar de novo

    // Desenhar a cobra
    // cada segmento é um objeto com propriedades x e y que representam sua posição no grid.
    // forEach: É um método de arrays que executa a função fornecida para cada elemento do array. No caso, para cada segmento da cobra.
    snake.forEach(segment => {
        ctx.fillStyle = "lime"; // "lime" (verde-limão).
        // segment.x * boxSize: Converte a posição horizontal (x) do segmento, que está em unidades do grid, para pixels no canvas.
        ctx.fillRect(segment.x * boxSize, segment.y * boxSize, boxSize, boxSize);
    });

    // Desenhar a comida
    ctx.fillStyle = "red";
    ctx.fillRect(food.x * boxSize, food.y * boxSize, boxSize, boxSize);

    // Movimentar a cobra
    // { ...snake[0] }: Cria uma cópia rasa (shallow copy) do objeto snake[0].
    // Por que usar { ...snake[0] } em vez de simplesmente fazer const head = snake[0];?
    // Se você apenas fizesse: const head = snake[0];
    // Você não criaria uma cópia do objeto. Em vez disso, head seria uma referência ao mesmo objeto que snake[0]. Qualquer alteração feita em head também seria refletida em snake[0] (e vice-versa).
    //Ao usar { ...snake[0] }, você cria uma cópia independente, então mudanças feitas em head não afetam diretamente snake[0].
    const head = { ...snake[0] };
    if (direction === "UP") head.y -= 1;
    if (direction === "DOWN") head.y += 1;
    if (direction === "LEFT") head.x -= 1;
    if (direction === "RIGHT") head.x += 1;

    // O método unshift adiciona o elemento head (uma célula nova) ao início do array snake.
    snake.unshift(head);

    // Verificar se comeu a comida
    if (head.x === food.x && head.y === food.y) {
        score++;
        updateScore();
        food = generateFood();
        energy = 100; // Recarregar energia ao máximo
    } else {
        // remover a cauda se não comeu, se não a cobra fica com uma célula a mais
        snake.pop();
    }

    // Verificar colisões
    if (
        // com paredes
        head.x < 0 ||
        head.y < 0 ||
        head.x >= canvasSize ||
        head.y >= canvasSize ||
        // com corpo
        isCollision(head)
    ) {
        stopGame();
        return;
    }

    // Diminuir energia
    energy -= energyDecreaseRate;
    if (energy <= 0) {
        stopGame();
    }
    updateEnergyBar();
}

// Atualizar a barra de energia
function updateEnergyBar() {
    energyBar.style.width = `${Math.max(energy, 0)}%`;
    if (energy > 50) {
        energyBar.style.backgroundColor = "lime";
    } else if (energy > 20) {
        energyBar.style.backgroundColor = "orange";
    } else {
        energyBar.style.backgroundColor = "red";
    }
}

// Atualizar o score
function updateScore() {
    scoreDisplay.textContent = `Score: ${score}`;
}

// Verificar colisão com o corpo
function isCollision(head) {
    // O método some verifica se ao menos um elemento do array snake satisfaz a condição especificada
    return snake.some(
        (segment, index) => index !== 0 && segment.x === head.x && segment.y === head.y
    );
}

// Controlar o jogo
function startGame() {
    if (!gameRunning) {
        gameRunning = true;
        // 100: intervalo de tempo em milissegundos entre cada execução da função drawGame
        // 100 milissegundos (ou 0,1 segundos).
        // drawGame será chamada 10 vezes por segundo.
        gameInterval = setInterval(drawGame, 100);
    }
}

function stopGame() {
    gameRunning = false;
    // clearInterval(gameInterval) instrui o navegador a parar de executar a função drawGame repetidamente.
    clearInterval(gameInterval);
}

function restartGame() {
    stopGame();
    // Resetar variáveis
    snake = [
        {
            x: Math.floor(Math.random() * (canvasSize - 6)) + 3, // Garante distância mínima de 3 blocos
            y: Math.floor(Math.random() * (canvasSize - 6)) + 3  // Garante distância mínima de 3 blocos
        }
    ];
    randon_direction = Math.floor(Math.random() * 4);
    direction = "RIGHT"; // Valor padrão
    
    switch (randon_direction) {
        case 0:
            direction = "UP";
            break;
        case 1:
            direction = "DOWN";
            break;
        case 2:
            direction = "LEFT";
            break;
        case 3:
            direction = "RIGHT";
            break;
        default:
            direction = "RIGHT"; // Valor de fallback, se necessário
            break;
    }
    food = generateFood();
    score = 0;
    energy = 100;
    updateScore();
    updateEnergyBar();
    startGame();
}

// Eventos dos botões
playButton.addEventListener("click", startGame);
pauseButton.addEventListener("click", stopGame);
restartButton.addEventListener("click", restartGame);
