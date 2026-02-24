export interface ValidationResult {
    isValid: boolean;
    error?: string;
}

export const ProfileValidator = {
    /**
     * Pre-emptive validation rules for profile fields
     */
    validate(field: string, value: any): ValidationResult {
        if (!value && value !== 0) return { isValid: true }; // Allow empty for optional fields

        const stringValue = String(value).trim();

        switch (field) {
            case 'nic_number':
                // Legacy: 9 digits + V/X
                const legacyNIC = /^[0-9]{9}[vxVX]$/;
                // New: 12 digits
                const newNIC = /^[0-9]{12}$/;
                if (!legacyNIC.test(stringValue) && !newNIC.test(stringValue)) {
                    return { isValid: false, error: 'Please enter a valid Sri Lankan NIC (e.g., 991234567V or 199912345678)' };
                }
                break;

            case 'phone':
                // Sri Lankan mobile: +947... or 07...
                const slPhone = /^(?:\+94|0)?7[0-9]{8}$/;
                if (!slPhone.test(stringValue)) {
                    return { isValid: false, error: 'Please enter a valid mobile number (+94 7X XXX XXXX)' };
                }
                break;

            case 'experience_years':
                const years = parseInt(stringValue, 10);
                if (isNaN(years) || years < 0 || years > 60) {
                    return { isValid: false, error: 'Please enter valid years of experience (0-60)' };
                }
                break;

            case 'full_name':
                if (stringValue.length < 3) {
                    return { isValid: false, error: 'Full name must be at least 3 characters' };
                }
                break;
        }

        return { isValid: true };
    }
};
