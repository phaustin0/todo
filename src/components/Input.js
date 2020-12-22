import React, { useState } from 'react'
import './Input.css'

const Input = ({ todos, setTodos }) => {
  const [ val, setVal ] = useState("")
  const [ empty, setEmpty ] = useState(false)

  const submitHandler = () => {
    setEmpty(false)
    if (val == "") {
      setEmpty(true)
      return
    }
    if (!empty) {
      setTodos([
        ...todos,
        { text: val, id: Math.random() * 10000000 }
      ])
      setVal("")
    }
  }

  const enterHandler = (e) => {
    setEmpty(false)
    if (e.keyCode === 13) {
      if (val == "") {
        setEmpty(true)
        return
      }
      if (!empty) {
        setTodos([
          ...todos, { text: val, id: Math.random() * 10000000 }
        ])
        setVal("")
      }
    }
  }

  const change = () => {
    setEmpty(false)
  }

  return (
    <div className="input">
      <div className={ empty ? "empty" : "hidden" }>
        <p>Field is empty</p>
        <button className="input__closeWarningBtn" onClick={ change }>x</button>
      </div>
      <div className="input__box">
        <input type="text" className="input__field" placeholder="Add something to do" autoComplete="off" onChange={(e) => setVal(e.target.value)} value={ val } onKeyDown={ enterHandler } />
        <button className="input__btn" onClick={ submitHandler }>+</button>
      </div>
    </div>
  )
}

export default Input
