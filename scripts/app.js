var camera, scene, renderer, controls, clock, material, delta, guiControl;
var particleSystem;
var particleSize = 2.0;

function setup() {
	document.body.style.backgroundColor = '#d7f0f7';
	document.onselectstart = function() { return false; }
	setupThreeJS();
	setupWorld();
	
	clock = new THREE.Clock();
	
	requestAnimationFrame(function animate() {
		renderer.render(scene, camera);
		
		delta = clock.getDelta();
		controls.update(delta); // Allows camera to move when each frame is rendered
		particleSystem.material.uniforms.pointSize.value = guiControl.particleSize;
		particleSystem.material.uniforms.needsUpdate = true;
		animateParticles();
		
		requestAnimationFrame(animate);
	});
}


function setupThreeJS() {
	scene = new THREE.Scene();
	
	camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
	camera.position.y = 400;
	camera.position.z = 400;
	camera.rotation.x = -45 * Math.PI / 180;
	
	renderer = new THREE.WebGLRenderer({antialias: true});
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.shadowMapEnabled = true;
	renderer.shadowMapSoft = true;
	
	document.body.appendChild(renderer.domElement);
	
	controls = new THREE.OrbitControls(camera);
	
	guiControl = new function() {
		this.speed = 100;
		this.rotationSpeed = .1;
		this.rainHeight = 400;
		this.spinY = false;
		this.particleSize = 2.0;
	}
	
	var gui = new dat.GUI();
	gui.add(guiControl, 'speed', 0, 1000);
	gui.add(guiControl, 'rotationSpeed', 0, 3.14);
	gui.add(guiControl, 'rainHeight', 0, 1000);
	gui.add(guiControl, 'particleSize', 0, 10.0);
	gui.add(guiControl, 'spinY');
	
}


function setupWorld() {
	/*
	// Floor
	var floorGeo = new THREE.PlaneGeometry(2000, 2000, 20, 20);
	var floorMat = new THREE.MeshPhongMaterial({color: 0x9db2FF, overdraw: true});
	var floor = new THREE.Mesh(floorGeo, floorMat);
	floor.rotation.x = -90 * Math.PI / 180;
	floor.receiveShadow = true;
	scene.add(floor);
	*/
	// Add light to the scene
	var light = new THREE.DirectionalLight(0xf6e86d, 1);
	light.position.set(500, 1500, 1000);
	light.castShadow = true;
	light.shadowDarkness = 0.5;
	light.shadowMapWdith = 2048;
	light.shadowMapHeight = 2048;
	light.shadowCameraFar = 2500;
	
	light.shadowCameraLeft = -1000;
	light.shadowCameraRight = 1000;
	light.shadowCameraTop = 1000;
	light.shadowCameraBottom = -1000;
	
	scene.add(light);
	
	// Uniforms to be passed into the shaders
	uniforms = {
		time: { type: "f", value: delta },
		pointSize: { type: "f", value: particleSize}
	};
	
	//var vertexDisplacement = new Float32Array(geometry.attributes.position.count);
	material = new THREE.ShaderMaterial({
		uniforms: uniforms,
		
		vertexShader: document.getElementById('vertexShader').textContent,
		fragmentShader: document.getElementById('fragmentShader').textContent
	});
	
	particleSystem = createParticleSystem();
	scene.add(particleSystem);
}

function createParticleSystem() {
	
	// The number of particles in a particle system is not easily changed.
	var particleCount = 2000;
	
	// Particles are just individual vertices in a geometry
	// Create the geometry that will hold all of the vertices
	var particles = new THREE.Geometry();
	
	// Create the vertices and add them to the particles geoemtry
	for (var p = 0; p < particleCount; p++) {
		
		// This will create all the vertices in the range -200 to 200 in all directions
		var x = Math.random() * 400 - 200;
		var y = Math.random() * 400 - 200;
		var z = Math.random() * 400 - 200;
		
		// Create the vertex
		var particle = new THREE.Vector3(x, y, z);
		
		particles.vertices.push(particle);
	}
	
	// Create the particle system
	particleSystem = new THREE.Points(particles, material);
	
	return particleSystem;
}

function animateParticles() {
	var verts = particleSystem.geometry.vertices;
	
	// Iterate over all vertices contained in the geometry of the particle system and adjust
	// the vertical positon of each one ot give the effect that the particles are falling
	for (var i = 0; i < verts.length; i++) {
		var vert = verts[i];
		
		// If verticle position of particle falls below -200,
		// we reset its position to a random verticle position.
		if (vert.y < -200) {
			vert.y = Math.random() * guiControl.rainHeight - 200;
		}
		
		// Decrease the verticle position by 10 * delta.
		// We want the particle to fall at a rate of 10 units per second regardless of frame rate.
		vert.y = vert.y - (guiControl.speed * delta);
	}
	
	// Tell Three.js that the vertices of the geometry have changed and needs to be refreshed before
	// rendering next frame.
	particleSystem.geometry.verticesNeedUpdate = true;
	
	// Modfiyng the rotation around y-axis of entire particle system.
	// The .1 is the # of degrees in radians
	if(guiControl.spinY){
		particleSystem.rotation.y -= guiControl.rotationSpeed * delta;
	} else {
		particleSystem.rotation.y += guiControl.rotationSpeed * delta;
	}
}

$(document).ready(function(){
	setup();
})