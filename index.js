const boardSizeInput = document.getElementById("boardSizeInput");
const startButton = document.getElementById("startButton")
const board = document.getElementById("board");
const flagTile = document.getElementById("flagTile");
const showTile = document.getElementById("showTile");

let boardSize = 0;
let cellSize = 40;
let cellBorderSize = 0;
let margin = 5;

let mineNum = 10;
let remainingMine = mineNum;
let userRemainingMine = 99;
let boardMap = [];
let flagMap = [];
let mode = 0;
let offset = [[1, 1], [1, 0], [1, -1], [0, 1], [0, -1], [-1, 1], [-1, 0], [-1, -1]];
let newOffset = [[0, 0], [0, 1], [1, 0], [0, -1], [-1, 0]];
let Roffset = [[0, 0], [1, 1], [1, 0], [1, -1], [0, 1], [0, -1], [-1, 1], [-1, 0], [-1, -1]];

console.log(document.getElementById("popup"));
document.getElementById("popup").classList.add("hidden");

//size input, basic initialize
startButton.addEventListener("click", event => {
    event.preventDefault();
    if (index === menuLength - 1) {
        boardSize = boardSizeInput.value;
        mineNum = Math.floor(boardSize * 0.15);
    }
    else {
        switch (index) {
            case 0:
                boardSize = 9;
                mineNum = 10;
                break;
            case 1:
                boardSize = 16;
                mineNum = 40;
                cellSize = 30;
                break;
            case 2:
                boardSize = 30;
                mineNum = 99;
                cellSize = 20;
                break;
        }
        if (window.innerWidth < 600) cellSize -= 10;
    }

    document.documentElement.style.setProperty('--dynamicSize', `${cellSize}px`);
    document.documentElement.style.setProperty('--dynamicBorderSize', `${cellBorderSize}px`);
    document.documentElement.style.setProperty('--dynamicMargin', `${margin}px`);

    console.log(`board size: ${boardSize}`);
    if (boardSize <= 0 || boardSize % 1 != 0) {
        console.error(`invalid boardSize: ${boardSize}`);
    }
    else {
        initializeBoard();
    }
});



//make board elements and map, add event listeners
function initializeBoard() {
    document.getElementById("popup").classList.remove("visible");
    document.getElementById("main").classList.remove("hidden");
    document.getElementById("popup").classList.add("hidden");
    document.getElementById("main").classList.add("visible");
    boardMap = [];
    flagMap = [];
    remainingMine = mineNum;
    userRemainingMine = mineNum;
    board.innerText = '';

    board.style.width = `${(boardSize * (cellSize + (cellBorderSize + margin) * 2))}px`
    for (let i = 0; i < boardSize; i++) {
        let row = [];
        let rrow = [];
        for (let j = 0; j < boardSize; j++) {
            const newcell = document.createElement(`div`);
            newcell.className = "cell";
            newcell.id = `${i}x${j}`;
            newcell.addEventListener('click', function () {
                //console.log(`clicked on cell: ${newcell.id}`)
                if (mode === 0) reveal(i, j);
                else flag(i, j);
            });
            newcell.classList.add("hiddenCell");
            newcell.innerHTML += `
            <div class="corner top-right" id="${i}x${j}xTR"></div>
            <div class="corner bottom-right" id="${i}x${j}xBR"></div>
            <div class="corner bottom-left" id="${i}x${j}xBL"></div>
            <div class="corner top-left" id="${i}x${j}xTL"></div>
            `

            board.appendChild(newcell);

            row.push(0);
            rrow.push(0);
        }
        boardMap.push(row);
        flagMap.push(rrow);
    }
    showTile.style.backgroundColor = "hsl(200, 100%, 60%)";
    initializeAni();
    initializeMine();
}

function initializeAni() {
    menu.style.display = 'none';
    board.style.maxHeight = `80vh`;
    board.style.opacity = '1';
    document.getElementById('mode').style.opacity = '1';
}

//set value in html elements
function cellSetValue(i, j, value) {
    if (value === -1) {
        let cell = document.getElementById(`${i}x${j}`);
        const textNode = document.createTextNode('-1');
        cell.appendChild(textNode);
    }
    else {
        let cell = document.getElementById(`${i}x${j}`);
        const textNode = document.createTextNode(`${value}`);
        cell.appendChild(textNode);
    }
}

