import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sky, Text, Float } from '@react-three/drei';
import { Link } from 'react-router-dom';
import * as THREE from 'three';

// ─── PALETTE ───────────────────────────────────────────────────────────────
const C = {
    gold:     '#FFC107',
    wood:     '#5D4037',
    glass:    '#88CCEE',
    concrete: '#EEEEEE',
    water:    '#29B6F6',
    asphalt:  '#333333',
    grass:    '#558B2F',
    skin:     '#FFCC99',
    shirt1:   '#E53935',
    shirt2:   '#1E88E5',
    shirt3:   '#43A047',
    shirt4:   '#8E24AA',
    pants:    '#37474F',
    marble:   '#F5F5F0',
};

// ─── PRIMITIVES ─────────────────────────────────────────────────────────────
const Box = ({ position, args, color, transparent = false, opacity = 1, metalness = 0, roughness = 0.6 }) => (
    <mesh position={position} castShadow receiveShadow>
        <boxGeometry args={args} />
        <meshStandardMaterial color={color} transparent={transparent} opacity={opacity} metalness={metalness} roughness={roughness} />
    </mesh>
);

const Cyl = ({ position, args, color, metalness = 0, roughness = 0.6, rotation = [0, 0, 0] }) => (
    <mesh position={position} rotation={rotation} castShadow>
        <cylinderGeometry args={args} />
        <meshStandardMaterial color={color} metalness={metalness} roughness={roughness} />
    </mesh>
);

// ─── PERSON ──────────────────────────────────────────────────────────────────
// LimbAnimator is a child that only mounts when walking=true, keeping useFrame valid
const LimbAnimator = ({ lLeg, rLeg, lArm, rArm, phase }) => {
    useFrame(({ clock }) => {
        const swing = Math.sin(clock.getElapsedTime() * 3 + phase) * 0.4;
        if (lLeg.current) lLeg.current.rotation.x =  swing;
        if (rLeg.current) rLeg.current.rotation.x = -swing;
        if (lArm.current) lArm.current.rotation.x = -swing * 0.5;
        if (rArm.current) rArm.current.rotation.x =  swing * 0.5;
    });
    return null;
};

const Person = ({ position = [0,0,0], rotation = [0,0,0], shirtColor = C.shirt1, walking = false, phase = 0 }) => {
    const lLeg = useRef(); const rLeg = useRef();
    const lArm = useRef(); const rArm = useRef();
    return (
        <group position={position} rotation={rotation}>
            {walking && <LimbAnimator lLeg={lLeg} rLeg={rLeg} lArm={lArm} rArm={rArm} phase={phase} />}
            <mesh position={[0, 1.75, 0]}>
                <sphereGeometry args={[0.18, 10, 10]} />
                <meshStandardMaterial color={C.skin} />
            </mesh>
            <Box position={[0, 1.25, 0]} args={[0.34, 0.5, 0.22]} color={shirtColor} />
            <group ref={lLeg} position={[-0.1, 0.85, 0]}>
                <Box position={[0, -0.25, 0]} args={[0.14, 0.5, 0.18]} color={C.pants} />
                <Box position={[0, -0.54, 0.05]} args={[0.14, 0.08, 0.22]} color="#222" />
            </group>
            <group ref={rLeg} position={[0.1, 0.85, 0]}>
                <Box position={[0, -0.25, 0]} args={[0.14, 0.5, 0.18]} color={C.pants} />
                <Box position={[0, -0.54, 0.05]} args={[0.14, 0.08, 0.22]} color="#222" />
            </group>
            <group ref={lArm} position={[-0.22, 1.25, 0]}>
                <Box position={[0, -0.18, 0]} args={[0.12, 0.36, 0.14]} color={shirtColor} />
            </group>
            <group ref={rArm} position={[0.22, 1.25, 0]}>
                <Box position={[0, -0.18, 0]} args={[0.12, 0.36, 0.14]} color={shirtColor} />
            </group>
        </group>
    );
};

