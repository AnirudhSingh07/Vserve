"use client";

import React, { useState } from "react";
import { Loader2, Zap, MapPin, ChevronRight, AlertTriangle } from "lucide-react";

export default function QuickDebugPage() {
  const [origin, setOrigin] = useState("22.9676,76.0534"); 
  const [destination, setDestination] = useState("22.7196,75.8577");
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runTest = async () => {
    setLoading(true);
    setResponse(null);
    try {
      const res = await fetch("/api/debug-google", {
        method: "POST",
        body: JSON.stringify({ origin, destination }),
      });
      const data = await res.json();
      setResponse(data);
    } catch (err) {
      alert("Request Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white p-6 font-sans">
      <div className="max-w-2xl mx-auto border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8">
        <h1 className="text-3xl font-black uppercase mb-2 flex items-center gap-2">
          <Zap className="fill-yellow-400" /> API Diagnostic Tool
        </h1>
        <p className="text-sm text-gray-600 mb-8 border-b-2 border-black pb-4">
          Reading key from <code className="bg-gray-100 px-1 font-bold italic text-red-600">.env.GOOGLE_MAPS_API_KEY</code>
        </p>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase">Start Coords (Origin)</label>
              <div className="flex items-center gap-2 bg-gray-50 border-2 border-black p-3">
                <MapPin size={16} className="text-red-500" />
                <input value={origin} onChange={(e)=>setOrigin(e.target.value)} className="bg-transparent outline-none w-full font-mono text-sm" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase">End Coords (Destination)</label>
              <div className="flex items-center gap-2 bg-gray-50 border-2 border-black p-3">
                <MapPin size={16} className="text-emerald-500" />
                <input value={destination} onChange={(e)=>setDestination(e.target.value)} className="bg-transparent outline-none w-full font-mono text-sm" />
              </div>
            </div>
          </div>

          <button 
            onClick={runTest}
            disabled={loading}
            className="w-full bg-black text-white font-black py-4 uppercase tracking-widest hover:bg-yellow-400 hover:text-black transition-all flex items-center justify-center gap-3"
          >
            {loading ? <Loader2 className="animate-spin" /> : "Run Connection Test"}
            <ChevronRight />
          </button>

          {response && (
            <div className="mt-8 animate-in fade-in slide-in-from-top-2">
              <div className={`p-4 border-2 border-black mb-4 flex items-center justify-between ${response.status === 'OK' ? 'bg-emerald-100' : 'bg-red-100'}`}>
                <span className="font-black uppercase">Status: {response.status}</span>
                {response.status === 'OK' && (
                  <span className="font-bold text-xl">{(response.routes[0].legs[0].distance.value / 1000).toFixed(2)} KM</span>
                )}
              </div>

              <div className="bg-gray-900 text-green-400 p-6 rounded-sm overflow-x-auto shadow-inner">
                <p className="text-[10px] text-gray-500 font-bold mb-4 border-b border-gray-800 pb-2">FULL GOOGLE RESPONSE DATA</p>
                <pre className="text-xs font-mono leading-relaxed">
                  {JSON.stringify(response, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {response?.error_message && (
            <div className="mt-4 p-4 bg-red-50 border-l-4 border-red-600 text-red-700 text-sm font-medium">
              <AlertTriangle className="inline-block mr-2" size={16} />
              {response.error_message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}