import React, {useState, useEffect} from 'react'
import Puzzle from './Puzzle'
import characterSvg from "../assets/character.svg"

const BLANK_GRID = Array(100).fill(0);

const PuzzleEditor = ({levelData}) => {

    const [format, setFormat] = useState("edit");
    const [workingLevel, setWorkingLevel] = useState([...levelData]);
    const [currProps, setCurrProp] = useState("blank");
    const [error, setError] = useState("")

    const levelProps = ["blank", "box", "portal", "wall", "boxInPortal", "boxInGoal", "goal", "player"];
    const levelPropComponents = {
        "blank": <div className='blank'></div>,
        "box": <div className='box'></div>,
        "portal": <div className='portal'></div>,
        "wall": <div className='wall'></div>,
        "goal": <div className='goal'></div>,
        "boxInPortal": <div className='portal'><div className='boxInPortal'></div></div>,
        "boxInGoal": <div className='boxInGoal'></div>,
        "player": <div className='blank'><img className="character" alt="character" src={characterSvg}></img></div>
    }
    

    const propToID = {
        "blank": 0,
        "box": 1,
        "wall": 2,
        "portal": 3,
        "boxInPortal": 4,
        "goal": 5,
        "boxInGoal": 6,
        "player": 9
    }


    const changeBlock = (index) => {
        setWorkingLevel(prev => {
            const copy = [...prev]
            copy[index] = propToID[currProps];
            return [...copy];
        })
    }

    const handleErase = () => {
        setWorkingLevel(BLANK_GRID);
    }

    const checkValidLevel = () => {
        let boxCount = 0;
        let goalCount = 0;
        let playerCount = 0;
        for (let i = 0; i < workingLevel.length; i++) {
            if (workingLevel[i] === 1 || workingLevel[i] === 4) boxCount++;
            if (workingLevel[i] === 5) goalCount++;
            if (workingLevel[i] === 6) {
                goalCount++;
                boxCount++;
            }
            if (workingLevel[i] === 9) playerCount++;
        }
        if (playerCount !== 1) return {valid: false, errorMsg: "Levels Must Have One Player"}
        if (boxCount < goalCount) return {valid: false, errorMsg: "There Must Be Enough Boxes For All Goals"}
        if (goalCount === 0) return {valid: false, errorMsg: "There Must Be At Least One Goal"}
        return {valid: true}
    }

    const handleFormat = () => {
        if (format === "play") {
            setFormat("edit")
        } else {
            let result = checkValidLevel();
            if (!result.valid) {
                setError(result.errorMsg)
            } else {
                setFormat("play")
                setError("")
            }
        }
    }


  return (
    <div className='level-editor-container'>
        <div className='props-container flex-row'>
            {levelProps.map(prop => {
                return <div id={currProps === prop ? "toggled-prop" : "fooID"} className='prop-exterior' key={`propbar${prop}`} onClick={() => setCurrProp(prop)} >{levelPropComponents[prop]}</div>
            })}
        </div>
        <div className='editor-tools'>
            <button onClick={() => console.log(workingLevel)}> print</button>

            <button onClick={handleErase} className='wipe-level'>Erase All</button>
            <button onClick={handleFormat} className='play-btn'>{format === "play" ? "Edit" : "Play"} Level</button>
        </div>
        {error && <p className='error-msg'>{error}</p>}
        <Puzzle levelData={workingLevel} format={format} changeBlock={changeBlock} fromEditor={true}/>
    </div>
  )
}

export default PuzzleEditor