// ─── WALKING PERSON ──────────────────────────────────────────────────────────
const WalkingPerson = ({ startX, startZ, endX, endZ, speed = 0.08, shirtColor = C.shirt1, phase = 0 }) => {
    const ref = useRef();
    useFrame(({ clock }) => {
        if (!ref.current) return;
        const t = (clock.getElapsedTime() * speed + phase) % 1;
        ref.current.position.x = startX + (endX - startX) * t;
        ref.current.position.z = startZ + (endZ - startZ) * t;
        ref.current.rotation.y = Math.atan2(endX - startX, endZ - startZ);
    });
    return (
        <group ref={ref}>
            <Person walking shirtColor={shirtColor} phase={phase * 10} />
        </group>
    );
};

// ─── STAIRCASE PERSON ────────────────────────────────────────────────────────
const StairPerson = ({ stairX, stairZ, shirtColor = C.shirt3, phase = 0 }) => {
    const ref = useRef();
    const steps = 6;
    useFrame(({ clock }) => {
        if (!ref.current) return;
        const t = (clock.getElapsedTime() * 0.12 + phase) % 1;
        const step = t * steps;
        ref.current.position.set(stairX, step * 0.25, stairZ - step * 0.3);
        ref.current.rotation.y = Math.PI;
    });
    return (
        <group ref={ref}>
            <Person walking shirtColor={shirtColor} phase={phase * 8} />
        </group>
    );
};

// ─── CHECK-IN DESK ───────────────────────────────────────────────────────────
const CheckInDesk = ({ position }) => (
    <group position={position}>
        <Box position={[0, 0.6, 0]}        args={[2.5, 1.0, 0.8]}  color={C.wood}   roughness={0.4} />
        <Box position={[0, 1.12, 0]}       args={[2.5, 0.12, 0.8]} color={C.gold}   metalness={0.6} roughness={0.2} />
        <Box position={[0.65, 1.25, -0.2]} args={[0.5, 0.35, 0.05]} color="#111" />
        <Box position={[0.65, 1.25, -0.22]} args={[0.45, 0.3, 0.01]} color="#29B6F6" metalness={0.1} roughness={0.1} />
        <Person position={[0, 0, -0.65]} rotation={[0, Math.PI, 0]} shirtColor="#FFFFFF" />
        <Person position={[0, 0,  0.65]} rotation={[0, 0, 0]}       shirtColor={C.shirt2} />
        <Box position={[0.5, 0.3,  0.9]} args={[0.35, 0.5, 0.25]} color="#795548" roughness={0.5} />
        <Box position={[0.5, 0.57, 0.9]} args={[0.35, 0.06, 0.25]} color={C.gold}  metalness={0.5} />
    </group>
);

// ─── TREE ────────────────────────────────────────────────────────────────────
const Tree = ({ position }) => (
    <group position={position}>
        <Cyl position={[0, 0.8, 0]} args={[0.12, 0.12, 1.6, 8]} color="#5D4037" />
        <mesh position={[0, 2.0, 0]}><sphereGeometry args={[0.8, 10, 10]} /><meshStandardMaterial color="#33691E" roughness={0.9} /></mesh>
        <mesh position={[0, 2.7, 0]}><sphereGeometry args={[0.55, 10, 10]} /><meshStandardMaterial color="#558B2F" roughness={0.9} /></mesh>
    </group>
);

// ─── STREET LIGHT ─────────────────────────────────────────────────────────────
const StreetLight = ({ position }) => (
    <group position={position}>
        <Cyl position={[0, 1.5, 0]}   args={[0.06, 0.06, 3, 8]}   color="#555" metalness={0.7} />
        <Cyl position={[0.4, 3.1, 0]} args={[0.04, 0.04, 0.8, 8]} color="#555" metalness={0.7} rotation={[0, 0, Math.PI / 2]} />
        <mesh position={[0.8, 3.1, 0]}>
            <sphereGeometry args={[0.15, 8, 8]} />
            <meshStandardMaterial color="#FFFFAA" emissive="#FFFF99" emissiveIntensity={2} />
        </mesh>
    </group>
);

