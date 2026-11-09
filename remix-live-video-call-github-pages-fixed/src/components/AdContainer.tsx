import React, { useEffect, useRef } from 'react';

interface AdContainerProps {
  htmlCode?: string;
  className?: string;
  type?: 'banner' | 'infeed';
}

/**
 * Executes ad network scripts (Adsterra, PropellerAds, etc.) dynamically.
 * React's dangerouslySetInnerHTML deliberately does not execute <script> tags,
 * so we parse and re-inject them so ads render properly.
 */
export const AdContainer: React.FC<AdContainerProps> = ({ htmlCode, className = '', type = 'banner' }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Clear previous scripts
    container.innerHTML = '';

    if (!htmlCode || !htmlCode.trim()) {
      return;
    }

    try {
      const wrapper = document.createElement('div');
      wrapper.innerHTML = htmlCode.trim();

      // Extract all script elements
      const scripts = Array.from(wrapper.querySelectorAll('script'));

      // Append non-script HTML elements first
      Array.from(wrapper.childNodes).forEach((node) => {
        if (node.nodeName.toLowerCase() !== 'script') {
          container.appendChild(node.cloneNode(true));
        }
      });

      // Execute scripts in order
      scripts.forEach((oldScript) => {
        const newScript = document.createElement('script');
        Array.from(oldScript.attributes).forEach((attr) => {
          newScript.setAttribute(attr.name, attr.value);
        });
        if (oldScript.src) {
          newScript.src = oldScript.src;
          newScript.async = true;
        } else {
          newScript.text = oldScript.text;
        }
        container.appendChild(newScript);
      });
    } catch (err) {
      console.warn('Ad code injection notice:', err);
    }

    return () => {
      if (container) {
        container.innerHTML = '';
      }
    };
  }, [htmlCode]);

  if (!htmlCode || !htmlCode.trim()) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className={`ad-network-container w-full flex items-center justify-center overflow-hidden my-1.5 ${className}`}
      data-ad-type={type}
    />
  );
};

/**
 * Injects global ad scripts (Social Bar & Popunder) directly into the document
 * so their interactive overlays and click events trigger globally for all visitors.
 */
export const GlobalAdScriptInjector: React.FC<{
  socialBarCode?: string;
  popunderCode?: string;
}> = ({ socialBarCode, popunderCode }) => {
  useEffect(() => {
    const injectedElements: HTMLElement[] = [];

    const injectCode = (code: string | undefined, tagId: string) => {
      if (!code || !code.trim()) return;

      const host = document.createElement('div');
      host.id = tagId;
      host.style.display = 'none';
      document.body.appendChild(host);
      injectedElements.push(host);

      try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(code, 'text/html');
        const scripts = Array.from(doc.querySelectorAll('script'));

        scripts.forEach((oldScript) => {
          const s = document.createElement('script');
          Array.from(oldScript.attributes).forEach((attr) => {
            s.setAttribute(attr.name, attr.value);
          });
          if (oldScript.src) {
            s.src = oldScript.src;
            s.async = true;
          } else {
            s.text = oldScript.text;
          }
          host.appendChild(s);
        });

        // Also append any non-script HTML elements (like floating popunder divs/links)
        Array.from(doc.body.childNodes).forEach((node) => {
          if (node.nodeName.toLowerCase() !== 'script') {
            const clone = node.cloneNode(true) as HTMLElement;
            host.appendChild(clone);
          }
        });
      } catch (e) {
        console.warn('Global ad injection error:', e);
      }
    };

    injectCode(socialBarCode, 'adsterra-social-bar-slot');
    injectCode(popunderCode, 'adsterra-popunder-slot');

    return () => {
      injectedElements.forEach((el) => {
        if (el.parentNode) {
          el.parentNode.removeChild(el);
        }
      });
    };
  }, [socialBarCode, popunderCode]);

  return null;
};