//make mines and initialize map
function initializeMine() {
    for (let i = 0; i < mineNum; i++) {
        while (true) {
            let a = Math.floor(Math.random() * boardSize);
            let b = Math.floor(Math.random() * boardSize);
            if (boardMap[a][b] != -1) {
                boardMap[a][b] = -1;
                cellSetValue(a, b, -1);
                break;
            }
        }
    }
    for (let i = 0; i < boardSize; i++) {
        for (let j = 0; j < boardSize; j++) {
            refresh(i, j);
            let mineCount = 0;
            if (boardMap[i][j] != -1) {
                adjValid(i, j).forEach(function (value) {
                    if (boardMap[value[0]][value[1]] == -1) mineCount++;
                });
                boardMap[i][j] = mineCount;
                cellSetValue(i, j, mineCount);
                //console.log(`cell ${i}x${j}: minecount = ${mineCount}`);
            }
        }
    }
    console.log("initialize complete!");
    startStopwatch();
    refreshMine();
}
//return valid adjoint blocks as array
function adjValid(i, j) {
    validList = [];
    offset.forEach(function (value) {
        let newi = i + value[0];
        let newj = j + value[1];
        if (valid(newi, newj)) {
            validList.push([newi, newj]);
        }
    });
    return validList;
}
function valid(i, j) {
    if (0 <= i && i < boardSize && 0 <= j && j < boardSize) {
        return true;
    }
    else return false;
}

//refresh user remaining mine display and cover display
function refreshMine() {
    const remainMineDisplay = document.getElementById("remainMineDisplay");
    remainMineDisplay.innerText = `Remaining Mine: ${userRemainingMine}`;
}
//refresh called and adjecent blocks, call refresh()
function refreshState(i, j) {
    Roffset.forEach(function (value) {
        let newi = i + value[0];
        let newj = j + value[1];
        if (valid(newi, newj)) {
            refresh(newi, newj);
        }
    });
}
//refresh single called block
function refresh(i, j) {
    let cell = document.getElementById(`${i}x${j}`);
    cell.style.padding = `${margin}px ${margin}px ${margin}px ${margin}px`;
    cell.style.margin = `0 0 0 0`;
    cell.style.borderRadius = `${margin}px ${margin}px ${margin}px ${margin}px`;
    let TL = document.getElementById(`${i}x${j}xTL`);
    let TR = document.getElementById(`${i}x${j}xTR`);
    let BL = document.getElementById(`${i}x${j}xBL`);
    let BR = document.getElementById(`${i}x${j}xBR`);
    TL.style.display = "none";
    TR.style.display = "none";
    BL.style.display = "none";
    BR.style.display = "none";

    if (cell.classList.contains("shownCell") || cell.classList.contains("flaggedCell")) {
        cell.style.margin = `${margin}px ${margin}px ${margin}px ${margin}px`;
        cell.style.padding = `0 0 0 0`;
    }
    //handles margin & padding control
    newOffset.forEach(function (value) {
        let newi = i + value[0];
        let newj = j + value[1];
        if (valid(newi, newj) && !document.getElementById(`${newi}x${newj}`).classList.contains("hiddenCell")) {
            switch (value.join(',')) {
                case '1,0':
                    cell.style.marginBottom = `${margin}px`;
                    cell.style.paddingBottom = `0`;
                    break;
                case '0,1':
                    cell.style.marginRight = `${margin}px`;
                    cell.style.paddingRight = `0`;
                    break;
                case '-1,0':
                    cell.style.marginTop = `${margin}px`;
                    cell.style.paddingTop = `0`;
                    break;
                case '0,-1':
                    cell.style.marginLeft = `${margin}px`;
                    cell.style.paddingLeft = `0`;
                    break;
            }
        }
    });
    //handles smooth border
    if (cell.classList.contains("hiddenCell")) {
        if ((valid(i - 1, j) && document.getElementById(`${i - 1}x${j}`).classList.contains("hiddenCell"))
            || (valid(i, j + 1) && document.getElementById(`${i}x${j + 1}`).classList.contains("hiddenCell"))) {
            cell.style.borderTopRightRadius = "0";
        }
        if ((valid(i - 1, j) && document.getElementById(`${i - 1}x${j}`).classList.contains("hiddenCell"))
            || (valid(i, j - 1) && document.getElementById(`${i}x${j - 1}`).classList.contains("hiddenCell"))) {
            cell.style.borderTopLeftRadius = "0";
        }
        if ((valid(i + 1, j) && document.getElementById(`${i + 1}x${j}`).classList.contains("hiddenCell"))
            || (valid(i, j + 1) && document.getElementById(`${i}x${j + 1}`).classList.contains("hiddenCell"))) {
            cell.style.borderBottomRightRadius = "0";
        }
        if ((valid(i + 1, j) && document.getElementById(`${i + 1}x${j}`).classList.contains("hiddenCell"))
            || (valid(i, j - 1) && document.getElementById(`${i}x${j - 1}`).classList.contains("hiddenCell"))) {
            cell.style.borderBottomLeftRadius = "0";
        }
    }

    if (cell.classList.contains("hiddenCell")) {
        if ((valid(i - 1, j - 1) && !document.getElementById(`${i - 1}x${j - 1}`).classList.contains("hiddenCell"))
            && (valid(i - 1, j) && document.getElementById(`${i - 1}x${j}`).classList.contains("hiddenCell"))
            && (valid(i, j - 1) && document.getElementById(`${i}x${j - 1}`).classList.contains("hiddenCell"))) {
            TL.style.display = "block";
        }
        if ((valid(i + 1, j + 1) && !document.getElementById(`${i + 1}x${j + 1}`).classList.contains("hiddenCell"))
            && (valid(i + 1, j) && document.getElementById(`${i + 1}x${j}`).classList.contains("hiddenCell"))
            && (valid(i, j + 1) && document.getElementById(`${i}x${j + 1}`).classList.contains("hiddenCell"))) {
            BR.style.display = "block";
        }
        if ((valid(i + 1, j - 1) && !document.getElementById(`${i + 1}x${j - 1}`).classList.contains("hiddenCell"))
            && (valid(i + 1, j) && document.getElementById(`${i + 1}x${j}`).classList.contains("hiddenCell"))
            && (valid(i, j - 1) && document.getElementById(`${i}x${j - 1}`).classList.contains("hiddenCell"))) {
            BL.style.display = "block";
        }
        if ((valid(i - 1, j + 1) && !document.getElementById(`${i - 1}x${j + 1}`).classList.contains("hiddenCell"))
            && (valid(i - 1, j) && document.getElementById(`${i - 1}x${j}`).classList.contains("hiddenCell"))
            && (valid(i, j + 1) && document.getElementById(`${i}x${j + 1}`).classList.contains("hiddenCell"))) {
            TR.style.display = "block";
        }

    }

}

