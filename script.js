import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis'; 

// Simple SplitText alternative
function splitText(element, type = "chars") {
    if (!element) return { chars: [], lines: [] };
    
    const originalText = element.textContent.trim();
    const computedStyle = window.getComputedStyle(element);
    element.innerHTML = "";
    
    if (type === "chars") {
        const chars = originalText.split("");
        const charElements = [];
        chars.forEach((char) => {
            const charSpan = document.createElement("span");
            charSpan.className = "char";
            charSpan.style.display = "inline-block";
            const innerSpan = document.createElement("span");
            innerSpan.innerHTML = char === " " ? "&nbsp;" : char;
            charSpan.appendChild(innerSpan);
            element.appendChild(charSpan);
            charElements.push(charSpan);
        });
        return { chars: charElements };
    } else if (type === "lines") {
        const words = originalText.split(" ");
        const lines = [];
        let currentLine = [];
        let currentLineText = "";
        
        const tempDiv = document.createElement("div");
        tempDiv.style.position = "absolute";
        tempDiv.style.visibility = "hidden";
        tempDiv.style.whiteSpace = "nowrap";
        tempDiv.style.font = computedStyle.font;
        document.body.appendChild(tempDiv);
        
        words.forEach((word) => {
            const testText = currentLineText ? currentLineText + " " + word : word;
            tempDiv.textContent = testText;
            
            if (tempDiv.offsetWidth > element.offsetWidth && currentLine.length > 0) {
                const lineSpan = document.createElement("span");
                lineSpan.className = "line";
                lineSpan.style.display = "block";
                const innerSpan = document.createElement("span");
                innerSpan.textContent = currentLineText;
                lineSpan.appendChild(innerSpan);
                element.appendChild(lineSpan);
                lines.push(lineSpan);
                
                currentLine = [word];
                currentLineText = word;
            } else {
                currentLine.push(word);
                currentLineText = testText;
            }
        });
        
        if (currentLineText) {
            const lineSpan = document.createElement("span");
            lineSpan.className = "line";
            lineSpan.style.display = "block";
            const innerSpan = document.createElement("span");
            innerSpan.textContent = currentLineText;
            lineSpan.appendChild(innerSpan);
            element.appendChild(lineSpan);
            lines.push(lineSpan);
        }
        
        document.body.removeChild(tempDiv);
        return { lines };
    }
    return { chars: [], lines: [] };
}

