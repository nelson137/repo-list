import { plainToInstance } from 'class-transformer';

export function from_json(klass, data) {
    return plainToInstance(klass, data, {
        excludeExtraneousValues: true,
    });
}
