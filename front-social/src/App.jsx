import { useState } from 'react'
import { Header } from '../components/layouts/general/Header'



function App() {
  const [count, setCount] = useState(0)

  return (
    <div className='layout'>
          <Header/>

    </div>

  )
}

export default App
