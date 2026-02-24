import React, { useState, useEffect } from 'react';

const texts = [
  "Unleash your curiosity",
  "Expand the self",
  "Your h*cking journey starts here",
  "Your friendly hacker"
];

const cursorColors = [
  'text-green-500',
  'text-red-500',
  'text-blue-500',
  'text-yellow-500'
];

const TypewriterEffect: React.FC = () => {
  const [currentText, setCurrentText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [textIndex, setTextIndex] = useState(0);
  const [cursorColorIndex, setCursorColorIndex] = useState(0);

  useEffect(() => {
    const text = texts[textIndex];
    let timeout: NodeJS.Timeout;

    if (!isDeleting && currentText === text) {
      // Pause at full text
      timeout = setTimeout(() => setIsDeleting(true), 2000);
    } else if (isDeleting && currentText === '') {
      // Move to next text
      setIsDeleting(false);
      setTextIndex((prev) => (prev + 1) % texts.length);
    } else {
      // Type or delete
      const delta = isDeleting ? -1 : 1;
      timeout = setTimeout(() => {
        setCurrentText(text.slice(0, currentIndex + delta));
        setCurrentIndex(currentIndex + delta);
      }, isDeleting ? 50 : 100);
    }

    return () => clearTimeout(timeout);
  }, [currentText, currentIndex, isDeleting, textIndex]);

  // Change cursor color every 500ms
  useEffect(() => {
    const interval = setInterval(() => {
      setCursorColorIndex((prev) => (prev + 1) % cursorColors.length);
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="text-center">
      <h2 className="text-2xl mb-2 font-mono text-primary">
        {currentText}
        <span className={`${cursorColors[cursorColorIndex]} animate-pulse`}>|</span>
      </h2>
    </div>
  );
};

export default TypewriterEffect; 