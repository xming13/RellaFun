var XMing = XMing || {};

XMing.rella = function() {
    var stats,
        scene,
        renderer,
        camera,
        cameraControls,
        clock = new THREE.Clock(),
        soundRain,
        soundSunny,
        hemiLight,
        dirLight,
        ground,
        group,
        engine,
        rellaBoxSize = 20,
        rellaImage,
        isFileDropVisible = false,
        isRainModeOn = true,
        isRotateModeOn = true,
        isSoundRainPlayed = false,
        isSoundSunnyPlayed = false,
        isSoundModeOn = true;

    var cameraView = {
        Top: true,
        Front: false,
        Birdeye: false,
        Bottom: false
    };
    var callbacks = {
        rotateModeOn: function() {
            isRotateModeOn = true;
            $(this).removeClass('disabled');
            $(this).siblings('a').addClass('disabled');
        },
        rotateModeOff: function() {
            isRotateModeOn = false;
            $(this).removeClass('disabled');
            $(this).siblings('a').addClass('disabled');
        },
        rainModeOn: function() {
            isRainModeOn = true;
            dirLight.intensity = 0;
            engine.destroy();
            engine = new ParticleEngine();
            engine.setValues(Examples.rain);
            engine.initialize();
            $(this).removeClass('disabled');
            $(this).siblings('a').addClass('disabled');
            if (isSoundSunnyPlayed) {
                soundSunny.stop();
            }
            soundRain.play();
        },
        rainModeOff: function() {
            isRainModeOn = false;
            dirLight.intensity = 1;
            engine.destroy();
            $(this).removeClass('disabled');
            $(this).siblings('a').addClass('disabled');
            if (isSoundRainPlayed) {
                soundRain.stop();
            }
            soundSunny.play();
        },
        soundModeOn: function() {
            isSoundModeOn = true;
            Howler.unmute();
            $(this).removeClass('disabled');
            $(this).siblings('a').addClass('disabled');
        },
        soundModeOff: function() {
            isSoundModeOn = false;
            Howler.mute();
            $(this).removeClass('disabled');
            $(this).siblings('a').addClass('disabled');
        },
        cameraViewTop: function() {
            cameraView.Top = true;
            cameraView.Front = false;
            cameraView.Birdeye = false;
            cameraView.Bottom = false;
            camera.position.set(0, 150, 0);
            group.position.set(0, 0, 0);
            $(this).removeClass('disabled');
            $(this).siblings('a').addClass('disabled');
        },
        cameraViewFront: function() {
            cameraView.Top = false;
            cameraView.Front = true;
            cameraView.Birdeye = false;
            cameraView.Bottom = false;
            camera.position.set(0, 0, 120);
            group.position.set(0, 0, 0);
            $(this).removeClass('disabled');
            $(this).siblings('a').addClass('disabled');
        },
        cameraViewBirdeye: function() {
            cameraView.Top = false;
            cameraView.Front = false;
            cameraView.Birdeye = true;
            cameraView.Bottom = false;
            camera.position.set(90, 70, 120);
            group.position.set(0, 0, 0);
            $(this).removeClass('disabled');
            $(this).siblings('a').addClass('disabled');
        },
        cameraViewBottom: function() {
            cameraView.Top = false;
            cameraView.Front = false;
            cameraView.Birdeye = false;
            cameraView.Bottom = true;
            camera.position.set(0, -200, 0);
            group.position.set(0, 0, 0);
            $(this).removeClass('disabled');
            $(this).siblings('a').addClass('disabled');
        },
        showHideFileDrop: function() {
            if (isFileDropVisible) {
                hideFileDrop();
            } else {
                showFileDrop();
            }
            isFileDropVisible = !isFileDropVisible;
        },
        onKeyDown: function(event) {
            switch (event.which) {
                // UP
                case 38:
                    camera.position.y += 1;
                    break;
                    // DOWN
                case 40:
                    camera.position.y -= 1;
                    break;
                    // LEFT
                case 37:
                    camera.position.x += 1;
                    break;
                    // RIGHT
                case 39:
                    camera.position.x -= 1;
                    break;
                    // SPACE
                case 32:
                    callbacks.showHideFileDrop();
                    break;
                default:
                    break;
            }
            switch (String.fromCharCode(event.which)) {
                case 'W':
                    group.position.z += 1;
                    break;
                case 'S':
                    group.position.z -= 1;
                    break;
                case 'A':
                    group.position.x += 1;
                    break;
                case 'D':
                    group.position.x -= 1;
                    break;
                case 'Q':
                    group.position.y += 1;
                    break;
                case 'E':
                    group.position.y -= 1;
                    break;
                case 'Z':
                    camera.position.z += 1;
                    break;
                case 'X':
                    camera.position.z -= 1;
                    break;
                case 'T':
                    if (isRotateModeOn) {
                        $('#rotate-mode-off').click();
                    } else {
                        $('#rotate-mode-on').click();
                    }
                    break;
                case 'R':
                    if (isRainModeOn) {
                        $('#rain-mode-off').click();
                    } else {
                        $('#rain-mode-on').click();
                    }
                    break;
                case 'G':
                    if (isSoundModeOn) {
                        $('#sound-mode-off').click();
                    } else {
                        $('#sound-mode-on').click();
                    }
                    break;
                case 'C':
                    rellaBoxSize += 1;
                    reloadRella();
                    break;
                case 'V':
                    if (rellaBoxSize > 0) {
                        rellaBoxSize -= 1;
                        reloadRella();
                    }
                    break;
                case '1':
                    $('#camera-view-top').click();
                    break;
                case '2':
                    $('#camera-view-front').click();
                    break;
                case '3':
                    $('#camera-view-birdeye').click();
                    break;
                case '4':
                    $('#camera-view-bottom').click();
                    break;
                default:
                    break;
            }
        },
        windowResize: function() {
            var width = isFileDropVisible ? window.innerWidth - 300 : window.innerWidth;
            var height = window.innerHeight;
            camera.aspect = width / height;
            renderer.setSize(width, height);
            camera.updateProjectionMatrix();
        },
        dropFile: function(event) {
            event.stopPropagation();
            event.preventDefault();

            // query what was dropped
            var files = event.dataTransfer.files;

            // if we have something
            if (files.length) {
                handleFile(files[0]);
            }
        },
        fileUploaded: function(event) {
            if (event.target.result.match(/^data:image/)) {
                rellaImage.push(event.target.result);
                reloadRella();
            } else {
                alert("Umm, images only? ... Yeah");
            }
        },
        cancel: function(event) {
            if (event.preventDefault)
                event.preventDefault();
        }
    };

    // init the scene
    function init() {

        // SOUND
        soundRain = new Howl({
            urls: ['audio/rain.mp3'],
            loop: true,
            onplay: function() {
                isSoundRainPlayed = true;
            }
        });
        soundSunny = new Howl({
            urls: ['audio/sunny.mp3'],
            loop: true,
            onplay: function() {
                isSoundSunnyPlayed = true;
            }
        });

        // SCENE
        scene = new THREE.Scene();
        // add to the global variable to be accessed by ParticleEngine.js
        window.scene = scene;

        // CAMERA
        camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
        camera.up = new THREE.Vector3(0, 1, 0);
        camera.position.set(0, 150, 0);
        camera.lookAt(scene.position);

        scene.add(camera);

        if (Detector.webgl) {
            renderer = new THREE.WebGLRenderer({
                antialias: true, // to get smoother output
                preserveDrawingBuffer: true // to allow screenshot
            });
            // uncomment if webgl is required
            //}else{
            //	Detector.addGetWebGLMessage();
            //	return true;
        } else {
            renderer = new THREE.CanvasRenderer();
        }
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.getElementById('container').appendChild(renderer.domElement);

        renderer.setClearColor(0xBBBBBB, 1);
        renderer.shadowMapEnabled = true;
        renderer.shadowMapSoft = true;
        renderer.shadowMapCullFace = THREE.CullFaceBack;
        // renderer.shadowMapBias = 0.0039;
        // renderer.shadowMapDarkness = 0.5;
        // renderer.shadowMapWidth = 1024;
        // renderer.shadowMapHeight = 1024;

        // renderer.shadowCameraNear = 3;
        // renderer.shadowCameraFar = camera.far;
        // renderer.shadowCameraFov = 50;

        // renderer.gammaInput = true;
        // renderer.gammaOutput = true;
        // renderer.physicallyBasedShading = true;

        // create a camera contol
        cameraControls = new THREE.OrbitControls(camera, renderer.domElement);

        // add Stats.js - https://github.com/mrdoob/stats.js
        // stats = new Stats();
        // stats.domElement.style.position	= 'absolute';
        // stats.domElement.style.bottom	= '0px';
        // document.body.appendChild( stats.domElement );

        // allow 'p' to make screenshot
        THREEx.Screenshot.bindKey(renderer);
        // allow 'f' to go fullscreen where this feature is supported
        if (THREEx.FullScreen.available()) {
            THREEx.FullScreen.bindKey();
            document.getElementById('controls').innerHTML += "<br/> - <i>f</i> for fullscreen";
        }

        // LIGHT
        hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.6);
        hemiLight.color.setHSL(0.6, 1, 0.6);
        hemiLight.groundColor.setHSL(0.095, 1, 0.75);
        hemiLight.position.set(0, 500, 0);
        scene.add(hemiLight);

        dirLight = new THREE.DirectionalLight(0xffffff, 1);
        dirLight.color.setHSL(0.1, 1, 0.95);
        dirLight.position.set(0, 2, 0);
        dirLight.position.multiplyScalar(50);
        scene.add(dirLight);

        dirLight.castShadow = true;

        var d = 100;

        dirLight.shadowCameraLeft = -d;
        dirLight.shadowCameraRight = d;
        dirLight.shadowCameraTop = d;
        dirLight.shadowCameraBottom = -d;

        dirLight.shadowCameraFar = 3500;
        dirLight.shadowBias = -0.0001;
        dirLight.shadowDarkness = 0.35;

        // GROUND
        var groundGeo = new THREE.PlaneGeometry(10000, 10000);
        var groundMat = new THREE.MeshPhongMaterial({
            ambient: 0xffffff,
            color: 0xffffff,
            specular: 0x050505
        });
        groundMat.color.setHSL(0.095, 1, 0.75);

        ground = new THREE.Mesh(groundGeo, groundMat);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -8;
        scene.add(ground);

        ground.receiveShadow = true;

        // FOG
        scene.fog = new THREE.Fog(0xffffff, 1, 5000);
        scene.fog.color.setHSL(0.6, 0, 1);

        // RELLA IMAGE
        rellaImage = [
            'MeshNormalMaterial',
            'images/rainbow.png',
            'images/spectrum.png',
            'images/spectrum2.png',
            'images/spectrum3.png',
            'images/ponybrown.png',
            'images/rrh1.png',
            'images/rrh2.png',
            'images/watermelon.png',
            'images/checkerboard.jpg',
            'images/drop-image.png',
            'images/bg.png',
            'images/lava.png',
            'images/moon.png',
            'images/earth.jpg',
            'images/pattern1.jpg',
            'images/pattern2.jpg',
            'images/pattern3.jpg',
            'images/pattern4.jpg',
            'images/pattern5.jpg',
            'images/pattern6.jpg',
            'images/pattern7.jpg',
            'images/pattern8.jpg',
            'images/pattern9.jpg',
            'images/pattern10.jpg'
        ];

        // RELLA
        group = new THREE.Object3D();
        for (var i = 0; i < rellaImage.length; i++) {
            addRella(i);
        }
        scene.add(group);

        // PARTICLE SYSTEM
        engine = new ParticleEngine();
        engine.setValues(Examples.rain);
        engine.initialize();

        // ADD Listeners
        addEventListeners();
        callbacks.cameraViewTop();
        callbacks.rainModeOn();
        callbacks.rotateModeOn();
        callbacks.showHideFileDrop();
    }

    function addEventListeners() {
        var fileDrop = document.getElementById('fileDrop');
        fileDrop.addEventListener('dragover', callbacks.cancel, false);
        fileDrop.addEventListener('dragenter', callbacks.cancel, false);
        fileDrop.addEventListener('dragexit', callbacks.cancel, false);
        fileDrop.addEventListener('drop', callbacks.dropFile, false);

        $('#rotate-mode-on').click(callbacks.rotateModeOn);
        $('#rotate-mode-off').click(callbacks.rotateModeOff);

        $('#rain-mode-on').click(callbacks.rainModeOn);
        $('#rain-mode-off').click(callbacks.rainModeOff);

        $('#sound-mode-on').click(callbacks.soundModeOn);
        $('#sound-mode-off').click(callbacks.soundModeOff);

        $('#camera-view-top').click(callbacks.cameraViewTop);
        $('#camera-view-front').click(callbacks.cameraViewFront);
        $('#camera-view-birdeye').click(callbacks.cameraViewBirdeye);
        $('#camera-view-bottom').click(callbacks.cameraViewBottom);

        $('#info').click(callbacks.showHideFileDrop);

        $(window).resize(callbacks.windowResize);
        $(document).keydown(callbacks.onKeyDown);
    }

    function addRella(rellaImageIndex) {
        var numColumns = Math.floor(Math.sqrt(rellaImage.length));
        var numRows = Math.ceil((rellaImage.length) / numColumns);
        var startX = -((numRows - 1) / 2) * rellaBoxSize;
        var startZ = (numColumns - 1) / 2 * rellaBoxSize;
        var row = Math.floor(rellaImageIndex / numColumns);
        var column = rellaImageIndex % numColumns;
        var x = startX + row * rellaBoxSize;
        var z = startZ - column * rellaBoxSize;
        var material;

        if (rellaImage[rellaImageIndex] == 'MeshNormalMaterial') {
            material = new THREE.MeshNormalMaterial({
                side: THREE.DoubleSide
            });
        } else {
            var texture = new THREE.ImageUtils.loadTexture(rellaImage[rellaImageIndex]);
            material = new THREE.MeshPhongMaterial({
                map: texture,
                side: THREE.DoubleSide
            });
        }
        var geometry = new THREE.SphereGeometry(10, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2.7);
        var mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(x, 0, z);

        if (group.children && group.children[0]) {
            var rotation = group.children[0].rotation;
            mesh.rotation.set(rotation.x, rotation.y, rotation.z);
        }
        mesh.castShadow = true;
        group.add(mesh);

        addRellaHandle(x, z);
    }

    function addRellaHandle(x, z) {
        var handleL = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 13.5, 8, 1, false),
            new THREE.MeshBasicMaterial({
                color: 0x000000,
                opacity: 1
            }));
        handleL.overdraw = true;
        handleL.position.set(x, 4, z);
        group.add(handleL);

        var handleUBezier = new THREE.CubicBezierCurve3(
            new THREE.Vector3(0, 1, 0),
            new THREE.Vector3(-0.5, -1.5, 0),
            new THREE.Vector3(-2, -1.5, 0),
            new THREE.Vector3(-2.5, 1, 0)
        );

        var handleU = new THREE.Mesh(new THREE.TubeGeometry(handleUBezier, 10, 0.3, 10, false, false),
            new THREE.MeshBasicMaterial({
                color: 0x000000,
                opacity: 1
            }));
        handleU.position.set(x, -3.6, z);
        if (group.children && group.children[0]) {
            var rotation = group.children[0].rotation;
            handleU.rotation.set(rotation.x, rotation.y, rotation.z);
        }
        group.add(handleU);
    }

    function reloadRella() {
        scene.remove(group);
        group = new THREE.Object3D();
        for (var i = 0; i < rellaImage.length; i++) {
            addRella(i);
        }
        scene.add(group);
    }

    function showFileDrop() {
        $('#panel').show();
        $('#info').addClass('selected');
        renderer.setSize(window.innerWidth - 300, window.innerHeight);
        camera.aspect = (window.innerWidth - 300) / window.innerHeight;
        camera.updateProjectionMatrix();
    }

    function hideFileDrop() {
        $('#panel').hide();
        $('#info').removeClass('selected');
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    }

    function handleFile(file) {
        var fileReader = new FileReader();
        fileReader.onloadend = callbacks.fileUploaded;
        fileReader.readAsDataURL(file);
    }

    // animation loop
    function animate() {

        requestAnimationFrame(animate);

        // do the render
        render();
        update();
    }

    // render the scene
    function render() {
        cameraControls.update();
        renderer.render(scene, camera);
    }

    function update() {
        var dt = clock.getDelta();
        if (engine) engine.update(dt * 0.5);

        if (isRotateModeOn) {
            group.children.forEach(function(rella) {
                rella.rotation.y += 0.05;
            });
        }
        // update stats
        //stats.update();
    }

    init();
    animate();
};
