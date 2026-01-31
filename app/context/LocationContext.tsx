import React, { createContext, useContext, useEffect, useState } from 'react';
import { Geolocation } from '@capacitor/geolocation';

interface Location {
  lat: number;
  lng: number;
}

interface LocationContextType {
  location: Location | null;
  loading: boolean;
  error: string | null;
  refreshLocation: () => Promise<void>;
}

const LocationContext = createContext<LocationContextType>({
  location: null,
  loading: true,
  error: null,
  refreshLocation: async () => {},
});

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [location, setLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLocation = async () => {
    try {
      setLoading(true);
      const permResult = await Geolocation.requestPermissions();
      if (permResult.location === 'granted') {
        const pos = await Geolocation.getCurrentPosition({
          enableHighAccuracy: true,
        });
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      } else {
        setError('Location permission not granted');
      }
    } catch (err) {
      setError('Error fetching location');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocation();
  }, []);

  return (
    <LocationContext.Provider value={{ location, loading, error, refreshLocation: fetchLocation }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => useContext(LocationContext);
