import React , {useEffect} from 'react'
import '../Styles/HomePage.css';

const techLogos = [
  'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg',
  'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg',
  'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg',
  'https://raw.githubusercontent.com/devicons/devicon/master/icons/csharp/csharp-original.svg',
  'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-original.svg',
  'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/go/go-original.svg',
  'https://raw.githubusercontent.com/devicons/devicon/master/icons/c/c-original.svg',
  'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/ruby/ruby-original.svg',
  'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/php/php-original.svg',
  'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg',
  'https://raw.githubusercontent.com/devicons/devicon/master/icons/dart/dart-original.svg',
  'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg',
  'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg',
  'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg',
  'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg',
  'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg',
  'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/swift/swift-original.svg',
  'https://raw.githubusercontent.com/devicons/devicon/master/icons/swift/swift-original.svg',
];

export default function TechBubbles() {

  useEffect(() => {
    const container = document.getElementById('techBubbles');
    if (!container) return;

    for (let i = 0; i < 30; i++) {
      const bubble = document.createElement('div');
      bubble.className = 'tech-bubble';

      const logo = techLogos[Math.floor(Math.random() * techLogos.length)];
      const size = Math.random() * 30 + 20;
      const left = Math.random() * 100;
      const duration = Math.random() * 30 + 20;
      const delay = Math.random() * 15;
      const opacity = Math.random() * 0.5 + 0.3;

      bubble.style.backgroundImage = `url(${logo})`;
      bubble.style.width = `${size}px`;
      bubble.style.height = `${size}px`;
      bubble.style.left = `${left}%`;
      bubble.style.bottom = `-50px`;
      bubble.style.animationDuration = `${duration}s`;
      bubble.style.animationDelay = `${delay}s`;
      bubble.style.opacity = opacity;
      bubble.style.filter = `hue-rotate(${Math.random() * 360}deg) brightness(1.2)`;

      container.appendChild(bubble);
    }

    return () => {
      container.innerHTML = '';
    };
  }, []);

  return <div id="techBubbles" className="tech-bubbles"></div>;
};
