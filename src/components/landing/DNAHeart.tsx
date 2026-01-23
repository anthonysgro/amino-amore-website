import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

interface DNAHeartProps {
  className?: string
}

// Heart curve parametric equation - with adjustable "heartiness"
function getHeartPoint(
  t: number,
  scale: number = 15,
  heartiness: number = 0.55,
): THREE.Vector3 {
  const heartX = 16 * Math.pow(Math.sin(t), 3)
  const heartY =
    13 * Math.cos(t) -
    5 * Math.cos(2 * t) -
    2 * Math.cos(3 * t) -
    Math.cos(4 * t)

  const circleX = 12 * Math.sin(t)
  const circleY = 12 * Math.cos(t)

  const x = circleX + (heartX - circleX) * heartiness
  const y = circleY + (heartY - circleY) * heartiness

  return new THREE.Vector3(x * scale * 0.06, y * scale * 0.06, 0)
}

function getHeartTangent(t: number): THREE.Vector3 {
  const delta = 0.001
  const p1 = getHeartPoint(t - delta)
  const p2 = getHeartPoint(t + delta)
  return p2.sub(p1).normalize()
}

// Generate strand positions along the heart-shaped helix
function generateStrandPoints(
  numPoints: number,
  helixRadius: number,
  helixTwist: number,
  offset: number = 0,
): Array<THREE.Vector3> {
  const points: Array<THREE.Vector3> = []

  for (let i = 0; i <= numPoints; i++) {
    const t = (i / numPoints) * Math.PI * 2
    const centerPoint = getHeartPoint(t)
    const tangent = getHeartTangent(t)

    const up = new THREE.Vector3(0, 0, 1)
    const perp = new THREE.Vector3().crossVectors(tangent, up).normalize()

    const helixAngle = i * helixTwist * Math.PI * 2 + offset

    const strandOffset = new THREE.Vector3()
      .copy(perp)
      .multiplyScalar(Math.cos(helixAngle) * helixRadius)
    strandOffset.z = Math.sin(helixAngle) * helixRadius

    points.push(centerPoint.clone().add(strandOffset))
  }

  return points
}

