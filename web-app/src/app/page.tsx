'use client';

import { useEffect, useState } from 'react';
import SearchBar, { CryptoData } from "./SearchBar";
import { CRYPTO_IDS } from './cryptoList';

export default function Home() {
  const [allCryptos, setAllCryptos] = useState<CryptoData[]>([]);
  const [filteredCryptos, setFilteredCryptos] = useState<CryptoData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error>();

  const fetchSingleCrypto = async (id: string): Promise<CryptoData | null> => {
    try {
      const response = await fetch(`https://api.coincap.io/v2/assets/${id}`);
      
      if (!response.ok) {
        if (response.status === 429) {
          await new Promise(resolve => setTimeout(resolve, 200));
          return null; // Will be retried
        }
        console.warn(`Failed to fetch ${id}: ${response.status}`);
        return null;
      }
      
      const data = await response.json();
      return data;
    } catch (err) {
      console.error(`Error fetching ${id}:`, err);
      return null;
    }
  };

  const fetchAllCryptos = async () => {
    setIsLoading(true);
    setError(undefined);
    
    try {
      const results = new Map<string, CryptoData>();
      let retryCount = 0;
      const maxRetries = 10; // Maximum number of retry cycles
      
      while (retryCount < maxRetries) {
        // Get missing crypto IDs
        const missingIds = CRYPTO_IDS.filter(id => !results.has(id));
        
        if (missingIds.length === 0) break; // All cryptos fetched
        
        // Split into smaller batches of 2 to manage rate limits
        for (let i = 0; i < missingIds.length; i += 2) {
          const batchIds = missingIds.slice(i, i + 2);
          const batchResults = await Promise.all(
            batchIds.map(id => fetchSingleCrypto(id))
          );
          
          // Store successful results
          batchResults.forEach((result, index) => {
            if (result) {
              results.set(batchIds[index], result);
            }
          });
          
          // Small delay between batches
          if (i + 2 < missingIds.length) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }
        
        retryCount++;
        
        // If we still have missing cryptos, wait before next retry cycle
        if (results.size < CRYPTO_IDS.length && retryCount < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
      if (results.size === 0) {
        throw new Error('Failed to fetch any cryptocurrency data');
      }
      
      const finalResults = Array.from(results.values());
      setAllCryptos(finalResults);
      setFilteredCryptos(finalResults);
      
      if (finalResults.length < CRYPTO_IDS.length) {
        setError(new Error(`Could not fetch all cryptocurrencies after ${maxRetries} retry cycles`));
      }
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllCryptos();
  }, []);

  const handleRefresh = () => {
    fetchAllCryptos();
  };

  const handleSearch = (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setFilteredCryptos(allCryptos);
      return;
    }
    
    const filtered = allCryptos.filter(crypto => 
      crypto.data.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      crypto.data.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCryptos(filtered);
  };

  return (
    <div className="container mx-auto p-4 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-6">Crypto Price Tracker</h1>
      <div id="menu" className="flex justify-center w-full max-w-2xl">
        <SearchBar onSearch={handleSearch} />
        <button 
          onClick={handleRefresh} 
          className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Refresh
        </button>
      </div>
      {!isLoading && !error && filteredCryptos.length > 0 && (
        <div className="mt-4 bg-white rounded-lg shadow-lg w-full max-w-2xl">
          {filteredCryptos.map((crypto) => (
            <div
              key={crypto.data.id}
              className="p-4 border-b last:border-b-0 hover:bg-gray-50"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">{crypto.data.name}</h3>
                  <p className="text-sm text-gray-500">{crypto.data.symbol.toUpperCase()}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    ${Number(crypto.data.priceUsd).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {isLoading && (
          <div className="mt-4 flex justify-center">
              <div className="loader" />
          </div>
      )}
      {error && (
          <div className="mt-4 text-center text-red-600">
              {error.message}
          </div>
      )}
    </div>
  );
}
