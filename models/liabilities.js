const mongoose = require('mongoose');

const liabilitiesSchema = new mongoose.Schema({
    lenderName: { type: String, required: true },
    principal: { type: Number, required: true },
    tenure:{ type: Number, required: true },
    remainingTenure:{ type: Number, required: true },
    interest:{ type: Number, required: true },
    GST:{ type: Number },
});


module.exports = mongoose.model('Liabilities', liabilitiesSchema);