import React, { useEffect, useRef } from "react";
import * as THREE from "three";

const SciFiInteractiveBackground = () => {
  const sceneRef = useRef(null);

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    sceneRef.current.appendChild(renderer.domElement);

    scene.background = new THREE.Color(0x0c0c0c);

    // 创建粒子系统
    const particleCount = 5000;
    const particlesGeometry = new THREE.BufferGeometry();
    
    // 创建圆形点纹理的函数
    const createCircularPointTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      const context = canvas.getContext('2d');
      
      // 绘制圆形渐变
      const gradient = context.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        0,
        canvas.width / 2,
        canvas.height / 2,
        canvas.width / 2
      );
      gradient.addColorStop(0, 'rgba(255,255,255,1)');
      gradient.addColorStop(0.5, 'rgba(255,255,255,0.8)');
      gradient.addColorStop(1, 'rgba(255,255,255,0)');
      
      context.fillStyle = gradient;
      context.fillRect(0, 0, canvas.width, canvas.height);
      
      return new THREE.CanvasTexture(canvas);
    };

    // 修改点材质，设置为圆形
    const particlesMaterial = new THREE.PointsMaterial({
      color: 0xff0000, // 红色
      size: 2, // 稍微调大一点
      sizeAttenuation: true, // 根据距离调整大小
      transparent: true,
      alphaTest: 0.5, // 透明度测试
      opacity: 0.8,
      blending: THREE.AdditiveBlending, // 使用加法混合，让圆形重叠时更亮
      map: createCircularPointTexture(), // 关键：使用圆形纹理
    });

    // 设置粒子的位置
    const positions = [];
    for (let i = 0; i < particleCount; i++) {
      positions.push(
        Math.random() * 400 - 200, // x 坐标
        Math.random() * 400 - 200, // y 坐标
        Math.random() * 400 - 200  // z 坐标
      );
    }

    particlesGeometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);

    // 添加光源
    const ambientLight = new THREE.AmbientLight(0x404040, 1);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5).normalize();
    scene.add(directionalLight);

    camera.position.z = 150;

    // 渲染循环
    const animate = () => {
      requestAnimationFrame(animate);

      particles.rotation.x += 0.001;
      particles.rotation.y += 0.001;

      renderer.render(scene, camera);
    };
    animate();

    // 监听窗口尺寸变化
    const onWindowResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    };

    window.addEventListener("resize", onWindowResize);

    // 鼠标交互
    const handleMouseMove = (event) => {
      const mouseX = (event.clientX / window.innerWidth) * 2 - 1;
      const mouseY = -(event.clientY / window.innerHeight) * 2 + 1;

      camera.position.x = mouseX * 100;
      camera.position.y = mouseY * 100;
      camera.lookAt(scene.position);

      const particles = scene.children.find(child => child instanceof THREE.Points);
      if (particles) {
        const positions = particles.geometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
          positions[i] += Math.sin(mouseX) * 0.02;
          positions[i + 1] += Math.cos(mouseY) * 0.02;
        }
        particles.geometry.attributes.position.needsUpdate = true;
      }
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("resize", onWindowResize);
      window.removeEventListener("mousemove", handleMouseMove);
      renderer.dispose();
    };
  }, []);

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        overflow: "hidden",
        zIndex: -1,
      }}
    >
      <div ref={sceneRef}></div>
    </div>
  );
};

export default SciFiInteractiveBackground;