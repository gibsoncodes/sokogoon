import React, {useState, useEffect} from 'react'
import { move, findGridIndex, reverseFindGridIndex, checkWin } from './puzzlefn';


import characterIcon from "../assets/character.svg"



const Puzzle = ({levelData, format, changeBlock, fromEditor, setCurrLevel}) => {


  const [level, setLevel] = useState(levelData);
  const [wonPuzzle, setWonPuzzle] = useState(false)
  const [goalState, setGoalState] = useState([]);
  const [puzzleData, setPuzzleData] = useState([]);
  const [playerPos, setPlayerPos] = useState([0,0]);
  const [redoStack, setRedoStack] = useState([{playerPos: [0,0], gridData: []}])

  const CSS_TYPES = {
    0: "blank",
    1: "box",
    2: "wall",
    3: "portal",
    4: "boxInPortal",
    5: "goal",
    6: "boxInGoal",
  }

  useEffect(() => {
    setLevel(levelData)
  }, [levelData])

  useEffect(() => {
    console.log("hi")
    let puzzleGrid = [...level];
    let startPlayerPos = false;
    let goals = [];
    puzzleGrid.forEach((item, ind) => {
        if (item === 9) {
            puzzleGrid[ind] = 0
            startPlayerPos = reverseFindGridIndex(ind)
        }
        if (item === 5) {
            goals.push(ind);
        }
    })
    setPlayerPos(startPlayerPos)
    setGoalState([...goals])
    setRedoStack([{playerPos: startPlayerPos, gridData: [...puzzleGrid]}])
    setPuzzleData([...puzzleGrid])
  }, [level])


  useEffect(() => {
    if (format !== "play") return;
    if(wonPuzzle) return;
    const handleKeyDown = (event) => {
      const LEFT_ARROW = 37;
      const UP_ARROW = 38;
      const RIGHT_ARROW = 39;
      const DOWN_ARROW = 40;
      const W_KEY = 87;
      const A_KEY = 65;
      const S_KEY = 83;
      const D_KEY = 68;
      const UNDO = 90;
      const RESET = 82;

      let dontChange = false;
      let newState;
      switch (event.keyCode) {
        case LEFT_ARROW:
        case A_KEY:
          newState = move(playerPos, "left", puzzleData)
          break;
        case UP_ARROW:
        case W_KEY:
          newState = move(playerPos, "up", puzzleData)
          break;
        case RIGHT_ARROW:
        case D_KEY:
          newState = move(playerPos, "right", puzzleData) 
          break;
        case DOWN_ARROW:
        case S_KEY:
          newState = move(playerPos, "down", puzzleData)
          break;
        case UNDO:
          dontChange = true;
          if (redoStack.length > 1) {
            setRedoStack(prev => {
                const copy = [...prev];
                copy.pop();
                setPlayerPos(prev => [...copy[copy.length - 1].playerPos]);
                setPuzzleData(prev => [...copy[copy.length - 1].gridData]);
                return copy;
            })
          }
          break;
        case RESET:
          dontChange = true;
          setRedoStack(prev => {
            setPlayerPos(pre => [...prev[0].playerPos]);
            setPuzzleData(pre => [...prev[0].gridData])
            return [{...prev[0]}]
          })
          break;
        default:
          dontChange = true;
          break;
      }
      if (!dontChange) {
          setPlayerPos(prev => {
            return [...newState.player]
          })
          setPuzzleData(prev => {
            return [...newState.grid]
          })
          if (newState.player !== playerPos) {
            setRedoStack(prev => {
                const copy = [...prev];
                copy.push({playerPos: [...newState.player], gridData: [...newState.grid]});
                return copy;
            })
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [format, playerPos, puzzleData, redoStack.length, wonPuzzle]); 

  useEffect(() => {
    if (format !== "play") return;
     if (checkWin(puzzleData, goalState)) {
        setWonPuzzle(true);
    }
  }, [format, goalState, puzzleData])

  return (
    <React.Fragment>
        {wonPuzzle && <h1>WON PUZZLE</h1>}
        <div className='flex-row'>
            {[1,2,3, 4].map(num => {
                return <button onClick={() => setCurrLevel(num - 1)} key={`num${num}`} className='level-select'>{num}</button>
            })
            }
        </div>
        <div className='puzzle-container'>
            {puzzleData.map((val, ind) => {
                if (playerPos && ind === findGridIndex(playerPos)) {
                    return <div onClick={format === "play" ? null : () => changeBlock(ind)} key={`grid${ind}`} className='puzzle-grid'><div className={CSS_TYPES[val]}><img src={characterIcon} alt='character' className='character'></img></div></div>
                } else if (CSS_TYPES[val] === "boxInPortal") {
                    return <div onClick={format === "play" ? null : () => changeBlock(ind)} key={`grid${ind}`} className='puzzle-grid'><div className="portal"><div className='boxInPortal'></div></div></div>
                } else {
                    return <div onClick={format === "play" ? null : () => changeBlock(ind)} key={`grid${ind}`} className='puzzle-grid'><div className={CSS_TYPES[val]}></div></div>
                }
            })}
        </div>
        {!fromEditor &&
            <div className='info'>
                <h2 className='goal-txt'>Goal:</h2>
                <div className='flex-row'>
                    <p>Move all the boxes</p>
                    <div className='puzzle-grid'><div className="box"></div></div>
                </div>
                <div className='flex-row'>
                    <p>To the goals</p>
                    <div className='puzzle-grid'><div className="goal"></div></div>
                </div>
            </div>
        }
    </React.Fragment>
  )
}

export default Puzzle