//reveals single block
function reveal(i, j) {
    let cell = document.getElementById(`${i}x${j}`);
    //search mode
    if (cell.classList.contains("shownCell")) return;
    if (boardMap[i][j] === -1) {
        console.log("game over");
        gameOver();
    }
    else {
        cell.classList.remove("hiddenCell");
        cell.classList.add("shownCell");
        if (boardMap[i][j] === 0) {
            adjValid(i, j).forEach(function (value) {
                reveal(value[0], value[1]);
            });
        }
    }
    refreshMine();
    refreshState(i, j);
}
//flags single block
function flag(i, j) {
    let cell = document.getElementById(`${i}x${j}`);
    //not flagged yet
    if (flagMap[i][j] === 0) {
        if (cell.classList.contains("hiddenCell")) {
            if (userRemainingMine > 0) {
                cell.classList.remove("hiddenCell");
                cell.classList.add("flaggedCell");
                flagMap[i][j] = 1;
                cell.childNodes.forEach((node) => {
                    if (node.nodeType === 3) {
                        node.textContent = node.textContent.replace(`${boardMap[i][j]}`, 'F');
                    }
                });
                cell.style.color = "white";
                if (boardMap[i][j] === -1) {
                    remainingMine--;
                }
                userRemainingMine--;
            }
        }
        //special gimmick
        else {
            if ((() => {
                let flagCounter = 0;
                adjValid(i, j).forEach(function (value) {
                    if (flagMap[value[0]][value[1]] === 1) flagCounter++;
                });
                if (flagCounter === boardMap[i][j]) return true;
            })()) {
                adjValid(i, j).forEach(function (value) {
                    let newi = value[0];
                    let newj = value[1];
                    if (flagMap[newi][newj] === 0 && document.getElementById(`${newi}x${newj}`)) reveal(newi, newj);
                });
            }
        }
    }
    //already flagged, undo
    else {
        flagMap[i][j] = 0;
        cell.classList.remove("flaggedCell");
        cell.style.color = "hsl(200,100%,60%)";
        cell.classList.add("hiddenCell");
        setTimeout(() => {
            cell.childNodes.forEach((node) => {
                if (node.nodeType === 3) {
                    node.textContent = node.textContent.replace('F', `${boardMap[i][j]}`);
                }
            });
        }, 500);
        if (boardMap[i][j] === -1) {
            remainingMine++;
        }
        userRemainingMine++;
    }
    checkEnd();
    refreshMine();
    refreshState(i, j);
}

