import {memo, useEffect, useState} from 'react'
import input from "./input"

const initialMatrix = input.split("\n").map(line => line.split("").map(Number));

const getCellSafe = (x: number, y: number) =>
    (x >= 0 && y >= 0 && initialMatrix[y]?.[x]) ? initialMatrix[y][x] : 9;


const traverseBasin = ({x, y}: {x: number, y: number}, points: {x: number, y: number}[]) => {
    points.push({x, y})

    const top = {x , y: y - 1}
    const bottom = {x , y: y + 1}
    const left = {x: x + 1 , y}
    const right = {x: x - 1 , y}

    for (const {x, y} of [top, left, right, bottom]) {
        if (getCellSafe(x, y) != 9 && !points.find(point => point.x === x && point.y === y)){
            traverseBasin({x, y}, points);
        }
    }
};

const findCriticalPoints = () => {
    let criticalPoints: { x: number; y: number; }[] = [];

    initialMatrix.forEach((row, i) => row.map((cell, j) => {
        let y = i;
        let x = j;

        let cellValue = getCellSafe(x, y);

        let top_cell = getCellSafe(x, y - 1);
        let bottom_cell = getCellSafe(x, y + 1);
        let left_cell = getCellSafe(x + 1, y);
        let right_cell = getCellSafe(x - 1, y);

        let isDepression = cellValue < top_cell && cellValue < bottom_cell && cellValue < left_cell && cellValue < right_cell;

        if (isDepression) {
            criticalPoints.push({x, y});
        }
    }))

    return criticalPoints;
}

let points: { x: number; y: number; }[] = []
for (const criticalPoint of findCriticalPoints()) {
    traverseBasin(criticalPoint, points)
}


const containerStyles =  {height: "100vh", width: "100wh", display: "flex", placeContent: "center", backgroundColor: "black"} as const;
const gridStyles =  {display: "flex", flexDirection:"column", margin: "auto 0", backgroundColor: "white"} as const;

function App() {
    const [matrix, setMatrix] = useState(initialMatrix);

    useEffect(() => {

        let clearCell = (x: number, y: number) => setMatrix((matrix) => {
            const newMatrix = [...matrix]
            const newRow = [...newMatrix[y]]
            newRow[x] = 0;
            newMatrix[y] = newRow
            return newMatrix
        })

        setInterval(() => {
            const {x, y} = points.shift()!
            clearCell(x, y)
        },  256)
    }, [])

    return (
        <div style={containerStyles}>
            <div style={gridStyles}>
                {matrix.map((row, i) =>
                    <Row key={i} row={row}/>
                )}
            </div>
        </div>
    )
}

const Row = memo(({row}: {row: number[]}) =>  <div style={{display: "flex"}}>
    {row.map((cell, y) =>
        <div
            key={y}
            style={{
                height: "8px",
                aspectRatio: "1",
                placeContent: "center",
                display: "flex",
                transition: "background-color 0.5s ease",
                backgroundColor: `rgba(0, 0, 0, ${(cell / 9).toFixed(2)})`
            }}/>
    )}
</div>)

export default App
