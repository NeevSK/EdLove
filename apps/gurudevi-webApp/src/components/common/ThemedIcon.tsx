import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface ThemedIconProps {
    icon: LucideIcon;
    size?: number;
    className?: string;
    active?: boolean;
}

const ThemedIcon: React.FC<ThemedIconProps> = ({
    icon: Icon,
    size = 24,
    className = "",
    active = false
}) => {
    return (
        <div className={`transition-all duration-300 ${active ? 'scale-110' : 'scale-100'} ${className}`}>
            <Icon
                size={size}
                className={`${active ? 'text-orange-400 fill-orange-400/20' : 'text-gray-500'} group-hover:text-orange-400 transition-colors`}
            />
        </div>
    );
};

export default ThemedIcon;
