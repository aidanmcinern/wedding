import React, { useEffect, useRef, useState } from 'react' 
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { BedDouble, Plane, PartyPopper, MapPin } from 'lucide-react'

// API Configuration - Update this to your deployed backend URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'wedding-rsvp-backend.azurewebsites.net'; //'http://localhost:3001/api';

export default function App() {
  const mountRef = useRef(null)
  const [activeInfo, setActiveInfo] = useState(null)
  const [gifFinished, setGifFinished] = useState(false)
  const cameraRef = useRef(null)
  const markersRef = useRef([])
  const iconRefs = useRef({})
  const [showRSVPForm, setShowRSVPForm] = useState(false)
  const [showGiftRegistry, setShowGiftRegistry] = useState(false)
  const [modelLoading, setModelLoading] = useState(true)
  const [pulseTime, setPulseTime] = useState(0)
  
  const [rsvpStep, setRsvpStep] = useState('search')
  const [searchName, setSearchName] = useState('')
  const [guestParty, setGuestParty] = useState([])
  const [searchError, setSearchError] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const infoData = {
    accommodation: {
      title: 'Accommodation',
      body: 'We recommend these charming hotels: Hôtel du Parc and B&B by the river. A shuttle service is available from the station to make your journey effortless.',
      gif: '/gif-accom.gif',
      bgImage: '/back-accom.jpeg',
      icon: BedDouble,
      gifDuration: 4000
    },
    transport: {
      title: 'Transport',
      body: 'Shuttle buses will run regularly from the city center. We encourage carpooling to reduce our environmental impact.',
      gif: '/gif-trav.gif',
      bgImage: '/back-trav.jpeg',
      icon: Plane,
      gifDuration: 3500
    },
    activities: {
      title: 'Activities',
      body: 'Join us for a guided vineyard tour, wine tasting, and a delightful riverside picnic on Saturday afternoon.',
      gif: '/gif-ent.gif',
      bgImage: '/back-ent.jpeg',
      icon: MapPin,
      gifDuration: 4500
    },
    venue: {
      title: 'Venue',
      body: 'The ceremony will take place in the historic Château gardens, followed by dinner and dancing in the Grand Hall.',
      gif: '/gif-wed.gif',
      bgImage: '/back-wed.jpeg',
      icon: PartyPopper,
      gifDuration: 5000
    }
  }

  const updateIconPositions = () => {
    if (!cameraRef.current || markersRef.current.length === 0) return
    markersRef.current.forEach(marker => {
      const iconElement = iconRefs.current[marker.name]
      if (!iconElement) return
      const vector = marker.position.clone()
      vector.project(cameraRef.current)
      const x = (vector.x * 0.5 + 0.5) * window.innerWidth
      const y = (-(vector.y * 0.5) + 0.5) * window.innerHeight
      const visible = vector.z < 1
      iconElement.style.left = `${x}px`
      iconElement.style.top = `${y}px`
      iconElement.style.display = visible ? 'flex' : 'none'
    })
  }

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const scene = new THREE.Scene()
    const gradientGeometry = new THREE.PlaneGeometry(2, 2)
    const gradientMaterial = new THREE.ShaderMaterial({
      uniforms: {
        topColor: { value: new THREE.Color(0x90caf9) },
        bottomColor: { value: new THREE.Color(0xffccbc) }
      },
      vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position, 1.0); }`,
      fragmentShader: `uniform vec3 topColor; uniform vec3 bottomColor; varying vec2 vUv; void main() { gl_FragColor = vec4(mix(bottomColor, topColor, vUv.y), 1.0); }`,
      depthWrite: false,
      depthTest: false
    })
    const gradientMesh = new THREE.Mesh(gradientGeometry, gradientMaterial)
    gradientMesh.renderOrder = -1
    const bgScene = new THREE.Scene()
    const bgCamera = new THREE.Camera()
    bgScene.add(gradientMesh)

    const width = mount.clientWidth
    const height = mount.clientHeight
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100)
    camera.position.set(0, 2.5, 2.5)
    cameraRef.current = camera

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.autoClear = false
    mount.appendChild(renderer.domElement)

    const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 1.2)
    hemi.position.set(0, 20, 0)
    scene.add(hemi)
    const dir = new THREE.DirectionalLight(0xffffff, 0.8)
    dir.position.set(5, 10, 7.5)
    scene.add(dir)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enablePan = false
    controls.enableZoom = false
    controls.enableRotate = true
    controls.rotateSpeed = 0.6
    controls.enableDamping = true
    controls.dampingFactor = 0.06
    controls.minPolarAngle = Math.PI / 2.7
    controls.maxPolarAngle = Math.PI / 2.7

    const markerPositions = [
      { name: 'accommodation', pos: new THREE.Vector3(0.3, 0.2, 0.6 ) },
      { name: 'transport', pos: new THREE.Vector3(-1.3, 0.2, 0.1) },
      { name: 'venue', pos: new THREE.Vector3(0.2, 0.5, -1.0) },
      { name: 'activities', pos: new THREE.Vector3(-0.4, 0.2, 0.8) }
    ]

    const markers = []
    markerPositions.forEach(({ name, pos }) => {
      const geometry = new THREE.SphereGeometry(0.08, 16, 16)
      const material = new THREE.MeshStandardMaterial({ transparent: true, opacity: 0, depthTest: true, depthWrite: false })
      const marker = new THREE.Mesh(geometry, material)
      marker.position.copy(pos)
      marker.name = name
      marker.userData = { isMarker: true, hovered: false }
      scene.add(marker)
      markers.push(marker)
    })
    markersRef.current = markers

    const loader = new GLTFLoader()
    let model = null
    let mixer = null

    loader.load('/model.glb',
      (gltf) => {
        model = gltf.scene
        model.position.set(0, 0, 0)
        scene.add(model)
        const box = new THREE.Box3().setFromObject(model)
        const size = new THREE.Vector3()
        box.getSize(size)
        const maxDim = Math.max(size.x, size.y, size.z)
        if (maxDim > 0) model.scale.setScalar(3 / maxDim)
        if (gltf.animations && gltf.animations.length > 0) {
          mixer = new THREE.AnimationMixer(model)
          gltf.animations.forEach((clip) => {
            const action = mixer.clipAction(clip)
            action.timeScale = 0.5
            action.play()
          })
        }
        setModelLoading(false)
      },
      (progress) => console.log('Loading:', (progress.loaded / progress.total * 100).toFixed(2) + '%'),
      (err) => { console.error('Error loading model', err); setModelLoading(false) }
    )

    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2()
    function onPointerMove(event) {
      const rect = renderer.domElement.getBoundingClientRect()
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
      raycaster.setFromCamera(mouse, camera)
      const intersects = raycaster.intersectObjects(markers, false)
      renderer.domElement.style.cursor = intersects.length > 0 ? 'pointer' : 'default'
    }
    renderer.domElement.addEventListener('pointermove', onPointerMove)

    function onWindowResize() {
      const w = mount.clientWidth
      const h = mount.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
      updateIconPositions()
    }
    window.addEventListener('resize', onWindowResize)

    const clock = new THREE.Clock()
    function animate() {
      requestAnimationFrame(animate)
      const delta = clock.getDelta()
      controls.update()
      if (mixer) mixer.update(delta)
      renderer.clear()
      renderer.render(bgScene, bgCamera)
      renderer.clearDepth()
      renderer.render(scene, camera)
      updateIconPositions()
    }
    animate()
    updateIconPositions()

    return () => {
      window.removeEventListener('resize', onWindowResize)
      renderer.domElement.removeEventListener('pointermove', onPointerMove)
      mount.removeChild(renderer.domElement)
      renderer.dispose()
    }
  }, [])

  useEffect(() => {
    if (activeInfo && !gifFinished) {
      const timer = setTimeout(() => setGifFinished(true), activeInfo.gifDuration || 3000)
      return () => clearTimeout(timer)
    }
  }, [activeInfo, gifFinished])

  const handleIconClick = (name) => {
    setActiveInfo(infoData[name])
    setGifFinished(false)
  }

  const handleSearchGuest = async () => {
    if (!searchName.trim()) {
      setSearchError('Please enter a name')
      return
    }

    setIsSearching(true)
    setSearchError('')

    try {
      const response = await fetch(`${API_BASE_URL}/search-guest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: searchName })
      })

      const data = await response.json()

      if (!response.ok) {
        setSearchError(data.error || 'An error occurred while searching')
        setIsSearching(false)
        return
      }

      setGuestParty(data.guests)
      setRsvpStep('form')
      setSearchError('')
    } catch (error) {
      console.error('Search error:', error)
      setSearchError('Unable to connect to server. Please try again later.')
    } finally {
      setIsSearching(false)
    }
  }

  const updateGuest = (guestId, field, value) => {
    setGuestParty(prev => prev.map(guest => 
      guest.id === guestId ? { ...guest, [field]: value } : guest
    ))
  }

  const setAllGuests = (field, value) => {
    setGuestParty(prev => prev.map(guest => ({ ...guest, [field]: value })))
  }

  const handleRSVPSubmit = async () => {
    const invalidGuests = guestParty.filter(g => g.attending && !g.mealPreference)
    if (invalidGuests.length > 0) {
      alert('Please select a meal preference for all attending guests')
      return
    }
    
    setIsSubmitting(true)

    try {
      const response = await fetch(`${API_BASE_URL}/submit-rsvp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ guests: guestParty })
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.error || 'Failed to submit RSVP. Please try again.')
        setIsSubmitting(false)
        return
      }

      alert('Thank you for your RSVP! We look forward to celebrating with you.')
      setShowRSVPForm(false)
      setRsvpStep('search')
      setSearchName('')
      setGuestParty([])
    } catch (error) {
      console.error('Submit error:', error)
      alert('Unable to connect to server. Please try again later.')
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    let animationId
    const animatePulse = () => {
      setPulseTime(Date.now() / 1000)
      animationId = requestAnimationFrame(animatePulse)
    }
    animatePulse()
    return () => cancelAnimationFrame(animationId)
  }, [])

  return (
    <div style={{ width: '100vw', height: '100vh', margin: 0, padding: 0, overflow: 'hidden', position: 'relative' }}>
      <div ref={mountRef} style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }} />

      <img src="/banner.png" alt="Wedding Logo" style={{ position: 'fixed', top: '20px', left: '20px', width: '15%', height: 'auto', zIndex: 200 }} />

      {Object.keys(infoData).map(name => {
        const Icon = infoData[name].icon
        return (
          <div key={name} ref={el => iconRefs.current[name] = el} onClick={() => handleIconClick(name)}
            style={{ position: 'fixed', left: 0, top: 0, transform: 'translate(-50%, -50%)', width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)', cursor: 'pointer', display: 'none', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 ${50 + Math.sin(pulseTime * 3) * 10}px rgba(255,215,0,${0.9 + Math.sin(pulseTime * 3) * 0.3}), 0 8px 32px rgba(0,0,0,0.1), inset 0 0 0 1px rgba(255,215,0,0.3)`, transition: 'all 0.2s', zIndex: 100, animation: 'pulsate 2s ease-in-out infinite' }}
            onMouseOver={(e) => { e.currentTarget.style.transform = 'translate(-50%,-50%) scale(1.15)'; e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; e.currentTarget.style.animationPlayState = 'paused' }}
            onMouseOut={(e) => { e.currentTarget.style.transform = 'translate(-50%,-50%) scale(1)'; e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.animationPlayState = 'running' }}>
            <Icon size={28} strokeWidth={2} style={{ color: '#1a1a1a' }} />
          </div>
        )
      })}

      {activeInfo && (
        <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '90%', maxWidth: '500px', background: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', zIndex: 1000 }}>
          <button onClick={() => { setActiveInfo(null); setGifFinished(false) }}
            style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 1001, background: 'rgba(0,0,0,0.5)', border: 'none', color: 'white', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', fontSize: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}
            onMouseOver={(e) => e.target.style.background = 'rgba(0,0,0,0.7)'}
            onMouseOut={(e) => e.target.style.background = 'rgba(0,0,0,0.5)'}>×</button>
          {!gifFinished ? <img src={activeInfo.gif} alt={activeInfo.title} style={{ width: '100%', display: 'block', background: 'black' }} /> : (
            <>
              <div style={{ height: '200px', backgroundImage: `url(${activeInfo.bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
              <div style={{ padding: '24px' }}>
                <h2 style={{ margin: '0 0 12px 0', fontSize: '24px', color: '#1a1a1a' }}>{activeInfo.title}</h2>
                <p style={{ margin: 0, lineHeight: '1.6', color: '#4a4a4a', fontSize: '16px' }}>{activeInfo.body}</p>
              </div>
            </>
          )}
        </div>
      )}

      {showRSVPForm && (
        <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '95%', maxWidth: '1000px', maxHeight: '90vh', overflowY: 'auto', background: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', zIndex: 1000 }}>
          <button onClick={() => { setShowRSVPForm(false); setRsvpStep('search'); setSearchName(''); setGuestParty([]); setSearchError('') }} 
            style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(0,0,0,0.5)', border: 'none', color: 'white', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', fontSize: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}
            onMouseOver={(e) => e.target.style.background = 'rgba(0,0,0,0.7)'}
            onMouseOut={(e) => e.target.style.background = 'rgba(0,0,0,0.5)'}>×</button>
          
          <h2 style={{ margin: '0 0 24px 0', fontSize: '28px', color: '#1a1a1a' }}>RSVP</h2>
          
          {rsvpStep === 'search' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <p style={{ margin: 0, fontSize: '16px', color: '#666', lineHeight: '1.6' }}>
                Please enter your last name to find your invitation details.
              </p>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#333' }}>Last Name</label>
                <input 
                  type="text" 
                  value={searchName} 
                  onChange={(e) => { setSearchName(e.target.value); setSearchError('') }}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearchGuest()}
                  placeholder="e.g., Smith"
                  disabled={isSearching}
                  style={{ width: '100%', padding: '12px', border: '2px solid #e0e0e0', borderRadius: '8px', fontSize: '16px', boxSizing: 'border-box', opacity: isSearching ? 0.6 : 1 }} 
                />
                {searchError && <p style={{ margin: '8px 0 0 0', fontSize: '14px', color: '#d32f2f' }}>{searchError}</p>}
              </div>
              <button onClick={handleSearchGuest} disabled={isSearching} style={{ marginTop: '12px', padding: '14px', background: isSearching ? '#999' : '#1a1a1a', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: isSearching ? 'not-allowed' : 'pointer', transition: 'background 0.2s' }}
                onMouseOver={(e) => !isSearching && (e.target.style.background = '#333')}
                onMouseOut={(e) => !isSearching && (e.target.style.background = '#1a1a1a')}>
                {isSearching ? 'Searching...' : 'Search'}
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ padding: '16px', background: '#f8f8f8', borderRadius: '12px' }}>
                <p style={{ margin: '0 0 12px 0', fontSize: '15px', color: '#666' }}>
                  Found {guestParty.length} guest{guestParty.length !== 1 ? 's' : ''} in your party
                </p>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <button onClick={() => setAllGuests('attending', true)}
                    style={{ padding: '8px 16px', background: 'white', border: '2px solid #4caf50', color: '#4caf50', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseOver={(e) => { e.target.style.background = '#4caf50'; e.target.style.color = 'white' }}
                    onMouseOut={(e) => { e.target.style.background = 'white'; e.target.style.color = '#4caf50' }}>All Attending</button>
                  <button onClick={() => setAllGuests('attending', false)}
                    style={{ padding: '8px 16px', background: 'white', border: '2px solid #f44336', color: '#f44336', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseOver={(e) => { e.target.style.background = '#f44336'; e.target.style.color = 'white' }}
                    onMouseOut={(e) => { e.target.style.background = 'white'; e.target.style.color = '#f44336' }}>All Declining</button>
                  <button onClick={() => setAllGuests('airbusInterest', true)}
                    style={{ padding: '8px 16px', background: 'white', border: '2px solid #2196f3', color: '#2196f3', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseOver={(e) => { e.target.style.background = '#2196f3'; e.target.style.color = 'white' }}
                    onMouseOut={(e) => { e.target.style.background = 'white'; e.target.style.color = '#2196f3' }}>All Airbus/Walk</button>
                  <button onClick={() => setAllGuests('shuttleNeeded', true)}
                    style={{ padding: '8px 16px', background: 'white', border: '2px solid #ff9800', color: '#ff9800', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseOver={(e) => { e.target.style.background = '#ff9800'; e.target.style.color = 'white' }}
                    onMouseOut={(e) => { e.target.style.background = 'white'; e.target.style.color = '#ff9800' }}>All Need Shuttle</button>
                </div>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ background: '#f5f5f5', borderBottom: '2px solid #e0e0e0' }}>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#333', minWidth: '150px' }}>Name</th>
                      <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: '#333', minWidth: '100px' }}>Will be attending</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#333', minWidth: '140px' }}>Menu Selection</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#333', minWidth: '200px' }}>Dietary Requirements</th>
                      <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: '#333', minWidth: '120px' }}>Airbus Tour / Walk Interest</th>
                      <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: '#333', minWidth: '100px' }}>Will Require Shuttle</th>
                    </tr>
                  </thead>
                  <tbody>
                    {guestParty.map((guest, index) => (
                      <tr key={guest.id} style={{ borderBottom: '1px solid #e0e0e0', background: index % 2 === 0 ? 'white' : '#fafafa' }}>
                        <td style={{ padding: '12px', fontWeight: '500', color: '#1a1a1a' }}>{guest.name}</td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <input type="checkbox" checked={guest.attending} 
                            onChange={(e) => updateGuest(guest.id, 'attending', e.target.checked)}
                            style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
                        </td>
                        <td style={{ padding: '12px' }}>
                          <select value={guest.mealPreference} 
                            onChange={(e) => updateGuest(guest.id, 'mealPreference', e.target.value)}
                            disabled={!guest.attending}
                            style={{ width: '100%', padding: '8px', border: '1px solid #e0e0e0', borderRadius: '6px', fontSize: '14px', backgroundColor: guest.attending ? 'white' : '#f5f5f5', cursor: guest.attending ? 'pointer' : 'not-allowed' }}>
                            <option value="">Select...</option>
                            <option value="duck">Roasted Duck Breast</option>
                            <option value="fish">Roasted Cod Loin</option>
                            <option value="tart">Grilled Vegetable Tart (v)</option>
                            <option value="kid">Children's Menu</option>
                            <option value="kidv">Children's Menu (v)</option>
                          </select>
                        </td>
                        <td style={{ padding: '12px' }}>
                          <input type="text" value={guest.dietaryRequirements}
                            onChange={(e) => updateGuest(guest.id, 'dietaryRequirements', e.target.value)}
                            disabled={!guest.attending}
                            placeholder="Optional"
                            style={{ width: '100%', padding: '8px', border: '1px solid #e0e0e0', borderRadius: '6px', fontSize: '14px', backgroundColor: guest.attending ? 'white' : '#f5f5f5', boxSizing: 'border-box' }} />
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <input type="checkbox" checked={guest.airbusInterest} 
                            onChange={(e) => updateGuest(guest.id, 'airbusInterest', e.target.checked)}
                            style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <input type="checkbox" checked={guest.shuttleNeeded} 
                            onChange={(e) => updateGuest(guest.id, 'shuttleNeeded', e.target.checked)}
                            style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button onClick={() => { setRsvpStep('search'); setSearchName(''); setGuestParty([]) }}
                  disabled={isSubmitting}
                  style={{ flex: 1, padding: '14px', background: 'white', color: '#1a1a1a', border: '2px solid #e0e0e0', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.6 : 1, transition: 'all 0.2s' }}
                  onMouseOver={(e) => !isSubmitting && (e.target.style.borderColor = '#999')}
                  onMouseOut={(e) => !isSubmitting && (e.target.style.borderColor = '#e0e0e0')}>Back</button>
                <button onClick={handleRSVPSubmit}
                  disabled={isSubmitting}
                  style={{ flex: 2, padding: '14px', background: isSubmitting ? '#999' : '#1a1a1a', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: isSubmitting ? 'not-allowed' : 'pointer', transition: 'background 0.2s' }}
                  onMouseOver={(e) => !isSubmitting && (e.target.style.background = '#333')}
                  onMouseOut={(e) => !isSubmitting && (e.target.style.background = '#1a1a1a')}>
                  {isSubmitting ? 'Submitting...' : 'Submit RSVP'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      {showGiftRegistry && (
        <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '90%', maxWidth: '500px', background: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', zIndex: 1000 }}>
          <button onClick={() => setShowGiftRegistry(false)} style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(0,0,0,0.5)', border: 'none', color: 'white', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', fontSize: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}
            onMouseOver={(e) => e.target.style.background = 'rgba(0,0,0,0.7)'}
            onMouseOut={(e) => e.target.style.background = 'rgba(0,0,0,0.5)'}>×</button>
          <h2 style={{ margin: '0 0 24px 0', fontSize: '28px', color: '#1a1a1a' }}>Gift Registry</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ padding: '20px', background: '#f8f8f8', borderRadius: '12px', border: '2px solid #e0e0e0' }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', color: '#333' }}>Bank Transfer (IBAN)</h3>
              <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#666' }}>Account Name: Aidan & Caroline</p>
              <p style={{ margin: 0, fontSize: '16px', fontFamily: 'monospace', color: '#1a1a1a', wordBreak: 'break-all' }}>FR76 XXXX XXXX XXXX XXXX XXXX XXX</p>
              <p style={{ margin: '12px 0 0 0', fontSize: '13px', color: '#999', fontStyle: 'italic' }}>(Replace with your actual IBAN)</p>
            </div>
            <div style={{ textAlign: 'center', padding: '12px 0' }}>
              <p style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#666' }}>— or —</p>
            </div>
            <a href="https://www.millemercismariage.com/aidancaroline2026" target="_blank" rel="noopener noreferrer" style={{ display: 'block', padding: '16px', background: '#1a1a1a', color: 'white', textAlign: 'center', borderRadius: '8px', textDecoration: 'none', fontSize: '16px', fontWeight: '600', transition: 'background 0.2s' }}
              onMouseOver={(e) => e.target.style.background = '#333'}
              onMouseOut={(e) => e.target.style.background = '#1a1a1a'}>Visit Our Online Registry →</a>
          </div>
        </div>
      )}

      {(activeInfo || showRSVPForm || showGiftRegistry) && (
        <div onClick={() => { setActiveInfo(null); setGifFinished(false); setShowRSVPForm(false); setShowGiftRegistry(false) }} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 999 }} />
      )}

      <div style={{ position: 'fixed', bottom: '80px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '16px', zIndex: 100 }}>
        <button onClick={() => setShowRSVPForm(true)} style={{ padding: '14px 28px', background: 'rgba(255,255,255,0.9)', border: '2px solid rgba(0,0,0,0.1)', borderRadius: '24px', fontSize: '15px', fontWeight: '600', color: '#1a1a1a', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', transition: 'all 0.2s' }}
          onMouseOver={(e) => { e.target.style.background = 'white'; e.target.style.transform = 'translateY(-2px)' }}
          onMouseOut={(e) => { e.target.style.background = 'rgba(255,255,255,0.9)'; e.target.style.transform = 'translateY(0)' }}>RSVP</button>
        <button onClick={() => setShowGiftRegistry(true)} style={{ padding: '14px 28px', background: 'rgba(255,255,255,0.9)', border: '2px solid rgba(0,0,0,0.1)', borderRadius: '24px', fontSize: '15px', fontWeight: '600', color: '#1a1a1a', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', transition: 'all 0.2s' }}
          onMouseOver={(e) => { e.target.style.background = 'white'; e.target.style.transform = 'translateY(-2px)' }}
          onMouseOut={(e) => { e.target.style.background = 'rgba(255,255,255,0.9)'; e.target.style.transform = 'translateY(0)' }}>Gift Registry</button>
      </div>

      {modelLoading && (
        <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center', zIndex: 1000 }}>
          <div style={{ width: '60px', height: '60px', border: '4px solid rgba(255,255,255,0.3)', borderTop: '4px solid white', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ color: 'white', fontSize: '16px', fontWeight: '500', margin: 0 }}>Loading model...</p>
          <style>{`
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            @keyframes pulsate { 
              0%, 100% { transform: translate(-50%, -50%) scale(1); box-shadow: 0 8px 32px rgba(0,0,0,0.1), inset 0 0 0 1px rgba(255,255,255,0.2); } 
              50% { transform: translate(-50%, -50%) scale(1.2); box-shadow: 0 12px 48px rgba(0,0,0,0.2), inset 0 0 0 2px rgba(255,255,255,0.4), 0 0 20px rgba(255,255,255,0.5); }
            }
          `}</style>
        </div>
      )}
    </div>
  )
}