const { cleanDuplicateProfiles } = require("../controllers/profile-controller");

cleanDuplicateProfiles()
  .then(() => {
    console.log("Done.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Error:", err);
    process.exit(1);
  });
