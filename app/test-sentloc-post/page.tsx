"use client";

import React, { useState } from "react";
import { Loader2, Send, Database, MapPin, Phone, RefreshCcw } from "lucide-react";

export default function PostTestPage() {
  const [phone, setPhone] = useState("");
  const [lat, setLat] = useState("22.9676"); // Default Dewas
  const [lng, setLng] = useState("76.0534");
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const triggerPostRequest = async () => {
    setLoading(true);
    setResponse(null);

    try {
      const res = await fetch("/api/attendance/sentloc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: phone,
          coords: {
            lat: parseFloat(lat),
            lng: parseFloat(lng),
          },
        }),
      });

      const data = await res.json();
      setResponse(data);
    } catch (err) {
      setResponse({ success: false, error: "Network or Server Error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans text-gray-800">
      <div className="max-w-2xl mx-auto bg-white shadow-2xl rounded-3xl overflow-hidden border-t-8 border-blue-600">
        
        {/* Header */}
        <div className="p-6 bg-blue-50 border-b border-blue-100">
          <h1 className="text-2xl font-black uppercase tracking-tight flex items-center gap-2 text-blue-800">
            <Database size={24} /> API POST TESTER
          </h1>
          <p className="text-xs font-bold text-blue-400 mt-1 uppercase italic">Testing: /api/sentloc</p>
        </div>

        <div className="p-8 space-y-6">
          {/* Input Section */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block">Employee Phone Number</label>
              <div className="flex items-center gap-2 bg-gray-50 border-2 border-gray-200 rounded-xl p-3 focus-within:border-blue-500 transition-all">
                <Phone size={18} className="text-gray-400" />
                <input 
                  type="text" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter 10 digit phone"
                  className="bg-transparent outline-none w-full font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block">Current Latitude</label>
                <div className="flex items-center gap-2 bg-gray-50 border-2 border-gray-200 rounded-xl p-3 focus-within:border-blue-500 transition-all">
                  <MapPin size={18} className="text-red-400" />
                  <input 
                    type="number" 
                    value={lat} 
                    onChange={(e) => setLat(e.target.value)}
                    className="bg-transparent outline-none w-full font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block">Current Longitude</label>
                <div className="flex items-center gap-2 bg-gray-50 border-2 border-gray-200 rounded-xl p-3 focus-within:border-blue-500 transition-all">
                  <MapPin size={18} className="text-emerald-400" />
                  <input 
                    type="number" 
                    value={lng} 
                    onChange={(e) => setLng(e.target.value)}
                    className="bg-transparent outline-none w-full font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <button 
            onClick={triggerPostRequest}
            disabled={loading || !phone}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg disabled:bg-gray-300 uppercase tracking-widest"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Send size={20} />}
            Push Data to MongoDB
          </button>

          {/* Response Display */}
          {response && (
            <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className={`p-4 rounded-2xl border-2 mb-4 flex items-center justify-between ${response.success ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                <div className="flex items-center gap-2">
                  <RefreshCcw size={16} className={loading ? "animate-spin" : ""} />
                  <span className="font-bold uppercase tracking-tighter">API Status: {response.success ? "SUCCESS" : "FAILED"}</span>
                </div>
                {response.success && <span className="text-xs font-black bg-emerald-200 px-2 py-1 rounded">200 OK</span>}
              </div>

              <div className="bg-gray-900 rounded-2xl p-6 overflow-hidden shadow-inner">
                <p className="text-[10px] font-black text-gray-500 uppercase mb-4 border-b border-gray-800 pb-2">Response JSON from /api/sentloc</p>
                <pre className="text-xs font-mono text-blue-300 overflow-x-auto leading-relaxed">
                  {JSON.stringify(response, null, 2)}
                </pre>
              </div>

              {response.success && (
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                    <p className="text-[10px] font-black text-blue-400 uppercase">Distance Added</p>
                    <p className="text-2xl font-black text-blue-800">{response.segmentAdded} KM</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-right">
                    <p className="text-[10px] font-black text-blue-400 uppercase">Total Distance (Today)</p>
                    <p className="text-2xl font-black text-blue-800">{response.totalToday} KM</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <p className="text-center mt-6 text-gray-400 text-[10px] font-bold uppercase tracking-widest">Manual API Testing Environment</p>
    </div>
  );
}