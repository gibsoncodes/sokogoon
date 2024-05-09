

const GRID_WIDTH = 10
const GRID_HEIGHT = 10

const GRID_TYPES = {
    0: "blank",
    1: "box",
    2: "wall",
    3: "portal",
    4: "boxInPortal",
    5: "goal",
    6: "boxInGoal",
    
}

const GRID_TYPES_REVERSE = {
    "blank": 0,
    "box": 1,
    "wall": 2,
    "portal": 3,
    "boxInPortal": 4,
    "goal": 5,
    "boxInGoal": 6,
}

const DIRS = {
    "up": [0,-1],
    "down": [0,1],
    "left": [-1, 0],
    "right": [1, 0],
}

const arrOperator = (curr, move) => {
    let temp = [...curr];
    temp[0] += move[0];
    temp[1] += move[1];
    return temp;
}

const handleBoxAdjustment = (boxes, dir, grid) => {
    boxes.forEach(box => {
        let target = grid[findGridIndex(box)];
        if (target === GRID_TYPES_REVERSE["boxInPortal"]) {
            grid[findGridIndex(box)] = GRID_TYPES_REVERSE["portal"]
        } else if (target === GRID_TYPES_REVERSE["boxInGoal"]) {
            grid[findGridIndex(box)] = GRID_TYPES_REVERSE["goal"]
        } else {
            grid[findGridIndex(box)] = GRID_TYPES_REVERSE["blank"]
        }
    })

    boxes.forEach(box => {
        let target = grid[findGridIndex(arrOperator(box, DIRS[dir]))];
        if (target === GRID_TYPES_REVERSE["portal"]) {
            grid[findGridIndex(arrOperator(box, DIRS[dir]))] = GRID_TYPES_REVERSE["boxInPortal"]
        } else if (target === GRID_TYPES_REVERSE["goal"]) {
            grid[findGridIndex(arrOperator(box, DIRS[dir]))] = GRID_TYPES_REVERSE["boxInGoal"]
        } else {
            grid[findGridIndex(arrOperator(box, DIRS[dir]))] = GRID_TYPES_REVERSE["box"]
        }
    })

    return grid;
}

const handlePortal = (portalPos, boxes, dir, grid, boxInPortal) => {
    let movePlayer = false;
    if (!boxInPortal) {
        grid = handleBoxAdjustment(boxes, dir, grid)
        movePlayer = true;
    } else {
        let holderPos = portalPos;
        let boxIndices = [...boxes, portalPos];
        for (let i = 0; i < GRID_HEIGHT; i++) {
            holderPos = arrOperator(holderPos, DIRS[dir]);
            let runningAttempt = checkValidMove(holderPos, dir, grid)
            if (runningAttempt === "box" || runningAttempt === "boxInPortal") {
                boxIndices.push(holderPos)
            } else if (runningAttempt === "portal") {
                grid = handleBoxAdjustment(boxIndices, dir, grid)
                break;
            } else if (runningAttempt === true) {
                grid = handleBoxAdjustment(boxIndices, dir, grid);
                break;
            } else {
                break;
            }
        }
    }
    return {player: movePlayer, grid: grid, moreMoves: portalPos}
}

const move = (curr, dir, grid) => {

    const queue = [curr];
    let playerMove = false;
    let currPlayerPos = curr;
    let count = 0;
    while (queue.length > 0) {
        count++;
        curr = queue[0];
        let newMove = arrOperator(curr, DIRS[dir]);
        let attempt = checkValidMove(newMove, dir, grid);
        if (attempt === true) {
            playerMove = true;
            if (count > 1) {
                grid = handleBoxAdjustment([curr], dir, grid)
            }
            break;
        } else if (attempt === "box") {
            let holderPos = newMove;
            let boxIndices;
            if (count > 1) {
                boxIndices = [curr, holderPos];
            } else {
                boxIndices = [holderPos]
            }
            for (let i = 0; i < GRID_HEIGHT; i++) {
                holderPos = arrOperator(holderPos, DIRS[dir]);
                let runningAttempt = checkValidMove(holderPos, dir, grid)
                if (runningAttempt === "box") {
                    boxIndices.push(holderPos)
                } else if (runningAttempt === "portal" || runningAttempt === "boxInPortal") {
                    let data = handlePortal(holderPos, boxIndices, dir, grid, runningAttempt==="boxInPortal");
                    if (data.player) playerMove = true
                    grid = data.grid
                    if (data.moreMoves) {
                        queue.push(data.moreMoves)
                    }
                    queue.shift();
                    break;
                } else if (runningAttempt === true) {
                    grid = handleBoxAdjustment(boxIndices, dir, grid);
                    playerMove = true;
                    queue.shift();
                    break;
                } else {
                    queue.shift();
                    break;
                }
            }
        } else {
            if (count > 1) {
                if (attempt === "portal" || attempt === "boxInPortal") {
                    let data = handlePortal(newMove, [curr], dir, grid, attempt==="boxInPortal");
                    grid = data.grid
                    if (data.moreMoves) {
                        queue.push(data.moreMoves)
                    }
                    queue.shift();
                } else {
                    queue.shift();
                }
            } else {
                break;
            }
        }
    }

    if (playerMove) {
        currPlayerPos = arrOperator(currPlayerPos, DIRS[dir])
    }
    
    return {player: currPlayerPos, grid: grid};
}

const outOfBounds = (pos) => {
    if (pos[0] < 0 || pos[0] > GRID_WIDTH - 1) return true
    if (pos[1] < 0 || pos[1] > GRID_HEIGHT - 1) return true
    return false;
}

const findGridIndex = (pos) => {
    let ind = 0;
    ind += pos[1] * GRID_WIDTH;
    ind += pos[0];
    return ind;
}

const reverseFindGridIndex = (ind) => {
    let x = ind % GRID_WIDTH;
    let y = (ind - x) / GRID_WIDTH;
    return [x, y]
}

const checkValidMove = (newPos, dir, grid) => {
    if (outOfBounds(newPos)) return false
    let foundIndex = findGridIndex(newPos);
    let gridType = GRID_TYPES[grid[foundIndex]];
    if (gridType === "blank" || gridType === "goal") return true;
    if (gridType === "box" || gridType === "boxInGoal") {
        return "box"
    } else if (gridType === "portal") {
        return "portal"
    } else if (gridType === "boxInPortal") {
        return "boxInPortal";
    } else {
        return false;
    }
}

const checkWin = (puzzleData, goals) => {
    if (goals.length === 0) return false;
    let won = true;
    for (let i = 0; i < goals.length; i++) {
        if (puzzleData[goals[i]] !== 6) {
            won = false;
            break;
        }
    }
    return won;
}


export { move, findGridIndex, reverseFindGridIndex, checkWin }