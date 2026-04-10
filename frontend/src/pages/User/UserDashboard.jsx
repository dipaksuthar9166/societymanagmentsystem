import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL, BACKEND_URL, resolveImageURL } from '../../config';
import { io } from 'socket.io-client';
import { useToast } from '../../components/ToastProvider';
import {
    LayoutDashboard,
    Receipt,
    Bell,
    AlertCircle,
    Shield,
    LogOut,
    Menu,
    User,
    Download,
    Building,
    ChevronRight,
    QrCode,
    Calendar,
    Home,
    TrendingUp,
    Clock,
    CheckCircle,
    XCircle,
    Wallet,
    Zap,
    Video,
    Phone,
    ClipboardList,
    Megaphone,
    Hammer,
    Umbrella,
    CreditCard,
    FileText,
    MoreHorizontal,
    Smile,
    MapPin,
    Users,
    PartyPopper,
    Search,
    Camera,
    Trash2,
    ShieldAlert,
    Activity
} from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    ArcElement // Added
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2'; // Added Bar, Doughnut

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    ArcElement // Added
);
import Navbar from '../../components/Navbar';
import GatePass from './GatePass';
import SOSButton from '../../components/SOSButton';
import ChatWidget from '../../components/ChatWidget';
import SocietyDirectory from '../../components/SocietyDirectory';
import UserFacilityBooking from './UserFacilityBooking';
import SkillMarketplace from './SkillMarketplace';
import EVParking from './EVParking';
import ProfileTab from '../../components/ProfileTab';
import ComplaintsTab from './components/ComplaintsTab';
import SubscriptionLock from '../../components/SubscriptionLock';
import AdminSubscription from '../Admin/AdminSubscription';
import ConfirmationModal from '../../components/ConfirmationModal';
import ResidentCCTV from './components/ResidentCCTV';
import IntercomCallTab from '../Guard/components/IntercomCallTab';
import DailyHelpTab from './components/DailyHelpTab';
import ForumTab from './components/ForumTab';
import PollsTab from './components/PollsTab';
import usePreventBack from '../../hooks/usePreventBack';

// --- Shared Components for Admin-like Look ---

const StatCard = ({ label, value, sub, icon: Icon, color, trend }) => {
    const gradients = {
        blue: 'from-blue-500 via-cyan-500 to-blue-500',
        green: 'from-green-500 via-emerald-500 to-green-500',
        orange: 'from-orange-500 via-amber-500 to-orange-500',
        red: 'from-red-500 via-rose-500 to-red-500',
        indigo: 'from-indigo-500 via-purple-500 to-indigo-500',
        purple: 'from-purple-500 via-pink-500 to-purple-500'
    };

    const iconBg = {
        blue: 'bg-blue-50 dark:bg-blue-900/30',
        green: 'bg-green-50 dark:bg-green-900/30',
        orange: 'bg-orange-50 dark:bg-orange-900/30',
        red: 'bg-red-50 dark:bg-red-900/30',
        indigo: 'bg-indigo-50 dark:bg-indigo-900/30',
        purple: 'bg-purple-50 dark:bg-purple-900/30'
    };

    const iconColor = {
        blue: 'text-blue-600 dark:text-blue-400',
        green: 'text-green-600 dark:text-green-400',
        orange: 'text-orange-600 dark:text-orange-400',
        red: 'text-red-600 dark:text-red-400',
        indigo: 'text-indigo-600 dark:text-indigo-400',
        purple: 'text-purple-600 dark:text-purple-400'
    };

    const trendBg = {
        blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
        green: 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400',
        orange: 'bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
        red: 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400',
        indigo: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400',
        purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'
    };

    const circleBg = {
        blue: 'bg-blue-50 dark:bg-blue-500',
        green: 'bg-green-50 dark:bg-green-500',
        orange: 'bg-orange-50 dark:bg-orange-500',
        red: 'bg-red-50 dark:bg-red-500',
        indigo: 'bg-indigo-50 dark:bg-indigo-500',
        purple: 'bg-purple-50 dark:bg-purple-500'
    };

    return (
        <div className="relative overflow-hidden bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300 group cursor-pointer transform hover:scale-[1.02]">
            {/* Animated Gradient Top Border */}
            <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${gradients[color]} animate-gradient bg-[length:200%_100%]`}></div>

            <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                    <div className={`p-2 rounded-lg ${iconBg[color]} group-hover:scale-110 transition-transform duration-300`}>
                        <Icon size={18} className={iconColor[color]} />
                    </div>
                    {trend && (
                        <div className={`flex items-center gap-1 text-xs font-bold px-1.5 py-0.5 rounded ${trendBg[color]}`}>
                            <TrendingUp size={12} />
                            {trend}
                        </div>
                    )}
                </div>
                <div>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">{label}</p>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-0.5 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-indigo-400 group-hover:to-purple-400 transition-all duration-300">{value}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{sub}</p>
                </div>
            </div>

            {/* Decorative Circle */}
            <div className={`absolute bottom-0 right-0 w-16 h-16 ${circleBg[color]} rounded-full -mr-8 -mb-8 opacity-20 dark:opacity-10 group-hover:opacity-30 dark:group-hover:opacity-20 transition-opacity duration-300`}></div>

            {/* Custom Animation */}
            <style>{`
                @keyframes gradient {
                    0%, 100% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                }
                .animate-gradient { animation: gradient 3s ease infinite; }
                .animate-wave { animation: wave 2.5s infinite; transform-origin: 70% 70%; display: inline-block; }
                @keyframes wave { 0% { transform: rotate(0deg); } 10% { transform: rotate(14deg); } 20% { transform: rotate(-8deg); } 30% { transform: rotate(14deg); } 40% { transform: rotate(-4deg); } 50% { transform: rotate(10deg); } 60% { transform: rotate(0deg); } 100% { transform: rotate(0deg); } }
            `}</style>
        </div>
    );
};

const QuickAction = ({ label, icon: Icon, onClick, color = 'indigo' }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-3 p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-${color}-300 dark:hover:border-${color}-500 hover:shadow-md transition-all group`}
    >
        <div className={`p-2 rounded-lg bg-${color}-50 dark:bg-${color}-900/30 group-hover:bg-${color}-100 dark:group-hover:bg-${color}-900/50 transition-colors`}>
            <Icon size={20} className={`text-${color}-600 dark:text-${color}-400`} />
        </div>
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{label}</span>
        <ChevronRight size={16} className="ml-auto text-slate-400 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
    </button>
);

