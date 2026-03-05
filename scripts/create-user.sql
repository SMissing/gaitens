-- Create manager user: Missing (code: 7266)
INSERT INTO users (name, "staffCode", role, active)
VALUES ('Missing', '7266', 'manager', true)
ON CONFLICT ("staffCode") DO UPDATE
SET name = 'Missing',
    role = 'manager',
    active = true;
