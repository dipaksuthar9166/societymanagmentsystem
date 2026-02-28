const mongoose = require('mongoose');

const flatSchema = mongoose.Schema({
    societyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company', // Society is a Company
        required: true,
    },
    flatNo: {
        type: String,
        required: true,
    },
    block: {
        type: String,
    },
    floor: {
        type: Number,
    },
    flatType: {
        type: String,
        enum: ['1BHK', '2BHK', '3BHK', '4BHK', 'Studio', 'Penthouse'],
        default: '2BHK'
    },
    area: {
        type: Number, // in sq ft
        default: 0
    },
    rentAmount: {
        type: Number,
        required: true,
    },
    tenantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
    },
    status: {
        type: String,
        enum: ['Occupied', 'Vacant', 'Maintenance', 'Defaulter'],
        default: 'Vacant',
    },
    residencyType: {
        type: String,
        enum: ['Rented', 'Owner'],
        default: 'Rented'
    },
    maintenanceAmount: {
        type: Number,
        default: 0,
        description: 'Monthly maintenance based on flat type'
    },
    parkingSlot: {
        type: String,
        default: ''
    },
    shareCertificateNo: {
        type: String, // For Owners
        default: ''
    },
    possessionDate: {
        type: Date
    },

    // --- LEGAL & GOVERNMENT RECORDS (Gujarat/India Context) ---
    legalDetails: {
        index2: {
            regNo: { type: String, default: '' }, // Registration No from Index-2
            regDate: { type: Date },
            marketValue: { type: Number }, // Government Valuation
        },
        propertyCard: {
            surveyNo: { type: String, default: '' },
            tpNo: { type: String, default: '' }, // Town Planning Scheme
            fpNo: { type: String, default: '' }, // Final Plot
            citySurveyNo: { type: String, default: '' }
        },
        amc: {
            tenementNo: { type: String, default: '' }, // AMC Tenement No
            propertyTaxId: { type: String, default: '' }
        }
    },

    // --- OWNER DETAILS (For Rented Flats or Record Keeping) ---
    ownerName: { type: String, default: '' },
    ownerEmail: { type: String, default: '' },
    ownerPhone: { type: String, default: '' },

    // --- DESIGN & VISUALIZATION ---
    assets: [{
        name: String, // AC, Fan
        serialNo: String,
        condition: String, // New, Good, Damaged
        photo: String
    }],
    floorPlan: {
        type: String, // URL to PDF/Image
    },
    renovationStatus: {
        type: String,
        enum: ['None', 'Requested', 'Approved', 'Ongoing', 'Completed'],
        default: 'None'
    },
    renovationDetails: {
        type: String
    }
}, {
    timestamps: true,
});

module.exports = mongoose.model('Flat', flatSchema);
