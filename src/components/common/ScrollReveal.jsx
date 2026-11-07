import { jsx as _jsx } from "react/jsx-runtime";
import React, { useEffect, useRef, useState } from 'react';
export const ScrollReveal = ({ children, animation = 'fade-up', delay = 0, className = '', threshold = 0.12, once = true }) => {
    const [isVisible, setIsVisible] = useState(false);
    const elementRef = useRef(null);
    useEffect(() => {
        // Aksesibilitas: Cek preferensi pengguna untuk gerakan yang dikurangi
        const prefersReducedMotion = typeof window.matchMedia === 'function'
            && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion || typeof IntersectionObserver === 'undefined') {
            setIsVisible(true);
            return;
        }
        const currentEl = elementRef.current;
        if (!currentEl)
            return;
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setIsVisible(true);
                if (once) {
                    observer.unobserve(entry.target);
                }
            }
            else if (!once) {
                setIsVisible(false);
            }
        }, {
            threshold,
            rootMargin: '0px 0px -30px 0px'
        });
        observer.observe(currentEl);
        return () => {
            observer.disconnect();
        };
    }, [threshold, once]);
    const getAnimationStyles = () => {
        const baseTransition = `transition-all duration-700 ease-out will-change-transform`;
        const delayStyle = { transitionDelay: `${delay}ms` };
        switch (animation) {
            case 'fade-up':
                return {
                    className: `${baseTransition} ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-7'} ${className}`,
                    style: delayStyle
                };
            case 'fade-in':
                return {
                    className: `${baseTransition} ${isVisible ? 'opacity-100' : 'opacity-0'} ${className}`,
                    style: delayStyle
                };
            case 'reveal-left':
                return {
                    className: `${baseTransition} ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'} ${className}`,
                    style: delayStyle
                };
            case 'reveal-right':
                return {
                    className: `${baseTransition} ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'} ${className}`,
                    style: delayStyle
                };
            case 'scale-up':
                return {
                    className: `${baseTransition} ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'} ${className}`,
                    style: delayStyle
                };
            case 'image-reveal':
                return {
                    className: `transition-all duration-1000 ease-out overflow-hidden ${isVisible ? 'opacity-100 scale-100 blur-0' : 'opacity-0 scale-105 blur-[2px]'} ${className}`,
                    style: delayStyle
                };
            default:
                return {
                    className: `${baseTransition} ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-7'} ${className}`,
                    style: delayStyle
                };
        }
    };
    const anim = getAnimationStyles();
    return (_jsx("div", { ref: elementRef, className: anim.className, style: anim.style, children: children }));
};
export default ScrollReveal;
