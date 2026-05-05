// Dummy tip data used in tests

const dummyTips = [
  { title: 'Turn Off Lights', description: 'Switch lights off when you leave.', saving_kwh: 0.3, category: 'lighting'   },
  { title: 'Bleed Radiator',  description: 'Bleeding saves up to 15% energy.',  saving_kwh: 1.1, category: 'heating'    },
  { title: 'Full Wash Loads', description: 'Run full loads only.',               saving_kwh: 0.7, category: 'appliances' },
];

const invalidTips = [
  { description: 'No title here' },
  { title: 'No description' },
  {},
];

const validCategories = ['lighting', 'heating', 'appliances'];

module.exports = { dummyTips, invalidTips, validCategories };