// ─── FOUNTAIN ────────────────────────────────────────────────────────────────
const Fountain = ({ position }) => (
    <group position={position}>
        <mesh><cylinderGeometry args={[1.2, 1.4, 0.3, 24]} /><meshStandardMaterial color={C.marble} roughness={0.3} /></mesh>
        <mesh position={[0, 0.18, 0]}><cylinderGeometry args={[1.1, 1.1, 0.08, 24]} /><meshStandardMaterial color={C.water} transparent opacity={0.8} roughness={0.1} /></mesh>
        <Cyl position={[0, 0.7, 0]} args={[0.12, 0.12, 0.9, 12]} color={C.marble} roughness={0.3} />
        <mesh position={[0, 1.2, 0]}><sphereGeometry args={[0.22, 10, 10]} /><meshStandardMaterial color={C.gold} metalness={0.8} roughness={0.2} /></mesh>
    </group>
);

// ─── STAIRCASE ───────────────────────────────────────────────────────────────
const Staircase = ({ position, steps = 6 }) => (
    <group position={position}>
        {[...Array(steps)].map((_, i) => (
            <Box key={i} position={[0, i * 0.25 + 0.125, -(i * 0.3)]} args={[4, 0.25, 0.3]} color={C.marble} roughness={0.3} />
        ))}
        {[-1.9, 1.9].map((x) => (
            <group key={x}>
                <Cyl position={[x, steps * 0.25 * 0.5, -(steps * 0.15 - 0.15)]}
                    args={[0.05, 0.05, steps * 0.4, 8]}
                    color={C.gold} metalness={0.8} roughness={0.2}
                    rotation={[0.4, 0, 0]}
                />
            </group>
        ))}
    </group>
);

// ─── HIGHWAY TRAFFIC ─────────────────────────────────────────────────────────
const Wheel = ({ position }) => (
    <mesh position={position} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 0.2, 16]} />
        <meshStandardMaterial color="#111" />
    </mesh>
);
const SimpleCar = ({ color }) => (
    <group>
        <Box position={[0, 0.4, 0]}  args={[3.5, 0.6, 1.6]} color={color} />
        <Box position={[-0.2, 1, 0]} args={[2, 0.7, 1.5]}   color="#222" />
        <Wheel position={[-1.2, 0.3,  0.8]} /><Wheel position={[1.2, 0.3,  0.8]} />
        <Wheel position={[-1.2, 0.3, -0.8]} /><Wheel position={[1.2, 0.3, -0.8]} />
    </group>
);
const Traffic = () => {
    const car1 = useRef(); const car2 = useRef();
    useFrame(({ clock }) => {
        const t = clock.getElapsedTime();
        if (car1.current) car1.current.position.x = ((t * 10) % 100) - 50;
        if (car2.current) car2.current.position.x = -(((t * 8) % 100) - 50);
    });
    return (
        <group position={[0, 0.1, 0]}>
            <group ref={car1} position={[0, 0,  2]}><SimpleCar color="#ef5350" /></group>
            <group ref={car2} position={[0, 0, -2]} rotation={[0, Math.PI, 0]}><SimpleCar color="#fff" /></group>
        </group>
    );
};
const Highway = () => (
    <group position={[0, 0, 15]}>
        <Box position={[0, -0.1, 0]} args={[150, 0.2, 10]} color={C.asphalt} />
        {[...Array(20)].map((_, i) => (
            <Box key={i} position={[i * 10 - 100, 0.02, 0]} args={[4, 0.1, 0.2]} color={C.gold} />
        ))}
        <Traffic />
    </group>
);

