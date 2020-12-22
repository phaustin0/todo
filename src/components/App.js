import React from 'react'
import './App.css'

import Category from './Category'

const App = () => {
  return (
    <div className="app">
      <div className="app__header">
        <h1>Todo App</h1>
      </div>
      <div className="app__categories">
        <Category />
        <Category />
        <Category />
        <Category />
        <Category />
      </div>
    </div>
  )
}

export default App
