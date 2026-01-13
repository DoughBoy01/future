import { useState, useRef, useEffect } from 'react';
import { User } from 'lucide-react';

interface NameQuestionProps {
    value?: string;
    onChange: (name: string) => void;
    onEnter?: () => void;
}

export function NameQuestion({ value = '', onChange, onEnter }: NameQuestionProps) {
    const [name, setName] = useState(value);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newName = e.target.value;
        setName(newName);
        onChange(newName);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && name.trim()) {
            onEnter?.();
        }
    };

    return (
        <div className="space-y-6 md:space-y-10 pt-4">
            <div className="relative max-w-md">
                <div className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 text-airbnb-grey-300">
                    <User className="w-6 h-6 md:w-8 md:h-8" />
                </div>
                <input
                    ref={inputRef}
                    type="text"
                    value={name}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Enter name..."
                    className="w-full pl-12 md:pl-16 pr-6 md:pr-8 py-4 md:py-6 bg-white border-2 border-airbnb-grey-200 border-b-[6px] md:border-b-[8px] rounded-[2rem] text-xl md:text-2xl font-black text-airbnb-grey-900 placeholder:text-airbnb-grey-200 focus:outline-none focus:border-airbnb-pink-500 transition-all"
                />
            </div>

            <div className="flex items-center gap-3 md:gap-4 text-airbnb-grey-400 font-bold text-xs md:text-sm uppercase tracking-widest px-1">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-airbnb-grey-50 rounded-full flex items-center justify-center border border-airbnb-grey-100 flex-shrink-0">
                    ✨
                </div>
                <span className="leading-tight">We'll use this to customize recommendations.</span>
            </div>
        </div>
    );
}
