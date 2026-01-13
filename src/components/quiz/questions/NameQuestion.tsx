import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
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
        <div className="space-y-10 pt-4">
            <div className="relative max-w-md">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-airbnb-grey-300">
                    <User className="w-8 h-8" />
                </div>
                <input
                    ref={inputRef}
                    type="text"
                    value={name}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Enter name..."
                    className="w-full pl-16 pr-8 py-6 bg-white border-2 border-airbnb-grey-200 border-b-[8px] rounded-[2rem] text-2xl font-black text-airbnb-grey-900 placeholder:text-airbnb-grey-200 focus:outline-none focus:border-airbnb-pink-500 transition-all"
                />

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: name.length > 0 ? 1 : 0 }}
                    className="absolute right-6 top-1/2 -translate-y-1/2 text-airbnb-pink-600 font-black text-xs uppercase tracking-widest"
                >
                    Press Enter ↵
                </motion.div>
            </div>

            <div className="flex items-center gap-4 text-airbnb-grey-400 font-bold text-sm uppercase tracking-widest">
                <div className="w-10 h-10 bg-airbnb-grey-50 rounded-full flex items-center justify-center border border-airbnb-grey-100">
                    ✨
                </div>
                We'll use this to customize recommendations.
            </div>
        </div>
    );
}
