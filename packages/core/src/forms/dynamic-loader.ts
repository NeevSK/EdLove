import { FormManager } from './form-manager';
import type { FormConfig } from './form-manager';
import { validators } from '../utils/validators';

/**
 * Hydrates a FormManager from a JSON configuration.
 * This is useful for loading forms created by users (Google Forms style).
 */
export class FormHydrator {
    /**
     * Creates a FormManager from a raw JSON object.
     * This handles mapping string validator names to actual functions.
     */
    static hydrate<T extends Record<string, any>>(
        json: any, 
        onSubmit: (values: T) => Promise<void>
    ): FormManager<T> {
        const fields: any = {};
        json.fields.forEach((field: any) => {
            fields[field.name] = {
                ...field,
                validators: field.validate ? [this.mapValidator(field.validate)] : undefined
            };
        });

        const config: FormConfig<T> = {
            fields,
            onSubmit
        };

        return new FormManager<T>(config);
    }

    private static mapValidator(validatorName: string): (val: any) => string | undefined {
        // Map common validator names to the actual functions in @repo/core
        const validatorMap: Record<string, any> = {
            'email': validators.email,
            'nonEmpty': (val: any) => validators.nonEmpty(val, 'Field'),
            'number': (val: any) => ({ isValid: !isNaN(Number(val)), error: isNaN(Number(val)) ? 'Must be a number' : undefined })
        };

        return validatorMap[validatorName] || ((_: any) => undefined);
    }
}
