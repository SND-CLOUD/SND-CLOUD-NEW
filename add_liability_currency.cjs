const fs = require('fs');
let code = fs.readFileSync('src/lib/local-db.ts', 'utf8');

const newMigration = `
      try {
        await this.db.run('ALTER TABLE customers ADD COLUMN liabilityCurrency TEXT');
      } catch (err) {
        // console.warn("Column liabilityCurrency might already exist", err);
      }
`;

code = code.replace(/await this.db.run\('ALTER TABLE invoices ADD COLUMN printCount INTEGER DEFAULT 0'\);\n      \} catch \(err\) \{\n        \/\/ column exists\n      \}/g, "await this.db.run('ALTER TABLE invoices ADD COLUMN printCount INTEGER DEFAULT 0');\n      } catch (err) {\n        // column exists\n      }\n" + newMigration);

fs.writeFileSync('src/lib/local-db.ts', code);
