import React from 'react'
import './Todo.css'

const Todo = ({ todo, todos, setTodos }) => {

  const deleteHandler = () => {
    setTodos(todos.filter((item) => todo.id != item.id))
  }

  return (
    <div className="todo">
      <p className="todo__text">{ todo.text }</p>
      <button className="todo__deleteBtn" onClick={ deleteHandler }>x</button>
    </div>
  )
}

export default Todo
