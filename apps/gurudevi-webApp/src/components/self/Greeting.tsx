import React from 'react';

const Greeting: React.FC = () => {
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    // For now using a hardcoded name, later will use store
    const name = "Teacher Name";

    return (
        <div className="flex flex-col space-y-1 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <p className="text-gray-400 text-sm font-medium">
                {getGreeting()},
            </p>
            <h1 className="text-3xl font-bold text-white tracking-tight">
                {name}
            </h1>
        </div>
    );
};

export default Greeting;
