import React, { useState } from 'react';
import { ScanLine, RefreshCcw, Camera, AlertCircle } from 'lucide-react';
import { API_BASE_URL } from '../../../config';
import { Scanner } from '@yudiel/react-qr-scanner';

const ScanTab = ({ user, GoHome }) => {
    const [code, setCode] = useState('');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [cameraError, setCameraError] = useState(null);

    const checkCode = async (scanData) => {
        if (!scanData) return;
        // scanData might be object or string depending on lib version, normally [{rawValue: "..."}]
        const rawCode = scanData[0]?.rawValue || scanData;
        console.log("Scanned:", rawCode);

        // If it's a URL or complex string, extraction logic might be needed. 
        // Our system uses simple Alphanumeric, so we just pass it.
        await verify(rawCode);
    };

    const verify = async (inputCode) => {
        const queryCode = inputCode || code;
        if (!queryCode || queryCode.length < 6) return;

        setLoading(true);
        try {
            const r = await fetch(`${API_BASE_URL}/guard/verify-qr`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
                body: JSON.stringify({ qrCode: queryCode })
            });
            const data = await r.json();
            setResult(data);
        } catch (e) {
            setResult({ message: 'Error verifying code', error: true });
        } finally {
            setLoading(false);
        }
    };

    const reset = () => {
        setResult(null);
        setCode('');
        setCameraError(null);
    };

    return (
        <div className="animate-in zoom-in duration-500 flex flex-col items-center pt-8 h-full max-w-md mx-auto w-full">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Access Control</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-bold">Scan QR or Enter Entry Code</p>
            </div>

            {!result ? (
                <div className="w-full space-y-8">
                    {/* Camera Section */}
                    <div className="mx-auto w-full aspect-square max-w-[280px] bg-slate-900 rounded-[2.5rem] border-8 border-slate-800 dark:border-slate-700 flex items-center justify-center relative overflow-hidden shadow-2xl shadow-indigo-500/20">
                        {!cameraError ? (
                            <Scanner
                                onScan={(result) => {
                                    if (result && result.length > 0) {
                                        checkCode(result);
                                    }
                                }}
                                onError={(error) => {
                                    if (error?.name === 'AbortError' || error?.name === 'NotAllowedError') {
                                        // Ignore stream interruption or permission denial for now
                                        console.log('Scanner stream interrupted');
                                    } else {
                                        console.error(error);
                                        // setCameraError('Camera Access Failed'); // Optional: Show UI error
                                    }
                                }}
                                components={{
                                    audio: false,
                                    tracker: true,
                                    onOff: false,
                                }}
                                constraints={{
                                    facingMode: 'environment'
                                }}
                                styles={{
                                    container: { width: '100%', height: '100%', borderRadius: '1.5rem' }
                                }}
                            />
                        ) : (
                            <div className="text-center p-6">
                                <AlertCircle className="mx-auto text-red-500 mb-3" size={48} />
                                <p className="text-white text-sm font-bold">{cameraError}</p>
                            </div>
                        )}

                        {/* Overlay Scan UI */}
                        {!cameraError && (
                            <div className="absolute inset-0 pointer-events-none">
                                <div className="absolute inset-0 border-[24px] border-slate-900/60 rounded-[2.5rem]"></div>
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-indigo-400/80 rounded-2xl animate-pulse shadow-[0_0_20px_rgba(99,102,241,0.5)]">
                                    <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-indigo-500 -mt-1 -ml-1"></div>
                                    <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-indigo-500 -mt-1 -mr-1"></div>
                                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-indigo-500 -mb-1 -ml-1"></div>
                                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-indigo-500 -mb-1 -mr-1"></div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Manual Entry Section */}
                    <div className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-none">
                        <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4 block text-center">Manual Entry Backup</label>
                        <div className="relative mb-6">
                            <input
                                className="w-full text-center text-4xl font-mono tracking-[0.5em] py-4 border-b-2 border-slate-200 dark:border-slate-700 outline-none focus:border-indigo-600 dark:focus:border-indigo-500 bg-transparent uppercase transition-all font-black text-slate-800 dark:text-white placeholder:text-slate-200 dark:placeholder:text-slate-700"
                                maxLength={6}
                                placeholder="000000"
                                value={code}
                                onChange={e => setCode(e.target.value.toUpperCase())}
                            />
                            <ScanLine className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600" size={24} />
                        </div>

                        <button
                            onClick={() => verify(code)}
                            disabled={loading || code.length < 6}
                            className="w-full bg-slate-900 dark:bg-indigo-600 text-white rounded-2xl py-4 font-bold text-sm shadow-lg shadow-slate-200 dark:shadow-indigo-900/20 disabled:opacity-50 disabled:shadow-none transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                    Verifying...
                                </>
                            ) : (
                                <>
                                    <ScanLine size={18} />
                                    Validate Entry Pass
                                </>
                            )}
                        </button>
                    </div>

                    <button onClick={GoHome} className="w-full py-4 text-slate-400 dark:text-slate-500 font-bold text-sm hover:text-slate-800 dark:hover:text-white transition-colors">
                        Cancel & Return Home
                    </button>
                </div>
            ) : (
                <div className="w-full max-w-sm text-center animate-in slide-in-from-bottom duration-500">
                    <div className={`mx-auto w-28 h-28 rounded-3xl flex items-center justify-center mb-8 shadow-2xl ${result.visitor
                        ? 'bg-emerald-500 shadow-emerald-500/30'
                        : 'bg-red-500 shadow-red-500/30'
                        }`}>
                        {result.visitor ? <ScanLine size={48} className="text-white" /> : <RefreshCcw size={48} className="text-white" />}
                    </div>

                    <h3 className={`text-2xl font-black mb-2 ${result.visitor ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
                        {result.message}
                    </h3>

                    {result.error && <p className="text-slate-400 text-sm mb-6">Code invalid or expired.</p>}

                    {result.visitor && (
                        <div className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] shadow-xl border border-slate-100 dark:border-slate-700 mb-8 text-left relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>

                            <div className="relative z-10">
                                <div className="mb-4">
                                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Guest Name</p>
                                    <p className="text-2xl font-black text-slate-800 dark:text-white">{result.visitor.name}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Type</p>
                                        <p className="text-sm font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-lg w-fit">
                                            {result.visitor.visitorType}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Pass ID</p>
                                        <p className="text-sm font-mono font-bold text-slate-600 dark:text-slate-300">#{code || 'SCAN'}</p>
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Visiting</p>
                                    <p className="text-lg font-bold text-slate-800 dark:text-white">
                                        {result.visitor.hostUserId?.name || 'Unknown Host'}
                                    </p>
                                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                        {result.visitor.hostFlatId?.flatNo
                                            ? `Flat ${result.visitor.hostFlatId?.block || ''}-${result.visitor.hostFlatId?.flatNo}`
                                            : (result.visitor.hostUserId?.flatNo ? `Flat ${result.visitor.hostUserId?.flatNo}` : 'General Visit')}
                                    </p>
                                </div>

                                <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl text-emerald-700 dark:text-emerald-400 text-center font-bold text-sm border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center gap-2">
                                    <CheckCircle size={18} /> CHECK-IN APPROVED
                                </div>
                            </div>
                        </div>
                    )}

                    <button onClick={reset} className="w-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold py-4 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                        Scan Another Code
                    </button>
                </div>
            )}
        </div>
    );
};

export default ScanTab;
