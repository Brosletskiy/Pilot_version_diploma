import './index.scss'
import { Route, Routes } from 'react-router-dom'
import NotFound from './features/notFound'
import Home from './features/index';
import "./App.scss";


function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/*" element={<NotFound />} />
      </Routes>
    </>
  )
}

export default App