const UserDashboard = () => {
    usePreventBack();
    const { user, logout } = useAuth();
    const { showSuccess, showInfo, showWarning, showError } = useToast();
    const [activeTab, setActiveTab] = useState('home');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [showSOS, setShowSOS] = useState(false);
    const [childApprovalData, setChildApprovalData] = useState(null);
    const [incomingCall, setIncomingCall] = useState(null);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showMoreSheet, setShowMoreSheet] = useState(false);
    const [visitorApprovalData, setVisitorApprovalData] = useState(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 1024);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const fetchDashboard = async () => {
        if (user?.isDemo) {
            setData({
                user: { name: "Demo Resident", flatNo: "A-502", role: "user" },
                society: { name: "SocietyPro Demo Residency", address: "Cyber Hub, Mumbai" },
                walletBalance: 2500,
                recentInvoices: [
                    { _id: "INV001", amount: 4500, status: "Paid", createdAt: new Date().toISOString() },
                    { _id: "INV002", amount: 4500, status: "Pending", createdAt: new Date().toISOString() }
                ],
                announcements: [
                    { title: "General Body Meeting", content: "Sunday at 11:00 AM in Clubhouse", date: new Date().toLocaleDateString() },
                    { title: "Water Supply Notice", content: "Borewell maintenance on Thursday", date: new Date().toLocaleDateString() }
                ],
                complaints: [
                    { title: "Leaking Tap", status: "Resolved", date: new Date().toLocaleDateString() }
                ]
            });
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/user/dashboard`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            if (res.status === 401) { logout(); return; }
            if (res.ok) {
                const json = await res.json();
                setData(json);
            }
        } catch (error) {
            console.error("Dashboard Fetch Error", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) fetchDashboard();
    }, [user]);

    // Socket Listener for Real-time events
    useEffect(() => {
        const socket = io(BACKEND_URL, {
            transports: ['polling', 'websocket']
        });
        if (user) {
            if (user.company) socket.emit('join_society', user.company);
            socket.emit('join_room', user.id || user._id);
        }

        socket.on('subscription_updated', (data) => {
            fetchDashboard();
        });

        socket.on('new_visitor', (data) => {
            console.log("🔔 New Visitor Event:", data);
            fetchDashboard();
            setVisitorApprovalData(data);
        });

        socket.on('child_exit_request', (data) => {
            console.log("⚠️ Child Exit Request:", data);
            setChildApprovalData(data);
        });

        socket.on('incoming-call', (data) => {
            console.log("📞 Incoming Call:", data);
            setIncomingCall(data);
            // Optional: Play ringtone here
        });

        socket.on('call-rejected', () => {
            setCallingStatus(null);
            showError('Call Ended', 'The call was disconnected or rejected.');
        });

        return () => socket.disconnect();
    }, [user]);

    // Traditional Indian Society Bill Format PDF
    const downloadInvoice = async (bill) => {
        try {
            await import('jspdf-autotable');
            const doc = new jsPDF();
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            const margin = 10;
            const contentWidth = pageWidth - (margin * 2);

            // Get society details from the correct data structure
            const societyName = data?.society?.name || data?.user?.company?.name || "My Cooperative Housing Society Ltd";
            const societyAddress = data?.society?.address || data?.user?.company?.address || "Somewhere in Mumbai, Mumbai 400034";
            const regNo = data?.society?.gstNumber ? `Reg No: ${data.society.gstNumber}` : `Reg No: 123123 dtd 12/10/2001`;

            const billNo = bill._id.slice(-6).toUpperCase();
            const billDate = new Date(bill.createdAt).toLocaleDateString('en-GB');
            const dueDate = bill.dueDate ? new Date(bill.dueDate).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB');
            const memberName = data?.user?.name || "Member";
            const flatNo = data?.user?.flatNo || "A-101";
            const periodFrom = bill.billingPeriod?.from ? new Date(bill.billingPeriod.from).toLocaleDateString('en-GB') : "1st Jan 2024";
            const periodTo = bill.billingPeriod?.to ? new Date(bill.billingPeriod.to).toLocaleDateString('en-GB') : "31st March 2024";

            let yPos = margin;

            // OUTER BORDER
            doc.setLineWidth(0.8);
            doc.rect(margin, margin, contentWidth, pageHeight - (margin * 2));

            // HEADER
            yPos += 8;
            doc.setFont('times', 'bold');
            doc.setFontSize(16);
            doc.text(societyName, pageWidth / 2, yPos, { align: 'center' });

            yPos += 5;
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8);
            doc.text(societyAddress, pageWidth / 2, yPos, { align: 'center' });

            yPos += 3;
            doc.setLineWidth(0.5);
            doc.line(margin, yPos, pageWidth - margin, yPos);

            // METADATA GRID
            yPos += 0.5;
            const gridStartY = yPos;
            const col1X = margin;
            const col2X = margin + (contentWidth / 3);
            const col3X = margin + (2 * contentWidth / 3);
            const rowHeight = 8;

            doc.setLineWidth(0.3);
            doc.line(col2X, gridStartY, col2X, gridStartY + (rowHeight * 2));
            doc.line(col3X, gridStartY, col3X, gridStartY + (rowHeight * 2));
            doc.line(margin, gridStartY + rowHeight, pageWidth - margin, gridStartY + rowHeight);
            doc.line(margin, gridStartY + (rowHeight * 2), pageWidth - margin, gridStartY + (rowHeight * 2));

            // Row 1
            doc.setFontSize(8);
            doc.setFont('helvetica', 'bold');
            doc.text('Bill No.', col1X + 2, gridStartY + 3);
            doc.setFont('helvetica', 'normal');
            doc.text(billNo, col1X + 2, gridStartY + 6);

            doc.setFont('helvetica', 'bold');
            doc.text('Bill Date', col2X + 2, gridStartY + 3);
            doc.setFont('helvetica', 'normal');
            doc.text(billDate, col2X + 2, gridStartY + 6);

            doc.setFont('helvetica', 'bold');
            doc.text('Name', col3X + 2, gridStartY + 3);
            doc.setFont('helvetica', 'normal');
            doc.text(memberName, col3X + 2, gridStartY + 6);

            // Row 2
            doc.setFont('helvetica', 'bold');
            doc.text('Flat No.', col1X + 2, gridStartY + rowHeight + 3);
            doc.setFont('helvetica', 'normal');
            doc.text(flatNo, col1X + 2, gridStartY + rowHeight + 6);

            doc.setFont('helvetica', 'bold');
            doc.text('Due Date', col2X + 2, gridStartY + rowHeight + 3);
            doc.setFont('helvetica', 'normal');
            doc.text(dueDate, col2X + 2, gridStartY + rowHeight + 6);

            doc.setFont('helvetica', 'bold');
            doc.text('Period', col3X + 2, gridStartY + rowHeight + 3);
            doc.setFont('helvetica', 'normal');
            doc.text(`${periodFrom} to ${periodTo}`, col3X + 2, gridStartY + rowHeight + 6);

            yPos = gridStartY + (rowHeight * 2) + 3;

            // ITEMS TABLE
            const tableData = bill.items.map((item, idx) => [
                (idx + 1).toString(),
                item.name,
                (item.price * item.quantity).toFixed(0)
            ]);

            if (bill.oldArrears > 0) {
                tableData.push([
                    (tableData.length + 1).toString(),
                    'Paid Arrears of contribution',
                    bill.oldArrears.toFixed(0)
                ]);
            }

            doc.autoTable({
                startY: yPos,
                head: [['Sr.\nNo.', 'Description', 'Amount']],
                body: tableData,
                theme: 'grid',
                styles: {
                    fontSize: 8,
                    cellPadding: 2,
                    lineColor: [0, 0, 0],
                    lineWidth: 0.3
                },
                headStyles: {
                    fillColor: [255, 255, 255],
                    textColor: [0, 0, 0],
                    fontStyle: 'bold',
                    halign: 'center',
                    valign: 'middle'
                },
                columnStyles: {
                    0: { cellWidth: 15, halign: 'center' },
                    1: { cellWidth: contentWidth - 55 },
                    2: { cellWidth: 40, halign: 'right' }
                },
                margin: { left: margin, right: margin }
            });

            yPos = doc.lastAutoTable.finalY + 2;

            // SUBTOTAL & GST BREAKDOWN
            doc.setLineWidth(0.3);
            doc.line(margin, yPos, pageWidth - margin, yPos);
            yPos += 5;

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8);

            doc.text('Subtotal', pageWidth - margin - 45, yPos);
            doc.text((bill.subtotal || 0).toFixed(0), pageWidth - margin - 5, yPos, { align: 'right' });
            yPos += 4;

            doc.text(`GST @ ${bill.gstPercentage || 18}%`, pageWidth - margin - 45, yPos);
            doc.text((bill.gstAmount || 0).toFixed(0), pageWidth - margin - 5, yPos, { align: 'right' });
            yPos += 4;

            if (bill.oldArrears > 0) {
                doc.setTextColor(220, 0, 0);
                doc.text('Previous Arrears', pageWidth - margin - 45, yPos);
                doc.text(bill.oldArrears.toFixed(0), pageWidth - margin - 5, yPos, { align: 'right' });
                doc.setTextColor(0);
                yPos += 4;
            }

            yPos += 1;
            doc.setLineWidth(0.5);
            doc.line(margin, yPos, pageWidth - margin, yPos);
            yPos += 5;

            // TOTAL PAYABLE
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(9);
            doc.text('Total Payable', pageWidth - margin - 45, yPos);
            doc.text(bill.totalAmount.toFixed(0), pageWidth - margin - 5, yPos, { align: 'right' });

            yPos += 5;
            doc.setLineWidth(0.3);
            doc.line(margin, yPos, pageWidth - margin, yPos);

            // AMOUNT IN WORDS
            yPos += 5;
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(8);
            const amountInWords = `Amount in Words : Rupees ${bill.totalAmount} only`;
            doc.text(amountInWords, margin + 2, yPos);

            // NOTES
            yPos += 5;
            const notes = bill.notes ||
                "Notes :\n" +
                "1. Cheque should be drawn in favour of society only.\n" +
                "2. Interest @ 18% p.a. will be charged for delayed payments.\n" +
                "3. Please mention Bill No. And Flat No. on backside of cheque.";

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(7);
            const splitNotes = doc.splitTextToSize(notes, contentWidth - 4);
            doc.text(splitNotes, margin + 2, yPos);

            // SIGNATURE
            const sigY = pageHeight - 30;
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(8);
            doc.text(`${regNo}`, margin + 2, sigY);
            doc.text('Secretary / Chairman / Treasurer', pageWidth - margin - 2, sigY, { align: 'right' });

            // PAID WATERMARK
            if (bill.status === 'Paid') {
                doc.setTextColor(34, 197, 94);
                doc.setFontSize(60);
                doc.setFont('helvetica', 'bold');
                doc.saveGraphicsState();
                doc.setGState(new doc.GState({ opacity: 0.1 }));
                doc.text('PAID', pageWidth / 2, pageHeight / 2, {
                    align: 'center',
                    angle: 45
                });
                doc.restoreGraphicsState();
            }

            doc.save(`Invoice_${billNo}.pdf`);
        } catch (err) {
            console.error("PDF Error", err);
            alert("Failed to generate PDF");
        }
    };

    // Home/Overview Page - Admin Mirrored Design
    const HomePage = () => {
        // Safe Data Access & Calculations
        const invoices = data?.invoices || [];
        const complaints = data?.complaints || [];
        const notices = data?.notices || [];

        // Financials - Case Insensitive Check
        const totalDue = invoices.filter(i => i.status && i.status.toLowerCase() !== 'paid').reduce((sum, inv) => sum + inv.totalAmount, 0);
        const paidCount = invoices.filter(i => i.status && i.status.toLowerCase() === 'paid').length;
        const pendingCount = invoices.filter(i => i.status && i.status.toLowerCase() !== 'paid').length;

        const activeComplaints = complaints.filter(c => c.status && c.status.toLowerCase() !== 'resolved').length;
        const totalComplaints = complaints.length;
        const recentNotices = notices.slice(0, 3);

        // Calculate Profile Completion
        const calculateProfileCompletion = () => {
            let score = 0;
            const u = data?.user;
            if (!u) return 0;
            if (u.name) score += 20;
            if (u.email) score += 20;
            if (u.mobile) score += 20;
            if (u.familyMembers && u.familyMembers.length > 0) score += 20;
            if (u.vehicleDetails && u.vehicleDetails.length > 0) score += 20;
            return score;
        };
        const profileCompletion = calculateProfileCompletion();

        // Time & Greeting State
        const [currentTime, setCurrentTime] = useState(new Date());
        const [greeting, setGreeting] = useState('');
        const [gradient, setGradient] = useState('from-indigo-600 to-purple-600');

        useEffect(() => {
            const updateTime = () => {
                const now = new Date();
                setCurrentTime(now);
                const hrs = now.getHours();

                if (hrs >= 5 && hrs < 12) {
                    setGreeting('Good Morning');
                    setGradient('from-orange-400 via-pink-500 to-rose-500'); // Sunrise
                } else if (hrs >= 12 && hrs < 17) {
                    setGreeting('Good Afternoon');
                    setGradient('from-blue-500 via-cyan-500 to-teal-400'); // Day
                } else if (hrs >= 17 && hrs < 21) {
                    setGreeting('Good Evening');
                    setGradient('from-indigo-600 via-purple-600 to-fuchsia-600'); // Sunset
                } else {
                    setGreeting('Good Night');
                    setGradient('from-slate-800 via-slate-900 to-black'); // Night
                }
            };

            updateTime();
            const timer = setInterval(updateTime, 1000 * 60); // Update every minute
            return () => clearInterval(timer);
        }, []);

        return (
            <div className="space-y-6 animate-in fade-in duration-500 pb-10">
                {/* 1. Welcome Section (Admin Style) */}
                <div className={`bg-gradient-to-r ${gradient} rounded-3xl p-8 text-white shadow-xl transition-all duration-1000 relative overflow-hidden`}>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-8 -mb-8 blur-2xl"></div>

                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between relative z-10 gap-4">
                        <div>
                            <h1 className="text-3xl font-black mb-2 flex items-center gap-2">
                                {greeting}, {data?.user?.name?.split(' ')[0]}!
                                <span className="animate-wave text-4xl inline-block origin-bottom-right">👋</span>
                            </h1>
                            <p className="text-white/80 font-medium">Here's your personal dashboard overview.</p>
                        </div>
                        <div className="text-left md:text-right bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 shadow-lg">
                            <p className="text-xs font-bold uppercase tracking-wider opacity-80 mb-1">
                                {currentTime.toLocaleDateString('en-US', { weekday: 'long' })}
                            </p>
                            <p className="text-3xl font-black leading-none">
                                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                            <p className="text-xs font-medium opacity-80 mt-1">
                                {currentTime.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                            </p>
                        </div>
                    </div>
                </div>

                {/* 2. Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        label="Total Dues"
                        value={`₹${totalDue.toLocaleString()}`}
                        sub={`${pendingCount} invoices pending`}
                        icon={Wallet}
                        color={totalDue > 0 ? "red" : "green"}
                    />
                    <StatCard
                        label="Bills Paid"
                        value={paidCount}
                        sub="Invoices cleared"
                        icon={CheckCircle}
                        color="blue"
                    />
                    <StatCard
                        label="Complaints"
                        value={activeComplaints}
                        sub="Active tickets"
                        icon={AlertCircle}
                        color="orange"
                    />
                    <StatCard
                        label="My Profile"
                        value={`${profileCompletion}%`}
                        sub="Completion status"
                        icon={User}
                        color="purple"
                    />
                </div>

                {/* 3. Quick Actions */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                    <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <QuickAction label="Pay Pending Bills" icon={Receipt} color="indigo" onClick={() => setActiveTab('bills')} />
                        <QuickAction label="Gate Pass" icon={QrCode} color="green" onClick={() => setActiveTab('gatepass')} />
                        <QuickAction label="Raise Complaint" icon={AlertCircle} color="rose" onClick={() => setActiveTab('complaints')} />
                        <QuickAction label="Book Facility" icon={Calendar} color="amber" onClick={() => setActiveTab('facility')} />
                    </div>
                </div>

                {/* 4. Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Financial Chart */}
                    <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Payment History</h3>
                            <span className="text-xs text-slate-500 font-semibold">Last 6 Months</span>
                        </div>
                        <div className="h-72">
                            {(() => {
                                const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                                const today = new Date();
                                const last6Months = [];
                                const paidData = [0, 0, 0, 0, 0, 0];
                                const pendingData = [0, 0, 0, 0, 0, 0];
                                const overdueData = [0, 0, 0, 0, 0, 0];

                                for (let i = 5; i >= 0; i--) {
                                    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
                                    last6Months.push(months[d.getMonth()]);
                                }

                                data?.invoices?.forEach(inv => {
                                    if (!inv.createdAt) return;
                                    const d = new Date(inv.createdAt);
                                    const diffMonths = (today.getFullYear() - d.getFullYear()) * 12 + (today.getMonth() - d.getMonth());
                                    const status = inv.status ? inv.status.toLowerCase() : 'pending';

                                    if (diffMonths >= 0 && diffMonths <= 5) {
                                        const idx = 5 - diffMonths;
                                        if (status === 'paid') paidData[idx] += inv.totalAmount;
                                        else if (status === 'overdue') overdueData[idx] += inv.totalAmount;
                                        else pendingData[idx] += inv.totalAmount; // Default to pending for others
                                    }
                                });

                                return (
                                    <Line
                                        data={{
                                            labels: last6Months,
                                            datasets: [
                                                {
                                                    label: 'Paid',
                                                    data: paidData,
                                                    borderColor: '#10b981',
                                                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                                    tension: 0.4,
                                                    fill: true
                                                },
                                                {
                                                    label: 'Pending',
                                                    data: pendingData,
                                                    borderColor: '#f59e0b',
                                                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                                                    tension: 0.4,
                                                    fill: true
                                                },
                                                {
                                                    label: 'Overdue',
                                                    data: overdueData,
                                                    borderColor: '#ef4444',
                                                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                                    tension: 0.4,
                                                    fill: true
                                                }
                                            ]
                                        }}
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            interaction: {
                                                mode: 'index',
                                                intersect: false,
                                            },
                                            scales: {
                                                y: { beginAtZero: true, grid: { color: '#f1f5f9' } },
                                                x: { grid: { display: false } }
                                            },
                                            plugins: {
                                                legend: { display: true, position: 'top', align: 'end', labels: { boxWidth: 10, usePointStyle: true } }
                                            }
                                        }}
                                    />
                                );
                            })()}
                        </div>
                    </div>

                    {/* Complaint Status Chart */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Complaint Status</h3>
                        <div className="h-72 flex items-center justify-center">
                            {totalComplaints === 0 ? (
                                <p className="text-slate-400 text-sm font-medium">No complaints data</p>
                            ) : (
                                <Doughnut
                                    data={{
                                        labels: ['Resolved', 'Active'],
                                        datasets: [{
                                            data: [totalComplaints - activeComplaints, activeComplaints],
                                            backgroundColor: (context) => {
                                                const ctx = context.chart.ctx;
                                                const gradient1 = ctx.createLinearGradient(0, 0, 0, 200);
                                                gradient1.addColorStop(0, '#34d399'); gradient1.addColorStop(1, '#059669');
                                                const gradient2 = ctx.createLinearGradient(0, 0, 0, 200);
                                                gradient2.addColorStop(0, '#f87171'); gradient2.addColorStop(1, '#dc2626');
                                                return [gradient1, gradient2];
                                            },
                                            borderWidth: 0,
                                            cutout: '70%'
                                        }]
                                    }}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: {
                                            legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20 } }
                                        }
                                    }}
                                />
                            )}
                        </div>
                    </div>
                </div>

                {/* 5. Recent Transactions / Invoices */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white">Recent Invoices</h3>
                        <button onClick={() => setActiveTab('bills')} className="text-sm text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">View All</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-100 dark:border-slate-700">
                                    <th className="text-left py-3 px-4 text-xs font-bold text-slate-500 uppercase">Invoice ID</th>
                                    <th className="text-left py-3 px-4 text-xs font-bold text-slate-500 uppercase">Date</th>
                                    <th className="text-left py-3 px-4 text-xs font-bold text-slate-500 uppercase">Type</th>
                                    <th className="text-right py-3 px-4 text-xs font-bold text-slate-500 uppercase">Amount</th>
                                    <th className="text-center py-3 px-4 text-xs font-bold text-slate-500 uppercase">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
                                {data?.invoices?.slice(0, 5).map(inv => (
                                    <tr key={inv._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                        <td className="py-3 px-4 font-mono text-xs text-slate-500 dark:text-slate-400">#{inv._id.slice(-6).toUpperCase()}</td>
                                        <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-300">{new Date(inv.createdAt).toLocaleDateString()}</td>
                                        <td className="py-3 px-4 text-sm font-medium text-slate-800 dark:text-white">{inv.type || 'Maintenance'}</td>
                                        <td className="py-3 px-4 text-right font-bold text-slate-900 dark:text-white">₹{inv.totalAmount.toLocaleString()}</td>
                                        <td className="py-3 px-4 text-center">
                                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${inv.status === 'Paid' ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400' :
                                                'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-400'
                                                }`}>
                                                {inv.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {(!data?.invoices || data.invoices.length === 0) && (
                                    <tr>
                                        <td colSpan="5" className="py-4 text-center text-slate-400">No recent invoices found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    };

    const BillsTab = () => {
        if (isMobile) {
            return (
                <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-2xl mb-4 border border-blue-100">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500 rounded-xl text-white">
                                <Wallet size={20} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Total Outstanding</p>
                                <h3 className="text-xl font-black text-slate-800">₹{(data?.invoices?.filter(i => i.status !== 'Paid').reduce((sum, i) => sum + i.totalAmount, 0) || 0).toLocaleString()}</h3>
                            </div>
                        </div>
                    </div>

                    {data?.invoices?.length > 0 ? (
                        <div className="grid gap-4">
                            {data.invoices.map(bill => {
                                const isPaid = bill.status === 'Paid';
                                return (
                                    <div key={bill._id} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 relative overflow-hidden group">
                                        {isPaid && <div className="absolute top-0 right-0 w-16 h-16 bg-green-500/10 rounded-bl-full flex items-center justify-center pt-2 pr-2"><CheckCircle size={16} className="text-green-500" /></div>}
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-3 rounded-2xl ${isPaid ? 'bg-green-50 text-green-500' : 'bg-orange-50 text-orange-500'}`}>
                                                    <Receipt size={24} />
                                                </div>
                                                <div>
                                                    <h3 className="font-black text-slate-800 leading-tight">{bill.type || 'Maintenance'}</h3>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{new Date(bill.createdAt).toLocaleDateString('en-GB')}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className={`text-xl font-black ${isPaid ? 'text-slate-800' : 'text-blue-600'}`}>₹{bill.totalAmount.toLocaleString()}</div>
                                                <p className="text-[9px] text-slate-400 font-bold uppercase">ID: #{bill._id.slice(-6)}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                            <button onClick={() => downloadInvoice(bill)} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors">
                                                <Download size={14} /> Invoice PDF
                                            </button>
                                            {!isPaid && (
                                                <button onClick={() => handleOnlinePayment(bill._id, bill.totalAmount)} className="px-6 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md shadow-blue-200 active:scale-95 transition-all">
                                                    Pay Now
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-white rounded-[30px] border border-dashed border-slate-200">
                            <Receipt size={48} className="mx-auto text-slate-200 mb-4" />
                            <p className="text-slate-400 font-bold">No Invoices Found</p>
                        </div>
                    )}
                </div>
            );
        }

        // Desktop Bills View (Table)
        return (
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors">
                <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                    <h3 className="font-bold text-lg text-slate-800 dark:text-white">Maintenance Invoices</h3>
                    <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg text-sm font-bold">
                        <Wallet size={16} /> Total Due: ₹{(data?.invoices?.filter(i => i.status !== 'Paid').reduce((sum, i) => sum + i.totalAmount, 0) || 0).toLocaleString()}
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-widest">ID</th>
                                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-widest">Date</th>
                                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-widest">Description</th>
                                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Amount</th>
                                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">Status</th>
                                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data?.invoices?.map(inv => (
                                <tr key={inv._id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                    <td className="py-4 px-6 font-mono text-xs text-slate-500">#{inv._id.slice(-6).toUpperCase()}</td>
                                    <td className="py-4 px-6 text-sm text-slate-600 dark:text-slate-300 font-medium">{new Date(inv.createdAt).toLocaleDateString()}</td>
                                    <td className="py-4 px-6 text-sm font-bold text-slate-800 dark:text-white">{inv.type || 'Society Maintenance'}</td>
                                    <td className="py-4 px-6 text-right font-black text-slate-900 dark:text-white">₹{inv.totalAmount.toLocaleString()}</td>
                                    <td className="py-4 px-6 text-center">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${inv.status === 'Paid' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'}`}>
                                            {inv.status}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-right space-x-2">
                                        <button onClick={() => downloadInvoice(inv)} className="p-2 text-slate-400 hover:text-blue-600 transition-colors" title="Download"><Download size={18} /></button>
                                        {inv.status !== 'Paid' && (
                                            <button onClick={() => handleOnlinePayment(inv._id, inv.totalAmount)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-black uppercase hover:bg-blue-700 transition shadow-lg shadow-blue-100">Pay Now</button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    const NoticesTab = () => {
        if (isMobile) {
            return (
                <div className="space-y-4">
                    {data?.notices?.map((notice, i) => (
                        <div key={i} className="bg-white rounded-[25px] p-5 shadow-sm border border-slate-100 group active:scale-[0.98] transition-all">
                            <div className="flex gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-500 shrink-0">
                                    <Megaphone size={24} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-1">{new Date(notice.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                    <h4 className="font-black text-slate-800 text-lg leading-tight mb-2 truncate group-hover:text-blue-600 transition-colors">{notice.title}</h4>
                                    <p className="text-sm text-slate-500 font-medium line-clamp-3 leading-relaxed">{notice.content}</p>
                                </div>
                            </div>
                        </div>
                    )) || (
                            <div className="text-center py-20 bg-white rounded-[30px] border border-dashed border-slate-200">
                                <Megaphone size={48} className="mx-auto text-slate-200 mb-4" />
                                <p className="text-slate-400 font-bold">No Announcements Yet</p>
                            </div>
                        )}
                </div>
            );
        }

        // Desktop Notices Board
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data?.notices?.map((notice, i) => (
                    <div key={i} className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-xl hover:border-blue-200 transition-all group relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Bell size={60} />
                        </div>
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl w-fit mb-4">
                            <Megaphone size={20} />
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{new Date(notice.createdAt).toLocaleDateString()}</p>
                        <h4 className="text-xl font-black text-slate-800 dark:text-white mb-3 leading-tight">{notice.title}</h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-4">{notice.content}</p>

                        <div className="mt-6 pt-4 border-t border-slate-50 dark:border-slate-700 flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest italic flex items-center gap-1">
                                <Clock size={12} /> Recent Broadcast
                            </span>
                            <button className="text-xs font-black text-blue-600 hover:underline uppercase tracking-wide">Read More</button>
                        </div>
                    </div>
                )) || (
                        <div className="col-span-full text-center py-20 bg-white dark:bg-slate-800 rounded-[3rem] border border-dashed border-slate-200">
                            <p className="text-slate-400 font-bold italic">The announcement board is currently empty.</p>
                        </div>
                    )}
            </div>
        );
    };

    // Committee Tab
    const CommunityTab = () => (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Society Committee</h2>
            <div className="grid md:grid-cols-2 gap-4">
                {data?.committee?.map((member, idx) => (
                    <div key={idx} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-xl flex items-center gap-4 transition-colors">
                        <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xl">
                            {member.name[0]}
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-800 dark:text-white">{member.name}</h4>
                            <p className="text-sm text-indigo-600 dark:text-indigo-400 font-semibold">{member.designation}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{member.memberPortfolio}</p>
                        </div>
                    </div>
                )) || <p className="text-center text-slate-400 dark:text-slate-500 py-10">No committee members</p>}
            </div>
        </div>
    );

    const menuItems = [
        { id: 'home', label: 'Home', icon: Home },
        { id: 'bills', label: 'My Bills', icon: Receipt },
        { id: 'rent', label: 'Pay Rent', icon: Wallet },
        { id: 'skills', label: 'Skill Connect', icon: User },
        { id: 'parking', label: 'Smart Parking', icon: Zap },
        { id: 'forum', label: 'Society Forum', icon: Megaphone },
        { id: 'polls', label: 'Daily Polls', icon: ClipboardList },
        { id: 'complaints', label: 'Complaints', icon: AlertCircle },
        { id: 'directory', label: 'Neighbors', icon: Building },
        { id: 'intercom', label: 'Intercom Calling', icon: Phone },
        { id: 'notices', label: 'Notices', icon: Bell },
        { id: 'community', label: 'Committee', icon: Shield },
        { id: 'gatepass', label: 'Gate Pass', icon: QrCode },
        { id: 'staff', label: 'Daily Help', icon: Users },
        { id: 'market', label: 'Marketplace', icon: Hammer },
        { id: 'cctv', label: 'CCTV Feed', icon: Video },
        { id: 'facility', label: 'Book Facility', icon: Calendar },
        { id: 'profile', label: 'My Profile', icon: User },
    ];

    const renderContent = () => {
        if (loading) return <div className="h-full flex items-center justify-center text-slate-400">Loading...</div>;
        switch (activeTab) {
            case 'home': return <HomePage isMobile={isMobile} />;
            case 'bills': return <BillsTab isMobile={isMobile} />;
            case 'skills': return <SkillMarketplace isMobile={isMobile} />;
            case 'parking': return <EVParking isMobile={isMobile} />;
            case 'complaints': return <ComplaintsTab token={user.token} refresh={fetchDashboard} complaints={data?.complaints || []} isMobile={isMobile} />;
            case 'directory': return <SocietyDirectory isMobile={isMobile} />;
            case 'intercom': return <IntercomCallTab user={user} isMobile={isMobile} />;
            case 'notices': return <NoticesTab isMobile={isMobile} />;
            case 'community': return <CommitteeTab isMobile={isMobile} />;
            case 'forum': return <ForumTab isMobile={isMobile} />;
            case 'polls': return <PollsTab isMobile={isMobile} />;
            case 'rent': return <BillsTab title="Rent Payment" token={user.token} isMobile={isMobile} />;
            case 'gatepass': return <GatePass isMobile={isMobile} />;
            case 'facility': return <UserFacilityBooking isMobile={isMobile} />;
            case 'profile': return <ProfileTab initialData={data?.user} isMobile={isMobile} />;
            case 'cctv': return <ResidentCCTV isMobile={isMobile} />;
            case 'market': return <SkillMarketplace isMobile={isMobile} />;
            case 'staff': return <DailyHelpTab isMobile={isMobile} />;
            case 'subscription': return <AdminSubscription token={user.token} user={user} isMobile={isMobile} />;
            default: return <HomePage isMobile={isMobile} />;
        }
    };

    const VisitorApprovalModal = () => {
        if (!visitorApprovalData) return null;
        
        const handleResponse = async (status, instruction = '', reason = '') => {
            try {
                const response = await fetch(`${API_BASE_URL}/visitor/${visitorApprovalData.visitorId}/respond`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${user.token}`
                    },
                    body: JSON.stringify({ 
                        status, 
                        deliveryInstruction: instruction,
                        denyReason: reason
                    })
                });
                if (response.ok) {
                    showSuccess('Response Recorded', `Visitor ${status.toLowerCase()} successfully.`);
                    setVisitorApprovalData(null);
                }
            } catch (err) {
                console.error(err);
                // Fallback socket emit if API not ready
                const socket = io(BACKEND_URL);
                socket.emit('visitor_response', { 
                    visitorId: visitorApprovalData.visitorId, 
                    status,
                    instruction,
                    reason
                });
                setVisitorApprovalData(null);
            }
        };

        return (
            <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-xl"></div>
                <div className="relative w-full max-w-sm bg-white dark:bg-slate-800 rounded-[45px] p-8 shadow-2xl text-center animate-in zoom-in-95 duration-300 border border-white/10">
                    <div className="w-24 h-24 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Users size={45} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-2 uppercase tracking-tighter">Visitor Request</h3>
                    <p className="text-slate-500 dark:text-slate-400 font-bold mb-8">{visitorApprovalData.message}</p>

                    <div className="space-y-3">
                        <button
                            onClick={() => handleResponse('Approved')}
                            className="w-full py-4 bg-emerald-500 text-white font-black rounded-2xl hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 transition-all uppercase tracking-widest text-xs"
                        >
                            Approve Entry
                        </button>
                        
                        {visitorApprovalData.visitorType === 'Delivery' && (
                            <button
                                onClick={() => handleResponse('Approved', 'Leave at Gate')}
                                className="w-full py-4 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-2"
                            >
                                <Zap size={16} /> Leave at Gate
                            </button>
                        )}

                        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                            <button
                                onClick={() => handleResponse('Denied', '', 'Unexpected Visitor')}
                                className="py-4 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 font-black rounded-2xl text-[10px] uppercase tracking-widest"
                            >
                                Unexpected
                            </button>
                            <button
                                onClick={() => handleResponse('Denied', '', 'Wrong Entry')}
                                className="py-4 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 font-black rounded-2xl text-[10px] uppercase tracking-widest"
                            >
                                Wrong Flat
                            </button>
                        </div>
                    </div>
                    
                    <button 
                        onClick={() => setVisitorApprovalData(null)}
                        className="mt-6 text-slate-400 dark:text-slate-600 text-[10px] font-black uppercase tracking-[0.2em]"
                    >
                        Dismiss
                    </button>
                </div>
            </div>
        );
    };

    const IncomingCallModal = () => {
        if (!incomingCall) return null;
        return (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"></div>
                <div className="relative w-full max-w-sm bg-white dark:bg-slate-800 rounded-[40px] p-8 shadow-2xl text-center animate-in zoom-in-95 duration-300">
                    <div className="w-24 h-24 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                        <Phone size={40} className="text-indigo-600 dark:text-indigo-400 animate-bounce" />
                        <div className="absolute inset-0 rounded-full border-4 border-indigo-500 animate-ping"></div>
                    </div>
                    <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-1 uppercase tracking-tighter">Incoming Call</h3>
                    <p className="text-slate-500 dark:text-slate-400 font-bold mb-8">{incomingCall.from} - {incomingCall.type === 'video' ? 'Video Intercom' : 'Voice Call'}</p>

                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => {
                                const socket = io(BACKEND_URL);
                                socket.emit('call-rejected', { to: incomingCall.fromId });
                                setIncomingCall(null);
                            }}
                            className="py-4 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-black rounded-2xl hover:bg-slate-200 transition-all uppercase tracking-widest text-xs"
                        >
                            Decline
                        </button>
                        <button
                            onClick={() => {
                                // Accept Logic
                                setActiveTab('intercom');
                                // We'll pass the call data to the Intercom tab via a temporary storage or state
                                window.pendingIncomingCall = incomingCall;
                                setIncomingCall(null);
                            }}
                            className="py-4 bg-emerald-500 text-white font-black rounded-2xl hover:bg-emerald-600 shadow-lg shadow-emerald-500/30 transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-2"
                        >
                            <Phone size={16} /> Accept
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const ChildApprovalModal = () => {
        if (!childApprovalData) return null;
        return (
            <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setChildApprovalData(null)}></div>
                <div className="relative w-full max-w-sm bg-white dark:bg-slate-800 rounded-[40px] p-8 shadow-2xl animate-in slide-in-from-bottom duration-500">
                    <div className="w-20 h-20 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertCircle size={40} className="animate-pulse" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-800 dark:text-white text-center mb-2 uppercase tracking-tighter">Child Exit Alert</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-center text-sm font-bold mb-8">
                        {childApprovalData.childName || 'Your child'} is trying to leave via <span className="text-indigo-600">Gate {childApprovalData.gateNo || '1'}</span>.
                    </p>

                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => {
                                window.io?.emit('child_exit_response', { ...childApprovalData, approved: false });
                                setChildApprovalData(null);
                            }}
                            className="py-4 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-black rounded-2xl text-xs uppercase tracking-widest hover:bg-slate-200 transition-all"
                        >
                            Deny Exit
                        </button>
                        <button
                            onClick={() => {
                                window.io?.emit('child_exit_response', { ...childApprovalData, approved: true });
                                showSuccess("Exit Approved", "Gate security has been notified.");
                                setChildApprovalData(null);
                            }}
                            className="py-4 bg-indigo-600 text-white font-black rounded-2xl text-xs uppercase tracking-widest shadow-xl shadow-indigo-200 dark:shadow-none hover:bg-indigo-500 active:scale-95 transition-all"
                        >
                            Approve
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const loadRazorpay = () => {
        return new Promise((resolve) => {
            if (window.Razorpay) { resolve(true); return; }
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handleOnlinePayment = async (invoiceId, amount) => {
        try {
            const res = await fetch(`${API_BASE_URL}/bills/pay/link`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
                body: JSON.stringify({ invoiceId, amount }) // Send amount for verification
            });
            const json = await res.json();

            if (!res.ok) {
                let title = 'Payment Error';
                let msg = json.message || 'Failed to generate payment intent';
                if (msg.includes('Recurring digits') || msg.includes('customer contact')) {
                    title = 'Update Mobile Number';
                    msg = 'Razorpay needs a valid 10-digit mobile number. Please go to "My Profile" tab and update it before paying.';
                }
                showError(title, msg);
                return;
            }

            if (json.orderId) {
                const isLoaded = await loadRazorpay();
                if (!isLoaded) {
                    showError("Error", "Razorpay failed to load. Check your internet connection.");
                    return;
                }

                const options = {
                    key: json.keyId,
                    amount: json.amount,
                    currency: json.currency,
                    name: data?.society?.name || "Society Management",
                    description: `Bill Payment - #${invoiceId.slice(-6).toUpperCase()}`,
                    order_id: json.orderId,
                    handler: async function (response) {
                        try {
                            const verifyRes = await fetch(`${API_BASE_URL}/bills/pay/verify`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
                                body: JSON.stringify({
                                    razorpay_order_id: response.razorpay_order_id,
                                    razorpay_payment_id: response.razorpay_payment_id,
                                    razorpay_signature: response.razorpay_signature,
                                    invoiceId,
                                    amount
                                })
                            });
                            const verifyJson = await verifyRes.json();
                            if (verifyJson.success) {
                                showSuccess("Payment Successful", "Your bill has been set to Paid!");
                                fetchDashboard();
                            } else {
                                showError("Payment Failed", "Verification failed. Please contact support.");
                            }
                        } catch (error) {
                            showError("Network Error", "Failed to verify payment with server.");
                        }
                    },
                    prefill: {
                        name: json.userConfig?.name,
                        contact: json.userConfig?.contact,
                        email: json.userConfig?.email
                    },
                    theme: {
                        color: "#4f46e5"
                    }
                };

                const paymentObject = new window.Razorpay(options);
                paymentObject.open();
            } else if (json.paymentLink) {
                // Fallback for older endpoints
                window.location.href = json.paymentLink;
            }
        } catch (error) {
            console.error("Payment Link Error:", error);
            showError('Connection Error', 'Something went wrong while initiating payment.');
        }
    };

    if (isMobile) {
        return (
            <div className="flex flex-col h-screen bg-slate-50 relative overflow-hidden">
                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden pt-0 pb-32">
                    {/* 1. Premium Society Header (MyGate Style) */}
                    <div className="relative h-64 overflow-hidden">
                        <img 
                            src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=1000" 
                            alt="Society" 
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                        
                        {/* Top Controls */}
                        <div className="absolute top-10 left-6 right-6 flex items-center justify-between">
                            <button onClick={() => setIsMobileMenuOpen(true)} className="p-2.5 bg-white/20 backdrop-blur-md rounded-full text-white">
                                <Menu size={20} />
                            </button>
                            <div className="flex items-center gap-3">
                                <button className="p-2.5 bg-white/20 backdrop-blur-md rounded-full text-white">
                                    <Search size={20} />
                                </button>
                                <div className="w-10 h-10 rounded-full border-2 border-white/50 overflow-hidden bg-indigo-600 flex items-center justify-center font-bold text-white shadow-lg">
                                    {user?.name?.[0]}
                                </div>
                            </div>
                        </div>

                        {/* Society Name & Location */}
                        <div className="absolute bottom-16 left-6">
                            <div className="flex items-center gap-2 text-white mb-1">
                                <MapPin size={18} className="text-red-500 fill-red-500" />
                                <h2 className="text-2xl font-black tracking-tight">{data?.society?.name || 'SSR Residency'}</h2>
                            </div>
                            <p className="text-white/70 text-sm font-medium ml-6">Flat No: {user?.flatNo || 'A-101'}</p>
                        </div>
                    </div>

                    {/* Quick Access Overlay Cards */}
                    <div className="px-4 -mt-10 mb-8 relative z-10 grid grid-cols-2 gap-3">
                        <button onClick={() => setActiveTab('gatepass')} className="bg-white p-4 rounded-3xl shadow-xl flex items-center gap-3 border border-slate-50">
                            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                                <Users size={24} />
                            </div>
                            <div className="text-left">
                                <span className="block text-xs font-black text-slate-800">My Visitors</span>
                                <span className="text-[9px] text-slate-400 font-bold uppercase">Approve/Manage</span>
                            </div>
                        </button>
                        <button 
                            onClick={() => {
                                setShowSOS(true);
                                window.dispatchEvent(new CustomEvent('triggerSOS'));
                            }} 
                            className="bg-white p-4 rounded-3xl shadow-xl flex items-center gap-3 border border-slate-50 active:scale-95 transition-all"
                        >
                            <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-600">
                                <AlertCircle size={24} />
                            </div>
                            <div className="text-left">
                                <span className="block text-xs font-black text-slate-800 uppercase">SOS</span>
                                <span className="text-[9px] text-slate-400 font-bold uppercase">Security alert</span>
                            </div>
                        </button>
                    </div>

                    {/* 2. Your To-do's Section */}
                    <div className="px-6 mb-8">
                        <div className="flex items-center gap-2 mb-4">
                            <h3 className="text-lg font-black text-slate-800 tracking-tighter">Your To-do's</h3>
                            <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-[10px] font-bold">2</span>
                        </div>
                        
                        <div className="bg-white p-4 rounded-[25px] border border-slate-100 shadow-sm flex items-center justify-between group active:scale-95 transition-all">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-red-50 text-red-500 rounded-2xl">
                                    <Receipt size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800">Maintenance Bill</h4>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-black text-slate-900">₹{data?.user?.balance || '45,000'}</span>
                                        <span className="text-[10px] bg-red-500 text-white px-1.5 py-0.5 rounded font-black uppercase">DUE</span>
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setActiveTab('bills')} className="text-xs font-black text-blue-600 uppercase tracking-widest flex items-center gap-1">
                                Pay Now <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>

                    {/* 3. Society Actions Grid */}
                    <div className="px-6 mb-8">
                         <h3 className="text-lg font-black text-slate-800 tracking-tighter mb-4">Society Actions</h3>
                         <div className="grid grid-cols-4 gap-4">
                            {[
                                { id: 'market', label: 'Market', icon: Hammer, color: 'text-orange-500', bg: 'bg-orange-50' },
                                { id: 'facility', label: 'Amenities', icon: Umbrella, color: 'text-teal-500', bg: 'bg-teal-50' },
                                { id: 'bills', label: 'Payments', icon: CreditCard, color: 'text-blue-500', bg: 'bg-blue-50' },
                                { id: 'staff', label: 'Daily Help', icon: Users, color: 'text-purple-500', bg: 'bg-purple-50' },
                                { id: 'notices', label: 'Notices', icon: Megaphone, color: 'text-sky-500', bg: 'bg-sky-50' },
                                { id: 'gatepass', label: 'Gate Pass', icon: QrCode, color: 'text-indigo-500', bg: 'bg-indigo-50' },
                                { id: 'cctv', label: 'CCTV View', icon: Video, color: 'text-rose-500', bg: 'bg-rose-50' },
                                { id: 'more', label: 'More', icon: MoreHorizontal, color: 'text-slate-500', bg: 'bg-slate-50', isMore: true },
                            ].map((item, idx) => (
                                <button 
                                    key={idx}
                                    onClick={() => item.isMore ? setShowMoreSheet(true) : setActiveTab(item.id)}
                                    className="flex flex-col items-center gap-2"
                                >
                                    <div className={`w-14 h-14 ${item.bg} ${item.color} rounded-2xl flex items-center justify-center shadow-sm active:scale-90 transition-all`}>
                                        <item.icon size={24} />
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-500 text-center leading-tight">{item.label}</span>
                                </button>
                            ))}
                         </div>
                    </div>
                </div>

                {/* 5. Bottom Navigation Bar */}
                <div className="fixed bottom-0 left-0 right-0 h-20 bg-white border-t border-slate-100 flex items-center justify-around px-2 z-50 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
                    {[
                        { id: 'home', label: 'Home', icon: Home },
                        { id: 'gatepass', label: 'Visitors', icon: Users },
                        { id: 'bills', label: 'Payments', icon: CreditCard },
                        { id: 'profile', label: 'Profile', icon: User },
                    ].map((item) => (
                        <button 
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`flex flex-col items-center gap-1 transition-all ${activeTab === item.id ? 'text-blue-600 scale-105' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <div className={`p-1.5 rounded-xl ${activeTab === item.id ? 'bg-blue-50' : ''}`}>
                                <item.icon size={22} className={activeTab === item.id ? 'stroke-[3px]' : 'stroke-[2px]'} />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
                        </button>
                    ))}
                    {/* Active Indicator Line */}
                    <div className="absolute top-0 h-1 bg-blue-600 transition-all duration-300 rounded-full" 
                        style={{ 
                            width: '25%', 
                            left: `${['home', 'gatepass', 'bills', 'profile'].indexOf(activeTab) * 25}%` 
                        }} 
                    />
                </div>

                {/* --- NEW STYLE: FEATURE GRID BOTTOM SHEET --- */}
                {showMoreSheet && (
                    <div className="fixed inset-0 z-[100] animate-in fade-in duration-300">
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowMoreSheet(false)}></div>
                        <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[40px] p-6 pb-12 shadow-2xl animate-in slide-in-from-bottom duration-500">
                            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-8"></div>
                            
                            <div className="flex items-center justify-between mb-8 px-2">
                                <h2 className="text-xl font-black text-slate-800 tracking-tight uppercase">Society Command</h2>
                                <button onClick={() => setShowMoreSheet(false)} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                                    <XCircle size={20} />
                                </button>
                            </div>

                            <div className="grid grid-cols-3 gap-y-8 gap-x-4">
                                {menuItems.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => { setActiveTab(item.id); setShowMoreSheet(false); }}
                                        className="flex flex-col items-center gap-3 active:scale-95 transition-all"
                                    >
                                        <div className="w-16 h-16 rounded-[30px] bg-slate-50 flex items-center justify-center text-indigo-600 border border-slate-100 shadow-sm group-hover:bg-indigo-50 transition-colors">
                                            <item.icon size={26} strokeWidth={2.5} />
                                        </div>
                                        <span className="text-[10px] font-black text-slate-500 text-center uppercase tracking-tight leading-tight">{item.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Simple Mobile Sidebar (Main menu only) */}
                {isMobileMenuOpen && (
                    <div className="fixed inset-0 z-[60]">
                        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
                        <aside className="absolute top-0 bottom-0 left-0 w-4/5 bg-white shadow-2xl animate-in slide-in-from-left duration-300 flex flex-col">
                            <div className="p-6 bg-gradient-to-br from-indigo-600 to-purple-700 text-white rounded-br-[40px] mb-4">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-xl font-bold border-2 border-white/30">
                                        {user?.name?.[0] || 'U'}
                                    </div>
                                    <div>
                                        <h3 className="font-black text-lg truncate">{user?.name}</h3>
                                        <p className="text-xs opacity-80 font-bold uppercase tracking-wider">Flat {user?.flatNo}</p>
                                    </div>
                                </div>
                            </div>

                            <nav className="flex-1 overflow-y-auto px-4 py-2 space-y-1">
                                {menuItems.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => { setActiveTab(item.id); setIsMobileMenuOpen(false); }}
                                        className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all text-sm font-bold ${activeTab === item.id
                                            ? 'bg-indigo-50 text-indigo-600'
                                            : 'text-slate-600 hover:bg-slate-50'
                                            }`}
                                    >
                                        <item.icon size={20} className={activeTab === item.id ? 'stroke-[2.5px]' : 'stroke-[2px]'} />
                                        <span>{item.label}</span>
                                    </button>
                                ))}
                            </nav>

                            <div className="p-4 border-t border-slate-100">
                                <button
                                    onClick={() => setShowLogoutConfirm(true)}
                                    className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-red-50 text-red-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-100 transition-colors"
                                >
                                    <LogOut size={16} /> Sign Out
                                </button>
                            </div>
                        </aside>
                    </div>
                )}
                
                {/* Secondary Page View Overlay */}
                {activeTab !== 'home' && (
                    <div className="fixed inset-0 bg-slate-50 z-[40] overflow-y-auto pb-24 animate-in fade-in slide-in-from-right duration-300">
                         {/* Secondary Header */}
                         <div className="bg-white px-5 pt-8 pb-4 border-b border-slate-100 flex items-center justify-between sticky top-0 z-[50] shadow-sm">
                            <button onClick={() => setActiveTab('home')} className="p-3 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-all active:scale-95 text-slate-600">
                                <ChevronRight className="rotate-180" size={20} />
                            </button>
                            <h2 className="text-lg font-black text-slate-800 uppercase tracking-tighter">{activeTab.replace('-', ' ')}</h2>
                            <div className="w-10 h-10 flex items-center justify-center">
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-black text-xs">{user?.name?.[0]}</div>
                            </div>
                         </div>

                         <div className="px-4 pt-6 pb-32">
                            <SubscriptionLock societyDetails={data?.society}>
                                {renderContent()}
                            </SubscriptionLock>
                         </div>
                    </div>
                )}

                <IncomingCallModal />
                <VisitorApprovalModal />
                {incomingCall && (
                    <audio src="https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3" autoPlay loop />
                )}
                <ChildApprovalModal />
                <SOSButton />
                <ChatWidget />
                <ConfirmationModal
                    isOpen={showLogoutConfirm}
                    onClose={() => setShowLogoutConfirm(false)}
                    onConfirm={logout}
                    title="Sign Out?"
                    message="Are you sure you want to end your session?"
                    confirmText="Sign Out"
                    cancelText="Keep Browsing"
                    type="danger"
                />
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
            {/* Mobile Overlay */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />
            )}

            {/* Sidebar */}
            {/* Sidebar */}
            <aside className={`
                fixed lg:relative z-50 w-64 h-full bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col transition-all duration-300
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <div className="p-6 border-b border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                        {data?.society?.logo ? (
                            <img src={resolveImageURL(data?.society?.logo)} alt="Logo" className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm object-cover shadow-sm" />
                        ) : (
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center text-white font-['Montserrat'] font-black text-xl shadow-lg border border-white/10">
                                {data?.society?.name?.[0] || 'S'}
                            </div>
                        )}
                        <div className="flex flex-col">
                            <div className="flex items-baseline gap-1 line-clamp-1">
                                <span className="text-sm font-['Montserrat'] font-black text-slate-800 dark:text-white uppercase tracking-[0.2em]">
                                    {(data?.society?.name || 'Status').split(' ')[0]}
                                </span>
                                <span className="text-2xl font-['Great_Vibes'] text-indigo-600 dark:text-indigo-400 font-normal -ml-1">
                                    {(data?.society?.name || 'Status Sharan').split(' ').slice(1).join(' ') || 'Sharan'}
                                </span>
                            </div>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-['Montserrat']">Resident Portal</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => { setActiveTab(item.id); setIsMobileMenuOpen(false); }}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-semibold ${activeTab === item.id
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                                }`}
                        >
                            <item.icon size={20} />
                            <span>{item.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-200 dark:border-slate-700">
                    <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3 mb-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                                {user?.name?.[0] || 'U'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{user?.name}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Flat {user?.flatNo || 'N/A'}</p>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowLogoutConfirm(true)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/20 font-semibold text-sm transition-colors"
                    >
                        <LogOut size={16} /> Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
                <Navbar
                    title={activeTab.replace('-', ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                    showSearch={true}
                    notifications={data?.notices?.map(n => ({
                        title: n.title,
                        time: new Date(n.createdAt).toLocaleDateString(),
                        type: 'Notice',
                        onClick: () => {
                            setActiveTab('notices');
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                        }
                    })) || []}
                    onMenuClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    onTabChange={setActiveTab}
                    onLogout={() => setShowLogoutConfirm(true)}
                />

                <div className="flex-1 overflow-y-auto p-6">
                    {user?.isDemo && (
                        <div className="mb-8 p-4 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-xl shadow-purple-500/20 flex items-center justify-between overflow-hidden relative">
                            <div className="absolute top-0 right-0 p-4 opacity-10 -rotate-12"><LayoutDashboard size={80} /></div>
                            <div className="flex items-center gap-4 relative z-10">
                                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center"><Zap className="animate-pulse" /></div>
                                <div>
                                    <h2 className="text-lg font-black uppercase tracking-wider leading-none mb-1">Demo Mode Active</h2>
                                    <p className="text-sm font-bold opacity-90">Exploring as a Resident/Tenant with pre-loaded data.</p>
                                </div>
                            </div>
                            <button onClick={() => setShowLogoutConfirm(true)} className="px-6 py-2.5 bg-white text-purple-600 font-black rounded-xl text-xs uppercase tracking-widest hover:bg-purple-50 transition-colors shadow-lg relative z-10">Exit Demo</button>
                        </div>
                    )}
                    <SubscriptionLock societyDetails={data?.society}>
                        {renderContent()}
                    </SubscriptionLock>
                </div>

                <ChildApprovalModal />
                <SOSButton />
                <ChatWidget />
                <ConfirmationModal
                    isOpen={showLogoutConfirm}
                    onClose={() => setShowLogoutConfirm(false)}
                    onConfirm={logout}
                    title="Sign Out?"
                    message="Are you sure you want to end your session?"
                    confirmText="Sign Out"
                    cancelText="Keep Browsing"
                    type="danger"
                />
            </main>
        </div>
    );
};

export default UserDashboard;