// ─── LUXURY RESORT ───────────────────────────────────────────────────────────
const LuxuryResort = () => (
    <group position={[0, 0, -5]}>

        {/* POOL DECK */}
        <group position={[0, 0.1, 7]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.08, 0]}>
                <planeGeometry args={[14, 5]} />
                <meshStandardMaterial color={C.water} roughness={0.05} metalness={0.15} transparent opacity={0.9} />
            </mesh>
            <Box position={[0, 0.02, 0]} args={[16, 0.12, 7]} color={C.marble} roughness={0.2} />
            {[-7, 7].map((x, i) => <Box key={i} position={[x, 0.1, 0]} args={[0.2, 0.2, 7]} color="#E1F5FE" roughness={0.3} />)}
            {[-3.3, 3.3].map((z, i) => <Box key={i} position={[0, 0.1, z]} args={[14.4, 0.2, 0.2]} color="#E1F5FE" roughness={0.3} />)}
            {[-4, 0, 4].map((x, i) => (
                <group key={i} position={[x, 0.22, 3]}>
                    <Box position={[0, 0, 0]}    args={[1.8, 0.12, 0.6]} color="#FFF9C4" roughness={0.5} />
                    <Box position={[0.7, 0.1, 0]} args={[0.4, 0.1, 0.55]} color="#FFF9C4" roughness={0.5} />
                </group>
            ))}
            <group position={[0, 0.22, 3]}>
                <Cyl position={[0, 0.9, 0]} args={[0.04, 0.04, 1.5, 8]} color="#E57373" />
                <mesh position={[0, 1.7, 0]}>
                    <coneGeometry args={[1.1, 0.4, 12]} />
                    <meshStandardMaterial color="#EF9A9A" roughness={0.7} />
                </mesh>
            </group>
        </group>

        {/* MAIN BUILDING */}
        <group position={[0, 0, -2]}>
            {/* Lobby */}
            <Box position={[0, 2, 0]} args={[18, 4, 9]} color={C.concrete} roughness={0.4} />
            <mesh position={[0, 2.2, 4.55]}>
                <planeGeometry args={[16, 4]} />
                <meshStandardMaterial color={C.glass} transparent opacity={0.55} metalness={0.1} roughness={0.0} />
            </mesh>
            {[-8, -5.3, -2.6, 0, 2.6, 5.3, 8].map((x, i) => (
                <Cyl key={i} position={[x, 2.2, 4.6]} args={[0.22, 0.22, 4.4, 12]} color={C.marble} roughness={0.3} />
            ))}
            {[-8, -5.3, -2.6, 0, 2.6, 5.3, 8].map((x, i) => (
                <Box key={i} position={[x, 4.5, 4.6]} args={[0.5, 0.2, 0.5]} color={C.gold} metalness={0.6} roughness={0.2} />
            ))}

            {/* Check-in desk */}
            <CheckInDesk position={[0, 0.02, 1.5]} />

            {/* Entrance arch */}
            <group position={[0, 0, 4.7]}>
                <Box position={[-2.5, 1.5, 0]} args={[0.4, 3, 0.3]}   color={C.marble} roughness={0.3} />
                <Box position={[ 2.5, 1.5, 0]} args={[0.4, 3, 0.3]}   color={C.marble} roughness={0.3} />
                <Box position={[0, 3.1, 0]}    args={[5.4, 0.4, 0.3]} color={C.marble} roughness={0.3} />
                <Box position={[0, 3.0, 0.16]} args={[4.8, 0.15, 0.06]} color={C.gold} metalness={0.7} roughness={0.15} />
                <mesh position={[-0.7, 1.5, 0.02]}>
                    <boxGeometry args={[1.1, 2.8, 0.06]} />
                    <meshStandardMaterial color={C.glass} transparent opacity={0.45} />
                </mesh>
                <mesh position={[0.7, 1.5, 0.02]}>
                    <boxGeometry args={[1.1, 2.8, 0.06]} />
                    <meshStandardMaterial color={C.glass} transparent opacity={0.45} />
                </mesh>
            </group>

            {/* Staircases */}
            <Staircase position={[-6, 0.02, 3.5]} steps={6} />
            <Staircase position={[ 6, 0.02, 3.5]} steps={6} />

            {/* Floor 2 – rooms */}
            <group position={[0, 4.2, 0.5]}>
                <Box position={[0, 0, 0]} args={[19, 0.4, 10]} color="#2A2A2A" />
                {[-5.5, 0, 5.5].map((x, i) => (
                    <group key={i} position={[x, 1.8, 0]}>
                        <Box position={[0, 0, 0]} args={[4.5, 3.2, 7]} color="#F5F5F5" roughness={0.35} />
                        {[-0.9, 0.9].map((wx) => [-0.7, 0.7].map((wz) => (
                            <mesh key={`${wx}_${wz}`} position={[wx, 0, 3.55]}>
                                <boxGeometry args={[1.0, 1.1, 0.06]} />
                                <meshStandardMaterial color={C.glass} transparent opacity={0.55} />
                            </mesh>
                        )))}
                        <Box position={[0, -1.3, 3.9]} args={[4.5, 0.12, 0.8]} color={C.marble} roughness={0.3} />
                        <mesh position={[0, -0.9, 4.05]}>
                            <boxGeometry args={[4.2, 0.7, 0.05]} />
                            <meshStandardMaterial color={C.glass} transparent opacity={0.4} />
                        </mesh>
                        {[-1.9, -0.6, 0.6, 1.9].map((px) => (
                            <Cyl key={px} position={[px, -0.85, 4.05]} args={[0.04, 0.04, 0.75, 6]} color={C.gold} metalness={0.8} roughness={0.2} />
                        ))}
                        <Box position={[-2.3, 0, 3.4]} args={[0.18, 3.2, 0.18]} color={C.wood} roughness={0.5} />
                        <Box position={[ 2.3, 0, 3.4]} args={[0.18, 3.2, 0.18]} color={C.wood} roughness={0.5} />
                        <Box position={[0, 1.1, -3.55]} args={[1.2, 0.6, 0.2]} color="#BDBDBD" roughness={0.5} />
                    </group>
                ))}
            </group>

            {/* Floor 3 – Rooftop lounge */}
            <group position={[0, 8, 0]}>
                <Box position={[0, 0, 1]} args={[20, 0.4, 11]} color="#1A1A1A" />
                {/* Perimeter gold rail */}
                <Box position={[0,    0.3,  5.6]}  args={[20, 0.35, 0.15]} color={C.gold} metalness={0.7} roughness={0.2} />
                <Box position={[0,    0.3, -3.6]}  args={[20, 0.35, 0.15]} color={C.gold} metalness={0.7} roughness={0.2} />
                <Box position={[-9.9, 0.3,  1]}    args={[0.15, 0.35, 9]}  color={C.gold} metalness={0.7} roughness={0.2} />
                <Box position={[ 9.9, 0.3,  1]}    args={[0.15, 0.35, 9]}  color={C.gold} metalness={0.7} roughness={0.2} />
                {/* Columns */}
                {[-7, -3.5, 0, 3.5, 7].map((x) => (
                    <Cyl key={x} position={[x, 1.5, 4.5]} args={[0.22, 0.22, 3, 12]} color={C.gold} metalness={0.8} roughness={0.2} />
                ))}
                {/* Roof */}
                <Box position={[0, 3.2, 1]} args={[21, 0.2, 13]} color="#FFFFFF" roughness={0.3} />
                <Box position={[0, 3.32, 1]} args={[21.2, 0.12, 0.15]} color={C.gold} metalness={0.7} roughness={0.2} />
                {/* Bar */}
                <Box position={[-5, 0.65, 0]} args={[3, 1.0, 0.7]} color={C.wood} roughness={0.4} />
                <Box position={[-5, 1.22, 0]} args={[3, 0.1, 0.7]} color={C.gold} metalness={0.5} roughness={0.2} />
                {[-6, -5, -4].map((x, i) => (
                    <group key={i} position={[x, 0, 1]}>
                        <Cyl position={[0, 0.5, 0]}  args={[0.06, 0.06, 1, 8]}   color="#777" metalness={0.6} />
                        <Cyl position={[0, 1.05, 0]} args={[0.28, 0.28, 0.1, 12]} color="#333" roughness={0.5} />
                    </group>
                ))}
                {/* Lounge chairs */}
                {[2, 4, 6].map((x, i) => (
                    <group key={i} position={[x, 0.45, 4.2]}>
                        <Box position={[0, 0, 0]}       args={[0.9, 0.12, 0.6]}  color="#FFF9C4" roughness={0.5} />
                        <Box position={[0.35, 0.2, 0]}  args={[0.2, 0.4, 0.55]} color="#FFF9C4" roughness={0.5} />
                    </group>
                ))}
                {/* Floating sign */}
                <Float speed={2} rotationIntensity={0.05} floatIntensity={0.15} position={[0, 4.7, 4.6]}>
                    <Text fontSize={1.45} color={C.gold} anchorX="center" anchorY="middle">DAULAT RESORT</Text>
                </Float>
                <Float speed={1.5} floatIntensity={0.1} position={[0, 3.6, 4.6]}>
                    <Text fontSize={0.45} color="#FFFFFF" anchorX="center" anchorY="middle">✦  LUXURY ABOVE THE CLOUDS  ✦</Text>
                </Float>
            </group>

            {/* Side wings */}
            <Box position={[-10, 3, 0]} args={[2, 6, 9]} color="#EEEEEE" roughness={0.4} />
            <Box position={[ 10, 3, 0]} args={[2, 6, 9]} color="#EEEEEE" roughness={0.4} />
            {[-1.5, 0, 1.5].map((z) => [1.5, 4].map((y) => (
                <mesh key={`L${z}_${y}`} position={[-11.05, y, z]}>
                    <boxGeometry args={[0.06, 0.9, 0.7]} />
                    <meshStandardMaterial color={C.glass} transparent opacity={0.6} />
                </mesh>
            )))}
            {[-1.5, 0, 1.5].map((z) => [1.5, 4].map((y) => (
                <mesh key={`R${z}_${y}`} position={[11.05, y, z]}>
                    <boxGeometry args={[0.06, 0.9, 0.7]} />
                    <meshStandardMaterial color={C.glass} transparent opacity={0.6} />
                </mesh>
            )))}
        </group>

        {/* GARDEN */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.08, 5]}>
            <planeGeometry args={[6, 4]} />
            <meshStandardMaterial color={C.marble} roughness={0.5} />
        </mesh>
        <Fountain position={[0, 0.12, 5]} />
        {[-8, -6, 6, 8].map((x, i) => <Tree key={i}        position={[x, 0,  8]} />)}
        {[-8, -6, 6, 8].map((x, i) => <Tree key={`b_${i}`} position={[x, 0, -1]} />)}
        {[-4, 4].map((x, i) => <StreetLight key={i} position={[x, 0, 4]} />)}
    </group>
);

