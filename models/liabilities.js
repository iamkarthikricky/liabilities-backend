const mongoose = require('mongoose');

const liabilitiesSchema = new mongoose.Schema({
    lenderName: { type: String, required: true },
    principal: { type: Number, required: true },
    tenure:{ type: Number, required: true },
    remainingTenure:{ type: Number, required: true },
    interest:{ type: Number, required: true },
    GST:{ type: Number },
    dueDate: { type: Date, default: Date.now }, // New field with default value
    status: { type: Boolean, default: false } // New field with default value
});


module.exports = mongoose.model('Liabilities', liabilitiesSchema);