import React, { useState } from 'react'
import './Category.css'

import Input from './Input'
import Todo from './Todo'

const Category = () => {
  const [ todos, setTodos ] = useState([])

  return (
    <div className="category">
      <div className="category__name">
        <input type="text" placeholder="Edit the category name" autoComplete="off" />
      </div>
      <div className="category__input">
        <Input todos={ todos } setTodos={ setTodos } />
      </div>
      <div className="category__todolist">
        {todos.map((todo) => (
          <li><Todo todo={ todo } todos={ todos } setTodos={ setTodos } /></li>
        ))}
      </div>
    </div>
  )
}

export default Category