// ─── REALISTIC MOUNTAIN TERRAIN ──────────────────────────────────────────────
// PlaneGeometry lies in XY by default — rotate -90° on X to make it horizontal
const TerrainMesh = ({ position, width = 200, depth = 80, color, roughness = 0.9, segments = 40, amplitude = 1, seed = 0 }) => {
    const geo = useMemo(() => {
        const g = new THREE.PlaneGeometry(width, depth, segments, segments);
        const pos = g.attributes.position;
        for (let i = 0; i < pos.count; i++) {
            const x = pos.getX(i) / width;   // normalise to 0..1
            const y = pos.getY(i) / depth;
            // multi-octave sine noise
            const h =
                Math.sin((x + seed) * 6.0)  * 0.30 +
                Math.sin((y + seed) * 5.0)  * 0.28 +
                Math.sin((x * 3 + y * 2 + seed) * 9.0) * 0.18 +
                Math.cos((x * 2 - y * 3 + seed) * 7.0) * 0.14 +
                Math.sin((x + y + seed) * 4.0) * 0.10;
            pos.setZ(i, h * amplitude);
        }
        g.computeVertexNormals();
        return g;
    }, [width, depth, segments, amplitude, seed]);

    return (
        // rotate -90° on X so the plane lies flat (horizontal)
        <mesh geometry={geo} position={position} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <meshStandardMaterial color={color} roughness={roughness} />
        </mesh>
    );
};

