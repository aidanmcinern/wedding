import React, { useEffect, useRef, useState } from 'react' 
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { BedDouble, Plane, PartyPopper, MapPin } from 'lucide-react'

// Content translations - easily extendable for multiple languages
const content = {
  en: {
    accommodation: {
      title: 'Accommodation',
      sections: [
        {
          id: 'overview',
          title: 'Overview',
          body: "Toulouse is full of fantastic hotels and Airbnbs to suit all styles and budgets. We recommend staying in or around the city centre, where you'll be close to restaurants, cafés, shops and transport links."
        },
        {
          id: 'areas',
          title: 'Recommended Areas',
          body: "Some areas you might like to consider include:\n• Historic centre (Capitole / Carmes) – beautiful architecture, walkable\n• Saint-Étienne – elegant, quieter, and close to parks and museums\n• Saint-Cyprien – trendy, relaxed, and just across the river with great food spots"
        }
      ],
      label: 'Accommodation'
    },
    transport: {
      title: 'Transport',
      sections: [
        {
          id: 'getting-to-toulouse',
          title: 'Getting to Toulouse',
          body: "Toulouse Airport (TLS) is the main airport serving the city. From the airport, a shuttle bus runs every 15 minutes and takes you directly into the city centre. Taxis and Uber are also readily available, and there are several car hire companies located beside the terminal if you'd prefer to drive."
        },
        {
          id: 'other-airports',
          title: 'Other Airports',
          body: "If you're planning to turn your trip into a longer holiday, there are several other airports within easy reach of Toulouse that you may find useful:\n• Carcassonne Airport – approx. 1.5 hours by train\n• Tarbes–Lourdes–Pyrénées Airport – approx. 2 hours by train\n• Bordeaux Airport – approx. 3.5 hours by train\n• Biarritz Airport – approx. 4 hours by train"
        },
        {
          id: 'getting-to-venue',
          title: 'Getting to the Venue',
          body: "Château Saint Louis is located around 40 minutes north of Toulouse by car. There is plenty of on-site parking available if you choose to drive.\n\nAlternatively, we have arranged a shuttle bus running hourly between central Toulouse (Allées Jean-Jaurès) and the venue. If you plan to use the shuttle, please let us know in advance via the RSVP so we can ensure we have the right capacity."
        }
      ],
      label: 'Transport'
    },
    activities: {
      title: 'Activities',
      sections: [
        {
          id: 'welcome',
          title: 'Welcome',
          body: "We're so happy you're coming to celebrate with us. For some of you, this may be your first time visiting La Ville Rose. There's plenty to explore while you're here and so we've lined up some money-can't-buy experiences!"
        },
        {
          id: 'special-tours',
          title: 'Special Tours',
          body: "Caroline's father - who spent many years leading the development of Airbus aircraft - has offered to lead a tour of the Airbus A321 Final Assembly Line (provisionally penciled in for Weds 27th May), and Caroline's brother (our resident historian) has offered to give a tour of the historic quarter of Toulouse (provisionally penciled in for Thurs 28th May). If you'd be interested in joining us for one or both of these please let us know in the RSVP."
        },
        {
          id: 'explore',
          title: 'Explore at Your Pace',
          body: "If you're staying a little longer (or even just passing through), the document below gathers some ideas we have to help you enjoy Toulouse and the surrounding region at your own pace. Nothing here is a must-do – think of this as a menu of possibilities to pick from depending on your mood, the weather, and your energy levels. We are always on hand to offer further information on anything - bonjour@aidancaroline2026.fr" 
        }
      ],
      label: 'Activities'
    },
    venue: {
      title: 'The Big Day',
      sections: [
        {
          id: 'location',
          title: 'Location',
          body: "The ceremony and reception will be held together at the Château and in its gardens. It will be a relaxed day, so feel free to dress smart casual."
        },
        {
          id: 'timetable',
          title: 'Timetable',
          body: "The anticipated timetable is as follows:\n• 2pm - Arrival\n• 2.30pm - Ceremony\n• 3pm - Refreshments & Games\n• 4pm - Cocktail Reception\n• 7pm - Dinner\n• Party 'til late"
        }
      ],
      label: 'The Big Day'
    }
  },
  fr: {
    accommodation: {
      title: 'Hébergement',
      sections: [
        {
          id: 'overview',
          title: 'Aperçu',
          body: 'Nous recommandons ces charmants hôtels : Hôtel du Parc et B&B au bord de la rivière. Un service de navette est disponible depuis la gare pour faciliter votre voyage.'
        },
        {
          id: 'options',
          title: 'Options',
          body: 'L\'Hôtel du Parc propose des chambres élégantes avec vue sur la place historique, tandis que le B&B au bord de la rivière offre une retraite paisible avec accès direct aux sentiers de promenade.\n\nLes deux options sont à 10 minutes du lieu de réception, et notre service de navette gratuit circule toutes les 30 minutes de 14h à minuit le jour du mariage.'
        }
      ],
      label: 'Hébergement'
    },
    transport: {
      title: 'Transport',
      sections: [
        {
          id: 'shuttles',
          title: 'Navettes',
          body: 'Des navettes circuleront régulièrement depuis le centre-ville. Nous encourageons le covoiturage pour réduire notre impact environnemental.'
        },
        {
          id: 'schedule',
          title: 'Horaires',
          body: 'Horaires des navettes :\n• Départ de la Gare Centrale : Toutes les 30 minutes à partir de 14h00\n• Service de retour : Toutes les 30 minutes jusqu\'à 1h00\n• Point de rencontre : Entrée principale, Quai 1\n\nPour ceux qui viennent en voiture, un parking est disponible sur place. Nous encourageons les invités à organiser du covoiturage via notre groupe WhatsApp.'
        }
      ],
      label: 'Transport'
    },
    activities: {
      title: 'Activités',
      sections: [
        {
          id: 'vineyard',
          title: 'Visite du Vignoble',
          body: 'Rejoignez-nous pour une visite guidée du vignoble, une dégustation de vins et un délicieux pique-nique au bord de la rivière le samedi après-midi.'
        },
        {
          id: 'programme',
          title: 'Programme',
          body: 'Programme :\n• 14h00 - Visite guidée du vignoble avec notre sommelier\n• 15h30 - Dégustation de vins locaux\n• 17h00 - Pique-nique au bord de la rivière avec spécialités régionales\n\nVeuillez indiquer votre intérêt dans le formulaire de RSVP. Chaussures de marche confortables recommandées !'
        }
      ],
      label: 'Activités'
    },
    venue: {
      title: 'Le Grand Jour',
      sections: [
        {
          id: 'ceremony',
          title: 'Cérémonie',
          body: 'La cérémonie aura lieu dans les jardins historiques du Château, suivie d\'un dîner et d\'une soirée dansante dans la Grande Salle.'
        },
        {
          id: 'highlights',
          title: 'Points Forts',
          body: 'Points forts du lieu :\n• Cérémonie : Terrasse du jardin surplombant la vallée (16h00)\n• Cocktail : Roseraie (17h00)\n• Dîner : Grande Salle avec lustres en cristal (19h00)\n• Bal : Salle de bal avec orchestre live (à partir de 21h00)\n\nLe château date du 17ème siècle et offre une architecture magnifique et des vues à couper le souffle.'
        }
      ],
      label: 'Le Grand Jour'
    }
  }
}

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://wedding-rsvp-backend.azurewebsites.net/api'
  : 'http://localhost:3001/api';

