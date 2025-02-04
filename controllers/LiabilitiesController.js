const CurrentLoan = require("../models/liabilities.js");


function calculateMonthlyInterestAndReducingPrincipal(principal, annualInterestRate, months, remainingTenure, gst) {
  const r = annualInterestRate / (12 * 100); // Monthly interest rate
  const emi = (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1); // Constant EMI calculation
  const totalInterest = parseFloat(((emi * months) - principal).toFixed(2)); // Total interest for the tenure
  const gstRate = 0.18; // assuming 18%
  let totalPayable = principal + totalInterest; // Base total payable without GST
  let monthlyPayment = []; // Array to store monthly payments
  let outstanding = 0;

  if (gst) {
      const totalGstForInterest = parseFloat((totalInterest * gstRate).toFixed(2)); // Total GST on interest
      totalPayable += totalGstForInterest; // Adjust total payable with GST
  }

  let totalPayableWithGst = totalPayable; // Start with the total amount payable, adjusted as needed for GST

  for (let i = 0; i < months; i++) {
      const interest = principal * r;
      const reducingPrincipal = emi - interest;
      const monthlyGst = gst ? parseFloat((interest * gstRate).toFixed(2)) : 0;
      const effectiveEmi = parseFloat((emi + monthlyGst).toFixed(2)); // EMI with GST if applicable
      const balance = parseFloat((totalPayableWithGst - effectiveEmi).toFixed(2));

      monthlyPayment.push({
          interest: interest.toFixed(2),
          reducingPrincipal: reducingPrincipal.toFixed(2),
          gst: monthlyGst,
          EffectiveEMI: effectiveEmi,
          balance: balance,
      });

      principal -= reducingPrincipal;
      totalPayableWithGst -= effectiveEmi;
  }

  // Calculate active EMI and outstanding balance based on remaining tenure
  const activeEmi = monthlyPayment[months - remainingTenure]?.EffectiveEMI.toFixed(2) || emi.toFixed(2);
  outstanding = remainingTenure === months ? totalPayable : monthlyPayment[months - remainingTenure - 1]?.balance || 0;

  return { currentEMI: parseInt(activeEmi) , totalOutstanding: parseInt(outstanding), totalPayable: parseInt(totalPayable) };
}

const postLiability = async (req, res) => {
  try {
    const data = req.body;

    // Check if the input is an array (bulk data)
    if (Array.isArray(data)) {
      // Insert multiple liabilities
      const newLoans = await CurrentLoan.insertMany(data);
      return res.status(201).json({
        message: "Bulk liabilities inserted successfully",
        insertedCount: newLoans.length,
        data: newLoans,
      });
    }

    // Handle single liability (not an array)
    const { lenderName, principal, tenure, remainingTenure, interest, GST } = data;
    const newLoan = new CurrentLoan({
      lenderName,
      principal,
      tenure,
      remainingTenure,
      interest,
      GST,
    });
    await newLoan.save();
    res.status(201).json({
      message: "Liability inserted successfully",
      data: newLoan,
    });
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};


const getLiabilities = async (req, res) => {
  try {
    const loans = await CurrentLoan.find({ status: true });

    let totals = { totalEMI: 0, totalOutstanding: 0, totalPayable: 0, totalPrincipal: 0 };

    const loansData = loans.map(({ principal, tenure, remainingTenure, interest, GST, _doc }) => {
      const { currentEMI, totalOutstanding, totalPayable } = calculateMonthlyInterestAndReducingPrincipal(
        principal, interest, tenure, remainingTenure, GST
      );

      totals.totalEMI += currentEMI;
      totals.totalOutstanding += totalOutstanding;
      totals.totalPayable += totalPayable;
      totals.totalPrincipal += principal;

      return { ..._doc, currentEMI, totalOutstanding, totalPayable };
    });

    res.status(200).json({ ...totals, loans:loansData });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};


module.exports = { postLiability, getLiabilities };