// A mountain peak — cone + optional snow cap, no scale prop confusion
const Peak = ({ position, rX = 1, rZ = 1, height = 2.2, color, snowCap = false }) => (
    <group position={position}>
        <mesh scale={[rX, height, rZ]}>
            <coneGeometry args={[1, 1, 20, 1]} />
            <meshStandardMaterial color={color} roughness={0.92} />
        </mesh>
        {snowCap && (
            <mesh position={[0, height * 0.42, 0]} scale={[rX * 0.38, height * 0.28, rZ * 0.38]}>
                <coneGeometry args={[1, 1, 14, 1]} />
                <meshStandardMaterial color="#EEF2FF" roughness={0.5} />
            </mesh>
        )}
    </group>
);

// Full layered mountain landscape — visible from camera at [0,12,38]
const Hills = () => (
    // Scene parent already has y=-2; this group is at world level
    <group>

        {/* ── Layer 1: Continuous ground terrain rolling away from resort ── */}
        <TerrainMesh
            position={[0, 0, -18]}
            width={220} depth={50}
            color="#7CB342"
            segments={48} amplitude={3.5} seed={2.1}
        />

        {/* ── Layer 2: Mid green forested foothills ── */}
        <TerrainMesh
            position={[0, 2, -38]}
            width={240} depth={40}
            color="#558B2F"
            segments={44} amplitude={5} seed={4.7}
        />
        {/* Green hill peaks sitting on top of terrain */}
        <Peak position={[-30, 6, -38]} rX={10} rZ={9}  height={12} color="#388E3C" />
        <Peak position={[-12, 5, -42]} rX={12} rZ={10} height={10} color="#43A047" />
        <Peak position={[  4, 7, -36]} rX={14} rZ={11} height={14} color="#2E7D32" />
        <Peak position={[ 20, 5, -40]} rX={11} rZ={9}  height={11} color="#388E3C" />
        <Peak position={[ 38, 6, -37]} rX={10} rZ={8}  height={10} color="#43A047" />
        <Peak position={[-48, 4, -35]} rX={9}  rZ={8}  height={8}  color="#558B2F" />
        <Peak position={[ 50, 4, -35]} rX={9}  rZ={8}  height={8}  color="#558B2F" />

        {/* ── Layer 3: Rocky brown mid-ridges ── */}
        <TerrainMesh
            position={[0, 8, -58]}
            width={260} depth={35}
            color="#6D4C41"
            segments={40} amplitude={7} seed={1.5}
        />
        <Peak position={[-40, 14, -60]} rX={13} rZ={10} height={18} color="#5D4037" />
        <Peak position={[-18, 16, -58]} rX={15} rZ={12} height={22} color="#4E342E" />
        <Peak position={[  5, 18, -56]} rX={16} rZ={13} height={26} color="#3E2723" />
        <Peak position={[ 28, 15, -60]} rX={14} rZ={11} height={20} color="#5D4037" />
        <Peak position={[ 48, 13, -58]} rX={12} rZ={10} height={17} color="#6D4C41" />
        <Peak position={[-55, 12, -62]} rX={11} rZ={9}  height={14} color="#795548" />
        <Peak position={[ 58, 12, -62]} rX={11} rZ={9}  height={14} color="#795548" />

        {/* ── Layer 4: Distant snow-capped peaks — tall enough to show above horizon ── */}
        <Peak position={[-42,  2, -80]} rX={16} rZ={12} height={38} color="#546E7A" snowCap />
        <Peak position={[-18,  2, -85]} rX={20} rZ={15} height={46} color="#455A64" snowCap />
        <Peak position={[  5,  2, -82]} rX={22} rZ={16} height={52} color="#37474F" snowCap />
        <Peak position={[ 28,  2, -84]} rX={18} rZ={14} height={42} color="#455A64" snowCap />
        <Peak position={[ 52,  2, -80]} rX={15} rZ={12} height={36} color="#546E7A" snowCap />
        <Peak position={[-62,  2, -76]} rX={13} rZ={10} height={30} color="#607D8B" snowCap />
        <Peak position={[ 65,  2, -76]} rX={13} rZ={10} height={30} color="#607D8B" snowCap />
        {/* Fill between large peaks */}
        <Peak position={[-30,  2, -82]} rX={14} rZ={11} height={28} color="#607D8B" />
        <Peak position={[ 16,  2, -86]} rX={15} rZ={12} height={32} color="#546E7A" />
    </group>
);

