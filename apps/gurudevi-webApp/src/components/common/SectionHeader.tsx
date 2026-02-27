import React from 'react';
import { LucideIcon } from 'lucide-react';

interface SectionHeaderProps {
    title: string;
    subtitle?: string;
    icon?: LucideIcon;
    iconColor?: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
    title,
    subtitle,
    icon: Icon,
    iconColor = "text-orange-400"
}) => {
    return (
        <div className="text-center space-y-2 mb-6">
            <h3 className="text-xl font-bold text-white flex items-center justify-center space-x-2">
                {Icon && <Icon className={`w-6 h-6 ${iconColor}`} />}
                <span>{title}</span>
            </h3>
            {subtitle && <p className="text-gray-400 text-sm">{subtitle}</p>}
        </div>
    );
};

export default SectionHeader;
