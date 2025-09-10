
import './App.css'
import {Player} from './player/src/Player.tsx'
import {useEffect, useMemo, useState} from 'react'
import {buildComponentFromYaml} from './parser/index.tsx'
function App() {

  const [yamlText, setYamlText] = useState('')
  const [error, setError] = useState('')
  const examples = useMemo(() => ([
    {title: 'Enhanced Bank Hack', path: '/examples/test3.yaml'},
    {title: 'Bank Hacking Simulation', path: '/examples/test2.yaml'},
    {title: 'Google Search → Website Transition', path: '/examples/test5.yaml'},
  ]), [])

  useEffect(() => {
    fetch('/examples/test2.yaml')
      .then((r) => r.text())
      .then(setYamlText)
      .catch((e) => setError(String(e)))
  }, [])

  const parsed = useMemo(() => {
    if (!yamlText) return null
    try {
      return buildComponentFromYaml(yamlText)
    } catch (e) {
      setError(String(e))
      return null
    }
  }, [yamlText])


  return (
    <>
       {error ? (
         <div style={{color: 'red'}}>Error: {error}</div>
       ) : !parsed ? (
         <div>Loading...</div>
       ) : (
          <div style={{ padding: 20 }}>
            <div style={{display: 'flex', flexDirection: 'column', gap: 20}}>
              <div style={{width: '100%', display: 'flex', justifyContent: 'center'}}>
                <Player
                  component={parsed.component}
                  durationInFrames={parsed.durationInFrames}
                  compositionWidth={parsed.width}
                  compositionHeight={parsed.height}
                  fps={parsed.fps}
                  loop
                  autoPlay
                  controls
                  acknowledgeRemotionLicense
                />
              </div>
              <div style={{width: '100%'}}>
                <div style={{fontWeight: 600, marginBottom: 12, textAlign: 'left',fontSize: '2rem'}}>Examples</div>
                <div style={{
                  display: 'flex', 
                  gap: 12, 
                  overflowX: 'auto', 
                  paddingBottom: 20,
                  userSelect: 'none',
                }}>
                  {examples.map((ex) => (
                    <button key={ex.path} onClick={() => {
                      setError('')
                      fetch(ex.path)
                        .then((r) => r.text())
                        .then(setYamlText)
                        .catch((e) => setError(String(e)))
                    }} style={{
                      textAlign: 'center', 
                      zoom: 1.5,
                      padding: '10px 16px', 
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      minWidth: 'fit-content',
                      borderRadius: '6px',
                      border: '1px solid #ddd',
                      fontSize: '14px'
                    }}>
                      {ex.title}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

 
  )}    </>
  )
}

export default App