export default function App() {
  const mountRef = useRef(null)
  const [activeInfo, setActiveInfo] = useState(null)
  const [fadeProgress, setFadeProgress] = useState(0)
  const cameraRef = useRef(null)
  const markersRef = useRef([])
  const iconRefs = useRef({})
  const [showRSVPForm, setShowRSVPForm] = useState(false)
  const [showGiftRegistry, setShowGiftRegistry] = useState(false)
  const [modelLoading, setModelLoading] = useState(true)
  const [pulseTime, setPulseTime] = useState(0)
  const [language, setLanguage] = useState('en')
  
  const [rsvpStep, setRsvpStep] = useState('search')
  const [searchName, setSearchName] = useState('')
  const [guestParty, setGuestParty] = useState([])
  const [searchError, setSearchError] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const infoData = {
    accommodation: {
      gif: '/gif-accom.gif',
      bgImage: '/back-accom.jpeg',
      icon: BedDouble,
      gifDuration: 4000
    },
    transport: {
      gif: '/gif-trav.gif',
      bgImage: '/back-trav.jpeg',
      icon: Plane,
      gifDuration: 3500
    },
    activities: {
      gif: '/gif-ent.gif',
      bgImage: '/back-ent.jpeg',
      icon: MapPin,
      gifDuration: 3400
    },
    venue: {
      gif: '/gif-wed.gif',
      bgImage: '/back-wed.jpeg',
      icon: PartyPopper,
      gifDuration: 5300
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
      iconElement.style.transform = 'translate(-50%, -50%)'
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
    if (activeInfo) {
      let start = null
      const duration = activeInfo.gifDuration || 3000
      
      const animateFade = (timestamp) => {
        if (!start) start = timestamp
        const elapsed = timestamp - start
        const progress = Math.min(elapsed / duration, 1)
        setFadeProgress(progress)
        
        if (progress < 1) {
          requestAnimationFrame(animateFade)
        }
      }
      
      requestAnimationFrame(animateFade)
    } else {
      setFadeProgress(0)
    }
  }, [activeInfo])

  const handleIconClick = (name) => {
    setActiveInfo({ ...infoData[name], name })
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

      alert('Thank you for your RSVP! It has been carefully noted :)')
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

  const currentContent = content[language]

  return (
    <div style={{ width: '100vw', height: '100vh', margin: 0, padding: 0, overflow: 'hidden', position: 'relative' }}>
      <div ref={mountRef} style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }} />

      <img src="/banner.png" alt="Wedding Logo" style={{ position: 'fixed', top: '20px', left: '20px', width: '15%', height: 'auto', zIndex: 200 }} />

      {/* Language Toggle */}
      <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 200, display: 'flex', gap: '8px' }}>
        <button 
          onClick={() => setLanguage('en')}
          style={{ 
            padding: '10px 16px', 
            background: language === 'en' ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.6)', 
            border: '2px solid rgba(0,0,0,0.1)', 
            borderRadius: '20px', 
            fontSize: '14px', 
            fontWeight: '600', 
            color: '#1a1a1a', 
            cursor: 'pointer', 
            transition: 'all 0.2s',
            backdropFilter: 'blur(10px)'
          }}
          onMouseOver={(e) => e.target.style.background = 'rgba(255,255,255,0.95)'}
          onMouseOut={(e) => e.target.style.background = language === 'en' ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.6)'}
        >
          EN
        </button>
        <button 
          onClick={() => setLanguage('fr')}
          style={{ 
            padding: '10px 16px', 
            background: language === 'fr' ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.6)', 
            border: '2px solid rgba(0,0,0,0.1)', 
            borderRadius: '20px', 
            fontSize: '14px', 
            fontWeight: '600', 
            color: '#1a1a1a', 
            cursor: 'pointer', 
            transition: 'all 0.2s',
            backdropFilter: 'blur(10px)'
          }}
          onMouseOver={(e) => e.target.style.background = 'rgba(255,255,255,0.95)'}
          onMouseOut={(e) => e.target.style.background = language === 'fr' ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.6)'}
        >
          FR
        </button>
      </div>

      {Object.keys(infoData).map(name => {
        const Icon = infoData[name].icon
        return (
          <div 
            key={name} 
            ref={el => iconRefs.current[name] = el}
            style={{ position: 'fixed', left: 0, top: 0, display: 'none', zIndex: 100, transform: 'translate(-50%, -50%)' }}
          >
            <div 
              onClick={() => handleIconClick(name)}
              style={{ 
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer'
              }}
            >
              <div
                style={{ 
                  width: '60px', 
                  height: '60px', 
                  borderRadius: '50%', 
                  background: 'rgba(255,255,255,0.12)', 
                  backdropFilter: 'blur(10px)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  boxShadow: `0 0 ${50 + Math.sin(pulseTime * 3) * 10}px rgba(255,215,0,${0.9 + Math.sin(pulseTime * 3) * 0.3}), 0 8px 32px rgba(0,0,0,0.1), inset 0 0 0 1px rgba(255,215,0,0.3)`, 
                  transition: 'all 0.2s', 
                  animation: 'pulsate 2s ease-in-out infinite' 
                }}
                onMouseOver={(e) => { 
                  e.currentTarget.style.transform = 'scale(1.15)'; 
                  e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; 
                  e.currentTarget.style.animationPlayState = 'paused' 
                }}
                onMouseOut={(e) => { 
                  e.currentTarget.style.transform = 'scale(1)'; 
                  e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; 
                  e.currentTarget.style.animationPlayState = 'running' 
                }}
              >
                <Icon size={28} strokeWidth={2} style={{ color: '#1a1a1a' }} />
              </div>
              <div style={{
                  fontFamily: '"Inter", "Segoe UI", "Helvetica Neue", Arial, sans-serif',
                  fontSize: '13px',
                  fontWeight: '500',
                  color: 'rgba(255,255,255,0.75)',
                  letterSpacing: '0.09em',
                  whiteSpace: 'nowrap',
                  textShadow: `
                    0 0 6px rgba(255,255,255,0.35),
                    0 4px 12px rgba(0,0,0,0.75)
                  `,
                  pointerEvents: 'none'
                }}>
                  {currentContent[name].label}
                </div>
            </div>
          </div>
        )
      })}

      {activeInfo && (
        <div style={{ 
          position: 'fixed',
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%,-50%)', 
          width: '90%', 
          maxWidth: '700px',
          maxHeight: '55vh',
          borderRadius: '16px', 
          overflow: 'hidden', 
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)', 
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column'
        }}>
            <button onClick={() => setActiveInfo(null)}
              style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 1002, background: 'rgba(0,0,0,0.5)', border: 'none', color: 'white', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', fontSize: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}
              onMouseOver={(e) => e.target.style.background = 'rgba(0,0,0,0.7)'}
              onMouseOut={(e) => e.target.style.background = 'rgba(0,0,0,0.5)'}>×</button>
            
            <img 
              src={activeInfo.gif} 
              alt={currentContent[activeInfo.name].title}
              style={{ 
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transition: fadeProgress >= 0.95 ? 'opacity 0.3s ease-out' : 'none',
                zIndex: 0
              }} 
            />
            
            <div 
              style={{ 
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundImage: `url(${activeInfo.bgImage})`, 
                backgroundSize: 'cover', 
                backgroundPosition: 'center',
                opacity: fadeProgress >= 0.95 ? 1 : 0,
                transition: fadeProgress >= 0.95 ? 'opacity 0.3s ease-in' : 'none',
                zIndex: 0
              }} 
            />
            
            <div style={{ 
              position: 'relative',
              width: '100%',
              maxWidth: '560px', 
              margin: '20px auto',
              padding: '32px 32px 96px 32px',
              maxHeight: '30vh',
              overflowY: 'auto',
              opacity: fadeProgress >= 0.95 ? 1 : 0,
              transition: fadeProgress >= 0.95 ? 'opacity 0.3s ease-in 0.1s' : 'none',
              zIndex: 1,
              color: '#616060',
              // textShadow: '0 2px 10px rgba(0,0,0,0.6)',
              fontFamily: '"Inter", "Segoe UI", "Helvetica Neue", Arial, sans-serif'
            }}>
              <h2 style={{ margin: '20px 20px 20px 20px', fontSize: '28px' }}>
                {currentContent[activeInfo.name].title}
              </h2>
              
              {/* Section Navigation */}
              <div style={{ 
                display: 'flex', 
                gap: '12px', 
                flexWrap: 'wrap',
                marginBottom: '24px',
                paddingBottom: '16px',
                borderBottom: '2px solid rgba(255,255,255,0.3)'
              }}>
                {currentContent[activeInfo.name].sections.map((section) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    style={{
                      padding: '8px 16px',
                      background: 'rgba(255,255,255,0.2)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255,255,255,0.3)',
                      borderRadius: '20px',
                      color: '#1a1a1a',
                      textDecoration: 'none',
                      fontSize: '14px',
                      fontWeight: '500',
                      transition: 'all 0.2s',
                      cursor: 'pointer'
                    }}
                    onMouseOver={(e) => {
                      e.target.style.background = 'rgba(255,255,255,0.35)'
                      e.target.style.transform = 'translateY(-1px)'
                    }}
                    onMouseOut={(e) => {
                      e.target.style.background = 'rgba(255,255,255,0.2)'
                      e.target.style.transform = 'translateY(0)'
                    }}
                  >
                    {section.title}
                  </a>
                ))}
              </div>

              {/* Sections */}
              {currentContent[activeInfo.name].sections.map((section, index) => (
                <div 
                  key={section.id} 
                  id={section.id}
                  style={{ 
                    marginBottom: index < currentContent[activeInfo.name].sections.length - 1 ? '32px' : '0',
                    scrollMarginTop: '20px'
                  }}
                >
                  <h3 style={{ 
                    margin: '0 0 0 30px', 
                    fontSize: '20px',
                    fontWeight: '600'
                  }}>
                    {section.title}
                  </h3>
                  <p style={{ 
                    margin: '0 0 0 30px', 
                    lineHeight: '1.8', 
                    fontSize: '16px',
                    whiteSpace: 'pre-line'
                  }}>
                    {section.body}
                  </p>


                  {activeInfo.name === 'transport' && section.id === 'getting-to-venue' && (
      <div
        style={{
          marginTop: '20px',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 8px 24px rgba(0,0,0,0.25)'
        }}
      >
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d45980.013678711366!2d1.3437759!3d43.923132!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x12ac05218106794b%3A0x657f83656e4c311e!2sCh%C3%A2teau%20Saint%20Louis!5e0!3m2!1sen!2sfr!4v1769022090276!5m2!1sen!2sfr"
          width="100%"
          style={{ border: 0 }}
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
                  )}

                </div>
              ))}
            </div>
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
                Please enter your full name.
              </p>
              <div>
                <input
                  type="text" 
                  value={searchName} 
                  onChange={(e) => { setSearchName(e.target.value); setSearchError('') }}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearchGuest()}
                  placeholder="e.g., Aidan Mcinerney"
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
                  Found {guestParty.length} guest{guestParty.length !== 1 ? 's' : ''} in your party. Please contact us at bonjour@aidancaroline2026.fr if something doesn't look correct.
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
          <p style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#666' }}>Your presence on our special day is the greatest gift we could ask for. We are very fortunate to already have many of the essentials for our home. If you wish to mark the occasion with a gift, we have made a selection of pieces, available through the link below. Our bank details are also shared below for anyone who prefers to make a transfer.</p>
            <a href="https://www.millemercismariage.com/aidancaroline2026" target="_blank" rel="noopener noreferrer" style={{ display: 'block', padding: '16px', background: '#1a1a1a', color: 'white', textAlign: 'center', borderRadius: '8px', textDecoration: 'none', fontSize: '16px', fontWeight: '600', transition: 'background 0.2s' }}
              onMouseOver={(e) => e.target.style.background = '#333'}
              onMouseOut={(e) => e.target.style.background = '#1a1a1a'}>Visit Our Online Registry →</a>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ textAlign: 'center', padding: '0 0' }}>
              <p style={{ margin: '0 0 0 0', fontSize: '16px', color: '#666' }}>— or —</p>
              </div>
            <div style={{ padding: '20px', background: '#f8f8f8', borderRadius: '12px', border: '2px solid #e0e0e0' }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', color: '#333' }}>Bank Transfer (IBAN)</h3>
              <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#666' }}>Account Name: Caroline Ribere</p>
              <p style={{ margin: 0, fontSize: '16px', fontFamily: 'monospace', color: '#1a1a1a', wordBreak: 'break-all' }}>FR67 3000 2040 4900 0001 6212 S17</p>
            </div>
          </div>
        </div>
      )}

      {(activeInfo || showRSVPForm || showGiftRegistry) && (
        <div onClick={() => { setActiveInfo(null); setShowRSVPForm(false); setShowGiftRegistry(false) }} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 999 }} />
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
          <p style={{ color: 'white', fontSize: '16px', fontWeight: '500', margin: 0 }}>Loading ...</p>
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