// ─── FULL SCENE ──────────────────────────────────────────────────────────────
const Scene = () => (
    <group position={[0, -2, 0]}>
        {/* Base ground */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
            <planeGeometry args={[250, 250]} />
            <meshStandardMaterial color={C.grass} />
        </mesh>
        {/* Garden lawn */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, -2]}>
            <planeGeometry args={[24, 18]} />
            <meshStandardMaterial color="#7CB342" />
        </mesh>

        <LuxuryResort />
        <Highway />
        <Hills />

        {/* Driveway */}
        <Box position={[0, 0.05, 7]}   args={[8, 0.1, 18]} color="#888" roughness={0.8} />
        <Box position={[-4.1, 0.1, 7]} args={[0.2, 0.12, 18]} color={C.marble} />
        <Box position={[ 4.1, 0.1, 7]} args={[0.2, 0.12, 18]} color={C.marble} />

        {/* Walking people */}
        <WalkingPerson startX={-3} startZ={12} endX={-1} endZ={4} speed={0.06} shirtColor={C.shirt1} phase={0.0} />
        <WalkingPerson startX={-2} startZ={12} endX={ 1} endZ={4} speed={0.05} shirtColor={C.shirt4} phase={0.5} />
        <WalkingPerson startX={-7} startZ={ 3} endX={ 7} endZ={3} speed={0.04} shirtColor={C.shirt3} phase={0.2} />
        <WalkingPerson startX={ 3} startZ={14} endX={ 3} endZ={6} speed={0.07} shirtColor={C.shirt2} phase={0.7} />

        {/* Staircase people */}
        <StairPerson stairX={-6} stairZ={1} shirtColor={C.shirt2} phase={0.0} />
        <StairPerson stairX={ 6} stairZ={1} shirtColor={C.shirt4} phase={0.5} />

        {/* Standing guests */}
        <Person position={[-5, 0.12,  3]} rotation={[0,  0.8, 0]} shirtColor="#FF7043" />
        <Person position={[ 5, 0.12,  3]} rotation={[0, -1.2, 0]} shirtColor="#26C6DA" />
        <Person position={[ 2, 0.12, 10]} rotation={[0, Math.PI, 0]} shirtColor="#AB47BC" />
    </group>
);

