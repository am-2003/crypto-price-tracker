'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

export interface CryptoData {
  data: {
    id: string;
    name: string;
    symbol: string;
    priceUsd: number;
  },
  timestamp: number;
}

interface SearchBarProps {
  onSearch: (searchTerm: string) => void;
}

export default function SearchBar({ onSearch }: SearchBarProps) {
    const [searchTerm, setSearchTerm] = useState('');

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTerm = e.target.value;
        setSearchTerm(newTerm);
        onSearch(newTerm);
    };

    return (
        <div className="flex-grow">
            <div className="searchDiv w-full">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={handleInputChange}
                    placeholder="Filter cryptocurrencies..."
                    className="w-full px-4 py-2 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
            </div>
        </div>
    );
}