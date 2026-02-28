import React, { createContext, useContext, useState, useEffect } from 'react';
import { getActiveEvent, EVENTS } from '../config/eventsConfig';
import { API_BASE_URL } from '../config';
import { useAuth } from './AuthContext';
import io from 'socket.io-client';

const EventThemeContext = createContext();

export const useEventTheme = () => useContext(EventThemeContext);

export const EventThemeProvider = ({ children }) => {
    const { user } = useAuth();
    const [activeEvent, setActiveEvent] = useState(null);
    const [manualOverride, setManualOverride] = useState(null); // Server synced state

    // 1. Fetch Global Config on Mount & Listen to Socket
    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/config/public`);
                const data = await res.json();
                if (data.festiveThemeOverride !== undefined) {
                    setManualOverride(data.festiveThemeOverride);
                }
            } catch (error) {
                console.error("Failed to fetch festive theme config", error);
            }
        };

        fetchConfig();

        // Socket Listener for Real-time Updates
        const socket = io(API_BASE_URL);
        socket.on('connect', () => console.log("🎨 Theme Socket Connected"));
        socket.on('global_config_updated', (data) => {
            console.log("⚡ Theme Updated Externally:", data);
            setManualOverride(data.festiveThemeOverride);
        });

        return () => {
            socket.off('global_config_updated');
            socket.disconnect();
        };
    }, []);

    // 2. Admin Action to Update Global Theme
    const toggleTheme = async (eventId) => {
        // Optimistic UI Update
        const newValue = eventId === '' ? null : eventId;
        setManualOverride(newValue);

        if (!user || user.role !== 'admin') {
            console.warn("Only admins can save global theme.");
            return;
        }

        try {
            await fetch(`${API_BASE_URL}/config`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify({ festiveThemeOverride: newValue })
            });
        } catch (error) {
            console.error("Failed to save global theme", error);
        }
    };

    // 3. Apply Theme Logic (Same as before)
    useEffect(() => {
        // A. Manual Override Active
        if (manualOverride) {
            if (manualOverride === 'off') {
                setActiveEvent(null);
                removeCssVariables();
                return;
            }
            // Find event by ID
            const forcedEvent = EVENTS.find(e => e.id === manualOverride);
            if (forcedEvent) {
                applyEvent(forcedEvent);
            }
            return;
        }

        // B. Auto-Detection Logic
        const event = getActiveEvent();
        if (event) {
            // console.log("🎉 Festive Mode Activated:", event.name);
            applyEvent(event);
        } else {
            setActiveEvent(null);
            removeCssVariables();
        }
    }, [manualOverride]);

    const applyEvent = (event) => {
        setActiveEvent(event);
        if (event.theme) {
            // Update Global Theme Variables which Tailwind uses
            document.documentElement.style.setProperty('--theme-primary', event.theme.primary);
            // Optional: You could map secondary/accent if used elsewhere
        }
    };

    const removeCssVariables = () => {
        // Revert to Default Indigo
        document.documentElement.style.setProperty('--theme-primary', '#4f46e5');
    };

    return (
        <EventThemeContext.Provider value={{ activeEvent, toggleTheme, manualOverride }}>
            {children}
        </EventThemeContext.Provider>
    );
};