function DNAHeart({ className }: DNAHeartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isSafari, setIsSafari] = useState(false)
  const sceneRef = useRef<{
    scene: THREE.Scene
    camera: THREE.PerspectiveCamera
    renderer: THREE.WebGLRenderer
    dna: THREE.Object3D
    animationId: number
    isDragging: boolean
    autoRotate: boolean
    previousMousePosition: { x: number; y: number }
  } | null>(null)

  // Detect Safari on mount
  useEffect(() => {
    const ua = navigator.userAgent
    const isSafariBrowser = /^((?!chrome|android).)*safari/i.test(ua)
    setIsSafari(isSafariBrowser)
  }, [])

  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current
    const width = container.clientWidth
    const height = container.clientHeight

    // If container has no size yet, wait for it with ResizeObserver
    if (width === 0 || height === 0) {
      const resizeObserver = new ResizeObserver((entries) => {
        const entry = entries[0]
        if (
          entry &&
          entry.contentRect.width > 0 &&
          entry.contentRect.height > 0
        ) {
          resizeObserver.disconnect()
          initScene(
            container,
            entry.contentRect.width,
            entry.contentRect.height,
          )
        }
      })
      resizeObserver.observe(container)
      return () => resizeObserver.disconnect()
    }

    return initScene(container, width, height)

    function initScene(
      container: HTMLDivElement,
      width: number,
      height: number,
    ) {
      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })

      renderer.setSize(width, height)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.setClearColor(0x000000, 0)
      container.appendChild(renderer.domElement)

      // Zoom in more on mobile/tablet (below 1024px)
      const isMobile = window.innerWidth < 1024
      camera.position.z = isMobile ? 28 : 38

      // Romantic colors
      const pink = 0xf472b6
      const rose = 0xfb7185
      const purple = 0xa855f7
      const fuchsia = 0xe879f9

      const pinkMaterial = new THREE.MeshBasicMaterial({ color: pink })
      const roseMaterial = new THREE.MeshBasicMaterial({ color: rose })
      const purpleMaterial = new THREE.MeshBasicMaterial({ color: purple })
      const fuchsiaMaterial = new THREE.MeshBasicMaterial({ color: fuchsia })

      const dna = new THREE.Object3D()

      const numPoints = 100
      const helixRadius = 2.2
      const helixTwist = 0.12

      const strand1Points = generateStrandPoints(
        numPoints,
        helixRadius,
        helixTwist,
        0,
      )
      const strand2Points = generateStrandPoints(
        numPoints,
        helixRadius,
        helixTwist,
        Math.PI,
      )

      const curve1 = new THREE.CatmullRomCurve3(strand1Points, true)
      const tubeGeom1 = new THREE.TubeGeometry(
        curve1,
        numPoints * 4,
        0.28,
        24,
        true,
      )
      const strand1Mesh = new THREE.Mesh(tubeGeom1, pinkMaterial)
      dna.add(strand1Mesh)

      const curve2 = new THREE.CatmullRomCurve3(strand2Points, true)
      const tubeGeom2 = new THREE.TubeGeometry(
        curve2,
        numPoints * 4,
        0.28,
        24,
        true,
      )
      const strand2Mesh = new THREE.Mesh(tubeGeom2, roseMaterial)
      dna.add(strand2Mesh)

      const rungGeometry = new THREE.CylinderGeometry(0.12, 0.12, 1, 24)
      const ballGeometry = new THREE.SphereGeometry(0.25, 32, 32)

      for (let i = 0; i < numPoints; i += 5) {
        const p1 = strand1Points[i]
        const p2 = strand2Points[i]
        const midPoint = p1.clone().add(p2).multiplyScalar(0.5)
        const distance = p1.distanceTo(p2)

        const rung1 = new THREE.Mesh(rungGeometry, purpleMaterial)
        rung1.scale.y = distance * 0.45
        const rung1Pos = p1.clone().lerp(midPoint, 0.5)
        rung1.position.copy(rung1Pos)
        rung1.lookAt(midPoint)
        rung1.rotateX(Math.PI / 2)
        dna.add(rung1)

        const rung2 = new THREE.Mesh(rungGeometry, fuchsiaMaterial)
        rung2.scale.y = distance * 0.45
        const rung2Pos = p2.clone().lerp(midPoint, 0.5)
        rung2.position.copy(rung2Pos)
        rung2.lookAt(midPoint)
        rung2.rotateX(Math.PI / 2)
        dna.add(rung2)

        const centerBall = new THREE.Mesh(ballGeometry, purpleMaterial)
        centerBall.position.copy(midPoint)
        dna.add(centerBall)
      }

      dna.position.y = 1.2
      scene.add(dna)

      let time = 0
      let manualRotationY = 0
      let manualRotationX = 0
      let velocityY = 0
      let velocityX = 0

      sceneRef.current = {
        scene,
        camera,
        renderer,
        dna,
        animationId: 0,
        isDragging: false,
        autoRotate: true,
        previousMousePosition: { x: 0, y: 0 },
      }

      const animate = () => {
        const id = requestAnimationFrame(animate)
        if (sceneRef.current) {
          sceneRef.current.animationId = id

          time += 0.008

          const targetY = Math.sin(time) * 0.5
          const targetX = 0

          if (!sceneRef.current.isDragging) {
            manualRotationY += velocityY
            manualRotationX += velocityX

            velocityY *= 0.96
            velocityX *= 0.96

            manualRotationY *= 0.985
            manualRotationX *= 0.985

            if (
              Math.abs(manualRotationY) < 0.001 &&
              Math.abs(velocityY) < 0.0001
            ) {
              manualRotationY = 0
              velocityY = 0
            }
            if (
              Math.abs(manualRotationX) < 0.001 &&
              Math.abs(velocityX) < 0.0001
            ) {
              manualRotationX = 0
              velocityX = 0
            }
          }

          dna.rotation.y = targetY + manualRotationY
          dna.rotation.x = targetX + manualRotationX
        }

        renderer.render(scene, camera)
      }
      animate()

      const onMouseDown = (e: MouseEvent) => {
        if (!sceneRef.current) return
        sceneRef.current.isDragging = true
        sceneRef.current.previousMousePosition = { x: e.clientX, y: e.clientY }
        velocityY = 0
        velocityX = 0
        container.style.cursor = 'grabbing'
      }

      const onMouseMove = (e: MouseEvent) => {
        if (!sceneRef.current || !sceneRef.current.isDragging) return
        const deltaX = e.clientX - sceneRef.current.previousMousePosition.x
        const deltaY = e.clientY - sceneRef.current.previousMousePosition.y
        manualRotationY += deltaX * 0.005
        manualRotationX += deltaY * 0.005
        velocityY = deltaX * 0.002
        velocityX = deltaY * 0.002
        sceneRef.current.previousMousePosition = { x: e.clientX, y: e.clientY }
      }

      const onMouseUp = () => {
        if (!sceneRef.current) return
        sceneRef.current.isDragging = false
        container.style.cursor = 'grab'
      }

      const onMouseLeave = () => {
        if (!sceneRef.current) return
        sceneRef.current.isDragging = false
        container.style.cursor = 'grab'
      }

      container.addEventListener('mousedown', onMouseDown)
      container.addEventListener('mousemove', onMouseMove)
      container.addEventListener('mouseup', onMouseUp)
      container.addEventListener('mouseleave', onMouseLeave)

      const handleResize = () => {
        if (!containerRef.current || !sceneRef.current) return
        const newWidth = containerRef.current.clientWidth
        const newHeight = containerRef.current.clientHeight
        sceneRef.current.camera.aspect = newWidth / newHeight
        sceneRef.current.camera.updateProjectionMatrix()
        sceneRef.current.renderer.setSize(newWidth, newHeight)

        const isMobile = window.innerWidth < 1024
        sceneRef.current.camera.position.z = isMobile ? 28 : 38
      }

      window.addEventListener('resize', handleResize)

      return () => {
        window.removeEventListener('resize', handleResize)
        container.removeEventListener('mousedown', onMouseDown)
        container.removeEventListener('mousemove', onMouseMove)
        container.removeEventListener('mouseup', onMouseUp)
        container.removeEventListener('mouseleave', onMouseLeave)
        if (sceneRef.current) {
          cancelAnimationFrame(sceneRef.current.animationId)
        }
        renderer.dispose()
        if (container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement)
        }
      }
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        width: '100%',
        height: '100%',
        cursor: 'grab',
        // Only apply drop-shadow on non-Safari browsers (Safari has issues with WebGL canvas filters)
        filter: isSafari
          ? 'none'
          : 'drop-shadow(0 0 8px rgba(244, 114, 182, 0.6)) drop-shadow(0 0 20px rgba(168, 85, 247, 0.4))',
      }}
      aria-hidden="true"
    />
  )
}

export { DNAHeart }
export type { DNAHeartProps }
