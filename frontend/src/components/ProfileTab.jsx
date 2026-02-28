import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL, resolveImageURL } from '../config';
import { useEventTheme } from '../context/EventThemeContext';
import { EVENTS } from '../config/eventsConfig';
import { User, Mail, Phone, Home, Key, Save, Edit3, Car, FileText, Camera, Zap } from 'lucide-react';

const ProfileTab = ({ initialData, societyDetails, refreshSociety }) => {
    const { user, login } = useAuth();
    const [profile, setProfile] = useState(initialData || {});
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);

    // Form Stats
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        mobile: '',
        familyMembers: '',
        vehicleDetails: '',
        password: '',
        profileImage: null // For File Upload
    });

    const [previewImage, setPreviewImage] = useState(null);

    useEffect(() => {
        if (!initialData) {
            fetchProfile();
        } else {
            setProfile(initialData);
            setFormData({
                name: initialData.name || '',
                email: initialData.email || '',
                mobile: initialData.mobile || '',
                familyMembers: initialData.familyMembers || 0,
                vehicleDetails: initialData.vehicleDetails || '',
                password: '',
                profileImage: null
            });
        }
    }, [initialData]);

    const fetchProfile = async () => {
        try {
            // 1. Fetch User Dashboard Data
            const res = await fetch(`${API_BASE_URL}/user/dashboard`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            const data = await res.json();

            // 2. Fetch Assigned Unit Details (for Owner/Legal Info)
            const flatRes = await fetch(`${API_BASE_URL}/flats/my-unit`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            let flatData = {};
            if (flatRes.ok) {
                flatData = await flatRes.json();
            }

            const mergedProfile = { ...data.user, ...flatData }; // Merge User & Flat Data
            setProfile(mergedProfile);

            setFormData({
                name: data.user.name || '',
                email: data.user.email || '',
                mobile: data.user.mobile || '',
                familyMembers: data.user.familyMembers || 0,
                vehicleDetails: data.user.vehicleDetails || flatData.vehicleDetails || '',
                password: '',
                profileImage: null
            });
        } catch (error) {
            console.error(error);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, profileImage: file });
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            // Use FormData for Multipart Upload
            const payload = new FormData();
            payload.append('name', formData.name);
            payload.append('email', formData.email);
            payload.append('mobile', formData.mobile);
            payload.append('familyMembers', formData.familyMembers);
            payload.append('vehicleDetails', formData.vehicleDetails);
            if (formData.password) payload.append('password', formData.password);
            if (formData.profileImage) payload.append('profileImage', formData.profileImage);

            const res = await fetch(`${API_BASE_URL}/user/profile`, {
                method: 'PUT',
                headers: {
                    // Start with NO Content-Type header to let browser set boundary for multipart
                    Authorization: `Bearer ${user.token}`
                },
                body: payload
            });

            if (res.ok) {
                const updatedUser = await res.json(); // Get updated user with new image path
                alert('Profile Updated Successfully');

                // Update Local State
                setProfile(prev => ({
                    ...prev,
                    ...formData,
                    profileImage: updatedUser.profileImage || prev.profileImage
                }));

                // Update global User context if needed (optional)
                // login(updatedUser); 

                setIsEditing(false);
                setPreviewImage(null);
            } else {
                alert('Update Failed');
            }
        } catch (error) {
            console.error(error);
            alert('Error updating profile');
        } finally {
            setLoading(false);
        }
    };

    // Construct Image URL (Backend serves from /uploads)
    const getProfileImage = () => {
        if (previewImage) return previewImage;
        return resolveImageURL(profile.profileImage);
    };

    // Society Settings State
    const [societyFormData, setSocietyFormData] = useState({
        lateFeeEnabled: false,
        dailyFine: 0
    });

    useEffect(() => {
        if (societyDetails?.settings?.lateFeeRule) {
            setSocietyFormData({
                lateFeeEnabled: societyDetails.settings.lateFeeRule.enabled || false,
                dailyFine: societyDetails.settings.lateFeeRule.dailyFine || 0
            });
        }
    }, [societyDetails]);

    const handleSaveSociety = async () => {
        setLoading(true);
        try {
            // Using FormData because backend route uses multer
            const formData = new FormData();
            formData.append('lateFeeEnabled', societyFormData.lateFeeEnabled);
            formData.append('dailyFine', societyFormData.dailyFine);

            const res = await fetch(`${API_BASE_URL}/admin/society`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${user.token}` },
                body: formData
            });

            if (res.ok) {
                alert('Society Settings Updated');
                if (refreshSociety) refreshSociety();
            } else {
                alert('Update Failed');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // Theme Control
    const { toggleTheme, manualOverride } = useEventTheme();

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500 pb-20">
            {/* ... Existing User Header ... */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden transition-colors">
                <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-10"></div>

                <div className="relative z-10 group">
                    <div className="w-24 h-24 rounded-full bg-white dark:bg-slate-800 border-4 border-white dark:border-slate-800 shadow-xl flex items-center justify-center text-3xl font-bold text-blue-600 overflow-hidden relative transition-colors">
                        {getProfileImage() ? (
                            <img src={getProfileImage()} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <span>{profile.name ? profile.name[0].toUpperCase() : 'U'}</span>
                        )}

                        {isEditing && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center cursor-pointer transition-opacity opacity-0 group-hover:opacity-100">
                                <Camera className="text-white" size={24} />
                            </div>
                        )}
                    </div>

                    {isEditing && (
                        <input
                            type="file"
                            accept="image/*"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer rounded-full z-20"
                            onChange={handleImageChange}
                        />
                    )}
                </div>

                <div className="relative z-10 text-center md:text-left flex-1">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white">{profile.name}</h2>
                    <p className="text-slate-500 dark:text-slate-400 font-medium capitalize">{profile.role} Account</p>
                    <div className="mt-2 flex flex-wrap justify-center md:justify-start gap-3">
                        {profile.flatNo && (
                            <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-full text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                                <Home size={12} /> {profile.block ? `${profile.block}-` : ''}{profile.flatNo}
                            </span>
                        )}
                        {profile.parking && (
                            <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-full text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                                🅿️ {profile.parking}
                            </span>
                        )}
                    </div>
                </div>

                <div className="relative z-10">
                    <button
                        onClick={() => setIsEditing(!isEditing)}
                        className={`px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-all ${isEditing ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                    >
                        {isEditing ? 'Cancel Edit' : <><Edit3 size={16} /> Edit Profile</>}
                    </button>
                </div>
            </div>

            {/* Details Form/View */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 transition-colors">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                        <User size={20} className="text-blue-500" /> Personal Details
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Full Name</label>
                            {isEditing ? (
                                <input
                                    className="w-full p-2 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            ) : (
                                <p className="font-semibold text-slate-800 dark:text-white">{profile.name}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Email Address</label>
                            <div className="flex items-center gap-2">
                                <Mail size={16} className="text-slate-400 dark:text-slate-500" />
                                <p className="font-semibold text-slate-800 dark:text-white">{profile.email}</p>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Mobile Number</label>
                            {isEditing ? (
                                <input
                                    className="w-full p-2 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                                    value={formData.mobile}
                                    onChange={e => setFormData({ ...formData, mobile: e.target.value })}
                                />
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Phone size={16} className="text-slate-400 dark:text-slate-500" />
                                    <p className="font-semibold text-slate-800 dark:text-white">{profile.mobile || 'Not Set'}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 transition-colors">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                        <Car size={20} className="text-purple-500" /> Household Info
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Family Members Count</label>
                            {isEditing ? (
                                <input
                                    type="number"
                                    className="w-full p-2 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                                    value={formData.familyMembers}
                                    onChange={e => setFormData({ ...formData, familyMembers: e.target.value })}
                                />
                            ) : (
                                <p className="font-semibold text-slate-800 dark:text-white">{profile.familyMembers || 0}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Vehicle Details</label>
                            {isEditing ? (
                                <textarea
                                    className="w-full p-2 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g. MH02 AB 1234 (Car)"
                                    value={formData.vehicleDetails}
                                    onChange={e => setFormData({ ...formData, vehicleDetails: e.target.value })}
                                />
                            ) : (
                                <p className="font-semibold text-slate-800 dark:text-white whitespace-pre-wrap">{profile.vehicleDetails || 'No Vehicles Registered'}</p>
                            )}
                        </div>

                        {isEditing && (
                            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700">
                                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Change Password</label>
                                <div className="flex items-center gap-2">
                                    <Key size={16} className="text-slate-400 dark:text-slate-500" />
                                    <input
                                        type="password"
                                        className="w-full p-2 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter new password to change"
                                        value={formData.password}
                                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* PROPERTY & LEGAL DETAILS CARD (View Only for User) */}
                {/* Property Details Hidden */}
            </div>

            {/* SOCIETY SETTINGS (ADMIN ONLY) */}
            {societyDetails && user?.role === 'admin' && (
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 border-l-4 border-l-orange-500 transition-colors">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                            <span className="text-orange-500">⚖️</span> Finance & Penalty Rules
                        </h3>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        <div>
                            <label className="flex items-center gap-3 p-4 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                                <input
                                    type="checkbox"
                                    className="w-5 h-5 accent-indigo-600"
                                    checked={societyFormData.lateFeeEnabled}
                                    onChange={e => setSocietyFormData({ ...societyFormData, lateFeeEnabled: e.target.checked })}
                                    disabled={!isEditing}
                                />
                                <div>
                                    <div className="font-bold text-slate-700 dark:text-slate-200">Enable Late Fees</div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400">Auto-apply fines for overdue bills</div>
                                </div>
                            </label>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Daily Fine Amount (₹)</label>
                            <input
                                type="number"
                                className={`w-full p-3 border border-slate-200 dark:border-slate-600 rounded-xl font-bold outline-none transition-colors ${!isEditing ? 'bg-slate-50 dark:bg-slate-900/50 text-slate-400 dark:text-slate-500' : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-orange-200 dark:focus:ring-orange-900'}`}
                                value={societyFormData.dailyFine}
                                onChange={e => setSocietyFormData({ ...societyFormData, dailyFine: Number(e.target.value) })}
                                disabled={!isEditing}
                                placeholder="0"
                            />
                            <p className="text-[10px] text-slate-400 mt-1">Applied daily after due date.</p>
                        </div>
                    </div>
                    {isEditing && (
                        <div className="mt-4 flex justify-end">
                            <button onClick={handleSaveSociety} className="text-xs font-bold text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 flex items-center gap-1">
                                <Save size={14} /> Update Society Rules
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* THEME SETTINGS (ADMIN ONLY) */}
            {user?.role === 'admin' && (
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 border-l-4 border-l-purple-500 transition-colors">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                            <Zap size={20} className="text-purple-500" /> Festive Theme Control
                        </h3>
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${manualOverride ? (manualOverride === 'off' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400') : 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'}`}>
                            {manualOverride ? (manualOverride === 'off' ? '● Disabled' : '● Forced On') : '● Auto Mode'}
                        </span>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 items-center">
                        <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
                                Control how the application celebrates festivals. Use <strong>'Auto'</strong> to follow the calendar, or force a specific theme for testing.
                            </p>
                            <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Override Setting</label>

                            <div className="relative">
                                <select
                                    value={manualOverride || ''}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        toggleTheme(val === '' ? null : val);
                                    }}
                                    className="w-full appearance-none p-3 pl-4 pr-10 border-2 border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white rounded-xl font-medium focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all cursor-pointer"
                                    style={{ backgroundImage: 'none' }}
                                >
                                    <option value="">✨ Auto (Calendar Based)</option>
                                    <option value="off">🚫 Disable All Animations</option>
                                    <optgroup label="Select Festival to Force">
                                        {EVENTS.map(ev => {
                                            // Append Year if specific year is defined, otherwise just name
                                            const label = ev.year ? `${ev.name} (${ev.year})` : ev.name;
                                            return <option key={ev.id} value={ev.id}>{label}</option>;
                                        })}
                                    </optgroup>
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                                </div>
                            </div>
                        </div>

                        <div className={`p-5 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center text-center gap-2 h-full transition-all ${manualOverride ? 'bg-purple-50 border-purple-200 dark:bg-purple-900/10 dark:border-purple-800' : 'bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700'}`}>
                            {manualOverride ? (
                                manualOverride === 'off' ? (
                                    <>
                                        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-1">
                                            <span className="text-2xl">🚫</span>
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-700 dark:text-slate-200">Animations Disabled</p>
                                            <p className="text-xs text-slate-500">No effects will be shown.</p>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-1 animate-bounce-slow">
                                            <span className="text-2xl">⚡</span>
                                        </div>
                                        <div>
                                            <p className="font-bold text-purple-700 dark:text-purple-300">
                                                {(() => {
                                                    const ev = EVENTS.find(e => e.id === manualOverride);
                                                    return ev ? (ev.year ? `${ev.name} ${ev.year}` : ev.name) : 'Active';
                                                })()}
                                            </p>
                                            <p className="text-xs text-purple-600/80 dark:text-purple-400/80">Manual Override Active</p>
                                        </div>
                                    </>
                                )
                            ) : (
                                <>
                                    <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mb-1">
                                        <span className="text-2xl">📅</span>
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-700 dark:text-slate-200">Auto Schedule</p>
                                        <p className="text-xs text-slate-500">Checking dates automatically...</p>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {isEditing && (
                <div className="flex justify-end pt-4 sticky bottom-0 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur p-4 border-t border-slate-200 dark:border-slate-700">
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="px-8 py-3 bg-green-600 text-white font-bold rounded-xl shadow-lg hover:bg-green-700 transition flex items-center gap-2"
                    >
                        {loading ? 'Saving...' : <><Save size={20} /> Save Changes</>}
                    </button>
                </div>
            )}
        </div>
    );
};

export default ProfileTab;
