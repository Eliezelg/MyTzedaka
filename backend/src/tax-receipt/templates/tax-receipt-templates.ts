export interface TaxReceiptData {
  receiptNumber: string;
  issueDate: string;
  donorName: string;
  donorAddress: string;
  donorEmail: string;
  donorPhone?: string;
  associationName: string;
  associationAddress: string;
  associationEmail?: string;
  associationPhone?: string;
  associationRegistrationNumber?: string;
  logoPath?: string;
  donationAmount: string;
  donationCurrency: string;
  donationDate: string;
  paymentMethod: string;
  legalClause: string;
  taxDeductionRate?: string;
  country: string; // Ajout du champ country manquant
}

export const getLegalClauses = (country: string): { clause: string; deductionRate?: number } => {
  switch (country) {
    case 'FR':
      return {
        clause: `Reçu au titre des dons à certains organismes d'intérêt général.
Article 200 et 238 bis du Code général des impôts.
L'association certifie sur l'honneur que les dons et versements qu'elle reçoit ouvrent droit à la réduction d'impôt prévue à l'article 200 du CGI.`,
        deductionRate: 66,
      };

    case 'IL':
      return {
        clause: `קבלה על תרומה לפי סעיף 46 לפקודת מס הכנסה.
הארגון מאשר כי התרומה ניתנת לזיכוי ממס בהתאם להוראות החוק.`,
        deductionRate: 35,
      };

    case 'US':
      return {
        clause: `This receipt serves as your official record for tax purposes.
Your donation is tax-deductible to the extent allowed by law under Section 501(c)(3) of the Internal Revenue Code.
No goods or services were provided in exchange for this donation.`,
        deductionRate: 100,
      };

    case 'UK':
      return {
        clause: `Gift Aid Declaration - for this and future donations.
I am a UK taxpayer and understand that if I pay less Income Tax and/or Capital Gains Tax than the amount of Gift Aid claimed on all my donations in that tax year it is my responsibility to pay any difference.`,
        deductionRate: 25,
      };

    case 'CA':
      return {
        clause: `Official donation receipt for income tax purposes.
Reçu officiel aux fins de l'impôt sur le revenu.
This receipt is issued under the authority of the Canada Revenue Agency.`,
        deductionRate: 75,
      };

    default:
      return {
        clause: 'This receipt serves as proof of your donation for tax purposes according to local regulations.',
      };
  }
};

export const getCountrySpecificFields = (country: string) => {
  const baseFields = [
    { name: 'receiptNumber', type: 'text', position: { x: 20, y: 20 } },
    { name: 'issueDate', type: 'text', position: { x: 20, y: 40 } },
    { name: 'donorName', type: 'text', position: { x: 20, y: 80 } },
    { name: 'donorAddress', type: 'text', position: { x: 20, y: 100 } },
    { name: 'associationName', type: 'text', position: { x: 20, y: 140 } },
    { name: 'donationAmount', type: 'text', position: { x: 20, y: 180 } },
    { name: 'donationDate', type: 'text', position: { x: 20, y: 200 } },
    { name: 'legalClause', type: 'text', position: { x: 20, y: 240 }, multiline: true },
  ];

  // Ajouter des champs spécifiques selon le pays
  switch (country) {
    case 'FR':
      baseFields.push(
        { name: 'associationRegistrationNumber', type: 'text', position: { x: 20, y: 160 } }
      );
      break;
    case 'US':
      baseFields.push(
        { name: 'ein', type: 'text', position: { x: 20, y: 160 } } // Employer Identification Number
      );
      break;
    case 'UK':
      baseFields.push(
        { name: 'charityNumber', type: 'text', position: { x: 20, y: 160 } }
      );
      break;
  }

  return baseFields;
};