//check if the game is clear, and reinitialize
function checkEnd() {
    if (remainingMine == 0) {
        console.log("game clear");
        const elapsedTimeFinal = stopwatch.innerText;
        document.getElementById("popupText").innerHTML = `GAME CLEAR!<br>TIME: ${elapsedTimeFinal}`;
        document.getElementById("popup").classList.remove("hidden");
        document.getElementById("main").classList.remove("visible");
        document.getElementById("popup").classList.add("visible");
        document.getElementById("main").classList.add("hidden");
    }
}
function gameOver() {
    document.getElementById("popupText").innerText = "GAME OVER!";
    document.getElementById("popup").classList.remove("hidden");
    document.getElementById("main").classList.remove("visible");
    document.getElementById("popup").classList.add("visible");
    document.getElementById("main").classList.add("hidden");
}



//event listeners for mode change
flagTile.addEventListener('click', function () {
    mode = 1;
    flagTile.style.backgroundColor = "hsl(200, 100%, 60%)";
    showTile.style.backgroundColor = "transparent";
    //console.log("flagTile mode enabled");
});
showTile.addEventListener('click', function () {
    mode = 0;
    showTile.style.backgroundColor = "hsl(200, 100%, 60%)";
    flagTile.style.backgroundColor = "transparent";
    //console.log("showTile mode enabled");
});


//stopwatch
let isRunning = false;
let timer = null;
let startTime = 0;
let elapsedTime = 0;
const stopwatch = document.getElementById("stopwatch");

function startStopwatch() {
    if (!isRunning) {
        startTime = Date.now() - elapsedTime;
        timer = setInterval(update, 100);
        isRunning = true;
    }
}

function update() {
    const currentTime = Date.now();
    elapsedTime = currentTime - startTime;
    let minutes = Math.floor((elapsedTime / (1000 * 60)) % 60).toString().padStart(2, 0);
    let seconds = Math.floor((elapsedTime / 1000) % 60).toString().padStart(2, 0);

    stopwatch.innerText = `${minutes}:${seconds}`;
}

//menu manipulation
let index = 0;
const menuLength = document.querySelectorAll(".selectionItem").length;
selectionMoveRight();
function selectionMoveLeft() {
    document.getElementById("starter").classList.remove("adding");
    document.getElementById("starter").classList.add("removing");
    setTimeout(() => {
        boardSizeInput.style.display = "none";
    }, 500);
    document.getElementById("left").style.opacity = "1";
    document.getElementById("right").style.opacity = "1";
    index--;
    document.querySelectorAll(".selectionItem").forEach(item => {
        item.style.transform = `translateX(-${index * 120}px)`;
    });
    if (index == 0) {
        document.getElementById("left").style.opacity = "0";
    }
}
function selectionMoveRight() {
    boardSizeInput.style.display = "none";
    document.getElementById("left").style.opacity = "1";
    document.getElementById("right").style.opacity = "1";
    index++;
    document.querySelectorAll(".selectionItem").forEach(item => {
        item.style.transform = `translateX(-${index * 120}px)`;
    });
    if (index == menuLength - 1) {
        document.getElementById("right").style.opacity = "0";
        boardSizeInput.style.display = "block";
        document.getElementById("starter").classList.remove("removing");
        document.getElementById("starter").classList.add("adding");
    }
}