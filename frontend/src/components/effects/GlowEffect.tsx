import React, { useState, useEffect } from 'react';

interface GlowEffectProps {
    trigger: any;
}

const GlowEffect: React.FC<GlowEffectProps> = ({ trigger }) => {
    const [show, setShow] = useState(false);
    const [id, setId] = useState(0);

    useEffect(() => {
        if (trigger) {
            setShow(true);
            setId(prev => prev + 1);
            const timer = setTimeout(() => setShow(false), 1500);
            return () => clearTimeout(timer);
        }
    }, [trigger]);

    if (!show) return null;

    return (
        <div key={id} className="soul-echo-trigger" />
    );
};

export default GlowEffect;

