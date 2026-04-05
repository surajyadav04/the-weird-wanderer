import { useState } from 'react'
import Snowfall from 'react-snowfall'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const [isSnowing, setIsSnowing] = useState(false)

  return (
    <>
      {isSnowing && (
        <Snowfall
          color="#f0ece4"
          snowflakeCount={150}
          style={{
            position: 'fixed',
            width: '100vw',
            height: '100vh',
            zIndex: 1000,
            pointerEvents: 'none'
          }}
        />
      )}

      <div style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        background: 'rgba(13, 12, 11, 0.8)',
        padding: '10px 20px',
        borderRadius: '30px',
        border: '1px solid var(--accent)',
        backdropFilter: 'blur(10px)'
      }}>
        <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--fog)' }}>
          {isSnowing ? 'Snowfall On' : 'Snowfall Off'}
        </span>
        <button
          onClick={() => setIsSnowing(!isSnowing)}
          style={{
            width: '40px',
            height: '20px',
            borderRadius: '10px',
            background: isSnowing ? 'var(--accent)' : '#333',
            border: 'none',
            position: 'relative',
            cursor: 'pointer',
            transition: 'background 0.3s'
          }}
        >
          <div style={{
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            background: '#fff',
            position: 'absolute',
            top: '2px',
            left: isSnowing ? '22px' : '2px',
            transition: 'left 0.3s'
          }} />
        </button>
      </div>

      <nav className="nav" style={{ position: 'fixed', width: '100%', top: 0, zIndex: 100 }}>
        <div style={{ padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--ff-serif)', fontSize: '1.2rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>The Weird Wanderer</span>
        </div>
      </nav>

      <section id="center">
        <div className="hero">
          <img src={heroImg} className="base" width="170" height="179" alt="" />
          <img src={reactLogo} className="framework" alt="React logo" />
          <img src={viteLogo} className="vite" alt="Vite logo" />
        </div>
        <div>
          <h1>Snowfall Dashboard</h1>
          <p>
            Toggle the snowfall at the top right to see <code>react-snowfall</code> in action.
          </p>
        </div>
        <button
          className="counter"
          onClick={() => setCount((count) => count + 1)}
        >
          Count is {count}
        </button>
      </section>

      <div className="ticks"></div>
      <section id="spacer"></section>
    </>
  )
}

export default App
