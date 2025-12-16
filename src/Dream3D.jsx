import React, { useEffect, useRef } from "react";
import * as THREE from "three";

const SciFiInteractiveBackground = () => {
  const sceneRef = useRef(null); // 用于挂载 Three.js 场景

  useEffect(() => {
    // 创建场景、相机和渲染器
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    sceneRef.current.appendChild(renderer.domElement);

    // 添加背景色
    scene.background = new THREE.Color(0x0c0c0c); // 深色背景，偏向黑色

    // 创建粒子系统
    const particleCount = 5000;
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesMaterial = new THREE.PointsMaterial({
      color: 0xff0000, // 红色
      size: 0.5,
      transparent: true,
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
    const ambientLight = new THREE.AmbientLight(0x404040, 1); // 环境光
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5).normalize();
    scene.add(directionalLight);

    camera.position.z = 150;

    // 渲染循环
    const animate = () => {
      requestAnimationFrame(animate);

      particles.rotation.x += 0.001; // 粒子旋转
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

    // 鼠标交互：改变相机和粒子的行为
    const handleMouseMove = (event) => {
      const mouseX = (event.clientX / window.innerWidth) * 2 - 1;
      const mouseY = -(event.clientY / window.innerHeight) * 2 + 1;

      // 改变相机位置
      camera.position.x = mouseX * 100;
      camera.position.y = mouseY * 100;
      camera.lookAt(scene.position); // 让相机指向场景中心

      // 改变粒子的速度，向鼠标位置吸引
      const particles = scene.children.find(child => child instanceof THREE.Points);
      if (particles) {
        const positions = particles.geometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
          positions[i] += Math.sin(mouseX) * 0.02; // 粒子 X 轴方向
          positions[i + 1] += Math.cos(mouseY) * 0.02; // 粒子 Y 轴方向
        }
        particles.geometry.attributes.position.needsUpdate = true;
      }
    };

    window.addEventListener("mousemove", handleMouseMove);

    // 清理：组件卸载时销毁事件监听器和渲染器
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
        zIndex: -1, // 保证背景层位于页面底层
      }}
    >
      <div ref={sceneRef}></div>
    </div>
  );
};

export default SciFiInteractiveBackground;