// ─── HOME PAGE ───────────────────────────────────────────────────────────────
export default function Home() {
    return (
        <div className="w-full h-screen bg-slate-900 overflow-hidden relative">
            <Canvas shadows camera={{ position: [0, 12, 38], fov: 45 }}>
                <ambientLight intensity={0.6} />
                <directionalLight position={[-10, 25, 10]} intensity={1.8} castShadow
                    shadow-mapSize-width={2048} shadow-mapSize-height={2048} />
                <pointLight position={[0, 12, -5]} intensity={0.8} color="#FFF9C4" />
                <Sky sunPosition={[100, 20, 100]} />

                <Scene />

                <OrbitControls
                    enableZoom={true}
                    maxPolarAngle={Math.PI / 2.1}
                    minPolarAngle={Math.PI / 8}
                    target={[0, 2, 0]}
                />
            </Canvas>

            <div className="absolute inset-x-0 bottom-24 flex flex-col items-center pointer-events-none z-10">
                <h1 className="text-6xl md:text-8xl font-serif font-bold text-white drop-shadow-2xl mb-2 text-center">
                    DAULAT <span className="text-resort-gold">RESORT</span>
                </h1>
                <p className="text-white/80 text-xl font-light mb-8">Luxury Above The Clouds</p>
                <Link to="/booking" className="pointer-events-auto px-10 py-4 bg-resort-gold text-white rounded-full font-bold shadow-xl hover:bg-white hover:text-black transition">
                    Book Your Stay
                </Link>
            </div>

            <div className="absolute bottom-0 w-full text-center text-white/30 text-xs py-2 bg-black/50">
                &copy; 2026 DAULAT RESORT.
            </div>
        </div>
    );
}