document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM loaded, initializing...");
    
    gsap.registerPlugin(ScrollTrigger);

    // Hero Zoom Effect
    const heroImage = document.querySelector(".hero-image-container img");
    const heroSection = document.querySelector(".hero-section");
    const heroTitle = document.querySelector(".hero-title-container");
    
    if (heroImage && heroSection) {
        // Установить начальное состояние заголовка (скрыт)
        if (heroTitle) {
            gsap.set(heroTitle, { opacity: 0, y: 50 });
        }
        
        gsap.timeline({
            scrollTrigger: {
                trigger: ".hero-wrapper",
                start: "top top",
                end: "+=150%",
                pin: true,
                scrub: 1,
            }
        })
        .to(heroImage, {
            scale: 2,
            z: 350,
            transformOrigin: "center center",
            ease: "power1.inOut"
        })
        .to(heroSection, {
            scale: 1.1,
            transformOrigin: "center center",
            ease: "power1.inOut"
        }, "<")
        .to(heroTitle, {
            opacity: 1,
            y: 0,
            ease: "power2.out"
        }, "-=50%"); // Появляется в середине зума
    }

    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });
    
    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    
    lenis.on("scroll", ScrollTrigger.update);

    // Split text
    const header1Element = document.querySelector(".header-1 h1");
    if (!header1Element) {
        console.error("Header-1 h1 not found!");
        return;
    }
    const header1Split = splitText(header1Element, "chars");
    console.log("Header split:", header1Split.chars.length, "chars");
    
    const titleElements = document.querySelectorAll(".tooltip .title h2");
    const titleSplits = Array.from(titleElements).map(el => splitText(el, "lines"));
    
    const descriptionElements = document.querySelectorAll(".tooltip .description p");
    const descriptionSplits = Array.from(descriptionElements).map(el => splitText(el, "lines"));

    // Wrap icons in spans for animation
    function setupIcons() {
        const icons = document.querySelectorAll(".tooltip .icon ion-icon");
        console.log("Found icons:", icons.length);
        
        if (icons.length === 0) {
            console.log("Icons not found, retrying...");
            setTimeout(setupIcons, 200);
            return;
        }
        
        icons.forEach((icon, index) => {
            // Check if already wrapped
            if (icon.parentElement && icon.parentElement.tagName === 'SPAN' && icon.parentElement.parentElement.classList.contains('icon')) {
                console.log(`Icon ${index} already wrapped`);
                return;
            }
            const wrapper = document.createElement("span");
            const parent = icon.parentNode;
            if (parent) {
                parent.insertBefore(wrapper, icon);
                wrapper.appendChild(icon);
                console.log(`Icon ${index} wrapped`);
            }
        });
        
        // Set initial state for animations after a small delay to ensure DOM is ready
        setTimeout(() => {
            gsap.set(".header-1 h1 .char > span", { y: "100%" });
            gsap.set(".tooltip .icon > span, .tooltip .title .line > span, .tooltip .description .line > span", { y: "125%" });
            console.log("Initial animation state set");
        }, 50);
    }
    
    // Wait for icons to load
    setTimeout(setupIcons, 500);

    const animOptions = { duration: 1, ease: "power3.out", stagger: 0.025 };
    const tooltipSelrctors = [
        {
            trigger: 0.65,
            elements: [
                ".tooltip:nth-child(1) .icon > span",
                ".tooltip:nth-child(1) .title .line > span",
                ".tooltip:nth-child(1) .description .line > span",
            ],
        },
        {
            trigger: 0.85,
            elements: [
                ".tooltip:nth-child(2) .icon > span",
                ".tooltip:nth-child(2) .title .line > span",
                ".tooltip:nth-child(2) .description .line > span",
            ],
        },
    ];
    
    ScrollTrigger.create({
        trigger: ".product-overview",
        start: "75% bottom",
        onEnter: () => {
            console.log("Header animation triggered");
            gsap.to(".header-1 h1 .char > span", {
                y: "0%",
                duration: 1,
                ease: "power3.out",
                stagger: 0.025,
            });
        },
        onLeaveBack: () => {
            gsap.to(".header-1 h1 .char > span", {
                y: "100%",
                duration: 1,
                ease: "power3.out",
                stagger: 0.025,
            });
        },
    });

    let model,
        currentRotation = 0,
        modelSize;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    const renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});

    renderer.setClearColor(0x000000, 0);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputEncoding = THREE.LinearEncoding;
    renderer.toneMapping = THREE.NoToneMapping;
    renderer.toneMappingExposure = 1.0;
    
    const modelContainer = document.querySelector(".model-container");
    if (modelContainer) {
        modelContainer.appendChild(renderer.domElement);
        // Скрыть модель изначально
        gsap.set(modelContainer, { opacity: 0, visibility: "hidden" });
    } else {
        console.error("Model container not found!");
    }

    scene.add(new THREE.AmbientLight(0xffffff, 0.7));

    const mainLight = new THREE.DirectionalLight(0xffffff, 1.0);
    mainLight.position.set(1,2,3);
    mainLight.castShadow = true;
    mainLight.shadow.bias = -0.001;
    mainLight.shadow.mapSize.width = 1024;
    mainLight.shadow.mapSize.height = 1024;
    scene.add(mainLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.5);
    fillLight.position.set(-2, 0, -2);
    scene.add(fillLight);

    function setupModel(){
        if (!model || !modelSize) return;

        const isMobile = window.innerWidth < 1000;
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());

        model.position.set(
            isMobile ? center.x + modelSize.x * 1 : -center.x - modelSize.x * 0.4,
            -center.y + modelSize.y * 0.085,
            -center.z
        );

        model.rotation.z = isMobile ? 0 : THREE.MathUtils.degToRad(-25);

        const cameraDistance = isMobile ? 2 : 1.25;
        camera.position.set(
            0,
            0,
            Math.max(modelSize.x, modelSize.y, modelSize.z) * cameraDistance
        );
        camera.lookAt(0, 0, 0);
    }

    new GLTFLoader().load("/shaker.glb", (gltf) => {
        console.log("Model loaded");
        model = gltf.scene;

        model.traverse((node) => {
            if (node.isMesh && node.material){
                Object.assign(node.material, {
                    metalness: 0.05,
                    roughness: 0.9,
                });
            }
        });

        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        modelSize = size;

        scene.add(model);
        setupModel();
    }, undefined, (error) => {
        console.error("Error loading model:", error);
    });

    function animate(){
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
    }
    animate();

    window.addEventListener("resize", () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        setupModel();
    });

    ScrollTrigger.create({
        trigger: ".product-overview",
        start: "top top",
        end: `+=${window.innerHeight * 10}`,
        pin: true,
        pinSpacing: true,
        scrub: 1,
        onUpdate: ({ progress }) => {
            const headerProgress = Math.max(0, Math.min(1, (progress - 0.05) / 0.3));
            gsap.to(".header-1",{
                xPercent:
                progress < 0.05 ? 0 : progress > 0.35 ? -100 : -100 * headerProgress,
            });

            const maskSize = 
                progress < 0.2
                ? 0
                : progress > 0.3
                ? 100
                : 100 * ((progress - 0.2) / 0.1);
            gsap.to(".circular-mask", {
                clipPath: `circle(${maskSize}% at 50% 50%)`,
            });

            const header2Progress = (progress - 0.15) / 0.35;
            const header2XPercent = 
              progress < 0.15
              ? 100
              : progress > 0.5
              ? -200
              : 100 - 300 * header2Progress;
            gsap.to(".header-2", { xPercent: header2XPercent });

            // Показывать модель только после header-2 (progress >= 0.5)
            if (modelContainer) {
                if (progress >= 0.5) {
                    gsap.to(modelContainer, {
                        opacity: 1,
                        visibility: "visible",
                        duration: 0.5,
                        ease: "power2.out"
                    });
                } else {
                    gsap.to(modelContainer, {
                        opacity: 0,
                        visibility: "hidden",
                        duration: 0.3
                    });
                }
            }

            const scaleX =
              progress < 0.45
              ? 0
              : progress > 0.65
              ? 100
              : 100 * ((progress - 0.45) / 0.2);
            gsap.to(".tooltip .divider", { scaleX: scaleX / 100, ...animOptions });

            tooltipSelrctors.forEach(({ trigger, elements }) => {
                gsap.to(elements, {
                    y: progress >= trigger ? "0%" : "125%",
                    ... animOptions,
                });
            });

            // Вращать модель только после её появления (progress >= 0.5)
            if (model && progress >= 0.5) {
                const rotationProgress = (progress - 0.5) / 0.5; // От 0 до 1 после появления
                const targetRotation = Math.PI * 2 * 1.5 * rotationProgress; // Медленнее: 1.5 оборота вместо 12
                const rotationDiff = targetRotation - currentRotation;
                if (Math.abs(rotationDiff) > 0.001) {
                    model.rotateOnAxis(new THREE.Vector3(0, 1, 0), rotationDiff);
                    currentRotation = targetRotation;
                }
            }
        },
    });
    
    console.log("Initialization complete");
});
