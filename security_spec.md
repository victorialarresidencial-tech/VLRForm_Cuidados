# Security Specification - Victoria Lar Residencial

## 1. Data Invariants
- Each clinical document (anotações de plantão, evolução, glicemia, checagens) must reference a valid `residenteId`.
- Staff identifying records must contain a valid `cuidadorMatricula` format.
- Document IDs must satisfy `isValidId(id)` (alphanumeric, hyphen, underscore, <= 128 characters).
- String fields must satisfy max size limits to prevent Denial of Wallet.

## 2. Dirty Dozen Payloads & Mitigation
1. **Oversized String Payload**: Blocked by `.size() <= MAX` guards on all string fields.
2. **Invalid ID Injection**: Blocked by `isValidId(id)` pattern regex `^[a-zA-Z0-9_\\-]+$`.
3. **Empty Resident ID**: Blocked by schema requirement `data.residenteId.size() > 0`.
4. **Altered Primary Key**: Blocked by immutability check `incoming().id == existing().id`.
5. **Arbitrary Collection Write**: Blocked by root catch-all `allow read, write: if false;`.
6. **Negative Vital Sign**: Blocked by numerical range guards on systolic/diastolic/temperatura.
7. **Malformed Shift Value**: Blocked by enum check `incoming().turno in ['diurno', 'noturno']`.
8. **Negative Glucose Level**: Blocked by numerical boundary checks `data.glicemia >= 20 && data.glicemia <= 800`.
9. **Missing Matricula on Evolution**: Blocked by required matricula validation.
10. **Shadow Key Poisoning on Caregiver**: Blocked by strict key schema validation.
11. **Negative Timestamp Manipulation**: Enforced by server timestamp validation where applicable.
12. **Malformed Dependency Level**: Blocked by enum check `['grau1', 'grau2', 'grau3']`.
